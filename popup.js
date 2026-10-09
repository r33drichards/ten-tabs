const el=id=>document.getElementById(id);let state;
async function send(msg){const r=await chrome.runtime.sendMessage(msg);if(r.error)throw Error(r.error);return r;}
async function action(msg){for(const b of document.querySelectorAll('button'))b.disabled=true;try{await send(msg);await render();}catch(e){el('error').textContent=e.message;for(const b of document.querySelectorAll('button'))b.disabled=false;}}
async function render(){state=await send({type:'state'});el('status').textContent=state.tabs.length+' / '+state.limit+' tabs open';el('error').textContent='';el('tabs').replaceChildren();el('pending').textContent=state.pending.length?'Choose a tab to replace. Paused: '+state.pending[0].url+' ('+state.pending.length+' queued)':'No paused tabs.';
 el('discard').hidden=!state.pending.length;el('discard').disabled=false;
 el('resume').hidden=!state.pending.length||state.tabs.length>=state.limit;el('resume').disabled=false;
 if(state.pending.length&&state.tabs.length>=state.limit)for(const tab of state.tabs){const row=document.createElement('div');row.className='tab';const text=document.createElement('span');text.textContent=tab.title||tab.url||'Untitled tab';text.title=tab.url||'';const button=document.createElement('button');button.textContent='Replace';button.addEventListener('click',()=>{if(confirm('Close '+text.textContent+'? Unsaved work may be lost.'))action({type:'resume',closeId:tab.id});});row.append(text,button);el('tabs').append(row);}
}
el('discard').addEventListener('click',()=>action({type:'discard'}));el('resume').addEventListener('click',()=>action({type:'resume'}));render().catch(e=>el('error').textContent=e.message);
