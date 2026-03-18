import * as THREE from 'three';
import * as GaussianSplats3D from 'gaussian-splats-3d';

// 创建相机参数显示面板
function createDebugPanel() {
  const panel = document.createElement('div');
  panel.id = 'camera-debug-panel';
  panel.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: #00ff00;
    font-family: monospace;
    font-size: 12px;
    padding: 10px;
    border-radius: 5px;
    z-index: 1000;
    min-width: 200px;
  `;
  panel.innerHTML = `
    <div style="margin-bottom:5px;font-weight:bold;color:#fff">📷 Camera Params</div>
    <div id="cam-pos">Position: --</div>
    <div id="cam-rot">Rotation: --</div>
    <div id="cam-fov">FOV: --</div>
    <div id="cam-zoom">Zoom: --</div>
  `;
  document.body.appendChild(panel);
  return panel;
}

// 更新相机参数显示
function updateDebugPanel(camera) {
  const pos = camera.position;
  const rot = camera.rotation;
  
  const posEl = document.getElementById('cam-pos');
  const rotEl = document.getElementById('cam-rot');
  const fovEl = document.getElementById('cam-fov');
  const zoomEl = document.getElementById('cam-zoom');
  
  if (posEl) posEl.textContent = `Position: x:${pos.x.toFixed(2)}, y:${pos.y.toFixed(2)}, z:${pos.z.toFixed(2)}`;
  if (rotEl) rotEl.textContent = `Rotation: x:${rot.x.toFixed(2)}, y:${rot.y.toFixed(2)}, z:${rot.z.toFixed(2)}`;
  if (fovEl) fovEl.textContent = `FOV: ${camera.fov}`;
  if (zoomEl) zoomEl.textContent = `Zoom: ${camera.zoom}`;
}

async function init() {
  const container = document.getElementById('scene-container');
  const loader = document.getElementById('loader');
  
  console.log('Starting Gaussian Splatting viewer (low memory mode)...');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0d0e);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const initialPos = new THREE.Vector3(1.05, 0.45, -0.07);
  const target = new THREE.Vector3(0.98, 0.21, 0.25);
  camera.position.copy(initialPos);

  // Use conservative renderer settings to prevent GPU overload
  const renderer = new THREE.WebGLRenderer({ 
    antialias: false,
    powerPreference: "low-power",
    precision: "mediump"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1)); // Cap at 1x
  container.appendChild(renderer.domElement);

  const viewer = new GaussianSplats3D.Viewer({
    showStatus: true,
    sharedMemoryForWorkers: false,
    selfContained: false,
    renderer,
    camera,
    scene,
    useBuiltInControls: false
  });

  const splatUrl = './rock_art.splat';
  console.log('Loading splat from:', splatUrl);
  
  try {
    await viewer.addSplatScene(splatUrl, {
      progressiveLoad: false,
      showLoadingUI: false,
      halfPrecisionCovariance: true,
      enableDraco: false,
      enableKTX2: false
    });
    console.log('Splat loaded successfully!');
    
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.style.display = 'none', 500);
    }
  } catch (error) {
    console.error('Failed to load splat:', error);
    if (loader) {
      loader.innerHTML = '<p style="color:red">Failed to load 3D model</p>';
    }
  }

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Reduce render frequency to save resources
  let lastRender = 0;
  
  // 创建调试面板
  createDebugPanel();
  
  function animate(time) {
    requestAnimationFrame(animate);
    
    // Limit to 30fps
    if (time - lastRender < 33) return;
    lastRender = time;
    
    const tiltX = mouseX * 0.12;
    const tiltY = mouseY * 0.06;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, initialPos.x + tiltX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, initialPos.y + tiltY, 0.05);
    camera.lookAt(target);
    
    // 更新调试面板
    updateDebugPanel(camera);
    
    viewer.update();
    viewer.render();
  }
  animate(0);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

init();
