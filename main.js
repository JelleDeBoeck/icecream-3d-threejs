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

let iceCream;
let clickableBolls = [];
let toppings = [];
let selectedMesh = null;

// Startkleuren voor de bollen
const startColors = {
  'Node-Mesh_1': 0x84563C, // chocolade
  'Node-Mesh_5': 0xE30B5D, // aardbei
  'Node-Mesh_6': 0xF3E5AB  // vanille
};

// Laad GLTF
const loader = new GLTFLoader();
loader.load('/models/IceCream.glb',
  (gltf) => {
    iceCream = gltf.scene;

    iceCream.traverse((child) => {
      if (child.isMesh) {
        // Klikbare bollen
        if (['Node-Mesh_1','Node-Mesh_5','Node-Mesh_6'].includes(child.name)) {
          clickableBolls.push(child);
          child.material.map = null;
          child.material.color.set(startColors[child.name]);
        }

        // Toppings
        if (['Node-Mesh_2','Node-Mesh_3','Node-Mesh_4'].includes(child.name)) {
          toppings.push(child);
          child.visible = false;
        }
      }
    });

    // Center en schaal
    const box = new THREE.Box3().setFromObject(iceCream);
    const center = box.getCenter(new THREE.Vector3());
    iceCream.position.x -= center.x -1;
    iceCream.position.y -= center.y;
    iceCream.position.z -= center.z;
    const size = box.getSize(new THREE.Vector3());
    const scale = 1.5 / Math.max(size.x, size.y, size.z);
    iceCream.scale.set(scale, scale, scale);

    scene.add(iceCream);

    changeToppings('none');
    animate();
  },
  undefined,
  (err) => console.error(err)
);

// Animate
function animate() {
  requestAnimationFrame(animate);
  if (iceCream) iceCream.rotation.y += 0.005;
  renderer.render(scene, camera);
}

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Click select bol
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

// Change flavor
document.getElementById('smaak-select').addEventListener('change', (e) => {
  if (!selectedMesh) return;
  const val = e.target.value;
  let color = 0xffffff;
  if (val === 'chocolate') color = 0x84563C;
  if (val === 'strawberry') color = 0xE30B5D;
  if (val === 'vanilla') color = 0xF3E5AB;
  selectedMesh.material.color.set(color);
  updatePrice();
});

// Change topping
document.getElementById('topping-select').addEventListener('change', (e) => {
  changeToppings(e.target.value);
  updatePrice();
});

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

// Bereken prijs
function updatePrice() {
  const basePrice = 6.50;
  const toppingPrice = document.getElementById('topping-select').value === 'none' ? 0 : 1.20;
  const total = basePrice + toppingPrice;
  document.getElementById('prijs-waarde').textContent = `€${total.toFixed(2)}`;
}

// Plaats bestelling
document.getElementById('bestel-btn').addEventListener('click', async () => {
  const naam = document.getElementById('naam').value.trim();
  const straat = document.getElementById('straat').value.trim();
  const huisnummer = document.getElementById('huisnummer').value.trim();
  const gemeente = document.getElementById('gemeente').value.trim();
  const postcode = document.getElementById('postcode').value.trim();
  const prijs = document.getElementById('prijs-waarde').textContent;

  if (!naam || !straat || !huisnummer || !gemeente || !postcode) {
    alert('Vul alle velden in.');
    return;
  }

  const bestelling = {
    customerName: naam,
    address: `${straat} ${huisnummer}, ${postcode} ${gemeente}`,
    totalPrice: parseFloat(prijs.replace('€','')) // zorg dat het een nummer is
  };


  try {
    const response = await fetch('http://localhost:5000/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bestelling)
    });



    if (response.ok) {
      alert('Bestelling geplaatst!');
    } else {
      alert('Er is iets misgegaan bij het plaatsen van de bestelling.');
    }
  } catch (err) {
    console.error(err);
    alert('Er is iets misgegaan bij het plaatsen van de bestelling.');
  }
});
