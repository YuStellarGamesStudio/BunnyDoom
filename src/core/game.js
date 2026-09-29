import { CONFIG as C, EQUIPMENT, ITEMS, SKILLS, WORLDS, getLevel } from '../data/game.js';

const ACTIVE = new Set(['countdown', 'playing']);
const PREY = new Set(['normal', 'gold', 'silver']);
const BUFFS = ['freeze', 'bone', 'magnet', 'slap', 'shrink', 'stopped', 'speed', 'boost'];
const RADIUS = C.hitRadius;
const EPSILON = 1e-8;

function randomSeed() {
  return (Math.random() * 0xffffffff) >>> 0;
}

export class Game {
  constructor({ level = 1, skills = [], equipment = [], seed = randomSeed() } = {}) {
    this.level = getLevel(level);
    this.world = WORLDS[this.level.world];
    if (!Array.isArray(skills) || new Set(skills).size !== skills.length || skills.some(id => !SKILLS.some(skill => skill.id === id))) {
      throw new TypeError('Skills must be unique known skill IDs');
    }
    if (!Array.isArray(equipment) || new Set(equipment).size !== equipment.length || equipment.some(id => !EQUIPMENT.some(item => item.id === id)) || equipment.length > C.normalEquipmentSlots + (skills.includes('C3') ? C.extraEquipmentSlots : 0)) {
      throw new TypeError('Equipment must contain at most two unique known IDs (three with C3)');
    }
    this.skills = new Set(skills);
    this.equipment = new Set(equipment);
    this.rng = Number.isFinite(seed) ? seed >>> 0 : randomSeed();
    this.status = 'countdown';
    this.previousStatus = null;
    this.countdown = C.countdown;
    this.time = this.level.duration;
    this.elapsed = 0;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.misses = 0;
    this.hits = 0;
    this.maxCharge = C.specialCapacity * (this.skills.has('B2') ? 2 : 1);
    this.charge = this.equipment.has('battery') ? C.goldCharge : 0;
    this.holes = Array(9).fill(null);
    this.pickups = [];
    this.buffs = Object.fromEntries(BUFFS.map(key => [key, 0]));
    this.events = [];
    this.result = null;
    this.nextId = 1;
    this.spawnTimer = C.firstSpawn;
    this.goldIndex = 0;
    this.bossHp = this.level.boss ? this.world.hp : 0;
    this.bossMaxHp = this.bossHp;
    this.bossSkill = null;
    this.bossSkillRemaining = 0;
    this.enraged = false;
    this.bossCycle = this.level.world < 3 ? C.bossCycleEarly : C.bossCycleLate;
    this.bossAbility = 0;
    this.bossRespawn = 0;
    this.insurance = this.skills.has('C1') ? C.comboInsurance : 0;
    this.secondChance = this.skills.has('C5');
  }

  random() {
    // xorshift32 has a zero absorbing state; the fixed replacement keeps zero seeds valid.
    let x = this.rng || 0x9e3779b9;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.rng = x >>> 0;
    return this.rng / 0x100000000;
  }

  pause(value = true) {
    if (value && ACTIVE.has(this.status)) {
      this.previousStatus = this.status;
      this.status = 'paused';
    } else if (!value && this.status === 'paused') {
      this.status = this.previousStatus;
      this.previousStatus = null;
    }
    return this.snapshot();
  }

  update(dt) {
    if (!Number.isFinite(dt) || dt < 0) throw new RangeError('Update duration must be finite and nonnegative');
    if (this.status === 'paused' || this.status === 'won' || this.status === 'lost') return this.snapshot();
    // Short steps preserve chronological spawn, expiration and deadline ordering even
    // when the browser resumes with one large delta.
    while (dt > EPSILON && ACTIVE.has(this.status)) {
      const step = Math.min(dt, 0.025, this.status === 'countdown' ? this.countdown : Infinity);
      dt -= step;
      if (this.status === 'countdown') {
        this.countdown = Math.max(0, this.countdown - step);
        if (this.countdown < EPSILON) {
          this.countdown = 0;
          this.status = 'playing';
        }
      } else {
        this.tick(step);
      }
    }
    return this.snapshot();
  }

  tick(step) {
    const stoppedFor = Math.min(step, this.buffs.stopped);
    this.buffs.stopped = Math.max(0, this.buffs.stopped - step);
    const live = step - stoppedFor;
    if (live < EPSILON) return;
    this.elapsed += live;
    if (!this.level.boss) this.time = Math.max(0, this.time - live);
    for (const key of BUFFS) {
      if (key !== 'stopped') this.buffs[key] = Math.max(0, this.buffs[key] - live);
    }
    for (const pickup of this.pickups) pickup.remaining -= live;
    this.pickups = this.pickups.filter(pickup => pickup.remaining > EPSILON);

    // A multi-hole boss is one entity: a missed boss counts only once.
    const shrink = this.buffs.shrink > 0;
    for (const entity of new Set(this.holes.filter(Boolean))) {
      entity.age += live * (shrink ? C.fakeShrinkFactor : 1);
      if (entity.age >= this.lifetime(entity) - EPSILON) this.remove(entity, true);
    }
    if (this.level.boss) {
      if (!this.enraged && this.elapsed >= C.bossRageTime) {
        this.enraged = true;
        this.events.push({ type: 'roar', value: 'rage' });
      }
      this.bossCycle -= live;
      this.bossSkillRemaining = Math.max(0, this.bossSkillRemaining - live);
      if (this.bossSkillRemaining === 0) this.bossSkill = null;
      if (this.bossCycle <= EPSILON) {
        this.useBossAbility();
        this.bossCycle += (this.level.world < 3 ? C.bossCycleEarly : C.bossCycleLate) - (this.enraged ? C.bossRageCycle : 0);
      }
      if (!this.holes.some(entity => entity?.type === 'boss')) {
        this.bossRespawn -= live;
        if (this.bossRespawn <= EPSILON) this.spawnBoss();
      }
    }
    while (this.goldIndex < C.goldGuarantee.length && this.elapsed >= C.goldGuarantee[this.goldIndex] - EPSILON) {
      this.goldIndex++;
      this.spawn('gold', true);
    }
    this.spawnTimer -= live;
    if (this.spawnTimer <= EPSILON) {
      this.spawnTimer += C.spawnInterval;
      const ambient = new Set(this.holes.filter(entity => entity && entity.type !== 'boss' && entity.type !== 'decoy')).size;
      if (ambient < this.world.limit) this.spawn();
    }
    if (!this.level.boss && this.time <= EPSILON) {
      if (this.secondChance) {
        this.secondChance = false;
        this.time = C.secondChanceTime;
        this.events.push({ type: 'charge', value: 'secondChance' });
      } else this.finish(false);
    }
  }

  lifetime(entity) {
    return entity.warningDuration + C.rising + entity.stay + C.falling;
  }

  freeHole(force = false) {
    const ambient = this.holes.filter(entity => entity && entity.type !== 'boss' && entity.type !== 'decoy');
    if (force && ambient.length >= this.world.limit) {
      const displaced = ambient.find(entity => entity.type !== 'gold') || ambient[0];
      const i = displaced.slots[0];
      this.remove(displaced);
      return i;
    }
    const free = [];
    for (let i = 0; i < this.holes.length; i++) if (!this.holes[i]) free.push(i);
    if (free.length) return free[Math.floor(this.random() * free.length)];
    if (!force) return -1;
    // Guarantee a slot even when decoys fill the board; never displace the real boss.
    const candidates = this.holes.map((entity, i) => ({ entity, i })).filter(({ entity }) => entity && entity.type !== 'boss');
    if (!candidates.length) return -1;
    const { entity, i } = candidates[Math.floor(this.random() * candidates.length)];
    this.remove(entity);
    return i;
  }

  spawn(forcedType, guaranteed = false) {
    const i = this.freeHole(guaranteed);
    if (i < 0) return false;
    let type = forcedType;
    if (!type) {
      const roll = this.random();
      if (roll < this.world.hazardRate) {
        type = this.holes.filter(entity => entity?.type === 'fake' || entity?.type === 'bomb').length < 2 ?
          (this.random() < 2 / 3 ? 'fake' : 'bomb') : 'normal';
      } else if (roll < this.world.hazardRate + this.world.specialRate) {
        const silverWeight = (this.skills.has('C4') ? C.silverSkillWeight : 1) * (this.buffs.magnet > 0 ? C.magnetSilver : 1);
        type = this.random() < 1 / (1 + silverWeight) ? 'gold' : 'silver';
      } else type = 'normal';
    }
    const { x, y } = C.holes[i];
    const entity = {
      id: this.nextId++, type, age: 0, warningDuration: type === 'fake' || type === 'bomb' ? C.hazardWarning : 0,
      stay: (this.world.stay + (this.equipment.has('boots') ? C.bootsStay : 0) + (this.skills.has('A4') ? C.skillStay : 0) + (this.buffs.freeze > 0 ? C.freezeStay : 0)) * (this.enraged ? C.bossRageStayFactor : 1) * (this.buffs.speed > 0 ? C.bossSpeedFactor : 1),
      slots: [i],
    };
    this.holes[i] = entity;
    this.events.push({ type: 'spawn', x, y, value: type });
    return true;
  }

  spawnBoss() {
    const desired = C.bossSizes[this.level.world];
    // The boss claims its full cluster rather than silently shrinking when
    // ambient rabbits happen to occupy the intended spawn spots.
    let available = C.holes.map((_, i) => i).filter(i => !this.holes[i]);
    while (available.length < desired) {
      const candidate = this.holes.find(entity => entity && entity.type !== 'boss' && entity.type !== 'gold');
      if (!candidate) break;
      this.remove(candidate);
      available = C.holes.map((_, i) => i).filter(i => !this.holes[i]);
    }
    const realCount = Math.min(desired === 3 ? 2 : desired === 4 ? 2 + (this.random() < 0.5 ? 0 : 1) : 3, available.length);
    const decoys = Math.min(desired - realCount, available.length - realCount);
    if (realCount <= 0) return;
    // Sort by distance to a moving pivot: the real cluster stays contiguous
    // and occupies 2–3 holes, while the remaining spots are fake targets.
    const pivot = available[Math.floor(this.random() * available.length)];
    available.sort((a, b) => {
      const d = i => Math.abs(i % 3 - pivot % 3) + Math.abs(Math.floor(i / 3) - Math.floor(pivot / 3));
      return d(a) - d(b) || a - b;
    });
    const slots = available.slice(0, realCount);
    const boss = { id: this.nextId++, type: 'boss', age: 0, warningDuration: 0,
      stay: (this.world.stay + (this.equipment.has('boots') ? C.bootsStay : 0) + (this.skills.has('A4') ? C.skillStay : 0) + (this.buffs.freeze > 0 ? C.freezeStay : 0)) * (this.enraged ? C.bossRageStayFactor : 1) * (this.buffs.speed > 0 ? C.bossSpeedFactor : 1), slots };
    for (const i of slots) this.holes[i] = boss;
    const { x, y } = C.holes[slots[0]];
    this.events.push({ type: 'spawn', x, y, value: 'boss' });
    for (const i of available.slice(realCount, realCount + decoys)) this.addDecoy(i, 0, boss.stay);
  }

  addDecoy(i, warningDuration, stay) {
    if (i < 0 || this.holes[i]) return;
    const entity = { id: this.nextId++, type: 'decoy', age: 0, warningDuration, stay, slots: [i] };
    this.holes[i] = entity;
    const { x, y } = C.holes[i];
    this.events.push({ type: 'spawn', x, y, value: 'decoy' });
  }

  useBossAbility() {
    const ability = ['decoy', 'speed', 'obstacle'][this.bossAbility++ % 3];
    this.bossSkill = ability;
    this.bossSkillRemaining = ability === 'decoy' ? C.bossDecoyDuration : ability === 'speed' ? C.bossSpeedDuration : C.bossObstacleWarning + C.bossObstacleDuration;
    const free = C.holes.map((_, i) => i).filter(i => !this.holes[i]);
    if (ability === 'decoy') {
      this.buffs.speed = 0;
      for (let n = 0; n < 2 && free.length; n++) {
        const at = Math.floor(this.random() * free.length);
        this.addDecoy(free.splice(at, 1)[0], 0, C.bossDecoyDuration - C.rising - C.falling);
      }
    } else if (ability === 'speed') {
      this.buffs.speed = C.bossSpeedDuration;
      for (const entity of new Set(this.holes.filter(Boolean))) {
        if (entity.type === 'boss' || PREY.has(entity.type)) {
          const remaining = Math.max(0, entity.stay - Math.max(0, entity.age - entity.warningDuration - C.rising));
          entity.stay -= remaining * (1 - C.bossSpeedFactor);
        }
      }
    } else if (free.length) {
      this.addDecoy(free[Math.floor(this.random() * free.length)], C.bossObstacleWarning, C.bossObstacleDuration);
    }
    this.events.push({ type: 'roar', value: ability });
  }

  remove(entity, missed = false) {
    for (const i of entity.slots) if (this.holes[i] === entity) this.holes[i] = null;
    if (entity.type === 'boss') this.bossRespawn = C.bossRespawn;
    if (missed && (PREY.has(entity.type) || entity.type === 'boss')) {
      this.misses++;
      if (this.buffs.bone <= 0) {
        if (this.insurance > 0) this.insurance--;
        else this.combo = 0;
      }
      this.events.push({ type: 'miss', ...C.holes[entity.slots[0]], value: entity.type });
    }
  }

  hit(x, y) {
    if (this.status !== 'playing' || !Number.isFinite(x) || !Number.isFinite(y)) return this.snapshot();
    const radius = RADIUS * (this.equipment.has('gloves') ? C.hitEquipmentRadius : 1) *
      (this.skills.has('A1') ? C.hitSkillRadius : 1) * (this.buffs.slap > 0 ? C.slapRadius : 1);
    // Pickups are in front of the board, and can be collected independently.
    const pickup = this.pickups.find(item => Math.hypot(x - item.x, y - item.y) <= C.pickupRadius);
    if (pickup) {
      this.pickups.splice(this.pickups.indexOf(pickup), 1);
      this.usePickup(pickup);
      return this.snapshot();
    }
    let best = -1;
    let distance = Infinity;
    for (let i = 0; i < 9; i++) {
      const entity = this.holes[i];
      if (!entity || entity.age < entity.warningDuration + C.rising * 0.35 || entity.age >= entity.warningDuration + C.rising + entity.stay) continue;
      const point = C.holes[i];
      const d = Math.hypot(x - point.x, y - point.y);
      if (d <= radius && d < distance) { best = i; distance = d; }
    }
    if (best < 0) return this.snapshot();
    const entity = this.holes[best];
    const point = C.holes[best];
    if (entity.type === 'fake' || entity.type === 'bomb' || entity.type === 'decoy') {
      this.remove(entity);
      this.combo = 0;
      this.score = Math.max(0, this.score - C.hazardPenalty);
      if (entity.type === 'fake') this.buffs.shrink = C.fakeShrinkDuration;
      if (entity.type === 'bomb' && !this.level.boss) this.time = Math.max(0, this.time - C.bombTime);
      this.events.push({ type: 'hazard', ...point, value: entity.type });
      if (!this.level.boss && this.time <= EPSILON) {
        if (this.secondChance) {
          this.secondChance = false;
          this.time = C.secondChanceTime;
          this.events.push({ type: 'charge', value: 'secondChance' });
        } else this.finish(false);
      }
      return this.snapshot();
    }
    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.hits++;
    const critical = this.skills.has('A3') && this.random() < C.criticalChance;
    let base = entity.type === 'normal' || entity.type === 'boss' ? C.baseScore : C.rareScore;
    if (entity.type === 'normal' && this.skills.has('A2')) base *= C.normalSkillScore;
    const points = Math.round(base * this.multiplier() * (critical ? C.criticalScore : 1) * (this.buffs.boost > 0 ? C.specialSkillBoostFactor : 1));
    this.score += points;
    this.remove(entity);
    this.events.push({ type: critical ? 'critical' : 'hit', ...point, value: points });
    if (entity.type === 'boss') {
      this.bossHp = Math.max(0, this.bossHp - C.bossHitDamage * (this.skills.has('A5') ? C.bossHitSkillFactor : 1));
    } else if (entity.type === 'gold') {
      this.charge = Math.min(this.maxCharge, this.charge + C.goldCharge * (this.skills.has('B1') ? C.goldSkillCharge : 1));
      this.events.push({ type: 'gold', ...point, value: C.goldCharge });
      if (this.charge >= C.specialCost) this.events.push({ type: 'charge', ...point, value: this.charge });
    } else if (entity.type === 'silver') {
      if (!this.level.boss) this.time += C.silverTime;
      this.events.push({ type: 'silver', ...point, value: C.silverTime });
    } else this.maybeDrop(point);
    this.checkVictory();
    return this.snapshot();
  }

  multiplier() {
    return 1 + Math.min(this.combo, C.comboLimit) * C.comboStep;
  }

  maybeDrop(point) {
    if (this.pickups.length >= C.pickupLimit) return;
    const chance = Math.min(C.dropCap, C.dropRate * (this.skills.has('C2') ? C.skillDrop : 1) * (this.equipment.has('collar') ? C.collarDrop : 1));
    if (this.random() >= chance) return;
    let roll = this.random() * ITEMS.reduce((sum, item) => sum + item.weight, 0);
    const item = ITEMS.find(item => (roll -= item.weight) < 0) || ITEMS[ITEMS.length - 1];
    this.pickups.push({ id: this.nextId++, type: item.id, x: point.x, y: point.y - 40, remaining: C.pickupLifetime });
    this.events.push({ type: 'pickup', ...point, value: item.id });
  }

  usePickup(item) {
    this.events.push({ type: 'pickup', x: item.x, y: item.y, value: item.type, collected: true });
    if (item.type === 'clock') {
      if (!this.level.boss) this.time += C.clockTime;
    } else if (item.type === 'freeze') {
      if (this.buffs.freeze <= 0) {
        for (const entity of new Set(this.holes.filter(Boolean))) entity.stay += C.freezeStay;
      }
      this.buffs.freeze = C.buffDuration;
    } else if (['bone', 'magnet', 'slap'].includes(item.type)) {
      this.buffs[item.type] = C.buffDuration;
    }
  }

  special() {
    if (this.status !== 'playing' || this.charge < C.specialCost) return this.snapshot();
    this.charge -= C.specialCost;
    this.events.push({ type: 'special' });
    const targets = [...new Set(this.holes.filter(entity => entity?.type === 'normal' && entity.age >= entity.warningDuration + C.rising * 0.35 && entity.age < entity.warningDuration + C.rising + entity.stay))];
    for (const entity of targets) {
      this.score += Math.round(C.specialScore * this.multiplier() * (this.skills.has('B3') ? C.specialSkillDamage : 1) * (this.buffs.boost > 0 ? C.specialSkillBoostFactor : 1));
      this.remove(entity);
    }
    if (this.level.boss && this.holes.some(entity => entity?.type === 'boss' && entity.age >= C.rising * 0.35 && entity.age < C.rising + entity.stay)) {
      this.bossHp = Math.max(0, this.bossHp - C.specialDamage * (this.skills.has('B3') ? C.specialSkillDamage : 1));
    }
    if (this.skills.has('B4')) this.buffs.stopped = C.specialSkillFreeze;
    if (this.skills.has('B5')) this.buffs.boost = C.specialSkillBoost;
    this.checkVictory();
    return this.snapshot();
  }

  checkVictory() {
    if (this.status !== 'playing') return;
    if (this.level.boss ? this.bossHp <= EPSILON : this.score >= this.level.target) this.finish(true);
  }

  finish(won) {
    if (this.status !== 'playing') return;
    if (won && !this.level.boss) this.score += Math.floor(this.time * C.timeBonus);
    const criteria = won ? [true, this.maxCombo >= C.comboStar, this.misses <= C.missesStar] : [false, false, false];
    this.status = won ? 'won' : 'lost';
    this.result = {
      level: this.level.id, won, score: this.score, stars: criteria.filter(Boolean).length,
      criteria, maxCombo: this.maxCombo, misses: this.misses, hits: this.hits, elapsed: this.elapsed,
    };
    this.events.push({ type: won ? 'win' : 'lose', value: this.score });
  }

  snapshot() {
    const holes = this.holes.map((entity, i) => {
      if (!entity) return null;
      const t = entity.age - entity.warningDuration;
      const phase = t < C.rising ? 'rising' : t < C.rising + entity.stay ? 'up' : 'falling';
      const progress = phase === 'rising' ? Math.max(0, Math.min(1, t / C.rising)) :
        phase === 'falling' ? Math.max(0, 1 - (t - C.rising - entity.stay) / C.falling) : 1;
      return { id: entity.id, type: entity.type, ...C.holes[i], phase, progress,
        ...(t < 0 ? { warning: true } : {}) };
    });
    return {
      level: this.level.id, world: this.level.world, boss: this.level.boss,
      status: this.status, countdown: this.countdown, time: this.time, elapsed: this.elapsed,
      target: this.level.target, score: this.score, combo: this.combo, maxCombo: this.maxCombo,
      misses: this.misses, hits: this.hits, charge: this.charge, maxCharge: this.maxCharge,
      holes, pickups: this.pickups.map(pickup => ({ ...pickup })), buffs: { ...this.buffs },
      bossHp: this.bossHp, bossMaxHp: this.bossMaxHp,
      bossSkill: this.bossSkill, enraged: this.enraged,
      result: this.result ? { ...this.result, criteria: [...this.result.criteria] } : null,
    };
  }

  drainEvents() {
    return this.events.splice(0);
  }

  serialize() {
    const entities = [...new Set(this.holes.filter(Boolean))].map(entity => ({ ...entity, slots: [...entity.slots] }));
    return {
      version: 1, options: { level: this.level.id, skills: [...this.skills], equipment: [...this.equipment], seed: this.rng },
      status: this.status, previousStatus: this.previousStatus, countdown: this.countdown,
      time: this.time, elapsed: this.elapsed, score: this.score, combo: this.combo,
      maxCombo: this.maxCombo, misses: this.misses, hits: this.hits, charge: this.charge,
      entities, pickups: this.pickups.map(pickup => ({ ...pickup })), buffs: { ...this.buffs },
      events: this.events.map(event => ({ ...event })), result: this.result ? { ...this.result, criteria: [...this.result.criteria] } : null,
      nextId: this.nextId, spawnTimer: this.spawnTimer, goldIndex: this.goldIndex,
      bossHp: this.bossHp, bossCycle: this.bossCycle, bossAbility: this.bossAbility,
      bossRespawn: this.bossRespawn, bossSkill: this.bossSkill,
      bossSkillRemaining: this.bossSkillRemaining, enraged: this.enraged,
      insurance: this.insurance, secondChance: this.secondChance,
    };
  }

  static restore(state) {
    if (!state || state.version !== 1) throw new TypeError('Unknown game state version');
    const game = new Game(state.options);
    for (const field of ['status', 'previousStatus', 'countdown', 'time', 'elapsed', 'score', 'combo',
      'maxCombo', 'misses', 'hits', 'charge', 'nextId', 'spawnTimer', 'goldIndex', 'bossHp',
      'bossCycle', 'bossAbility', 'bossRespawn', 'bossSkill', 'bossSkillRemaining', 'enraged', 'insurance', 'secondChance']) game[field] = state[field];
    game.pickups = state.pickups.map(pickup => ({ ...pickup }));
    game.buffs = { ...state.buffs };
    game.events = state.events.map(event => ({ ...event }));
    game.result = state.result ? { ...state.result, criteria: [...state.result.criteria] } : null;
    for (const original of state.entities) {
      const entity = { ...original, slots: [...original.slots] };
      for (const i of entity.slots) game.holes[i] = entity;
    }
    return game;
  }
}
