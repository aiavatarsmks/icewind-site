/* ICE WIND homepage chat. The system prompt, model access and CRM credentials stay on the server. */
(function(){
'use strict';
var API='https://icewind-home-chat-staging.icewinddale.workers.dev';
var form=document.querySelector('.chat-composer');if(!form)return;
var shell=document.querySelector('.chat-window'),input=document.getElementById('chat-message'),send=form.querySelector('button'),thread=document.getElementById('chat-thread'),intro=document.querySelector('.chat-intro'),prompts=document.querySelector('.chat-prompts'),status=document.getElementById('chat-status'),retry=document.getElementById('chat-retry');
var context=shell.dataset.chatContext||'home',storageKey=context==='limited-offer'?'iw-offer-chat-session':'iw-home-chat-session';
var state=null,pending=null,busy=false,leadRetry=false,restoreFailed=false;
function t(s){return window.IW_I18N?window.IW_I18N.t(s):s;}
function language(){return window.IW_LANGUAGE||document.documentElement.lang||'en';}
try{state=JSON.parse(sessionStorage.getItem(storageKey)||'null');}catch{/* A new session works without browser storage. */}
function save(){try{sessionStorage.setItem(storageKey,JSON.stringify(state));}catch{}}
// The bottom form may create the offer session before the first chat message.
window.addEventListener('iw-offer-form-saved',function(){if(context!=='limited-offer'||busy||pending)return;try{var updated=JSON.parse(sessionStorage.getItem(storageKey)||'null');if(updated?.id&&updated?.token&&(!state||state.id===updated.id))state=updated;}catch{}});
function reveal(){intro.hidden=true;prompts.hidden=true;thread.hidden=false;shell.classList.add('chat-active');}
function links(el,text){
 var re=/(https:\/\/icewind\.uk\/[^\s<>"\])]*|hello@icewind\.uk)/g,at=0,m;
 while((m=re.exec(text))){el.appendChild(document.createTextNode(text.slice(at,m.index)));var a=document.createElement('a');a.textContent=m[0];a.href=m[0].startsWith('https:')?m[0]:'mailto:'+m[0];a.rel='noopener noreferrer';a.target='_blank';el.appendChild(a);at=m.index+m[0].length;}
 el.appendChild(document.createTextNode(text.slice(at)));
}
function add(role,text){reveal();var article=document.createElement('div');article.className='chat-message chat-message--'+role;var label=document.createElement('span');label.className='chat-speaker';label.textContent=role==='user'?t('You'):'ICE WIND';var content=document.createElement('p');links(content,text);article.append(label,content);thread.appendChild(article);thread.scrollTop=thread.scrollHeight;return article;}
function working(value){busy=value;send.disabled=value;input.disabled=value;retry.disabled=value;form.setAttribute('aria-busy',String(value));status.textContent=value?t('Thinking…'):'';}
async function request(path,data){
 var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},100000);
 try{var response=await fetch(API+path,{method:data===undefined?'GET':'POST',headers:{...(data===undefined?{}:{'Content-Type':'application/json'}),...(state?.token?{'Authorization':'Bearer '+state.token}:{})},...(data===undefined?{}:{body:JSON.stringify(data)}),signal:controller.signal});var result=await response.json();if(!response.ok){var e=new Error(result.code||'request_failed');e.status=response.status;throw e;}return result;}finally{clearTimeout(timer);}
}
async function session(){
 if(state&&state.id&&state.token&&!restoreFailed)return;
 if(restoreFailed)throw new Error('restore_failed');
 var created=await request('/session',{language:language(),context:context});state={id:created.id,token:created.token};save();
}
async function submit(isLeadRetry){
 if(busy)return;
 if(!pending){var value=input.value.trim();if(!isLeadRetry&&!value)return;if(value.length>1800){status.textContent=t('Please keep your message under 1,800 characters.');return;}pending={requestId:crypto.randomUUID(),message:value,leadRetry:isLeadRetry};if(!isLeadRetry){add('user',value);input.value='';input.style.height='auto';}}
 working(true);retry.hidden=true;
 try{
  await session();
  var result=await request('/session/'+state.id+(pending.leadRetry?'/retry-lead':'/message'),{requestId:pending.requestId,...(pending.leadRetry?{}:{message:pending.message})});
  add('assistant',result.reply);state.leadStatus=result.leadStatus;save();if(result.leadStatus==='saved')window.dispatchEvent(new Event('iw-chat-saved'));pending=null;leadRetry=!!result.retryable;retry.hidden=!leadRetry;retry.textContent=t(leadRetry?'Retry enquiry delivery':'Try again');
 }catch(e){status.dataset.error='true';status.textContent=t(e.message==='rate_limit'||e.message==='daily_limit'?'The chat is busy. Please try again later, or email hello@icewind.uk.':'The reply could not be loaded. Your message is kept here. Try again, or email hello@icewind.uk.');retry.hidden=false;retry.textContent=t('Try again');}
 finally{busy=false;send.disabled=false;input.disabled=false;retry.disabled=false;form.removeAttribute('aria-busy');if(status.dataset.error)delete status.dataset.error;else status.textContent='';input.focus();}
}
form.addEventListener('submit',function(e){e.preventDefault();void submit(false);});
input.maxLength=1800;
input.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();void submit(false);}});
input.addEventListener('input',function(){input.style.height='auto';input.style.height=Math.min(110,input.scrollHeight)+'px';});
document.querySelectorAll('[data-prompt]').forEach(function(button){button.addEventListener('click',function(){input.value=t(button.dataset.prompt);input.focus();});});
retry.addEventListener('click',function(){void submit(leadRetry&&!pending);});
var privacy=document.getElementById('chat-privacy');document.getElementById('chat-privacy-open').addEventListener('click',function(){privacy.showModal();});document.getElementById('chat-privacy-close').addEventListener('click',function(){privacy.close();});
if(state&&state.id&&state.token){
 working(true);
 request('/session/'+state.id).then(function(result){state.leadStatus=result.leadStatus;save();if(result.leadStatus==='saved')window.dispatchEvent(new Event('iw-chat-saved'));result.messages.forEach(function(m){add(m.role,m.content);});}).catch(function(e){if(e.status===401||e.status===404){state=null;try{sessionStorage.removeItem(storageKey);}catch{}}else{restoreFailed=true;status.textContent=t('Your previous conversation could not be restored. Please reload before sending another message.');}}).finally(function(){busy=false;send.disabled=false;input.disabled=false;form.removeAttribute('aria-busy');if(!restoreFailed)status.textContent='';});
}
})();
