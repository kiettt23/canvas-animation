import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/**
 * 3D Galaxy Animation using Three.js
 *
 * Creates a spiral galaxy made of thousands of particles.
 * Supports morphing between galaxy, sphere, and torus shapes.
 * Mouse glow effect, multiple color palettes, and orbit controls.
 */

// --- Color palettes ---
const palettes = [
  {
    name: 'cosmic',
    inner: new THREE.Color('#ff6030'),
    outer: new THREE.Color('#1b3984'),
    bg: new THREE.Color('#000000'),
  },
  {
    name: 'aurora',
    inner: new THREE.Color('#00ff87'),
    outer: new THREE.Color('#7b2ff7'),
    bg: new THREE.Color('#020010'),
  },
  {
    name: 'sunset',
    inner: new THREE.Color('#ffd700'),
    outer: new THREE.Color('#ff2079'),
    bg: new THREE.Color('#0a0005'),
  },
  {
    name: 'ocean',
    inner: new THREE.Color('#00d2ff'),
    outer: new THREE.Color('#003366'),
    bg: new THREE.Color('#000508'),
  },
];

// --- State ---
let starCount = 15000;
let spiralArms = 5;
let rotationSpeed = 1.0;
let starSize = 1.0;
let paletteIndex = 0;
let morphTarget = 'galaxy'; // galaxy | sphere | torus
const morphShapes = ['galaxy', 'sphere', 'torus'];
let morphIndex = 0;
let morphProgress = 1.0; // 1 = fully at target shape
let morphDirection = 0;  // 0 = idle, 1 = morphing

// --- Scene setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 4, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 2;
controls.maxDistance = 30;

// --- Galaxy particles ---
let geometry, material, points;
let positionsFrom, positionsTo, colors;

/**
 * Generate positions for a spiral galaxy shape.
 */
function galaxyPositions(count, arms) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const radius = Math.random() * 5;
    const armAngle = ((i % arms) / arms) * Math.PI * 2;
    const spinAngle = radius * 2.5;

    // Add randomness that increases with radius
    const randomness = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;
    const randomnessY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.3;
    const randomnessZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5;

    positions[i3] = Math.cos(armAngle + spinAngle) * radius + randomness;
    positions[i3 + 1] = randomnessY;
    positions[i3 + 2] = Math.sin(armAngle + spinAngle) * radius + randomnessZ;
  }
  return positions;
}

/**
 * Generate positions for a sphere shape.
 */
function spherePositions(count) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const radius = 3 + (Math.random() - 0.5) * 0.8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);
  }
  return positions;
}

/**
 * Generate positions for a torus shape.
 */
function torusPositions(count) {
  const positions = new Float32Array(count * 3);
  const R = 3;   // major radius
  const r = 1.2; // minor radius
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI * 2;
    const jitter = (Math.random() - 0.5) * 0.3;

    positions[i3] = (R + (r + jitter) * Math.cos(v)) * Math.cos(u);
    positions[i3 + 1] = (r + jitter) * Math.sin(v);
    positions[i3 + 2] = (R + (r + jitter) * Math.cos(v)) * Math.sin(u);
  }
  return positions;
}

/**
 * Generate colors based on distance from center.
 */
function generateColors(positions, count, palette) {
  const colorsArr = new Float32Array(count * 3);
  const colorInner = palette.inner;
  const colorOuter = palette.outer;
  const mixed = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const x = positions[i3];
    const y = positions[i3 + 1];
    const z = positions[i3 + 2];
    const dist = Math.sqrt(x * x + y * y + z * z);
    const t = Math.min(dist / 5, 1);

    mixed.copy(colorInner).lerp(colorOuter, t);

    // Add slight random brightness variation
    const brightness = 0.7 + Math.random() * 0.3;
    colorsArr[i3] = mixed.r * brightness;
    colorsArr[i3 + 1] = mixed.g * brightness;
    colorsArr[i3 + 2] = mixed.b * brightness;
  }
  return colorsArr;
}

function getTargetPositions() {
  switch (morphTarget) {
    case 'sphere': return spherePositions(starCount);
    case 'torus': return torusPositions(starCount);
    default: return galaxyPositions(starCount, spiralArms);
  }
}

/**
 * Build or rebuild the particle system.
 */
function createGalaxy() {
  if (points) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }

  geometry = new THREE.BufferGeometry();
  const palette = palettes[paletteIndex];

  positionsTo = getTargetPositions();
  positionsFrom = new Float32Array(positionsTo);
  colors = generateColors(positionsTo, starCount, palette);

  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positionsTo), 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  material = new THREE.PointsMaterial({
    size: 0.02 * starSize,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);

  scene.background = palette.bg;
  morphProgress = 1.0;
}

/**
 * Start morphing to the next shape.
 */
function startMorph() {
  morphIndex = (morphIndex + 1) % morphShapes.length;
  morphTarget = morphShapes[morphIndex];

  // Save current positions as "from"
  const currentPositions = geometry.attributes.position.array;
  positionsFrom = new Float32Array(currentPositions);
  positionsTo = getTargetPositions();

  // Update colors for the new shape
  const palette = palettes[paletteIndex];
  colors = generateColors(positionsTo, starCount, palette);
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  morphProgress = 0;
  morphDirection = 1;
}

// --- Mouse glow ---
const mouse = new THREE.Vector2(0, 0);
const glowLight = new THREE.PointLight('#7a5cff', 0, 8);
scene.add(glowLight);

window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / innerHeight) * 2 + 1;
});
window.addEventListener('touchmove', (e) => {
  mouse.x = (e.touches[0].clientX / innerWidth) * 2 - 1;
  mouse.y = -(e.touches[0].clientY / innerHeight) * 2 + 1;
});

// --- Ambient light for subtle scene illumination ---
const ambientLight = new THREE.AmbientLight('#ffffff', 0.1);
scene.add(ambientLight);

// --- Background stars (far away, static) ---
function createBackgroundStars() {
  const bgGeo = new THREE.BufferGeometry();
  const bgCount = 2000;
  const bgPos = new Float32Array(bgCount * 3);
  for (let i = 0; i < bgCount; i++) {
    const i3 = i * 3;
    bgPos[i3] = (Math.random() - 0.5) * 100;
    bgPos[i3 + 1] = (Math.random() - 0.5) * 100;
    bgPos[i3 + 2] = (Math.random() - 0.5) * 100;
  }
  bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
  const bgMat = new THREE.PointsMaterial({
    size: 0.05,
    color: '#ffffff',
    transparent: true,
    opacity: 0.4,
    sizeAttenuation: true,
  });
  scene.add(new THREE.Points(bgGeo, bgMat));
}
createBackgroundStars();

// --- Animation loop ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsed = clock.getElapsedTime();

  // Rotate galaxy
  if (points) {
    points.rotation.y = elapsed * 0.1 * rotationSpeed;
  }

  // Morph interpolation
  if (morphDirection === 1 && morphProgress < 1) {
    morphProgress += 0.008;
    if (morphProgress >= 1) {
      morphProgress = 1;
      morphDirection = 0;
    }

    const pos = geometry.attributes.position.array;
    const t = smoothstep(morphProgress);
    for (let i = 0; i < pos.length; i++) {
      pos[i] = positionsFrom[i] + (positionsTo[i] - positionsFrom[i]) * t;
    }
    geometry.attributes.position.needsUpdate = true;
  }

  // Mouse glow follows cursor in 3D
  const vec = new THREE.Vector3(mouse.x, mouse.y, 0.5);
  vec.unproject(camera);
  vec.sub(camera.position).normalize();
  const dist = -camera.position.z / vec.z;
  const glowPos = camera.position.clone().add(vec.multiplyScalar(dist * 0.3));
  glowLight.position.copy(glowPos);
  glowLight.intensity = 2 + Math.sin(elapsed * 3) * 0.5;

  // Update star size
  if (material) {
    material.size = 0.02 * starSize;
  }

  controls.update();
  renderer.render(scene, camera);
}

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

// --- Resize ---
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// --- UI Controls ---
document.getElementById('starCount').addEventListener('input', (e) => {
  starCount = parseInt(e.target.value);
  document.getElementById('countDisplay').textContent = starCount;
  createGalaxy();
});

document.getElementById('arms').addEventListener('input', (e) => {
  spiralArms = parseInt(e.target.value);
  document.getElementById('armsDisplay').textContent = spiralArms;
  if (morphTarget === 'galaxy') createGalaxy();
});

document.getElementById('rotSpeed').addEventListener('input', (e) => {
  rotationSpeed = parseFloat(e.target.value) / 10;
  document.getElementById('speedDisplay').textContent = rotationSpeed.toFixed(1);
});

document.getElementById('starSize').addEventListener('input', (e) => {
  starSize = parseFloat(e.target.value) / 10;
  document.getElementById('sizeDisplay').textContent = starSize.toFixed(1);
});

document.getElementById('morphBtn').addEventListener('click', () => {
  startMorph();
  document.getElementById('morphBtn').textContent = `Shape: ${morphShapes[(morphIndex + 1) % morphShapes.length]}`;
});

document.getElementById('colorBtn').addEventListener('click', () => {
  paletteIndex = (paletteIndex + 1) % palettes.length;
  document.getElementById('colorBtn').textContent = `Palette: ${palettes[paletteIndex].name}`;
  createGalaxy();
});

// --- Start ---
createGalaxy();
animate();
