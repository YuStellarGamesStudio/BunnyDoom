import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { svg, star, inner } from './art/common.mjs';
import characterArt, { bunny, dog } from './art/characters.mjs';
import worldArt, { world } from './art/worlds.mjs';
import boardArt from './art/board.mjs';

const root = new URL('../assets/art/', import.meta.url);
mkdirSync(root, { recursive: true });
const put = (name, content) => writeFileSync(new URL(`${name}.svg`, root), content);
for (const group of [characterArt, worldArt, boardArt]) for (const [name, content] of group) put(name, content);

const titleWorld=inner(world(0));
const titleDog=inner(dog());
const titleKing=inner(bunny('normal',0));
const titleFont='font-family="Arial Rounded MT Bold,Arial,sans-serif" font-weight="900" text-anchor="middle" paint-order="stroke"';
const titleBunnies=['normal','gold','silver'].map((type,i)=>`<g transform="translate(${392+i*140} 436) scale(.86)">${inner(bunny(type))}</g>`).join('');
// English-only key art: the title screen shows it and the 1200×630 share image is rasterized from it.
const title=svg(1200,630,`<defs><radialGradient id="t-vignette" cx="50%" cy="42%" r="75%"><stop offset=".45" stop-color="#1b0f2c" stop-opacity="0"/><stop offset="1" stop-color="#1b0f2c" stop-opacity=".72"/></radialGradient><linearGradient id="t-floor" x2="0" y2="1"><stop stop-color="#2b1c47" stop-opacity="0"/><stop offset=".55" stop-color="#2b1c47" stop-opacity=".85"/><stop offset="1" stop-color="#1a1030"/></linearGradient><linearGradient id="t-word" x2="0" y2="1"><stop stop-color="#fffbe0"/><stop offset=".48" stop-color="#ffe08a"/><stop offset=".52" stop-color="#ffc766"/><stop offset="1" stop-color="#ff9a7a"/></linearGradient><linearGradient id="t-ribbon" x2="0" y2="1"><stop stop-color="#f47aa2"/><stop offset="1" stop-color="#b8386f"/></linearGradient><radialGradient id="t-spot" cx="50%" cy="50%" r="50%"><stop stop-color="#ffd7f0" stop-opacity=".42"/><stop offset="1" stop-color="#ffd7f0" stop-opacity="0"/></radialGradient><filter id="t-lift" x="-10%" y="-20%" width="120%" height="150%"><feDropShadow dx="0" dy="9" stdDeviation="7" flood-color="#12071f" flood-opacity=".6"/></filter></defs><g transform="translate(0 -38) scale(1.25)">${titleWorld}</g><rect width="1200" height="630" fill="url(#t-vignette)"/><rect y="380" width="1200" height="250" fill="url(#t-floor)"/><ellipse cx="600" cy="262" rx="360" ry="150" fill="url(#t-spot)"/><ellipse cx="236" cy="590" rx="190" ry="22" fill="#12071f" opacity=".45"/><ellipse cx="1000" cy="590" rx="180" ry="22" fill="#12071f" opacity=".45"/><ellipse cx="600" cy="596" rx="230" ry="16" fill="#12071f" opacity=".4"/><g transform="translate(32 196) scale(2.3)">${titleDog}</g><g transform="translate(812 210) scale(2.15)">${titleKing}</g>${titleBunnies}<g filter="url(#t-lift)"><text x="600" y="236" ${titleFont} font-size="118" letter-spacing="-2" fill="#3a1d4f" stroke="#3a1d4f" stroke-width="26" stroke-linejoin="round">BUNNY DOOM</text><text x="600" y="228" ${titleFont} font-size="118" letter-spacing="-2" fill="url(#t-word)" stroke="#d2457c" stroke-width="8" stroke-linejoin="round">BUNNY DOOM</text><path d="M402 164q60-18 120-8" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="6" stroke-linecap="round"/></g><g filter="url(#t-lift)"><path d="M374 262h452l-18 27 18 27H374l18-27z" fill="url(#t-ribbon)" stroke="#6e2350" stroke-width="5" stroke-linejoin="round"/><path d="M392 270h416" stroke="#ffc2d8" stroke-opacity=".6" stroke-width="3" stroke-linecap="round"/><text x="600" y="302" ${titleFont} font-size="34" letter-spacing="5" fill="#fff8e6" stroke="#6e2350" stroke-width="5">LAST POMERANIAN</text></g>${star(336,122,24)}${star(868,118,18)}${star(846,322,12)}${star(356,332,10)}`);
put('title',title);
put('app-icon',svg(512,512,`<defs><radialGradient id="i-back" cx="42%" cy="30%" r="80%"><stop stop-color="#b3558f"/><stop offset=".6" stop-color="#6d2f76"/><stop offset="1" stop-color="#3a1b52"/></radialGradient><radialGradient id="i-halo"><stop stop-color="#ffd4ea" stop-opacity=".55"/><stop offset="1" stop-color="#ffd4ea" stop-opacity="0"/></radialGradient></defs><rect width="512" height="512" rx="114" fill="url(#i-back)"/><circle cx="256" cy="250" r="214" fill="url(#i-halo)"/><circle cx="256" cy="250" r="200" fill="none" stroke="#f2789f" stroke-width="12" opacity=".85"/>${Array.from({length:6},(_,i)=>star(118+i*55,78+(i%3)*16,i%2?8:13)).join('')}<ellipse cx="256" cy="452" rx="150" ry="20" fill="#1c0b2c" opacity=".45"/><g transform="translate(12 22) scale(2.7)">${titleDog}</g>`));
// The dog and Bunny Kings are drawn from the 1024px hero atlas only; the sprite atlas holds everything else.
writeFileSync(new URL('../atlases/layout.json',root),JSON.stringify({size:[3072,2304],tile:[384,384],sprites:[...'normal gold silver fake bomb'.split(' ').map(s=>`rabbit-${s}`),'hole','rim',...'clock freeze bone magnet slap'.split(' ').map(s=>`item-${s}`),'spark','impact','flash','count-3','count-2','count-1','count-go',...['hat','outfit','collar','effect'].flatMap(s=>Array.from({length:6},(_,i)=>`cosmetic-${s}-${i+1}`))],worldSize:[5760,2160]},null,2));
// ICO supports an embedded PNG: no quantization of the shaded icon is necessary.
const faviconPng = new URL('../icons/icon-64.png', root);
if (existsSync(faviconPng)) {
  const png = readFileSync(faviconPng);
  const header = Buffer.alloc(22);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header[6] = 64;
  header[7] = 64;
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18);
  writeFileSync(new URL('../../favicon.ico', root), Buffer.concat([header, png]));
}
console.log('Generated illustrated SVGs and atlas layout');
