// Headless smoke test: serves the game on loopback and drives a full playthrough.
// Run: node smoke.test.mjs  (requires: npx playwright install chromium)
import { chromium } from "playwright";
import { spawn } from "child_process";

const server = process.env.SMOKE_BASE_URL ? null : spawn("python3", ["-m", "http.server", "8127", "--bind", "127.0.0.1"], { cwd: new URL("./game", import.meta.url).pathname });
if (server) { server.stderr.on("data", (d) => process.stdout.write("srv: " + d)); server.on("exit", (c, s) => console.log("SERVER EXITED", c, s)); }
await new Promise((r) => setTimeout(r, server ? 800 : 0));
const BASE = process.env.SMOKE_BASE_URL || "http://127.0.0.1:8127";

const errors = [];
const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 900, height: 600 } });
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });

const fail = (m) => { console.error("FAIL:", m); process.exitCode = 1; };
const ok = (m) => console.log("ok -", m);

await page.goto(BASE + "/index.html");
await page.goto(BASE + "/");
await page.waitForTimeout(1200);
if (errors.length) { errors.forEach(fail); }
else ok("loads without JS errors");

// start the game
await page.click("#overlay");
await page.waitForTimeout(300);
if (await page.isVisible("#hud")) ok("overlay dismissed, HUD visible");
else fail("HUD did not appear");

const uw = () => page.evaluate(() => window.__uw);

// movement
const before = (await uw()).player;
await page.keyboard.down("KeyW");
await page.waitForTimeout(600);
await page.keyboard.up("KeyW");
const p1 = (await uw()).player;
if (Math.hypot(p1.x - before.x, p1.z - before.z) > 0.3) ok("player moves with WASD");
else fail("player did not move");

// screenshot mid-game (WebGL check)
await page.waitForTimeout(400);
await page.screenshot({ path: ".vibe/smoke-ingame.png" });

// combat: teleport next to first living skeleton and swing until it dies
await page.evaluate(() => {
  const u = window.__uw;
  const e = u.enemies.find((e) => !e.dead);
  u.player.x = e.x + 0.8; u.player.z = e.z;
  u.player.yaw = Math.atan2(-(e.x - u.player.x), -(e.z - u.player.z));
});
let dead = false;
for (let i = 0; i < 10 && !dead; i++) {
  await page.evaluate(() => window.__uw.swing());
  await page.waitForTimeout(600);
  dead = await page.evaluate(() => window.__uw.enemies[0].dead);
}
if (dead) ok("skeleton killed by sword swings");
else fail("skeleton did not die");

// key pickup: teleport onto key tile
const keyPos = await page.evaluate(() => {
  // find K in map via a fresh import is not available; use known layout from game state:
  // instead scan pickups through scene? Simpler: teleport using MAP through module cache is not exposed.
  return null;
});
// expose positions via evaluate on the MAP: import map.js as a module in page context
const mapData = await page.evaluate(async () => {
  const m = await import("./map.js");
  const out = {};
  for (let y = 0; y < m.MAP.length; y++) for (let x = 0; x < m.MAP[0].length; x++) {
    const c = m.MAP[y][x];
    if (c === "K" || c === "D" || c === "X") out[c] = { x: (x + 0.5) * m.TILE, z: (y + 0.5) * m.TILE };
  }
  return out;
});
await page.evaluate((k) => { const u = window.__uw; u.player.x = k.x; u.player.z = k.z; }, mapData.K);
await page.waitForTimeout(400);
if ((await uw()).player.hasKey) ok("key picked up");
else fail("key not picked up");

// door
await page.evaluate((d) => { const u = window.__uw; u.player.x = d.x; u.player.z = d.z + 1.2; }, mapData.D);
await page.keyboard.press("KeyE");
await page.waitForTimeout(300);
if ((await uw()).doorOpen) ok("door unlocked with key");
else fail("door did not open");

// portal
await page.evaluate((x) => { const u = window.__uw; u.player.x = x.x; u.player.z = x.z; }, mapData.X);
await page.waitForTimeout(400);
const wonText = await page.textContent("#box h1");
if (wonText.includes("ESCAPED")) ok("portal reached, win screen shown");
else fail("win screen not shown: " + wonText);

await page.screenshot({ path: ".vibe/smoke-win.png" });
if (errors.length) errors.forEach(fail);
await browser.close();
if (server) server.kill();
console.log(process.exitCode ? "SMOKE TEST FAILED" : "SMOKE TEST PASSED");
