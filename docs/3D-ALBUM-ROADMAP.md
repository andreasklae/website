# 3D Photo Album Portfolio — Roadmap

Branch: `feature/3d-photo-albums`

An interactive Three.js space replacing `/photography`. Albums stand on a shelf seen
from the side; you read their spine labels, pull one out, see its cover, and it opens
into a spread-by-spread photo album.

---

## 0. Research findings (done)

Prior art actually studied, cloned into the session scratchpad under `ref/`:

| Need | Source | What we take |
|---|---|---|
| Page-turn mechanics | [`wass08/r3f-animated-book-slider-final`](https://github.com/wass08/r3f-animated-book-slider-final) | Procedural `BoxGeometry` + manual `Bone` chain + `SkinnedMesh`; per-page front/back textures on material slots 4/5; `easing.dampAngle` per bone with inside/outside/turning curve terms. This is the whole page-flip solution — adapt, don't reinvent. |
| Frame-rate stability | [`henryjeff/portfolio-website`](https://github.com/henryjeff/portfolio-website) (2.4k★) | **Baked lightmaps + `MeshBasicMaterial`.** Zero realtime lights, zero shadow maps, one texture per model. Plus: single `Time` update loop, `setPixelRatio(min(dpr, 2))`, `powerPreference: 'high-performance'`. |
| Handwriting | Google Fonts `Caveat` (titles/labels), `Homemade Apple` (postcards/memos) | Rendered to canvas textures at build/runtime, not as live DOM. |
| Stack-of-photos, postcards, spine labels | No good prebuilt component found | Built here — they are simple offset/rotated planes, the value is in the texture compositing. |

> **Correction on the reference given.** `henryjeff/portfolio-inner-site` contains no
> Three.js at all — it is the React "OS" UI rendered *inside* the CRT screen. The 3D
> scene lives in `henryjeff/portfolio-website`. That is the repo studied above, and it
> is plain three.js (not R3F) built on the Bruno Simon `Application` architecture.

**Stack versions verified against npm today:** the repo is on React 19.1.1, so
`@react-three/fiber@^9` and `@react-three/drei@^10` are required (v8/v9 peer-depend on
React 18). `three@^0.186`, `maath` for damping.

---

## 1. Reality check on the assets

| Fact | Number | Consequence |
|---|---|---|
| Photography images | 436 files, **888 MB** | Cannot be served as-is. A derivative pipeline is mandatory, not optional. |
| Orientation split | **277 portrait / 146 landscape** / 5 square | Under the "2 landscape *or* 1 portrait per page" rule, most pages hold a **single** image. Page counts will be high; the stack slot does real work absorbing the tail. |
| Chapters | 4–5 per story, galleries of 5–43 images | Only a handful of gallery images get their own slot; the rest go in the stack. |
| Stories | 4 journals + 1 global highlights album | 5 albums on the shelf. |

---

## 2. Assumptions filled in

The brief left gaps; these are the calls being made. Flagged so they are easy to overrule.

1. **"max 4 per chapter"** is read as **4 image slots per chapter = one spread**
   (2 pages × 2 landscape slots). A portrait image consumes both slots on its page.
   Slot order within a chapter: `postcard → mainImage → gallery[0…] → stack (last slot)`.
2. **"First only show the highlights"** is read as *within each album*: the story's own
   `highlights` array opens the album, before any chapter. The separate global
   highlights album on the shelf is a fifth album built from
   `content/photography-highlights.json`.
3. **Memos** accompany the highlights section. The album-opening memo is the story's
   existing `description`; the global highlights album gets an authored overview memo
   plus one memo per story. No new prose is invented where the JSON already has some.
4. **Postcard text** is the chapter's existing `text` field, trimmed to what fits a
   postcard, with a "read more" affordance for the full text.
5. Both languages (`en`/`no`) stay supported — text textures re-render on language change.

---

## 3. Phases

### Phase 1 — Asset pipeline *(blocking; nothing renders convincingly without it)*
- `scripts/build-album-assets.mjs` using `sharp` (devDependency).
- For every referenced image emit, EXIF-auto-oriented, into `public/albums/derived/`:
  - `thumb` 320px webp q72 — stacks, spine, shelf
  - `page` 1400px webp q80 — the in-album texture
  - `zoom` 2400px webp q82 — generated only for images that can be hover-zoomed
- Emit `public/content/albums/<id>.json`: the **compiled layout** — ordered pages, each
  with its slots, every slot carrying `{kind, src, w, h, aspect}` so the renderer never
  measures an image at runtime.
- Emit a `blurhash`/dominant-colour per image for placeholder planes.
- Wire into `vite.config.js` beside the existing highlights-manifest plugin; cache by
  source mtime+size so reruns are cheap. Derivatives are gitignored and built on demand.

### Phase 2 — Layout compiler
- Pure, unit-testable function: story JSON → page list, implementing §2.1–2.4.
- Handles: portrait/landscape packing, postcard placement, stack overflow, odd page
  padding so every spread is complete, cover/back-cover pages.

### Phase 3 — Scene shell & performance floor
- R3F `<Canvas>` mounted at `/photography`, DPR-clamped, `MeshBasicMaterial` everywhere.
- Camera rig with named states (`shelf → cover → open → zoom`) driven by `maath` damping.
- Texture manager: only current spread ±1 resident; explicit `.dispose()` on eviction.
- A stats overlay behind a `?debug` flag, removed before merge.

### Phase 4 — Shelf & spines
- Album spines side-on, label holder with `Caveat` handwritten title.
- Hover lift, click → pull out.

### Phase 5 — Cover reveal
- Rotate to face camera, thumbnail as a printed photograph (border, slight gloss),
  handwritten title. ~1.2 s hold, then open.

### Phase 6 — Pages & turning
- Port the wass08 bone/skin page. Composite each page's slots into one canvas texture
  per page face (photo borders, postcards, memos drawn in) — one texture per face keeps
  draw calls flat.

### Phase 7 — Interactions
- Hover-zoom on an image (swap to `zoom` derivative on demand).
- The stack: offset/rotated siblings visibly peeking out; hover sifts through.
- Nav buttons: back / forward / put the album away.

### Phase 8 — Polish & integration
- Loading state, reduced-motion and no-WebGL fallbacks (keep the current page as the
  fallback route), mobile behaviour, `npm run build` clean, Lighthouse pass.

---

## 4. Risks

- **Texture memory** is the top risk. 1400px webp ≈ 7.8 MB decompressed in VRAM each;
  a resident budget of ~12 faces is the design constraint. Phase 3 must prove this
  before Phase 6 builds on it.
- **Portrait-heavy set** means long albums — the stack slot and page-skip navigation
  matter more than they first appear.
- **888 MB in `public/`** already ships to GitHub Pages; the derivative pipeline should
  eventually let the originals stop being deployed. Out of scope here, worth raising.

---

## 5. Progress

- [x] Phase 0 — Research
- [x] Phase 1 — Asset pipeline *(428 images, 295 MB of derivatives, ~75 s cold / instant cached)*
- [x] Phase 2 — Layout compiler *(5 tests, 100% image coverage verified)*
- [x] Phase 3 — Scene shell & perf floor *(fit-solving camera rig, texture residency, lazy 3D chunk)*
- [x] Phase 4 — Shelf & spines *(cloth boards, brass label holders, two-line handwritten titles)*
- [x] Phase 5 — Cover reveal *(built; motion unverified — see note)*
- [x] Phase 6 — Pages & turning *(bone-skinned pages; face compositing verified visually)*
- [~] Phase 7 — Interactions *(hover-zoom, stack sifting, nav wired; needs a live browser to confirm feel)*
- [~] Phase 8 — Polish & integration *(code-split, WebGL fallback, reduced motion done; mobile pass outstanding)*

---

## 6. Verification note

Page compositing was verified by painting real album faces to canvas and
inspecting them: cover, memo, postcard, printed photos, and the stack all
render as intended. The **animated 3D flow could not be verified in this
session** — the automated browser pane reports `document.hidden === true`, so
`requestAnimationFrame` never fires and the render loop is suspended. Static
renders are correct; the shelf-to-cover-to-open transitions, page turning,
and hover-zoom need a real visible browser (`npm run dev`, then `/photography`).
