// burxangpt — 3D-город подписчиков на Three.js. Дома — жители, в центре — шалаш хозяина.
import * as THREE from 'three';
import {OrbitControls} from './OrbitControls.js';
import {NICKS} from './data.js';
import {CONFIG} from './config.js';

const $ = (s) => document.querySelector(s);
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
let seed = 20261109;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const between = (a, b) => a + rnd() * (b - a);
const MOBILE = matchMedia('(pointer:coarse)').matches || innerWidth < 700;
const QS = new URLSearchParams(location.search);

// ---------- тексты из конфига ----------
$('#cityName').textContent = $('#cityName2').textContent = CONFIG.cityName;
document.querySelectorAll('.owner').forEach((e) => (e.textContent = '@' + CONFIG.channelHandle));
$('#badgeLink').textContent = '@' + CONFIG.channelHandle;
$('#badgeLink').href = $('#gsub').href = CONFIG.channelUrl;
$('#wcount').textContent = $('#count').textContent = NICKS.length.toLocaleString('ru-RU');

// ---------- рендерер ----------
let renderer;
try {
  renderer = new THREE.WebGLRenderer({antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: QS.has('shot')});
} catch (e) {
  $('#loading').innerHTML = '<div>Нужен браузер с WebGL</div>';
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, MOBILE ? 1.75 : 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.id = 'c';
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 1, 6000);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.screenSpacePanning = false;
controls.maxPolarAngle = 1.38;
controls.minPolarAngle = 0.15;
controls.autoRotateSpeed = 0.5;

// ---------- свет, небо, звёзды ----------
const hemi = new THREE.HemisphereLight(0xcfe6ff, 0x6f8a4a, 1.6);
const sun = new THREE.DirectionalLight(0xfff0d8, 2.4);
sun.castShadow = true;
const SH = 95;
sun.shadow.mapSize.set(MOBILE ? 1024 : 2048, MOBILE ? 1024 : 2048);
Object.assign(sun.shadow.camera, {left: -SH, right: SH, top: SH, bottom: -SH, near: 10, far: 700});
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.5;
scene.add(hemi, sun, sun.target);
scene.fog = new THREE.Fog(0xc4d4e2, 320, 1900);

const skyU = {top: {value: new THREE.Color()}, hor: {value: new THREE.Color()}};
const sky = new THREE.Mesh(new THREE.SphereGeometry(4500, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: 'varying vec3 vp; void main(){ vp = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: 'uniform vec3 top; uniform vec3 hor; varying vec3 vp; void main(){ float h = max(vp.y,0.0); vec3 c = mix(hor, top, pow(smoothstep(0.0,0.7,h),0.75)); gl_FragColor = vec4(c,1.0);\n#include <colorspace_fragment>\n}'
}));
sky.renderOrder = -1;
scene.add(sky);

const starPos = [];
for (let i = 0; i < 900; i++) {
  const a = rnd() * Math.PI * 2, b = 0.08 + rnd() * 1.3;
  starPos.push(Math.cos(a) * Math.cos(b) * 4200, Math.sin(b) * 4200, Math.sin(a) * Math.cos(b) * 4200);
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false}));
scene.add(stars);
const moon = new THREE.Mesh(new THREE.SphereGeometry(90, 24, 16), new THREE.MeshBasicMaterial({color: 0xfff4d6, fog: false, transparent: true, opacity: 0}));
scene.add(moon);

// время суток по часам устройства (?h=21 — подсмотреть другое время)
const KF = {
  night:  {top: '#0b0e28', hor: '#4a3a66', fog: '#3e3e6a', hs: '#7a82c4', hg: '#2a2a48', hi: 0.8, sc: '#8fa0ff', si: 0.45, glow: 1, stars: 1},
  dawn:   {top: '#2e3366', hor: '#f6c09a', fog: '#c89aa0', hs: '#cdb9d2', hg: '#6a6a60', hi: 1.2, sc: '#ffb48a', si: 1.3, glow: 0.6, stars: 0.4},
  morning:{top: '#5f95d0', hor: '#fbeedc', fog: '#c8d0dc', hs: '#f0f2f6', hg: '#7a8a50', hi: 1.5, sc: '#fff0d8', si: 2.2, glow: 0.1, stars: 0},
  noon:   {top: '#3f80cc', hor: '#e6f0f4', fog: '#c4d4e2', hs: '#ffffff', hg: '#7a9a52', hi: 1.7, sc: '#fff6e4', si: 2.6, glow: 0, stars: 0},
  after:  {top: '#5488c8', hor: '#f8e2c4', fog: '#d4c8c8', hs: '#fbeee8', hg: '#7a9050', hi: 1.5, sc: '#fff0d0', si: 2.2, glow: 0.1, stars: 0},
  sunset: {top: '#3a3166', hor: '#fde4b4', fog: '#d79a86', hs: '#e4aab9', hg: '#6a6a48', hi: 1.2, sc: '#ffb070', si: 1.5, glow: 0.7, stars: 0},
  dusk:   {top: '#141a3e', hor: '#f2b48a', fog: '#b98aa0', hs: '#767ec8', hg: '#3a3a50', hi: 0.9, sc: '#9098ff', si: 0.7, glow: 1, stars: 0.8},
};
const TL = [[0, 'night'], [5, 'night'], [6.3, 'dawn'], [8, 'morning'], [12.5, 'noon'], [16.5, 'after'], [18.5, 'sunset'], [19.5, 'dusk'], [21, 'night'], [24, 'night']];
const _c = new THREE.Color();
const mixC = (a, b, t) => new THREE.Color(a).lerp(_c.set(b), t);
const ENV = {glow: 0, hour: 12};
const SUN_DIR = new THREE.Vector3(-0.5, 0.8, 0.4).normalize();
function setTime(h) {
  let i = 0;
  while (i < TL.length - 2 && h >= TL[i + 1][0]) i++;
  const [h0, a] = TL[i], [h1, b] = TL[i + 1];
  const k = h1 > h0 ? clamp((h - h0) / (h1 - h0)) : 0;
  const A = KF[a], B = KF[b];
  skyU.top.value.copy(mixC(A.top, B.top, k));
  skyU.hor.value.copy(mixC(A.hor, B.hor, k));
  scene.fog.color.copy(mixC(A.fog, B.fog, k));
  hemi.color.copy(mixC(A.hs, B.hs, k));
  hemi.groundColor.copy(mixC(A.hg, B.hg, k));
  hemi.intensity = lerp(A.hi, B.hi, k);
  sun.color.copy(mixC(A.sc, B.sc, k));
  sun.intensity = lerp(A.si, B.si, k);
  ENV.glow = lerp(A.glow, B.glow, k);
  ENV.hour = h;
  stars.material.opacity = lerp(A.stars, B.stars, k);
  moon.material.opacity = clamp(ENV.glow * 1.2 - 0.3);
  const day = h > 6.3 && h < 18.8;
  if (day) {
    const t = (h - 6.3) / 12.5, el = Math.max(0.32, Math.sin(t * Math.PI));
    SUN_DIR.set(lerp(-1, 1, t), el * 1.4, 0.45).normalize();
  } else SUN_DIR.set(-0.4, 0.9, 0.35).normalize();
  moon.position.copy(SUN_DIR).multiplyScalar(-1).setY(0.55).normalize().multiplyScalar(3800);
  glowMat.color.set('#a9bfcf').lerp(_c.set('#ffd98a'), ENV.glow);
  if (typeof fireLight !== 'undefined') fireLight.intensity = 25 + 140 * ENV.glow;
  const nm = h < 5.5 || h >= 21 ? 'ночь' : h < 11 ? 'утро' : h < 17 ? 'день' : 'вечер';
  const d = new Date();
  $('#wx').textContent = (nm === 'ночь' ? '☾ ' : '☀ ') + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ' · ' + nm;
}
const glowMat = new THREE.MeshBasicMaterial({color: 0xa9bfcf});

// ---------- земля ----------
function noiseTexture(base, spread, size = 128) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const g = cv.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, size, size);
  for (let i = 0; i < size * size / 5; i++) {
    g.fillStyle = `rgba(${spread[0]},${spread[1]},${spread[2]},${Math.random() * 0.12})`;
    g.fillRect(Math.random() * size, Math.random() * size, 2, 2);
  }
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
const grassTex = noiseTexture('#6f9a52', [20, 50, 10]);
grassTex.repeat.set(900, 900);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), new THREE.MeshStandardMaterial({map: grassTex, roughness: 1}));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// ---------- планировка: улицы, дома по обе стороны, площадь в центре ----------
const STREET = 26, SP = 10, PLAZA = 46, SIDE = 8.5;
const TOTAL = CONFIG.totalPlots || 1000;      // город «обрезан» ровно на столько участков
const cand = [];
for (let k = -10; k <= 10; k++) {
  const z0 = k * STREET;
  for (const side of [-1, 1]) {
    const zc = z0 + side * SIDE;
    for (let i = -26; i <= 26; i++) {
      const x = i * SP + (side > 0 ? 2.5 : 0);
      if (Math.abs(x) < PLAZA && Math.abs(zc) < PLAZA) continue;
      cand.push({x, z: zc, k, side, rot: side < 0 ? 0 : Math.PI, d: Math.hypot(x, zc) + rnd() * 4});
    }
  }
}
cand.sort((a, b) => a.d - b.d);
const plots = cand.slice(0, TOTAL);
const NH = Math.min(NICKS.length - 1, plots.length);   // занятые дома
const NFREE = plots.length - NH;                       // свободные участки
{
  // свободные: внешний пояс города + немного случайных внутри
  const isFree = new Array(plots.length).fill(false);
  const outer = Math.max(0, NFREE - 80);
  for (let i = plots.length - outer; i < plots.length; i++) isFree[i] = true;
  let left = NFREE - outer;
  const inner = plots.length - outer;
  while (left > 0) { const i = Math.floor(rnd() * inner); if (!isFree[i]) { isFree[i] = true; left--; } }
  plots.forEach((pl, i) => (pl.free = isFree[i]));
}
const R_CITY = Math.max(...plots.map((s) => Math.hypot(s.x, s.z))) + 14;

const WALLS = ['#e9dcc0', '#f2efe8', '#b8814f', '#d9cbb0', '#a8553c', '#e7d6b4', '#a9c4cf', '#e2b48c', '#d8c3a5', '#cfd2d6', '#e8c9b0', '#c9b79c'];
const ROOFS = ['#4a5568', '#2f343b', '#b5452f', '#2f6f73', '#5c636b', '#6f8f4e', '#8a4a3a', '#4a6a4a', '#c0392b', '#7a3a2c', '#3f5d7a', '#c8553d'];
const DOORS = ['#c0392b', '#c98a4a', '#f0c060', '#4fc3c8', '#d86a8a', '#e07a40', '#3a3f47'];
const TYPES = ['cottage', 'cottage', 'cottage', 'cottage', 'villa', 'villa', 'modern', 'modern', 'tower'];

// улица: номер по порядку удаления от центра, дом/участок: по порядку слева направо
const streetNo = (k) => (k === 0 ? 1 : 2 * Math.abs(k) + (k > 0 ? 0 : 1));
const perStreet = new Map();
plots.forEach((s) => { const n = streetNo(s.k); if (!perStreet.has(n)) perStreet.set(n, []); perStreet.get(n).push(s); });
perStreet.forEach((arr) => { arr.sort((a, b) => a.x - b.x); arr.forEach((s, i) => (s.num = i + 1)); });

const spots = plots.filter((s) => !s.free);
const FREE = plots.filter((s) => s.free).map((s) => ({
  id: 0, kind: 'free', nickname: 'Свободный участок', reserved: null, x: s.x, z: s.z, rot: s.rot, h: 2, rh: 0,
  street: streetNo(s.k), num: s.num, anchor: new THREE.Vector3(s.x, 3.6, s.z), center: new THREE.Vector3(s.x, 1, s.z),
}));

const HOUSES = spots.map((s, i) => {
  const type = pick(TYPES);
  let w, d, h, rh;
  if (type === 'cottage') { w = between(6, 7.8); d = between(5.4, 6.4); h = between(3.2, 4.4); rh = between(2.2, 3); }
  else if (type === 'villa') { w = between(5.8, 6.8); d = w; h = between(3.6, 4.6); rh = between(2.4, 3.2); }
  else if (type === 'modern') { w = between(7, 8.6); d = between(6, 7); h = between(4.4, 6.6); rh = 0.5; }
  else { w = between(4.6, 5.4); d = w; h = between(8, 11); rh = between(3, 4); }
  const nick = NICKS[i + 1];
  return {
    id: i + 2, nickname: nick, kind: 'house', type, x: s.x, z: s.z, w, d, h, rh, rot: s.rot,
    wall: pick(WALLS), roof: pick(ROOFS), door: pick(DOORS), street: streetNo(s.k), num: s.num,
    anchor: new THREE.Vector3(s.x, h + rh + 0.9, s.z), center: new THREE.Vector3(s.x, h * 0.5, s.z),
  };
});

// ---------- дома (всё инстансами) ----------
const unitBox = new THREE.BoxGeometry(1, 1, 1); unitBox.translate(0, 0.5, 0);
const tri = new THREE.Shape(); tri.moveTo(-0.5, 0); tri.lineTo(0.5, 0); tri.lineTo(0, 1); tri.lineTo(-0.5, 0);
const gableGeo = new THREE.ExtrudeGeometry(tri, {depth: 1, bevelEnabled: false}); gableGeo.translate(0, 0, -0.5); gableGeo.rotateY(Math.PI / 2);
const pyrGeo = new THREE.ConeGeometry(0.5 * Math.SQRT2, 1, 4); pyrGeo.rotateY(Math.PI / 4); pyrGeo.translate(0, 0.5, 0);
const mat = (o = {}) => new THREE.MeshStandardMaterial({color: 0xffffff, roughness: 0.9, ...o});

const wallsMesh = new THREE.InstancedMesh(unitBox, mat(), NH);
const roofDefs = {gable: {geo: gableGeo, list: []}, pyr: {geo: pyrGeo, list: []}, flat: {geo: unitBox, list: []}};
HOUSES.forEach((h) => roofDefs[h.type === 'cottage' ? 'gable' : h.type === 'modern' ? 'flat' : 'pyr'].list.push(h));
const roofMeshes = {};
for (const [k, def] of Object.entries(roofDefs)) {
  const m = new THREE.InstancedMesh(def.geo, mat({roughness: 0.8}), Math.max(1, def.list.length));
  m.count = def.list.length;
  roofMeshes[k] = m;
}
const dummy = new THREE.Object3D();
const col = new THREE.Color();
const winList = [], doorList = [];
HOUSES.forEach((h, i) => {
  dummy.rotation.set(0, h.rot, 0);
  dummy.position.set(h.x, 0, h.z); dummy.scale.set(h.w, h.h, h.d); dummy.updateMatrix();
  wallsMesh.setMatrixAt(i, dummy.matrix); wallsMesh.setColorAt(i, col.set(h.wall));
  const s = Math.cos(h.rot);
  const front = h.d / 2 + 0.03;
  const win = (lx, y) => winList.push([h.x + lx * s, y, h.z + front * s, h.rot]);
  win(-h.w * 0.24, h.h * 0.55); win(h.w * 0.24, h.h * 0.55);
  if (h.h > 5.2) { win(-h.w * 0.24, h.h * 0.82); win(h.w * 0.24, h.h * 0.82); }
  doorList.push([h.x, h.z + front * s, h.rot, h.door]);
});
roofDefs && Object.entries(roofDefs).forEach(([k, def]) => {
  const m = roofMeshes[k];
  def.list.forEach((h, j) => {
    dummy.rotation.set(0, h.rot, 0);
    dummy.position.set(h.x, h.h, h.z);
    if (k === 'flat') dummy.scale.set(h.w * 1.08, 0.5, h.d * 1.08); else dummy.scale.set(h.w * 1.1, h.rh, h.d * 1.1);
    dummy.updateMatrix();
    m.setMatrixAt(j, dummy.matrix); m.setColorAt(j, col.set(h.roof));
  });
});
[wallsMesh, ...Object.values(roofMeshes)].forEach((m) => {
  m.castShadow = m.receiveShadow = true;
  m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true;
  scene.add(m);
});
const winMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1.0, 1.2, 0.08), glowMat, winList.length);
winList.forEach(([x, y, z, r], i) => { dummy.rotation.set(0, r, 0); dummy.position.set(x, y, z); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); winMesh.setMatrixAt(i, dummy.matrix); });
const doorMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1.15, 2.1, 0.1), mat({roughness: 0.7}), doorList.length);
doorList.forEach(([x, z, r, c], i) => { dummy.rotation.set(0, r, 0); dummy.position.set(x, 1.05, z); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); doorMesh.setMatrixAt(i, dummy.matrix); doorMesh.setColorAt(i, col.set(c)); });
scene.add(winMesh, doorMesh);

// ---------- свободные участки: пустой двор и табличка ----------
const plotMesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(8.4, 7.4).rotateX(-Math.PI / 2), mat({roughness: 1}), Math.max(1, FREE.length));
const stakeMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.18, 2.2, 0.18).translate(0, 1.1, 0), mat({color: 0x6b4a2a}), Math.max(1, FREE.length));
const boardMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1.8, 1.0, 0.1), mat({roughness: 0.7}), Math.max(1, FREE.length));
plotMesh.count = stakeMesh.count = boardMesh.count = FREE.length;
FREE.forEach((f, i) => {
  const c = Math.cos(f.rot);
  dummy.rotation.set(0, f.rot, 0); dummy.scale.set(1, 1, 1);
  dummy.position.set(f.x, 0.09, f.z); dummy.updateMatrix(); plotMesh.setMatrixAt(i, dummy.matrix);
  plotMesh.setColorAt(i, col.set(pick(['#86a45e', '#97ad66', '#a9a574', '#8fae62'])));
  dummy.position.set(f.x - 2.8 * c, 0, f.z + 3.1 * c); dummy.updateMatrix(); stakeMesh.setMatrixAt(i, dummy.matrix);
  dummy.position.set(f.x - 2.8 * c, 2.0, f.z + 3.1 * c); dummy.updateMatrix(); boardMesh.setMatrixAt(i, dummy.matrix);
  boardMesh.setColorAt(i, col.set('#ffcf7a'));
});
plotMesh.receiveShadow = true; stakeMesh.castShadow = boardMesh.castShadow = true;
[plotMesh, stakeMesh, boardMesh].forEach((m) => { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; scene.add(m); });

// ---------- дороги и фонари ----------
function roadTexture() {
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 64;
  const g = cv.getContext('2d');
  g.fillStyle = '#4b4a57'; g.fillRect(0, 0, 128, 64);
  g.fillStyle = '#6a6878'; g.fillRect(0, 0, 128, 5); g.fillRect(0, 59, 128, 5);
  g.fillStyle = '#e9d9a8'; g.fillRect(8, 30, 46, 4);
  const t = new THREE.CanvasTexture(cv); t.wrapS = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
const roadTex = roadTexture();
const roadMat = new THREE.MeshStandardMaterial({map: roadTex, roughness: 1});
const lampPos = [];
for (let k = -10; k <= 10; k++) {
  const z0 = k * STREET, half = Math.sqrt(Math.max(0, R_CITY * R_CITY - z0 * z0));
  if (half < 20) continue;
  const len = half * 2;
  const geo = new THREE.PlaneGeometry(len, 5.2);
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * (len / 16));
  const road = new THREE.Mesh(geo, roadMat);
  road.rotation.x = -Math.PI / 2; road.position.set(0, 0.04, z0); road.receiveShadow = true;
  scene.add(road);
  for (let x = -Math.floor(half / 20) * 20; x <= half; x += 20) {
    if (Math.abs(x) < PLAZA && Math.abs(z0) < PLAZA) continue;
    lampPos.push([x, z0 + 3.6]);
  }
}
{
  const poles = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.1, 0.14, 4.2, 6).translate(0, 2.1, 0), mat({color: 0x2b2230}), lampPos.length);
  const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.36, 10, 8), glowMat, lampPos.length);
  lampPos.forEach(([x, z], i) => {
    dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1, 1);
    dummy.position.set(x, 0, z); dummy.updateMatrix(); poles.setMatrixAt(i, dummy.matrix);
    dummy.position.set(x, 4.3, z); dummy.updateMatrix(); bulbs.setMatrixAt(i, dummy.matrix);
  });
  poles.castShadow = true;
  scene.add(poles, bulbs);
}

// ---------- деревья по краям ----------
{
  const T = [];
  for (let n = 0; n < 1100; n++) {
    const a = rnd() * Math.PI * 2, r = R_CITY + 6 + Math.pow(rnd(), 1.6) * 150;
    T.push([Math.cos(a) * r, Math.sin(a) * r, between(0.8, 1.7)]);
  }
  for (let n = 0; n < 9; n++) T.push([30 + between(-10, 10), 31 + between(-8, 8), between(0.9, 1.4)]);
  const crown = new THREE.InstancedMesh(new THREE.ConeGeometry(1.6, 4, 7).translate(0, 3.6, 0), mat(), T.length);
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22, 0.3, 1.8, 6).translate(0, 0.9, 0), mat({color: 0x6b4a2f}), T.length);
  const greens = ['#3f7a45', '#4d8a4a', '#2f6a3e', '#5b9650'];
  T.forEach(([x, z, s], i) => {
    dummy.rotation.set(0, rnd() * 6, 0); dummy.position.set(x, 0, z); dummy.scale.set(s, s, s); dummy.updateMatrix();
    crown.setMatrixAt(i, dummy.matrix); trunk.setMatrixAt(i, dummy.matrix); crown.setColorAt(i, col.set(pick(greens)));
  });
  crown.castShadow = trunk.castShadow = true;
  scene.add(crown, trunk);
}

// ---------- площадь и ШАЛАШ хозяина ----------
const hut = new THREE.Group();
let fireLight, flameA, flameB;
{
  // площадь: брусчатка, лужайки, дорожка к зданию
  const cob = (() => { const t = noiseTexture('#cfc2a2', [120, 100, 70], 128); t.repeat.set(12, 12); return t; })();
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(PLAZA - 2, 72), new THREE.MeshStandardMaterial({map: cob, roughness: 1}));
  plaza.rotation.x = -Math.PI / 2; plaza.position.y = 0.07; plaza.receiveShadow = true; scene.add(plaza);
  const lawnMat = new THREE.MeshStandardMaterial({map: grassTex, roughness: 1});
  for (const [lx, lz, lw, ld] of [[-30, 31, 26, 22], [30, 31, 26, 22], [0, -27, 64, 16]]) {
    const l = new THREE.Mesh(new THREE.PlaneGeometry(lw, ld), lawnMat);
    l.rotation.x = -Math.PI / 2; l.position.set(lx, 0.1, lz); l.receiveShadow = true; scene.add(l);
  }
  const path = new THREE.Mesh(new THREE.PlaneGeometry(9, 26), mat({color: 0xe2d6b8}));
  path.rotation.x = -Math.PI / 2; path.position.set(0, 0.12, 31); path.receiveShadow = true; scene.add(path);

  // солома
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  const g = cv.getContext('2d');
  g.fillStyle = '#b99a4e'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) {
    g.strokeStyle = `rgba(${90 + Math.random() * 60},${60 + Math.random() * 50},20,${0.25 + Math.random() * 0.4})`;
    g.lineWidth = 1 + Math.random() * 2;
    const x = Math.random() * 256, y = Math.random() * 256;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (Math.random() - .5) * 6, y + 20 + Math.random() * 30); g.stroke();
  }
  for (let y = 0; y < 256; y += 32) { g.fillStyle = 'rgba(70,45,10,.35)'; g.fillRect(0, y, 256, 3); }
  const thatchTex = new THREE.CanvasTexture(cv); thatchTex.wrapS = thatchTex.wrapT = THREE.RepeatWrapping; thatchTex.colorSpace = THREE.SRGBColorSpace; thatchTex.repeat.set(2, 2);
  const thatch = new THREE.MeshStandardMaterial({map: thatchTex, roughness: 1, side: THREE.DoubleSide});
  const wood = mat({color: 0x6b4a2a, roughness: 1});
  const add = (geo, m, x, y, z, cast = true) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = cast; o.receiveShadow = true; hut.add(o); return o; };

  const W = 9.4, LEN = 10.4, HH = 6.4;
  const panelLen = Math.hypot(HH, W / 2), ang = Math.atan2(HH, W / 2);
  for (const s of [-1, 1]) {
    const p = add(new THREE.BoxGeometry(panelLen, 0.4, LEN), thatch, s * W / 4, HH / 2, 0);
    p.rotation.z = -s * ang;
  }
  // задняя стенка и тёмный проём спереди
  const gab = new THREE.Shape(); gab.moveTo(-W / 2, 0); gab.lineTo(W / 2, 0); gab.lineTo(0, HH); gab.closePath();
  const back = new THREE.Mesh(new THREE.ShapeGeometry(gab), thatch); back.position.set(0, 0, -LEN / 2 + 0.2); back.rotation.y = Math.PI; back.castShadow = true; hut.add(back);
  const doorShape = new THREE.Shape(); doorShape.moveTo(-W / 2 * 0.78, 0); doorShape.lineTo(W / 2 * 0.78, 0); doorShape.lineTo(0, HH * 0.8); doorShape.closePath();
  const inside = new THREE.Mesh(new THREE.ShapeGeometry(doorShape), new THREE.MeshStandardMaterial({color: 0x1a120c, emissive: 0x4a2208, emissiveIntensity: 0.6, roughness: 1, side: THREE.DoubleSide}));
  inside.position.set(0, 0.05, LEN / 2 - 1.6); hut.add(inside);
  // коньковая жердь и скрещённые жерди спереди и сзади
  add(new THREE.CylinderGeometry(0.2, 0.2, LEN + 2.4, 8).rotateX(Math.PI / 2), wood, 0, HH + 0.12, 0);
  const up = new THREE.Vector3(0, 1, 0);
  for (const zf of [LEN / 2 + 0.1, -LEN / 2 - 0.1]) for (const s of [-1, 1]) {
    const dir = new THREE.Vector3(-s * W / 2, HH + 0.2, 0).normalize();
    const L = panelLen * 1.16;
    const o = add(new THREE.CylinderGeometry(0.2, 0.26, L, 7), wood, s * W / 2 + dir.x * L / 2, dir.y * L / 2, zf);
    o.quaternion.setFromUnitVectors(up, dir);
  }
  // нижние лежни вдоль стен
  for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.3, 0.3, LEN + 0.6, 8).rotateX(Math.PI / 2), wood, s * (W / 2 + 0.15), 0.3, 0);
  // пучки травы на крыше
  for (let n = 0; n < 16; n++) {
    const s = n % 2 ? 1 : -1, t = Math.random();
    const b = add(new THREE.ConeGeometry(0.35, 1.2, 5), thatch, s * (W / 2) * (1 - t) * 0.96, HH * t + 0.15, -LEN / 2 + 0.6 + Math.random() * (LEN - 1.2), false);
    b.rotation.z = -s * 0.5;
  }

  // костёр перед входом
  const fz = LEN / 2 + 4.2;
  for (let n = 0; n < 9; n++) { const a = n / 9 * Math.PI * 2; add(new THREE.DodecahedronGeometry(0.34, 0), mat({color: 0x8a8d94}), Math.cos(a) * 1.25, 0.25, fz + Math.sin(a) * 1.25); }
  for (let n = 0; n < 4; n++) { const o = add(new THREE.CylinderGeometry(0.16, 0.16, 1.8, 6), wood, 0, 0.35, fz); o.rotation.set(Math.PI / 2 - 0.2, n * Math.PI / 4 + 0.3, 0); o.rotation.order = 'YXZ'; }
  flameA = new THREE.Mesh(new THREE.ConeGeometry(0.75, 2.2, 8), new THREE.MeshBasicMaterial({color: 0xff7a1c, transparent: true, opacity: 0.92}));
  flameA.position.set(0, 1.25, fz); hut.add(flameA);
  flameB = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.4, 8), new THREE.MeshBasicMaterial({color: 0xffd45a}));
  flameB.position.set(0, 0.95, fz); hut.add(flameB);
  fireLight = new THREE.PointLight(0xff9040, 60, 42, 2); fireLight.position.set(0, 2.2, fz + 0.4); hut.add(fireLight);
  // брёвна-сиденья
  for (const a of [0.9, 2.2, 4.0, 5.3]) {
    const o = add(new THREE.CylinderGeometry(0.42, 0.42, 2.4, 10), wood, Math.cos(a) * 3.8, 0.42, fz + Math.sin(a) * 3.8);
    o.rotation.set(0, 0, Math.PI / 2); o.rotation.order = 'ZYX'; o.rotation.y = -a + Math.PI / 2;
  }
  // табличка у входа
  const sc = document.createElement('canvas'); sc.width = 512; sc.height = 160;
  const sg = sc.getContext('2d');
  sg.fillStyle = '#c48a52'; sg.fillRect(0, 0, 512, 160);
  for (let y = 0; y < 160; y += 9) { sg.fillStyle = 'rgba(0,0,0,.06)'; sg.fillRect(0, y, 512, 2); }
  sg.strokeStyle = '#3a2414'; sg.lineWidth = 10; sg.strokeRect(5, 5, 502, 150);
  sg.fillStyle = '#2a1810'; sg.textAlign = 'center'; sg.textBaseline = 'middle';
  sg.font = '900 70px Rubik, Arial, sans-serif'; sg.fillText('ШАЛАШ', 256, 58);
  sg.font = '800 44px Rubik, Arial, sans-serif'; sg.fillText('@' + CONFIG.owner, 256, 116);
  const signTex = new THREE.CanvasTexture(sc); signTex.colorSpace = THREE.SRGBColorSpace; signTex.anisotropy = 4;
  add(new THREE.CylinderGeometry(0.14, 0.18, 3.2, 6), wood, -6.2, 1.6, LEN / 2 + 2.2);
  const board = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.3, 0.2), [wood, wood, wood, wood, new THREE.MeshStandardMaterial({map: signTex, roughness: 0.9}), wood]);
  board.position.set(-6.2, 3.1, LEN / 2 + 2.3); board.rotation.y = 0.18; board.castShadow = true; hut.add(board);
}
hut.position.set(-30, 0, 28);
hut.scale.setScalar(0.8);
scene.add(hut);
const HUT_ANCHOR = new THREE.Vector3(-30, 7.6, 28);
const OWNER = {id: 1, nickname: NICKS[0], kind: 'hut', anchor: HUT_ANCHOR, center: new THREE.Vector3(-30, 3, 31), h: 8, street: 0, num: 0};

// ---------- ПРОКУРАТУРА в центре города ----------
const office = new THREE.Group();
let officeFlag;
{
  const stone = mat({color: 0xdccfb4}), stoneL = mat({color: 0xe9dfca}), stoneD = mat({color: 0xb9ac92}), wing = mat({color: 0xd3c5a8}), dark = mat({color: 0x5a4a3a});
  const gold = mat({color: 0xd8a93c, roughness: 0.4, metalness: 0.45, emissive: 0x3a2a05});
  const add = (geo, m, x, y, z, cast = true) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = cast; o.receiveShadow = true; office.add(o); return o; };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  add(box(70, 1.2, 34), stoneD, 0, 0.6, 2);                  // платформа
  add(box(38, 0.6, 3.2), stoneL, 0, 1.5, 15.6);              // ступени
  add(box(32, 0.6, 2.4), stoneL, 0, 1.5, 13.3);
  add(box(30, 12, 16), stone, 0, 7.2, 0);                    // центральный корпус
  add(box(31.4, 0.9, 17.4), stoneL, 0, 13.65, 0);            // карниз
  for (const s of [-1, 1]) {
    add(box(18, 8.5, 14), wing, s * 24, 5.45, 0);            // крылья
    add(box(18.8, 0.8, 14.8), stoneL, s * 24, 10.1, 0);
    for (const row of [3.6, 7.0]) for (const c of [-6, -2, 2, 6]) add(box(1.5, 2.3, 0.12), glowMat, s * 24 + c, row + 1.2, 7.06, false);
    for (const row of [3.6, 7.0]) for (const c of [-3, 3]) add(box(0.12, 2.3, 1.5), glowMat, s * 33.06, row + 1.2, c, false);
  }
  const colGeo = new THREE.CylinderGeometry(0.82, 0.9, 10.4, 18), capGeo = box(2.2, 0.5, 2.2), baseGeo = box(2.1, 0.4, 2.1);
  for (let k = 0; k < 8; k++) {                              // колонны портика
    const x = -12 + k * (24 / 7);
    add(colGeo, stoneL, x, 6.4, 11.5); add(capGeo, stoneL, x, 11.35, 11.5); add(baseGeo, stoneL, x, 1.4, 11.5);
  }
  add(box(27.6, 1.6, 5.8), stoneL, 0, 12.4, 11.2);           // антаблемент и фриз с надписью
  
 
  // Текстура надписи прокуратуры
  const officeCanvas = document.createElement('canvas');
  officeCanvas.width = 2048;
  officeCanvas.height = 128;

  const officeCtx = officeCanvas.getContext('2d');

  const officeTexture = new THREE.CanvasTexture(officeCanvas);
  officeTexture.colorSpace = THREE.SRGBColorSpace;

  function updateOfficeLanguage(lang) {
    officeCtx.clearRect(0, 0, officeCanvas.width, officeCanvas.height);

    officeCtx.fillStyle = '#e9dfca';
    officeCtx.fillRect(0, 0, officeCanvas.width, officeCanvas.height);

    officeCtx.fillStyle = '#7a5c22';
    officeCtx.font = '700 84px Georgia, "Times New Roman", serif';
    officeCtx.textAlign = 'center';
    officeCtx.textBaseline = 'middle';

    if ('letterSpacing' in officeCtx) {
      officeCtx.letterSpacing = '12px';
    }

    officeCtx.fillText(
      lang === 'ru' ? 'ПРОКУРАТУРА' : 'PROKURATURA',
      officeCanvas.width / 2,
      officeCanvas.height / 2
    );

    officeTexture.needsUpdate = true;
  }

  window.updateOfficeLanguage = updateOfficeLanguage;

  window.addEventListener('city-language-change', (event) => {
    updateOfficeLanguage(event.detail?.lang || 'uz');
  });

  // Первоначальный язык
  updateOfficeLanguage(CONFIG.lang || 'uz');

  const fr = new THREE.Mesh(new THREE.PlaneGeometry(26, 1.3), new THREE.MeshStandardMaterial({map: officeTexture, roughness: 0.8}));
  fr.position.set(0, 12.4, 14.12); office.add(fr);
  const sh = new THREE.Shape(); sh.moveTo(-14, 0); sh.lineTo(14, 0); sh.lineTo(0, 4.8); sh.lineTo(-14, 0);   // фронтон
  const ped = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, {depth: 5.8, bevelEnabled: false}), stoneL);
  ped.position.set(0, 13.2, 8.4); ped.castShadow = ped.receiveShadow = true; office.add(ped);
  const tym = new THREE.Mesh(new THREE.CircleGeometry(1.1, 24), gold); tym.position.set(0, 14.6, 14.22); office.add(tym);
  add(box(4, 6.6, 0.2), dark, 0, 4.5, 8.06, false);          // двери и окна основного фасада
  add(box(3.2, 5.8, 0.22), glowMat, 0, 4.2, 8.1, false);
  for (const s of [-1, 1]) for (const c of [4.8, 8.2, 11.6]) add(box(1.5, 4.6, 0.12), glowMat, s * c, 7.4, 8.06, false);
  add(new THREE.CylinderGeometry(6.6, 6.8, 4, 40), stone, 0, 16.1, 0);       // барабан и купол
  add(new THREE.CylinderGeometry(7.1, 7.1, 0.6, 40), stoneL, 0, 18.3, 0);
  for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; const w = add(box(1.1, 2.2, 0.12), glowMat, Math.sin(a) * 6.62, 16.2, Math.cos(a) * 6.62, false); w.rotation.y = a; }
  add(new THREE.SphereGeometry(6.7, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), gold, 0, 18.6, 0);
  add(new THREE.CylinderGeometry(1.15, 1.3, 2.4, 16), stoneL, 0, 25.5, 0);
  add(new THREE.SphereGeometry(1.3, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), gold, 0, 26.7, 0);
  add(new THREE.CylinderGeometry(0.08, 0.08, 4.6, 8), gold, 0, 29.2, 0, false);
  const fc = document.createElement('canvas'); fc.width = 64; fc.height = 36;      // флаг
  const fx = fc.getContext('2d'); fx.fillStyle = '#c6372f'; fx.fillRect(0, 0, 64, 36); fx.fillStyle = '#f3c64a'; fx.fillRect(0, 12, 64, 12);
  const ftx = new THREE.CanvasTexture(fc); ftx.colorSpace = THREE.SRGBColorSpace;
  const flagGeo = new THREE.PlaneGeometry(3.2, 1.8, 10, 2); flagGeo.translate(1.6, 0, 0);
  officeFlag = new THREE.Mesh(flagGeo, new THREE.MeshBasicMaterial({map: ftx, side: THREE.DoubleSide}));
  officeFlag.position.set(0.08, 30.6, 0); office.add(officeFlag);
  const poleG = new THREE.CylinderGeometry(0.1, 0.14, 4.4, 8), bulbG = new THREE.SphereGeometry(0.38, 12, 8);   // фонари
  for (const x of [-15, 15]) for (const z of [26, 38]) { add(poleG, dark, x, 2.2, z); add(bulbG, glowMat, x, 4.6, z, false); }
}
scene.add(office);
const OFFICE = {id: 0, nickname: 'Прокуратура', kind: 'office', anchor: new THREE.Vector3(0, 33.6, 0), center: new THREE.Vector3(0, 12, 0), h: 30, street: 0, num: 0};

// ---------- реестр ников ----------
const ALL = [OWNER, ...HOUSES];
const BY = new Map(ALL.map((h) => [h.nickname.toLowerCase(), h]));
BY.set('прокуратура', OFFICE);

// ---------- подписи над домами ----------
const labelsEl = $('#labels');
const POOL = MOBILE ? 40 : 72;
const pool = Array.from({length: POOL}, () => { const d = document.createElement('div'); d.className = 'tag'; labelsEl.appendChild(d); return {el: d, ent: null, txt: ''}; });
const heroes = [{ent: OWNER, tag: pool[0], text: OWNER.nickname, ref: 150}, {ent: OFFICE, tag: pool[1], text: 'Прокуратура', ref: 230}];
heroes.forEach((h) => { h.tag.el.classList.add('me'); h.tag.el.textContent = h.text; });
let selected = null;
const _v = new THREE.Vector3();
function updateLabels() {
  const W = innerWidth, H = innerHeight, cp = camera.position;
  const list = selected && selected.kind === 'free' ? [...HOUSES, selected] : HOUSES;
  const cand2 = [];
  for (const h of list) {
    const dist = cp.distanceTo(h.anchor);
    if (dist > 260 && h !== selected) continue;
    _v.copy(h.anchor).project(camera);
    if (_v.z > 1 || Math.abs(_v.x) > 1.05 || _v.y > 1.05 || _v.y < -1.2) continue;
    cand2.push({h, dist, x: (_v.x * 0.5 + 0.5) * W, y: (-_v.y * 0.5 + 0.5) * H});
  }
  cand2.sort((a, b) => (a.h === selected ? -1 : b.h === selected ? 1 : a.dist - b.dist));
  const taken = [];
  for (const hr of heroes) {
    _v.copy(hr.ent.anchor).project(camera);
    if (_v.z < 1 && Math.abs(_v.x) < 1.2 && _v.y < 1.3 && _v.y > -1.3) {
      const x = (_v.x * 0.5 + 0.5) * W, y = (-_v.y * 0.5 + 0.5) * H;
      const sc = clamp(hr.ref / cp.distanceTo(hr.ent.anchor) + 0.4, 0.8, 1.35);
      hr.tag.el.style.display = 'block';
      hr.tag.el.style.transform = `translate(${x.toFixed(1)}px,${(y - 8).toFixed(1)}px) translate(-50%,-100%) scale(${sc.toFixed(3)})`;
      taken.push({x0: x - 80 * sc, x1: x + 80 * sc, y0: y - 44 * sc, y1: y});
    } else hr.tag.el.style.display = 'none';
  }
  let used = heroes.length;
  for (const c of cand2) {
    if (used >= POOL) break;
    const text = c.h.kind === 'free' ? c.h.reserved : c.h.nickname;
    if (!text) continue;
    const sc = clamp(95 / c.dist + 0.3, 0.7, 1.15);
    const w = (text.length * 7.6 + 26) * sc, hh = 26 * sc;
    const r = {x0: c.x - w / 2, x1: c.x + w / 2, y0: c.y - hh - 8, y1: c.y};
    if (c.h !== selected && taken.some((t) => r.x0 < t.x1 && r.x1 > t.x0 && r.y0 < t.y1 && r.y1 > t.y0)) continue;
    taken.push(r);
    const p = pool[used++];
    if (p.txt !== text) { p.el.textContent = text; p.txt = text; }
    p.el.style.display = 'block';
    p.el.style.transform = `translate(${c.x.toFixed(1)}px,${(c.y - 8).toFixed(1)}px) translate(-50%,-100%) scale(${sc.toFixed(3)})`;
    p.el.style.opacity = c.dist > 200 ? clamp(1 - (c.dist - 200) / 60) : 1;
    p.el.classList.toggle('me', c.h === selected);
  }
  for (let i = used; i < POOL; i++) { pool[i].el.style.display = 'none'; pool[i].txt = ''; }
}

// ---------- камера: режимы и перелёты ----------
let mode = 'free', fly = null;
function setMode(m) {
  mode = m;
  if (m === 'orbit') {
    controls.mouseButtons = {LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN};
    controls.touches = {ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN};
    controls.enablePan = false; controls.zoomToCursor = false;
    controls.minDistance = 9; controls.maxDistance = 140; controls.rotateSpeed = 1;
  } else {
    controls.mouseButtons = {LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE};
    controls.touches = {ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE};
    controls.enablePan = true; controls.zoomToCursor = true;
    controls.minDistance = 14; controls.maxDistance = 700; controls.rotateSpeed = 0.6;
  }
}
function flyTo(target, offset, ms = 1800) {
  fly = {t0: performance.now(), ms, p0: camera.position.clone(), a0: controls.target.clone(), p1: target.clone().add(offset), a1: target.clone()};
}
function stepFly(now) {
  if (!fly) return;
  const k = clamp((now - fly.t0) / fly.ms), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  controls.target.lerpVectors(fly.a0, fly.a1, e);
  camera.position.lerpVectors(fly.p0, fly.p1, e);
  if (k >= 1) fly = null;
}
controls.addEventListener('start', () => { fly = null; controls.autoRotate = false; });
const HOME_T = new THREE.Vector3(0, 10, 14), HOME_O = new THREE.Vector3(0, 42, 112);
camera.position.copy(HOME_T).add(HOME_O); controls.target.copy(HOME_T);
setMode('free'); controls.update();

function zoomBy(f) {
  fly = null;
  const off = camera.position.clone().sub(controls.target);
  off.setLength(clamp(off.length() * f, controls.minDistance, controls.maxDistance));
  camera.position.copy(controls.target).add(off);
}
function orbitBy(a) {
  fly = null;
  const off = camera.position.clone().sub(controls.target).applyAxisAngle(new THREE.Vector3(0, 1, 0), a);
  camera.position.copy(controls.target).add(off);
}

// ---------- интерфейс ----------
const info = $('#info'), msg = $('#msg'), ghost = $('#ghost');
const orbitOff = (h) => {
  const portrait = innerWidth <= innerHeight, k = portrait ? 1.6 : 1;
  if (h.kind === 'office') return new THREE.Vector3(0, 32, 100).multiplyScalar(portrait ? 1.3 : 1);
  if (h.kind === 'hut') { const d = (portrait ? 46 : 34); return new THREE.Vector3(d * 0.15, d * 0.38, d); }
  // камера встаёт в просвет между рядами домов и смотрит сверху: дома другого ряда не загораживают
  const f = Math.cos(h.rot) >= 0 ? 1 : -1;
  return new THREE.Vector3(2.5, Math.max(15, h.h + h.rh + 5) * (portrait ? 1.35 : 1), f * 21.5);
};
function neighbours(h) {
  if (h.kind !== 'house') return HOUSES.slice(0, 4);
  return HOUSES.filter((x) => x !== h && x.street === h.street).sort((a, b) => Math.hypot(a.x - h.x, a.z - h.z) - Math.hypot(b.x - h.x, b.z - h.z)).slice(0, 5);
}
function placeBars() {
  const hgt = info.hidden ? 0 : info.offsetHeight;
  $('#orbitbar').style.bottom = `calc(env(safe-area-inset-bottom) + ${hgt + 24}px)`;
  $('#tools').style.bottom = `calc(env(safe-area-inset-bottom) + ${hgt + 84}px)`;
}
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); requestAnimationFrame(placeBars); });

function showInfo(h) {
  const k = h.kind;
  $('#nick').textContent = k === 'free' ? (h.reserved || 'Свободный участок') : h.nickname;
  $('#addr').textContent = k === 'hut' ? 'Шалаш хозяина · на площади' : k === 'office' ? 'Здание в центре города' : k === 'free' ? `Улица ${h.street} · участок ${h.num}` : `Улица ${h.street} · дом ${h.num}`;
  $('#status').textContent = k === 'hut' ? 'Хозяин города. Здесь всё началось.' : k === 'office' ? 'Главное здание города.' : k === 'free' ? `Свободен. Подпишись на @${CONFIG.channelHandle}, и здесь вырастет твой дом.` : `Житель №${h.id} из ${NICKS.length}`;
  const pr = $('#profile');
  pr.href = k === 'house' ? CONFIG.profileUrl(h.nickname) : CONFIG.channelUrl;
  pr.textContent = k === 'house' ? 'Профиль ↗' : 'Подписаться ↗';
  $('#nbrs').hidden = true; $('#nbtn').textContent = 'Соседи ▾';
  $('#nbtn').hidden = k === 'free';
  $('#nbrs').innerHTML = neighbours(h).map((x) => `<button class="chip" data-n="${x.nickname}">${x.nickname}</button>`).join('');
  info.hidden = false;
  if (k !== 'free') history.replaceState(null, '', location.pathname + location.search + '#' + h.nickname);
  requestAnimationFrame(placeBars);
}
function inspect(h) {
  selected = h; ghost.hidden = true; msg.textContent = '';
  setMode('orbit');
  const c = h.center;
  flyTo(new THREE.Vector3(c.x, h.kind === 'office' ? c.y : Math.min(c.y, 4), c.z), orbitOff(h), 2200);
  showInfo(h);
  $('#orbitbar').hidden = false;
  const sp = $('#orbitbar span'); sp.style.display = '';
  clearTimeout(window.__hint); window.__hint = setTimeout(() => (sp.style.display = 'none'), 4000);
}
function leaveOrbit() {
  if (mode !== 'orbit') return;
  setMode('free'); $('#orbitbar').hidden = true;
  const t = controls.target.clone(); t.y = 4;
  flyTo(t, new THREE.Vector3(0, 34, 58), 900);
}
function overview() {
  selected = null; info.hidden = true; ghost.hidden = true; msg.textContent = '';
  setMode('free'); $('#orbitbar').hidden = true;
  history.replaceState(null, '', location.pathname + location.search);
  flyTo(new THREE.Vector3(0, 10, 14), new THREE.Vector3(0, 150, 250), 2200);
  requestAnimationFrame(placeBars);
}
function find(q) {
  q = q.trim().replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/[/?#].*$/, '').toLowerCase();
  if (!q) return;
  const h = BY.get(q);
  if (h) { inspect(h); return; }
  $('#welcome').classList.add('gone');
  const near = ALL.filter((x) => x.nickname.toLowerCase().includes(q)).slice(0, 5);
  if (near.length) {
    msg.innerHTML = 'Точного совпадения нет. Может, ты: ' + near.map((x) => `<a href="#" data-n="${x.nickname}">${x.nickname}</a>`).join(', ');
    info.hidden = true; return;
  }
  msg.textContent = '';
  $('#gnick').textContent = q; ghost.hidden = false; info.hidden = true;
  const f0 = FREE[0];
  if (f0) {
    FREE.forEach((f) => (f.reserved = null)); f0.reserved = q;
    selected = f0; setMode('orbit');
    flyTo(new THREE.Vector3(f0.x, 2, f0.z), orbitOff(f0), 2200);
    $('#orbitbar').hidden = false;
  }
}

$('#wf').addEventListener('submit', (e) => { e.preventDefault(); const v = $('#wq').value.trim(); if (!v) return; $('#q').value = v; $('#welcome').classList.add('gone'); controls.autoRotate = false; find(v); });
$('#walk').onclick = () => { $('#welcome').classList.add('gone'); controls.autoRotate = false; };
$('#f').addEventListener('submit', (e) => { e.preventDefault(); find($('#q').value); $('#q').blur(); });
msg.addEventListener('click', (e) => { const n = e.target.dataset && e.target.dataset.n; if (n) { e.preventDefault(); $('#q').value = n; find(n); } });
$('#nbtn').onclick = () => { const n = $('#nbrs'); n.hidden = !n.hidden; $('#nbtn').textContent = n.hidden ? 'Соседи ▾' : 'Соседи ▴'; requestAnimationFrame(placeBars); };
$('#nbrs').addEventListener('click', (e) => { const n = e.target.dataset && e.target.dataset.n; if (n) { $('#q').value = n; find(n); } });
$('#gclose').onclick = () => (ghost.hidden = true);
$('#zin').onclick = () => zoomBy(0.72);
$('#zout').onclick = () => zoomBy(1.38);
$('#overview').onclick = overview;
$('#oleft').onclick = () => orbitBy(-0.4);
$('#oright').onclick = () => orbitBy(0.4);
$('#oexit').onclick = leaveOrbit;
$('#share').onclick = async () => {
  if (!selected) return;
  const url = location.origin + location.pathname + '#' + selected.nickname;
  const b = $('#share');
  try {
    if (navigator.share) await navigator.share({title: CONFIG.cityName, text: 'Мой дом в ' + CONFIG.cityName + ':', url});
    else { await navigator.clipboard.writeText(url); b.textContent = 'Ссылка скопирована'; setTimeout(() => (b.textContent = 'Поделиться'), 2000); }
  } catch (e) {}
};

// ---------- тап по дому ----------
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
let down = null;
renderer.domElement.addEventListener('pointerdown', (e) => { down = {x: e.clientX, y: e.clientY, t: performance.now()}; });
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!down) return;
  const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), dt = performance.now() - down.t;
  down = null;
  if (moved > 6 || dt > 600 || e.button !== 0) return;
  ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects([wallsMesh, ...Object.values(roofMeshes), plotMesh, hut, office], true);
  if (!hits.length) return;
  const o = hits[0].object;
  let ent = null;
  if (o === wallsMesh) ent = HOUSES[hits[0].instanceId];
  else if (o === plotMesh) ent = FREE[hits[0].instanceId];
  else {
    const key = Object.keys(roofMeshes).find((k) => roofMeshes[k] === o);
    if (key) ent = roofDefs[key].list[hits[0].instanceId];
    else { let q = o; while (q && q !== hut && q !== office) q = q.parent; ent = q === hut ? OWNER : q === office ? OFFICE : null; }
  }
  if (!ent) return;
  $('#welcome').classList.add('gone'); controls.autoRotate = false;
  if (mode === 'orbit' && ent === selected) return;
  inspect(ent);
});

// ---------- новости города ----------

 // ---------- ANIMZONE NEWS SYSTEM ----------
{
  const names = NICKS.slice(1);
  const n = () => {
    if (!names.length) return '<i>@resident</i>';
    return `<i>@${names[Math.floor(Math.random() * names.length)]}</i>`;
  };

  const O = `<i>@${CONFIG.owner}</i>`;

  const news = {
    uz: [
      () => `${n()} ertalab turdi va yana uxlashga qaror qildi. Eng to‘g‘ri qaror!`,
      () => `${n()} nonushtaga 15 ta tuxum yedi. Tovuq hali ham shokda`,
      () => `${n()} mushuk bilan shaxmat o‘ynadi. Mushuk 5:0 hisobida yutdi`,
      () => `${n()} yangi uy sotib oldi. Endi uyning o‘ziga pul yig‘moqda`,
      () => `${n()} qo‘shnisidan Wi-Fi parolini so‘radi. Qo‘shni hali ham o‘ylayapti`,
      () => `${n()} o‘zini millioner deb e'lon qildi. Hisobida 3 ta tanga bor`,
      () => `${n()} hovlisiga basseyn qurdi. Unda hozircha bitta baqa suzmoqda`,
      () => `${n()} tort pishirdi. Tortni o‘zi yeb qo‘ydi`,
      () => `${n()} yangi mashina oldi. Faqat mashinaning g‘ildiraklari yo‘q`,
      () => `${n()} ertalab yugurishga chiqdi. 10 soniyadan keyin charchadi`,
      () => `${n()} muzlatkichni ochdi. Ichida faqat umid bor edi`,
      () => `${n()} qo‘shnisining uyiga kirdi. O‘z uyini topolmay qolibdi`,
      () => `${n()} mushugiga telefon olib berdi. Endi mushuk undan ko‘proq onlayn`,
      () => `${n()} 100 metrga yugurish musobaqasida qatnashdi. Startni kutib uxlab qoldi`,
      () => `${n()} yangi biznes ochdi: havoga internet sotish`,
      () => `${n()} o‘z soyasi bilan urishib qoldi. Hozir gaplashmayapti`,
      () => `${n()} uyining tomiga antenna qo‘ydi. Marsdan signal tutdi`,
      () => `${n()} bir kunda 20 ta uy qurdi. Quruvchi hali ham uxlayapti`,
      () => `${n()} qo‘shnisidan bitta kartoshka oldi. Hali qaytarmadi`,
      () => `${n()} yangi telefon oldi. Birinchi bo‘lib mushuk suratga tushdi`,
      () => `${n()} internet tezligini tekshirdi. Natija: toshbaqadan tezroq`,
      () => `${n()} o‘z uyiga lift o‘rnatdi. Lift faqat pastga tushadi`,
      () => `${n()} bog‘iga banan ekdi. Ertasi kuni tarvuz o‘sib chiqdi`,
      () => `${n()} yangi ish boshladi. Birinchi kuni ta'tilga chiqdi`,
      () => `${n()} uyini bo‘yadi. Endi qo‘shnilar quyoshdan ko‘zoynak taqmoqda`,
      () => `${n()} mushugini sayrga olib chiqdi. Mushuk egasini aylantirib keldi`,
      () => `${n()} osh pishirdi. Hatto qozon ham qochib ketmoqchi`,
      () => `${n()} yangi velosiped oldi. Lekin minishni unutibdi`,
      () => `${n()} o‘zini shahar prezidenti deb e'lon qildi. Saylov hali bo‘lmadi`,
      () => `${n()} uyiga 10 ta eshik o‘rnatdi. Qaysi biri kirish eshigi ekanini bilmayapti`,
      () => `${n()} osmonda uchayotgan baliqni ko‘rdim deb aytdi. Guvohlar yo‘q`,
      () => `${n()} qo‘shnisiga salom berdi. Qo‘shni hali javob yozmoqda`,
      () => `${n()} yangi robot yasadi. Robot birinchi kuni ishdan bo‘shadi`,
      () => `${n()} telefonini qidirdi. Telefon qo‘lida ekan`,
      () => `${n()} uyiga kamera o‘rnatdi. Kamera ham uxlab qolibdi`,
      () => `${n()} 1 million so‘m topdi. Keyin bu tush ekanini bildi`,
      () => `${n()} mushugiga uy qurdi. Mushuk qo‘shnining uyiga ko‘chib ketdi`,
      () => `${n()} yangi do‘kon ochdi. Hozircha faqat o‘zi xaridor`,
      () => `${n()} hovlisiga daraxt ekdi. Daraxt qo‘shnining tomida o‘sdi`,
      () => `${n()} muzqaymoq oldi. Uni quyosh birinchi bo‘lib yedi`,
      () => `${n()} o‘z uyini ijaraga berdi. O‘zi ko‘chada qoldi`,
      () => `${n()} 5 soat uxlab, juda charchadim deb aytdi`,
      () => `${n()} yangi kiyim oldi. Eski kiyimlar xafa bo‘lib qoldi`,
      () => `${n()} shahar xaritasini teskari ushlab, adashib qoldi`,
      () => `${n()} o‘z uyining raqamini unutdi. Hozir qo‘shnilardan so‘rayapti`,
      () => `${n()} shahar bankiga pul qo‘ydi. Bankda hozir 1 ta pechenye bor`,
      () => `${n()} yangi samolyot yasadi. U faqat pastga ucha oladi`,
      () => `${n()} hovlisida konsert berdi. Tomoshabinlar: 2 ta mushuk`,
      () => `${n()} qo‘shnisiga sovg‘a berdi. Sovg‘a ichida yana bir sovg‘a bor`,
      () => `${n()} o‘zini detektiv deb e'lon qildi. Birinchi ish: yo‘qolgan paypoq`,
      () => `${n()} kechasi muzlatkich bilan suhbatlashdi. Muzlatkich javob bermadi`,
      () => `${n()} 3 kun internetga kirmadi. Hamma uni qidirishni boshladi`,
      () => `${n()} yangi bog‘ yaratdi. Unda faqat bitta kaktus bor`,
      () => `${n()} uyining tomiga chiqdi va pastga tushishni unutdi`,
      () => `${n()} qo‘shnisining mushugiga ism qo‘ydi. Mushuk rozi emas`,
      () => `${n()} o‘zini oshpaz deb e'lon qildi. Tuxum ham kuyib ketdi`,
      () => `${n()} shahar bo‘ylab sayrga chiqdi. O‘z hovlisida adashdi`,
      () => `${n()} 100 ta do‘st topdi. Hammasi bot ekan`,
      () => `${n()} uyiga yangi internet uladi. Internet ham dam olishga ketdi`,
      () => `${n()} quyoshga ko‘zoynak sotmoqchi. Quyosh javob bermadi`,
      () => `${n()} bugun hech narsa qilmadi. Lekin juda band bo‘ldi`,
      () => `${n()} uyini tozaladi. Chang boshqa qo‘shniga ko‘chib ketdi`,
      () => `${n()} yangi rekord o‘rnatdi: 12 soat telefon ko‘rish`,
      () => `${n()} eshikni taqillatdi. O‘zi uyda ekanini unutibdi`,
      () => `${n()} o‘ziga yordamchi oldi. Yordamchi ham ishga kelmadi`,
      () => `${n()} katta baliq tutdi. Baliq uni suvga tortib ketdi`,
      () => `${n()} hovlisiga raketa qo‘ydi. Qo‘shnilar hayron`,
      () => `${n()} uyiga konditsioner o‘rnatdi. Endi faqat muzlab o‘tiribdi`,
      () => `${n()} yangi telefon parolini unutdi. Telefon ham xafa`,
      () => `${n()} 2 ta pitsa buyurtma qildi. Yetkazib beruvchi o‘zi yeb qo‘ydi`,
      () => `${n()} shahardagi eng tez yuguruvchi bo‘ldi. Chunki boshqa hech kim yugurmadi`,
      () => `${n()} o‘z uyiga qo‘riqchi oldi. Qo‘riqchi uy egasini kiritmayapti`,
      () => `${n()} shahar muzeyiga bitta eski paypoq sovg‘a qildi`,
      () => `${n()} yangi sport zal ochdi. Hozircha faqat stullar bor`,
      () => `${n()} o‘zining tug‘ilgan kunini unutdi. Mehmonlar ham unutishdi`,
      () => `${n()} qo‘shnisidan shakar so‘radi. Qo‘shni unga tuz berdi`,
      () => `${n()} osmonga qarab, bulutlarga salom berdi`,
      () => `${n()} o‘zining yangi qo‘shig‘ini chiqardi. Hatto mikrofon ham qochdi`,
      () => `${n()} shahar chempionatida qatnashdi. Mukofot: bitta sabzi`,
      () => `${n()} uyiga 50 ta chiroq o‘rnatdi. Elektr hisobini ko‘rib yig‘ladi`,
      () => `${n()} o‘ziga yangi ism tanladi. Ertasi kuni yana o‘zgartirdi`,
      () => `${n()} mushugini ishga yubordi. Mushuk dam olishga ketdi`,
      () => `${n()} yangi xarita chizdi. Unda o‘z uyi yo‘q`,
      () => `${n()} shahar hokimiga ariza yozdi: ko‘proq dam olish kunlari kerak`,
      () => `${n()} hovlisida xazina topdi. Ichida eski paypoq va tugma bor`,
      () => `${n()} qo‘shnisining Wi-Fi sini o‘g‘irladi. Parol: 12345678`,
      () => `${n()} bir kunda 30 ta choy ichdi. Endi choynak undan qo‘rqadi`,
      () => `${n()} velosipedda uchishni o‘rgandi. Faqat tushida`,
      () => `${n()} o‘z uyini kengaytirdi. Endi eshik tashqarida qoldi`,
      () => `${n()} bugun juda baxtli. Sababi: internet ishlayapti`,
      () => `${n()} shahar markazida raqsga tushdi. Hamma kamerani o‘chirdi`,
      () => `${n()} o‘ziga yangi kompyuter oldi. Kompyuter undan aqlliroq`,
      () => `${n()} hovlisida qor yog‘ishini kutmoqda. Hozir yoz`,
      () => `${n()} yangi kafe ochdi. Menyuda faqat suv bor`,
      () => `${n()} o‘z uyining tomini tuzatdi. Endi devorlari yo‘q`,
      () => `${n()} qo‘shnisining itiga salom berdi. It javob qaytarmadi`,
      () => `${n()} 10 daqiqa ishladi va 5 soat dam oldi`,
      () => `${n()} bugun shaharning eng mashhur aholisi. Sababi: yangiliklarda chiqdi`,
      () => `Shaharda mushuklar saylovi boshlandi. Barcha nomzodlar uxlab qolishdi`,
      () => `${O} kulbasiga lift qurmoqchi. Hozircha narvon bilan chiqiladi`,
      () => `${O} shahar uchun yangi qoida chiqardi: dushanba kuni uxlab olish mumkin`,
      () => `${O} kulbasida katta ziyofat uyushtirdi. Mehmonlar adashib qo‘shnining uyiga kirishdi`,
      () => `Shahar aholisi ${O} dan yangi basseyn so‘ramoqda. Eski basseynda baliqlar yashayapti`,
      () => `Shahar aholisi bugun juda band: hamma yangiliklarni o‘qiyapti!`,
      () => `Shaharda aholi soni ${NICKS.length.toLocaleString('uz-UZ')} taga yetdi. Endi navbat do‘konlarga`,
      () => `Shahar markazida katta yig‘ilish bo‘ldi. Kun tartibi: oxirgi pitsa kimniki?`,
      () => `Bugun shaharda dam olish kuni. Hatto mushuklar ham ishlamaydi`,
      () => `Shahar politsiyasi yo‘qolgan paypoqni qidirmoqda. Ish juda murakkab`,
      () => `Shaharda yangi qonun: qo‘shnining ovqatiga qarab turish taqiqlanadi`,
      () => `Shahar aholisi rekord o‘rnatdi: bir kunda 1000 ta salom`,
      () => `Shahar yangiliklari: bugun ham hech kim hech narsa qilmadi!`
    ],

    ru: [
      () => `${n()} проснулся утром и решил снова поспать. Самое правильное решение!`,
      () => `${n()} съел на завтрак 15 яиц. Курица до сих пор в шоке`,
      () => `${n()} сыграл в шахматы с котом. Кот победил со счётом 5:0`,
      () => `${n()} купил новый дом. Теперь копит деньги на сам дом`,
      () => `${n()} попросил у соседа пароль от Wi-Fi. Сосед до сих пор думает`,
      () => `${n()} объявил себя миллионером. На счету 3 монеты`,
      () => `${n()} построил бассейн. Пока там плавает одна лягушка`,
      () => `${n()} испёк торт. И сам же его съел`,
      () => `${n()} купил новую машину. Только колёс у неё нет`,
      () => `${n()} вышел на утреннюю пробежку. Устал через 10 секунд`,
      () => `${n()} открыл холодильник. Внутри была только надежда`,
      () => `${n()} зашёл к соседу. Просто забыл, где его собственный дом`,
      () => `${n()} купил коту телефон. Теперь кот чаще бывает онлайн`,
      () => `${n()} записался на забег 100 метров. Уснул, пока ждал старт`,
      () => `${n()} открыл бизнес: продажа интернета воздуху`,
      () => `${n()} поссорился со своей тенью. Теперь они не разговаривают`,
      () => `${n()} поставил антенну на крышу. Поймал сигнал с Марса`,
      () => `${n()} построил 20 домов за день. Строитель всё ещё спит`,
      () => `${n()} взял у соседа картошку. До сих пор не вернул`,
      () => `${n()} купил новый телефон. Первым сфотографировался кот`,
      () => `${n()} проверил скорость интернета. Быстрее черепахи`,
      () => `${n()} установил лифт в доме. Он ездит только вниз`,
      () => `${n()} посадил бананы в саду. На следующий день вырос арбуз`,
      () => `${n()} устроился на новую работу. В первый же день ушёл в отпуск`,
      () => `${n()} покрасил дом. Теперь соседи носят солнечные очки`,
      () => `${n()} повёл кота гулять. Кот выгулял хозяина`,
      () => `${n()} приготовил плов. Даже казан пытается сбежать`,
      () => `${n()} купил велосипед. Но забыл, как на нём ездить`,
      () => `${n()} объявил себя президентом города. Выборов ещё не было`,
      () => `${n()} поставил 10 дверей в доме. Не знает, какая входная`,
      () => `${n()} заявил, что видел летающую рыбу. Свидетелей нет`,
      () => `${n()} поздоровался с соседом. Сосед всё ещё печатает ответ`,
      () => `${n()} собрал робота. Робот уволился в первый день`,
      () => `${n()} искал телефон. Телефон был у него в руке`,
      () => `${n()} установил камеру дома. Камера тоже уснула`,
      () => `${n()} нашёл миллион. Потом понял, что это был сон`,
      () => `${n()} построил дом коту. Кот переехал к соседу`,
      () => `${n()} открыл магазин. Пока единственный покупатель — он сам`,
      () => `${n()} посадил дерево. Оно выросло на крыше соседа`,
      () => `${n()} купил мороженое. Первым его съело солнце`,
      () => `${n()} сдал дом в аренду. Сам остался на улице`,
      () => `${n()} поспал 5 часов и заявил, что очень устал`,
      () => `${n()} купил новую одежду. Старая обиделась`,
      () => `${n()} держал карту города вверх ногами и заблудился`,
      () => `${n()} забыл номер своего дома. Теперь спрашивает соседей`,
      () => `${n()} положил деньги в городской банк. Там теперь одно печенье`,
      () => `${n()} построил самолёт. Он умеет летать только вниз`,
      () => `${n()} устроил концерт во дворе. Зрители: два кота`,
      () => `${n()} подарил соседу подарок. Внутри оказался ещё один подарок`,
      () => `${n()} объявил себя детективом. Первое дело — пропавший носок`,
      () => `${n()} ночью разговаривал с холодильником. Холодильник промолчал`,
      () => `${n()} не заходил в интернет 3 дня. Все начали его искать`,
      () => `${n()} создал сад. В нём пока только один кактус`,
      () => `${n()} забрался на крышу и забыл, как спускаться`,
      () => `${n()} дал имя соседскому коту. Кот не согласен`,
      () => `${n()} объявил себя поваром. Даже яйцо сгорело`,
      () => `${n()} пошёл гулять по городу и заблудился в собственном дворе`,
      () => `${n()} нашёл 100 друзей. Все оказались ботами`,
      () => `${n()} подключил интернет. Интернет тоже ушёл отдыхать`,
      () => `${n()} решил продать солнцу солнечные очки. Солнце не ответило`,
      () => `${n()} сегодня ничего не делал. Но очень устал`,
      () => `${n()} убрался дома. Пыль переехала к соседу`,
      () => `${n()} установил рекорд: 12 часов смотрел в телефон`,
      () => `${n()} постучал в дверь. И забыл, что находится дома`,
      () => `${n()} нанял помощника. Помощник тоже не пришёл на работу`,
      () => `${n()} поймал большую рыбу. Рыба утащила его в воду`,
      () => `${n()} поставил ракету во дворе. Соседи удивлены`,
      () => `${n()} установил кондиционер. Теперь сидит и мёрзнет`,
      () => `${n()} забыл пароль от нового телефона. Телефон обиделся`,
      () => `${n()} заказал две пиццы. Курьер съел их по дороге`,
      () => `${n()} стал самым быстрым бегуном города. Потому что больше никто не бегал`,
      () => `${n()} нанял охранника. Охранник не пускает хозяина домой`,
      () => `${n()} подарил городскому музею старый носок`,
      () => `${n()} открыл спортзал. Пока там только стулья`,
      () => `${n()} забыл про свой день рождения. Гости тоже забыли`,
      () => `${n()} попросил у соседа сахар. Сосед дал соль`,
      () => `${n()} посмотрел на небо и поздоровался с облаками`,
      () => `${n()} выпустил новую песню. Даже микрофон сбежал`,
      () => `${n()} участвовал в чемпионате города. Приз — одна морковка`,
      () => `${n()} поставил 50 лампочек. Увидел счёт за электричество и заплакал`,
      () => `${n()} выбрал себе новое имя. На следующий день передумал`,
      () => `${n()} отправил кота на работу. Кот ушёл отдыхать`,
      () => `${n()} нарисовал новую карту. На ней нет его собственного дома`,
      () => `${n()} написал мэру: нужно больше выходных`,
      () => `${n()} нашёл клад во дворе. Внутри носок и пуговица`,
      () => `${n()} украл Wi-Fi соседа. Пароль: 12345678`,
      () => `${n()} выпил 30 чашек чая. Теперь чайник его боится`,
      () => `${n()} научился летать на велосипеде. Только во сне`,
      () => `${n()} расширил дом. Теперь дверь осталась снаружи`,
      () => `${n()} сегодня счастлив. Причина: интернет работает`,
      () => `${n()} танцевал в центре города. Все выключили камеры`,
      () => `${n()} купил новый компьютер. Компьютер умнее владельца`,
      () => `${n()} ждёт снег во дворе. Сейчас вообще-то лето`,
      () => `${n()} открыл новое кафе. В меню пока только вода`,
      () => `${n()} починил крышу. Теперь у дома нет стен`,
      () => `${n()} поздоровался с соседской собакой. Собака не ответила`,
      () => `${n()} работал 10 минут и отдыхал 5 часов`,
      () => `${n()} стал самым известным жителем города. Просто попал в новости`,
      () => `В городе начались выборы котов. Все кандидаты уснули`,
      () => `${O} хочет построить лифт в шалаше. Пока приходится пользоваться лестницей`,
      () => `${O} ввёл новое правило: по понедельникам разрешается спать`,
      () => `${O} устроил вечеринку в шалаше. Гости случайно зашли к соседу`,
      () => `Жители просят ${O} построить новый бассейн. В старом уже живут рыбы`,
      () => `Жители сегодня очень заняты: все читают новости!`,
      () => `В городе уже ${NICKS.length.toLocaleString('ru-RU')} жителей. Теперь нужны магазины`,
      () => `В центре города собрание. Главный вопрос: кому достанется последняя пицца?`,
      () => `Сегодня в городе выходной. Даже коты не работают`,
      () => `Городская полиция ищет пропавший носок. Дело очень сложное`,
      () => `Новое правило города: запрещено смотреть на еду соседа`,
      () => `Жители установили рекорд: 1000 приветствий за один день`,
      () => `Новости города: сегодня опять никто ничего не делал!`
    ]
  };

  const pickF = a => a[Math.floor(Math.random() * a.length)];
  const el = $('#ntext');
  const box = el?.parentElement;

  if (el && box) {
    let x = 0;
    let w = 0;
    let last = 0;
    let currentLang = CONFIG.lang === 'ru' ? 'ru' : 'uz';

    const fill = () => {
      const list = news[currentLang] || news.uz;

      el.innerHTML = Array.from(
        { length: 8 },
        () => `<span>${pickF(list)()}</span>`
      ).join('');

      w = el.scrollWidth;
      x = box.clientWidth;
    };

    const changeLanguage = lang => {
      currentLang = lang === 'ru' ? 'ru' : 'uz';
      fill();
    };

    window.addEventListener('city-language-change', event => {
      changeLanguage(event.detail?.lang);
    });

    const step = t => {
      const dt = Math.min(0.05, (t - last) / 1000 || 0);
      last = t;
      x -= dt * 55;

      if (x < -w) fill();

      el.style.transform = `translate(${x}px,-50%)`;
      requestAnimationFrame(step);
    };

    fill();
    requestAnimationFrame(step);
  }
}


// ---------- запуск ----------
const applyClock = () => { const d = new Date(); setTime(QS.get('h') != null ? +QS.get('h') : d.getHours() + d.getMinutes() / 60); };
applyClock(); setInterval(applyClock, 60000);

let tPrev = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - tPrev) / 1000); tPrev = now;
  stepFly(now);
  controls.target.x = clamp(controls.target.x, -R_CITY - 80, R_CITY + 80);
  controls.target.z = clamp(controls.target.z, -R_CITY - 80, R_CITY + 80);
  controls.update(dt);
  // тень следует за камерой
  sun.position.copy(controls.target).addScaledVector(SUN_DIR, 300);
  sun.target.position.copy(controls.target); sun.target.updateMatrixWorld();
  const t = now / 1000;
  { const ps = officeFlag.geometry.attributes.position; for (let i = 0; i < ps.count; i++) { const x = ps.getX(i); ps.setZ(i, Math.sin(x * 2.2 - t * 4) * 0.18 * x / 3.2); } ps.needsUpdate = true; }
  flameA.scale.set(1 + Math.sin(t * 11) * 0.12, 1 + Math.sin(t * 7.3) * 0.18, 1 + Math.cos(t * 9) * 0.12);
  flameB.scale.set(1 + Math.sin(t * 13) * 0.15, 1 + Math.sin(t * 9.1) * 0.22, 1);
  fireLight.position.y = 2.2 + Math.sin(t * 15) * 0.15;
  renderer.render(scene, camera);
  updateLabels();
  requestAnimationFrame(frame);
}
controls.autoRotate = true;
requestAnimationFrame(frame);
const ld = $('#loading'); ld.style.opacity = 0; setTimeout(() => ld.remove(), 650);
if (location.hash.length > 1) {
  $('#welcome').classList.add('gone'); controls.autoRotate = false;
  $('#q').value = decodeURIComponent(location.hash.slice(1));
  find($('#q').value);
}
$('#free').textContent = FREE.length;
window.__city = {camera, controls, HOUSES, FREE, OWNER, OFFICE, inspect, find, overview, setTime};
