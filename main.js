import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Scene, camera, renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffc0cb);

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
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

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedMesh = null;

// Mesh arrays
let clickableBolls = [];
let toppings = [];
let iceCream;

// Startkleuren voor de bollen
const startColors = {
  'Node-Mesh_1': 0x84563C, // chocolade
  'Node-Mesh_5': 0xE30B5D, // aardbei
  'Node-Mesh_6': 0xF3E5AB  // vanille
};

// GLTF Loader
const loader = new GLTFLoader();
loader.load(
  '/models/IceCream.glb',
  (gltf) => {
    iceCream = gltf.scene;

    // Categoriseer meshes
    iceCream.traverse((child) => {
      if (child.isMesh) {
        console.log('Mesh gevonden:', child.name);

        // Klikbare bollen
        if (['Node-Mesh_1', 'Node-Mesh_5', 'Node-Mesh_6'].includes(child.name)) {
          clickableBolls.push(child);
          // verwijder textures en zet startkleur
          child.material.map = null;
          child.material.color.set(startColors[child.name]);
          child.material.needsUpdate = true;
        }

        // Toppings
        if (['Node-Mesh_2', 'Node-Mesh_3', 'Node-Mesh_4'].includes(child.name)) {
          toppings.push(child);
          child.visible = false; // geen toppings bij start
        }
      }
    });

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

    // Zet standaard topping variant2 chocolade
    changeToppings('none');

    animate();
  },
  undefined,
  (error) => {
    console.error('Error loading GLB:', error);
  }
);

// Animate
function animate() {
  requestAnimationFrame(animate);
  if (iceCream) iceCream.rotation.y += 0.005;
  renderer.render(scene, camera);
}

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Click handler voor bollen
window.addEventListener('click', (event) => {
  if (!iceCream) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(clickableBolls, true);

  if (intersects.length > 0) {
    selectedMesh = intersects[0].object;
    console.log('Geselecteerde bol:', selectedMesh.name);
  }
});

// Functie om smaak van geselecteerde bol te veranderen
function changeFlavor(color) {
  if (!selectedMesh) return;
  selectedMesh.material.color.set(color);
}

// Toppings buttons functie
function changeToppings(variant) {
  if (!toppings.length) return;

  toppings.forEach(t => t.visible = true);

  if (variant === 'none') {
    toppings.forEach(t => t.visible = false);
  } else if (variant === 'speculoos') {
    toppings.forEach(t => t.material.color.set(0xD2A679));
  } else if (variant === 'chocolade') {
    const darkerChoc = 0x5C2F00;
    toppings.forEach(t => t.material.color.set(darkerChoc));
  } else if (variant === 'discodip') {
    const colors = [0xFFB6C1, 0x87CEEB, 0xFFFFE0];
    toppings.forEach((t, i) => t.material.color.set(colors[i]));
  }
}

document.getElementById('chocolate-btn').addEventListener('click', () => changeFlavor(0x84563C));
document.getElementById('strawberry-btn').addEventListener('click', () => changeFlavor(0xE30B5D));
document.getElementById('vanilla-btn').addEventListener('click', () => changeFlavor(0xF3E5AB));

document.getElementById('speculoos-btn').addEventListener('click', () => changeToppings('speculoos'));
document.getElementById('chocolade-btn').addEventListener('click', () => changeToppings('chocolade'));
document.getElementById('discodip-btn').addEventListener('click', () => changeToppings('discodip'));
document.getElementById('no-toppings-btn').addEventListener('click', () => changeToppings('none'));