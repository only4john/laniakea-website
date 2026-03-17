import * as THREE from 'three';
import * as GaussianSplats3D from 'gaussian-splats-3d';

async function init() {
  const container = document.getElementById('scene-container');
  const loader = document.getElementById('loader');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0d0e);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const initialPos = new THREE.Vector3(1.05, 0.45, -0.07);
  const target = new THREE.Vector3(0.98, 0.21, 0.25);
  camera.position.copy(initialPos);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const viewer = new GaussianSplats3D.Viewer({
    showStatus: false,
    sharedMemoryForWorkers: false,
    selfContained: false,
    renderer,
    camera,
    scene,
    useBuiltInControls: false
  });

  const splatUrl = './rock_art.splat';
  await viewer.addSplatScene(splatUrl, {
    progressiveLoad: true,
    showLoadingUI: false
  });

  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  function animate() {
    requestAnimationFrame(animate);
    const tiltX = mouseX * 0.12;
    const tiltY = mouseY * 0.06;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, initialPos.x + tiltX, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, initialPos.y + tiltY, 0.05);
    camera.lookAt(target);
    viewer.update();
    viewer.render();
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 500);
  }
}

init();
