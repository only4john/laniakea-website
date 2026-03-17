import * as THREE from 'three';
import * as GaussianSplats3D from 'gaussian-splats-3d';

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
