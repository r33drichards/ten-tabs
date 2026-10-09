const LIMIT=10;
let chain=Promise.resolve();
function serial(fn){const result=chain.then(fn);chain=result.catch(console.error);return result;}
const newTabUrl='chrome://newtab/';
async function pending(){return (await chrome.storage.local.get('pending')).pending||[];}
async function badge(){const n=(await pending()).length;await chrome.action.setBadgeText({text:n?String(n):''});await chrome.action.setBadgeBackgroundColor({color:'#b45309'});}
async function enforce(id){
 const tabs=await chrome.tabs.query({});if(tabs.length<=LIMIT)return;
 const tab=tabs.find(t=>t.id===id);if(!tab)return;
 const queue=await pending();queue.push({url:tab.pendingUrl||tab.url||newTabUrl,title:tab.title||'New tab',time:Date.now()});
 await chrome.storage.local.set({pending:queue});
 try{await chrome.tabs.remove(id);}catch(e){await chrome.storage.local.set({pending:queue.slice(0,-1)});throw e;}
 await badge();
 try{await chrome.notifications.create('tab-limit',{type:'basic',iconUrl:'icon.png',title:'Ten-tab limit reached',message:'The new tab was paused. Choose an existing tab to close and replace.',priority:2});}catch(e){console.warn('Notification unavailable',e.message);}
 try{await chrome.action.openPopup();}catch(e){/* Notification and toolbar badge remain available. */}
}
chrome.tabs.onCreated.addListener(tab=>serial(()=>enforce(tab.id)));
chrome.notifications.onClicked.addListener(id=>{if(id==='tab-limit')chrome.action.openPopup().catch(console.error);});
chrome.runtime.onMessage.addListener((msg,sender,reply)=>{
 if(sender.id!==chrome.runtime.id)return;
 serial(async()=>{
  if(msg.type==='state')return {tabs:await chrome.tabs.query({}),pending:await pending(),limit:LIMIT};
  if(msg.type==='discard'){const q=await pending();q.shift();await chrome.storage.local.set({pending:q});await badge();return {ok:true};}
  if(msg.type==='resume'){
   const q=await pending();if(!q.length)return {ok:true};
   const tabs=await chrome.tabs.query({});
   if(tabs.length>=LIMIT){if(!Number.isInteger(msg.closeId)||!tabs.some(t=>t.id===msg.closeId))throw Error('Choose a tab to close first.');await chrome.tabs.remove(msg.closeId);}
   if((await chrome.tabs.query({})).length>=LIMIT)throw Error('Still at the limit. Try again.');
   const item=q.shift();await chrome.storage.local.set({pending:q});
   try{await chrome.tabs.create({url:item.url,active:true});}catch(e){q.unshift(item);await chrome.storage.local.set({pending:q});throw e;}
   await badge();await chrome.notifications.clear('tab-limit');return {ok:true};
  }
  throw Error('Unknown action');
 }).then(reply,e=>reply({error:e.message}));return true;
});
chrome.runtime.onInstalled.addListener(()=>badge());
chrome.runtime.onStartup.addListener(()=>badge());
