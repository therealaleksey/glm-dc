import * as THREE from "three";
import { MAP, W, H, TILE, WALL_H, charAt, isSolid, tileCenter } from "./map.js";

// ---------------------------------------------------------------- textures
function makeTex(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d");
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const wallTex = makeTex(64, 64, (g) => {
  g.fillStyle = "#23262e"; g.fillRect(0, 0, 64, 64);
  for (let row = 0; row < 4; row++) {
    const off = (row % 2) * 16;
    for (let col = -1; col < 3; col++) {
      const x = col * 32 + off, y = row * 16;
      const v = 44 + (Math.random() * 20 | 0);
      g.fillStyle = `rgb(${v},${v + 4},${v + 12})`;
      g.fillRect(x + 1, y + 1, 30, 14);
      g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(x + 1, y + 1, 30, 2);
      g.fillStyle = "rgba(0,0,0,0.3)"; g.fillRect(x + 1, y + 13, 30, 2);
    }
  }
  for (let i = 0; i < 50; i++) {
    g.fillStyle = `rgba(40,72,32,${0.12 + Math.random() * 0.25})`;
    g.fillRect(Math.random() * 64 | 0, Math.random() * 64 | 0, 2 + (Math.random() * 4 | 0), 1 + (Math.random() * 2 | 0));
  }
  for (let i = 0; i < 320; i++) {
    g.fillStyle = `rgba(0,0,0,${Math.random() * 0.2})`;
    g.fillRect(Math.random() * 64 | 0, Math.random() * 64 | 0, 1, 1);
  }
});

const floorTex = makeTex(64, 64, (g) => {
  g.fillStyle = "#14161c"; g.fillRect(0, 0, 64, 64);
  for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) {
    const v = 30 + (Math.random() * 14 | 0);
    g.fillStyle = `rgb(${v},${v + 2},${v + 6})`;
    g.fillRect(x * 32 + 1, y * 32 + 1, 30, 30);
  }
  for (let i = 0; i < 6; i++) {
    g.strokeStyle = "rgba(0,0,0,0.5)"; g.beginPath();
    g.moveTo(Math.random() * 64, Math.random() * 64);
    g.lineTo(Math.random() * 64, Math.random() * 64); g.stroke();
  }
  for (let i = 0; i < 400; i++) {
    g.fillStyle = Math.random() < 0.5 ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.04)";
    g.fillRect(Math.random() * 64 | 0, Math.random() * 64 | 0, 1, 1);
  }
});

const ceilTex = makeTex(64, 64, (g) => {
  g.fillStyle = "#101218"; g.fillRect(0, 0, 64, 64);
  for (let i = 0; i < 500; i++) {
    g.fillStyle = `rgba(0,0,0,${Math.random() * 0.4})`;
    g.fillRect(Math.random() * 64 | 0, Math.random() * 64 | 0, 2, 2);
  }
});

const doorTex = makeTex(64, 64, (g) => {
  for (let x = 0; x < 4; x++) {
    const v = 74 + (Math.random() * 16 | 0);
    g.fillStyle = `rgb(${v - 20},${v - 26},${v - 40})`;
    g.fillRect(x * 16 + 1, 0, 14, 64);
  }
  g.fillStyle = "#3a3a42"; g.fillRect(0, 8, 64, 5); g.fillRect(0, 50, 64, 5);
  g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(0, 13, 64, 2); g.fillRect(0, 55, 64, 2);
  g.fillStyle = "#c8b048"; g.fillRect(28, 28, 8, 8);
  g.fillStyle = "#141414"; g.fillRect(31, 31, 3, 4); g.fillRect(30, 33, 2, 3);
  for (let i = 0; i < 250; i++) {
    g.fillStyle = `rgba(0,0,0,${Math.random() * 0.25})`;
    g.fillRect(Math.random() * 64 | 0, Math.random() * 64 | 0, 1, 1);
  }
});

function makeSpriteTex(w, h, draw) {
  const t = makeTex(w, h, draw);
  return t;
}

const skeletonTex = makeSpriteTex(32, 64, (g) => {
  const B = "#dcdccc";
  g.fillStyle = B;
  g.fillRect(11, 2, 10, 8); g.fillRect(10, 5, 12, 6);          // skull
  g.fillStyle = "#101010"; g.fillRect(12, 6, 3, 3); g.fillRect(17, 6, 3, 3);
  g.fillStyle = "#c02020"; g.fillRect(13, 7, 1, 1); g.fillRect(18, 7, 1, 1);
  g.fillStyle = B; g.fillRect(13, 11, 6, 2);
  g.fillStyle = "#101010"; g.fillRect(14, 11, 1, 2); g.fillRect(17, 11, 1, 2); g.fillRect(15, 11, 1, 1);
  g.fillStyle = B;
  g.fillRect(15, 13, 2, 13);                                    // spine
  for (let i = 0; i < 4; i++) g.fillRect(11, 14 + i * 3, 10, 1); // ribs
  g.fillRect(12, 26, 8, 3);                                     // pelvis
  g.fillRect(12, 29, 2, 12); g.fillRect(18, 29, 2, 12);        // legs
  g.fillRect(11, 41, 4, 2); g.fillRect(17, 41, 4, 2);          // feet
  g.fillRect(9, 14, 2, 11); g.fillRect(21, 14, 2, 11);         // arms
  g.fillStyle = "#9a9aa8"; g.fillRect(23, 4, 2, 22);           // blade
  g.fillStyle = "#6a5a2a"; g.fillRect(22, 26, 5, 2); g.fillRect(23, 28, 2, 4);
});

const keyTex = makeSpriteTex(16, 16, (g) => {
  g.fillStyle = "#d8b840";
  g.fillRect(2, 2, 6, 6); g.fillStyle = "#000"; g.fillRect(4, 4, 2, 2);
  g.fillStyle = "#d8b840"; g.fillRect(8, 6, 6, 2); g.fillRect(12, 8, 2, 3); g.fillRect(10, 8, 2, 2);
  g.fillStyle = "rgba(255,240,150,0.9)"; g.fillRect(2, 2, 6, 1);
});

const potionTex = makeSpriteTex(16, 16, (g) => {
  g.fillStyle = "#8a7a5a"; g.fillRect(6, 1, 4, 3);
  g.fillStyle = "#b03030"; g.fillRect(4, 4, 8, 10); g.fillRect(5, 14, 6, 1);
  g.fillStyle = "#d86060"; g.fillRect(5, 5, 2, 8);
  g.fillStyle = "#e8d8b0"; g.fillRect(6, 6, 1, 2);
});

const flameTex = makeSpriteTex(16, 16, (g) => {
  const grad = g.createRadialGradient(8, 10, 1, 8, 8, 8);
  grad.addColorStop(0, "rgba(255,240,160,1)");
  grad.addColorStop(0.4, "rgba(255,150,40,0.9)");
  grad.addColorStop(1, "rgba(120,30,0,0)");
  g.fillStyle = grad; g.fillRect(0, 0, 16, 16);
});

const portalTex = makeSpriteTex(32, 64, (g) => {
  for (let i = 0; i < 5; i++) {
    g.strokeStyle = `rgba(${100 + i * 30},${150 + i * 20},255,${0.9 - i * 0.15})`;
    g.lineWidth = 2;
    g.beginPath();
    g.ellipse(16, 32, 4 + i * 2.6, 26 - i * 4, i * 0.6, 0, Math.PI * 2);
    g.stroke();
  }
  const grad = g.createRadialGradient(16, 32, 2, 16, 32, 14);
  grad.addColorStop(0, "rgba(220,240,255,0.95)");
  grad.addColorStop(1, "rgba(40,80,255,0)");
  g.fillStyle = grad; g.fillRect(0, 0, 32, 64);
});

const swordTex = makeSpriteTex(32, 64, (g) => {
  g.fillStyle = "#b8c0cc"; g.fillRect(14, 2, 4, 40);
  g.fillStyle = "#e8eef8"; g.fillRect(14, 2, 1, 40);
  g.fillStyle = "#8890a0"; g.fillRect(17, 2, 1, 40);
  g.fillStyle = "#c8a030"; g.fillRect(8, 42, 16, 4);
  g.fillStyle = "#5a4020"; g.fillRect(13, 46, 6, 12);
  g.fillStyle = "#7a6030"; g.fillRect(12, 57, 8, 4);
});

// ---------------------------------------------------------------- audio
let AC = null;
function audio() { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); return AC; }
function tone(freq, dur, type = "square", vol = 0.12, slide = 0) {
  try {
    const a = audio(), o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, a.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), a.currentTime + dur);
    g.gain.setValueAtTime(vol, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
    o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + dur);
  } catch (e) { /* noop */ }
}
function noiseBurst(dur = 0.15, vol = 0.1) {
  try {
    const a = audio(), n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = a.createBufferSource(); s.buffer = buf;
    const g = a.createGain(); g.gain.value = vol;
    s.connect(g).connect(a.destination); s.start();
  } catch (e) { /* noop */ }
}
const SFX = {
  swing: () => { noiseBurst(0.1, 0.07); tone(160, 0.1, "sawtooth", 0.03, -90); },
  hit: () => { tone(95, 0.14, "square", 0.12, -40); noiseBurst(0.07, 0.06); },
  hurt: () => tone(150, 0.25, "sawtooth", 0.12, -90),
  pickup: () => { tone(660, 0.08, "square", 0.07); setTimeout(() => tone(990, 0.12, "square", 0.07), 70); },
  locked: () => tone(110, 0.2, "square", 0.1, -30),
  door: () => { tone(55, 0.9, "sawtooth", 0.13, 25); noiseBurst(0.5, 0.05); },
  growl: () => tone(72, 0.4, "sawtooth", 0.09, 28),
  die: () => { tone(210, 0.3, "square", 0.07, -160); noiseBurst(0.2, 0.06); },
  portal: () => { tone(440, 0.5, "sine", 0.1, 220); setTimeout(() => tone(660, 0.7, "sine", 0.1, 220), 150); },
};

// ---------------------------------------------------------------- dom
const $ = (id) => document.getElementById(id);
const canvas = $("c"), overlay = $("overlay"), box = $("box"),
  storyEl = $("story"), goline = $("goline"), hud = $("hud"),
  hpfill = $("hpfill"), hptext = $("hptext"), compassEl = $("compass"),
  keyslot = $("keyslot"), clockEl = $("clock"), msgsEl = $("msgs"),
  minimap = $("minimap"), mmCtx = minimap.getContext("2d"), hurtEl = $("hurt"),
  crosshair = $("crosshair");

function msg(text) {
  const d = document.createElement("div");
  d.className = "msg"; d.textContent = text;
  msgsEl.appendChild(d);
  while (msgsEl.children.length > 5) msgsEl.firstChild.remove();
  setTimeout(() => { d.style.opacity = "0"; }, 4200);
  setTimeout(() => d.remove(), 5400);
}

// ---------------------------------------------------------------- scene
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
renderer.setPixelRatio(1);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.fog = new THREE.Fog(0x000000, 1.5, 15);
const camera = new THREE.PerspectiveCamera(72, 1, 0.05, 60);
scene.add(camera);

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(Math.max(2, Math.floor(w / 3)), Math.max(2, Math.floor(h / 3)), false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize);
resize();

// world state
let doorOpen = false, doorAnim = 0, doorMesh = null, doorTile = null;
let playing = false, elapsed = 0;
const enemies = [], pickups = [], torches = [];
let portalMesh = null, portalTile = null, portalLight = null;

// floor & ceiling
const floorMat = new THREE.MeshLambertMaterial({ map: floorTex });
const floorGeo = new THREE.PlaneGeometry(W * TILE, H * TILE);
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
floorTex.repeat.set(W, H);
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.set((W * TILE) / 2, 0, (H * TILE) / 2);
scene.add(floor);

ceilTex.wrapS = ceilTex.wrapT = THREE.RepeatWrapping;
ceilTex.repeat.set(W, H);
const ceil = new THREE.Mesh(floorGeo.clone(), new THREE.MeshLambertMaterial({ map: ceilTex }));
ceil.rotation.x = Math.PI / 2;
ceil.position.set((W * TILE) / 2, WALL_H, (H * TILE) / 2);
scene.add(ceil);

// walls
const wallMat = new THREE.MeshLambertMaterial({ map: wallTex });
const wallGeo = new THREE.BoxGeometry(TILE, WALL_H, TILE);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (charAt(x, y) !== "#") continue;
  const m = new THREE.Mesh(wallGeo, wallMat);
  m.position.set((x + 0.5) * TILE, WALL_H / 2, (y + 0.5) * TILE);
  scene.add(m);
}

// scan special tiles
let playerStart = { x: TILE, z: TILE };
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const ch = charAt(x, y), c = tileCenter(x, y);
  if (ch === "P") playerStart = c;
  else if (ch === "D") {
    doorTile = { x, y };
    doorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(TILE * 0.96, WALL_H * 0.86, 0.4),
      new THREE.MeshLambertMaterial({ map: doorTex })
    );
    doorMesh.position.set(c.x, WALL_H * 0.43, c.z);
    scene.add(doorMesh);
  } else if (ch === "S") {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: skeletonTex, transparent: true }));
    sp.scale.set(0.95, 1.9, 1);
    sp.position.set(c.x, 0.95, c.z);
    scene.add(sp);
    enemies.push({ sprite: sp, x: c.x, z: c.z, hp: 30, state: "idle", cool: 0, flash: 0, dead: false, gone: false, deadT: 0, phase: Math.random() * 7 });
  } else if (ch === "T") {
    // attach sconce to nearest wall
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    let wd = null;
    for (const [dx, dy] of dirs) if (charAt(x + dx, y + dy) === "#") { wd = [dx, dy]; break; }
    const wx = c.x + (wd ? wd[0] * TILE * 0.42 : 0), wz = c.z + (wd ? wd[1] * TILE * 0.42 : 0);
    const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, transparent: true, depthWrite: false }));
    flame.position.set(wx, 1.7, wz);
    flame.scale.set(0.5, 0.5, 1);
    scene.add(flame);
    const stick = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.5, 0.08),
      new THREE.MeshLambertMaterial({ color: 0x4a3828 })
    );
    stick.position.set(wx - (wd ? wd[0] * 0.1 : 0), 1.45, wz - (wd ? wd[1] * 0.1 : 0));
    if (wd) stick.rotation.set(wd[1] * 0.5, 0, -wd[0] * 0.5);
    scene.add(stick);
    const light = new THREE.PointLight(0xff9a44, 9, 8.5, 2);
    light.position.set(wx, 1.9, wz);
    scene.add(light);
    torches.push({ flame, light, phase: Math.random() * 10 });
  } else if (ch === "X") {
    portalTile = { x, y };
    portalMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 2.3),
      new THREE.MeshBasicMaterial({ map: portalTex, transparent: true, side: THREE.DoubleSide, depthWrite: false })
    );
    portalMesh.position.set(c.x, 1.2, c.z);
    scene.add(portalMesh);
    portalLight = new THREE.PointLight(0x5588ff, 6, 7, 2);
    portalLight.position.set(c.x, 1.4, c.z);
    scene.add(portalLight);
  } else if (ch === "K" || ch === "H") {
    addPickup(ch === "K" ? "key" : "potion", c.x, c.z);
  }
}

function addPickup(type, x, z) {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({
    map: type === "key" ? keyTex : potionTex, transparent: true,
  }));
  sp.scale.set(0.5, 0.5, 1);
  sp.position.set(x, 0.45, z);
  scene.add(sp);
  pickups.push({ type, sprite: sp, x, z });
}

// ambient + player light
scene.add(new THREE.AmbientLight(0x40404c, 0.55));
const playerLight = new THREE.PointLight(0xffb066, 4.5, 9, 2);
scene.add(playerLight);

// sword viewmodel
const sword = new THREE.Mesh(
  new THREE.PlaneGeometry(0.3, 0.8),
  new THREE.MeshBasicMaterial({ map: swordTex, transparent: true, depthTest: false })
);
sword.position.set(0.42, -0.38, -0.75);
sword.rotation.set(-0.25, -0.15, 0.3);
sword.renderOrder = 999;
camera.add(sword);

// ---------------------------------------------------------------- player
const player = {
  x: playerStart.x, z: playerStart.z, yaw: Math.PI * 0.75, pitch: 0,
  hp: 100, maxhp: 100, hasKey: false, r: 0.34,
  swingT: 0, swingHit: false, bob: 0, kills: 0, dead: false, won: false,
};

const keys = {};
addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code === "KeyE" && playing) interact();
});
addEventListener("keyup", (e) => keys[e.code] = false);

addEventListener("mousemove", (e) => {
  if (document.pointerLockElement !== canvas || !playing) return;
  player.yaw -= e.movementX * 0.0026;
  player.pitch = Math.max(-1.25, Math.min(1.25, player.pitch - e.movementY * 0.0026));
});
addEventListener("mousedown", (e) => {
  if (document.pointerLockElement === canvas && playing) swing();
});

function resolveCollision(px, pz, r) {
  for (let iter = 0; iter < 3; iter++) {
    const cx = Math.floor(px / TILE), cz = Math.floor(pz / TILE);
    let hit = false;
    for (let gy = cz - 1; gy <= cz + 1; gy++) for (let gx = cx - 1; gx <= cx + 1; gx++) {
      if (!isSolid(gx, gy, doorOpen)) continue;
      const nx = Math.max(gx * TILE, Math.min(px, (gx + 1) * TILE));
      const nz = Math.max(gy * TILE, Math.min(pz, (gy + 1) * TILE));
      const dx = px - nx, dz = pz - nz, d2 = dx * dx + dz * dz;
      if (d2 < r * r) {
        if (d2 > 1e-9) {
          const d = Math.sqrt(d2);
          px = nx + (dx / d) * r; pz = nz + (dz / d) * r;
        } else { px += r; }
        hit = true;
      }
    }
    if (!hit) break;
  }
  return [px, pz];
}

function hasLOS(ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  const steps = Math.ceil(Math.hypot(dx, dz) / 0.4);
  for (let i = 1; i < steps; i++) {
    const x = ax + (dx * i) / steps, z = az + (dz * i) / steps;
    if (isSolid(Math.floor(x / TILE), Math.floor(z / TILE), doorOpen)) return false;
  }
  return true;
}

function swing() {
  if (player.swingT > 0 || player.dead || player.won) return;
  player.swingT = 0.45; player.swingHit = false;
  SFX.swing();
}

function damagePlayer(n) {
  if (player.dead || player.won) return;
  player.hp -= n;
  SFX.hurt();
  hurtEl.style.opacity = "1";
  setTimeout(() => hurtEl.style.opacity = "0", 130);
  if (player.hp <= 0) { player.hp = 0; die(); }
}

function die() {
  player.dead = true;
  document.exitPointerLock();
  showOverlay("dead");
}

function win() {
  if (player.won) return;
  player.won = true;
  SFX.portal();
  document.exitPointerLock();
  showOverlay("won");
}

function interact() {
  if (doorTile && !doorOpen) {
    const c = tileCenter(doorTile.x, doorTile.y);
    if (Math.hypot(player.x - c.x, player.z - c.z) < 2.4) {
      if (player.hasKey) {
        doorOpen = true;
        SFX.door();
        msg("The key turns... the door grinds open!");
      } else {
        SFX.locked();
        msg("The door is locked. Thou needst a key.");
      }
    }
  }
}

// ---------------------------------------------------------------- overlay
let overlayMode = "start";
function showOverlay(mode) {
  overlayMode = mode;
  overlay.classList.remove("hidden");
  hud.style.display = "none";
  minimap.style.display = "none";
  crosshair.style.display = "none";
  if (mode === "start") {
    box.querySelector("h1").textContent = "THE LOWER CAVES";
    storyEl.innerHTML = "Thou wakest in the dark beneath the castle. Somewhere below, a portal leads back to the light &mdash; but the way is barred, and the dead walk these halls.";
    goline.textContent = "CLICK TO ENTER THE DUNGEON";
  } else if (mode === "pause") {
    box.querySelector("h1").textContent = "PAUSED";
    storyEl.innerHTML = "The dungeon waits.";
    goline.textContent = "CLICK TO RESUME";
  } else if (mode === "dead") {
    box.querySelector("h1").textContent = "THOU ART SLAIN";
    storyEl.innerHTML = `The skeletons drag thy body into the dark.<br>Skeletons destroyed: ${player.kills} &middot; Time: ${clockEl.textContent}`;
    goline.textContent = "CLICK TO TRY AGAIN";
  } else if (mode === "won") {
    box.querySelector("h1").textContent = "THOU HAST ESCAPED!";
    storyEl.innerHTML = `The portal bears thee up toward daylight.<br>Skeletons destroyed: ${player.kills} &middot; Time: ${clockEl.textContent}`;
    goline.textContent = "CLICK TO PLAY AGAIN";
  }
}
function hideOverlay() {
  overlay.classList.add("hidden");
  hud.style.display = "flex";
  minimap.style.display = "block";
  crosshair.style.display = "block";
  overlayMode = "hidden";
}
overlay.addEventListener("click", () => {
  if (overlayMode === "dead" || overlayMode === "won") { location.reload(); return; }
  audio();
  hideOverlay();
  playing = true;
  canvas.requestPointerLock();
});
document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement !== canvas && playing && !player.dead && !player.won) {
    playing = false;
    showOverlay("pause");
  }
});

// ---------------------------------------------------------------- minimap
const explored = new Uint8Array(W * H);
function updateMinimap() {
  const px = Math.floor(player.x / TILE), pz = Math.floor(player.z / TILE);
  for (let y = pz - 2; y <= pz + 2; y++) for (let x = px - 2; x <= px + 2; x++)
    if (x >= 0 && y >= 0 && x < W && y < H) explored[y * W + x] = 1;
  const s = 6;
  mmCtx.fillStyle = "#0a0804"; mmCtx.fillRect(0, 0, 126, 126);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!explored[y * W + x]) continue;
    const ch = charAt(x, y);
    mmCtx.fillStyle = ch === "#" ? "#4a5060" : ch === "D" ? "#a05020" : ch === "X" ? "#4488ff" : "#1c2030";
    mmCtx.fillRect((x - px) * s + 63, (y - pz) * s + 63, s, s);
  }
  for (const e of enemies) {
    if (e.dead || e.state === "idle") continue;
    const ex = Math.floor(e.x / TILE), ez = Math.floor(e.z / TILE);
    if (explored[ez * W + ex]) {
      mmCtx.fillStyle = "#cc2222";
      mmCtx.fillRect((ex - px) * s + 64, (ez - pz) * s + 64, s - 2, s - 2);
    }
  }
  mmCtx.fillStyle = "#ffd867";
  mmCtx.fillRect(62, 62, 4, 4);
}

// ---------------------------------------------------------------- loop
const clock = new THREE.Clock();
msg("Thou art in the Lower Caves.");
msg("Find the key. Reach the portal.");

function updatePlayer(dt) {
  const run = keys["ShiftLeft"] || keys["ShiftRight"];
  const speed = run ? 4.2 : 2.4;
  const fx = -Math.sin(player.yaw), fz = -Math.cos(player.yaw);
  const rx = Math.cos(player.yaw), rz = -Math.sin(player.yaw);
  let mx = 0, mz = 0;
  if (keys["KeyW"] || keys["ArrowUp"]) { mx += fx; mz += fz; }
  if (keys["KeyS"] || keys["ArrowDown"]) { mx -= fx; mz -= fz; }
  if (keys["KeyD"] || keys["ArrowRight"]) { mx += rx; mz += rz; }
  if (keys["KeyA"] || keys["ArrowLeft"]) { mx -= rx; mz -= rz; }
  const len = Math.hypot(mx, mz);
  if (len > 0) {
    mx = (mx / len) * speed * dt; mz = (mz / len) * speed * dt;
    [player.x, player.z] = resolveCollision(player.x + mx, player.z + mz, player.r);
    player.bob += dt * (run ? 11 : 7);
  }
  camera.rotation.order = "YXZ";
  camera.rotation.y = player.yaw;
  camera.rotation.x = player.pitch;
  camera.position.set(player.x, 1.55 + Math.sin(player.bob) * 0.045, player.z);
  playerLight.position.set(player.x, 1.7, player.z);
  playerLight.intensity = 4.2 + Math.sin(performance.now() * 0.013) * 0.5;

  // sword swing animation
  if (player.swingT > 0) {
    player.swingT -= dt;
    const p = 1 - Math.max(0, player.swingT) / 0.45;
    if (!player.swingHit && p > 0.3) {
      player.swingHit = true;
      for (const e of enemies) {
        if (e.dead || e.gone) continue;
        const dx = e.x - player.x, dz = e.z - player.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 2.1) continue;
        if ((dx * fx + dz * fz) / (dist || 1) < 0.55) continue;
        e.hp -= 11 + Math.floor(Math.random() * 8);
        e.flash = 1;
        SFX.hit();
        if (e.hp <= 0) {
          e.dead = true; e.deadT = 0; player.kills++;
          SFX.die();
          msg("The skeleton crumbles to dust.");
          if (Math.random() < 0.3) addPickup("potion", e.x, e.z);
        } else if (e.state === "idle") { e.state = "chase"; SFX.growl(); }
      }
    }
    const s = Math.sin(Math.min(1, p) * Math.PI);
    sword.rotation.set(-0.25 - s * 1.0, -0.15, 0.3 + s * 0.6);
    sword.position.set(0.42 - s * 0.25, -0.38 + s * 0.1, -0.75 + s * 0.3);
  } else {
    sword.rotation.set(-0.25 + Math.sin(player.bob) * 0.02, -0.15, 0.3);
    sword.position.set(0.42, -0.38, -0.75);
  }
}

function updateEnemies(dt, t) {
  for (const e of enemies) {
    if (e.gone) continue;
    if (e.dead) {
      e.deadT += dt;
      const k = Math.min(1, e.deadT / 0.8);
      e.sprite.material.opacity = 1 - k;
      e.sprite.scale.y = 1.9 * (1 - k * 0.75);
      e.sprite.position.y = 0.95 * (1 - k * 0.75);
      if (k >= 1) { scene.remove(e.sprite); e.gone = true; }
      continue;
    }
    e.flash = Math.max(0, e.flash - dt * 4);
    e.sprite.material.color.setRGB(1, 1 - e.flash * 0.7, 1 - e.flash * 0.7);
    const dx = player.x - e.x, dz = player.z - e.z;
    const dist = Math.hypot(dx, dz);
    e.cool -= dt;
    if (e.state === "idle") {
      if (dist < 9 && hasLOS(e.x, e.z, player.x, player.z)) { e.state = "chase"; SFX.growl(); }
    } else {
      if (dist > 1.2) {
        const sp = 1.7 * dt;
        let nx = e.x + (dx / dist) * sp, nz = e.z + (dz / dist) * sp;
        [nx, nz] = resolveCollision(nx, nz, 0.32);
        e.x = nx; e.z = nz;
      }
      for (const o of enemies) {
        if (o === e || o.dead || o.gone) continue;
        const sx = e.x - o.x, sz = e.z - o.z, sd = Math.hypot(sx, sz);
        if (sd > 0.001 && sd < 0.7) { e.x += (sx / sd) * 0.35 * dt * 3; e.z += (sz / sd) * 0.35 * dt * 3; }
      }
      if (dist < 1.5 && e.cool <= 0 && !player.dead && !player.won) {
        e.cool = 1.15 + Math.random() * 0.4;
        setTimeout(() => {
          if (e.dead || player.dead || player.won) return;
          if (Math.hypot(player.x - e.x, player.z - e.z) < 1.9) damagePlayer(4 + Math.floor(Math.random() * 9));
        }, 350);
      }
      e.sprite.position.set(e.x, 0.95 + Math.sin(t * 7 + e.phase) * 0.035, e.z);
    }
  }
}

function updateWorld(dt, t) {
  // pickups
  for (let i = pickups.length - 1; i >= 0; i--) {
    const p = pickups[i];
    p.sprite.position.y = 0.45 + Math.sin(t * 3 + i) * 0.06;
    if (Math.hypot(player.x - p.x, player.z - p.z) < 0.9) {
      if (p.type === "key") { player.hasKey = true; keyslot.classList.add("have"); msg("Thou hast found the rusted key!"); }
      else { player.hp = Math.min(player.maxhp, player.hp + 35); msg("A healing potion! (+35 HP)"); }
      SFX.pickup();
      scene.remove(p.sprite);
      pickups.splice(i, 1);
    }
  }
  // door animation
  if (doorMesh && doorOpen && doorAnim < 1) {
    doorAnim = Math.min(1, doorAnim + dt / 1.4);
    doorMesh.position.y = WALL_H * 0.43 + doorAnim * (WALL_H * 0.9);
    doorMesh.visible = doorAnim < 1;
  }
  // torches
  for (const tc of torches) {
    tc.light.intensity = 9 + Math.sin(t * 11 + tc.phase) * 1.5 + Math.random() * 1.2;
    const fs = 0.48 + Math.sin(t * 13 + tc.phase) * 0.06 + Math.random() * 0.05;
    tc.flame.scale.set(fs, fs + 0.08, 1);
  }
  // portal
  if (portalMesh) {
    portalMesh.material.opacity = 0.75 + Math.sin(t * 2.4) * 0.2;
    portalMesh.scale.set(1 + Math.sin(t * 2) * 0.06, 1 + Math.cos(t * 1.7) * 0.06, 1);
    portalLight.intensity = 5 + Math.sin(t * 3) * 1.5;
    if (!player.won && Math.hypot(player.x - portalMesh.position.x, player.z - portalMesh.position.z) < 1.0) win();
  }
}

function updateHUD() {
  hpfill.style.width = (player.hp / player.maxhp * 100) + "%";
  hptext.textContent = Math.max(0, Math.round(player.hp));
  const h = ((-player.yaw) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  compassEl.textContent = ["N", "E", "S", "W"][Math.round(h / (Math.PI / 2)) % 4];
  const s = Math.floor(elapsed);
  clockEl.textContent = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
}

function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(0.05, clock.getDelta());
  const t = clock.elapsedTime;
  if (playing) {
    elapsed += dt;
    updatePlayer(dt);
    updateEnemies(dt, t);
    updateWorld(dt, t);
    updateHUD();
    updateMinimap();
  }
  renderer.render(scene, camera);
}
tick();

// debug/testing hook
window.__uw = {
  get player() { return player; },
  get enemies() { return enemies; },
  get doorOpen() { return doorOpen; },
  get playing() { return playing; },
  swing, interact,
};
