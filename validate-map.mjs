import { MAP, W, H, charAt } from "./game/map.js";

let ok = true;
const fail = (msg) => { ok = false; console.error("FAIL:", msg); };

for (const [i, row] of MAP.entries()) {
  if (row.length !== W) fail(`row ${i} has length ${row.length}, expected ${W}`);
}

// BFS from player start; door counts as passable.
const passable = (cx, cy) => { const c = charAt(cx, cy); return c !== "#"; };
let start = null;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (charAt(x, y) === "P") start = [x, y];
if (!start) fail("no player start P");

const seen = new Set([start.join(",")]);
const q = [start];
while (q.length) {
  const [x, y] = q.pop();
  for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
    const nx = x + dx, ny = y + dy;
    if (!passable(nx, ny) || seen.has(nx + "," + ny)) continue;
    seen.add(nx + "," + ny);
    q.push([nx, ny]);
  }
}

const reach = (x, y) => seen.has(x + "," + y);
const want = { K: 1, X: 1, D: 1, P: 1 };
const counts = {};
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const c = charAt(x, y);
  if ("#.".includes(c)) continue;
  counts[c] = (counts[c] || 0) + 1;
  if (!reach(x, y)) fail(`tile '${c}' at (${x},${y}) is unreachable`);
  if (c === "T") {
    const adjWall = [[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy]) => charAt(x+dx, y+dy) === "#");
    if (!adjWall) fail(`torch at (${x},${y}) has no adjacent wall`);
  }
}
console.log("tile counts:", counts);
console.log("reachable tiles:", seen.size);
for (const [c, n] of Object.entries(want))
  if ((counts[c] || 0) !== n) fail(`expected ${n} '${c}', found ${counts[c] || 0}`);
if (ok) console.log("MAP OK");
process.exit(ok ? 0 : 1);
