import { svg } from './common.mjs';
const art = new Map();
const put = (name, content) => art.set(name, content);
// Backdrops are composed in depth order. Scene-specific defs use a world prefix
// because the title illustration embeds a backdrop alongside other SVG assets.
const scenes = [
  { sky: ['#171634', '#63345c', '#dc7892', '#f6ad8c'], haze: '#eea6aa', far: '#9b799a', middle: '#564871', near: '#34314f', ground: '#333552', glow: '#ffd1b0', sun: [673, 115, 31] },
  { sky: ['#514071', '#b57388', '#f0a982', '#ffdfae'], haze: '#ffe4bd', far: '#cba2a1', middle: '#a17586', near: '#775870', ground: '#876b79', glow: '#ffe1a1', sun: [636, 93, 49] },
  { sky: ['#5ca8d2', '#8cd2e7', '#cfebea', '#f8e5ba'], haze: '#e0f3ec', far: '#9ac2ce', middle: '#659bad', near: '#446f8d', ground: '#5394aa', glow: '#fff3b8', sun: [679, 93, 49] },
  { sky: ['#6fa6a2', '#c5c68d', '#f6d58d', '#ffe9ad'], haze: '#ffe8af', far: '#e7bc7b', middle: '#c99a66', near: '#9e755a', ground: '#b88a62', glow: '#fff4b9', sun: [688, 102, 55] },
  { sky: ['#174c74', '#488ea4', '#97c9d1', '#d6eced'], haze: '#e1f6ee', far: '#a8d4df', middle: '#83b6cd', near: '#538fae', ground: '#99cbd8', glow: '#e9fbf4', sun: [705, 94, 43] },
  { sky: ['#10132f', '#272b58', '#544e81', '#817ca4'], haze: '#a7a0b9', far: '#8783ab', middle: '#66648c', near: '#4d4c74', ground: '#76748f', glow: '#b9ddff', sun: [804, 94, 51] },
];

const gradient = (id, stops, radial = false) =>
  `<${radial ? 'radial' : 'linear'}Gradient id="${id}" ${radial === 'glow' ? 'cx="50%" cy="50%" r="50%"' : radial ? 'cx="32%" cy="21%" r="80%"' : 'x1="0" y1="0" x2="0" y2="1"'}>${stops.map(([offset, color, opacity]) => `<stop offset="${offset}" stop-color="${color}"${opacity == null ? '' : ` stop-opacity="${opacity}"`}/>`).join('')}</${radial ? 'radial' : 'linear'}Gradient>`;
const ref = (n, name) => `url(#w${n}-${name})`;
const sparkle = (x, y, r, color = '#fff5d0') =>
  `<path d="M${x} ${y-r}Q${x+1} ${y-1} ${x+r} ${y}Q${x+1} ${y+1} ${x} ${y+r}Q${x-1} ${y+1} ${x-r} ${y}Q${x-1} ${y-1} ${x} ${y-r}Z" fill="${color}" opacity=".88"/>`;
const clouds = (tint, opacity) => [0, 1, 2, 3, 4].map((i) => {
  const x = -40 + i * 238, y = 54 + (i * 47) % 87, scale = .65 + (i % 3) * .15;
  return `<path d="M${x} ${y}q31-14 67-4 18-22 46-10 23-7 46 13 28-3 42 11-54 14-105 6-51 3-96-16Z" fill="${tint}" opacity="${opacity}" transform="translate(${x * (1 - scale)} ${y * (1 - scale)}) scale(${scale})"/>`;
}).join('');
const distantCity = (n, base = 345) => `<path d="M0 ${base}v-48h28v-31h16v17h13v-27h32v41h13v-21h21v-32h32v34h15v-16h22v-29h39v44h25v-35h30v-26h22v30h34v26h31v-35h21v20h27v-23h28v38h18v-28h31v-20h28v35h27v-25h30v-32h25v40h24v-24h30v-28h35v42h21v-21h36v-28h24v34h34v-20h31v32h24v-40h40v51h20v-28h45v55Z" fill="${ref(n,'far')}" opacity=".63"/>`;
const windows = (n, x, y, w, h, color = '#ffe4ac') => {
  const cols = Math.max(1, Math.floor((w - 13) / 15));
  const rows = Math.max(1, Math.floor((h - 23) / 19));
  return Array.from({length: cols * rows}, (_, i) => {
    const col = i % cols, row = Math.floor(i / cols), lit = (col * 7 + row * 11 + n * 3 + x) % 9;
    const wx = x + 9 + col * ((w - 18) / cols), wy = y - h + 13 + row * 19;
    if (lit === 2 || lit === 6) return '';
    return `<rect x="${wx.toFixed(1)}" y="${wy}" width="${lit === 1 ? 3.5 : 5}" height="${lit === 4 ? 7 : 9}" rx="1" fill="${lit < 3 ? '#b7d8d9' : color}" opacity="${lit === 0 ? '.4' : lit === 8 ? '.98' : '.68'}"/>`;
  }).join('');
};
const towerBlock = (n, x, base, w, h, roof = 'flat', light = '#ffddac') => {
  const y = base - h;
  const top = roof === 'gable' ? `<path d="M${x-5} ${y}l${w/2+5} -${Math.min(26,w/4)} ${w/2+5} ${Math.min(26,w/4)}Z" fill="${ref(n, 'roof')}" stroke="${ref(n, 'edge')}" stroke-width="2"/>`
    : roof === 'spire' ? `<path d="M${x+w/2-4} ${y}l4-30 4 30Z" fill="${ref(n, 'edge')}"/><path d="M${x+5} ${y}v-10h${w-10}v10" fill="${ref(n, 'roof')}"/>`
    : `<path d="M${x-5} ${y}h${w+10}v7h-${w+10}Z" fill="${ref(n, 'roof')}"/>`;
  return `<g>${top}<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${ref(n, 'facade')}"/>
    <path d="M${x+3} ${y+8}v${h-10}" stroke="${ref(n, 'edge')}" stroke-width="4" opacity=".76"/>
    <path d="M${x+w-10} ${y+8}v${h-9}h10V${y+8}" fill="${ref(n, 'roof')}" opacity=".34"/>
    ${windows(n,x,base,w,h,light)}
    <path d="M${x} ${base-23}h${w}" stroke="${ref(n, 'edge')}" stroke-width="3" opacity=".55"/></g>`;
};
const cityForeground = (n, config) => {
  const {near, middle} = config;
  const blocks = n === 0
    ? [[-9,402,95,167,'spire'],[103,405,91,227,'flat'],[206,404,83,182,'flat'],[688,404,94,203,'flat'],[792,404,82,249,'spire'],[883,407,89,178,'flat']]
    : n === 1
      ? [[-10,405,113,153,'gable'],[103,405,99,189,'gable'],[203,408,94,135,'gable'],[680,410,100,139,'gable'],[781,407,91,205,'gable'],[870,407,99,168,'gable']]
      : [[-9,408,111,185,'flat'],[106,406,96,260,'spire'],[206,407,91,214,'flat'],[689,407,89,176,'flat'],[778,410,95,290,'spire'],[874,410,96,218,'flat']];
  return `<path d="M0 360q81-20 173-9t162-9 170 10 190-4 265 13v80H0Z" fill="${middle}" opacity=".69"/>
    ${blocks.map(([x,base,w,h,roof])=>towerBlock(n,x,base,w,h,roof,n===0?'#ffcf9a':n===1?'#ffe0b0':'#f9e7b3')).join('')}
    <path d="M0 401q170-12 324 8t331-5 305 3v38H0Z" fill="${near}" opacity=".63"/>`;
};

function tokyo(n) {
  const tower = `<g stroke-linejoin="round" stroke-linecap="round">
    <path d="M85 349 125 112l7-54 9 54 45 237Z" fill="${ref(n,'tower')}" stroke="#523650" stroke-width="3"/>
    <path d="M85 349 125 112l7-54v291Z" fill="#fff0bb" opacity=".27"/>
    <path d="M128 46v-31m-7 102h25m-48 114h75m-88 69h97" fill="none" stroke="#f9bec0" stroke-width="5"/>
    <path d="M108 220h49l-4-15h-42Zm-11 68h71l-4-14h-63Z" fill="#f8d3ca" stroke="#774367" stroke-width="3"/>
    <path d="M103 333 154 153m-61 180 58-137m23 137-45-155" fill="none" stroke="#f6b0a9" stroke-width="3" opacity=".82"/>
    <path d="M126 59h12M114 136h39" stroke="#fff5d8" stroke-width="3"/>
    <circle cx="132" cy="17" r="4" fill="#fff0bd"/></g>`;
  const signs = `<g stroke-linejoin="round">
    <rect x="18" y="247" width="37" height="79" rx="4" fill="#9e366c" stroke="#f38bb8" stroke-width="3"/>
    <path d="M26 263h22m-22 13h20m-19 13h17m-17 14h21" stroke="#fff0ba" stroke-width="3.5" stroke-linecap="round"/>
    <rect x="198" y="262" width="42" height="67" rx="5" fill="#284b75" stroke="#65d9ec" stroke-width="3"/>
    <circle cx="219" cy="281" r="9" fill="none" stroke="#ffdaad" stroke-width="2.5"/><path d="M208 308h22" stroke="#77f4f0" stroke-width="3"/>
    <rect x="872" y="201" width="48" height="92" rx="4" fill="#753d70" stroke="#ffabc0" stroke-width="3"/>
    <path d="M882 224h29m-29 13h29m-23 12h16m-21 15h24" stroke="#ffd5a4" stroke-width="4" stroke-linecap="round"/>
    <path d="M15 263h37m148 9h39m635-60h44" stroke="#ffc4ec" stroke-width="3" opacity=".73"/></g>`;
  return `<path d="M0 275q125-41 290-11t339-16 331 17v100H0Z" fill="${ref(n,'haze')}" opacity=".35"/>
    ${distantCity(n,329)}${cityForeground(n,scenes[n])}${tower}
    <path d="M716 320 780 121l8-44 8 44 54 199Z" fill="${ref(n,'tower')}" stroke="#4e3352" stroke-width="3"/>
    <path d="M716 320 780 121l8-44v243Z" fill="#ffe1af" opacity=".34"/>
    <path d="M746 248h80m-65-49h49m-38-45h30M735 284h102" stroke="#ffc2ae" stroke-width="5" fill="none"/>
    <path d="m735 296 67-151m-40 142 48-97m19 103-57-139" stroke="#e9979e" stroke-width="3" opacity=".8"/>
    <circle cx="788" cy="72" r="4" fill="#ffeebf"/>
    ${signs}
    <path d="M0 420q174-16 300 4t328-4 332 4v116H0" fill="${ref(n,'ground')}"/>
    <path d="M0 438q150-15 302 3t335-9 323 5" fill="none" stroke="#b3769d" opacity=".5" stroke-width="6"/>
    <path d="M0 480q157-22 314 9t314-8 332 2v57H0" fill="#2c3453" opacity=".75"/>
    ${Array.from({length:22},(_,i)=>`<path d="M${(i*137+25)%960} ${460+i%4*17}h${5+i%5*4}" stroke="${i%3===0?'#faacaf':'#83cadb'}" stroke-width="2.5" opacity=".34"/>`).join('')}`;
}

function paris(n) {
  const eiffel = `<g stroke-linejoin="round" stroke-linecap="round">
    <path d="M726 371q48-39 69-181l17-80 17 80q21 142 73 181h-49q-29-31-41-86-13 55-43 86Z" fill="${ref(n,'tower')}" stroke="#825772" stroke-width="4"/>
    <path d="M812 116q-24 188-66 246" stroke="#ffe6bc" stroke-width="5" opacity=".72" fill="none"/>
    <path d="M812 116q25 171 68 246" stroke="#734969" stroke-width="6" opacity=".44" fill="none"/>
    <path d="M752 308h119m-99-63h80m-56-74h32M741 356h143M812 110V68m-11 26h22" stroke="#ecc5a9" stroke-width="7" fill="none"/>
    <path d="M783 307l44 49m14-49-43 49m-8-111 46 63m-29-133 23 68" stroke="#ffe4b8" stroke-width="3.5" opacity=".8" fill="none"/>
    <path d="M788 366q23-46 49 0" fill="none" stroke="#553a60" stroke-width="9"/>
    <circle cx="812" cy="65" r="4" fill="#fff3cd"/></g>`;
  const balconies = [15,111,211,685,786,876].map((x,i)=>`<path d="M${x} ${302+i%2*12}h82m-82 24h82" stroke="#fbd0ac" stroke-width="3" opacity=".48"/><path d="M${x+10} ${307+i%2*12}v13m16-13v13m16-13v13m17-13v13" stroke="#f9d7b9" stroke-width="2" opacity=".58"/>`).join('');
  return `<path d="M0 292q98-13 189 7t165-10 181 8 219-17 206 17v67H0" fill="${ref(n,'haze')}" opacity=".51"/>
    ${distantCity(n,343)}
    <path d="M82 361q65-33 140-14 80-46 164-14 83-33 160 5 57-29 112-10v79H82Z" fill="#ae8b9b" opacity=".58"/>
    <path d="M180 342v-108h45v108m-56-108h67l-33-33Zm13-18h43" fill="${ref(n,'facade')}" stroke="#f4c5aa" stroke-width="3"/>
    <path d="M193 202v-20m-11 54h44m-26-35h9" stroke="#ffe2b6" stroke-width="3" fill="none"/>
    ${cityForeground(n,scenes[n])}${eiffel}${balconies}
    <path d="M0 411q162-17 288 5t310-11 362 10v125H0" fill="${ref(n,'ground')}"/>
    <path d="M0 434q197-19 316 5t290-12 354 9" fill="none" stroke="#fff0d0" stroke-width="7" opacity=".45"/>
    <path d="M0 480q184-20 323 11t332-11 305 0v60H0" fill="#765c79" opacity=".46"/>
    ${Array.from({length:14},(_,i)=>`<path d="M${(i*193+22)%950} ${463+(i*17)%62}q8-4 18 0" stroke="#f8d7bc" opacity=".33" stroke-width="2.5" fill="none"/>`).join('')}
    <path d="M13 432q14-23 29 0m901-4q-13-25-29 0" fill="none" stroke="#dfa6a5" stroke-width="7" opacity=".72"/>`;
}

function newYork(n) {
  const liberty = `<g stroke-linejoin="round" stroke-linecap="round">
    <path d="M48 374h132v-20H48Zm18-22h96v-22H66Z" fill="${ref(n,'roof')}" stroke="#e6e1c8" stroke-width="3"/>
    <path d="M93 330 84 240l15-13 17 9 10 94Z" fill="${ref(n,'statue')}" stroke="#447d82" stroke-width="3"/>
    <path d="m91 245-23-13-10-51-11-4 8-6 14 6 18 49m29 12 32-28 12 6-9 10-24 39" fill="${ref(n,'statue')}" stroke="#447d82" stroke-width="3"/>
    <path d="M76 219h44l-8-23-24-3Z" fill="#89d3b8" stroke="#497e87" stroke-width="2"/>
    <path d="m80 198-8-17m18 11-4-24m15 24 3-25m8 29 11-21" stroke="#aee8c9" stroke-width="5"/>
    <path d="M84 241q12 3 17 85M57 180l9 2-1 17-7-2Z" stroke="#dcf4cf" stroke-width="3" fill="none"/>
    <path d="m53 169 8-23 10 23Z" fill="#ffdb85"/><circle cx="62" cy="162" r="9" fill="${ref(n,'sunGlow')}" opacity=".55"/>
    <path d="M88 202q14-7 23 0" stroke="#e3e7c4" stroke-width="2.5" fill="none"/></g>`;
  const empire = `<g stroke-linejoin="round">
    <path d="M750 379V220h23v-53h17v-30h15V81h14v56h15v30h19v53h22v159Z" fill="${ref(n,'tower')}" stroke="#446d87" stroke-width="3"/>
    <path d="M757 225h19v-54h18v-32h14V85" fill="none" stroke="#d9e9dd" stroke-width="4" opacity=".74"/>
    <path d="M747 224h131m-108-56h85m-62-31h42m-20-57V46" stroke="#e0f4e8" stroke-width="4" fill="none"/>
    <path d="M808 44h14m-4-18v20" stroke="#dbeee8" stroke-width="3"/>
    ${windows(n,758,378,111,144,'#fff2c9')}</g>`;
  return `<path d="M0 302q144-25 275-2t253 0 209-18 223 19v67H0" fill="${ref(n,'haze')}" opacity=".53"/>
    ${distantCity(n,338)}${cityForeground(n,scenes[n])}${liberty}${empire}
    <path d="M0 406q148-11 288 7t275-9 397 5v131H0Z" fill="${ref(n,'ground')}"/>
    <path d="M0 427q144-9 306 4t319-11 335 7" fill="none" stroke="#e5f6de" opacity=".61" stroke-width="5"/>
    <path d="M0 469q161-20 306 2t316-13 338 11v71H0Z" fill="#447d9d" opacity=".65"/>
    ${Array.from({length:26},(_,i)=>`<path d="M${(i*181+42)%950} ${451+(i*31)%83}q${8+i%3*5}-3 ${19+i%4*6} 0" stroke="${i%4===0?'#cae9d7':'#98d2db'}" stroke-width="${i%3===0?3:2}" opacity=".55" fill="none"/>`).join('')}
    <path d="M7 414h273m394 0h284" stroke="#bad8d1" stroke-width="4" opacity=".65"/>`;
}

function cairo(n) {
  const pyramid = (x, y, w, h, color) => `<g stroke-linejoin="round">
    <path d="M${x} ${y} ${x+w/2} ${y-h} ${x+w} ${y}Z" fill="${ref(n,color)}" stroke="#b48159" stroke-width="2"/>
    <path d="M${x+w/2} ${y-h} ${x+w} ${y}H${x+w*.56}Z" fill="#9c7259" opacity=".26"/>
    <path d="M${x+w/2} ${y-h} ${x+12} ${y-12}" stroke="#fff0b9" stroke-width="6" opacity=".8"/>
    ${[.3,.48,.67,.83].map((k,i)=>`<path d="M${x+w/2-w*k/2} ${y-h*(1-k)}h${w*k}" stroke="${i%2?'#fce0a6':'#a87655'}" stroke-width="${i%2?2:2.5}" opacity=".52"/>`).join('')}
    <path d="M${x+w*.15} ${y-12}l9-3m${w*.39} -7 13-2m${w*.17} -24 9-3" stroke="#fff2bc" stroke-width="3" opacity=".52" fill="none"/></g>`;
  const palm = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" stroke-linecap="round">
    <path d="M0 0q-13-48-3-102" fill="none" stroke="#795744" stroke-width="12"/>
    <path d="M-7-41h13m-16-18h15m-14-17h12" stroke="#bd8b5c" stroke-width="2.8"/>
    <path d="M-3-102q-40-17-70 8 33-7 54 9M-3-102q-19-40-59-31 27 12 32 35M-3-102q27-35 61-25-26 8-42 31M-3-102q43-14 78 9-37-5-59 7M-3-102q-4-31 7-48 10 20 8 48" fill="${ref(n,'palm')}" stroke="#517257" stroke-width="3"/>
    <path d="M-6-106q-30-12-60 5m64-8q26-13 60 10" stroke="#c2ad70" stroke-width="3" fill="none" opacity=".65"/>
    <circle cx="3" cy="-96" r="4" fill="#bd9b5c"/></g>`;
  return `<path d="M0 274q138-30 279-10t300-12 381 11v110H0" fill="${ref(n,'haze')}" opacity=".45"/>
    <path d="M0 346q150-43 276-16t262-4 233-21 189 30v85H0Z" fill="${ref(n,'far')}" opacity=".65"/>
    ${pyramid(8,369,321,202,'pyramid')}${pyramid(286,372,216,146,'pyramid')}
    ${pyramid(642,378,292,196,'pyramid')}
    <path d="M0 388q157-30 284 5t271-11 405 6v65H0" fill="${ref(n,'middle')}" opacity=".64"/>
    ${palm(72,424,1.05)}${palm(905,420,1.15)}${palm(821,386,.59)}
    <path d="M0 419q172-20 314 8t328-12 318 11v114H0Z" fill="${ref(n,'ground')}"/>
    <path d="M0 440q167-17 290 3t305-9 365 10" stroke="#ffedbc" stroke-width="8" opacity=".5" fill="none"/>
    <path d="M0 478q179-25 291 4t311-12 358 9v61H0Z" fill="#a17759" opacity=".33"/>
    ${Array.from({length:21},(_,i)=>`<path d="M${(i*183+27)%945} ${451+(i*29)%83}q9-3 19-1" fill="none" stroke="${i%2?'#ffdfaa':'#8d6f59'}" stroke-width="2.5" opacity=".48"/>`).join('')}
    <path d="M330 286q80-10 146 0m55-18q80-9 138-2" stroke="#fff1c1" stroke-width="3" opacity=".45" fill="none"/>`;
}

function antarctica(n) {
  const peaks = `<path d="M0 344 71 246l53 50 74-136 77 108 74-62 78 111 80-137 80 105 70-58 79 74 66-127 98 120 80-50 60 100v80H0Z" fill="${ref(n,'mountain')}" stroke="#d4f3ee" stroke-width="3"/>
    <path d="M0 344 71 246l53 50 74-136 32 45-31 5-12 18-16-8-21 58-24-20-22 38-32-25-53 73Zm348-138 78 111 80-137 27 38-34-3-24 28-18-7-32 48-27-18Zm309 21 79 74 66-127 37 46-35 2-18 34-30-11-19 29-32-25Z" fill="#f0fffa" opacity=".86"/>
    <path d="M202 161 247 308m260-127 55 135m243-140 42 147" stroke="#f8fffd" stroke-width="5" fill="none" opacity=".82"/>
    <path d="M159 286q25-36 42-24m256 39q19-46 38-46m249 46q30-40 45-34" stroke="#6ca8c5" stroke-width="4" opacity=".56" fill="none"/>`;
  const penguin = (x,y,s) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cy="1" rx="12" ry="19" fill="#334d69"/><ellipse cx="-3" cy="2" rx="6" ry="13" fill="#eaf9f5"/><circle cx="-5" cy="-8" r="2" fill="#fff"/><path d="m-9-3-7 3 7 3" fill="#f7bb78"/><path d="M-6 18-11 23m13-5 4 5" stroke="#f2b177" stroke-width="3" stroke-linecap="round"/></g>`;
  return `<path d="M0 15q125 23 235 93T465 76 725 87 960 52" stroke="#8bf9d5" stroke-width="32" opacity=".23" fill="none"/>
    <path d="M0 16q135 45 246 79t210-19 254-11 250-18" stroke="#c6b9fd" stroke-width="13" opacity=".35" fill="none"/>
    ${clouds('#e8f9f4','.2')}
    ${Array.from({length:21},(_,i)=>sparkle((i*197+26)%954,17+(i*47)%197,i%4===0?5:2,'#f2fff4')).join('')}
    <path d="M0 348 83 269l69 45 118-133 91 125 145-149 107 147 120-124 96 107 131-81v174H0" fill="${ref(n,'far')}" opacity=".6"/>
    ${peaks}
    <path d="M0 357q169-48 290-2t294-31 376 9v95H0" fill="${ref(n,'middle')}" opacity=".72"/>
    <path d="M0 390q92 30 191 2t192 1 173-22 219 10 185-6v73H0Z" fill="#d8f7f2"/>
    <path d="M6 399q113 5 199-7t192 6 240-16 321-5m-893 45q160-19 275 1t245-10 245-11" fill="none" stroke="#a7d9e7" stroke-width="5" opacity=".74"/>
    <path d="M0 428q132-31 249-3t257-18 206 6 248-5v132H0" fill="${ref(n,'ground')}"/>
    <path d="M0 449q168-24 285 1t294-13 381-9" fill="none" stroke="#fff" stroke-width="8" opacity=".78"/>
    <path d="M0 479q158-8 304 8t274-20 382 7v66H0Z" fill="#5da5bc" opacity=".29"/>
    ${penguin(846,405,.85)}${penguin(888,417,.57)}
    ${Array.from({length:19},(_,i)=>sparkle((i*149+51)%960,447+(i*29)%81,i%5===0?4:2,'#f9ffff')).join('')}`;
}

function moon(n) {
  const earth = `<g>
    <circle cx="802" cy="105" r="72" fill="${ref(n,'sunGlow')}" opacity=".28"/>
    <circle cx="802" cy="105" r="51" fill="${ref(n,'earth')}" stroke="#d8e9ec" stroke-width="3"/>
    <path d="M780 63q23-11 41-3l-8 13 11 12-18 9-18-9-20 7 2-16Zm-23 40 14 4 13-7 14 16-10 14 14 10-8 14q-33-3-41-32Zm69-3 15-7 10 15-12 15-12-5-6 13-13-11 12-9Z" fill="#8bc2b4" opacity=".92"/>
    <path d="M765 102q16-17 32-9m17 51q13-6 16-17" fill="none" stroke="#e8fff0" stroke-width="5" opacity=".7"/>
    <path d="M809 56q38 6 44 50-4 47-43 50 30-25 29-56t-30-44" fill="#28294b" opacity=".3"/>
    <path d="M771 69q12-9 22-10" stroke="#fff" stroke-width="3" opacity=".8" fill="none"/></g>`;
  const lander = `<g stroke-linejoin="round" stroke-linecap="round">
    <path d="M757 383h112m-96-10-16 20m94-20 18 20" stroke="#d1cddc" stroke-width="6"/>
    <path d="M773 360h81l-14 24h-52Z" fill="${ref(n,'lander')}" stroke="#e4dbe7" stroke-width="3"/>
    <path d="M784 359v-37q27-34 57 0v37" fill="${ref(n,'lander')}" stroke="#e9e1e8" stroke-width="3"/>
    <path d="M788 330q25-21 49 0" stroke="#f7eacb" stroke-width="4" fill="none"/>
    <circle cx="813" cy="337" r="10" fill="#78b6cd" stroke="#f5eeda" stroke-width="3"/>
    <path d="M813 311v-27m-10 0h22m-41 67h58" stroke="#ebe1dd" stroke-width="4" fill="none"/>
    <path d="M792 373h38m-5-22h11" stroke="#fff6dd" stroke-width="3"/>
    <path d="M784 368h-18l-15 12m97-13h16l15 13" stroke="#c7bed2" stroke-width="4" fill="none"/></g>`;
  return `${Array.from({length:66},(_,i)=>{
    const x=(i*223+31)%960,y=(i*97+11)%284, r=i%9===0?3:i%5===0?1.8:1.1;
    return i%11===0?sparkle(x,y,4,'#e0d7ff'):`<circle cx="${x}" cy="${y}" r="${r}" fill="${i%4?'#e8e4fc':'#b7d7ff'}" opacity="${i%3===0?'.54':'.89'}"/>`;
  }).join('')}${earth}
    <path d="M0 350q113-103 257-30t248-19 249-30 206 46v107H0" fill="${ref(n,'far')}" opacity=".7"/>
    <path d="M0 370q168-85 283-27t216-13 271-16 190 21v97H0" fill="${ref(n,'middle')}" opacity=".8"/>
    <path d="M0 391q131-47 242-21t210 8 279-47 229 29v88H0" fill="${ref(n,'mountain')}"/>
    <path d="M0 389q119-38 204-23m290 6q163-30 237-39 90-2 173 25" stroke="#d4c9d5" stroke-width="5" opacity=".61" fill="none"/>
    <ellipse cx="130" cy="369" rx="49" ry="13" fill="#4a4b76" opacity=".46"/><ellipse cx="130" cy="365" rx="37" ry="8" fill="none" stroke="#cec3d4" stroke-width="3"/>
    <ellipse cx="671" cy="360" rx="25" ry="9" fill="#494c73" opacity=".42"/><ellipse cx="671" cy="356" rx="21" ry="5" fill="none" stroke="#c8bfd4" stroke-width="2"/>
    ${lander}
    <path d="M0 417q140-35 288-5t263-13 409 17v124H0Z" fill="${ref(n,'ground')}"/>
    <path d="M0 441q160-24 318-6t300-8 342 15" fill="none" stroke="#d2c9d7" opacity=".66" stroke-width="6"/>
    <path d="M0 478q133-15 278 8t252-9 235-5 195 7v61H0" fill="#4d4c6b" opacity=".42"/>
    ${[[122,469,28],[381,511,21],[614,470,34],[913,506,29]].map(([x,y,r])=>`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*.32}" fill="#4b4b72" opacity=".38"/><path d="M${x-r} ${y}q${r} -${r*.47} ${r*2} 0" fill="none" stroke="#d8ccd9" stroke-width="2.5" opacity=".73"/>`).join('')}
    ${Array.from({length:16},(_,i)=>`<circle cx="${(i*179+45)%950}" cy="${449+(i*37)%87}" r="${1+i%3}" fill="#ded6e4" opacity=".53"/>`).join('')}`;
}

export function world(n) {
  const config = scenes[n];
  const prefix = `w${n}-`;
  const defs = `<defs>
    ${gradient(prefix+'sky',[[0,config.sky[0]],[.34,config.sky[1]],[.7,config.sky[2]],[1,config.sky[3]]])}
    ${gradient(prefix+'sunGlow',[[0,config.glow,.85],[.38,config.glow,.4],[1,config.glow,0]],'glow')}
    ${gradient(prefix+'sun',[[0,'#fffdf0'],[.4,config.glow],[1,config.sky[2]]],true)}
    ${gradient(prefix+'haze',[[0,config.haze,0],[1,config.haze,.87]])}
    ${gradient(prefix+'far',[[0,config.haze],[1,config.far]])}
    ${gradient(prefix+'middle',[[0,config.far],[.65,config.middle],[1,config.near]])}
    ${gradient(prefix+'facade',[[0,n===0?'#9681a0':n===1?'#d5aaa8':'#a9c9ce'],[.55,config.middle],[1,config.near]])}
    ${gradient(prefix+'roof',[[0,config.middle],[1,config.near]])}
    ${gradient(prefix+'edge',[[0,'#f6e1d5'],[1,config.middle]])}
    ${gradient(prefix+'tower',[[0,n===0?'#f2b9b8':n===1?'#f6d4b8':n===2?'#c7e6dd':config.haze],[.42,config.middle],[1,config.near]])}
    ${gradient(prefix+'ground',[[0,n===5?'#aba3b5':n===4?'#e0f7f4':config.haze],[.4,config.ground],[1,config.near]])}
    ${gradient(prefix+'pyramid',[[0,'#ffe9ac'],[.54,'#dfb378'],[1,'#ad7956']])}
    ${gradient(prefix+'palm',[[0,'#c6bd78'],[.55,'#628761'],[1,'#355a59']])}
    ${gradient(prefix+'mountain',[[0,n===5?'#c1b8ce':'#f4fffa'],[.48,config.middle],[1,config.near]])}
    ${gradient(prefix+'statue',[[0,'#d4efce'],[.55,'#85c9b6'],[1,'#518b94']])}
    ${gradient(prefix+'earth',[[0,'#b9edee'],[.45,'#559ec4'],[1,'#30488e']],true)}
    ${gradient(prefix+'lander',[[0,'#fff4d7'],[.5,'#c9bfd4'],[1,'#777494']])}
  </defs>`;
  const [sx,sy,sr]=config.sun;
  const sky = `<rect width="960" height="540" fill="${ref(n,'sky')}"/>
    <ellipse cx="${sx}" cy="${sy}" rx="${n===5?137:170}" ry="${n===5?132:146}" fill="${ref(n,'sunGlow')}" opacity="${n===0?'.67':'.78'}"/>
    ${n===5?'':`<circle cx="${sx}" cy="${sy}" r="${sr}" fill="${ref(n,'sun')}" opacity="${n===0?'.91':'.96'}"/>
    <path d="M${sx-sr*.72} ${sy-sr*.52}q${sr*.56} -${sr*.48} ${sr*1.12} -${sr*.24}" stroke="#fffaf0" stroke-width="3" stroke-linecap="round" opacity=".64" fill="none"/>`}
    ${n===0?Array.from({length:29},(_,i)=>i%5===0?sparkle((i*191+18)%960,(i*103+21)%185,3.5):`<circle cx="${(i*191+18)%960}" cy="${(i*103+21)%185}" r="${i%3?1:1.5}" fill="#ffe7db" opacity=".7"/>`).join(''):''}
    ${n===5?'':clouds(n===4?'#def9f1':'#fff1dc',n===0?'.12':'.23')}
    <path d="M0 297q162-31 306-2t320-8 334 7v92H0Z" fill="${ref(n,'haze')}" opacity=".25"/>`;
  return svg(960,540,`${defs}${sky}${[tokyo,paris,newYork,cairo,antarctica,moon][n](n)}`);
}
for(let n=0;n<6;n++)put(`world-${n}`,world(n));
export default art;
