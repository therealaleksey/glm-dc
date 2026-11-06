// Level 1: "The Lower Caves" — grid dungeon, Ultima Underworld style.
// Legend:
//   #  wall            .  floor
//   P  player start     D  locked door (needs key)
//   K  rusted key       H  healing potion
//   S  skeleton         T  wall torch (walkable floor tile next to a wall)
//   X  escape portal
export const TILE = 2;
export const WALL_H = 2.6;

export const MAP = [
  "#####################",
  "#P......T###........#",
  "#.H......###..S.....#",
  "#...................#",
  "#........###.....S..#",
  "#........###........#",
  "####.##########.#####",
  "####T##########.#####",
  "####.##########.#####",
  "#.......T###........#",
  "#..K.S.............S#",
  "#........###T.......#",
  "####.###########.####",
  "####.###########T####",
  "####.###########D####",
  "####.###########.####",
  "#........###........#",
  "#..H.....###...S....#",
  "#....H...###......S.#",
  "#........###...X....#",
  "#####################",
];

export const H = MAP.length;
export const W = MAP[0].length;

export function charAt(cx, cy) {
  if (cx < 0 || cy < 0 || cx >= W || cy >= H) return "#";
  return MAP[cy][cx];
}

export function isSolid(cx, cy, doorOpen) {
  const ch = charAt(cx, cy);
  if (ch === "#") return true;
  if (ch === "D") return !doorOpen;
  return false;
}

export function tileCenter(cx, cy) {
  return { x: (cx + 0.5) * TILE, z: (cy + 0.5) * TILE };
}
