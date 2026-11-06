# The Lower Caves — a 90s dungeon crawler tech demo

A one-level, Ultima Underworld–style first-person dungeon crawler that runs
entirely in the browser. Built as a feasibility demonstration ("glm one-shot build"):
engine choice, retro rendering, grid-based level, combat, items, progression.

## Run it

```bash
cd underworld-demo
python3 -m http.server 8000 --bind 127.0.0.1
# open http://localhost:8000
```

(Any static file server works. Opening `index.html` via file:// also works in
most browsers, but a server is the reliable path for ES modules.)

No build step, no dependencies — [Three.js](https://threejs.org) is loaded from a
CDN via an import map; all textures, sprites and sounds are generated
procedurally in code at runtime.

## Research summary

**Engine choice — Three.js (r160).** Compared against Babylon.js and PlayCanvas:

- *Three.js*: rendering library, huge ecosystem (~12M weekly npm downloads),
  full control over camera, render pipeline and retro effects. Ideal when the
  game loop is hand-rolled anyway. **Chosen.**
- *Babylon.js*: full game engine (physics, GUI, editor) — more convenience, more
  weight than needed for a grid dungeon with bespoke collision.
- *PlayCanvas*: hosted editor + lightweight runtime — great for teams, wrong
  shape for a code-first one-shot demo.

**Game art.** For this demo all art is procedural (CC0-equivalent, zero license
risk, zero bytes downloaded): canvas-painted stone-brick walls, mossy floors,
torch flames, skeleton/key/potion sprites, sword viewmodel. For production art,
the natural sources are **Kenney** (kenney.nl, all CC0 — e.g. "Tiny Dungeon",
"Roguelike Caves & Dungeons", "Modular Dungeon" 3D packs) and **OpenGameArt**
(filter by CC0 — e.g. Dungeon Crawl 32x32 tiles).

## Retro 90s feel — how it's done

- Internal render resolution is 1/3 of the viewport, upscaled with
  `image-rendering: pixelated` → chunky pixels like a 320x200 VGA game.
- Nearest-neighbour texture filtering (no blurry mipmaps).
- Black fog with short draw distance + flickering point-light torches.
- Billboard sprite enemies (skeletons), UW-style message log, compass,
  parchment HUD panels, and an explored-tiles automap.

## Gameplay implemented

- First-person pointer-lock controls, WASD + mouse look, shift to run, head bob.
- Grid collision (circle vs. tiles), grid line-of-sight.
- Melee combat: click to swing sword (viewmodel animation), skeleton AI
  (idle → chase → attack with windup), hit flashes, damage, death fade.
- Progression: find the **key** → unlock the **door** (E to use) → reach the
  **portal** to win. Healing potions, enemy potion drops.
- Win / death screens with stats, pause on pointer-lock loss.
- WebAudio-synthesized SFX (swing, hits, pickups, door, growls, portal).

## Level

`map.js` holds the level as an ASCII grid (21x21 tiles, 2m each): starting
chamber, torch-lit corridors, a guard room, a key room, a treasure room, and a
locked final chamber with the escape portal.

## Verification

```bash
node validate-map.mjs   # checks row widths, BFS reachability of key/door/portal/enemies
node smoke.test.mjs    # headless Chromium playthrough (needs: npx playwright install chromium)
```

The smoke test drives a full playthrough in headless Chromium: loads the page,
asserts zero JS errors, moves the player, kills a skeleton with sword swings,
picks up the key, unlocks the door and wins at the portal.

## Roadmap (beyond feasibility)

- Multiple levels, verticality (stairs, ledges — UW's real signature)
- Character sheet: skills, mana, spells (rune-based casting)
- Swappable art pack (Kenney 3D dungeon tiles / glTF models)
- Save games (localStorage), automap overlays, NPC dialogue
