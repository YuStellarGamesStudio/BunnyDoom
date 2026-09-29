import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createSave, applyResult, buySkill, resetSkills, validateSave, exportSave, encodeSave, parseSave, loadSave, writeSave, importSave, SAVE_KEY, BACKUP_KEY, resolveLanguage } from '../src/save/save.js';

let storage;
beforeEach(() => {
  storage = new Map();
  globalThis.localStorage = {
    getItem(key) { return storage.get(key) ?? null; },
    setItem(key, value) { storage.set(key, String(value)); },
  };
});
const win = (level, maxCombo = 10, misses = 5) => ({ level, won: true, score: 5000, maxCombo, misses, hits: 30 });

test('best stars award only incremental SP, never repeated farming rewards', () => {
  let save = applyResult(createSave(), win(1)).save;
  assert.equal(save.sp, 1);
  assert.equal(save.unlocked, 2);
  const retry = applyResult(save, win(1));
  assert.equal(retry.spGained, 0);
  save = applyResult(retry.save, win(1, 30, 0)).save;
  assert.equal(save.sp, 3);
  assert.equal(save.totalSP, 3);
  assert.equal(save.levels[1].stars, 3);
  assert.deepEqual(validateSave(save), save);
});

test('separate two-star runs cannot combine into a three-star award', () => {
  let save = applyResult(createSave(), win(1, 30, 5)).save;
  save = applyResult(save, win(1, 5, 0)).save;
  assert.equal(save.levels[1].stars, 2);
  assert.equal(save.totalSP, 2);
  assert.deepEqual(save.levels[1].criteria, [true, true, false]);
});

test('skill prerequisites, insufficient balance and free refunds conserve SP', () => {
  let save = applyResult(createSave(), win(1, 30, 0)).save;
  assert.throws(() => buySkill(save, 'A2'), /previous/);
  save = buySkill(save, 'A1');
  save = buySkill(save, 'A2');
  assert.equal(save.sp, 1);
  assert.throws(() => buySkill(save, 'A3'), /enough/);
  assert.throws(() => buySkill(save, 'A1'), /unavailable/);
  const reset = resetSkills(save);
  assert.equal(reset.sp, 3);
  assert.deepEqual(reset.skills, []);
  assert.equal(validateSave(reset).totalSP, 3);
});

test('failed battle updates statistics without unlocking or awarding stars', () => {
  const { save, spGained } = applyResult(createSave(), { ...win(1), won: false });
  assert.equal(save.stats.plays, 1);
  assert.equal(save.stats.wins, 0);
  assert.equal(save.stats.hits, 30);
  assert.equal(save.unlocked, 1);
  assert.equal(spGained, 0);
  assert.deepEqual(save.levels, {});
});

test('invalid progression and fabricated SP cannot enter storage', () => {
  assert.throws(() => validateSave({ ...createSave(), unlocked: 3 }), /locked/);
  assert.throws(() => validateSave({ ...createSave(), sp: 3, totalSP: 3 }), /balance/);
  assert.throws(() => validateSave({ ...createSave(), settings: { ...createSave().settings, bgmVolume: Infinity } }), /settings/);
  assert.throws(() => parseSave('not a save'));
  assert.throws(() => parseSave('x'.repeat(262145)), /size/);
  assert.equal(storage.size, 0);
});

test('JSON and Base64 preserve progression and settings', () => {
  const save = applyResult(createSave(), win(1, 30, 0)).save;
  save.settings.lang = 'ja';
  save.settings.bgm = false;
  assert.deepEqual(parseSave(exportSave(save)), save);
  assert.deepEqual(parseSave(encodeSave(save)), save);
});

test('import backs up exact previous bytes before replacing active slot', () => {
  storage.set(SAVE_KEY, '{damaged original');
  const save = applyResult(createSave(), win(1)).save;
  importSave(save);
  assert.equal(storage.get(BACKUP_KEY), '{damaged original');
  assert.equal(loadSave().save.totalSP, 1);
});

test('backup quota failure leaves the active save untouched', () => {
  const original = exportSave(createSave());
  storage.set(SAVE_KEY, original);
  localStorage.setItem = (key, value) => {
    if (key === BACKUP_KEY) throw new Error('QuotaExceededError');
    storage.set(key, value);
  };
  assert.throws(() => importSave(applyResult(createSave(), win(1)).save), /Quota/);
  assert.equal(storage.get(SAVE_KEY), original);
});

test('corrupted automatic save is reported without overwriting player data', () => {
  storage.set(SAVE_KEY, '{broken');
  const loaded = loadSave();
  assert.notEqual(loaded.error, null);
  assert.equal(storage.get(SAVE_KEY), '{broken');
  assert.equal(loaded.save.unlocked, 1);
});

test('storage write failure is visible to callers', () => {
  localStorage.setItem = () => { throw new Error('Storage unavailable'); };
  assert.throws(() => writeSave(createSave()), /unavailable/);
});

test('language respects valid URL then save then browser then English', () => {
  assert.equal(resolveLanguage('?lang=zh', 'ja', 'en-US'), 'zh');
  assert.equal(resolveLanguage('?lang=unknown', 'ja', 'zh-TW'), 'ja');
  assert.equal(resolveLanguage('', null, 'zh-Hant'), 'zh');
  assert.equal(resolveLanguage('', null, 'fr-FR'), 'en');
});
