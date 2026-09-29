import test from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/core/game.js';
import { CONFIG, COSMETICS, EQUIPMENT, ITEMS, SKILLS, WORLDS, getLevel } from '../src/data/game.js';

function advance(game, seconds, step = 0.05) {
  while (seconds > 1e-7 && ['countdown', 'playing'].includes(game.snapshot().status)) {
    const slice = Math.min(step, seconds);
    game.update(slice);
    seconds -= slice;
  }
}

function visible(game, types) {
  return game.snapshot().holes.find(hole => hole && types.includes(hole.type) && hole.phase === 'up');
}

function seek(game, types, limit = 30) {
  for (let i = 0; i < limit * 20; i++) {
    const found = visible(game, types);
    if (found) return found;
    advance(game, 0.05);
  }
  assert.fail(`No visible ${types.join('/')} within ${limit}s`);
}

function hitNext(game, types = ['normal']) {
  const rabbit = seek(game, types);
  game.hit(rabbit.x, rabbit.y);
  return game.snapshot();
}

test('the 60-level progression and collectible gates stay reachable', () => {
  assert.equal(WORLDS.length, 6);
  assert.equal(SKILLS.length, 15);
  assert.deepEqual(SKILLS.map(skill => skill.id), ['A1','A2','A3','A4','A5','B1','B2','B3','B4','B5','C1','C2','C3','C4','C5']);
  assert.equal(EQUIPMENT.length, 4);
  assert.equal(ITEMS.length, 5);
  assert.equal(COSMETICS.length, 24);
  for (let id = 1; id <= 60; id++) {
    const level = getLevel(id);
    assert.equal(level.world, Math.floor((id - 1) / 10));
    assert.equal(level.boss, id % 10 === 0);
    if (id % 10 === 1) assert.equal(level.target, Math.round(3000 * WORLDS[level.world].factor / 100) * 100);
  }
  assert.equal(getLevel(1).target, 3000);
  assert.throws(() => getLevel(61), RangeError);
  const limits = { stars: 180, world: 6, sp: 180 };
  for (const item of COSMETICS) assert.ok(item.requirement.value <= limits[item.requirement.type]);
  assert.deepEqual(CONFIG.holes[0], { x: 300, y: 170 });
  assert.deepEqual(CONFIG.holes[8], { x: 660, y: 440 });
});

test('A1 hit reach, A2 normal score, and C3 loadout capacity affect actual hits', () => {
  const plain = new Game({ seed: 3 });
  const reach = new Game({ skills: ['A1'], seed: 3 });
  const score = new Game({ skills: ['A2'], seed: 3 });
  for (const game of [plain, reach, score]) advance(game, 3);
  const first = seek(plain, ['normal']);
  advance(reach, plain.snapshot().elapsed);
  advance(score, plain.snapshot().elapsed);
  plain.hit(first.x + 65, first.y);
  reach.hit(first.x + 65, first.y);
  score.hit(first.x, first.y);
  assert.equal(plain.snapshot().score, 0);
  assert.equal(reach.snapshot().score, 104);
  assert.equal(score.snapshot().score, 114);
  assert.throws(() => new Game({ equipment: ['gloves', 'boots', 'battery'] }), TypeError);
  assert.equal(new Game({ skills: ['C3'], equipment: ['gloves', 'boots', 'battery'] }).snapshot().charge, 25);
});

test('countdown starts no timer or rabbits; pause freezes and resumes both countdown and battle', () => {
  const game = new Game({ seed: 9 });
  advance(game, 1.2);
  game.pause(true);
  const before = game.snapshot();
  advance(game, 7);
  assert.equal(game.snapshot().countdown, before.countdown);
  assert.equal(game.snapshot().time, 60);
  assert.ok(game.snapshot().holes.every(hole => hole === null));
  game.pause(false);
  advance(game, 1.8);
  assert.equal(game.snapshot().status, 'playing');
  assert.equal(game.snapshot().elapsed, 0);
  advance(game, 0.65);
  const active = game.snapshot();
  assert.ok(active.holes.some(Boolean));
  game.pause(true);
  advance(game, 9);
  assert.deepEqual(game.snapshot().holes, active.holes);
  assert.equal(game.snapshot().time, active.time);
});

test('B4 freezes the actual battle clock, then B5 boosts subsequent live hits', () => {
  const game = new Game({ level: 9, skills: ['B1', 'B2', 'B3', 'B4', 'B5'], seed: 102 });
  advance(game, 3);
  for (const timestamp of CONFIG.goldGuarantee) {
    advance(game, timestamp - game.snapshot().elapsed + 0.1);
    hitNext(game, ['gold']);
  }
  const before = game.snapshot();
  assert.ok(before.charge >= CONFIG.specialCost);
  game.special();
  const stopped = game.snapshot();
  assert.equal(stopped.buffs.stopped, 2);
  assert.equal(stopped.buffs.boost, 5);
  advance(game, 1.5);
  assert.equal(game.snapshot().elapsed, stopped.elapsed);
  assert.equal(game.snapshot().time, stopped.time);
  assert.deepEqual(game.snapshot().holes, stopped.holes);
  advance(game, 0.6);
  assert.ok(game.snapshot().elapsed > stopped.elapsed);
  const normal = seek(game, ['normal']);
  const currentScore = game.snapshot().score;
  const combo = game.snapshot().combo + 1;
  game.hit(normal.x, normal.y);
  assert.equal(game.snapshot().score - currentScore, Math.round(CONFIG.baseScore * (1 + combo * CONFIG.comboStep) * CONFIG.specialSkillBoostFactor));
});

test('C5 grants precisely one second-chance interval rather than a hidden endless timer', () => {
  const plain = new Game({ seed: 1 });
  const hero = new Game({ skills: ['C5'], seed: 1 });
  plain.update(3);
  hero.update(3);
  plain.update(60);
  hero.update(60);
  assert.equal(plain.snapshot().status, 'lost');
  assert.equal(hero.snapshot().status, 'playing');
  assert.equal(hero.snapshot().time, CONFIG.secondChanceTime);
  hero.update(CONFIG.secondChanceTime + 0.1);
  assert.equal(hero.snapshot().status, 'lost');
  assert.equal(hero.snapshot().result.stars, 0);
});

test('normal scoring uses combo after hit, hitting empty air is harmless, misses break combo but cost no time', () => {
  const game = new Game({ seed: 3 });
  advance(game, 3);
  const first = hitNext(game);
  assert.equal(first.score, 104);
  assert.equal(first.combo, 1);
  game.hit(1, 1);
  assert.equal(game.snapshot().combo, 1);
  const second = hitNext(game);
  assert.equal(second.score, 212);
  const remainingBefore = second.time;
  advance(game, 3);
  assert.ok(game.snapshot().misses >= 1);
  assert.equal(game.snapshot().combo, 0);
  assert.ok(game.snapshot().time < remainingBefore);
  assert.ok(game.snapshot().score >= 212);
});

test('guaranteed gold appears at elapsed 3/11/19/27 even with an occupied board; charge and special are manual', () => {
  const game = new Game({ level: 9, seed: 102 });
  advance(game, 3);
  for (const timestamp of CONFIG.goldGuarantee) {
    advance(game, timestamp - game.snapshot().elapsed + 0.1);
    assert.ok(game.snapshot().holes.some(hole => hole?.type === 'gold'), `gold at ${timestamp}s`);
    hitNext(game, ['gold']);
  }
  assert.equal(game.snapshot().charge, 100);
  const scoreBefore = game.snapshot().score;
  game.special();
  assert.equal(game.snapshot().charge, 0);
  assert.ok(game.snapshot().score >= scoreBefore);
  assert.equal(game.drainEvents().filter(event => event.type === 'special').length, 1);
  game.special();
  assert.equal(game.drainEvents().filter(event => event.type === 'special').length, 0);
});

test('winning immediately settles time bonus and independent stars exactly once', () => {
  const game = new Game({ level: 1, seed: 55 });
  advance(game, 3);
  while (game.snapshot().status === 'playing') {
    const target = visible(game, ['normal', 'gold', 'silver']);
    if (target) game.hit(target.x, target.y);
    else advance(game, 0.04);
  }
  const { result, score, time } = game.snapshot();
  assert.equal(result.won, true);
  assert.equal(result.level, 1);
  assert.equal(result.score, score);
  assert.equal(result.stars, result.criteria.filter(Boolean).length);
  assert.equal(result.criteria[0], true);
  assert.ok(result.hits > 0);
  advance(game, 40);
  game.hit(300, 170);
  game.special();
  assert.equal(game.snapshot().score, score);
  assert.equal(game.snapshot().time, time);
  assert.equal(game.drainEvents().filter(event => event.type === 'win').length, 1);
});

test('every boss occupies 3–5 holes including decoys and cycles all three abilities before raging', () => {
  for (let world = 0; world < 6; world++) {
    const game = new Game({ level: world * 10 + 10, seed: 928 });
    advance(game, 3.1);
    const slots = game.snapshot().holes.filter(hole => hole?.type === 'boss' || hole?.type === 'decoy');
    assert.ok(slots.length >= 3 && slots.length <= 5);
    assert.ok(slots.filter(hole => hole.type === 'boss').length >= 2);
    assert.ok(slots.some(hole => hole.type === 'decoy'));
    const originalHp = game.snapshot().bossHp;
    const head = seek(game, ['boss']);
    game.hit(head.x, head.y);
    assert.equal(game.snapshot().bossHp, originalHp - 1);
    advance(game, 183);
    assert.equal(game.snapshot().status, 'playing');
    assert.equal(game.snapshot().enraged, true);
    const abilities = game.drainEvents().filter(event => event.type === 'roar').map(event => event.value);
    for (const ability of ['decoy', 'speed', 'obstacle', 'rage']) assert.ok(abilities.includes(ability), `${world} missing ${ability}`);
  }
});

test('boss specials hit a visible real boss, never its decoys; A5 and B3 damage stack by their respective channels', () => {
  const game = new Game({ level: 10, skills: ['A1','A2','A3','A4','A5','B1','B2','B3'], equipment: ['battery'], seed: 45 });
  advance(game, 3.1);
  const head = seek(game, ['boss']);
  game.hit(head.x, head.y);
  assert.equal(game.snapshot().bossHp, 98.75);
  for (const timestamp of CONFIG.goldGuarantee) {
    advance(game, timestamp - game.snapshot().elapsed + 0.1);
    hitNext(game, ['gold']);
  }
  const hp = game.snapshot().bossHp;
  const charged = game.snapshot().charge;
  if (!visible(game, ['boss'])) seek(game, ['boss']);
  game.special();
  assert.equal(game.snapshot().bossHp, hp - 13);
  assert.equal(game.snapshot().charge, charged - CONFIG.specialCost);
});

test('serialization resumes a paused/active game without losing PRNG, timers, events or multi-hole entities', () => {
  const original = new Game({ level: 40, skills: ['B1', 'B2'], equipment: ['boots', 'battery'], seed: 72 });
  advance(original, 17.2);
  const restored = Game.restore(structuredClone(original.serialize()));
  assert.deepEqual(restored.snapshot(), original.snapshot());
  assert.deepEqual(restored.drainEvents(), original.drainEvents());
  for (let i = 0; i < 100; i++) {
    original.update(0.031);
    restored.update(0.031);
    if (i % 11 === 0) {
      const rabbit = visible(original, ['normal', 'gold', 'silver', 'boss']);
      if (rabbit) { original.hit(rabbit.x, rabbit.y); restored.hit(rabbit.x, rabbit.y); }
    }
    assert.deepEqual(restored.snapshot(), original.snapshot());
    assert.deepEqual(restored.drainEvents(), original.drainEvents());
  }
});
