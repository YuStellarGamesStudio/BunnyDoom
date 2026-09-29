import { svg, star } from './common.mjs';
const art = new Map();
const put = (name, content) => art.set(name, content);
// All local paint ids are namespaced: these sprites can be inlined beside the world art.
const burrowDefs = `<defs>
<linearGradient id="bd-turf" x1=".15" y1="0" x2=".8" y2="1"><stop stop-color="#e0ed9e"/><stop offset=".32" stop-color="#92c778"/><stop offset=".78" stop-color="#59936b"/><stop offset="1" stop-color="#385d61"/></linearGradient>
<linearGradient id="bd-earth" x1=".1" y1="0" x2=".8" y2="1"><stop stop-color="#b39076"/><stop offset=".48" stop-color="#826755"/><stop offset="1" stop-color="#513e50"/></linearGradient>
<radialGradient id="bd-burrow" cx=".45" cy=".9" r=".84"><stop stop-color="#423149"/><stop offset=".52" stop-color="#292638"/><stop offset="1" stop-color="#111b2c"/></radialGradient>
<radialGradient id="bd-contact"><stop stop-color="#1a1933" stop-opacity=".48"/><stop offset="1" stop-color="#1a1933" stop-opacity="0"/></radialGradient>
</defs>`;
const grass = (x,y,s=1) => `<path d="M${x-7*s} ${y}q${3*s} ${-5*s} ${5*s} ${-10*s}l${2*s} ${8*s}q${2*s} ${-12*s} ${7*s} ${-15*s}l${-2*s} ${14*s}q${4*s} ${-6*s} ${8*s} ${-7*s}l${-4*s} ${10*s}" fill="none" stroke="#c6df8b" stroke-width="${2*s}" stroke-linecap="round" stroke-linejoin="round"/>`;
put('hole',svg(180,180,`${burrowDefs}
<ellipse cx="90" cy="111" rx="88" ry="44" fill="url(#bd-contact)"/>
<ellipse cx="90" cy="96" rx="84" ry="41" fill="url(#bd-earth)" stroke="#5a3a55" stroke-width="3.5"/>
<path d="M9 94C18 45 153 43 171 94c-15 30-52 38-81 38S24 123 9 94Z" fill="url(#bd-turf)" stroke="#5a3a55" stroke-width="3.5" stroke-linejoin="round"/>
<path d="M19 82C37 52 130 47 158 77" fill="none" stroke="#eff4b1" stroke-width="4" opacity=".8" stroke-linecap="round"/>
<ellipse cx="90" cy="90" rx="73" ry="29" fill="url(#bd-burrow)" stroke="#524154" stroke-width="3.5"/>
<path d="M21 83C36 52 143 51 159 84" fill="none" stroke="#172533" opacity=".62" stroke-width="8" stroke-linecap="round"/>
<path d="M27 73C50 55 126 52 151 71" fill="none" stroke="#e4eaa6" stroke-width="3" opacity=".76" stroke-linecap="round"/>
<path d="M51 75q39-13 75-3" fill="none" stroke="#b1ad95" stroke-width="2.5" opacity=".32" stroke-linecap="round"/>
${grass(23,83,.8)}${grass(147,80,.9)}${grass(42,62,.55)}
<ellipse cx="32" cy="109" rx="5" ry="2.8" fill="#dac7a0" stroke="#725865" stroke-width="1.5"/>
<ellipse cx="154" cy="107" rx="4.5" ry="2.6" fill="#d7c5a7" stroke="#725865" stroke-width="1.5"/>`));
put('rim',svg(180,180,`${burrowDefs}
<path d="M17 89C33 105 59 112 90 112s57-7 73-23l9 12c-12 32-43 43-82 43S19 133 8 101Z" fill="url(#bd-earth)" stroke="#5a3a55" stroke-width="3.5" stroke-linejoin="round"/>
<path d="M16 89C30 102 56 112 90 112s61-10 74-23l6 11c-15 25-44 35-80 35s-66-10-80-35Z" fill="url(#bd-turf)" stroke="#5a3a55" stroke-width="3" stroke-linejoin="round"/>
<path d="M24 97C43 109 68 116 90 116c29 0 56-8 67-19" fill="none" stroke="#eff5af" stroke-width="4" opacity=".85" stroke-linecap="round"/>
<path d="M40 126q41 16 90 1" fill="none" stroke="#3b5f5d" opacity=".5" stroke-width="2.5" stroke-linecap="round"/>
${grass(27,109,.85)}${grass(62,126,.8)}${grass(136,121,.8)}${grass(157,103,.7)}
<ellipse cx="51" cy="135" rx="4.8" ry="2.6" fill="#d9c8a8" stroke="#725865" stroke-width="1.4"/>
<ellipse cx="119" cy="137" rx="3.8" ry="2" fill="#d9c8a8" stroke="#725865" stroke-width="1.3"/>`));

const stageDefs = `<defs>
<linearGradient id="bd-lawn" x1=".1" y1="0" x2=".87" y2="1"><stop stop-color="#d2e99b"/><stop offset=".23" stop-color="#98ca7a"/><stop offset=".63" stop-color="#71af70"/><stop offset="1" stop-color="#4c866b"/></linearGradient>
<linearGradient id="bd-stage-soil" x1=".15" y1="0" x2=".8" y2="1"><stop stop-color="#b89072"/><stop offset=".48" stop-color="#816452"/><stop offset="1" stop-color="#443747"/></linearGradient>
<radialGradient id="bd-stage-light" cx=".2" cy=".1" r=".93"><stop stop-color="#fff5bf" stop-opacity=".32"/><stop offset=".55" stop-color="#d1efa3" stop-opacity=".06"/><stop offset="1" stop-color="#344951" stop-opacity=".21"/></radialGradient>
<linearGradient id="bd-pebble" x1=".1" y1=".1" x2=".8" y2="1"><stop stop-color="#eee4c1"/><stop offset=".5" stop-color="#b8b5a0"/><stop offset="1" stop-color="#696e74"/></linearGradient>
<pattern id="bd-blades" width="39" height="36" patternUnits="userSpaceOnUse"><path d="m4 13 2-5 2 5m19 19 3-7 2 6M15 31l1-5 3 4" fill="none" stroke="#e2eca8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity=".44"/><path d="m25 9 2-4m-9 14 2-4" fill="none" stroke="#366f63" stroke-width="1.2" opacity=".25" stroke-linecap="round"/><circle cx="36" cy="17" r="1.2" fill="#ecf4ba" opacity=".45"/></pattern>
<clipPath id="bd-field-clip"><path d="M217 100Q477 66 739 100L768 469Q490 524 190 469Z"/></clipPath>
</defs>`;
const flower = (x,y,c) => `<g transform="translate(${x} ${y})"><path d="M0 1v10m0-5-5-3m5 4 4-4" fill="none" stroke="#467a62" stroke-width="2" stroke-linecap="round"/><g fill="${c}" stroke="#8a6577" stroke-width=".8"><circle cx="-4" cy="-2" r="3"/><circle cx="4" cy="-2" r="3"/><circle cy="-6" r="3"/><circle cy="2" r="3"/></g><circle cy="-2" r="2.5" fill="#ffe9a0"/></g>`;
const pebble = (x,y,s=1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cy="4" rx="10" ry="3" fill="#394a4d" opacity=".25"/><path d="M-9 2q1-9 9-9 8 0 10 9Q1 7-9 2Z" fill="url(#bd-pebble)" stroke="#6e5a62" stroke-width="1.5"/><path d="M-5-1q3-5 8-4" fill="none" stroke="#fff7d7" stroke-width="1.5" stroke-linecap="round" opacity=".85"/></g>`;
put('stage',svg(960,540,`${stageDefs}
<ellipse cx="479" cy="498" rx="311" ry="36" fill="#1a1833" opacity=".3" filter="url(#soft)"/>
<path d="M217 110Q475 76 739 110l30 380Q479 545 189 490Z" fill="url(#bd-stage-soil)" stroke="#4f3b50" stroke-width="5" stroke-linejoin="round"/>
<path d="M189 481Q480 535 769 481v9Q479 545 189 490Z" fill="#483b4b" opacity=".55"/>
<path d="M217 100Q477 66 739 100L768 469Q490 524 190 469Z" fill="url(#bd-lawn)" stroke="#5a3a55" stroke-width="4" stroke-linejoin="round"/>
<g clip-path="url(#bd-field-clip)"><path d="M217 100Q477 66 739 100L768 469Q490 524 190 469Z" fill="url(#bd-blades)"/><path d="M217 100Q477 66 739 100L768 469Q490 524 190 469Z" fill="url(#bd-stage-light)"/><path d="M223 111Q478 78 734 111" fill="none" stroke="#eff3b1" stroke-width="5" opacity=".8"/><path d="M200 463Q487 515 755 463" fill="none" stroke="#d5e5a0" stroke-width="4" opacity=".65"/></g>
<path d="M217 100Q477 66 739 100L768 469Q490 524 190 469Z" fill="none" stroke="#b7d498" stroke-width="2" opacity=".7"/>
<g clip-path="url(#bd-field-clip)">
${flower(205,223,'#ffd6d6')}${flower(751,224,'#ffddab')}${flower(204,354,'#ffe3b5')}${flower(750,359,'#ffcadb')}${flower(400,101,'#ffd2d3')}${flower(582,98,'#ffdbb6')}
${pebble(221,165,.68)}${pebble(727,278,.78)}${pebble(214,432,.8)}${pebble(737,446,.72)}
${grass(241,106,.85)}${grass(706,101,.8)}${grass(205,284,.8)}${grass(754,406,.85)}${grass(281,486,.95)}${grass(670,487,.85)}</g>
<path d="M202 480q137 32 281 30" fill="none" stroke="#d1ab85" stroke-width="3" opacity=".45" stroke-linecap="round"/>
`));

const pickupDefs = `<defs>
<radialGradient id="bd-badge" cx=".3" cy=".18" r=".88"><stop stop-color="#fffdf1"/><stop offset=".52" stop-color="#ffe8ab"/><stop offset=".83" stop-color="#e8ad89"/><stop offset="1" stop-color="#9e6880"/></radialGradient>
<linearGradient id="bd-blue" x1=".18" y1=".1" x2=".83" y2="1"><stop stop-color="#f2ffff"/><stop offset=".45" stop-color="#8be2ee"/><stop offset="1" stop-color="#397dba"/></linearGradient>
<linearGradient id="bd-red" x1=".1" y1="0" x2=".8" y2="1"><stop stop-color="#ffabb0"/><stop offset=".42" stop-color="#f46478"/><stop offset="1" stop-color="#a6346d"/></linearGradient>
<linearGradient id="bd-bone" x1=".2" y1="0" x2=".8" y2="1"><stop stop-color="#fffefa"/><stop offset=".5" stop-color="#fff4d2"/><stop offset="1" stop-color="#d9a699"/></linearGradient>
</defs>`;
const itemIcons = {
clock:`<path d="M73 35h34m-17 0v12m40 4 9-9" fill="none" stroke="#6e4a5e" stroke-width="8" stroke-linecap="round"/><circle cx="90" cy="97" r="51" fill="url(#gold)" stroke="#6e4a5e" stroke-width="5"/><circle cx="90" cy="97" r="42" fill="url(#silver)" stroke="#af8390" stroke-width="2.5"/><circle cx="90" cy="97" r="34" fill="#fffdf1" opacity=".7"/><path d="M90 66v7m30 24h-7m-23 30v-7m-30-23h7" fill="none" stroke="#7b6980" stroke-width="3" stroke-linecap="round"/><path d="M90 72v26l19 15" fill="none" stroke="#5a3a55" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="90" cy="97" r="5" fill="#ef7992"/><path d="M59 78q12-22 34-24" fill="none" stroke="#fff" stroke-width="4" opacity=".85" stroke-linecap="round"/>`,
freeze:`<circle cx="90" cy="90" r="49" fill="url(#bd-blue)" stroke="#5a3a55" stroke-width="5"/><circle cx="90" cy="90" r="40" fill="#e7ffff" opacity=".45"/><g fill="none" stroke="#317bac" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M90 53v74M58 71l64 38m0-38-64 38"/></g><g fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"><path d="m81 61 9 8 9-8m-18 58 9-8 9 8M65 68l1 12-10 3m58-3-1-12 10 3m-67 27 10 2-1 12m58-14-10 2 1 12"/></g><circle cx="90" cy="90" r="8" fill="url(#silver)" stroke="#397dba" stroke-width="2"/>`,
bone:`<g transform="rotate(-28 90 90)"><path d="M49 65c-13-12-28-5-27 9 0 8 6 14 14 16-9 8-7 19 2 24 10 6 19 0 25-8h53c6 8 16 14 26 8 9-5 11-16 2-24 8-2 14-8 14-16 1-14-14-21-27-9-3 3-5 8-7 12H56c-2-4-4-9-7-12Z" fill="url(#bd-bone)" stroke="#6e4a5e" stroke-width="5" stroke-linejoin="round"/><path d="M57 82h64M45 74q-9-8-15 2m110-2q9-8 15 2" fill="none" stroke="#fff" stroke-width="4" opacity=".85" stroke-linecap="round"/><path d="M58 99h64" stroke="#b7878b" opacity=".5" stroke-width="2" stroke-linecap="round"/></g>`,
magnet:`<path d="M37 55v42c0 32 20 51 53 51s53-19 53-51V55h-30v42c0 15-7 23-23 23s-23-8-23-23V55Z" fill="url(#bd-red)" stroke="#5a3a55" stroke-width="5" stroke-linejoin="round"/><path d="M37 55h30v23H37Zm76 0h30v23h-30Z" fill="url(#bd-blue)" stroke="#5a3a55" stroke-width="4" stroke-linejoin="round"/><path d="M47 89v12q1 32 35 35M48 62h12m63 0h11" fill="none" stroke="#ffe9d4" stroke-width="4" opacity=".8" stroke-linecap="round"/>${star(89,91,12,'#fff9c9')}`,
slap:`<path d="M49 101 35 83q-12-16-20-6-6 8 3 21l33 47q18 20 49 18 30-3 45-28l22-48q7-15-4-20-11-5-18 10l-7 14 8-37q3-15-9-18-10-3-15 11l-8 32V38q0-16-12-16T90 38v41L83 48q-3-16-15-14-12 2-9 18l8 38-17-28q-8-13-18-6-10 6-1 20Z" fill="url(#fur)" stroke="#6e4a5e" stroke-width="5" stroke-linejoin="round"/><path d="M52 116q18-17 36-2m4-65v43m29-35-7 40m-44-37 8 37" fill="none" stroke="#fff8dc" opacity=".8" stroke-width="3.5" stroke-linecap="round"/><path d="M87 139q28 10 42-14" fill="none" stroke="#b77d82" stroke-width="3" stroke-linecap="round"/>`
};
for (const [name,part] of Object.entries(itemIcons)) put(`item-${name}`,svg(180,180,`${pickupDefs}
<circle cx="90" cy="94" r="75" fill="#2d233b" opacity=".24" filter="url(#soft)"/>
<circle cx="90" cy="88" r="72" fill="url(#bd-badge)" stroke="#6e4a5e" stroke-width="4"/>
<circle cx="90" cy="88" r="63" fill="none" stroke="#fff8d7" stroke-width="3" opacity=".8"/>
<path d="M34 62q15-29 53-32" fill="none" stroke="#fff" stroke-width="4" opacity=".75" stroke-linecap="round"/>
${part}<path d="M133 42l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="#fffef2" opacity=".9"/>`));

const burstDefs = `<defs><radialGradient id="bd-burst"><stop stop-color="#fffef1"/><stop offset=".34" stop-color="#fff3a9"/><stop offset=".75" stop-color="#ffbd77"/><stop offset="1" stop-color="#ed7390"/></radialGradient>
<radialGradient id="bd-impact"><stop stop-color="#fff"/><stop offset=".64" stop-color="#fffcea"/><stop offset="1" stop-color="#f2e8dc"/></radialGradient></defs>`;
put('spark',svg(180,180,`${burstDefs}
<path d="M90 5 105 56 138 22 126 69 175 57 137 91 174 122 125 112 137 161 104 128 90 177 76 128 42 160 54 112 6 122 44 91 5 57 54 69 42 22 75 56Z" fill="url(#bd-burst)" stroke="#fff9da" stroke-width="3.5" stroke-linejoin="round"/>
<path d="M90 30 101 68l24-24-10 35 35-9-28 22 29 23-36-8 10 34-24-24-11 37-11-37-24 24 10-34-36 8 29-23-28-22 35 9-10-35 24 24Z" fill="#fff7c5" opacity=".82"/>
${star(90,91,34,'#fff')}${star(36,17,9,'#fff9d5')}${star(154,154,8,'#fff9d5')}<circle cx="156" cy="25" r="4" fill="#fff8d7"/><circle cx="26" cy="150" r="5" fill="#ffdd90"/>`));
put('impact',svg(180,180,`${burstDefs}
<path d="M90 5 104 47 135 20 126 58 166 48 140 79 178 94 140 107 164 139 125 124 130 164 102 132 90 178 76 132 48 164 53 124 16 139 40 107 2 94 40 79 14 48 54 58 45 20 76 47Z" fill="url(#bd-impact)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>
<circle cx="90" cy="91" r="51" fill="#fffbea" stroke="#fff" stroke-width="4"/>
<path d="M88 55q-12 33-11 45h20l-1-45Zm-10 62q0-12 12-12t12 12-12 12-12-12Z" fill="#d89e85" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M61 66q-15 20-8 36" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>${star(19,22,8,'#fff')}${star(156,158,8,'#fff')}`));
put('flash',svg(180,180,`<rect width="180" height="180" fill="#fff"/>`));

const countDefs = `<defs>
<linearGradient id="bd-count-ring" x1=".15" y1="0" x2=".8" y2="1"><stop stop-color="#fff7bc"/><stop offset=".33" stop-color="#ffd078"/><stop offset=".7" stop-color="#ef8c8a"/><stop offset="1" stop-color="#a85783"/></linearGradient>
<radialGradient id="bd-count-face" cx=".3" cy=".17" r=".9"><stop stop-color="#fffdf4"/><stop offset=".48" stop-color="#ffe9c6"/><stop offset="1" stop-color="#dfadba"/></radialGradient>
<linearGradient id="bd-count-text" x1="0" y1="0" x2=".3" y2="1"><stop stop-color="#a24b79"/><stop offset="1" stop-color="#562f63"/></linearGradient>
</defs>`;
for (const [name,text] of [['count-3','3'],['count-2','2'],['count-1','1'],['count-go','GO']]) put(name,svg(200,200,`${countDefs}
<circle cx="100" cy="108" r="83" fill="#2a203c" opacity=".42" filter="url(#soft)"/>
<circle cx="100" cy="99" r="82" fill="url(#bd-count-ring)" stroke="#5a3a55" stroke-width="5"/>
<circle cx="100" cy="99" r="68" fill="url(#bd-count-face)" stroke="#fff4ca" stroke-width="3"/>
<path d="M31 80q19-50 76-54" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".8"/>
<path d="M58 148q42 29 84 0" fill="none" stroke="#a96482" stroke-width="3" opacity=".45" stroke-linecap="round"/>
<text x="100" y="${text==='GO'?121:139}" text-anchor="middle" font-size="${text==='GO'?69:110}" letter-spacing="${text==='GO'?-5:0}" font-family="Arial Rounded MT Bold, Arial, sans-serif" font-weight="900" fill="url(#bd-count-text)" stroke="#fff9e8" stroke-width="7" stroke-linejoin="round" paint-order="stroke">${text}</text>
${star(159,36,12,'#fff8d7')}<circle cx="38" cy="140" r="4" fill="#fff9da"/>`));
export default art;
