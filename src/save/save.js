import { SKILLS, EQUIPMENT, COSMETICS } from '../data/game.js';

export const SAVE_KEY = 'bunnydoom-save-v1';
export const BACKUP_KEY = 'bunnydoom-save-backup';
const MAX_FILE = 262144;
const languages = ['en', 'zh', 'ja'];
const slots = ['hat', 'outfit', 'collar', 'effect'];
const fail = (message) => { throw new Error(message); };
const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const integer = (value, min, max) => Number.isSafeInteger(value) && value >= min && value <= max;
const copy = (value) => structuredClone(value);
const date = (value) => typeof value === 'string' && value.length <= 40 && Number.isFinite(Date.parse(value));

export function createSave() {
  return {
    version: 1, updatedAt: new Date().toISOString(), unlocked: 1, levels: {},
    sp: 0, totalSP: 0, skills: [], equipment: [], cosmetics: [],
    equipped: { hat: null, outfit: null, collar: null, effect: null }, scores: [],
    stats: { plays: 0, wins: 0, hits: 0, misses: 0 },
    settings: { lang: null, bgm: true, sfx: true, bgmVolume: 65, sfxVolume: 80 },
  };
}

function ids(value, catalogue, max, label) {
  if (!Array.isArray(value) || value.length > max || new Set(value).size !== value.length ||
      value.some((id) => typeof id !== 'string' || !catalogue.some((item) => item.id === id))) fail(`Invalid ${label}.`);
  return [...value];
}

function earnedCosmetics(save) {
  const stars = Object.values(save.levels).reduce((sum, level) => sum + level.stars, 0);
  const worlds = Object.keys(save.levels).filter((id) => Number(id) % 10 === 0 && save.levels[id].stars > 0).length;
  return COSMETICS.filter(({ requirement }) => {
    const value = requirement.type === 'stars' ? stars : requirement.type === 'sp' ? save.totalSP : worlds;
    return value >= requirement.value;
  }).map(({ id }) => id);
}

export function availableCosmetics(save) {
  return earnedCosmetics(save);
}

export function validateSave(raw) {
  if (!record(raw) || raw.version !== 1) fail('Unsupported or invalid save version.');
  const result = createSave();
  if (!date(raw.updatedAt)) fail('Invalid save date.');
  result.updatedAt = raw.updatedAt;
  if (!integer(raw.unlocked, 1, 60) || !record(raw.levels) || Object.keys(raw.levels).length > 60) fail('Invalid level progress.');
  result.unlocked = raw.unlocked;
  let earned = 0;
  for (const [key, level] of Object.entries(raw.levels)) {
    if (!/^(?:[1-9]|[1-5][0-9]|60)$/.test(key) || !record(level) || !integer(level.stars, 0, 3) ||
        !integer(level.bestScore, 0, 1000000000) || !Array.isArray(level.criteria) || level.criteria.length !== 3 ||
        level.criteria.some((value) => typeof value !== 'boolean') ||
        level.criteria.filter(Boolean).length !== level.stars || (level.stars > 0 && !level.criteria[0])) fail('Invalid level result.');
    result.levels[key] = { stars: level.stars, bestScore: level.bestScore, criteria: [...level.criteria] };
    earned += level.stars;
  }
  for (let id = 1; id < result.unlocked; id++) {
    if (!result.levels[id]?.stars) fail('Progress skips a locked level.');
  }
  if (Object.keys(result.levels).some((id) => Number(id) > result.unlocked)) fail('Result belongs to a locked level.');
  if (!integer(raw.totalSP, 0, 180) || raw.totalSP !== earned || !integer(raw.sp, 0, 180)) fail('Invalid skill point balance.');
  result.skills = ids(raw.skills, SKILLS, 15, 'skills');
  for (const id of result.skills) {
    const rank = Number(id.slice(1));
    if (rank > 1 && !result.skills.includes(`${id[0]}${rank - 1}`)) fail('Missing skill prerequisite.');
  }
  const spent = result.skills.reduce((sum, id) => sum + SKILLS.find((skill) => skill.id === id).cost, 0);
  if (raw.sp + spent !== earned) fail('Skill points do not balance.');
  result.sp = raw.sp;
  result.totalSP = raw.totalSP;
  result.equipment = ids(raw.equipment, EQUIPMENT, result.skills.includes('C3') ? 3 : 2, 'equipment');
  result.cosmetics = ids(raw.cosmetics, COSMETICS, 24, 'cosmetics');
  const eligible = earnedCosmetics(result);
  if (result.cosmetics.some((id) => !eligible.includes(id))) fail('Cosmetic has not been unlocked.');
  // Derived unlocks are reconstructed so older valid saves gain newly reached rewards.
  result.cosmetics = eligible;
  if (!record(raw.equipped)) fail('Invalid cosmetic slots.');
  for (const slot of slots) {
    const id = raw.equipped[slot];
    if (id !== null && (!result.cosmetics.includes(id) || COSMETICS.find((item) => item.id === id)?.slot !== slot)) fail('Invalid equipped cosmetic.');
    result.equipped[slot] = id;
  }
  if (!Array.isArray(raw.scores) || raw.scores.length > 10) fail('Invalid high scores.');
  result.scores = raw.scores.map((entry) => {
    if (!record(entry) || typeof entry.name !== 'string' || !/^[A-Z0-9]{3}$/.test(entry.name) ||
        !integer(entry.score, 0, 1000000000) || !integer(entry.level, 1, 60) || !date(entry.date)) fail('Invalid high score entry.');
    return { name: entry.name, score: entry.score, level: entry.level, date: entry.date };
  }).sort((a, b) => b.score - a.score);
  if (!record(raw.stats)) fail('Invalid statistics.');
  for (const key of ['plays', 'wins', 'hits', 'misses']) {
    if (!integer(raw.stats[key], 0, 1000000000)) fail('Invalid statistics.');
    result.stats[key] = raw.stats[key];
  }
  if (result.stats.wins > result.stats.plays) fail('Invalid win count.');
  const settings = raw.settings;
  if (!record(settings) || (settings.lang !== null && !languages.includes(settings.lang)) ||
      typeof settings.bgm !== 'boolean' || typeof settings.sfx !== 'boolean' ||
      !integer(settings.bgmVolume, 0, 100) || !integer(settings.sfxVolume, 0, 100)) fail('Invalid settings.');
  result.settings = { lang: settings.lang, bgm: settings.bgm, sfx: settings.sfx, bgmVolume: settings.bgmVolume, sfxVolume: settings.sfxVolume };
  return result;
}

export function loadSave() {
  try {
    const text = localStorage.getItem(SAVE_KEY);
    if (text === null) return { save: createSave(), error: null };
    if (text.length > MAX_FILE) fail('Save exceeds the size limit.');
    return { save: validateSave(JSON.parse(text)), error: null };
  } catch (error) {
    return { save: createSave(), error: error.message };
  }
}

export function writeSave(save) {
  const validated = validateSave({ ...save, updatedAt: new Date().toISOString() });
  localStorage.setItem(SAVE_KEY, JSON.stringify(validated));
  return validated;
}

export function exportSave(save) {
  return JSON.stringify(validateSave(save), null, 2);
}

export function encodeSave(save) {
  const bytes = new TextEncoder().encode(exportSave(save));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function parseSave(text) {
  if (typeof text !== 'string' || text.length > MAX_FILE) fail('Save exceeds the size limit.');
  const trimmed = text.trim();
  try {
    const json = trimmed.startsWith('{') ? trimmed : new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(atob(trimmed), (char) => char.charCodeAt(0)));
    return validateSave(JSON.parse(json));
  } catch (error) {
    throw new Error(`Cannot import save: ${error.message}`);
  }
}

export function importSave(save) {
  const validated = validateSave(save);
  const previous = localStorage.getItem(SAVE_KEY);
  // Quota/security errors abort before replacing the current slot.
  if (previous !== null) localStorage.setItem(BACKUP_KEY, previous);
  const next = { ...validated, updatedAt: new Date().toISOString() };
  localStorage.setItem(SAVE_KEY, JSON.stringify(next));
  return next;
}

export function applyResult(save, result) {
  if (!record(result) || !integer(result.level, 1, save.unlocked) || typeof result.won !== 'boolean' ||
      !Number.isFinite(result.score) || result.score < 0) fail('Invalid battle result.');
  const next = copy(save);
  next.stats.plays++;
  next.stats.hits += Math.max(0, Math.floor(result.hits ?? 0));
  next.stats.misses += Math.max(0, Math.floor(result.misses ?? 0));
  let spGained = 0;
  if (result.won) {
    next.stats.wins++;
    const criteria = [true, result.maxCombo >= 30, result.misses <= 2];
    const stars = criteria.filter(Boolean).length;
    const previous = next.levels[result.level] ?? { stars: 0, bestScore: 0, criteria: [false, false, false] };
    spGained = Math.max(0, stars - previous.stars);
    next.levels[result.level] = {
      stars: Math.max(previous.stars, stars),
      criteria: stars > previous.stars ? criteria : previous.criteria,
      bestScore: Math.max(previous.bestScore, Math.round(result.score)),
    };
    next.unlocked = Math.max(next.unlocked, Math.min(60, result.level + 1));
    next.sp += spGained;
    next.totalSP += spGained;
  }
  const eligible = earnedCosmetics(next);
  const newCosmetics = eligible.filter((id) => !next.cosmetics.includes(id));
  next.cosmetics = eligible;
  next.updatedAt = new Date().toISOString();
  return { save: next, spGained, newCosmetics };
}

export function buySkill(save, id) {
  const skill = SKILLS.find((entry) => entry.id === id);
  if (!skill || save.skills.includes(id)) fail('Skill is unavailable.');
  const rank = Number(id.slice(1));
  if (rank > 1 && !save.skills.includes(`${id[0]}${rank - 1}`)) fail('Unlock the previous skill first.');
  if (save.sp < skill.cost) fail('Not enough SP.');
  return { ...copy(save), sp: save.sp - skill.cost, skills: [...save.skills, id] };
}

export function resetSkills(save) {
  const next = copy(save);
  if (next.equipment.length > 2) fail('Unequip the third item before resetting skills.');
  next.sp = next.totalSP;
  next.skills = [];
  return next;
}

export function setCosmetic(save, id) {
  const item = COSMETICS.find((entry) => entry.id === id);
  if (!item || !availableCosmetics(save).includes(id)) fail('Cosmetic is locked.');
  const next = copy(save);
  next.cosmetics = availableCosmetics(save);
  next.equipped[item.slot] = next.equipped[item.slot] === id ? null : id;
  return next;
}

export function addHighScore(save, { name, score, level }) {
  const tag = String(name).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3).padEnd(3, 'A');
  if (!integer(Math.round(score), 0, 1000000000) || !integer(level, 1, 60)) fail('Invalid high score.');
  const next = copy(save);
  next.scores.push({ name: tag, score: Math.round(score), level, date: new Date().toISOString() });
  next.scores.sort((a, b) => b.score - a.score);
  next.scores = next.scores.slice(0, 10);
  return next;
}

export function resolveLanguage(search, savedLang, browserLang) {
  const requested = new URLSearchParams(search).get('lang');
  if (languages.includes(requested)) return requested;
  if (languages.includes(savedLang)) return savedLang;
  const detected = String(browserLang ?? '').toLowerCase().split('-')[0];
  return languages.includes(detected) ? detected : 'en';
}
