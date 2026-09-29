import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { COSMETICS } from '../src/data/game.js';

const root = new URL('../assets/art/', import.meta.url);
mkdirSync(root, { recursive: true });
const put = (name, content) => writeFileSync(new URL(`${name}.svg`, root), content);
const defs = `<defs>
<radialGradient id="fur" cx="35%" cy="25%" r="75%"><stop stop-color="#fffef1"/><stop offset=".48" stop-color="#ffe6b5"/><stop offset=".86" stop-color="#d99563"/><stop offset="1" stop-color="#965565"/></radialGradient>
<radialGradient id="white" cx="32%" cy="22%" r="85%"><stop stop-color="#fffdf4"/><stop offset=".65" stop-color="#f3e5d5"/><stop offset="1" stop-color="#cfa9a0"/></radialGradient>
<radialGradient id="gold" cx="30%" cy="22%"><stop stop-color="#fffccc"/><stop offset=".45" stop-color="#ffe269"/><stop offset="1" stop-color="#d98933"/></radialGradient>
<radialGradient id="silver" cx="28%" cy="18%"><stop stop-color="#fff"/><stop offset=".53" stop-color="#c5e8f0"/><stop offset="1" stop-color="#7293ba"/></radialGradient>
<radialGradient id="shadow" cx="40%" cy="20%"><stop stop-color="#895576"/><stop offset="1" stop-color="#271d40"/></radialGradient>
<linearGradient id="ear" x2=".2" y2="1"><stop stop-color="#ffaeb7"/><stop offset=".55" stop-color="#f57d9e"/><stop offset="1" stop-color="#b9698b"/></linearGradient>
<linearGradient id="sky" x2=".12" y2="1"><stop stop-color="var(--a)"/><stop offset=".53" stop-color="var(--b)"/><stop offset="1" stop-color="var(--c)"/></linearGradient>
<radialGradient id="glow"><stop stop-color="#fff9dc" stop-opacity=".7"/><stop offset="1" stop-color="#fff9dc" stop-opacity="0"/></radialGradient>
<linearGradient id="lip" y2="1"><stop stop-color="#ffccd0"/><stop offset="1" stop-color="#db6c8c"/></linearGradient>
<filter id="soft"><feGaussianBlur stdDeviation="5"/></filter>
<filter id="drop" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#26102a" flood-opacity=".42"/></filter>
</defs>`;
const svg = (w,h,body,view=`0 0 ${w} ${h}`) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${view}">${defs}${body}</svg>`;
const star = (x,y,r,fill='#fff0a8') => `<path d="M${x} ${y-r}L${x+r*.25} ${y-r*.25} ${x+r} ${y} ${x+r*.25} ${y+r*.25} ${x} ${y+r} ${x-r*.25} ${y+r*.25} ${x-r} ${y} ${x-r*.25} ${y-r*.25}Z" fill="${fill}" stroke="#fff" stroke-width="1.6"/>`;
const shine = `<path d="M41 92c7-19 17-30 29-34" fill="none" stroke="#fff" stroke-opacity=".52" stroke-width="4" stroke-linecap="round"/>`;

const ear = (x,angle,large=false) => `<g transform="translate(${x} 67) rotate(${angle})"><path d="M-16 3Q-25-17-17-${large?89:69}Q-12-${large?104:84} 1-${large?93:74}Q24-${large?57:45} 19 2Z" fill="url(#white)" stroke="#9e687a" stroke-width="3"/><path d="M-8-7Q-14-32-10-${large?80:61}Q1-${large?87:65} 10-${large?51:39} 9-7Z" fill="url(#ear)"/><path d="M-12-44Q-13-60-9-69" stroke="#fff5df" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
function bunny(type='normal', boss=-1){
  let coat=type==='gold'?'url(#gold)':type==='silver'?'url(#silver)':type==='bomb'?'#828692':type==='fake'?'#ddae75':'url(#white)';
  const royal=boss>=0;
  const ears=`${ear(65,-16,royal)}${ear(115,18,royal)}`;
  const trim=type==='fake' ? `<path d="M32 100l-14-5 16 20-14 2 19 13M149 102l16-8-10 18 15 7-19 13" fill="#ddc16e" stroke="#8d6c49" stroke-width="2"/><path d="M55 38l60 10 31 26-12 17-65-10-29-24z" fill="#ac7447" stroke="#6e4a41" stroke-width="3"/><path d="M42 51h100" stroke="#ffe49c" stroke-width="7"/>` : type==='bomb' ? `<path d="M37 66q4-60 52-65 52 3 56 65z" fill="#5b7474" stroke="#172c3a" stroke-width="4"/><path d="M42 63q47-10 100 0" fill="none" stroke="#abb7a0" stroke-width="6"/><circle cx="92" cy="28" r="9" fill="#e5e2ae"/><path d="M123 2q20-17 19-31" stroke="#313a42" stroke-width="5" fill="none"/>${star(148,10,11,'#ffae51')}` : type==='gold' ? `${star(92,12,13)}${star(143,62,8)}<path d="M62 44q29-10 61-1" stroke="#fffbd7" stroke-width="5" fill="none"/>` : type==='silver'? `<path d="M46 77l-8-14 17 5 8-18 5 21 16 6-16 5-8 16-5-17z" fill="#edffff"/>${star(134,20,11,'#ddf9ff')}` : '';
  let hats=['<path d="M48 40q41-42 82 0l10 18H40z" fill="#e45452" stroke="#722b56" stroke-width="4"/><path d="M53 47q38-34 74 0" fill="none" stroke="#ffbe79" stroke-width="5"/><path d="M57 29q34 10 68 0" fill="none" stroke="#ffe2a5" stroke-width="4"/><path d="M66 18q25 13 49 0" fill="none" stroke="#f9d390" stroke-width="4"/>',
  '<path d="M43 60q-10-40 34-46 14-25 34-1 43-3 31 48z" fill="#e2ab66" stroke="#764b56" stroke-width="4"/><path d="M49 46q47-24 88 0" fill="none" stroke="#fff2bc" stroke-width="7"/><path d="M66 26q17 15 31 3 18-12 25 1" fill="none" stroke="#bd8255" stroke-width="5"/>',
  `<path d="M43 54l9-40 28 17 9-39 13 38 27-18 11 42z" fill="#67bfe3" stroke="#28628e" stroke-width="4"/><path d="M47 53h92" stroke="#fff4bc" stroke-width="8"/>${star(90,34,11,'#fff7be')}`,
  '<path d="M39 59l10-49 28 16L91-14l16 40 27-16 10 49z" fill="#ecd27e" stroke="#8f5948" stroke-width="4"/><path d="M51 52h82" stroke="#4cc4b7" stroke-width="8"/><path d="M89 18l10 12-10 14-11-14z" fill="#18b6ae"/>',
  '<path d="M45 66q-7-55 43-69 48 10 53 68z" fill="#303d65" stroke="#161e3f" stroke-width="5"/><path d="M53 60q36-20 80 0" fill="none" stroke="#e7f5ff" stroke-width="9"/><path d="M76 13q16-19 29 0" fill="none" stroke="#fff" stroke-width="5"/>',
  '<path d="M43 50Q43-1 90-11q51 12 50 61Z" fill="#dce2f3" stroke="#6078ae" stroke-width="5"/><ellipse cx="90" cy="25" rx="39" ry="29" fill="#1c3561" stroke="#9ed8ed" stroke-width="4"/><path d="M75 7q20-12 37 3" stroke="#c4f9ff" stroke-width="7" fill="none"/><circle cx="126" cy="2" r="12" fill="#8ed4e7"/>'];
  let bossFeature=['<path d="M47 69q43-20 85 0" stroke="#fff0a7" stroke-width="7" fill="none"/><path d="M126 89q24-10 28-22" stroke="#d9a16c" stroke-width="5" fill="none"/>','<path d="M43 70q47-12 91 0" fill="none" stroke="#fff4ce" stroke-width="6"/>','<path d="M33 69q56-15 116 0" fill="none" stroke="#f3fcff" stroke-width="6"/>','<path d="M35 67q51-21 111 0" stroke="#abede1" stroke-width="7" fill="none"/>','<path d="M38 70q52-21 101 0" stroke="#f7f8ff" stroke-width="8" fill="none"/>','<path d="M50 76q37-13 80 0" stroke="#a6e0ef" stroke-width="6" fill="none"/>'];
  const brows=royal?`<path d="M65 82l19 7m30-7-19 7" stroke="#4c3748" stroke-width="5" stroke-linecap="round"/>`:'';
  return svg(180,180, `<g filter="url(#drop)">${ears}<ellipse cx="90" cy="145" rx="61" ry="36" fill="${coat}" stroke="#9c7082" stroke-width="3"/><path d="M36 107q-6-66 55-73 66-5 67 68 5 45-65 53-67 2-57-48Z" fill="${coat}" stroke="#9c7082" stroke-width="3"/>${shine}${royal?bossFeature[boss]:trim}<ellipse cx="61" cy="118" rx="12" ry="8" fill="#f7a3a6" opacity=".75"/><ellipse cx="122" cy="118" rx="12" ry="8" fill="#f7a3a6" opacity=".75"/>${brows}<ellipse cx="73" cy="101" rx="6" ry="9" fill="#382b43"/><ellipse cx="110" cy="101" rx="6" ry="9" fill="#382b43"/><circle cx="71" cy="98" r="2.6" fill="white"/><circle cx="108" cy="98" r="2.6" fill="white"/><path d="M85 117q7-6 14 0l-7 6z" fill="#d27383"/><path d="M92 123v8m0 0q-11 12-19 1m19-1q11 12 20 0" stroke="#664258" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M86 137v12m12-12v12" stroke="#987280" stroke-width="2"/>${royal?hats[boss]:''}<ellipse cx="54" cy="152" rx="19" ry="9" fill="${coat}" stroke="#aa7a85" stroke-width="2"/><ellipse cx="128" cy="152" rx="19" ry="9" fill="${coat}" stroke="#aa7a85" stroke-width="2"/></g>${royal?star(18,98,7):''}`, royal ? '0 -45 180 235' : '0 -25 180 215');
}
for (const type of ['normal','gold','silver','fake','bomb']) put(`rabbit-${type}`,bunny(type));
for (let n=0;n<6;n++)put(`boss-${n}`,bunny('normal',n));

function dog(){const fluff=Array.from({length:18},(_,i)=>{let a=i*Math.PI*2/18,x=90+Math.cos(a)*60,y=88+Math.sin(a)*53;return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="25" ry="29" transform="rotate(${i*20} ${x.toFixed(1)} ${y.toFixed(1)})" fill="url(#fur)" stroke="#bc805f" stroke-width="1.5"/>`}).join('');return svg(180,180,`<g filter="url(#drop)"><path d="M47 101q-31-53-24-67 33 7 42 44m73 23q31-53 24-67-33 7-42 44" fill="#ca855f" stroke="#9a5a55" stroke-width="3"/>${fluff}<ellipse cx="90" cy="90" rx="56" ry="53" fill="url(#fur)" stroke="#a86c5c" stroke-width="3"/><path d="M51 82q6-24 20-26m57 0q12 10 18 27" fill="none" stroke="#fff6d8" stroke-width="7" stroke-linecap="round"/><ellipse cx="91" cy="119" rx="34" ry="23" fill="#fff6e7"/><ellipse cx="71" cy="97" rx="8" ry="10" fill="#392d39"/><ellipse cx="111" cy="97" rx="8" ry="10" fill="#392d39"/><circle cx="68" cy="94" r="3" fill="#fff"/><circle cx="108" cy="94" r="3" fill="#fff"/><ellipse cx="90" cy="115" rx="10" ry="7" fill="#302b39"/><path d="M90 121v9q-12 12-19-1m19 1q11 12 19-1" fill="none" stroke="#79535d" stroke-width="3" stroke-linecap="round"/><path d="M86 133q4 26 14 1" fill="url(#lip)" stroke="#aa7186" stroke-width="2"/><ellipse cx="45" cy="154" rx="24" ry="13" fill="url(#fur)" stroke="#b77f62" stroke-width="3"/><ellipse cx="135" cy="154" rx="24" ry="13" fill="url(#fur)" stroke="#b77f62" stroke-width="3"/>${star(31,64,6)}</g>`)};
put('dog',dog());

const palettes=[['#251340','#a34985','#e88a6e','#241a4f','#513359'],['#713c73','#e39791','#f9be8e','#644364','#a96b7f'],['#86cbe6','#f8e1b4','#d0e9ca','#426f91','#6b9db0'],['#2f9caf','#e6b55e','#edcf8c','#856349','#b88a5a'],['#256d9b','#9dd8e7','#e8f7fc','#4488ac','#99d8e3'],['#100f36','#4d477d','#9b80c1','#2e2c64','#696db0']];
const building=(n,x,y,w,h,fill)=>`<path d="M${x} ${y}v-${h}h${w}v${h}" fill="${fill}"/><path d="${Array.from({length:Math.floor(w/13)},(_,i)=>`M${x+7+i*13} ${y-h+12}v${h-20}`).join(' ')}" stroke="#fff4c8" stroke-width="3" stroke-dasharray="7 12" opacity=".55"/>`;
function world(n){let [a,b,c,near,front]=palettes[n];let skyline='';if(n===0){skyline=`${building(n,25,402,96,176,near)}${building(n,153,398,87,239,near)}${building(n,271,390,136,181,near)}${building(n,677,393,113,227,near)}${building(n,820,391,115,180,near)}<path d="M505 367l-14-128-41-16 41-15 16-80 13 81 38 15-40 15-13 128" fill="#b8abc4" stroke="#f1c5c0" stroke-width="4"/><path d="M438 305h139M462 269h96" stroke="#e75888" stroke-width="12"/><path d="M424 349h167" stroke="#f9c172" stroke-width="9"/>`;}
else if(n===1){skyline=`${building(n,21,398,192,169,near)}${building(n,745,398,183,185,near)}<path d="M448 404l26-89 15-118 18-20 18 20 15 118 31 89z" fill="#745372" stroke="#eecbb6" stroke-width="6"/><path d="M459 333h102m-89-59h76m-44-92v-48m-60 263h125" stroke="#e6af92" stroke-width="7"/><path d="M470 315l81 83m-9-84-73 84" stroke="#e6af92" stroke-width="4"/>`;}
else if(n===2){skyline=`${building(n,22,410,95,256,near)}${building(n,134,411,92,317,near)}${building(n,239,413,84,218,near)}${building(n,625,413,85,267,near)}${building(n,720,411,96,321,near)}${building(n,839,415,99,241,near)}<path d="M431 400l19-88 25-15 8-83 14-12 9-35 13 35 16 14 5 81 27 14 18 89" fill="#bad4cb" stroke="#649b9e" stroke-width="5"/><path d="M509 164v-49m-15 20 32-8" stroke="#cce9df" stroke-width="7"/>`;}
else if(n===3){skyline=`<path d="M23 410L178 205l146 205m14 0 172-242 175 242m18 0 108-158 126 158" fill="#d9a963" stroke="#8e6c55" stroke-width="5"/><path d="M178 205L23 410m487-242-171 242" stroke="#fff2bf" stroke-opacity=".48" stroke-width="8"/><path d="M736 311l13-80 15 80m-25 10v82" stroke="#6e8473" stroke-width="9"/>`;}
else if(n===4){skyline=`<path d="M0 386l96-81 77 29 115-129 99 99 82-71 117 111 116-126 122 106 136-77v157" fill="#b8e8ef" stroke="#ecfaff" stroke-width="7"/><path d="M197 286l91-81 81 82m264 12 69-81 72 72" stroke="#fff" stroke-width="19" fill="none"/><path d="M0 383q128-38 207 3t240-12 204 10 309-18v47H0" fill="#e5f9fb"/>`;}
else {skyline=`<circle cx="803" cy="109" r="68" fill="#dbd5ec"/><circle cx="780" cy="90" r="12" fill="#a3a1ce"/><circle cx="826" cy="126" r="20" fill="#a3a1ce"/><path d="M0 377Q240 256 427 352q293-162 533 23v51H0" fill="#aaa3bd"/><path d="M101 366q38-22 67 0m552-9q43-28 85-3" stroke="#d5cbdd" stroke-width="9" fill="none"/>${Array.from({length:28},(_,i)=>star((i*109+53)%950,(i*71+28)%205,i%3===0?3:1.5)).join('')}`;}
const foliage=Array.from({length:8},(_,i)=>`<path d="M${-30+i*137} 459q34-66 103 0" fill="${front}" opacity=".75"/>`).join('');
const floor=n===5?'#bbb5c7':n===4?'#d8eff4':n===3?'#ddb987':n===0?'#324262':'#80a993';
return svg(960,540,`<linearGradient id="world-sky-${n}" x2="0" y2="1"><stop stop-color="${a}"/><stop offset=".53" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient><rect width="960" height="540" fill="url(#world-sky-${n})"/><ellipse cx="${n===5?783:763}" cy="105" rx="185" ry="153" fill="url(#glow)"/><circle cx="${n===5?803:763}" cy="${n===5?109:105}" r="${n===5?64:37}" fill="#fff1cf" opacity=".9"/>${n===0?Array.from({length:24},(_,i)=>star((i*191)%960,((i*131)%220)+17,i%5===0?4:2)).join(''):''}${skyline}<path d="M0 400q180-22 340 8t320-7 300 7v132H0" fill="${floor}"/><path d="M0 430q160-32 320 8t326-8 314 4" fill="none" stroke="#fffbe5" stroke-opacity=".35" stroke-width="9"/>${foliage}<path d="M0 505q151-35 313 0t330-7 317 7v35H0" fill="${front}" opacity=".72"/><path d="M0 513q120-20 220 0m449-13q130-21 290 0" stroke="#ffeac4" stroke-width="3" opacity=".4" fill="none"/>`)}
for(let n=0;n<6;n++)put(`world-${n}`,world(n));

put('hole',svg(180,96,`<ellipse cx="90" cy="49" rx="82" ry="39" fill="#152530" opacity=".38" filter="url(#soft)"/><ellipse cx="90" cy="51" rx="83" ry="36" fill="#3b6d62" stroke="#194b53" stroke-width="4"/><ellipse cx="90" cy="50" rx="70" ry="27" fill="url(#shadow)" stroke="#253444" stroke-width="5"/><path d="M12 50q78-68 155 0" fill="none" stroke="#c3db93" stroke-width="8" stroke-linecap="round"/><path d="M25 46q60-45 120-9" fill="none" stroke="#f7f2bf" opacity=".8" stroke-width="3"/><path d="M14 62q73 56 152 1" fill="none" stroke="#81ad75" stroke-width="9"/><path d="M55 78l-7 9m89-11 8 8" stroke="#d1da9e" stroke-width="3"/>`));
put('rim',svg(180,75,`<path d="M9 27q76 58 162 0v17q-69 59-162 1z" fill="#3d6f62" stroke="#214857" stroke-width="3"/><path d="M11 33q77 51 157 0" fill="none" stroke="#b6d58a" stroke-width="10"/><path d="M18 35q71 43 143 2" fill="none" stroke="#edf5b9" stroke-width="3"/><path d="M26 51l-6 12m32-7 3 10m52-5 4 8m36-17 7 10" stroke="#8ebd7e" stroke-width="4"/>`));
const itemIcons={clock:`<circle cx="90" cy="90" r="51" fill="url(#silver)" stroke="#3a7692" stroke-width="10"/><path d="M90 54v39l23 18" stroke="#38748d" stroke-width="9" fill="none" stroke-linecap="round"/>`,freeze:`<circle cx="90" cy="90" r="49" fill="url(#silver)" stroke="#5585bb" stroke-width="7"/>${Array.from({length:6},(_,i)=>`<path d="M90 36v108m-20-80 40 52m0-52-40 52" transform="rotate(${i*60} 90 90)" stroke="#74c5ee" stroke-width="4"/>`).join('')}`,bone:`<path d="M58 62q-28-35-35-4-6 16 13 26-12 16-2 30 11 13 31-4l51-20q20 18 32 6t-4-26q15-16 2-29-15-13-34 5z" fill="#fff6dc" stroke="#b7878b" stroke-width="5"/>`,magnet:`<path d="M40 53v44q0 48 50 48t50-48V53h-28v44q0 20-22 20T68 97V53z" fill="#e8557b" stroke="#953956" stroke-width="5"/><path d="M40 52h28v20H40m72-20h28v20h-28" fill="#d4eff8"/>`,slap:`<path d="M42 98q-24-37-9-44 8-4 20 24L47 34q2-14 14-11 7 2 9 13l6 31V28q0-14 11-14t12 15v37l5-30q4-15 15-11 13 3 9 17l-3 27 7-17q6-12 17-6t4 20l-24 56q-19 31-53 27-31-5-45-26z" fill="url(#fur)" stroke="#995e63" stroke-width="5"/>`};
for(const [id,part] of Object.entries(itemIcons))put(`item-${id}`,svg(180,180,`<circle cx="90" cy="90" r="76" fill="#fff9dc" opacity=".34"/>${part}${star(143,33,12)}`));
put('spark',svg(180,180,`${star(90,90,72)}${star(90,90,34,'#fff')}${star(151,42,10)}`));
put('impact',svg(180,180,`<circle cx="90" cy="90" r="63" fill="#f27290" stroke="#fff4c5" stroke-width="9"/><circle cx="90" cy="90" r="48" fill="#ffc576"/>${star(90,90,46,'#fff4ad')}${star(90,90,24,'#fff')}`));
put('flash',svg(180,180,`<rect width="180" height="180" fill="#fff"/>`));
for(const [name,text] of [['count-3','3'],['count-2','2'],['count-1','1'],['count-go','GO']])put(name,svg(180,180,`<circle cx="90" cy="90" r="70" fill="#fff4d6" stroke="#df6d91" stroke-width="8" opacity=".92"/><text x="90" y="123" text-anchor="middle" font-size="${text==='GO'?70:111}" font-family="Arial Rounded MT Bold,Arial,sans-serif" font-weight="1000" fill="#59335e" stroke="#fff" stroke-width="5" paint-order="stroke">${text}</text>${star(146,29,12)}`));

const hatShapes = [
  `<path d="M47 72q-5-49 44-57 45 9 43 57z" fill="CURRENT" stroke="#aa7654" stroke-width="3"/><path d="M42 72q46 13 95 0" stroke="#fff4d6" stroke-width="8" fill="none"/>${star(93,43,17,'#fff9d7')}`,
  `<path d="M40 46q50-37 100 0l-9 29H49z" fill="url(#white)" stroke="#7087a2" stroke-width="3"/><path d="M48 64h85v14H48z" fill="CURRENT" stroke="#254c78" stroke-width="3"/><path d="M91 44v24m-10-8q10 15 20 0m-14-12h8" stroke="#254c78" stroke-width="3" fill="none"/><circle cx="91" cy="40" r="3" fill="#254c78"/>`,
  `<path d="M53 63q-28-4-20-25 5-17 25-15 1-25 30-20 25-6 34 17 23-5 28 17 5 22-26 27v21H53z" fill="url(#white)" stroke="#b9a9b6" stroke-width="3"/><path d="M55 65h66m-51-4V35m35 25V33" fill="none" stroke="#dcc6b8" stroke-width="3"/><path d="M55 80h67" stroke="CURRENT" stroke-width="6"/>`,
  `<path d="M38 62q-11-33 47-41 57-11 62 24 4 22-41 30H51z" fill="CURRENT" stroke="#78547e" stroke-width="3"/><path d="m93 25 5-12" stroke="#59344e" stroke-width="5" stroke-linecap="round"/><path d="M49 70q40 14 77-6" stroke="#efd0e0" stroke-width="5" fill="none"/>`,
  `<path d="M42 46q48-48 97 0l13 70-29-9-8-43H66l-8 43-27 9z" fill="url(#gold)" stroke="#a27a40" stroke-width="3"/><path d="m45 53 16 3m-19 9 18 3m-20 9 18 3m-20 9 18 3m67-36 17-3m-15 15 18-3m-16 15 18-3m-16 15 18-3" stroke="#4294ac" stroke-width="6"/><path d="m82 48 8-23 9 23" fill="CURRENT" stroke="#f7f0b9" stroke-width="3"/>`,
  `<path d="M32 92q-1-76 59-77 60 1 59 77" fill="none" stroke="url(#silver)" stroke-width="17"/><path d="M31 91q1-64 60-65 57 1 58 65" fill="none" stroke="#fff8f0" stroke-width="3"/><path d="M31 85v28m119-28v28" stroke="CURRENT" stroke-width="16" stroke-linecap="round"/><path d="M48 46q11-15 30-17" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/>`,
];
const cosmeticColors = ['hat','outfit','collar','effect'].map(slot => COSMETICS.filter(item => item.slot === slot).map(item => item.color));
const outfits=[
  `<path d="M48 116q-24 22-23 55l40-13q28 11 54 0l39 13q-2-34-25-55l-20 17-22-11-20 12z" fill="CURRENT" stroke="#fff0d8" stroke-width="4"/><path d="M52 143q35 23 77 0" fill="none" stroke="#ffe4a7" stroke-width="6"/>${star(90,146,12)}`,
  `<path d="M58 127l32 13 30-13 24 38H37z" fill="CURRENT" stroke="#fff0d8" stroke-width="4"/><path d="M72 132l18 31 19-31" fill="#fff6e9" stroke="#a77b89" stroke-width="3"/><circle cx="91" cy="146" r="3" fill="#d8a868"/>`,
  `<path d="M45 121q46 18 90 0l24 45H23z" fill="CURRENT" stroke="#fff1dc" stroke-width="5"/><path d="M76 129l15 35 16-35M49 151h85" fill="none" stroke="#f7dc8b" stroke-width="6"/><circle cx="90" cy="147" r="4" fill="#fff"/>`,
  `<path d="M46 128l29-8 16 18 18-18 26 8 15 38H30z" fill="CURRENT" stroke="#fff4dc" stroke-width="4"/><path d="M90 140v25m-41-16 26-2m30 0 27 2" stroke="#f4ddae" stroke-width="4" fill="none"/><circle cx="90" cy="155" r="3" fill="#fff"/>`,
  `<path d="M47 120l41 16 47-16 23 47H24z" fill="CURRENT" stroke="#fff" stroke-width="6"/><path d="M44 136q46 21 94 0m-90 12q43 22 85 0" fill="none" stroke="#f7ffff" stroke-width="8"/><circle cx="91" cy="147" r="10" fill="#e4f4fa"/>`,
  `<path d="M45 121q46 25 90 0l21 46H24z" fill="CURRENT" stroke="#dbeaf8" stroke-width="7"/><path d="M60 132q32 23 63 0m-42 4v28m21-28v28" fill="none" stroke="#fff" stroke-width="5"/><circle cx="90" cy="146" r="8" fill="#a4d2f0"/>`,
];
const collars=[
  `<path d="M52 130q37 20 77 0v20q-38 18-77 0z" fill="CURRENT" stroke="#fff1de" stroke-width="4"/><path d="M90 146l-28-12 9 29 19-11 19 11 9-29z" fill="#fff3df" stroke="CURRENT" stroke-width="3"/>`,
  `<path d="M49 130q41 23 84 0v18q-43 18-84 0z" fill="CURRENT"/><circle cx="90" cy="153" r="14" fill="url(#gold)" stroke="#fff6ca" stroke-width="3"/>${star(90,153,8)}`,
  `<path d="M50 133q39 19 80 0v19q-37 19-80 0z" fill="CURRENT" stroke="#fff4df" stroke-width="3"/><path d="M80 146q10-8 20 0l6 14q-18 13-32 0z" fill="url(#gold)" stroke="#a77355" stroke-width="3"/><circle cx="90" cy="155" r="3" fill="#664256"/>`,
  `<path d="M49 130q40 20 83 0v17q-43 17-83 0z" fill="CURRENT"/><path d="M91 143l12 14-12 16-12-16z" fill="#aef4f5" stroke="#fff" stroke-width="3"/>`,
  `<path d="M45 133q42 20 91 0" fill="none" stroke="CURRENT" stroke-width="10"/>${star(90,156,17,'#fff1ad')}${star(65,148,5)}${star(116,148,5)}`,
  `<path d="M45 129q47 26 91 0v21q-47 22-91 0z" fill="CURRENT" stroke="#ffdb9b" stroke-width="5"/><path d="M80 145l10-8 10 8-3 15H83z" fill="url(#gold)"/><circle cx="90" cy="150" r="4" fill="#fff"/>`,
];
const effectShapes = [
  Array.from({length:8},(_,j)=>star((j*67+11)%168,24+(j*41)%142,4+j%3,'CURRENT')).join(''),
  `<path d="M12 119q-10-79 43-94m68 0q57 23 45 100M21 150q72 42 134-3" fill="none" stroke="CURRENT" stroke-width="5" stroke-linecap="round"/><path d="M17 111q-9-61 33-78m82 1q38 22 31 79" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/>`,
  Array.from({length:9},(_,j)=>`<path d="M${(j*59+8)%170} ${18+(j*37)%140}q-13-14 0-17 13 2 0 17z" fill="CURRENT" stroke="#fff0df" stroke-width="1" transform="rotate(${j*33} ${(j*59+8)%170} ${18+(j*37)%140})"/>`).join(''),
  Array.from({length:6},(_,j)=>{const x=(j*61+14)%170,y=20+(j*43)%140;return `<path d="M${x-6} ${y}h12m-6-6v12m-4-10 8 8m0-8-8 8" stroke="CURRENT" stroke-width="2" stroke-linecap="round"/>`;}).join(''),
  Array.from({length:4},(_,j)=>{const x=15+j*43,y=28+j%2*110;return `<path d="m${x-9} ${y+20} 9-20" stroke="CURRENT" stroke-width="4" stroke-linecap="round"/>${star(x,y,8,'#fff4bc')}`;}).join(''),
  ['#f58d9e','#ffc470','#f9eb89','#88d7b1','#86c4ef','#c99de6'].map((color,i)=>`<path d="M${10+i*5} 110a${80-i*5} ${83-i*5} 0 0 1 ${160-i*10} 0" fill="none" stroke="${color}" stroke-width="5" opacity=".85"/>`).join(''),
];
for(let slot=0;slot<4;slot++)for(let i=0;i<6;i++){
 let shape=slot===0?hatShapes[i]:slot===1?outfits[i]:slot===2?collars[i]:effectShapes[i];
 shape=shape.replaceAll('CURRENT',cosmeticColors[slot][i]);put(`cosmetic-${['hat','outfit','collar','effect'][slot]}-${i+1}`,svg(180,180,`<g filter="url(#drop)">${shape}</g>`));
}
const titleWorld=world(0).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
const titleDog=dog().replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
const titleBunny=bunny('normal',5).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
const title=svg(1200,630,`<g transform="scale(1.25 1.167)">${titleWorld}</g><rect width="1200" height="630" fill="#231338" opacity=".25"/><path d="M0 585q497-84 1200 0v45H0" fill="#271d43"/><g transform="translate(22 150) scale(2.15)">${titleDog}</g><g transform="translate(840 182) scale(1.7)">${titleBunny}</g><path d="M374 217q205-72 491 0" stroke="#170f36" stroke-width="10" fill="none"/><text x="617" y="312" text-anchor="middle" fill="#542c66" stroke="#311a45" stroke-width="12" paint-order="stroke" font-family="Arial Rounded MT Bold,Arial,sans-serif" font-weight="1000" font-size="91" letter-spacing="-3">BUNNY DOOM</text><text x="617" y="303" text-anchor="middle" fill="#fff0b4" stroke="#d24e7c" stroke-width="5" paint-order="stroke" font-family="Arial Rounded MT Bold,Arial,sans-serif" font-weight="1000" font-size="91" letter-spacing="-3">BUNNY DOOM</text><text x="614" y="365" text-anchor="middle" fill="#fff8e2" stroke="#6e3765" stroke-width="4" paint-order="stroke" font-family="Arial,sans-serif" font-size="34" font-weight="900" letter-spacing="4">LAST POMERANIAN</text>${star(360,130,26)}${star(807,163,20)}${star(791,395,13)}`);
put('title',title);
put('app-icon',svg(512,512,`<rect width="512" height="512" rx="114" fill="#45245e"/><circle cx="256" cy="239" r="222" fill="#ec6d94"/><circle cx="256" cy="239" r="202" fill="#8f427c"/>${Array.from({length:8},(_,i)=>star(95+i*46,80+(i%3)*17,i%2?8:14)).join('')}<g transform="translate(7 4) scale(2.75)">${titleDog}</g><path d="M38 405q218 62 436 0" fill="none" stroke="#fff2c9" stroke-width="12"/>`));
writeFileSync(new URL('../atlases/layout.json',root),JSON.stringify({size:[3072,2688],tile:[384,384],sprites:['dog',...'normal gold silver fake bomb'.split(' ').map(s=>`rabbit-${s}`),...Array.from({length:6},(_,i)=>`boss-${i}`),'hole','rim',...'clock freeze bone magnet slap'.split(' ').map(s=>`item-${s}`),'spark','impact','flash','count-3','count-2','count-1','count-go',...['hat','outfit','collar','effect'].flatMap(s=>Array.from({length:6},(_,i)=>`cosmetic-${s}-${i+1}`))],worldSize:[5760,2160]},null,2));
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
