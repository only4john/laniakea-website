import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {Viewer} from 'gaussian-splats-3d';
let activeViewer=null;
export async function loadViewer(onProgress){
 if(activeViewer)return activeViewer;
 const container=document.querySelector('#scene-container');
 const target=new THREE.Vector3(-9.9,2.4,-26),position=new THREE.Vector3(-9.9,.4,-26.8);
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x151912);
 const camera=new THREE.PerspectiveCamera(60,container.clientWidth/container.clientHeight,.05,1000);camera.position.copy(position);
 const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});
 renderer.setSize(container.clientWidth,container.clientHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
 renderer.domElement.setAttribute('aria-label','Interactive 3D reconstruction of Weka Pass rock art. Drag to orbit; scroll or pinch to zoom.');
 renderer.domElement.tabIndex=0;container.appendChild(renderer.domElement);
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.copy(target);controls.enableDamping=true;controls.minDistance=.5;controls.maxDistance=10;controls.autoRotateSpeed=.35;controls.update();
 const viewer=new Viewer({showStatus:false,sharedMemoryForWorkers:false,selfContained:false,renderer,camera,scene,useBuiltInControls:false,gpuAcceleratedSort:false});
 let visible=true,disposed=false,frame=0;
 const intersection=new IntersectionObserver(([entry])=>visible=entry.isIntersecting);intersection.observe(container);
 const resize=new ResizeObserver(()=>{const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h)});resize.observe(container);
 const snapshot=()=>{container.dataset.camera=JSON.stringify({position:camera.position.toArray(),target:controls.target.toArray(),autoRotate:controls.autoRotate})};controls.addEventListener('change',snapshot);
 function render(){if(disposed)return;frame=requestAnimationFrame(render);if(!visible||document.hidden)return;controls.update();viewer.update();viewer.render()};render();
 let loadTask;const timeout=setTimeout(()=>loadTask?.abort?.('Model loading timed out'),90000);
 try{
  loadTask=viewer.addSplatScene('./rock-art.ksplat',{progressiveLoad:false,showLoadingUI:false,onProgress:(percent,label,status)=>onProgress?.(percent,status)});
  await loadTask;
 }catch(error){disposed=true;cancelAnimationFrame(frame);intersection.disconnect();resize.disconnect();controls.dispose();renderer.dispose();renderer.domElement.remove();await viewer.dispose();throw error}finally{clearTimeout(timeout)}
 document.querySelector('.viewer-start').hidden=true;document.querySelector('.viewer-poster').hidden=true;container.dataset.state='ready';snapshot();
 const reset=document.querySelector('#reset-view'),rotate=document.querySelector('#rotate-view');
 reset.disabled=false;rotate.disabled=false;
 rotate.addEventListener('click',()=>{controls.autoRotate=!controls.autoRotate;rotate.setAttribute('aria-pressed',String(controls.autoRotate));rotate.textContent=controls.autoRotate?'Pause rotation Ⅱ':'Auto rotate ↻';snapshot()});
 const resetCamera=()=>{controls.autoRotate=false;rotate.setAttribute('aria-pressed','false');rotate.textContent='Auto rotate ↻';controls.enableDamping=false;controls.update();camera.position.copy(position);controls.target.copy(target);controls.update();controls.enableDamping=true;snapshot()};
 reset.addEventListener('click',resetCamera);
 renderer.domElement.addEventListener('keydown',event=>{if(event.key==='0'||event.key==='Home'){event.preventDefault();resetCamera()}});
 activeViewer={viewer,controls};return activeViewer;
}
