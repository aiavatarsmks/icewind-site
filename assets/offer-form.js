/* Limited Offer form: durable email/Zoho delivery and shared chat receipt. */
(function(){'use strict';
var API='https://icewind-home-chat-staging.icewinddale.workers.dev',form=document.getElementById('offer-form');if(!form)return;
var status=document.getElementById('form-status'),send=form.querySelector('button[type=submit]'),separate=document.getElementById('offer-separate'),wrap=document.getElementById('offer-separate-wrap'),busy=false;
function t(s){return window.IW_I18N?window.IW_I18N.t(s):s;}function lang(){return window.IW_LANGUAGE||document.documentElement.lang||'en';}
function say(s){status.hidden=false;status.textContent=t(s);}
function chat(){try{return JSON.parse(sessionStorage.getItem('iw-offer-chat-session')||'null');}catch{return null;}}
async function api(path,data){var response=await fetch(API+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});var body=await response.json();return {response,body};}
function warning(){var c=chat();if(c?.leadStatus==='saved'){wrap.hidden=false;say('Your enquiry has already been received through this conversation. Tick the box only if you want to send a separate enquiry.');}}
window.addEventListener('iw-chat-saved',function(){warning();var c=chat();if(c?.leadStatus==='saved')window.dispatchEvent(new CustomEvent('iw-enquiry-received',{detail:{id:'chat-'+c.id,channel:'chat'}}));});warning();
form.addEventListener('submit',async function(e){e.preventDefault();if(busy||!form.reportValidity())return;busy=true;send.disabled=true;form.setAttribute('aria-busy','true');say('Sending…');
try{
 var f=new FormData(form),data={Name:String(f.get('Name')||''),Contact:String(f.get('Contact')||''),Message:String(f.get('Message')||''),Reference:String(f.get('Reference')||''),language:lang(),_honey:String(f.get('_honey')||''),separateConfirmed:separate.checked};
 var c=chat();if(!c){var made=await api('/session',{context:'limited-offer',language:lang()});if(!made.response.ok)throw new Error();c={id:made.body.id,token:made.body.token};sessionStorage.setItem('iw-offer-chat-session',JSON.stringify(c));}
 data.chat=c;
 var bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(data))),signature=Array.from(new Uint8Array(bytes)).map(x=>x.toString(16).padStart(2,'0')).join('');
 var previous;try{previous=JSON.parse(sessionStorage.getItem('iw-offer-form-request')||'null');}catch{}
 var requestId=previous?.signature===signature?previous.requestId:crypto.randomUUID();sessionStorage.setItem('iw-offer-form-request',JSON.stringify({signature,requestId}));data.requestId=requestId;
 var result=await api('/offer-form',data);
 if(result.body.code==='already_received'){wrap.hidden=false;say('Your enquiry has already been received through this conversation. Tick the box only if you want to send a separate enquiry.');}
 else if(result.response.ok&&result.body.ok){say('Thank you. ICE WIND has received your enquiry and the team will contact you soon.');if(!separate.checked){c.leadStatus='saved';sessionStorage.setItem('iw-offer-chat-session',JSON.stringify(c));window.dispatchEvent(new Event('iw-offer-form-saved'));}window.dispatchEvent(new CustomEvent('iw-enquiry-received',{detail:{id:requestId,channel:'form'}}));form.reset();}
 else say('Delivery could not be fully confirmed. Your details are kept in the form. Try again or email hello@icewind.uk.');
}catch{say('Delivery could not be fully confirmed. Your details are kept in the form. Try again or email hello@icewind.uk.');}
finally{busy=false;send.disabled=false;form.removeAttribute('aria-busy');}
});
fetch(API+'/health').then(r=>r.json()).then(d=>{if(!d.offerActive)document.getElementById('offer-expired').hidden=false;}).catch(()=>{});
})();
