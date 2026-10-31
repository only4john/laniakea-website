import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import * as GaussianSplats3D from 'gaussian-splats-3d';
const container=document.querySelector('#scene-container');
const scene=new THREE.Scene();scene.background=new THREE.Color(0x151912);
const camera=new THREE.PerspectiveCamera(60,container.clientWidth/container.clientHeight,.1,1000);
const target=new THREE.Vector3(-9.9,2.4,-26),position=new THREE.Vector3(-9.9,-.1,-27);camera.position.copy(position);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(container.clientWidth,container.clientHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));
const controls=new OrbitControls(camera,renderer.domElement);controls.target.copy(target);controls.enableDamping=true;controls.minDistance=.5;controls.maxDistance=10;controls.update();
const viewer=new GaussianSplats3D.Viewer({showStatus:false,sharedMemoryForWorkers:false,selfContained:false,renderer,camera,scene,useBuiltInControls:false});
try{await viewer.addSplatScene('https://raw.githubusercontent.com/only4john/laniakea-website/b98f84b/rock_art.ply',{progressiveLoad:true,showLoadingUI:false})}catch(e){renderer.dispose();controls.dispose();throw e}
container.appendChild(renderer.domElement);document.querySelector('.viewer-start').hidden=true;document.querySelector('.viewer-poster').hidden=true;
const reset=document.querySelector('#reset-view');reset.disabled=false;reset.addEventListener('click',()=>{camera.position.copy(position);controls.target.copy(target);controls.update()});
new ResizeObserver(()=>{camera.aspect=container.clientWidth/container.clientHeight;camera.updateProjectionMatrix();renderer.setSize(container.clientWidth,container.clientHeight)}).observe(container);
let visible=true;new IntersectionObserver(([entry])=>visible=entry.isIntersecting).observe(container);
function animate(){requestAnimationFrame(animate);if(!visible||document.hidden)return;controls.update();viewer.update();viewer.render()}animate();
