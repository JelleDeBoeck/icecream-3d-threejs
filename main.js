import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Scene, camera, renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffc0cb);

const camera = new THREE.PerspectiveCamera(
  40,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 0, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.domElement.style.display = 'block';
document.body.appendChild(renderer.domElement);

// Licht
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// GLTF Loader
const loader = new GLTFLoader();
loader.load(
  '/models/IceCream.glb',
  (gltf) => {
    const iceCream = gltf.scene;

    // Center het model
    const box = new THREE.Box3().setFromObject(iceCream);
    const center = box.getCenter(new THREE.Vector3());
    iceCream.position.x -= center.x;
    iceCream.position.y -= center.y;
    iceCream.position.z -= center.z;

    // Schaal indien nodig
    const size = box.getSize(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z);
    const scale = 1 / maxDimension;
    iceCream.scale.set(scale, scale, scale);

    scene.add(iceCream);

    animate();

    function animate() {
      requestAnimationFrame(animate);
      iceCream.rotation.y += 0.005;
      renderer.render(scene, camera);
    }
  },
  undefined,
  (error) => {
    console.error('Error loading GLB:', error);
  }
);

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
