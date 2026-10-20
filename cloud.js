// Gym Progress 3.9.0: optional private cloud backup/sync; local storage remains authoritative until user opts in.
'use strict';
(()=>{
const URL='https://dxchjnkmoexgmidwnzio.supabase.co', KEY='sb_publishable_2mXIR8atgq4dCGuiNJeFDg_HczB5lQX';
const TOKEN_KEY='gym-cloud-session-v1', REV_KEY='gym-cloud-revision-v1';
let session=null, revision=Number(localStorage.getItem(REV_KEY)||0), enabled=localStorage.getItem('gym-cloud-enabled')==='yes';
let busy=false, timer=null, lastStatus='Cloud nog niet verbonden.';
try{session=JSON.parse(localStorage.getItem(TOKEN_KEY)||'null')}catch{}
function status(s){lastStatus=s;const e=document.getElementById('cloudStatus');if(e)e.textContent=s}
async function api(path,opts={}){
 const headers={'apikey':KEY,'Content-Type':'application/json',...(session?.access_token?{'Authorization':'Bearer '+session.access_token}:{}),...(opts.headers||{})};
 const r=await fetch(URL+path,{...opts,headers});const raw=await r.text();let data;try{data=raw?JSON.parse(raw):null}catch{data=raw}
 if(!r.ok)throw Error(data?.msg||data?.message||data?.error_description||data?.error||'HTTP '+r.status);return data;
}
async function refresh(){if(!session?.refresh_token)throw Error('Log opnieuw in');
 const s=await api('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:session.refresh_token})});
 session=s;localStorage.setItem(TOKEN_KEY,JSON.stringify(s));return s;
}
async function authorized(fn){if(!session)throw Error('Log eerst in');if(Date.now()>(session.expires_at||0)*1000-60000)await refresh();try{return await fn()}catch(e){if(/JWT expired|invalid JWT|401/i.test(e.message)){await refresh();return fn()}throw e}}
async function login(email,password){const s=await api('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})});
 session=s;localStorage.setItem(TOKEN_KEY,JSON.stringify(s));enabled=false;localStorage.removeItem('gym-cloud-enabled');status('Ingelogd. Kies eerst de richting van je eerste synchronisatie.');window.gymCloudRefresh?.()}
function logout(){session=null;enabled=false;revision=0;localStorage.removeItem(TOKEN_KEY);localStorage.removeItem(REV_KEY);localStorage.removeItem('gym-cloud-enabled');status('Uitgelogd. Je lokale gegevens blijven behouden.');window.gymCloudRefresh?.()}
async function read(){return authorized(async()=>{const a=await api('/rest/v1/gym_cloud_state?select=state,revision,updated_at&limit=1');return a?.[0]||null})}
function valid(v){return v&&v.plans&&Array.isArray(v.plans.A)&&Array.isArray(v.plans.B)&&Array.isArray(v.sessions)}
async function upload(first=false){if(busy)return;busy=true;try{
 const cloud=await read();if(first&&cloud){status('Cloud bevat al gegevens. Download of vergelijk eerst; er is niets overschreven.');return}
 if(!first&&cloud&&cloud.revision!==revision){enabled=false;localStorage.removeItem('gym-cloud-enabled');status('Synchronisatie gestopt: cloud is elders gewijzigd. Download of vergelijk eerst om gegevensverlies te voorkomen.');return}
 const payload=JSON.parse(localStorage.getItem('gym-progress-v1')||'null');if(!valid(payload))throw Error('Lokale trainingsgegevens ontbreken');
 const expected=cloud?.revision||0;
 const result=await authorized(()=>api('/rest/v1/rpc/gym_save_cloud_state',{method:'POST',body:JSON.stringify({p_state:payload,p_expected_revision:expected})}));
 revision=Number(result);localStorage.setItem(REV_KEY,String(revision));enabled=true;localStorage.setItem('gym-cloud-enabled','yes');status('Gesynchroniseerd met Supabase. Cloudversie '+revision+'.');
 }catch(e){status('Synchronisatie mislukt: '+e.message)}finally{busy=false}}
async function download(){if(busy)return;busy=true;try{
 const cloud=await read();if(!cloud){status('Cloud is nog leeg. Er is niets geïmporteerd.');return}
 if(!valid(cloud.state))throw Error('Cloud bevat geen geldige Gym Progress-back-up');
 const current=localStorage.getItem('gym-progress-v1');const backup='gym-progress-pre-cloud-'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';
 if(!confirm('Cloudgegevens op dit apparaat zetten? De huidige lokale gegevens worden vervangen. Eerst wordt een JSON-back-up gedownload.'))return;
 const blob=new Blob([current||'{}'],{type:'application/json'});const link=document.createElement('a');const u=URL.createObjectURL(blob);link.href=u;link.download=backup;link.click();setTimeout(()=>URL.revokeObjectURL(u),1500);
 localStorage.setItem('gym-progress-v1',JSON.stringify(cloud.state));revision=cloud.revision;localStorage.setItem(REV_KEY,String(revision));enabled=true;localStorage.setItem('gym-cloud-enabled','yes');status('Cloudgegevens geïmporteerd. De app wordt herladen.');location.reload();
 }catch(e){status('Download mislukt: '+e.message)}finally{busy=false}}
window.gymCloudChanged=()=>{if(!enabled||!session)return;clearTimeout(timer);timer=setTimeout(()=>upload(false),1600)};
window.gymCloudPanel=()=>`<section id="cloudPanel" class="card"><h3>☁ Supabase synchronisatie · 3.9.0</h3><p class="muted">Je gegevens blijven lokaal beschikbaar. Synchronisatie begint pas nadat je een eerste richting kiest. Maak vooraf een JSON-back-up.</p>${session?`<p>Ingelogd op Supabase</p><button id="cloudUpload" type="button">Lokale gegevens naar cloud</button><button id="cloudDownload" class="secondary" type="button">Cloud naar dit apparaat</button><button id="cloudLogout" class="secondary" type="button">Uitloggen</button><p class="muted">Bij de eerste upload wordt een bestaande cloudback-up nooit overschreven. Bij een conflict stopt automatisch synchroniseren.</p>`:`<label>E-mailadres</label><input type="email" id="cloudEmail" autocomplete="username" placeholder="E-mailadres"><label>Wachtwoord</label><input type="password" id="cloudPassword" autocomplete="current-password" placeholder="Supabase-wachtwoord"><button id="cloudLogin" type="button">Inloggen bij Supabase</button>`}<p id="cloudStatus" class="cloud-status muted">${lastStatus}</p></section>`;
window.gymCloudBind=()=>{const $=id=>document.getElementById(id);if($('cloudLogin'))$('cloudLogin').onclick=async()=>{const b=$('cloudLogin');b.disabled=true;try{await login($('cloudEmail').value.trim(),$('cloudPassword').value)}catch(e){status('Inloggen mislukt: '+e.message)}finally{b.disabled=false}};
 if($('cloudUpload'))$('cloudUpload').onclick=()=>{if(confirm('Lokale gegevens naar Supabase sturen? Bestaande cloudgegevens worden niet zonder controle overschreven.'))upload(true)};
 if($('cloudDownload'))$('cloudDownload').onclick=download;if($('cloudLogout'))$('cloudLogout').onclick=logout};
window.gymCloudRefresh=()=>{if(typeof render==='function')render()};
if(enabled&&session){status('Automatische synchronisatie actief (bij wijzigingen).');}
})();
