'use strict';
const APP_VERSION='4.2.0'; const KEY='gym-progress-v1';const uid=()=>crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random());
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
// Nieuw A/B-programma. Alleen installeren na expliciete bevestiging; bestaande historie blijft intact.
const newPlan=()=>({
 A:[
  {...exercise('Behind-the-back cable lateral raise',2,'12–15','Kabel achter de romp; hef een arm gecontroleerd zijwaarts.'),arms:1,position:'Verlengd',group:'Schouders',pair:'Schouders'},
  {...exercise('Single-arm cable lateral raise',2,'12–15','Kabel opzij; hef de arm tot schouderhoogte, zonder zwaaien.'),arms:1,position:'Meer verkort',group:'Schouders',pair:'Schouders'},
  {...exercise('Bayesian cable curl',2,'10–12','Bovenarm achter de romp, gecontroleerde rek; links en rechts.'),arms:1,position:'Verlengd',group:'Biceps',pair:'Biceps'},
  {...exercise('Single-arm high cable curl',2,'10–12','Bovenarm hoog en stabiel; links en rechts.'),arms:1,position:'Meer verkort',group:'Biceps',pair:'Biceps'},
  {...exercise('Katana triceps extension',2,'10–12','Gebruik twee handgrepen en beide armen tegelijk, ellebogen stabiel.'),arms:2,position:'Verlengd',group:'Triceps',pair:'Triceps'},
  {...exercise('Single-arm triceps pushdown',2,'10–15','Elleboog naast je romp; strek een arm gecontroleerd.'),arms:1,position:'Meer verkort',group:'Triceps',pair:'Triceps'},
  {...exercise('Cable crunch',2,'12–15','Kniel voor de kabel en rol de ribben richting het bekken.'),arms:2,position:'Combinatie',group:'Buik'}],
 B:[
  {...exercise('Single-arm cable chest fly',2,'10–15','Begin met de arm licht achter de romp, beweeg gecontroleerd naar binnen.'),arms:1,position:'Meer verlengd',group:'Borst',pair:'Borst'},
  {...exercise('Single-arm cable chest press',3,'8–12','Duw gecontroleerd voorwaarts en laat de arm voldoende terugkomen.'),arms:1,position:'Combinatie',group:'Borst',pair:'Borst'},
  {...exercise('Single-arm high cable pulldown',3,'8–12','Kabel hoog, arm volledig uitstrekken en elleboog naar de heup trekken.'),arms:1,position:'Combinatie (rek bovenin)',group:'Rug',pair:'Rug'},
  {...exercise('Single-arm seated cable row',2,'10–12','Trek de handgreep richting heup en laat schouderblad gecontroleerd meebewegen.'),arms:1,position:'Combinatie',group:'Rug',pair:'Rug'},
  {...exercise('Leg press',2,'10–12','Gebruik comfortabele diepte, knieën in lijn met de voeten. Beide benen.' ,'Leg press'),arms:2,position:'Combinatie (quadriceps)',group:'Benen',pair:'Benen'},
  {...exercise('Romanian deadlift',2,'8–12','Beweeg heupen achterwaarts met licht gebogen knieën; houd rug neutraal.','Barbell / dumbbells'),arms:2,position:'Verlengd (hamstrings)',group:'Benen',pair:'Benen'},
  {...exercise('Reverse crunch',2,'12–15','Kantel het bekken omhoog, zonder met de benen te zwaaien.','Mat'),arms:2,position:'Combinatie',group:'Buik'}]});
function installNewPlan(){
 if(!confirm('Nieuw A/B-schema installeren? Je bestaande schema-oefeningen gaan naar de bibliotheek; historie en persoonlijke gegevens blijven bewaard. Maak bij voorkeur eerst een JSON-back-up.'))return;
 const next=newPlan();const old=allExercises();
 for(const k of ['A','B'])for(const e of next[k]){const prev=old.find(x=>x.name.toLowerCase()===e.name.toLowerCase());if(prev){e.id=prev.id;e.devices=prev.devices||e.devices;e.notes=prev.notes||'';}}
 const ids=new Set([...next.A,...next.B].map(x=>x.id));for(const e of [...db.plans.A,...db.plans.B])if(!ids.has(e.id)&&!db.library.some(x=>x.id===e.id))db.library.push(e);
 db.plans=next;db.settings.newPlanInstalled=true;save();plan='A';render();toast('Nieuw schema A/B ingesteld. Historie bewaard.');
}
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
db.library=Array.isArray(db.library)?db.library:[];db.library=db.library||[];db.title=db.title||'Gym Progress';
db.settings=db.settings||{};db.settings.restSeconds=Number(db.settings.restSeconds)||60;
// Eenmalige migratie: bestaande expliciete rustkeuze behouden, oude standaard 90 wordt 60.
if(!db.settings.restDefaultMigrated){if(db.settings.restSeconds===90)db.settings.restSeconds=60;db.settings.restDefaultMigrated=true;}
const DEFAULT_DEVICES=['Kabelstation','Kabelstation 1','Kabelstation 2','Lat pulldown','Seated row','Leg press','Smith machine','Squat rack','Halters / dumbbells','Halterstang / barbell','Trainingsbank','Mat / lichaamsgewicht','Overig'];
function deviceCatalog(){return db.settings.devices||[];}
function deviceOptions(selected=[]){const values=[...new Set([...(selected||[]),...deviceCatalog()])];return values.map(d=>`<label class="device-option"><input type="checkbox" name="exerciseDevice" value="${esc(d)}" ${(selected||[]).includes(d)?'checked':''}> ${esc(d)}</label>`).join('')}
function selectedDevices(form){return [...form.querySelectorAll('input[name="exerciseDevice"]:checked')].map(x=>x.value)}
function manageDevices(){const root=$('app');root.innerHTML=`<h2>Apparaten beheren</h2><p class="muted">Centrale lijst voor alle oefeningen. Selecteer bij iedere oefening één of meerdere apparaten. Eerdere trainingsresultaten blijven ongewijzigd.</p><div class="card"><div id="deviceRows"></div><div class="actions"><input id="newDevice" placeholder="Naam nieuw apparaat" aria-label="Nieuw apparaat"><button id="addDevice">+ Toevoegen</button></div></div><button class="secondary" id="deviceBack">Terug naar instellingen</button>`;function draw(){const target=$('deviceRows');target.innerHTML=deviceCatalog().map((name,i)=>`<div class="row device-row"><span class="grow">${esc(name)}</span><button class="secondary tiny" data-rename-device="${i}">Hernoem</button><button class="danger tiny" data-delete-device="${i}">Verwijder</button></div>`).join('')||'<p>Er zijn nog geen apparaten.</p>';target.querySelectorAll('[data-rename-device]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.renameDevice),old=deviceCatalog()[i],v=prompt('Nieuwe naam apparaat',old)?.trim();if(!v||v===old)return;if(deviceCatalog().some((x,j)=>j!==i&&x.toLowerCase()===v.toLowerCase()))return alert('Dit apparaat bestaat al.');db.settings.devices[i]=v;for(const ex of allExercises())if(ex.devices)ex.devices=ex.devices.map(x=>x===old?v:x);if(active)for(const ex of active.exercises)if(ex.device===old)ex.device=v;save();draw()});target.querySelectorAll('[data-delete-device]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.deleteDevice),old=deviceCatalog()[i];if(!confirm(`Apparaat “${old}” verwijderen uit de centrale lijst en de oefeningkeuzes? Historische sessies blijven ongewijzigd.`))return;db.settings.devices.splice(i,1);for(const ex of allExercises())if(ex.devices)ex.devices=ex.devices.filter(x=>x!==old);save();draw()})}draw();$('addDevice').onclick=()=>{const v=$('newDevice').value.trim();if(!v)return;if(deviceCatalog().some(x=>x.toLowerCase()===v.toLowerCase()))return alert('Dit apparaat staat al in de lijst.');db.settings.devices.push(v);$('newDevice').value='';save();draw()};$('newDevice').onkeydown=e=>{if(e.key==='Enter')$('addDevice').click()};$('deviceBack').onclick=backup;}
if(!Array.isArray(db.settings.devices)){const old=[...new Set(allExercises().flatMap(e=>e.devices||[]).filter(Boolean))];db.settings.devices=[...new Set([...DEFAULT_DEVICES,...old])];try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){}}
let updateReady=false,swRegistration=null;
let tab='home',plan='A',active=null,editingOriginal=null,chartExercise='',chartDevice='';
const DRAFT_KEY='gym-progress-active-v1';
try{const draft=JSON.parse(localStorage.getItem(DRAFT_KEY)||'null');if(draft?.exercises&&draft?.date)active=draft}catch{}
let rest={until:0,remaining:0,paused:false};
function persistDraft(){try{if(active)localStorage.setItem(DRAFT_KEY,JSON.stringify(active));else localStorage.removeItem(DRAFT_KEY)}catch(e){console.warn(e)}}
function restDuration(ex){const original=allExercises().find(x=>x.id===ex?.exerciseId);return Math.max(15,Math.min(600,Number(original?.restSeconds||db.settings.restSeconds||60)))}
function startRest(ex){rest={until:Date.now()+restDuration(ex)*1000,remaining:restDuration(ex),paused:false};refreshRest()}
function remainingRest(){return Math.max(0,rest.paused?rest.remaining:Math.ceil((rest.until-Date.now())/1000))}
function refreshRest(){const el=document.getElementById('restDock');if(!el)return;const left=remainingRest();el.hidden=!rest.paused&&left===0;if(!el.hidden){const time=el.querySelector('[data-rest-clock]');if(time)time.textContent=`${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}`;const pause=el.querySelector('[data-rest-pause]');if(pause)pause.textContent=rest.paused?'▶ Hervat':'Ⅱ Pauze';const ring=el.querySelector('[data-rest-ring]');if(ring)ring.style.setProperty('--progress',Math.min(100,100*(1-left/Math.max(1,restDuration(active?.exercises?.[0]))))+'%')}}
setInterval(refreshRest,1000);
function toggleRest(){if(rest.paused){rest.until=Date.now()+rest.remaining*1000;rest.paused=false}else{rest.remaining=remainingRest();rest.paused=true}refreshRest()}
function adjustRest(n){const next=remainingRest()+n;rest.remaining=Math.max(0,next);rest.until=Date.now()+rest.remaining*1000;refreshRest()}
function skipRest(){rest={until:0,remaining:0,paused:false};refreshRest()}
function restDock(){return `<div id="restDock" class="rest-dock" hidden><div class="rest-top"><span class="muted">◷ RUSTTIMER</span><strong data-rest-clock>01:00</strong></div><div class="rest-actions"><button class="secondary tiny" data-rest-pause>Ⅱ Pauze</button><button class="secondary tiny" data-rest-add>+30 sec</button><button class="secondary tiny" data-rest-skip>Overslaan</button></div></div>`}
function bindRest(){const d=document.getElementById('restDock');if(!d)return;d.querySelector('[data-rest-pause]').onclick=toggleRest;d.querySelector('[data-rest-add]').onclick=()=>adjustRest(30);d.querySelector('[data-rest-skip]').onclick=skipRest;refreshRest()}
function bestFor(exid,device){return db.sessions.flatMap(s=>s.exercises.filter(e=>e.exerciseId===exid&&e.device===device).flatMap(e=>e.sets.filter(s=>!s.warmup))).reduce((a,x)=>Math.max(a,Number(x.weight)||0),0)}

const $=id=>document.getElementById(id);const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n).toLocaleString('nl-NL',{maximumFractionDigits:2});
function save(){try{localStorage.setItem(KEY,JSON.stringify(db));window.gymCloudChanged?.()}catch(e){alert('Opslaan mislukt. Maak een back-up en controleer beschikbare opslagruimte.')}}
function allExercises(){return [...db.plans.A,...db.plans.B,...(db.library||[])]}
function nav(){
 const tabs=[['home','Trainen','⌂'],['progress','Voortgang','▥'],['manage','Beheren','☷']];
 const selected=['plans','library','backup'].includes(tab)?'manage':['history'].includes(tab)?'progress':tab;
 $('nav').innerHTML=tabs.map(([t,l,icon])=>`<button class="${selected===t?'active':''}" data-tab="${t}">${icon}<span>${l}</span></button>`).join('');
 document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render()});
}
function manage(){
 $('app').innerHTML=`<div class="page-heading"><h2>Beheren</h2><p class="muted">Pas je trainingen en instellingen aan.</p></div><div class="manage-menu">
 <button data-go="plans"><strong>Trainingsschema's</strong><small>Training A en B aanpassen</small><span>›</span></button>
 <button data-go="library"><strong>Oefeningenbibliotheek</strong><small>Oefeningen en uitleg beheren</small><span>›</span></button>
 <button data-go="backup"><strong>Apparaten & instellingen</strong><small>Apparaten, back-up en cloud</small><span>›</span></button></div>`;
 document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{tab=b.dataset.go;render()});
}
function render(){document.getElementById('appTitle').textContent=db.title||'Gym Progress';document.title=db.title||'Gym Progress';nav();({home,plans,library,history,progress,backup,manage})[tab]();goManageBack();showUpdateBanner();}
function goManageBack(){if(['plans','library','backup'].includes(tab)){$('app').insertAdjacentHTML('afterbegin','<button class="back-link" id="manageBack">‹ Beheren</button>');$('manageBack').onclick=()=>{tab='manage';render()}}}
function library(){
 const all=[...new Map(allExercises().map(e=>[e.id,e])).values()].sort((a,b)=>a.name.localeCompare(b.name));
 $('app').innerHTML=`<h2>Oefeningenbibliotheek</h2><p class="muted">Alle oefeningen blijven hier beschikbaar, ook buiten je schema.</p><input id="librarySearch" placeholder="Zoek oefening…" aria-label="Zoek oefening"><div id="libraryList"></div><button id="libraryNew">+ Nieuwe oefening</button>`;
 const show=()=>{$('libraryList').innerHTML=all.filter(e=>e.name.toLowerCase().includes($('librarySearch').value.toLowerCase())).map(e=>`<div class="card"><h3>${esc(e.name)}</h3><p class="muted">${esc(e.repRange||e.targetReps)} reps · ${esc((e.devices||[]).join(', '))}</p>${e.guide?`<p>${esc(e.guide)}</p>`:''}<div class="actions">${['A','B'].map(k=>`<button class="secondary tiny" data-library-add="${esc(e.id)}" data-target="${k}" ${db.plans[k].some(x=>x.id===e.id)?'disabled':''}>${db.plans[k].some(x=>x.id===e.id)?'✓ In '+k:'+ Naar '+k}</button>`).join('')}<button class="secondary tiny" data-library-edit="${esc(e.id)}">Bewerken</button></div></div>`).join('')||'<p>Geen oefeningen gevonden.</p>';
 document.querySelectorAll('[data-library-add]').forEach(b=>b.onclick=()=>{const e=all.find(x=>x.id===b.dataset.libraryAdd);db.plans[b.dataset.target].push(e);save();show()});
 document.querySelectorAll('[data-library-edit]').forEach(b=>b.onclick=()=>{const e=all.find(x=>x.id===b.dataset.libraryEdit);editLibraryExercise(e)});
 };$('librarySearch').oninput=show;$('libraryNew').onclick=()=>editLibraryExercise(starter(''),true);show();
}
function editLibraryExercise(ex,isNew=false){
 const original=plan;const idx=db.plans.A.findIndex(x=>x.id===ex.id);const idxB=db.plans.B.findIndex(x=>x.id===ex.id);
 // Bewerk bestaande oefening via het bestaande formulier; maak nieuwe aan in bibliotheek.
 if(!isNew&&(idx>=0||idxB>=0)){plan=idx>=0?'A':'B';editExercise(idx>=0?idx:idxB);return}
 $('app').innerHTML=`<h2>${isNew?'Nieuwe oefening':'Oefening bewerken'}</h2><form id="libraryForm" class="card"><label>Naam</label><input id="lname" required value="${esc(ex.name)}"><label>Apparaten (meerdere mogelijk)</label><div class="device-picker">${deviceOptions(ex.devices||[])}</div><p class="muted">Beheer de lijst bij Back-up en instellingen → Apparaten.</p><label>Uitvoering</label><textarea id="lguide">${esc(ex.guide||'')}</textarea><label>Sets</label><input id="lsets" type="number" min="1" value="${ex.targetSets||3}"><label>Herhalingen</label><input id="lreps" value="${esc(ex.repRange||ex.targetReps||12)}"><button type="submit">Opslaan</button><button class="secondary" type="button" id="lback">Terug</button></form>`;
 $('lback').onclick=()=>{tab='library';render()};$('libraryForm').onsubmit=ev=>{ev.preventDefault();Object.assign(ex,{name:$('lname').value.trim(),devices:selectedDevices($('libraryForm')),guide:$('lguide').value,targetSets:Math.max(1,Number($('lsets').value)||3),targetReps:parseInt($('lreps').value)||12,repRange:$('lreps').value});if(isNew)db.library.push(ex);save();tab='library';render()};
}
function warmWeight(exid,device){const work=Number(previousLastWeight(exid,device));return work>0?Math.max(0,Math.round(work*.5/2.5)*2.5):''}
function checkin(p){
 if(active?.plan===p){drawSession();return}
 $('app').innerHTML=`<h2>Check-in · Training ${p}</h2><div class="card"><p>Hoe voel je je voordat je begint?</p><label>Energie (1 laag – 5 hoog)</label><input type="range" min="1" max="5" value="3" id="energy"><strong id="energyValue">3/5</strong><label>Spierpijn (1 geen – 5 veel)</label><input type="range" min="1" max="5" value="1" id="soreness"><strong id="sorenessValue">1/5</strong><div class="actions"><button id="checkinGo">Training starten</button><button class="secondary" id="checkinSkip">Overslaan</button></div></div>`;
 for(const id of ['energy','soreness'])$(id).oninput=()=>$(id+'Value').textContent=$(id).value+'/5';
 $('checkinGo').onclick=()=>start(p,{energy:Number($('energy').value),soreness:Number($('soreness').value)});$('checkinSkip').onclick=()=>start(p);
}
function celebratePR(ex,weight,kind,previous){
 const modal=document.createElement('div');modal.className='pr-overlay';modal.innerHTML=`<div class="pr-dialog"><div class="pr-trophy">🏆</div><h2>Persoonlijk record!</h2><h3>${esc(ex.name)}</h3><p>${kind==='weight'?'Nieuw gewichtsrecord':'Meer herhalingen op hetzelfde gewicht'}</p><div class="pr-number">${fmt(weight)} kg</div><p class="muted">${kind==='weight'?'Vorig record: '+fmt(previous)+' kg':'Goed bezig!'}</p><button id="prClose">Verder trainen</button></div>`;document.body.append(modal);modal.querySelector('#prClose').onclick=()=>modal.remove();if(navigator.vibrate)navigator.vibrate([80,40,80]);setTimeout(()=>{if(modal.isConnected)modal.remove()},5000)
}
function priorPR(exid,device){const sets=db.sessions.flatMap(s=>(s.exercises||[]).filter(e=>e.exerciseId===exid&&e.device===device).flatMap(e=>e.sets||[])).filter(s=>!s.warmup&&Number(s.reps)>0);return {weight:Math.max(0,...sets.map(s=>Number(s.weight)||0)),sets}}

function home(){
 const recent=db.sessions.filter(s=>Date.now()-new Date(s.date).getTime()<28*86400000);
 const sets=recent.reduce((n,s)=>n+s.exercises.reduce((a,e)=>a+e.sets.length,0),0);
 const volume=recent.reduce((n,s)=>n+s.exercises.reduce((a,e)=>a+e.sets.filter(x=>!x.warmup).reduce((v,x)=>v+(Number(x.weight)||0)*(Number(x.reps)||0),0),0),0);
 const count=recent.length;
 const lastByPlan=p=>db.sessions.filter(s=>s.plan===p).sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
 const recentCards=['A','B'].map(p=>{
  const session=lastByPlan(p),ongoing=active?.plan===p;
  const subtitle=ongoing?'Bezig · tik om verder te gaan':session?new Date(session.date).toLocaleDateString('nl-NL',{day:'numeric',month:'short',year:'numeric'})+' · '+session.exercises.length+' oefeningen':'Nog geen afgeronde training';
  const action=ongoing?'Hervatten':session?'Resultaten bekijken':'Starten';
  return `<button class="recent-workout" data-recent-plan="${p}" aria-label="Training ${p}: ${action}"><span class="recent-letter recent-${p}">${p}</span><span class="recent-info"><strong>Training ${p}</strong><small>${esc(subtitle)}</small></span><span class="recent-action">${action} <span aria-hidden="true">›</span></span></button>`;
 }).join('');
 $('app').innerHTML=`<div class="compact-home-head"><div><div class="eyebrow">GYM PROGRESS</div><h2>Klaar om te trainen?</h2><p class="muted">Kies je training en ga aan de slag.</p></div><img src="fox-mark.png" alt="" aria-hidden="true"></div>
 ${active?`<button class="resume-cta" id="resumeNow">▶ Training ${esc(active.plan)} hervatten <span>›</span></button>`:''}
 <div class="workout-list clean-workouts">${['A','B'].map(p=>`<button class="workout-tile workout-${p}" data-start="${p}"><span class="workout-symbol">${p}</span><span class="workout-info"><strong>Training ${p}</strong><small>${p==='A'?'Schouders · Armen · Buik':'Borst · Rug · Benen · Buik'} · ${db.plans[p].length} oefeningen</small></span><span class="workout-arrow">›</span></button>`).join('')}</div>
 <div class="section-head"><h2>Laatste trainingen</h2><button class="text-link" id="goHistory">Bekijk alles ›</button></div><div class="recent-workouts">${recentCards}</div>`;
 if(active&&$('resumeNow'))$('resumeNow').onclick=drawSession;
 document.querySelectorAll('[data-start]').forEach(b=>b.onclick=()=>{const p=b.dataset.start;if(active?.plan===p){drawSession();return}checkin(p)});
 document.querySelectorAll('[data-recent-plan]').forEach(b=>b.onclick=()=>{
  const p=b.dataset.recentPlan;
  if(active?.plan===p){drawSession();return}
  const session=lastByPlan(p);
  if(session){showRecentSession(session);return}
  checkin(p);
 });
 $('goHistory').onclick=()=>{tab='history';render()};
}
function showRecentSession(session){
 const p=session.plan;
 const rows=(session.exercises||[]).map(e=>`<section class="card"><h3>${esc(e.name)}</h3><p class="muted">${esc(e.device||'')}</p><p>${(e.sets||[]).map(x=>`${fmt(x.weight)} kg × ${esc(x.reps)}`).join(' · ')}</p></section>`).join('');
 $('app').innerHTML=`<div class="row"><button class="secondary tiny" id="backToHome">← Dashboard</button></div><div class="section-head"><h2>Training ${esc(p)} · laatste sessie</h2></div><p class="muted">${new Date(session.date).toLocaleString('nl-NL')}</p>${session.notes?`<div class="card"><strong>Notities</strong><p>${esc(session.notes)}</p></div>`:''}${rows}<button id="repeatTraining" style="width:100%">Nieuwe training ${esc(p)} starten</button>`;
 $('backToHome').onclick=()=>{tab='home';render()};
 $('repeatTraining').onclick=()=>checkin(p);
}
// Gebruik de laatste geregistreerde set op hetzelfde apparaat als gewichtssuggestie.
// Vul alleen de eerste set in; reps blijven leeg en handmatige invoer wordt niet overschreven.
function previousLastWeight(exerciseId,device){
 const sessions=[...db.sessions].sort((a,b)=>new Date(b.date)-new Date(a.date));
 for(const session of sessions){
  const ex=(session.exercises||[]).find(x=>x.exerciseId===exerciseId&&x.device===device);
  if(!ex)continue;
  const valid=(ex.sets||[]).filter(set=>!set.warmup&&set.weight!==''&&set.weight!==null&&set.weight!==undefined&&Number.isFinite(Number(String(set.weight).replace(',','.')))&&Number(String(set.weight).replace(',','.'))>=0&&Number(set.reps)>0);
  if(valid.length)return String(valid[valid.length-1].weight).replace(',','.');
 }
 return '';
}
function start(p,checkinData=null){if(active&&!confirm('Je hebt nog een lopende training. Een nieuwe training starten?'))return;editingOriginal=null;active={id:uid(),date:new Date().toISOString(),plan:p,checkin:checkinData,exercises:db.plans[p].map(e=>({exerciseId:e.id,name:e.name,device:e.devices[0]||'Onbekend',warmup:{reps:12,weight:warmWeight(e.id,e.devices[0]||'Onbekend'),done:false,enabled:false},sets:Array.from({length:e.targetSets||3},(_,i)=>({reps:'',weight:i===0?previousLastWeight(e.id,e.devices[0]||'Onbekend'):''}))}))};persistDraft();drawSession()}
function lastSet(exid,device,index){for(const s of db.sessions)for(const e of s.exercises)if(e.exerciseId===exid&&e.device===device&&e.sets[index])return e.sets[index];return null}
function isFinished(e){return !e.skipped&&e.sets?.length>0&&e.sets.every(s=>s.done===true)}
function organizeSessionCards(){
 const app=$('app');if(!active||!app)return;
 const cards=[...app.querySelectorAll('[data-session-ex]')];
 const current=cards.find(c=>{const e=active.exercises[Number(c.dataset.sessionEx)];return !e.skipped&&!isFinished(e)})||cards[0];
 cards.forEach(card=>{
  const idx=Number(card.dataset.sessionEx),e=active.exercises[idx];
  const details=document.createElement('details');details.className='exercise-details';
  details.open=card===current&&!e.skipped&&!isFinished(e);
  const summary=document.createElement('summary');summary.className='exercise-summary';
  const count=e.sets.filter(x=>x.done).length;
  summary.innerHTML=`<span class="exercise-summary-name">${esc(e.name)}</span><span class="exercise-summary-status">${e.skipped?'Overgeslagen':isFinished(e)?'Afgerond':count+'/'+e.sets.length+' sets'} <span aria-hidden="true">⌄</span></span>`;
  const content=document.createElement('div');content.className='exercise-content';
  while(card.firstChild)content.appendChild(card.firstChild);
  details.append(summary,content);card.appendChild(details);
  // Advanced controls stay available but no longer dominate the training view.
  const advanced=document.createElement('details');advanced.className='exercise-advanced';
  const advancedSummary=document.createElement('summary');advancedSummary.textContent='Meer opties · RIR · uitleg';
  advanced.append(advancedSummary);
  const guide=[...content.querySelectorAll('p')];guide.forEach(el=>{if(el.textContent.includes('Uitvoering:')||el.textContent.includes('Mijn aandachtspunten:')||el.textContent.includes('Combinatieblok:'))advanced.appendChild(el)});
  [...content.querySelectorAll('label')].filter(el=>el.textContent.includes('RIR (optioneel)')).forEach(el=>{const sel=el.nextElementSibling;advanced.appendChild(el);if(sel&&sel.matches('select[data-rir]'))advanced.appendChild(sel)});
  const actions=content.querySelector('.actions');if(actions)advanced.appendChild(actions);
  const rest=content.querySelector('.rest-label');if(rest)advanced.appendChild(rest);
  content.appendChild(advanced);
 });
 const completed=cards.filter(c=>isFinished(active.exercises[Number(c.dataset.sessionEx)]));
 const skipped=cards.filter(c=>active.exercises[Number(c.dataset.sessionEx)]?.skipped);
 for(const [title,group] of [['Afgeronde oefeningen',completed],['Overgeslagen oefeningen',skipped]]){
  if(!group.length)continue;
  const details=document.createElement('details');details.className='card session-group';
  const summary=document.createElement('summary');summary.textContent=title+' ('+group.length+')';details.append(summary);
  group.forEach(card=>details.append(card));
  const dock=app.querySelector('#restDock');app.insertBefore(details,dock);
 }
}
function drawSession(){if(!active)return;tab='home';nav();$('app').innerHTML=`<div class="row session-heading"><h2 class="grow">Training ${esc(active.plan)}</h2><button class="secondary tiny" id="cancel">Annuleer</button></div><p class="muted">${new Date(active.date).toLocaleString('nl-NL')}</p>${active.exercises.map((e,i)=>({e,i})).sort((a,b)=>Number(a.e.skipped)-Number(b.e.skipped)||Number(isFinished(a.e))-Number(isFinished(b.e))||a.i-b.i).map(({e,i})=>{const orig=allExercises().find(x=>x.id===e.exerciseId);const devices=[...new Set([...(orig?.devices||[]),e.device])];return `<section class="card exercise-card" data-session-ex="${i}"><div class="eyebrow">OEFENING ${i+1} VAN ${active.exercises.length} <span class="exercise-index">${String(i+1).padStart(2,"0")}</span></div><h3>${esc(e.name)}</h3><p class="muted">${e.skipped?'⏭ Overgeslagen':isFinished(e)?'✓ Afgerond':'● Nog te doen'}</p><p class="muted">Doel: ${esc(orig?.targetSets||e.sets.length)} × ${esc(orig?.repRange||orig?.targetReps||'–')} · ${esc(orig?.arms===1?'1 arm':orig?.arms===2?'2 armen':'')} · ${esc(orig?.position||'')}</p>${orig?.pair?`<p class="muted">Combinatieblok: ${esc(orig.pair)} · links → rechts per oefening, dan volgende variant</p>`:''}${orig?.guide?`<p><strong>Uitvoering:</strong> ${esc(orig.guide)}</p>`:''}${orig?.notes?`<p><strong>Mijn aandachtspunten:</strong> ${esc(orig.notes)}</p>`:''}<label>Apparaat</label><select data-device="${i}">${devices.map(d=>`<option ${d===e.device?'selected':''}>${esc(d)}</option>`).join('')}</select><div class="space"></div><div class="warmup-line"><label><input type="checkbox" data-warm-enabled="${i}" ${e.warmup?.enabled?'checked':''}> 1 warming-upset</label><span class="muted">Voorstel: 50% werkgewicht</span></div>${e.warmup?.enabled?`<div class="set"><strong>W</strong><input type="text" inputmode="decimal" value="${esc(String(e.warmup.weight).replace('.',','))}" data-warm-field="weight" data-warm-i="${i}"><input type="number" min="1" value="${esc(e.warmup.reps)}" data-warm-field="reps" data-warm-i="${i}"><button class="set-check ${e.warmup.done?'done':''}" data-warm-done="${i}">${e.warmup.done?'✓':'○'}</button></div>`:''}<div class="set-heading"><span>Set</span><span>Gewicht (kg)</span><span>Reps</span><span>✓</span></div>${e.sets.map((s,j)=>`<div class="set"><strong>${j+1}</strong><div><input type="text" inputmode="decimal" placeholder="kg (bijv. 12,5)" value="${esc(String(s.weight).replace('.',','))}" data-field="weight" data-i="${i}" data-j="${j}"></div><div><input type="number" inputmode="numeric" min="0" step="1" placeholder="reps" value="${esc(s.reps)}" data-field="reps" data-i="${i}" data-j="${j}"></div><button class="set-check ${s.done?'done':''}" aria-label="Set ${j+1} afronden" data-done="${i},${j}">${s.done?'✓':'○'}</button></div><label class="muted">RIR (optioneel) · set ${j+1}</label><select data-rir="${i},${j}"><option value="">Niet ingevuld</option>${['0','1','2','3','4+'].map(v=>`<option value="${v}" ${String(s.rir??'')===v?'selected':''}>${v} herhalingen over</option>`).join('')}</select>`).join('')}<div class="muted" style="font-size:12px">${(()=>{const prev=db.sessions.flatMap(s=>s.exercises.filter(x=>x.exerciseId===e.exerciseId&&x.device===e.device)).find(x=>x.sets.length);return prev?'Vorige keer op dit apparaat: '+prev.sets.map((s,k)=>'set '+(k+1)+': '+fmt(s.weight)+' kg × '+s.reps).join(' · '):'Nog geen eerdere sets op dit apparaat'})()}</div><div class="actions"><button class="secondary tiny" data-skip="${i}">${e.skipped?'↶ Toch uitvoeren':'⏭ Overslaan'}</button><button class="secondary tiny" data-addset="${i}">+ Set</button><button class="secondary tiny" data-remove-last="${i}">− Set</button><button class="secondary tiny" data-copy="${i}">Kopieer vorige set</button></div><label class="rest-label">Rust na set <select data-ex-rest="${i}"><option value="60" ${restDuration(e)===60?'selected':''}>60 sec</option><option value="90" ${restDuration(e)===90?'selected':''}>90 sec</option><option value="120" ${restDuration(e)===120?'selected':''}>120 sec</option><option value="180" ${restDuration(e)===180?'selected':''}>180 sec</option></select></label></section>`}).join('')}<div class="card"><label>Notities bij deze training</label><textarea id="sessionNotes" rows="2" placeholder="Hoe ging het vandaag?">${esc(active.notes||'')}</textarea></div>${restDock()}<div class="card"><label>Extra oefening uit bibliotheek</label><select id="extraExercise"><option value="">Kies een oefening…</option>${[...new Map(allExercises().map(x=>[x.id,x])).values()].filter(x=>!active.exercises.some(y=>y.exerciseId===x.id)).map(x=>`<option value="${esc(x.id)}">${esc(x.name)}</option>`).join('')}</select><button class="secondary" id="addExtraExercise">+ Toevoegen aan deze sessie</button></div><div class="card"><h3>Evaluatie na training</h3><label>Inspanning (1–10)</label><select id="effort">${Array.from({length:10},(_,i)=>`<option value="${i+1}" ${Number(active.evaluation?.effort||7)===i+1?'selected':''}>${i+1}</option>`).join('')}</select><label>Spierpijn na training (1–5)</label><select id="afterSoreness">${Array.from({length:5},(_,i)=>`<option value="${i+1}" ${Number(active.evaluation?.soreness||1)===i+1?'selected':''}>${i+1}</option>`).join('')}</select></div><button id="finish" style="width:100%">Training opslaan</button>`;
 document.querySelectorAll('[data-rir]').forEach(el=>el.onchange=()=>{const [i,j]=el.dataset.rir.split(',').map(Number);active.exercises[i].sets[j].rir=el.value;persistDraft()});document.querySelectorAll('[data-skip]').forEach(el=>el.onclick=()=>{const ex=active.exercises[+el.dataset.skip];ex.skipped=!ex.skipped;persistDraft();drawSession()});$('addExtraExercise').onclick=()=>{const id=$('extraExercise').value;const x=allExercises().find(z=>z.id===id);if(!x)return;const device=x.devices[0]||'Onbekend';active.exercises.push({exerciseId:x.id,name:x.name,device,extra:true,sets:Array.from({length:x.targetSets||2},(_,i)=>({reps:'',weight:i===0?previousLastWeight(x.id,device):''}))});persistDraft();drawSession()};for(const id of ['effort','afterSoreness'])$(id).onchange=()=>{active.evaluation={effort:Number($('effort').value),soreness:Number($('afterSoreness').value)};persistDraft()};document.querySelectorAll('[data-warm-enabled]').forEach(el=>el.onchange=()=>{const e=active.exercises[+el.dataset.warmEnabled];e.warmup=e.warmup||{weight:warmWeight(e.exerciseId,e.device),reps:12};e.warmup.enabled=el.checked;persistDraft();drawSession()});document.querySelectorAll('[data-warm-field]').forEach(el=>el.oninput=()=>{active.exercises[+el.dataset.warmI].warmup[el.dataset.warmField]=el.dataset.warmField==='weight'?el.value.replace(',','.'):el.value;persistDraft()});document.querySelectorAll('[data-warm-done]').forEach(el=>el.onclick=()=>{const e=active.exercises[+el.dataset.warmDone];if(!Number(e.warmup.reps)||e.warmup.weight===''){alert('Vul warming-upgewicht en herhalingen in.');return}e.warmup.done=!e.warmup.done;if(e.warmup.done)startRest(e);persistDraft();drawSession()});
 document.querySelectorAll('[data-field]').forEach(el=>el.oninput=()=>{active.exercises[+el.dataset.i].sets[+el.dataset.j][el.dataset.field]=(el.dataset.field==='weight'?el.value.replace(',', '.'):el.value);persistDraft()});document.querySelectorAll('[data-device]').forEach(el=>el.onchange=()=>{const ex=active.exercises[+el.dataset.device];ex.device=el.value;if(ex.sets[0]&&ex.sets[0].reps===''&&!ex.sets[0].done){ex.sets[0].weight=previousLastWeight(ex.exerciseId,el.value);if(ex.warmup&&!ex.warmup.done)ex.warmup.weight=warmWeight(ex.exerciseId,el.value)}persistDraft();drawSession()});document.querySelectorAll('[data-addset]').forEach(el=>el.onclick=()=>{active.exercises[+el.dataset.addset].sets.push({reps:'',weight:''});persistDraft();drawSession()});document.querySelectorAll('[data-delset]').forEach(el=>el.onclick=()=>{active.exercises[+el.dataset.delset.split(',')[0]].sets.splice(+el.dataset.delset.split(',')[1],1);persistDraft();drawSession()});document.querySelectorAll('[data-copy]').forEach(el=>el.onclick=()=>{let e=active.exercises[+el.dataset.copy],s=e.sets[e.sets.length-1]||{reps:'',weight:''};e.sets.push({...s,done:false});persistDraft();drawSession()});document.querySelectorAll('[data-remove-last]').forEach(el=>el.onclick=()=>{const sets=active.exercises[+el.dataset.removeLast].sets;if(sets.length>1){sets.pop();persistDraft();drawSession()}});
 document.querySelectorAll('[data-done]').forEach(el=>el.onclick=()=>{const [i,j]=el.dataset.done.split(',').map(Number),ex=active.exercises[i],set=ex.sets[j];if(!set.done&&(!set.reps||set.weight===''||Number(set.reps)<=0)){alert('Vul eerst gewicht en herhalingen in.');return}set.done=!set.done;if(set.done){const prior=priorPR(ex.exerciseId,ex.device);const w=Number(set.weight),r=Number(set.reps);if(prior.sets.length&&w>prior.weight)celebratePR(ex,w,'weight',prior.weight);else if(prior.sets.length&&w===prior.weight&&r>Math.max(0,...prior.sets.filter(s=>Number(s.weight)===w).map(s=>Number(s.reps)||0)))celebratePR(ex,w,'reps',prior.weight);startRest(ex)}persistDraft();drawSession()});
 document.querySelectorAll('[data-ex-rest]').forEach(el=>el.onchange=()=>{const ex=active.exercises[+el.dataset.exRest];const orig=allExercises().find(x=>x.id===ex.exerciseId);if(orig){orig.restSeconds=Number(el.value);save()}persistDraft()});
 $('sessionNotes').oninput=e=>{active.notes=e.target.value;persistDraft()};bindRest();organizeSessionCards();
 $('finish').onclick=()=>{const clean=active.exercises.filter(e=>!e.skipped).map(e=>({...e,sets:e.sets.filter(s=>s.reps!==''&&s.weight!==''&&Number(s.reps)>0&&Number(String(s.weight).replace(',','.'))>=0).map(s=>({reps:Number(s.reps),weight:Number(String(s.weight).replace(',','.')),rir:s.rir??null,done:!!s.done}))})).filter(e=>e.sets.length);if(!clean.length){alert('Vul minimaal één set met gewicht en herhalingen in.');return}if(editingOriginal){db.sessions=db.sessions.filter(s=>s.id!==editingOriginal.id);editingOriginal=null}db.sessions.unshift({...active,evaluation:active.evaluation||{effort:7,soreness:1},skippedExercises:active.exercises.filter(e=>e.skipped).map(e=>({exerciseId:e.exerciseId,name:e.name})),endDate:new Date().toISOString(),exercises:clean.map((e,i)=>({...e,sets:[...(active.exercises.find(x=>x.exerciseId===e.exerciseId)?.warmup?.enabled&&active.exercises.find(x=>x.exerciseId===e.exerciseId)?.warmup?.done?[{weight:Number(active.exercises.find(x=>x.exerciseId===e.exerciseId).warmup.weight),reps:Number(active.exercises.find(x=>x.exerciseId===e.exerciseId).warmup.reps),warmup:true}]:[]),...e.sets]}))});active=null;skipRest();persistDraft();save();tab='history';render()};$('cancel').onclick=()=>{if(confirm('Lopende training weggooien?')){active=null;editingOriginal=null;skipRest();persistDraft();render()}}}
function plans(){let items=db.plans[plan];$('app').innerHTML=`<h2>Trainingsschema</h2><div class="card"><strong>Nieuw A/B-schema · oktober 2026</strong><p class="muted">Schouders/armen en borst/rug/benen. Je kiest zelf wanneer je overstapt; historie blijft bewaard.</p><button id="installNewPlan" class="secondary">Nieuw A/B-schema installeren</button></div><div class="row"><button class="${plan==='A'?'':'secondary'}" data-plan="A">Training A</button><button class="${plan==='B'?'':'secondary'}" data-plan="B">Training B</button></div><div class="space"></div>${items.map((e,i)=>`<div class="card"><h3>${esc(e.name)}</h3><p class="muted">${e.targetSets} × ${esc(e.repRange||e.targetReps)} · ${esc(e.arms===1?'1 arm':e.arms===2?'2 armen':'uitvoering naar keuze')} · ${esc(e.position||'Combinatie')} · ${esc(e.devices.join(', '))}</p>${e.guide?`<p><strong>Uitvoering:</strong> ${esc(e.guide)}</p>`:''}${e.notes?`<p><strong>Mijn aandachtspunten:</strong> ${esc(e.notes)}</p>`:''}<div class="actions"><button class="secondary tiny" data-edit="${i}">Bewerken</button><button class="secondary tiny" data-up="${i}" ${i===0?'disabled':''}>↑</button><button class="secondary tiny" data-down="${i}" ${i===items.length-1?'disabled':''}>↓</button><button class="danger tiny" data-remove="${i}">Verwijder</button></div></div>`).join('')}<div class="actions"><button id="add">+ Nieuwe oefening</button><button class="secondary" id="restoreExercise">+ Uit bibliotheek</button></div><p class="muted">Oefeningen uit het schema halen wist nooit je trainingshistorie.</p>`;$('installNewPlan').onclick=installNewPlan;document.querySelectorAll('[data-plan]').forEach(b=>b.onclick=()=>{plan=b.dataset.plan;render()});document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editExercise(+b.dataset.edit));document.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>{let i=+b.dataset.up;[items[i-1],items[i]]=[items[i],items[i-1]];save();render()});document.querySelectorAll('[data-down]').forEach(b=>b.onclick=()=>{let i=+b.dataset.down;[items[i+1],items[i]]=[items[i],items[i+1]];save();render()});document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{if(confirm('Oefening tijdelijk uit dit schema halen? De oefening blijft in de bibliotheek en de historie blijft behouden.')){const removed=items.splice(+b.dataset.remove,1)[0];if(!db.library.some(x=>x.id===removed.id))db.library.push(removed);save();render()}});$('add').onclick=()=>editExercise(-1);$('restoreExercise').onclick=chooseFromLibrary}
function chooseFromLibrary(){
 const candidates=[...(db.library||[]),...db.plans[plan==='A'?'B':'A']].filter((e,i,a)=>!db.plans[plan].some(x=>x.id===e.id)&&a.findIndex(x=>x.id===e.id)===i);
 $('app').innerHTML=`<h2>Oefening toevoegen uit bibliotheek</h2><p class="muted">Je oude resultaten en apparaten blijven aan dezelfde oefening gekoppeld.</p>${candidates.length?candidates.map((e,i)=>`<div class="card"><h3>${esc(e.name)}</h3><p class="muted">${esc(e.targetSets)} sets · ${esc(e.repRange||e.targetReps)}</p><button data-restore="${i}">Toevoegen aan Training ${plan}</button></div>`).join(''):'<div class="card">Geen andere oefeningen beschikbaar. Maak een nieuwe oefening aan.</div>'}<button class="secondary" id="backToPlan">Terug naar schema</button>`;
 document.querySelectorAll('[data-restore]').forEach(b=>b.onclick=()=>{const ex=candidates[+b.dataset.restore];db.plans[plan].push(ex);db.library=db.library.filter(x=>x.id!==ex.id);save();plans()});$('backToPlan').onclick=plans;
}
function editExercise(index){let old=index>=0?db.plans[plan][index]:starter('');$('app').innerHTML=`<h2>${index<0?'Oefening toevoegen':'Oefening bewerken'}</h2><form id="exerciseForm" class="card"><label>Naam oefening</label><input id="ename" required value="${esc(old.name)}"><div class="space"></div><label>Apparaten (meerdere mogelijk)</label><div class="device-picker">${deviceOptions(old.devices||[])}</div><p class="muted">Apparaten beheren kan via Back-up en instellingen.</p><div class="space"></div><label>Korte uitleg / uitvoering</label><textarea id="guide" rows="3" placeholder="Zo voer je de oefening uit">${esc(old.guide||'')}</textarea><div class="space"></div><label>Mijn aandachtspunten</label><textarea id="notes" rows="3" placeholder="Bijvoorbeeld: ellebogen stilhouden, kabel op stand 6">${esc(old.notes||'')}</textarea><div class="space"></div><div class="grid"><div><label>Doelsets</label><input id="sets" type="number" min="1" max="20" value="${old.targetSets}"></div><div><label>Doelherhalingen (bijv. 10–12)</label><input id="reps" type="text" value="${esc(old.repRange||old.targetReps)}"></div></div><div class="actions"><button type="submit">Opslaan</button><button type="button" class="secondary" id="back">Terug</button></div></form>`;$('back').onclick=render;$('exerciseForm').onsubmit=e=>{e.preventDefault();let v={...old,name:$('ename').value.trim(),devices:selectedDevices($('exerciseForm')),targetSets:Math.max(1,Number($('sets').value)||3),targetReps:Math.max(1,parseInt($('reps').value,10)||12),repRange:$('reps').value.trim()||'12',guide:$('guide').value.trim(),notes:$('notes').value.trim()};if(!v.name)return;if(!v.devices.length)v.devices=['Onbekend'];if(index<0)db.plans[plan].push(v);else db.plans[plan][index]=v;save();render()}}
function history(){ $('app').innerHTML=`<h2>Trainingshistorie</h2>${db.sessions.length?db.sessions.map((s,i)=>`<div class="card"><h3>Training ${esc(s.plan)} · ${new Date(s.date).toLocaleDateString('nl-NL')}</h3>${s.checkin?`<p class="muted">Check-in: energie ${s.checkin.energy}/5 · spierpijn ${s.checkin.soreness}/5</p>`:''}${s.evaluation?`<p class="muted">Evaluatie: inspanning ${esc(s.evaluation.effort)}/10 · spierpijn ${esc(s.evaluation.soreness)}/5</p>`:''}${s.skippedExercises?.length?`<p class="muted">Overgeslagen: ${s.skippedExercises.map(x=>esc(x.name)).join(', ')}</p>`:''}${s.notes?`<p class="muted">${esc(s.notes)}</p>`:''}${s.exercises.map(e=>`<p><strong>${esc(e.name)}</strong> <span class="muted">(${esc(e.device)})</span><br>${e.sets.map(x=>`${x.warmup?'Warming-up: ':''}${fmt(x.weight)} kg × ${x.reps}${x.rir!==undefined&&x.rir!==null?' · RIR '+esc(x.rir):''}`).join(' · ')}</p>`).join('')}<div class="actions"><button class="tiny" data-fit-session="${i}">FIT voor Strava / Garmin*</button><button class="secondary tiny" data-json-session="${i}">Volledige sessie (JSON)</button><button class="secondary tiny" data-summary-session="${i}">Kopieer samenvatting</button><button class="secondary tiny" data-edit-session="${i}">Corrigeer</button><button class="danger tiny" data-delete-session="${i}">Verwijder</button></div></div>`).join(''):'Nog geen trainingen. Start training A of B.'}`;document.querySelectorAll('[data-json-session]').forEach(b=>b.onclick=()=>downloadSessionJson(db.sessions[+b.dataset.jsonSession]));document.querySelectorAll('[data-fit-session]').forEach(b=>b.onclick=()=>exportStravaFit(db.sessions[+b.dataset.fitSession]));document.querySelectorAll('[data-summary-session]').forEach(b=>b.onclick=()=>copyStravaSummary(db.sessions[+b.dataset.summarySession]));document.querySelectorAll('[data-delete-session]').forEach(b=>b.onclick=()=>{if(confirm('Deze training definitief verwijderen?')){db.sessions.splice(+b.dataset.deleteSession,1);save();render()}});document.querySelectorAll('[data-edit-session]').forEach(b=>b.onclick=()=>{let i=+b.dataset.editSession;editingOriginal=structuredClone(db.sessions[i]);active=structuredClone(db.sessions[i]);persistDraft();drawSession()})}
function progress(){let exercises=[...new Map([...db.sessions.flatMap(s=>s.exercises),...allExercises()].map(e=>[e.exerciseId||e.id,{id:e.exerciseId||e.id,name:e.name}])).values()];if(!exercises.some(e=>e.id===chartExercise))chartExercise=(db.sessions[0]?.exercises?.[0]?.exerciseId)||exercises[0]?.id||'';let devices=[...new Set(db.sessions.flatMap(s=>s.exercises.filter(e=>e.exerciseId===chartExercise).map(e=>e.device)))];if(chartDevice&&!devices.includes(chartDevice))chartDevice='';let pts=db.sessions.slice().reverse().flatMap(s=>s.exercises.filter(e=>e.exerciseId===chartExercise&&(!chartDevice||e.device===chartDevice)).map(e=>({date:s.date,max:Math.max(0,...e.sets.filter(x=>!x.warmup).map(x=>x.weight)),volume:e.sets.filter(x=>!x.warmup).reduce((a,x)=>a+x.weight*x.reps,0),reps:e.sets.filter(x=>!x.warmup).reduce((a,x)=>a+x.reps,0)})));$('app').innerHTML=`<h2>Voortgang</h2><div class="card"><label>Oefening</label><select id="chartEx">${exercises.map(e=>`<option value="${esc(e.id)}" ${e.id===chartExercise?'selected':''}>${esc(e.name)}</option>`).join('')}</select><div class="space"></div><label>Apparaat</label><select id="chartDev"><option value="">Alle apparaten (niet rechtstreeks vergelijkbaar)</option>${devices.map(d=>`<option ${chartDevice===d?'selected':''}>${esc(d)}</option>`).join('')}</select></div><div class="card"><h3>Hoogste gewicht per training</h3><canvas id="chart" width="640" height="280"></canvas><p class="muted">Filter op één apparaat voor een betrouwbare vergelijking.</p></div><div class="grid"><div class="card"><div class="muted">Laatste topgewicht</div><div class="stat">${pts.length?pts.at(-1).max+' kg':'–'}</div></div><div class="card"><div class="muted">Laatste volume</div><div class="stat">${pts.length?Math.round(pts.at(-1).volume)+' kg':'–'}</div></div></div><div class="card"><h3>Historische meetpunten</h3>${pts.length?pts.slice().reverse().map(p=>`<p>${new Date(p.date).toLocaleDateString('nl-NL')} · ${fmt(p.max)} kg max · ${p.reps} reps · ${Math.round(p.volume)} kg volume</p>`).join(''):'Nog geen gegevens voor deze selectie.'}</div>`;$('chartEx').onchange=e=>{chartExercise=e.target.value;chartDevice='';render()};$('chartDev').onchange=e=>{chartDevice=e.target.value;render()};drawChart(pts)}
function drawChart(pts){let c=$('chart'),ctx=c.getContext('2d'),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#aab9ce';ctx.font='20px system-ui';if(!pts.length){ctx.fillText('Nog geen meetpunten',20,130);return}let vals=pts.map(x=>x.max),lo=Math.max(0,Math.min(...vals)-5),hi=Math.max(...vals)+5;if(hi===lo)hi=lo+1;ctx.strokeStyle='#40516d';ctx.lineWidth=1;for(let k=0;k<5;k++){let y=20+k*55;ctx.beginPath();ctx.moveTo(50,y);ctx.lineTo(620,y);ctx.stroke();ctx.fillText((hi-(hi-lo)*k/4).toFixed(1),3,y+5)}ctx.strokeStyle='#63d5af';ctx.lineWidth=4;ctx.beginPath();vals.forEach((v,i)=>{let x=pts.length===1?330:50+i*570/(pts.length-1),y=240-(v-lo)/(hi-lo)*220;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();ctx.fillStyle='#80edc7';vals.forEach((v,i)=>{let x=pts.length===1?330:50+i*570/(pts.length-1),y=240-(v-lo)/(hi-lo)*220;ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill()})}
function backup(){ $('app').innerHTML=`<h2>Back-up en privacy</h2><p id="cloudSyncBadge" class="muted" role="status">☁ Synchronisatiestatus staat hieronder bij Supabase</p><div class="card"><h3>Je gegevens blijven lokaal</h3><p>Deze app gebruikt lokale browseropslag en optioneel Supabase-cloudopslag. Verwijder je websitegegevens of de app, dan kun je gegevens kwijtraken.</p><button id="export">Download JSON-back-up</button></div><div class="card"><h3>Back-up terugzetten</h3><p class="muted">Veilig herstellen: alleen ontbrekende trainingen toevoegen; huidige schema’s blijven behouden. Cloudsync wordt gepauzeerd.</p><input type="file" id="import" accept=".json,application/json"></div><div class="card"><h3>App-instellingen</h3><button type="button" class="secondary" id="manageDevices">Apparaten beheren (${deviceCatalog().length})</button><p class="muted">Centrale lijst voor apparaten bij je oefeningen.</p><label>Titel bovenaan de app</label><input id="customTitle" maxlength="45" value="${esc(db.title)}"><label>Standaard rusttijd</label><select id="defaultRest"><option value="60" ${db.settings.restSeconds===60?'selected':''}>60 seconden</option><option value="90" ${db.settings.restSeconds===90?'selected':''}>90 seconden</option><option value="120" ${db.settings.restSeconds===120?'selected':''}>120 seconden</option></select><div class="actions"><button id="saveTitle">Titel opslaan</button><button class="secondary" id="checkUpdates">Controleer updates</button></div><p>Geïnstalleerde versie: <strong>${APP_VERSION}</strong></p><p id="updateStatus" class="muted"></p><p>Bewaar regelmatig een back-up in Bestanden of iCloud Drive. Trainingsgegevens worden niet naar GitHub gestuurd.</p></div>`;$('app').insertAdjacentHTML('beforeend',window.gymCloudPanel?.()||'');window.gymCloudBind?.();$('manageDevices').onclick=manageDevices;$('defaultRest').onchange=e=>{db.settings.restSeconds=Number(e.target.value);save()};$('saveTitle').onclick=()=>{db.title=$('customTitle').value.trim()||'Gym Progress';save();render()};$('checkUpdates').onclick=async()=>{if(!swRegistration){$('updateStatus').textContent='Geen offline-serviceworker gevonden.';return} $('updateStatus').textContent='Controleren…';try{await swRegistration.update();$('updateStatus').textContent=updateReady?'Nieuwe versie beschikbaar.':'Je hebt de nieuwste beschikbare versie.';showUpdateBanner()}catch(e){$('updateStatus').textContent='Controle mislukt. Controleer je internetverbinding.'}};$('export').onclick=()=>{let blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='gym-progress-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};$('import').onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let x=JSON.parse(await f.text());if(!x.plans||!Array.isArray(x.plans.A)||!Array.isArray(x.plans.B)||!Array.isArray(x.sessions))throw Error('Ongeldig formaat');if(confirm('Back-up herstellen? De huidige schema’s blijven behouden; ontbrekende trainingssessies worden toegevoegd. Er wordt niets naar Supabase geüpload totdat je dit zelf inschakelt.')){window.gymCloudPauseForRestore?.();const existing=new Set(db.sessions.map(s=>s.id));const added=x.sessions.filter(s=>s&&s.id&&!existing.has(s.id));db.sessions=[...db.sessions,...added].sort((a,b)=>new Date(b.date)-new Date(a.date));active=null;persistDraft();save();render();alert(added.length+' training(en) hersteld. Controleer Historie en Voortgang. Cloudsync staat gepauzeerd; maak nu eerst een JSON-back-up.')}}catch(err){alert('Import mislukt: '+err.message)}}}
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
function toast(message){let e=document.getElementById('gymToast');if(!e){e=document.createElement('div');e.id='gymToast';e.className='toast';document.body.append(e)}e.textContent=message;e.hidden=false;setTimeout(()=>e.hidden=true,3500)}
window.addEventListener('load',setupUpdates);render();

function downloadSessionJson(session){const blob=new Blob([JSON.stringify(session,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='gym-training-'+session.plan+'-'+String(session.date).slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}
function stravaSummary(session){
 const d=new Date(session.date).toLocaleString('nl-NL');
 return `Training ${session.plan} – Krachttraining\n${d}\n${session.checkin?'Check-in: energie '+session.checkin.energy+'/5, spierpijn '+session.checkin.soreness+'/5\n':''}${session.evaluation?'Evaluatie: inspanning '+session.evaluation.effort+'/10, spierpijn '+session.evaluation.soreness+'/5\n':''}${session.notes?'Notities: '+session.notes+'\n':''}${session.skippedExercises?.length?'Overgeslagen: '+session.skippedExercises.map(x=>x.name).join(', ')+'\n':''}\n`+(session.exercises||[]).map(ex=>`${ex.name} (${ex.device||'apparaat onbekend'})\n`+(ex.sets||[]).map((set,i)=>`Set ${i+1}: ${set.reps} × ${fmt(set.weight)} kg${set.rir!==undefined&&set.rir!==null?' · RIR '+set.rir:''}`).join('\n')).join('\n\n');
}
async function copyStravaSummary(session){
 const content=stravaSummary(session);
 try{await navigator.clipboard.writeText(content);alert('Samenvatting gekopieerd. Plak deze in de beschrijving van je Strava-activiteit.')}catch(e){prompt('Kopieer deze samenvatting voor Strava:',content)}
}
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
  // FIT exercise_title (global message 264) carries readable exercise names.
  // Names are UTF-8 and truncated to 96 bytes, with a zero terminator.
  const utf8=new TextEncoder();
  const titleBytes=name=>{const b=Array.from(utf8.encode(String(name||'Oefening'))).slice(0,95);return b.concat(Array(96-b.length).fill(0))};
  def(6,264,[[254,2,0x84],[2,96,0x07]]);
  (session.exercises||[]).forEach((ex,i)=>msg(6,()=>{u16(i);titleBytes(ex.name).forEach(u8)}));
  // Strength set records: repetition count and weight in kilograms.
  def(1,225,[[3,2,0x84],[4,4,0x88],[5,1,0],[6,4,0x86]]);
  let totalSets=0;
  for(const ex of session.exercises||[]){for(const set of ex.sets||[]){
   const reps=Number(set.reps),weight=Number(String(set.weight).replace(',','.'));
   if(!Number.isFinite(reps)||reps<=0||!Number.isFinite(weight)||weight<0)continue;
   msg(1,()=>{u16(Math.min(65534,Math.round(reps)));const f=new DataView(new ArrayBuffer(4));f.setFloat32(0,weight,true);for(let i=0;i<4;i++)u8(f.getUint8(i));u8(1);u32(fitTime(start)+Math.min(elapsed-1,totalSets*30))});totalSets++;
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
  alert('FIT-bestand gedownload. Het bestand bevat oefeningtitels en sets. Strava kan bepaalde details negeren; gebruik zo nodig Kopieer samenvatting.');
 }catch(err){alert('FIT-export mislukt: '+err.message)}
}
