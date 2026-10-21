// Gym Progress 3.9.0: optional private cloud backup/sync; local storage remains authoritative until user opts in.
'use strict';
(()=>{
const BASE_URL='https://dxchjnkmoexgmidwnzio.supabase.co', KEY='sb_publishable_2mXIR8atgq4dCGuiNJeFDg_HczB5lQX';
const TOKEN_KEY='gym-cloud-session-v1', REV_KEY='gym-cloud-revision-v1', DIRTY_KEY='gym-cloud-pending-v1';
let session=null, revision=Number(localStorage.getItem(REV_KEY)||0), enabled=localStorage.getItem('gym-cloud-enabled')==='yes';
let changeCounter=0;let busy=false, timer=null, retryTimer=null, dirty=localStorage.getItem(DIRTY_KEY)==='yes', lastStatus='Cloud nog niet verbonden.';
try{session=JSON.parse(localStorage.getItem(TOKEN_KEY)||'null')}catch{}
function status(s){lastStatus=s;const e=document.getElementById('cloudStatus');if(e)e.textContent=s;const b=document.getElementById('cloudSyncBadge');if(b)b.textContent=s}
async function api(path,opts={}){
 const headers={'apikey':KEY,'Content-Type':'application/json',...(session?.access_token?{'Authorization':'Bearer '+session.access_token}:{}),...(opts.headers||{})};
 const r=await fetch(BASE_URL+path,{...opts,headers});const raw=await r.text();let data;try{data=raw?JSON.parse(raw):null}catch{data=raw}
 if(!r.ok)throw Error(data?.msg||data?.message||data?.error_description||data?.error||'HTTP '+r.status);return data;
}
async function refresh(){if(!session?.refresh_token)throw Error('Log opnieuw in');
 const s=await api('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:session.refresh_token})});
 session=s;localStorage.setItem(TOKEN_KEY,JSON.stringify(s));return s;
}
async function authorized(fn){if(!session)throw Error('Log eerst in');if(Date.now()>(session.expires_at||0)*1000-60000)await refresh();try{return await fn()}catch(e){if(/JWT expired|invalid JWT|401/i.test(e.message)){await refresh();return fn()}throw e}}
async function login(email,password){const s=await api('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})});
 session=s;localStorage.setItem(TOKEN_KEY,JSON.stringify(s));enabled=false;dirty=false;localStorage.removeItem(DIRTY_KEY);localStorage.removeItem('gym-cloud-enabled');status('Ingelogd. Kies eerst de richting van je eerste synchronisatie.');window.gymCloudRefresh?.()}
function logout(){clearTimeout(timer);clearTimeout(retryTimer);session=null;enabled=false;revision=0;dirty=false;localStorage.removeItem(DIRTY_KEY);localStorage.removeItem(TOKEN_KEY);localStorage.removeItem(REV_KEY);localStorage.removeItem('gym-cloud-enabled');status('Uitgelogd. Je lokale gegevens blijven behouden.');window.gymCloudRefresh?.()}
async function read(){return authorized(async()=>{const a=await api('/rest/v1/gym_cloud_state?select=state,revision,updated_at&limit=1');return a?.[0]||null})}
function valid(v){return v&&v.plans&&Array.isArray(v.plans.A)&&Array.isArray(v.plans.B)&&Array.isArray(v.sessions)}
async function upload(first=false){if(busy||!navigator.onLine){if(!navigator.onLine)status('Offline — lokaal opgeslagen, upload volgt bij verbinding.');return}busy=true;status('Bezig met synchroniseren…');try{
 const cloud=await read();if(first&&cloud){status('Cloud bevat al gegevens. Download of vergelijk eerst; er is niets overschreven.');return}
 if(!first&&cloud&&cloud.revision!==revision){enabled=false;localStorage.removeItem('gym-cloud-enabled');status('Synchronisatie gestopt: cloud is elders gewijzigd. Download of vergelijk eerst om gegevensverlies te voorkomen.');return}
 const uploadCounter=changeCounter;const payload=JSON.parse(localStorage.getItem('gym-progress-v1')||'null');if(!valid(payload))throw Error('Lokale trainingsgegevens ontbreken');
 const expected=cloud?.revision||0;
 const result=await authorized(()=>api('/rest/v1/rpc/gym_save_cloud_state',{method:'POST',body:JSON.stringify({p_state:payload,p_expected_revision:expected})}));
 revision=Number(result);localStorage.setItem(REV_KEY,String(revision));enabled=true;localStorage.setItem('gym-cloud-enabled','yes');dirty=changeCounter!==uploadCounter;if(!dirty)localStorage.removeItem(DIRTY_KEY);clearTimeout(retryTimer);retryTimer=null;status(dirty?'Nieuwe wijzigingen wachten op synchronisatie…':'✓ Gesynchroniseerd · cloudversie '+revision);
 }catch(e){status('Nog niet gesynchroniseerd: '+e.message);if(enabled&&dirty&&navigator.onLine){clearTimeout(retryTimer);retryTimer=setTimeout(()=>upload(false),30000)}}finally{busy=false;if(enabled&&dirty&&navigator.onLine&&!retryTimer){scheduleUpload(3000)}}}
async function download(){if(busy)return;busy=true;try{
 const cloud=await read();if(!cloud){status('Cloud is nog leeg. Er is niets geïmporteerd.');return}
 if(!valid(cloud.state))throw Error('Cloud bevat geen geldige Gym Progress-back-up');
 const localNow=JSON.parse(localStorage.getItem('gym-progress-v1')||'null');if(localNow?.sessions?.length&&!cloud.state.sessions.length)throw Error('Cloud heeft 0 trainingen en lokaal staan trainingen. Download geblokkeerd om gegevensverlies te voorkomen.');
 const current=localStorage.getItem('gym-progress-v1');const backup='gym-progress-pre-cloud-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';
 if(!confirm('Cloudgegevens op dit apparaat zetten? De huidige lokale gegevens worden vervangen. Eerst wordt een JSON-back-up gedownload.'))return;
 const blob=new Blob([current||'{}'],{type:'application/json'});const link=document.createElement('a');const u=globalThis.URL.createObjectURL(blob);link.href=u;link.download=backup;link.click();setTimeout(()=>globalThis.URL.revokeObjectURL(u),1500);
 localStorage.setItem('gym-progress-v1',JSON.stringify(cloud.state));revision=cloud.revision;localStorage.setItem(REV_KEY,String(revision));dirty=false;localStorage.removeItem(DIRTY_KEY);enabled=true;localStorage.setItem('gym-cloud-enabled','yes');status('Cloudgegevens geïmporteerd. De app wordt herladen.');location.reload();
 }catch(e){status('Download mislukt: '+e.message)}finally{busy=false}}
function scheduleUpload(delay=1600){if(!enabled||!session||!dirty)return;clearTimeout(timer);if(!navigator.onLine){status('Offline — lokaal opgeslagen, upload volgt bij verbinding.');return}timer=setTimeout(()=>{if(!busy)upload(false);else scheduleUpload(2000)},delay)}
window.gymCloudPauseForRestore=()=>{enabled=false;dirty=false;clearTimeout(timer);clearTimeout(retryTimer);localStorage.removeItem(DIRTY_KEY);localStorage.removeItem('gym-cloud-enabled');status('Herstelmodus: automatische cloudsync gepauzeerd.');};
window.gymCloudChanged=()=>{if(!enabled||!session)return;changeCounter++;dirty=true;localStorage.setItem(DIRTY_KEY,'yes');status(navigator.onLine?'Lokaal opgeslagen — synchronisatie volgt…':'Offline — lokaal opgeslagen, upload volgt bij verbinding.');scheduleUpload()};
window.addEventListener('online',()=>{if(enabled&&session&&dirty){status('Online — wijzigingen worden verzonden…');scheduleUpload(500)}});
window.addEventListener('offline',()=>{if(enabled&&dirty)status('Offline — lokaal opgeslagen, upload volgt bij verbinding.')});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&enabled&&dirty)scheduleUpload(500)});
setInterval(()=>{if(enabled&&session&&dirty&&navigator.onLine&&!busy)scheduleUpload(500)},60000);
window.gymCloudPanel=()=>`<section id="cloudPanel" class="card"><h3>☁ Supabase synchronisatie · 4.0.0</h3><p class="muted">Je gegevens blijven lokaal beschikbaar. Na de eerste upload of download worden wijzigingen automatisch gesynchroniseerd. Maak vooraf een JSON-back-up. Een lopende training wordt pas na afronden naar de cloud gestuurd.</p>${session?`<p>Ingelogd op Supabase</p><button id="cloudUpload" type="button">Lokale gegevens naar cloud</button><button id="cloudDownload" class="secondary" type="button">Cloud naar dit apparaat</button><button id="cloudLogout" class="secondary" type="button">Uitloggen</button><p class="muted">Bij de eerste upload wordt een bestaande cloudback-up nooit overschreven. Bij een conflict stopt automatisch synchroniseren.</p>`:`<label>E-mailadres</label><input type="email" id="cloudEmail" autocomplete="username" placeholder="E-mailadres"><label>Wachtwoord</label><input type="password" id="cloudPassword" autocomplete="current-password" placeholder="Supabase-wachtwoord"><button id="cloudLogin" type="button">Inloggen bij Supabase</button>`}<p id="cloudStatus" class="cloud-status muted" role="status" aria-live="polite">${lastStatus}</p></section>`;
window.gymCloudBind=()=>{const $=id=>document.getElementById(id);if($('cloudLogin'))$('cloudLogin').onclick=async()=>{const b=$('cloudLogin');b.disabled=true;try{await login($('cloudEmail').value.trim(),$('cloudPassword').value)}catch(e){status('Inloggen mislukt: '+e.message)}finally{b.disabled=false}};
 if($('cloudUpload'))$('cloudUpload').onclick=()=>{if(confirm('Lokale gegevens naar Supabase sturen? Bestaande cloudgegevens worden niet zonder controle overschreven.'))upload(true)};
 if($('cloudDownload'))$('cloudDownload').onclick=download;if($('cloudLogout'))$('cloudLogout').onclick=logout};
window.gymCloudRefresh=()=>{if(typeof render==='function')render()};
if(enabled&&session){status(dirty?'Nog niet gesynchroniseerde wijzigingen — upload volgt.':'✓ Automatische synchronisatie actief');if(dirty)scheduleUpload(500)}
})();
