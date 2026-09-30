import {drawPortrait} from './renderer.js';
import {getLevel, WORLDS} from '../data/game.js';
import {t, localized} from '../i18n/strings.js';

export async function createResultCard(result, cosmetics, lang) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unavailable');
  const level = getLevel(result.level);
  const portrait = document.createElement('canvas');
  portrait.width = 470;
  portrait.height = 510;
  await drawPortrait(portrait, {cosmetics, world: level.world});
  await document.fonts.ready;
  const accent = result.won ? '#ffe29a' : '#ffb0bd';
  const background = ctx.createLinearGradient(0, 0, 1200, 630);
  background.addColorStop(0, '#172b45');
  background.addColorStop(1, '#382238');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, 1200, 630);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(32, 88, 470, 510, 24);
  ctx.clip();
  ctx.drawImage(portrait, 32, 88);
  ctx.restore();
  function text(value, x, y, size, color, maxWidth) {
    ctx.font = `700 ${size}px system-ui, sans-serif`;
    ctx.fillStyle = color;
    ctx.fillText(String(value), x, y, maxWidth);
  }
  text('BUNNY DOOM · LAST POMERANIAN', 32, 50, 26, '#fff4df', 1120);
  text(t(lang, result.won ? (result.level === 60 ? 'finalClear' : 'victory') : 'defeat'), 538, 140, 48, accent, 624);
  text(`${t(lang, 'level')} ${result.level} · ${localized(WORLDS[level.world].name, lang)}`, 538, 191, 25, '#fff4df', 624);
  text('★'.repeat(result.stars) + '☆'.repeat(3 - result.stars), 538, 257, 46, accent, 624);
  const stats = [['score', result.score], ['combo', result.maxCombo], ['misses', result.misses]];
  stats.forEach(([key, value], index) => {
    const y = 327 + index * 70;
    text(t(lang, key), 538, y, 23, '#cfcbdd', 290);
    ctx.textAlign = 'right';
    text(Number(value).toLocaleString(lang), 1160, y, 32, '#ffffff', 320);
    ctx.textAlign = 'left';
  });
  text('bunnydoom.ysgs.app', 538, 579, 22, '#cfcbdd', 624);
  return new Promise((resolve, reject) => canvas.toBlob(blob => {
    if (blob) resolve(blob);
    else reject(new Error('PNG encoding failed'));
  }, 'image/png'));
}
