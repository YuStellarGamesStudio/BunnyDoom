import {Game} from './src/core/game.js';
import {WORLDS, STORY, SKILLS, EQUIPMENT, COSMETICS, CONFIG, getLevel} from './src/data/game.js';
import {RENDER_TIMING} from './src/data/render.js';
import {createRenderer, drawPortrait} from './src/render/renderer.js';
import {AudioManager} from './src/audio/audio.js';
import {createSave, loadSave, writeSave, exportSave, encodeSave, parseSave, importSave, applyResult, buySkill, resetSkills, availableCosmetics, setCosmetic, addHighScore, resolveLanguage} from './src/save/save.js';
import {registerPWA} from './src/pwa.js';
import {t, localized, LANGUAGES} from './src/i18n/strings.js';

const root = document.querySelector('#app');
const toastNode = document.querySelector('#toast');
const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const num = (value) => Math.round(value).toLocaleString();
const artURL = (name) => new URL(`./assets/art/${name}`,import.meta.url).href;
const stored = loadSave();
let save = stored.save;
let saveError = stored.error;
let lang = resolveLanguage(location.search,save.settings.lang);
let screen = 'title', modal = null, settingTab = 'audio';
let selectedLevel = Math.max(1,Math.min(60,save.unlocked));
let selectedWorld = Math.floor((selectedLevel-1)/10), branch = 'A', skillPage = 0, filter = 'all', collectionPage = 0;
let scorePage = 0;
let importDraft = '', importCandidate = null, lastResult = null, lastGained = 0, lastLooks = [], initialsSaved = false, resultQuip = 0;
let game = null, worker = null, renderer = null, snapshot = null, runId = 0, awaiting = [], frameTime = 0, raf = 0, finishing = false;
let pausedByUser = false, hiddenPause = false, toastTimer = 0, audioStarted = false;
const audio = new AudioManager();
audio.setSettings(save.settings);
document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : lang;
document.addEventListener('contextmenu',(event) => event.preventDefault());
registerPWA();

function tr(key){
  if(/^story[0-5]$/.test(key))return STORY[Number(key.slice(-1))].intro.map(line=>escapeHTML(localized(line,lang))).join('<br>');
  if(key==='bossBefore')return escapeHTML(localized(STORY[getLevel(selectedLevel).world].bossBefore,lang));
  if(key==='bossAfter'&&lastResult)return escapeHTML(localized(STORY[getLevel(lastResult.level).world].bossAfter,lang));
  return t(lang,key);
}
function name(value){return escapeHTML(localized(value,lang));}
function stars(value=0){return `<span class="stars" aria-label="${value}/3">${'★'.repeat(value)}<span class="empty">${'☆'.repeat(3-value)}</span></span>`;}
function button(action,label,cls='',extra=''){return `<button type="button" class="btn ${cls}" data-action="${action}" ${extra}>${label}</button>`;}
function notify(text){toastNode.textContent=text;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{toastNode.textContent='';},4200);}
function persist(){if(saveError)return;try{save=writeSave(save);}catch(error){notify(tr('storageError'));}}
function battleActive(){return screen==='game' && !!game || screen==='game' && !!worker;}
function patchSettings(key,value){save={...save,settings:{...save.settings,[key]:value}};audio.setSettings(save.settings);if(!battleActive())persist();}
function updateLang(next,historyMode='push'){
  if(!LANGUAGES[next])return;
  lang=next;document.documentElement.lang=next==='zh'?'zh-Hant':next;
  const url=new URL(location.href);url.searchParams.set('lang',next);
  if(historyMode==='push')history.pushState({},'',url);
  else if(historyMode==='replace')history.replaceState({},'',url);
  patchSettings('lang',next);
  if(screen==='game'){
    const bar=document.querySelector('.topbar');
    if(bar)bar.outerHTML=header();
    document.querySelector('#game-canvas')?.setAttribute('aria-label',tr('battleHint'));
    renderGameLabels();
    if(renderer && snapshot) renderer.draw(snapshot,{cosmetics:save.equipped,lang});
  }else render();
  if(modal)renderModal();
}
window.addEventListener('popstate',()=>{
  const next=new URLSearchParams(location.search).get('lang');
  updateLang(LANGUAGES[next]?next:resolveLanguage('',save.settings.lang),'none');
});
function header(){return `<header class="topbar"><div class="brand"><span class="brand-mark" aria-hidden="true">✦</span><span>BUNNY DOOM</span></div><div class="top-actions"><span class="pill gold" title="${tr('totalStars')}">★ ${Object.values(save.levels).reduce((sum,entry)=>sum+entry.stars,0)}</span>${screen==='title'?'':button(screen==='game'?'quit':'map',tr('map'),'ghost tiny')}${button('language',tr('language'),'ghost tiny')}${button('settings',tr('settings'),'ghost tiny')}</div></header>`;}
function render(){
  if(screen==='game'){renderGameLabels();return;}
  root.innerHTML=`<div class="app-shell">${header()}<main class="screen">${({title:renderTitle,map:renderMap,loadout:renderLoadout,result:renderResult,skills:renderSkills,collection:renderCollection})[screen]?.()||''}</main></div>`;
  if(modal)renderModal();
  if(screen==='collection')refreshPortrait();
  if(screen==='loadout')drawLoadoutPortrait();
}
function go(target){
  if(target==='game')return;
  if(screen==='game' && target!=='result') endRun();
  closeModal();
  screen=target;
  audio.playScene(({title:'title',map:'map',loadout:'loadout',result:'result',skills:'skills',collection:'map'})[target]);
  render();
}
function renderTitle(){
  const scores=save.scores.slice(0,5);
  return `<section class="title-layout"><div class="title-hero"><img class="title-illustration" src="${artURL('title.svg')}" alt=""><div class="title-copy"><div class="kicker">BUNNY DOOM · LAST POMERANIAN</div><h1>BUNNY<br>DOOM</h1><p class="lead">${tr('tagline')}</p>${button('start',tr('start'),'primary large')}</div></div><div class="title-side"><section class="card dark pad title-score"><div class="section-head"><h3>${tr('titleTop')}</h3><span class="pill gold">TOP 10</span></div><div class="score-list">${scores.length?scores.map((row,i)=>`<div class="ranking"><span>${String(i+1).padStart(2,'0')}</span><span>${escapeHTML(row.name)}</span><span>${num(row.score)}</span></div>`).join(''):`<p class="empty-rank">${tr('noScores')}</p>`}</div></section><div class="shortcut-grid">${button('guide',tr('instructions'),'ghost')}${button('scores',tr('leaderboard'),'ghost')}${button('settings',tr('settings'),'ghost')}${button('language',tr('language'),'ghost')}</div></div></section><div class="credits-line"><a href="https://github.com/YueyuHoshizora/BunnyDoom" target="_blank" rel="noopener noreferrer">${tr('credits')}</a> · AGPL-3.0</div>`;
}
function renderMap(){
  const world=WORLDS[selectedWorld];
  const levels=Array.from({length:10},(_,i)=>getLevel(selectedWorld*10+i+1));
  return `<div class="map-controls">${button('world-prev','← '+tr('prevWorld'),'ghost',selectedWorld===0?'disabled':'')}<span class="pill gold">${tr('world')} ${selectedWorld+1} / 6</span>${button('world-next',tr('nextWorld')+' →','ghost',selectedWorld===5?'disabled':'')}</div><section class="world-banner"><img src="${artURL(`world-${selectedWorld}.svg`)}" alt=""><div class="world-info"><span class="kicker">${tr('world')} ${selectedWorld+1} / 6</span><h1>${name(world.name)}</h1><p>${tr(`story${selectedWorld}`)}</p></div></section><div class="level-grid">${levels.map((level)=>{
    const locked=level.id>save.unlocked, achieved=save.levels[level.id]?.stars||0;
    return `<button type="button" class="level-tile ${level.boss?'boss-tile':''}" data-action="level" data-id="${level.id}" ${locked?'disabled':''} aria-label="${tr('level')} ${level.id}: ${locked?tr('locked'):tr('unlocked')}"><span class="tile-label">${level.boss?tr('boss'):tr('level')} ${level.id}</span><span class="level-num">${locked?'◇':String(level.number).padStart(2,'0')}</span><span class="tile-stars">${locked?tr('locked'):stars(achieved)}</span></button>`;
  }).join('')}</div><div class="button-row">${button('skills',tr('skills'),'gold')}${button('collection',tr('collection'),'ghost')}<span class="pill">${tr('skillPoints')} ${save.sp}</span></div>`;
}
function renderLoadout(){
  const level=getLevel(selectedLevel), world=WORLDS[level.world], slots=save.skills.includes('C3')?3:2;
  return `<div class="section-head"><div><div class="eyebrow">${tr('world')} ${level.world+1} · ${name(world.name)} / ${tr('level')} ${level.number}</div><h1>${tr('loadout')}</h1></div>${button('map',tr('back'),'ghost')}</div><section class="split-layout"><div class="card dark pad loadout-left"><div><h3>${level.boss?name(world.bossName):tr('level')+' '+level.id}</h3><p class="lead">${level.boss?tr('bossBefore'):tr('equipHint')}</p><div class="row"><span class="pill gold">${level.boss?tr('boss'):tr('target')+' '+num(level.target)}</span><span class="pill">${level.boss?'∞':level.duration+'s'}</span></div></div><canvas class="hero-portrait" id="loadoutPortrait" width="360" height="280" aria-label="${tr('portrait')}"></canvas><div>${button('launch',tr('ready'),'primary large wide')}</div></div><div class="card pad gear-right"><div class="section-head"><h2>${tr('gearSlots')}</h2><span class="pill pink">${save.equipment.length} / ${slots}</span></div><div class="gear-list">${EQUIPMENT.map(item=>{
    const chosen=save.equipment.includes(item.id);
    return `<div class="gear-item ${chosen?'selected':''}"><div><h3>${name(item.name)}</h3><p>${name(item.description)}</p></div>${button('equipment',tr(chosen?'remove':'equip'),chosen?'primary':'',`data-id="${item.id}" ${!chosen&&save.equipment.length>=slots?'disabled':''}`)}</div>`;
  }).join('')}</div></div></section>`;
}
function renderResult(){
  const result=lastResult;if(!result)return '';
  const level=getLevel(result.level), world=WORLDS[level.world], won=result.won;
  const criteria=['criteriaGoal','criteriaCombo','criteriaMiss'];
  return `<div class="section-head"><div><span class="eyebrow">${tr('world')} ${level.world+1} · ${name(world.name)}</span><h2>${tr('level')} ${result.level} / ${level.boss?tr('boss'):tr(won?'levelClear':'defeat')}</h2></div>${button('scores',tr('leaderboard'),'ghost')}</div><section class="result-layout"><div class="card dark pad result-main"><div><div class="eyebrow">${won?tr('victory'):tr('defeat')}</div><h1>${won&&result.level===60?tr('finalClear'):won?tr('levelClear'):tr('defeat')}</h1></div><div style="font-size:clamp(31px,5vw,60px)">${stars(result.stars)}</div><p class="lead">${tr(won?'resultWin':'resultLose')} ${tr('resultQuip'+resultQuip)}</p><div class="result-stats"><div class="stat"><strong>${num(result.score)}</strong>${tr('score')}</div><div class="stat"><strong>${result.maxCombo}</strong>${tr('combo')}</div><div class="stat"><strong>+${lastGained}</strong>${tr('gained')}</div></div></div><div class="card pad result-side"><h3>${tr('stars')}</h3>${criteria.map((key,i)=>`<div class="criteria ${result.criteria[i]?'passed':''}"><span class="criterion-mark">${result.criteria[i]?'★':'☆'}</span><span>${tr(key)}</span></div>`).join('')}${won&&level.boss?`<p class="lead">${tr('bossAfter')}</p>`:''}${lastLooks.length?`<p class="lead">${tr('newLooks')}: ${lastLooks.map(id=>name(COSMETICS.find(item=>item.id===id)?.name)).join(', ')}</p>`:''}${!initialsSaved?`<form class="initials-form" id="scoreForm"><label><span>${tr('initials')}</span><input class="field" name="initials" value="DOG" maxlength="3" pattern="[a-zA-Z0-9]{1,3}" autocomplete="off" aria-label="${tr('initials')}"></label><button class="btn gold" type="submit">${tr('saveScore')}</button></form>`:`<span class="pill cyan">${tr('scoreSaved')}</span>`}<div class="result-actions">${button('retry',tr('retry'),'primary')}${won&&result.level<60?button('next-level',tr('nextLevel'),'gold'):''}${button('map',tr('backToMap'),'dark-btn')}</div></div></section>`;
}
function renderSkills(){
  const skills=SKILLS.filter(item=>item.branch===branch);
  const compact=matchMedia('(max-width:719px) and (min-height:461px)').matches, pageSize=compact?2:5;
  const total=Math.ceil(skills.length/pageSize);skillPage=Math.min(skillPage,total-1);
  return `<div class="section-head"><div><span class="eyebrow">${tr('skillPoints')} · ${save.sp} SP</span><h1>${tr('skills')}</h1><p class="lead">${tr('skillHint')}</p></div>${button('map',tr('back'),'ghost')}</div><div class="skills-layout"><div class="tabs">${['A','B','C'].map(letter=>button('branch',`${letter} · ${tr('branch'+letter)}`,branch===letter?'active':'',`data-id="${letter}"`)).join('')}<span class="pill gold">${save.sp} SP</span></div><div class="skill-list">${skills.slice(skillPage*pageSize,(skillPage+1)*pageSize).map((item)=>{
    const index=Number(item.id.slice(1))-1,owned=save.skills.includes(item.id),available=index===0||save.skills.includes(`${branch}${index}`),canBuy=available&&save.sp>=item.cost;
    return `<div class="skill-node ${owned?'owned':available?'':'locked'}" data-skill="${item.id}"><div><span class="skill-number">${item.id} · ${item.cost} SP</span><h3>${name(item.name)}</h3><p>${name(item.description)}</p></div>${button('skill',tr(owned?'owned':!available?'prerequisite':save.sp<item.cost?'insufficient':'buy'),owned?'primary':'',`data-id="${item.id}" ${owned||!canBuy?'disabled':''}`)}</div>`;
  }).join('')}</div>${compact?`<div class="pager">${button('skill-prev',tr('previous'),'ghost',skillPage===0?'disabled':'')}<span class="pill">${skillPage+1} / ${total}</span>${button('skill-next',tr('next'),'ghost',skillPage===total-1?'disabled':'')}</div>`:''}<div class="button-row">${button('reset-skills',tr('reset'),'ghost',save.skills.length?'':'disabled')}${button('loadout',tr('loadout'),'ghost')}</div></div>`;
}
function collectionItems(){return filter==='all'?COSMETICS:COSMETICS.filter(item=>item.slot===filter);}
function renderCollection(){
  const items=collectionItems(), pageSize=matchMedia('(max-height:460px)').matches?3:matchMedia('(max-width:719px)').matches?4:6, max=Math.max(1,Math.ceil(items.length/pageSize));collectionPage=Math.min(collectionPage,max-1);
  const available=new Set(availableCosmetics(save));
  return `<div class="section-head"><div><span class="eyebrow">${available.size} / ${COSMETICS.length}</span><h1>${tr('collection')}</h1><p class="lead">${tr('galleryHint')}</p></div>${button('map',tr('back'),'ghost')}</div><div class="tabs">${[['all','all'],['hat','hats'],['outfit','outfits'],['collar','collars'],['effect','effects']].map(([id,label])=>button('filter',tr(label),filter===id?'active':'',`data-id="${id}"`)).join('')}</div><div class="gallery-layout"><div class="gallery-content"><div class="collection-grid">${items.slice(collectionPage*pageSize,collectionPage*pageSize+pageSize).map(item=>{
    const unlocked=available.has(item.id),wearing=save.equipped[item.slot]===item.id;
    return `<div class="look-card ${unlocked?'':'locked'}"><span class="look-swatch" style="background:${escapeHTML(item.color)}"></span><img class="look-art" src="${artURL(`cosmetic-${item.slot}-${COSMETICS.indexOf(item)%6+1}.svg`)}" alt=""><div><span class="look-title">${name(item.name)}</span><p class="small">${unlocked?tr('unlocked'):`${tr('unlockAt')}: ${item.requirement.value} ${tr('req'+item.requirement.type[0].toUpperCase()+item.requirement.type.slice(1))}`}</p></div>${button('cosmetic',tr(wearing?'wearing':unlocked?'use':'locked'),wearing?'primary':'',`data-id="${escapeHTML(item.id)}" ${unlocked?'':'disabled'}`)}</div>`;
  }).join('')}</div><div class="pager">${button('page-prev',tr('previous'),'ghost',collectionPage===0?'disabled':'')}<span class="pill">${tr('page')} ${collectionPage+1} ${tr('of')} ${max}</span>${button('page-next',tr('next'),'ghost',collectionPage===max-1?'disabled':'')}</div></div><div class="card dark pad gallery-portrait"><h3>${tr('portrait')}</h3><canvas id="galleryPortrait" width="460" height="460" aria-label="${tr('portrait')}"></canvas>${button('export-portrait',tr('exportPortrait'),'gold')}</div></div>`;
}
function refreshPortrait(){const canvas=document.querySelector('#galleryPortrait');if(canvas)drawPortrait(canvas,{cosmetics:save.equipped,world:selectedWorld});}
function drawLoadoutPortrait(){const canvas=document.querySelector('#loadoutPortrait');if(canvas)drawPortrait(canvas,{cosmetics:save.equipped,world:getLevel(selectedLevel).world});}
function openModal(type){
  if(type==='scores')scorePage=0;
  if(type==='settings'){settingTab='audio';importDraft='';importCandidate=null;}
  if(screen==='game' && !pausedByUser && (type==='settings'||type==='language'))togglePause(true);
  modal=type;renderModal();
}
function closeModal(){modal=null;document.querySelector('.modal-backdrop')?.remove();}
function modalShell(title,content,actions=''){return `<div class="modal-backdrop"><section class="card dark pad modal" role="dialog" aria-modal="true" aria-label="${title}"><div class="section-head"><h2>${title}</h2>${button('close-modal','×','ghost',`aria-label="${tr('close')}"`)}</div><div class="modal-body">${content}</div>${actions?`<div class="button-row">${actions}</div>`:''}</section></div>`;}
function renderModal(){
  document.querySelector('.modal-backdrop')?.remove();
  if(!modal)return;
  let contents='';
  if(modal==='settings')contents=renderSettings();
  else if(modal==='guide')contents=modalShell(tr('instructions'),[1,2,3,4].map(i=>`<div class="guide-card">${i}. ${tr('guide'+i)}</div>`).join(''),button('close-modal',tr('close'),'primary'));
  else if(modal==='scores'){
    const pages=Math.max(1,Math.ceil(save.scores.length/5));
    const rows=save.scores.slice(scorePage*5,scorePage*5+5);
    contents=modalShell(tr('leaderboard'),rows.length?rows.map((row,i)=>`<div class="ranking"><span>${scorePage*5+i+1}</span><span>${escapeHTML(row.name)} · ${tr('level')} ${row.level}</span><span>${num(row.score)}</span></div>`).join(''):`<p>${tr('noScores')}</p>`,`${button('scores-prev',tr('previous'),'ghost',scorePage===0?'disabled':'')}<span class="pill">${scorePage+1}/${pages}</span>${button('scores-next',tr('next'),'ghost',scorePage===pages-1?'disabled':'')}${button('close-modal',tr('close'),'primary')}`);
  }
  else if(modal==='language')contents=modalShell(tr('language'),`<div class="tabs">${Object.entries(LANGUAGES).map(([id,text])=>button('set-language',text,id===lang?'active':'',`data-id="${id}"`)).join('')}</div>`,button('close-modal',tr('close'),'primary'));
  else if(modal==='pause')contents=modalShell(tr('paused'),`<p class="lead">${tr('pauseHint')}</p>`,`${button('resume',tr('resume'),'primary')}${button('settings',tr('settings'),'gold')}${button('quit',tr('exit'),'ghost')}`);
  else if(modal==='confirm-quit')contents=modalShell(tr('exit'),`<p class="lead">${tr('quitConfirm')}</p>`,`${button('quit-confirm',tr('confirm'),'primary')}${button('pause-back',tr('cancel'),'ghost')}`);
  else if(modal==='confirm-reset')contents=modalShell(tr('reset'),`<p class="lead">${tr('confirmReset')}</p>`,`${button('reset-confirm',tr('confirm'),'primary')}${button('close-modal',tr('cancel'),'ghost')}`);
  else if(modal==='confirm-new')contents=modalShell(tr('newSave'),`<p class="lead">${tr('confirmNewSave')}</p>`,`${button('new-confirm',tr('confirm'),'primary')}${button('settings',tr('cancel'),'ghost')}`);
  document.body.insertAdjacentHTML('beforeend',contents);
  if(modal==='settings' && settingTab==='import')document.querySelector('#importText').value=importDraft;
}
function renderSettings(){
  const tabs=`<div class="tabs">${[['audio','audio'],['data','data'],['import','importData']].map(([id,label])=>button('settings-tab',tr(label),settingTab===id?'active':'',`data-id="${id}"`)).join('')}</div>`;
  let content='';
  if(settingTab==='audio')content=`<div class="setting-row"><label for="musicSwitch">${tr('music')}</label><input id="musicSwitch" data-setting="bgm" type="checkbox" ${save.settings.bgm?'checked':''} aria-label="${tr('music')}"></div><div class="setting-row"><label for="musicVolume">${tr('music')} · <span id="musicValue">${save.settings.bgmVolume}</span>%</label><input id="musicVolume" data-setting="bgmVolume" type="range" min="0" max="100" value="${save.settings.bgmVolume}"></div><div class="setting-row"><label for="sfxSwitch">${tr('sounds')}</label><input id="sfxSwitch" data-setting="sfx" type="checkbox" ${save.settings.sfx?'checked':''} aria-label="${tr('sounds')}"></div><div class="setting-row"><label for="sfxVolume">${tr('sounds')} · <span id="sfxValue">${save.settings.sfxVolume}</span>%</label><input id="sfxVolume" data-setting="sfxVolume" type="range" min="0" max="100" value="${save.settings.sfxVolume}"></div>`;
  else if(settingTab==='data')content=`${saveError?`<p class="danger">${tr('saveError')}</p>`:''}<div class="preview-summary"><div class="stat"><strong>${save.unlocked}/60</strong>${tr('progress')}</div><div class="stat"><strong>${Object.values(save.levels).reduce((sum,entry)=>sum+entry.stars,0)}</strong>${tr('totalStars')}</div></div><div class="button-row">${button('export-json',tr('exportJson'),'gold')}${button('export-code',tr('exportCode'),'gold')}</div><textarea id="exportText" class="save-text" readonly aria-label="${tr('exportCode')}"></textarea>${saveError?button('new-save',tr('newSave'),'ghost'):''}<p class="small">${tr('importWarning')}</p>`;
  else if(settingTab==='import')content=`<label for="importText">${tr('pasteCode')}</label><textarea id="importText" class="save-text" placeholder="${tr('pasteCode')}"></textarea><div class="button-row"><label class="btn" for="importFile">${tr('chooseFile')}</label><input id="importFile" type="file" accept=".json,application/json,text/plain" hidden>${button('import-preview',tr('preview'),'gold')}</div>${importCandidate?`<div class="preview-summary"><div class="stat"><strong>${importCandidate.unlocked}/60</strong>${tr('progress')}</div><div class="stat"><strong>${Object.values(importCandidate.levels).reduce((sum,entry)=>sum+entry.stars,0)}</strong>${tr('totalStars')}</div><div class="stat"><strong>${importCandidate.totalSP}</strong>${tr('spent')}</div><div class="stat"><strong>${escapeHTML(new Date(importCandidate.updatedAt).toLocaleDateString(lang))}</strong>${tr('savedAt')}</div></div><p class="small">${tr('importWarning')}</p>${button('import-confirm',tr('importConfirm'),'primary')}`:''}`;
  return modalShell(tr('settings'),tabs+content,button('close-modal',tr('close'),'ghost'));
}

function renderGameShell(){
  const level=getLevel(selectedLevel);
  screen='game';
  root.innerHTML=`<div class="app-shell">${header()}<main class="screen game-screen"><div class="game-hud"><div class="hud-box"><span data-label="score"></span><b id="scoreValue">0</b></div><div class="hud-box"><span data-label="time"></span><b id="timeValue">0</b></div><div class="hud-box"><span data-label="combo"></span><b id="comboValue">0</b></div><div class="hud-box"><span data-label="target"></span><b id="targetValue">${level.boss?'—':num(level.target)}</b></div></div><div class="game-board-wrap" id="board"><canvas id="game-canvas" width="${CONFIG.boardWidth}" height="${CONFIG.boardHeight}" aria-label="${tr('battleHint')}"></canvas><div id="countdown" class="countdown" hidden></div><div id="bossStrip" class="boss-strip" hidden><span id="bossFill"></span></div></div><div class="game-actions"><div class="meter"><div id="meterFill" class="meter-fill"></div><span id="meterLabel" class="meter-label"></span></div>${button('special',tr('special'),'gold',`id="specialButton" disabled`)}${button('pause',tr('pause'),'ghost',`id="pauseButton"`)}<span id="renderMode" class="mode-badge"></span></div></main></div>`;
  renderGameLabels();
}
function renderGameLabels(){
  if(screen!=='game')return;
  for(const key of ['score','time','combo','target']){const node=document.querySelector(`[data-label="${key}"]`);if(node)node.textContent=tr(key);}
  const special=document.querySelector('#specialButton'), pause=document.querySelector('#pauseButton');
  if(special)special.textContent=tr('special');
  if(pause)pause.textContent=tr(pausedByUser?'resume':'pause');
  const badge=document.querySelector('#renderMode');
  if(badge)badge.textContent=renderer?.mode==='webgpu'?tr('modeGPU'):tr('modeCPU');
  if(snapshot)drawGameSnapshot();
}
function drawGameSnapshot(){
  if(screen!=='game'||!snapshot)return;
  renderer?.draw(snapshot,{cosmetics:save.equipped,lang});
  const set=(id,text)=>{const node=document.getElementById(id);if(node)node.textContent=text;};
  set('scoreValue',num(snapshot.score));
  set('timeValue',snapshot.boss?'∞':Math.max(0,Math.ceil(snapshot.time))+'s');
  set('comboValue',snapshot.combo+'×');
  set('targetValue',snapshot.boss?`${Math.max(0,Math.ceil(snapshot.bossHp))}/${snapshot.bossMaxHp}`:num(snapshot.target??getLevel(selectedLevel).target));
  const countdown=document.getElementById('countdown');
  if(countdown){
    countdown.hidden=snapshot.status!=='countdown';
    if(!countdown.hidden)countdown.textContent=snapshot.countdown>.25?Math.ceil(snapshot.countdown):tr('countGo');
  }
  const strip=document.getElementById('bossStrip');
  if(strip){strip.hidden=!snapshot.boss;document.getElementById('bossFill').style.width=`${snapshot.boss&&snapshot.bossMaxHp?Math.max(0,snapshot.bossHp/snapshot.bossMaxHp*100):0}%`;}
  const fill=document.getElementById('meterFill'),label=document.getElementById('meterLabel'),special=document.getElementById('specialButton');
  if(fill)fill.style.width=`${Math.min(100,snapshot.charge/snapshot.maxCharge*100)}%`;
  if(label)label.textContent=`${tr('special')} ${Math.floor(snapshot.charge)} / ${snapshot.maxCharge}`;
  if(special)special.disabled=snapshot.status!=='playing'||snapshot.charge<CONFIG.specialCost||pausedByUser||hiddenPause;
}
function sendWorker(type,fields={}){
  if(!worker)return;
  awaiting.push(type);
  worker.postMessage({type,runId,...fields});
}
function workerReply(event){
  const message=event.data;
  if(message.runId!==runId||screen!=='game')return;
  if(message.error){awaiting=[];notify(message.error);return;}
  awaiting.shift();
  snapshot=message.snapshot;
  for(const item of message.events??[])feedback(item);
  drawGameSnapshot();
  maybeFinish();
}
function feedback(item){
  renderer?.feedback(item);
  audio.sfx(item.type);
}
async function startRun(){
  if(selectedLevel>save.unlocked)return;
  endRun();
  pausedByUser=false;hiddenPause=false;finishing=false;frameTime=0;runId++;
  renderGameShell();
  const currentRun=runId;
  try{
    renderer=await createRenderer(document.querySelector('#game-canvas'),{onFallback:(next)=>fallbackToWorker(next,currentRun)});
    if(currentRun!==runId||screen!=='game'){renderer.destroy();renderer=null;return;}
    if(renderer.canvas && renderer.canvas!==document.getElementById('game-canvas')){renderer.canvas.id='game-canvas';document.getElementById('board').querySelector('canvas')?.replaceWith(renderer.canvas);}
    document.querySelector('#renderMode').textContent=renderer.mode==='webgpu'?tr('modeGPU'):tr('modeCPU');
    const options={level:selectedLevel,skills:[...save.skills],equipment:[...save.equipment]};
    if(renderer.mode==='webgpu'){
      game=new Game(options);
      snapshot=game.snapshot();
      drawGameSnapshot();
    }else{
      worker=new Worker(new URL('./src/workers/simulation.js',import.meta.url),{type:'module'});
      worker.onmessage=workerReply;
      worker.onerror=()=>notify(tr('storageError'));
      sendWorker('start',{options});
    }
    audio.playScene(getLevel(selectedLevel).boss?'boss':`world${getLevel(selectedLevel).world}`);
    raf=requestAnimationFrame(frame);
  }catch(error){
    notify(error?.message||tr('loading'));
    endRun();go('loadout');
  }
}
function frame(timestamp){
  if(screen!=='game')return;
  if(!frameTime){frameTime=timestamp;raf=requestAnimationFrame(frame);return;}
  const dt=Math.min(.05,Math.max(0,(timestamp-frameTime)/1000));
  frameTime=timestamp;
  if(!hiddenPause&&!pausedByUser&&!finishing){
    if(game){game.update(dt);snapshot=game.snapshot();for(const item of game.drainEvents())feedback(item);drawGameSnapshot();maybeFinish();}
    else if(worker&&!awaiting.includes('update'))sendWorker('update',{dt});
  }
  if(finishing&&screen==='game'&&!document.hidden)drawGameSnapshot();
  if(screen==='game')raf=requestAnimationFrame(frame);
}
function maybeFinish(){
  if(!snapshot||finishing||!['won','lost'].includes(snapshot.status))return;
  finishing=true;
  const result=snapshot.result;
  if(!result)return;
  lastResult=result;
  resultQuip=Math.floor(Math.random()*10);
  try{
    const changes=applyResult(save,result);
    save=changes.save;lastGained=changes.spGained;lastLooks=changes.newCosmetics;
    persist();
  }catch(error){notify(error.message);lastGained=0;lastLooks=[];}
  initialsSaved=false;
  selectedWorld=getLevel(result.level).world;
  const completedRun=runId;
  const complete=()=>{if(screen!=='game'||runId!==completedRun)return;endRun();go('result');};
  if(result.won&&getLevel(result.level).boss)setTimeout(complete,RENDER_TIMING.victory);
  else complete();
}
function fallbackToWorker(next,currentRun){
  if(currentRun!==runId||!game||screen!=='game')return;
  const state=game.serialize();
  game=null;renderer=next;
  if(next.canvas && next.canvas!==document.getElementById('game-canvas')){
    next.canvas.id='game-canvas';
    document.getElementById('board')?.querySelector('canvas')?.replaceWith(next.canvas);
  }
  worker=new Worker(new URL('./src/workers/simulation.js',import.meta.url),{type:'module'});
  worker.onmessage=workerReply;
  worker.onerror=()=>notify(tr('storageError'));
  sendWorker('hydrate',{state});
  drawGameSnapshot();
  renderGameLabels();
}
function endRun(){
  cancelAnimationFrame(raf);
  raf=0;frameTime=0;
  runId++;
  if(worker){worker.terminate();worker=null;}
  awaiting=[];
  game=null;snapshot=null;
  if(renderer){renderer.destroy();renderer=null;}
}
function command(type,fields={}){
  if(game){
    if(type==='hit')game.hit(fields.x,fields.y);
    if(type==='special')game.special();
    if(type==='pause')game.pause(fields.value);
    snapshot=game.snapshot();
    for(const item of game.drainEvents())feedback(item);
    drawGameSnapshot();maybeFinish();
  }else sendWorker(type,fields);
}
function togglePause(value){
  if(screen!=='game'||finishing||pausedByUser===value)return;
  pausedByUser=value;
  if(!hiddenPause)command('pause',{value});
  document.querySelector('#pauseButton').textContent=tr(value?'resume':'pause');
  if(value)openModal('pause');else closeModal();
  frameTime=0;
}
function unlockAudio(){
  if(audioStarted)return;
  audioStarted=true;
  Promise.resolve(audio.start()).then(()=>audio.playScene(screen==='game'?(getLevel(selectedLevel).boss?'boss':`world${getLevel(selectedLevel).world}`):({title:'title',map:'map',loadout:'loadout',skills:'skills',result:'result',collection:'map'})[screen])).catch(()=>notify(tr('silence')));
}
function downloadBlob(blob,file){
  const url=URL.createObjectURL(blob),anchor=document.createElement('a');
  anchor.href=url;anchor.download=file;document.body.append(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function exportPortrait(){
  const canvas=document.createElement('canvas');
  canvas.width=1200;canvas.height=1200;
  await drawPortrait(canvas,{cosmetics:save.equipped,world:selectedWorld,scale:1});
  canvas.toBlob(blob=>{if(blob)downloadBlob(blob,`bunnydoom-portrait-${Date.now()}.png`);},'image/png');
}
function takeAction(action,id){
  switch(action){
    case 'start':go('map');break;
    case 'map':go('map');break;
    case 'guide':case 'scores':case 'language':openModal(action);break;
    case 'scores-prev':scorePage=Math.max(0,scorePage-1);renderModal();break;
    case 'scores-next':scorePage=Math.min(Math.ceil(save.scores.length/5)-1,scorePage+1);renderModal();break;
    case 'settings':openModal('settings');break;
    case 'skills':go('skills');break;
    case 'collection':go('collection');break;
    case 'loadout':go('loadout');break;
    case 'world-prev':selectedWorld=Math.max(0,selectedWorld-1);render();break;
    case 'world-next':selectedWorld=Math.min(5,selectedWorld+1);render();break;
    case 'level':selectedLevel=Number(id);go('loadout');break;
    case 'equipment':{
      const slots=save.skills.includes('C3')?3:2, chosen=save.equipment.includes(id);
      if(!chosen&&save.equipment.length>=slots)return;
      save={...save,equipment:chosen?save.equipment.filter(item=>item!==id):[...save.equipment,id]};
      persist();render();break;
    }
    case 'launch':startRun();break;
    case 'pause':togglePause(!pausedByUser);break;
    case 'resume':togglePause(false);break;
    case 'special':if(screen==='game'&&!pausedByUser&&!hiddenPause)command('special');break;
    case 'quit':if(screen==='game'&&!pausedByUser)togglePause(true);modal='confirm-quit';renderModal();break;
    case 'quit-confirm':go('map');break;
    case 'pause-back':modal='pause';renderModal();break;
    case 'retry':selectedLevel=lastResult.level;go('loadout');break;
    case 'next-level':selectedLevel=Math.min(60,lastResult.level+1);go('loadout');break;
    case 'branch':branch=id;skillPage=0;render();break;
    case 'skill-prev':skillPage=Math.max(0,skillPage-1);render();break;
    case 'skill-next':skillPage++;render();break;
    case 'skill':
      try{save=buySkill(save,id);persist();render();}catch(error){notify(error.message);}
      break;
    case 'reset-skills':modal='confirm-reset';renderModal();break;
    case 'reset-confirm':
      try{save=resetSkills(save);persist();closeModal();render();}catch(error){notify(save.equipment.length>2?tr('removeThird'):error.message);closeModal();}
      break;
    case 'filter':filter=id;collectionPage=0;render();break;
    case 'page-prev':collectionPage=Math.max(0,collectionPage-1);render();break;
    case 'page-next':collectionPage++;render();break;
    case 'cosmetic':
      try{save=setCosmetic(save,id);persist();render();}catch(error){notify(error.message);}
      break;
    case 'export-portrait':exportPortrait().catch(error=>notify(error.message));break;
    case 'settings-tab':
      if(settingTab==='import')importDraft=document.querySelector('#importText')?.value||'';
      settingTab=id;importCandidate=null;renderModal();break;
    case 'set-language':updateLang(id);break;
    case 'close-modal':if(screen==='game'&&pausedByUser)modal='pause',renderModal();else closeModal();break;
    case 'export-json':
      downloadBlob(new Blob([exportSave(save)],{type:'application/json'}),`bunnydoom-save-${new Date().toISOString().slice(0,10)}.json`);
      break;
    case 'export-code':{
      const code=encodeSave(save),text=document.querySelector('#exportText');text.value=code;
      navigator.clipboard?.writeText(code).then(()=>notify(tr('codeCopied'))).catch(()=>notify(tr('copyFailed')));
      if(!navigator.clipboard)notify(tr('copyFailed'));
      break;
    }
    case 'import-preview':
      try{importDraft=document.querySelector('#importText').value;importCandidate=parseSave(importDraft);renderModal();}catch(error){importCandidate=null;notify(`${tr('invalidSave')}: ${error.message}`);}
      break;
    case 'import-confirm':
      if(battleActive()){notify(tr('importWarning'));return;}
      try{
        save=importSave(importCandidate);
        saveError=null;selectedLevel=Math.min(save.unlocked,60);selectedWorld=Math.floor((selectedLevel-1)/10);
        audio.setSettings(save.settings);
        if(save.settings.lang)updateLang(save.settings.lang,'replace');
        importCandidate=null;importDraft='';closeModal();render();notify(tr('imported'));
      }catch(error){notify(`${tr('invalidSave')}: ${error.message}`);}
      break;
    case 'new-save':
      if(battleActive()){notify(tr('importWarning'));return;}
      modal='confirm-new';renderModal();break;
    case 'new-confirm':
      try{
        save=writeSave(createSave());saveError=null;
        selectedWorld=0;selectedLevel=1;audio.setSettings(save.settings);closeModal();go('title');
      }catch(error){notify(error.message);}
      break;
  }
}
document.addEventListener('click',(event)=>{
  const target=event.target.closest('[data-action]');
  if(!target)return;
  if(document.querySelector('.modal-backdrop') && !target.closest('.modal'))return;
  unlockAudio();
  takeAction(target.dataset.action,target.dataset.id);
});
document.addEventListener('submit',(event)=>{
  if(event.target.id!=='scoreForm')return;
  event.preventDefault();
  const field=event.target.elements.initials;
  if(!field.checkValidity()){field.reportValidity();return;}
  try{
    save=addHighScore(save,{name:field.value,score:lastResult.score,level:lastResult.level});
    initialsSaved=true;persist();render();
  }catch(error){notify(error.message);}
});
document.addEventListener('input',(event)=>{
  const element=event.target,key=element.dataset.setting;
  if(key){
    const value=element.type==='checkbox'?element.checked:Number(element.value);
    patchSettings(key,value);
    const label=document.getElementById(key==='bgmVolume'?'musicValue':'sfxValue');
    if(element.type==='range'&&label)label.textContent=value;
  }
  if(element.id==='importText'){importDraft=element.value;importCandidate=null;}
});
document.addEventListener('change',async(event)=>{
  if(event.target.id!=='importFile')return;
  try{
    const file=event.target.files[0];
    if(!file)return;
    if(file.size>262144)throw Error(tr('invalidSave'));
    importDraft=await file.text();
    importCandidate=parseSave(importDraft);
    renderModal();
  }catch(error){importCandidate=null;notify(`${tr('invalidSave')}: ${error.message}`);}
});
document.addEventListener('pointerdown',(event)=>{
  const canvas=event.target;
  if(canvas.id!=='game-canvas'||screen!=='game'||modal||pausedByUser||hiddenPause||!snapshot||snapshot.status!=='playing')return;
  event.preventDefault();
  unlockAudio();
  const bounds=canvas.getBoundingClientRect();
  const x=(event.clientX-bounds.left)*CONFIG.boardWidth/bounds.width,y=(event.clientY-bounds.top)*CONFIG.boardHeight/bounds.height;
  command('hit',{x,y});
});
document.addEventListener('keydown',(event)=>{
  if(!['Escape','p','P'].includes(event.key)||event.target.matches('input,textarea,select'))return;
  if(screen==='game'){
    event.preventDefault();
    if(modal==='settings'){modal='pause';renderModal();return;}
    if(modal==='confirm-quit'){modal='pause';renderModal();return;}
    togglePause(!pausedByUser);
  }else if(modal){closeModal();}
});
document.addEventListener('visibilitychange',()=>{
  if(screen!=='game')return;
  if(document.hidden){if(!hiddenPause){hiddenPause=true;if(!pausedByUser)command('pause',{value:true});}}
  else if(hiddenPause){hiddenPause=false;if(!pausedByUser)command('pause',{value:false});frameTime=0;}
});
for(const query of ['(max-width:719px)','(max-height:460px)'])matchMedia(query).addEventListener('change',()=>{
  if(screen==='game')renderGameLabels();else render();
  if(modal)renderModal();
});
if(saveError)notify(tr('saveError'));
render();
