import { COSMETICS } from '../../src/data/game.js';
import { svg, star } from './common.mjs';

const art = new Map();
const put = (name, content) => art.set(name, content);
const ink = '#5a3a55';
const characterDefs = `<defs>
<radialGradient id="ch-bunny" cx="29%" cy="18%" r="82%"><stop stop-color="#fff"/><stop offset=".53" stop-color="#fff9ed"/><stop offset=".83" stop-color="#e7d8da"/><stop offset="1" stop-color="#b99ba8"/></radialGradient>
<radialGradient id="ch-gold" cx="27%" cy="17%" r="84%"><stop stop-color="#fffef0"/><stop offset=".27" stop-color="#fff2a2"/><stop offset=".58" stop-color="#f8cc50"/><stop offset=".86" stop-color="#d89534"/><stop offset="1" stop-color="#9e6450"/></radialGradient>
<radialGradient id="ch-silver" cx="29%" cy="17%" r="85%"><stop stop-color="#fff"/><stop offset=".3" stop-color="#efffff"/><stop offset=".62" stop-color="#c3dae7"/><stop offset=".9" stop-color="#829cb9"/><stop offset="1" stop-color="#5e6b91"/></radialGradient>
<radialGradient id="ch-straw" cx="26%" cy="20%" r="80%"><stop stop-color="#fff1c8"/><stop offset=".48" stop-color="#d9af73"/><stop offset=".84" stop-color="#b27e58"/><stop offset="1" stop-color="#79546a"/></radialGradient>
<radialGradient id="ch-steel" cx="25%" cy="15%" r="90%"><stop stop-color="#d5e5e5"/><stop offset=".25" stop-color="#86989f"/><stop offset=".6" stop-color="#526476"/><stop offset="1" stop-color="#303848"/></radialGradient>
<linearGradient id="ch-ear" x1=".15" y1="0" x2=".7" y2="1"><stop stop-color="#ffe6df"/><stop offset=".55" stop-color="#f5a6af"/><stop offset="1" stop-color="#b76f91"/></linearGradient>
<radialGradient id="ch-dog" cx="34%" cy="21%" r="77%"><stop stop-color="#fff2cc"/><stop offset=".33" stop-color="#f9cf8a"/><stop offset=".72" stop-color="#e9a65c"/><stop offset="1" stop-color="#ad6557"/></radialGradient>
<radialGradient id="ch-cream" cx="34%" cy="17%" r="84%"><stop stop-color="#fffef5"/><stop offset=".67" stop-color="#fff0d1"/><stop offset="1" stop-color="#e3b990"/></radialGradient>
<linearGradient id="ch-cape" x1="0" y1="0" x2=".88" y2="1"><stop stop-color="#ec91ac"/><stop offset=".46" stop-color="#ad537c"/><stop offset="1" stop-color="#603551"/></linearGradient>
<linearGradient id="ch-metal" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#fff9c6"/><stop offset=".4" stop-color="#f2cc6d"/><stop offset=".77" stop-color="#c68740"/><stop offset="1" stop-color="#86506a"/></linearGradient>
<radialGradient id="ch-jewel" cx="29%" cy="18%" r="79%"><stop stop-color="#fff"/><stop offset=".24" stop-color="#acefff"/><stop offset=".65" stop-color="#56a6c5"/><stop offset="1" stop-color="#375178"/></radialGradient>
<pattern id="ch-woven" width="9" height="9" patternUnits="userSpaceOnUse"><path d="M0 2h9M2 0v9" stroke="#784e4d" stroke-opacity=".28" stroke-width="1.3"/></pattern>
</defs>`;
const stroke = `stroke="${ink}" stroke-width="3.1" stroke-linejoin="round" stroke-linecap="round"`;

function rabbitEar(x, tilt, coat, decoy = false) {
  return `<g transform="translate(${x} 80) rotate(${tilt})"><path d="M-13 3Q-24-21-16-63Q-12-77-4-73Q13-70 17-24L15 5Z" fill="${coat}" ${stroke}/><path d="M-7-8Q-15-28-10-61Q-6-68-1-61Q8-48 9-13Z" fill="${decoy ? '#a46a5d' : 'url(#ch-ear)'}" stroke="${decoy ? '#775063' : '#d38c9b'}" stroke-width="1.6"/><path d="M-14-27Q-15-51-10-60" fill="none" stroke="#fff9e8" stroke-opacity=".85" stroke-width="2.5" stroke-linecap="round"/>${decoy ? '<path d="M-7-29l8 5m-6 13 8 4" stroke="#65495a" stroke-width="2"/>' : ''}</g>`;
}

const bossColors = ['#eb697a', '#e8a66c', '#73c6cf', '#ecc66d', '#a8dded', '#afa3ec'];
function regalia(n) {
  const color = bossColors[n];
  const emblem = [
    '<path d="M84 147q7-8 13 0l-6 11z" fill="#f5d382"/><path d="M83 146h15m-12 4h10" stroke="#a25c59" stroke-width="2"/>',
    '<path d="M79 151q10-12 22 0-5 12-22 0" fill="#efca84" stroke="#a87764" stroke-width="2"/><path d="M84 150l8-5 5 5" fill="none" stroke="#fff5d7" stroke-width="2"/>',
    '<path d="M90 141v18m-8-11 8-7 8 7m-14 1h12" fill="none" stroke="#ffebbb" stroke-width="3"/>',
    '<path d="M90 140l9 12-9 10-9-10z" fill="url(#ch-jewel)" stroke="#ffe2a4" stroke-width="2"/>',
    '<path d="M81 144h18l-4 15H85z" fill="#f4f6f5" stroke="#627d9b" stroke-width="2"/><path d="M83 149h14" stroke="#9ce8f4" stroke-width="2"/>',
    '<circle cx="90" cy="150" r="9" fill="url(#ch-jewel)" stroke="#fff1b8" stroke-width="2"/><path d="M84 149q6-9 12 0" fill="none" stroke="white" stroke-width="2"/>'
  ][n];
  return `<path d="M46 112Q19 127 15 173q26-18 50-13 22-14 49 0 28-3 51 13-4-45-33-61" fill="url(#ch-cape)" ${stroke}/><path d="M24 158q17-39 29-36m103 36q-18-42-30-36" fill="none" stroke="#f8bdc6" stroke-width="3" opacity=".75"/><path d="M48 119q7 16 29 22l13-6 13 6q23-7 29-22l10 16q-16 24-51 30-39-5-54-31Z" fill="${color}" ${stroke}/><path d="M47 130q25 26 43 27 25-5 43-28" fill="none" stroke="#ffeac2" stroke-width="4"/><path d="M75 139q15 7 30 0" fill="none" stroke="#fff7d7" stroke-width="2"/>${emblem}`;
}
function crown(n) {
  const band = `<path d="M57 61q32 12 66 0l-3 9q-32 13-60 0z" fill="url(#ch-metal)" ${stroke}/><path d="M63 65q27 8 54 0" fill="none" stroke="#fff5d5" stroke-width="2"/>`;
  const shapes = [
    `<path d="M62 61q0-19 28-21 28 2 28 21-23 10-56 0z" fill="#c55357" ${stroke}/><path d="M65 52q23-14 48 0" fill="none" stroke="#fff1c9" stroke-width="4"/><path d="M75 47q4-7 11-3m9 1q6-5 12 2" fill="none" stroke="#f5ad80" stroke-width="2"/><path d="M74 53q7 4 10 0m12 0q6 5 12 0" fill="none" stroke="#ffaeb0" stroke-width="2"/>`,
    `<path d="M60 59q3-19 17-22 0 11 12 10 13-4 17-13 16 5 17 25-12 13-29 7Q78 73 60 59Z" fill="url(#ch-gold)" ${stroke}/><path d="M66 55q9 11 20 4m11-1q11 3 20-6" fill="none" stroke="#fff6d1" stroke-width="3"/><path d="M76 43q-7 9 0 15m25-12q7 8 0 14" fill="none" stroke="#cd8e4d" stroke-width="2"/>`,
    `<path d="M58 58l1-17 12 9 2-19 13 16 6-24 9 22 12-15 2 20 12-8-2 18Z" fill="url(#ch-metal)" ${stroke}/><path d="M72 49l-1-11m22 8V32m18 18 2-12" stroke="#fff9d6" stroke-width="2.3"/><path d="M81 54h18l-9 10z" fill="url(#ch-jewel)" stroke="#fff3c9" stroke-width="2"/>`,
    `<path d="M56 58q4-17 34-20 31 2 34 20l-12 8H69Z" fill="url(#ch-metal)" ${stroke}/><path d="M62 52l-13 43 22-10 8-30m39-3 13 43-22-10-8-30" fill="#54b8ad" ${stroke}/><path d="M56 63l19 8m48-8-18 8" stroke="#ffe4a7" stroke-width="4"/><path d="M78 41l12-18 12 18-12 11z" fill="url(#ch-metal)" ${stroke}/><path d="M84 42l6-9 6 9-6 7z" fill="url(#ch-jewel)"/>`,
    `<path d="M56 61q1-27 34-29 33 2 34 29l-10 11q-24-8-48 0z" fill="#38435e" ${stroke}/><path d="M68 50q20-20 43 0" fill="none" stroke="#fff" stroke-width="8"/><path d="M82 57q8-8 16 0l-8 7z" fill="url(#ch-metal)" stroke="#9b6670" stroke-width="2"/><path d="M64 64q25-8 52 0" fill="none" stroke="#bbecf5" stroke-width="3"/>`,
    `<path d="M54 61q2-28 36-31 35 3 36 31l-12 11q-24-9-48 0Z" fill="url(#ch-silver)" ${stroke}/><ellipse cx="90" cy="52" rx="25" ry="15" fill="#334766" stroke="#b4f0fb" stroke-width="3"/><path d="M72 47q12-13 29-8" fill="none" stroke="#e3ffff" stroke-width="3"/><circle cx="110" cy="54" r="3" fill="#defcff"/><path d="M75 29q15-15 30 0" fill="none" stroke="#fff" stroke-width="2"/>`
  ];
  return `<g>${shapes[n]}${band}<ellipse cx="90" cy="65" rx="6" ry="7" fill="url(#ch-jewel)" stroke="#fff4d1" stroke-width="2"/><circle cx="88" cy="62" r="1.7" fill="white"/></g>`;
}

export function bunny(type = 'normal', boss = -1) {
  const royal = boss >= 0;
  const fake = type === 'fake' && !royal;
  const bomb = type === 'bomb' && !royal;
  const coat = fake ? 'url(#ch-straw)' : bomb ? 'url(#ch-steel)' : type === 'gold' && !royal ? 'url(#ch-gold)' : type === 'silver' && !royal ? 'url(#ch-silver)' : 'url(#ch-bunny)';
  const ears = rabbitEar(58, -13, coat, fake) + rabbitEar(122, 13, coat, fake);
  const straw = fake ? `<path d="M31 102l-13-5 15 15-14 5 20 7m110-22 13-5-15 15 14 5-20 7M57 143l-8 19 15-11m57-8 8 19-15-11" fill="#ebcb80" stroke="#946650" stroke-width="2.3"/><path d="M35 101q-9-15-10-32m116 34q13-22 10-34" fill="none" stroke="#f2dc94" stroke-width="3"/>` : '';
  const body = `<path d="M40 139q7-31 50-34 44 2 50 34l10 25Q90 190 30 164Z" fill="${coat}" ${stroke}/><path d="M60 125q-6 19 3 33m58-33q5 20-4 34" fill="none" stroke="#fff9e8" stroke-opacity=".62" stroke-width="3" stroke-linecap="round"/><path d="M63 140q27 17 55 0" fill="none" stroke="${fake ? '#d7ab77' : '#fffaf2'}" stroke-width="4" opacity=".85"/>`;
  const head = `<path d="M33 96q-3-47 49-54 51-9 65 37 13 51-30 63-38 12-68-10Q34 118 33 96Z" fill="${coat}" ${stroke}/>${fake ? '<path d="M33 96q-3-47 49-54 51-9 65 37 13 51-30 63-38 12-68-10Q34 118 33 96Z" fill="url(#ch-woven)"/>' : ''}<path d="M42 81q9-29 38-32" fill="none" stroke="#fff" stroke-opacity=".74" stroke-width="4" stroke-linecap="round"/><path d="M56 72l-6-10 15 2-2-11 15 7" fill="${coat}" stroke="${fake ? '#9e765f' : '#d8b5b3'}" stroke-width="1.5" stroke-linejoin="round"/>`;
  const muzzle = `<ellipse cx="90" cy="114" rx="27" ry="21" fill="${fake ? '#ebc58e' : bomb ? '#c5d5d7' : '#fffaf4'}" opacity=".91"/><path d="M83 115q7-6 14 0l-7 7z" fill="${fake ? '#875468' : '#ce8390'}" stroke="${ink}" stroke-width="1.5"/><path d="M90 122v7m0 0q-8 8-16 0m16 0q8 8 16 0" fill="none" stroke="${ink}" stroke-width="2.5" stroke-linecap="round"/>`;
  const eyes = fake ? `<circle cx="69" cy="95" r="7.6" fill="#805b54" ${stroke}/><circle cx="112" cy="95" r="7.6" fill="#805b54" ${stroke}/><path d="M67 88v14m-5-7h14m34-7v14m-5-7h14" stroke="#e6c694" stroke-width="2.4"/><path d="M43 113l13 5m72-5-12 5M58 121l7-5m49 0 7 5" fill="none" stroke="#8a5b55" stroke-width="2" stroke-dasharray="3 3"/>` : `<ellipse cx="69" cy="96" rx="6.7" ry="9" fill="#3a2b43"/><ellipse cx="111" cy="96" rx="6.7" ry="9" fill="#3a2b43"/><circle cx="67" cy="92" r="2.7" fill="white"/><circle cx="109" cy="92" r="2.7" fill="white"/><circle cx="72" cy="100" r="1.2" fill="#bac8e8"/><circle cx="114" cy="100" r="1.2" fill="#bac8e8"/><ellipse cx="54" cy="112" rx="9" ry="4" fill="#f2a0ab" opacity=".6"/><ellipse cx="126" cy="112" rx="9" ry="4" fill="#f2a0ab" opacity=".6"/>`;
  const paws = `<path d="M36 149q8-11 28-9 16 2 16 15 1 10-21 10-27 0-23-16Zm108 0q-8-11-28-9-16 2-16 15-1 10 21 10 27 0 23-16Z" fill="${coat}" ${stroke}/><path d="M47 152q10-4 20 0m46 0q10-4 20 0" fill="none" stroke="#fff" opacity=".7" stroke-width="2.5"/>`;
  const helmet = bomb ? `<path d="M41 71q4-32 48-35 44 2 50 35l-10 8q-37-10-79 1z" fill="url(#ch-steel)" ${stroke}/><path d="M46 69q39-14 88 0" fill="none" stroke="#f8d784" stroke-width="6"/><path d="M50 74q39-9 79 0" fill="none" stroke="#424455" stroke-width="3"/><circle cx="90" cy="53" r="9" fill="url(#ch-metal)" ${stroke}/><path d="M90 47l5 9H85z" fill="#8f4b59"/><path d="M112 40q6-15 17-13 12 0 10-13" fill="none" stroke="#514b53" stroke-width="5" stroke-linecap="round"/>${star(142,12,9,'#ffe29b')}<circle cx="138" cy="23" r="3" fill="#ff9b55"/>` : '';
  const accent = type === 'gold' && !royal ? `${star(151,63,9,'#fff7c4')}${star(23,93,6,'#fff7c4')}<path d="M50 82q10-26 33-28m24 66q18-4 22-23" fill="none" stroke="#fffde4" stroke-opacity=".85" stroke-width="3" stroke-linecap="round"/>` : type === 'silver' && !royal ? `${star(151,57,9,'#e5ffff')}<path d="M44 84q9-24 36-30m25 67q21-6 24-23" fill="none" stroke="#efffff" stroke-opacity=".9" stroke-width="3" stroke-linecap="round"/>` : '';
  const bossFace = royal ? `<path d="M56 83l20 9m48-9-20 9" stroke="${ink}" stroke-width="5.5" stroke-linecap="round"/><path d="M82 126q8 5 16 0" fill="none" stroke="#9e6174" stroke-width="2"/>` : '';
  return svg(180, 180, `${characterDefs}<g filter="url(#drop)">${ears}${royal ? regalia(boss) : ''}${straw}${body}${head}${accent}<g transform="translate(0 ${royal ? 0 : -16})">${muzzle}${eyes}${bossFace}</g>${helmet}${royal ? crown(boss) : ''}${paws}</g>`, '0 0 180 180');
}
for (const type of ['normal', 'gold', 'silver', 'fake', 'bomb']) put(`rabbit-${type}`, bunny(type));
for (let n = 0; n < 6; n++) put(`boss-${n}`, bunny('normal', n));

export function dog() {
  const fringe = `<path d="M43 75q-14-16-8-33l18 15q-5-21 7-28l15 22q5-15 16-18l9 16q10-20 20-20l3 23 18-14q6 17-4 30" fill="url(#ch-dog)" ${stroke}/><path d="M45 59q-5-17-3-22l15 18m67-1 15-18q2 13-4 21" fill="#ab665c" stroke="${ink}" stroke-width="2.5"/><path d="M46 58q-2-8-2-12l10 14m72-1 9-13-2 14" fill="#f6c78d"/>`;
  const ruff = `<path d="M46 73q-23-5-22 18l-9 3 12 14-10 12 15 6-5 16 17 1 3 16 18-5 11 13 13-9 16 9 10-13 17 4 4-16 17-4-7-14 14-11-12-10 7-17-19-4q-4-17-25-21Z" fill="url(#ch-dog)" ${stroke}/><path d="M40 86q-9 12 2 22l-8 10 12 7m94-40q10 12-1 23l8 9-12 7M49 138l12 5 10-4m61-1-13 5-10-4" fill="none" stroke="#fff2d1" stroke-opacity=".8" stroke-width="4" stroke-linecap="round"/><path d="M37 96q-6 13 6 20m99-20q7 14-6 21" fill="none" stroke="#bf795a" stroke-width="2" stroke-linecap="round"/>`;
  return svg(180, 180, `${characterDefs}<g filter="url(#drop)">${fringe}<path d="M54 137q-16 17-8 26 31 17 83 0 8-13-9-29Z" fill="url(#ch-dog)" ${stroke}/>${ruff}<path d="M46 90q-8-21 4-38 12-19 39-19 39-2 49 33 13 39-21 62-32 21-63-3Q44 113 46 90Z" fill="url(#ch-dog)" ${stroke}/><path d="M49 78q5-19 18-25m67 23q-3-17-15-24" fill="none" stroke="#fff2d1" stroke-width="3.5" stroke-linecap="round"/><path d="M60 83q6-15 13-18 11-3 17 3 11-10 23-3 11 6 14 19-11-4-19-2-8-4-17-1-13-6-31 2z" fill="#f7d497" opacity=".9"/><path d="M87 48l-7 11 12-3 7 6 7-13" fill="url(#ch-dog)"/><path d="M62 100q-8 17 7 30 21 17 41 0 17-13 8-30-14 1-28 8-14-7-28-8Z" fill="url(#ch-cream)"/><ellipse cx="70" cy="92" rx="7.3" ry="9" fill="#342c3d"/><ellipse cx="111" cy="92" rx="7.3" ry="9" fill="#342c3d"/><circle cx="68" cy="88" r="2.7" fill="white"/><circle cx="109" cy="88" r="2.7" fill="white"/><circle cx="73" cy="96" r="1.2" fill="#a8b3c6"/><circle cx="114" cy="96" r="1.2" fill="#a8b3c6"/><path d="M80 111q10-8 20 0 0 10-10 11-10-2-10-11Z" fill="#34313b" stroke="${ink}" stroke-width="1.8"/><path d="M83 110q6-3 12 0" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="2" stroke-linecap="round"/><path d="M90 121v7m0 0q-9 8-17-2m17 2q9 8 17-2" fill="none" stroke="${ink}" stroke-width="2.7" stroke-linecap="round"/><path d="M84 132q6 17 13 0" fill="#f3889f" stroke="${ink}" stroke-width="2"/><path d="M88 137q4-2 6 1" fill="none" stroke="#ffd0d4" stroke-width="2"/><path d="M49 146q-11 5-9 17 11 11 34 6 7-5 5-14-6-13-30-9Zm82 0q11 5 9 17-11 11-34 6-7-5-5-14 6-13 30-9Z" fill="url(#ch-cream)" ${stroke}/><path d="M51 160l5 4m8-5 4 5m44-5-4 5m17-5-5 5" fill="none" stroke="#dba980" stroke-width="2" stroke-linecap="round"/></g>`);
}
put('dog', dog());

// Accessories share the dog's 180-unit drawing space: ears 44/136, forehead 60–120,
// neck 62–118 at y130, and front paws y148–169.
const hatShapes = [
  `<path d="M56 61q0-24 34-28 34 4 34 28l-7 9q-27-6-54 1Z" fill="CURRENT" ${stroke}/><path d="M60 58q31-13 60 0" fill="none" stroke="#fff7d7" stroke-width="4"/><path d="M51 67q39 12 78 0" fill="none" stroke="${ink}" stroke-width="8"/><path d="M53 65q38 9 74 0" fill="none" stroke="#fff4cf" stroke-width="5"/>${star(91,46,10,'#fffaf0')}`,
  `<path d="M56 57q7-24 34-25 28 2 35 25l-8 11q-26-6-53 1Z" fill="url(#ch-cream)" ${stroke}/><path d="M58 55q32-14 64 0v11q-31-7-64 0Z" fill="CURRENT" ${stroke}/><path d="M57 65q33 7 69-1l-7 8q-26-5-57 1Z" fill="CURRENT" ${stroke}/><path d="M90 40v21m-8-8q8 15 16 0" fill="none" stroke="#31597b" stroke-width="3"/><circle cx="90" cy="42" r="2.3" fill="#31597b"/><path d="M67 43q11-9 26-7" fill="none" stroke="white" stroke-width="3"/>`,
  `<path d="M61 65q-13-8-10-20 1-8 13-9-4-11 5-17 9-7 20-2 10-9 21-1 8 4 7 16 15-2 18 9 3 12-12 23v9H60Z" fill="CURRENT" ${stroke}/><path d="M65 55q-9-9 2-17m11 20q-6-12 3-18m15 18q-3-11 8-18m16 16q9-12-1-17" fill="none" stroke="#fff" stroke-width="3" opacity=".83"/><path d="M59 62q30 7 64 0v11q-34-6-64 0Z" fill="url(#ch-cream)" ${stroke}/><path d="M70 68q19-3 40 0" fill="none" stroke="#f4d7bc" stroke-width="2"/>`,
  `<path d="M51 58q3-24 36-27 34-1 42 23-15 14-40 15-24 1-38-11Z" fill="CURRENT" ${stroke}/><path d="M53 56q26 12 60 1" fill="none" stroke="#ffe6ef" stroke-width="4"/><path d="M57 64q29 11 66-1" fill="none" stroke="${ink}" stroke-width="5"/><path d="M61 63q28 8 58-1" fill="none" stroke="#f6cae1" stroke-width="2"/><path d="M91 33l3-11" stroke="${ink}" stroke-width="3" stroke-linecap="round"/><circle cx="95" cy="23" r="3" fill="#ffe4f0"/>`,
  `<path d="M57 64l5-26 19 13 9-25 9 25 20-13 5 26q-31-8-67 0Z" fill="CURRENT" ${stroke}/><path d="M61 58q29-7 58 0l2 12q-30-6-62 0Z" fill="url(#ch-metal)" ${stroke}/><path d="M68 46l10 7m35-7-10 7" stroke="#fff6c8" stroke-width="3"/><path d="M90 32l6 15-6 7-6-7z" fill="url(#ch-jewel)" stroke="#fff0a8" stroke-width="2"/><circle cx="71" cy="63" r="3" fill="#6cc9cb"/><circle cx="109" cy="63" r="3" fill="#6cc9cb"/>`,
  `<path d="M56 65q-5-30 34-34 40 4 35 34l-12 12q-20-7-46 0Z" fill="CURRENT" ${stroke}/><path d="M61 61q3-20 24-24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round"/><path d="M60 65q28-11 61 0" fill="none" stroke="#83b2ce" stroke-width="4"/><ellipse cx="90" cy="56" rx="21" ry="15" fill="#53688e" stroke="#defaff" stroke-width="3"/><path d="M75 51q9-11 23-9" fill="none" stroke="white" stroke-width="3"/><circle cx="111" cy="54" r="2" fill="white"/>`
];

const garment = `<path d="M43 119q-13 15-16 47l14 3 9-22q10 1 17 7l8 8q16-5 30 0l9-8q7-6 17-7l9 22 14-3q-3-31-17-47l-20 13-27 16-27-16Z" fill="CURRENT" ${stroke}/><path d="M41 126q-9 15-10 29m108-29q9 14 11 29" fill="none" stroke="white" stroke-width="3" opacity=".65" stroke-linecap="round"/>`;
const outfits = [
  `<path d="M49 117Q23 128 14 167l30-11 9-23m78-16q26 11 35 50l-30-11-9-23" fill="CURRENT" ${stroke}/><path d="M30 145l-10 16 26-9m104-7 10 16-26-9" fill="#ffd3b8" stroke="${ink}" stroke-width="2"/>${garment}<path d="M73 143l17 21 18-21" fill="#fff5e4" ${stroke}/><path d="M90 146l5 7-5 8-5-8z" fill="url(#ch-metal)"/>`,
  `${garment}<path d="M68 136l22 19 22-19-7 27H75Z" fill="url(#ch-cream)" ${stroke}/><path d="M70 135l11 10-6 12m35-22-11 10 6 12" fill="none" stroke="#fff1d8" stroke-width="3"/><circle cx="90" cy="158" r="3" fill="#9c6074"/><path d="M122 139h13" stroke="#fff4d9" stroke-width="3"/>`,
  `${garment}<path d="M59 132l17 14 14-6 14 6 18-14" fill="none" stroke="#fff6da" stroke-width="4"/><path d="M89 143v20m-18-13-16 7m54-7 16 7" fill="none" stroke="#c9884f" stroke-width="3"/><circle cx="90" cy="153" r="3" fill="#fff7df"/><path d="M47 143l-9 13m95-13 9 13" stroke="#fff7df" stroke-width="3"/>`,
  `${garment}<path d="M69 135l21 13 21-13-8 27H77Z" fill="#d5e7fa" ${stroke}/><path d="M90 150v12m-7-8h14m-42-22 15 9m57-9-16 9" fill="none" stroke="#fff3e1" stroke-width="3"/><circle cx="90" cy="157" r="2" fill="#796181"/><path d="M40 153l14-7m86 7-14-7" stroke="#d0e5f7" stroke-width="2"/>`,
  `${garment}<path d="M54 128q36 27 72 0" fill="none" stroke="#fffef2" stroke-width="8" stroke-linecap="round"/><path d="M69 143q21 13 43 0l-6 19H75Z" fill="#d8f2f8" ${stroke}/><path d="M84 147v14m12-14v14" stroke="#7fa3bd" stroke-width="2"/><path d="M44 157l10-7m82 7-10-7" stroke="white" stroke-width="4"/>`,
  `${garment}<path d="M56 129q34 21 68 0" fill="none" stroke="#fff9ec" stroke-width="7"/><path d="M74 139l16 10 16-10-3 24H77Z" fill="url(#ch-silver)" ${stroke}/><path d="M90 150v12m-32-23-10 8m74-8 10 8" stroke="#a4b3e2" stroke-width="3"/><circle cx="90" cy="155" r="5" fill="url(#ch-jewel)" stroke="#fff" stroke-width="2"/><path d="M33 150l14-13m100 13-14-13" stroke="#fff" stroke-width="2"/>`
];
const collarBand = `<path d="M60 128q29 15 60 0l5 11q-34 17-70 0Z" fill="CURRENT" ${stroke}/><path d="M63 133q26 12 53 0" fill="none" stroke="white" opacity=".74" stroke-width="2"/>`;
const collars = [
  `${collarBand}<path d="M89 141q-19-15-25-1l21 16 5-10q6 15 13 9l16-15q-9-14-29 1Z" fill="CURRENT" ${stroke}/><path d="M90 146l-4 17 8-1 2-16" fill="#ffd2dc" ${stroke}/><circle cx="90" cy="143" r="4" fill="url(#ch-metal)"/>`,
  `${collarBand}<path d="M90 141v6" stroke="${ink}" stroke-width="3"/><circle cx="90" cy="156" r="12" fill="url(#ch-metal)" ${stroke}/><path d="M83 154l5 1 2-6 3 6 5-1-4 4 1 5-5-3-5 3 1-5z" fill="#fff9df"/>`,
  `${collarBand}<path d="M90 141v6" stroke="${ink}" stroke-width="3"/><path d="M77 153q0-10 13-10t13 10l-4 10H81z" fill="url(#ch-metal)" ${stroke}/><path d="M83 152q8-5 14 0" fill="none" stroke="#fff9d2" stroke-width="3"/><circle cx="90" cy="159" r="3" fill="${ink}"/>`,
  `${collarBand}<path d="M90 140v8" stroke="${ink}" stroke-width="3"/><path d="M90 146l11 11-11 16-11-16z" fill="url(#ch-jewel)" stroke="#e7ffff" stroke-width="3"/><path d="M86 157l4-6 4 6-4 10z" fill="#e4ffff" opacity=".72"/>`,
  `${collarBand}<path d="M59 140q31 15 62 0" fill="none" stroke="#fff2e4" stroke-width="2"/>${star(90,154,12,'CURRENT')}${star(68,145,4,'#fff9e9')}${star(111,145,4,'#fff9e9')}<circle cx="90" cy="154" r="3" fill="#fff"/>`,
  `${collarBand}<path d="M61 135l11 11 9-7 9 13 9-13 9 7 11-11" fill="CURRENT" ${stroke}/><path d="M69 138l5 5m42-5-6 5" stroke="#fff1da" stroke-width="2"/><path d="M90 144l9 10-9 12-9-12z" fill="url(#ch-jewel)" stroke="#fff4db" stroke-width="2"/>`
];
const effects = [
  [ [20,81], [31,44], [151,38], [163,89], [16,147], [153,147] ].map(([x,y],j)=>`${star(x,y,5+j%2*2,'CURRENT')}<circle cx="${x+10}" cy="${y+9}" r="2" fill="#fffaf1"/>`).join(''),
  `<path d="M25 129Q1 86 34 46m112-3q32 43 9 87M32 158q59 34 116-1" fill="none" stroke="CURRENT" stroke-width="6" stroke-linecap="round"/><path d="M24 99Q16 63 38 44m116 62q11-33-10-63" fill="none" stroke="#fff0ff" stroke-width="2.5" stroke-linecap="round"/>${star(22,76,6,'#fff2fd')}${star(155,82,5,'#fff2fd')}`,
  [[21,59,-24],[37,25,19],[150,48,32],[163,115,-13],[20,140,26],[143,156,44]].map(([x,y,a])=>`<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 0q-12-14-8-20Q1-22 0-10q1-12 9-10Q13-12 0 0Z" fill="CURRENT" stroke="${ink}" stroke-width="1.7"/><path d="M-2-16q-4 5 0 10" fill="none" stroke="#fff" stroke-width="2"/></g>`).join(''),
  [[21,65],[145,39],[161,116],[24,143]].map(([x,y])=>`<g transform="translate(${x} ${y})"><path d="M-11 0h22M0-11v22m-8-8 16 16m0-16-16 16" stroke="CURRENT" stroke-width="3.3" stroke-linecap="round"/><circle r="3.5" fill="#fff"/></g>`).join(''),
  `<path d="M14 150q20-57 36-54m116 54q-19-54-36-53" fill="none" stroke="CURRENT" stroke-width="6" stroke-linecap="round"/>${[[35,95],[147,84],[20,147],[156,149]].map(([x,y],i)=>`${star(x,y,6+i%2*3,'#fff7dc')}<path d="M${x-13} ${y+17}l8-11" stroke="CURRENT" stroke-width="3" stroke-linecap="round"/>`).join('')}`,
  `<path d="M15 129Q6 20 90 22q85 0 74 107" fill="none" stroke="#f58d9e" stroke-width="6"/><path d="M20 130Q13 31 90 33q78 0 70 97" fill="none" stroke="#ffc470" stroke-width="6"/><path d="M26 130Q20 43 90 44q71 0 64 86" fill="none" stroke="#f9eb89" stroke-width="6"/><path d="M31 130Q27 54 90 54q64 0 59 76" fill="none" stroke="#88d7b1" stroke-width="6"/><path d="M38 130Q35 64 90 64q55 0 52 66" fill="none" stroke="#86c4ef" stroke-width="6"/><path d="M43 130Q43 73 90 73q48 0 46 57" fill="none" stroke="CURRENT" stroke-width="5"/>${star(18,129,8,'#fff5e6')}${star(162,129,8,'#fff5e6')}`
];
const slots = ['hat', 'outfit', 'collar', 'effect'];
for (let slot = 0; slot < slots.length; slot++) {
  const items = COSMETICS.filter(item => item.slot === slots[slot]);
  for (let i = 0; i < 6; i++) {
    const name = `cosmetic-${slots[slot]}-${i+1}`;
    const color = items[i].color;
    const gradient = `ch-${slots[slot]}-${i+1}`;
    const defs = `<defs><linearGradient id="${gradient}" x1=".05" y1="0" x2=".8" y2="1"><stop stop-color="#fffef4"/><stop offset=".28" stop-color="${color}"/><stop offset=".74" stop-color="${color}"/><stop offset="1" stop-color="${ink}"/></linearGradient></defs>`;
    const shape = [hatShapes, outfits, collars, effects][slot][i].replaceAll('CURRENT', `url(#${gradient})`);
    put(name, svg(180, 180, `${characterDefs}${defs}<g filter="url(#drop)">${shape}</g>`));
  }
}
export default art;
