'use strict';
const APP_VERSION='3.2.2'; const KEY='gym-progress-v1';const uid=()=>crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random());
const starter=(name,device='Kabelstation')=>({id:uid(),name,devices:[device],targetSets:3,targetReps:12});
const exercise=(name,sets,reps,guide,device='Kabelstation')=>({...starter(name,device),targetSets:sets,targetReps:parseInt(reps,10),repRange:reps,guide,notes:''});
const latestPlan=()=>({
 A:[
 exercise('Single-arm cable chest press',3,'8–12','Sta stabiel, houd je schouder laag en duw één handgreep gecontroleerd naar voren. Wissel direct van arm.'),
 exercise('Single-arm cable chest fly',2,'10–15','Begin met je arm iets achter je romp, houd je elleboog licht gebogen en beweeg gecontroleerd naar binnen.'),
 exercise('Behind-the-back cable lateral raise',2,'12–15','Laat de kabel achter je lichaam lopen, houd de schouder laag en hef je arm zijwaarts zonder te zwaaien.'),
 exercise('Single-arm cable lateral raise',2,'12–15','Hef je arm gecontroleerd zijwaarts tot ongeveer schouderhoogte; voorkom optrekken van je schouder.'),
 exercise('Overhead cable triceps cross extension',2,'10–12','Gebruik twee handgrepen en beide armen tegelijk; houd de bovenarmen stabiel en strek je ellebogen gecontroleerd.'),
 exercise('Single-arm triceps pushdown',2,'10–15','Houd je elleboog naast je romp en strek één arm zonder met je schouder of romp mee te bewegen.'),
 exercise('Cable crunch',2,'12–15','Kniel voor het kabelstation en rol je bovenlichaam richting bekken door je buikspieren aan te spannen.')],
 B:[
 exercise('Cable cross pulldown',3,'8–12','Gebruik twee handgrepen en beide armen tegelijk; trek je ellebogen richting je zij en houd je schouders laag.'),
 exercise('Single-arm seated cable row',3,'8–12','Trek één handgreep richting je heup, houd je romp stabiel en laat de schouder gecontroleerd naar voren bewegen.'),
 exercise('Bayesian cable curl',2,'10–12','Sta met je rug naar het kabelstation en je bovenarm iets achter je romp; strek rustig en curl zonder te zwaaien.'),
 exercise('Single-arm high cable curl',2,'10–12','Houd je bovenarm op schouderhoogte en buig de elleboog zonder je schouder mee te bewegen.'),
 exercise('Cross-body rear delt fly',2,'12–15','Trek één arm schuin over je lichaam naar buiten; houd de elleboog licht gebogen en de schouder laag.'),
 exercise('Rear delt cable fly',2,'12–15','Gebruik twee handgrepen en beide armen tegelijk; open je armen gecontroleerd en houd je schouders laag.'),
 exercise('Cable crunch',2,'12–15','Kniel voor het kabelstation en rol je bovenlichaam richting bekken door je buikspieren aan te spannen.')]
});
const initial=()=>({version:2,plans:latestPlan(),sessions:[],title:'Gym Progress'});

let db;try{db=JSON.parse(localStorage.getItem(KEY))||initial();if(!db.plans||!Array.isArray(db.sessions))throw Error()}catch{db=initial()}
// Upgrade alleen het oorspronkelijke ongewijzigde voorbeeldschema; bewaar historie en persoonlijke aanpassingen.
const oldA=['Cable chest press','Lat pulldown','Cable shoulder press','Triceps pushdown','Cable crunch'];
const oldB=['Seated cable row','Cable fly','Cable lateral raise','Cable biceps curl','Pallof press'];
if(db.version!==2){
 const unchanged=['A','B'].every((k)=>db.plans[k].length===5&&db.plans[k].every((e,i)=>e.name===(k==='A'?oldA:oldB)[i]));
 if(unchanged){const newer=latestPlan();for(const k of ['A','B']){newer[k].forEach((e,i)=>{const prior=db.plans[k].find(x=>x.name===e.name);if(prior){e.id=prior.id;e.devices=prior.devices;}})}db.plans=newer;}
 db.version=2;try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){console.warn(e)}
}
// Migreer uitsluitend het standaard 2.0-schema; zelf aangepaste schema's niet overschrijven.
if((db.version||0)<3){
 const prevA=['Cable chest fly','Cable chest press','Cable lateral raise','Overhead cable triceps extension','Rope triceps pushdown','Cable crunch'];
 const prevB=['Cable lat pulldown','Seated cable row','Bayesian cable curl','High cable biceps curl','Cross-body rear delt fly','Cable rear delt fly'];
 const matches=['A','B'].every(k=>Array.isArray(db.plans[k])&&db.plans[k].length===6&&db.plans[k].every((e,i)=>e.name===(k==='A'?prevA:prevB)[i]));
 if(matches){
  const newer=latestPlan();
  const fromA=[1,0,2,2,3,4,5],fromB=[0,1,2,3,4,5,null];
  for(const k of ['A','B'])newer[k].forEach((e,i)=>{
   const j=(k==='A'?fromA:fromB)[i];const old=j===null?null:db.plans[k][j];
   if(old){e.devices=Array.isArray(old.devices)&&old.devices.length?old.devices:e.devices;
    if(old.notes)e.notes=old.notes;
    // Gebruik de oude ID alleen wanneer het dezelfde oefening is.
    if(old.name===e.name)e.id=old.id;
   }
  });
  db.plans=newer;
 }
 db.version=3;
 try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){console.warn(e)}
}
db.title=db.title||'Gym Progress';
let updateReady=false,swRegistration=null;
let tab='home',plan='A',active=null,editingOriginal=null,chartExercise='',chartDevice='';
const $=id=>document.getElementById(id);const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n).toLocaleString('nl-NL',{maximumFractionDigits:2});
function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){alert('Opslaan mislukt. Maak een back-up en controleer beschikbare opslagruimte.')}}
function allExercises(){return [...db.plans.A,...db.plans.B]}
function nav(){ $('nav').innerHTML=[['home','Training'],['plans','Schema'],['history','Historie'],['progress','Voortgang'],['backup','Back-up']].map(([t,l])=>`<button class="${tab===t?'active':''}" data-tab="${t}">${l}</button>`).join('');document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render()})}
function render(){document.getElementById('appTitle').textContent='💪 '+(db.title||'Gym Progress');document.title=db.title||'Gym Progress';nav();({home,plans,history,progress,backup})[tab]();showUpdateBanner();}
function home(){let last=db.sessions[0];$('app').innerHTML=`<h2>Start een training</h2><div class="grid">${['A','B'].map(p=>`<div class="card"><h3>Training ${p}</h3><p class="muted">${db.plans[p].length} oefeningen</p><button data-start="${p}">Start ${p}</button></div>`).join('')}</div>${active?'<div class="card"><button id="resume">Hervat lopende training</button></div>':''}<div class="card"><h3>Laatste training</h3>${last?`${new Date(last.date).toLocaleDateString('nl-NL')} · Training ${esc(last.plan)}<p>${last.exercises.length} oefeningen</p>`:'Nog geen training geregistreerd.'}</div>`;document.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>start(b.dataset.start));if($('resume'))$('resume').onclick=()=>drawSession()}
function start(p){if(active&&!confirm('Je hebt nog een lopende training. Een nieuwe training starten?'))return;editingOriginal=null;active={id:uid(),date:new Date().toISOString(),plan:p,exercises:db.plans[p].map(e=>({exerciseId:e.id,name:e.name,device:e.devices[0]||'Onbekend',sets:Array.from({length:e.targetSets||3},()=>({reps:'',weight:''}))}))};drawSession()}
function lastSet(exid,device,index){for(const s of db.sessions)for(const e of s.exercises)if(e.exerciseId===exid&&e.device===device&&e.sets[index])return e.sets[index];return null}
function drawSession(){if(!active)return;tab='home';nav();$('app').innerHTML=`<div class="row"><h2 class="grow">Training ${esc(active.plan)}</h2><button class="secondary tiny" id="cancel">Annuleer</button></div><p class="muted">${new Date(active.date).toLocaleString('nl-NL')}</p>${active.exercises.map((e,i)=>{const orig=allExercises().find(x=>x.id===e.exerciseId);const devices=[...new Set([...(orig?.devices||[]),e.device])];return `<section class="card"><h3>${esc(e.name)}</h3><p class="muted">Doel: ${esc(orig?.targetSets||e.sets.length)} × ${esc(orig?.repRange||orig?.targetReps||'–')}</p>${orig?.guide?`<p><strong>Uitvoering:</strong> ${esc(orig.guide)}</p>`:''}${orig?.notes?`<p><strong>Mijn aandachtspunten:</strong> ${esc(orig.notes)}</p>`:''}<label>Apparaat</label><select data-device="${i}">${devices.map(d=>`<option ${d===e.device?'selected':''}>${esc(d)}</option>`).join('')}</select><div class="space"></div><div class="muted">Set · Gewicht (kg) · Herhalingen</div>${e.sets.map((s,j)=>`<div class="set"><strong>${j+1}</strong><div><input type="text" inputmode="decimal" placeholder="kg (bijv. 12,5)" value="${esc(String(s.weight).replace('.',','))}" data-field="weight" data-i="${i}" data-j="${j}"></div><div><input type="number" inputmode="numeric" min="0" step="1" placeholder="reps" value="${esc(s.reps)}" data-field="reps" data-i="${i}" data-j="${j}"></div><button class="secondary" data-delset="${i},${j}">×</button></div>`).join('')}<div class="muted" style="font-size:12px">${(()=>{const prev=db.sessions.flatMap(s=>s.exercises.filter(x=>x.exerciseId===e.exerciseId&&x.device===e.device)).find(x=>x.sets.length);return prev?'Vorige keer op dit apparaat: '+prev.sets.map((s,k)=>'set '+(k+1)+': '+fmt(s.weight)+' kg × '+s.reps).join(' · '):'Nog geen eerdere sets op dit apparaat'})()}</div><div class="actions"><button class="secondary tiny" data-addset="${i}">+ Set</button><button class="secondary tiny" data-copy="${i}">Kopieer vorige set</button></div></section>`}).join('')}<button id="finish" style="width:100%">Training opslaan</button>`;
 document.querySelectorAll('[data-field]').forEach(el=>el.oninput=()=>{active.exercises[+el.dataset.i].sets[+el.dataset.j][el.dataset.field]=(el.dataset.field==='weight'?el.value.replace(',', '.'):el.value)});document.querySelectorAll('[data-device]').forEach(el=>el.onchange=()=>{active.exercises[+el.dataset.device].device=el.value;drawSession()});document.querySelectorAll('[data-addset]').forEach(el=>el.onclick=()=>{active.exercises[+el.dataset.addset].sets.push({reps:'',weight:''});drawSession()});document.querySelectorAll('[data-delset]').forEach(el=>el.onclick=()=>{active.exercises[+el.dataset.delset.split(',')[0]].sets.splice(+el.dataset.delset.split(',')[1],1);drawSession()});document.querySelectorAll('[data-copy]').forEach(el=>el.onclick=()=>{let e=active.exercises[+el.dataset.copy],s=e.sets[e.sets.length-1]||{reps:'',weight:''};e.sets.push({...s});drawSession()});$('finish').onclick=()=>{const clean=active.exercises.map(e=>({...e,sets:e.sets.filter(s=>s.reps!==''&&s.weight!==''&&Number(s.reps)>0&&Number(String(s.weight).replace(',','.'))>=0).map(s=>({reps:Number(s.reps),weight:Number(String(s.weight).replace(',','.'))}))})).filter(e=>e.sets.length);if(!clean.length){alert('Vul minimaal één set met gewicht en herhalingen in.');return}if(editingOriginal){db.sessions=db.sessions.filter(s=>s.id!==editingOriginal.id);editingOriginal=null}db.sessions.unshift({...active,exercises:clean});active=null;save();tab='history';render()};$('cancel').onclick=()=>{if(confirm('Lopende training weggooien?')){active=null;editingOriginal=null;render()}}}
function plans(){let items=db.plans[plan];$('app').innerHTML=`<h2>Trainingsschema</h2><div class="row"><button class="${plan==='A'?'':'secondary'}" data-plan="A">Training A</button><button class="${plan==='B'?'':'secondary'}" data-plan="B">Training B</button></div><div class="space"></div>${items.map((e,i)=>`<div class="card"><h3>${esc(e.name)}</h3><p class="muted">${e.targetSets} × ${esc(e.repRange||e.targetReps)} · ${esc(e.devices.join(', '))}</p>${e.guide?`<p><strong>Uitvoering:</strong> ${esc(e.guide)}</p>`:''}${e.notes?`<p><strong>Mijn aandachtspunten:</strong> ${esc(e.notes)}</p>`:''}<div class="actions"><button class="secondary tiny" data-edit="${i}">Bewerken</button><button class="secondary tiny" data-up="${i}" ${i===0?'disabled':''}>↑</button><button class="secondary tiny" data-down="${i}" ${i===items.length-1?'disabled':''}>↓</button><button class="danger tiny" data-remove="${i}">Verwijder</button></div></div>`).join('')}<button id="add">+ Oefening toevoegen</button>`;document.querySelectorAll('[data-plan]').forEach(b=>b.onclick=()=>{plan=b.dataset.plan;render()});document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editExercise(+b.dataset.edit));document.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>{let i=+b.dataset.up;[items[i-1],items[i]]=[items[i],items[i-1]];save();render()});document.querySelectorAll('[data-down]').forEach(b=>b.onclick=()=>{let i=+b.dataset.down;[items[i+1],items[i]]=[items[i],items[i+1]];save();render()});document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{if(confirm('Oefening verwijderen uit schema? Eerdere trainingshistorie blijft behouden.')){items.splice(+b.dataset.remove,1);save();render()}});$('add').onclick=()=>editExercise(-1)}
function editExercise(index){let old=index>=0?db.plans[plan][index]:starter('');$('app').innerHTML=`<h2>${index<0?'Oefening toevoegen':'Oefening bewerken'}</h2><form id="exerciseForm" class="card"><label>Naam oefening</label><input id="ename" required value="${esc(old.name)}"><div class="space"></div><label>Apparaten (één per regel)</label><textarea id="devices" rows="4" placeholder="Kabelstation 1&#10;Kabelstation 2">${esc(old.devices.join('\n'))}</textarea><div class="space"></div><label>Korte uitleg / uitvoering</label><textarea id="guide" rows="3" placeholder="Zo voer je de oefening uit">${esc(old.guide||'')}</textarea><div class="space"></div><label>Mijn aandachtspunten</label><textarea id="notes" rows="3" placeholder="Bijvoorbeeld: ellebogen stilhouden, kabel op stand 6">${esc(old.notes||'')}</textarea><div class="space"></div><div class="grid"><div><label>Doelsets</label><input id="sets" type="number" min="1" max="20" value="${old.targetSets}"></div><div><label>Doelherhalingen (bijv. 10–12)</label><input id="reps" type="text" value="${esc(old.repRange||old.targetReps)}"></div></div><div class="actions"><button type="submit">Opslaan</button><button type="button" class="secondary" id="back">Terug</button></div></form>`;$('back').onclick=render;$('exerciseForm').onsubmit=e=>{e.preventDefault();let v={...old,name:$('ename').value.trim(),devices:[...new Set($('devices').value.split('\n').map(x=>x.trim()).filter(Boolean))],targetSets:Math.max(1,Number($('sets').value)||3),targetReps:Math.max(1,parseInt($('reps').value,10)||12),repRange:$('reps').value.trim()||'12',guide:$('guide').value.trim(),notes:$('notes').value.trim()};if(!v.name)return;if(!v.devices.length)v.devices=['Onbekend'];if(index<0)db.plans[plan].push(v);else db.plans[plan][index]=v;save();render()}}
function history(){ $('app').innerHTML=`<h2>Trainingshistorie</h2>${db.sessions.length?db.sessions.map((s,i)=>`<div class="card"><h3>Training ${esc(s.plan)} · ${new Date(s.date).toLocaleDateString('nl-NL')}</h3>${s.exercises.map(e=>`<p><strong>${esc(e.name)}</strong> <span class="muted">(${esc(e.device)})</span><br>${e.sets.map(x=>`${fmt(x.weight)} kg × ${x.reps}`).join(' · ')}</p>`).join('')}<div class="actions"><button class="tiny" data-fit-session="${i}">FIT voor Strava</button><button class="secondary tiny" data-edit-session="${i}">Corrigeer</button><button class="danger tiny" data-delete-session="${i}">Verwijder</button></div></div>`).join(''):'Nog geen trainingen. Start training A of B.'}`;document.querySelectorAll('[data-fit-session]').forEach(b=>b.onclick=()=>exportStravaFit(db.sessions[+b.dataset.fitSession]));document.querySelectorAll('[data-delete-session]').forEach(b=>b.onclick=()=>{if(confirm('Deze training definitief verwijderen?')){db.sessions.splice(+b.dataset.deleteSession,1);save();render()}});document.querySelectorAll('[data-edit-session]').forEach(b=>b.onclick=()=>{let i=+b.dataset.editSession;editingOriginal=structuredClone(db.sessions[i]);active=structuredClone(db.sessions[i]);drawSession()})}
function progress(){let exercises=[...new Map([...db.sessions.flatMap(s=>s.exercises),...allExercises()].map(e=>[e.exerciseId||e.id,{id:e.exerciseId||e.id,name:e.name}])).values()];if(!exercises.some(e=>e.id===chartExercise))chartExercise=exercises[0]?.id||'';let devices=[...new Set(db.sessions.flatMap(s=>s.exercises.filter(e=>e.exerciseId===chartExercise).map(e=>e.device)))];if(chartDevice&&!devices.includes(chartDevice))chartDevice='';let pts=db.sessions.slice().reverse().flatMap(s=>s.exercises.filter(e=>e.exerciseId===chartExercise&&(!chartDevice||e.device===chartDevice)).map(e=>({date:s.date,max:Math.max(...e.sets.map(x=>x.weight)),volume:e.sets.reduce((a,x)=>a+x.weight*x.reps,0),reps:e.sets.reduce((a,x)=>a+x.reps,0)})));$('app').innerHTML=`<h2>Voortgang</h2><div class="card"><label>Oefening</label><select id="chartEx">${exercises.map(e=>`<option value="${esc(e.id)}" ${e.id===chartExercise?'selected':''}>${esc(e.name)}</option>`).join('')}</select><div class="space"></div><label>Apparaat</label><select id="chartDev"><option value="">Alle apparaten (niet rechtstreeks vergelijkbaar)</option>${devices.map(d=>`<option ${chartDevice===d?'selected':''}>${esc(d)}</option>`).join('')}</select></div><div class="card"><h3>Hoogste gewicht per training</h3><canvas id="chart" width="640" height="280"></canvas><p class="muted">Filter op één apparaat voor een betrouwbare vergelijking.</p></div><div class="grid"><div class="card"><div class="muted">Laatste topgewicht</div><div class="stat">${pts.length?pts.at(-1).max+' kg':'–'}</div></div><div class="card"><div class="muted">Laatste volume</div><div class="stat">${pts.length?Math.round(pts.at(-1).volume)+' kg':'–'}</div></div></div><div class="card"><h3>Historische meetpunten</h3>${pts.length?pts.slice().reverse().map(p=>`<p>${new Date(p.date).toLocaleDateString('nl-NL')} · ${fmt(p.max)} kg max · ${p.reps} reps · ${Math.round(p.volume)} kg volume</p>`).join(''):'Nog geen gegevens voor deze selectie.'}</div>`;$('chartEx').onchange=e=>{chartExercise=e.target.value;chartDevice='';render()};$('chartDev').onchange=e=>{chartDevice=e.target.value;render()};drawChart(pts)}
function drawChart(pts){let c=$('chart'),ctx=c.getContext('2d'),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#aab9ce';ctx.font='20px system-ui';if(!pts.length){ctx.fillText('Nog geen meetpunten',20,130);return}let vals=pts.map(x=>x.max),lo=Math.max(0,Math.min(...vals)-5),hi=Math.max(...vals)+5;if(hi===lo)hi=lo+1;ctx.strokeStyle='#40516d';ctx.lineWidth=1;for(let k=0;k<5;k++){let y=20+k*55;ctx.beginPath();ctx.moveTo(50,y);ctx.lineTo(620,y);ctx.stroke();ctx.fillText((hi-(hi-lo)*k/4).toFixed(1),3,y+5)}ctx.strokeStyle='#63d5af';ctx.lineWidth=4;ctx.beginPath();vals.forEach((v,i)=>{let x=pts.length===1?330:50+i*570/(pts.length-1),y=240-(v-lo)/(hi-lo)*220;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();ctx.fillStyle='#80edc7';vals.forEach((v,i)=>{let x=pts.length===1?330:50+i*570/(pts.length-1),y=240-(v-lo)/(hi-lo)*220;ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill()})}
function backup(){ $('app').innerHTML=`<h2>Back-up en privacy</h2><div class="card"><h3>Je gegevens blijven lokaal</h3><p>Deze app gebruikt lokale browseropslag. Er is geen account of serverdatabase. Verwijder je websitegegevens of de app, dan kun je gegevens kwijtraken.</p><button id="export">Download JSON-back-up</button></div><div class="card"><h3>Back-up terugzetten</h3><p class="muted">Let op: import vervangt alle huidige trainingsgegevens.</p><input type="file" id="import" accept=".json,application/json"></div><div class="card"><h3>App-instellingen</h3><label>Titel bovenaan de app</label><input id="customTitle" maxlength="45" value="${esc(db.title)}"><div class="actions"><button id="saveTitle">Titel opslaan</button><button class="secondary" id="checkUpdates">Controleer updates</button></div><p>Geïnstalleerde versie: <strong>${APP_VERSION}</strong></p><p id="updateStatus" class="muted"></p><p>Bewaar regelmatig een back-up in Bestanden of iCloud Drive. Trainingsgegevens worden niet naar GitHub gestuurd.</p></div>`;$('saveTitle').onclick=()=>{db.title=$('customTitle').value.trim()||'Gym Progress';save();render()};$('checkUpdates').onclick=async()=>{if(!swRegistration){$('updateStatus').textContent='Geen offline-serviceworker gevonden.';return} $('updateStatus').textContent='Controleren…';try{await swRegistration.update();$('updateStatus').textContent=updateReady?'Nieuwe versie beschikbaar.':'Je hebt de nieuwste beschikbare versie.';showUpdateBanner()}catch(e){$('updateStatus').textContent='Controle mislukt. Controleer je internetverbinding.'}};$('export').onclick=()=>{let blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='gym-progress-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};$('import').onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let x=JSON.parse(await f.text());if(!x.plans||!Array.isArray(x.plans.A)||!Array.isArray(x.plans.B)||!Array.isArray(x.sessions))throw Error('Ongeldig formaat');if(confirm('Huidige gegevens vervangen door deze back-up?')){db=x;active=null;save();render();alert('Back-up geïmporteerd')}}catch(err){alert('Import mislukt: '+err.message)}}}
function newerVersion(candidate){
 const parts=v=>String(v||'').split('.').map(x=>Number(x)||0);
 const a=parts(candidate),b=parts(APP_VERSION);
 for(let i=0;i<Math.max(a.length,b.length);i++){if((a[i]||0)!==(b[i]||0))return (a[i]||0)>(b[i]||0)}
 return false;
}
async function checkWaitingVersion(reg){
 updateReady=false;
 const worker=reg?.waiting;
 if(worker&&navigator.serviceWorker.controller){
  try{
   const version=await new Promise((resolve,reject)=>{
    const channel=new MessageChannel();const timeout=setTimeout(()=>{channel.port1.close();reject(Error('Timeout'))},2500);
    channel.port1.onmessage=e=>{clearTimeout(timeout);channel.port1.close();resolve(e.data?.version)};
    worker.postMessage({type:'GET_VERSION'},[channel.port2]);
   });
   updateReady=newerVersion(version);
  }catch(e){console.warn('Versiecontrole niet gelukt:',e)}
 }
 showUpdateBanner();
}
function showUpdateBanner(){let b=document.getElementById('updateBanner');if(b)b.hidden=!updateReady;}
function setupUpdates(){
 if(!('serviceWorker'in navigator))return;
 navigator.serviceWorker.addEventListener('controllerchange',()=>{
  updateReady=false;showUpdateBanner();
  if(sessionStorage.getItem('gym-update-pending')==='yes'){
   sessionStorage.removeItem('gym-update-pending');location.reload();
  }
 });
 navigator.serviceWorker.register('./sw.js').then(reg=>{
  swRegistration=reg;
  const watch=()=>{checkWaitingVersion(reg)};
  watch();reg.addEventListener('updatefound',()=>{
   const worker=reg.installing;
   if(worker)worker.addEventListener('statechange',watch);
  });
  reg.update().catch(console.warn);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)reg.update().catch(console.warn)});
 }).catch(console.warn);
}
document.getElementById('applyUpdate').onclick=()=>{
 if(updateReady&&swRegistration?.waiting){
  sessionStorage.setItem('gym-update-pending','yes');
  swRegistration.waiting.postMessage({type:'SKIP_WAITING'});
 }
};
window.addEventListener('load',setupUpdates);render();

// FIT Activity writer: standalone, offline, no third-party libraries.
// FIT SDK field numbers, little endian. Structured sets are included; exact exercise names
// cannot be guaranteed without Strava's exercise-category mapping.
function exportStravaFit(session){
 try{
  const start=new Date(session.date);if(!Number.isFinite(start.getTime()))throw Error('Ongeldige trainingsdatum');
  const end=session.endDate?new Date(session.endDate):new Date(start.getTime()+3600000);
  const elapsed=Math.max(60,Math.round((end-start)/1000)||3600);
  const epoch=Date.UTC(1989,11,31,0,0,0);
  const fitTime=d=>Math.max(0,Math.floor((d.getTime()-epoch)/1000));
  const data=[];const u8=n=>data.push(n&255);const u16=n=>{u8(n);u8(n>>8)};const u32=n=>{u16(n);u16(n>>>16)};
  const field=(n,size,type)=>{u8(n);u8(size);u8(type)};
  const def=(local,global,fields)=>{u8(0x40|local);u8(0);u8(0);u16(global);u8(fields.length);fields.forEach(f=>field(...f))};
  const msg=(local,writer)=>{u8(local);writer()};
  // File ID (activity) and timer start/stop events.
  def(0,0,[[0,1,0],[4,4,0x86]]);msg(0,()=>{u8(4);u32(fitTime(start))});
  def(4,21,[[253,4,0x86],[0,1,0],[1,1,0]]);
  msg(4,()=>{u32(fitTime(start));u8(0);u8(0)}); // timer start
  // A record stream is essential for many activity importers (including Strava).
  // No invented GPS, heart rate, power or distance values.
  def(5,20,[[253,4,0x86]]);
  const recordInterval=30;
  for(let seconds=0;seconds<elapsed;seconds+=recordInterval){
   msg(5,()=>u32(fitTime(start)+seconds));
  }
  msg(5,()=>u32(fitTime(start)+elapsed));
  // Strength set records: repetition count and weight in kilograms.
  def(1,225,[[3,2,0x84],[4,4,0x88],[5,1,0],[6,4,0x86]]);
  let totalSets=0;
  for(const ex of session.exercises||[]){for(const set of ex.sets||[]){
   const reps=Number(set.reps),weight=Number(String(set.weight).replace(',','.'));
   if(!Number.isFinite(reps)||reps<=0||!Number.isFinite(weight)||weight<0)continue;
   msg(1,()=>{u16(Math.min(65534,Math.round(reps)));const f=new DataView(new ArrayBuffer(4));f.setFloat32(0,weight,true);for(let i=0;i<4;i++)u8(f.getUint8(i));u8(0);u32(fitTime(start)+Math.min(elapsed-1,totalSets*30))});totalSets++;
  }}
  if(!totalSets)throw Error('Deze training heeft geen geldige sets');
  msg(4,()=>{u32(fitTime(start)+elapsed);u8(0);u8(1)}); // timer stop
  // Session: start_time, sport=training, sub_sport=strength_training,
  // total_elapsed_time and total_timer_time in milliseconds, end timestamp.
  def(2,18,[[2,4,0x86],[5,1,0],[6,1,0],[7,4,0x86],[8,4,0x86],[253,4,0x86]]);
  msg(2,()=>{u32(fitTime(start));u8(10);u8(20);u32(elapsed*1000);u32(elapsed*1000);u32(fitTime(start)+elapsed)});
  // Activity summary; type=manual (0), event=activity (26), event_type=stop (1).
  def(3,34,[[0,4,0x86],[1,2,0x84],[2,1,0],[3,1,0],[4,1,0],[253,4,0x86]]);
  msg(3,()=>{u32(elapsed*1000);u16(1);u8(0);u8(26);u8(1);u32(fitTime(start)+elapsed)});
  const header=[14,0x20,0,0,data.length&255,(data.length>>8)&255,(data.length>>16)&255,(data.length>>24)&255,46,70,73,84];
  const crc=bytes=>{const table=[0,0xCC01,0xD801,0x1400,0xF001,0x3C00,0x2800,0xE401,0xA001,0x6C00,0x7800,0xB401,0x5000,0x9C01,0x8801,0x4400];let c=0;for(const b of bytes){let t=table[c&15];c=(c>>4)&0x0FFF;c=c^t^table[b&15];t=table[c&15];c=(c>>4)&0x0FFF;c=c^t^table[(b>>4)&15]}return c};
  const hc=crc(header);header.push(hc&255,hc>>8);
  const body=header.concat(data);const fc=crc(body);body.push(fc&255,fc>>8);
  const blob=new Blob([new Uint8Array(body)],{type:'application/octet-stream'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='gym-progress-training-'+session.plan+'-'+start.toISOString().slice(0,10)+'.fit';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
  alert('FIT-bestand gedownload. Upload via strava.com/upload/select. Dit formaat bevat nu tijdrecords. Strava-acceptatie en weergave van sets moeten nog worden getest.');
 }catch(err){alert('FIT-export mislukt: '+err.message)}
}
