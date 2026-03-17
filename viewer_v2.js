import * as THREE from 'three';
import * as GaussianSplats3D from 'gaussian-splats-3d';

/**
 * HERITAGE VIEWER - ULTRA STABLE RE-BASE
 * Directly using logic from the working 'rock paint' prototype.
 */

export async function initHeritageViewer() {
    console.log("Heritage: Initializing Stable View...");
    const container = document.getElementById('scene-container');
    if (!container) return;

    // 1. Setup Pure Three.js
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a); // Laniakea Obsidian

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // LOCK IN OPTIMIZED COORDINATES
    const initialPos = new THREE.Vector3(1.05, 0.45, -0.07);
    const target = new THREE.Vector3(0.98, 0.21, 0.25);
    camera.position.copy(initialPos);

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            antialias: false, // For max stability
            powerPreference: "high-performance"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);
    } catch (e) {
        throw new Error("WebGL Not Supported");
    }

    // 2. Initialize Core Engine
    try {
        const viewer = new GaussianSplats3D.Viewer({
            'showStatus': false,
            'sharedMemoryForWorkers': false, // STABILITY OVER SPEED
            'selfContained': false,
            'renderer': renderer,
            'camera': camera,
            'scene': scene,
            'useBuiltInControls': false
        });

        // Use the high-fidelity PLY for stability
        const splatUrl = './rock_art_cropped.ply';
        console.log("Heritage: Loading Stable High-Fidelity PLY...");

        await viewer.addSplatScene(splatUrl, {
            'progressiveLoad': true,
            'showLoadingUI': false
        });

        console.log("Heritage: Displaying model.");

        // 3. Interaction Logic (Stable Parallax)
        let mouseX = 0, mouseY = 0;
        window.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        function animate() {
            requestAnimationFrame(animate);

            // Smooth parallax movements
            const tiltX = mouseX * 0.12;
            const tiltY = mouseY * 0.06;

            camera.position.x = THREE.MathUtils.lerp(camera.position.x, initialPos.x + tiltX, 0.05);
            camera.position.y = THREE.MathUtils.lerp(camera.position.y, initialPos.y + tiltY, 0.05);
            camera.lookAt(target);

            viewer.update();
            viewer.render();
        }
        animate();

        // Responsive Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

    } catch (err) {
        console.error("Heritage Error:", err);
        throw err;
    }
}
