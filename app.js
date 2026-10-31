const menu=document.querySelector('.menu'),mobile=document.querySelector('#mobile-nav');
function closeMenu(){mobile.hidden=true;menu.setAttribute('aria-expanded','false');menu.textContent='Menu +'}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'Close −':'Menu +';mobile.hidden=!open});
mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeMenu();exitExpanded()}});
const shell=document.querySelector('.viewer-shell'),full=document.querySelector('#full-view');
function exitExpanded(){shell.classList.remove('expanded');document.body.classList.remove('viewer-open');full.textContent='Fullscreen ⛶'}
full.addEventListener('click',async()=>{
 if(shell.classList.contains('expanded')){exitExpanded();return}
 if(document.fullscreenElement){await document.exitFullscreen();return}
 try{if(!shell.requestFullscreen)throw new Error('Native fullscreen unavailable');await shell.requestFullscreen()}catch{shell.classList.add('expanded');document.body.classList.add('viewer-open');full.textContent='Exit fullscreen ×'}
});
document.addEventListener('fullscreenchange',()=>{full.textContent=document.fullscreenElement?'Exit fullscreen ×':'Fullscreen ⛶'});
const load=document.querySelector('#load-model'),status=document.querySelector('#model-status');
load.addEventListener('click',async()=>{
 load.disabled=true;shell.classList.add('is-loading');load.textContent='Loading 3D reconstruction…';status.textContent='Preparing the 3D viewer…';document.querySelector('#scene-container').dataset.state='loading';
 try{const {loadViewer}=await import('./viewer.js');await loadViewer((percent,stage)=>{status.textContent=stage===0?`Downloading model · ${Math.round(percent||0)}%`:'Preparing the interactive reconstruction…'});status.textContent='Drag to orbit · Scroll or pinch to zoom'}
 catch(error){load.disabled=false;load.textContent='Retry 3D experience ↗';status.textContent='Unable to load the 3D model. Please check your connection and retry.';document.querySelector('#scene-container').dataset.state='error';console.error('3D viewer:',error)}finally{shell.classList.remove('is-loading')}
});
