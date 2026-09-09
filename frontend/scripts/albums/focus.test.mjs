// node --test frontend/scripts/albums/focus.test.mjs
// Mirrors src/features/photography/album3d/lib/focus.js so the world-space
// mapping can be checked without a browser or a GPU.
import test from 'node:test'
import assert from 'node:assert/strict'

const FACE_W = 1024, FACE_H = 1367, PAGE_WIDTH = 1.28, PAGE_HEIGHT = 1.71

function focusBoxFor(rect, sheetIndex, page) {
  const opened = sheetIndex < page
  const u0 = rect.x / FACE_W, u1 = (rect.x + rect.w) / FACE_W
  const v0 = 1 - (rect.y + rect.h) / FACE_H, v1 = 1 - rect.y / FACE_H
  const toWorldX = (u) => (opened ? -(1 - u) * PAGE_WIDTH : u * PAGE_WIDTH)
  const x0 = toWorldX(u0), x1 = toWorldX(u1)
  return {
    x: (x0 + x1) / 2,
    y: ((v0 + v1) / 2 - 0.5) * PAGE_HEIGHT,
    w: Math.abs(x1 - x0),
    h: (v1 - v0) * PAGE_HEIGHT,
  }
}

const close = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} !== ${b}`)

test('a full right-hand page maps to the right half of the spread', () => {
  const box = focusBoxFor({ x: 0, y: 0, w: FACE_W, h: FACE_H }, 5, 5) // unopened
  close(box.x, PAGE_WIDTH / 2)
  close(box.w, PAGE_WIDTH)
  close(box.h, PAGE_HEIGHT)
  close(box.y, 0)
})

test('a full left-hand page maps to the left half of the spread', () => {
  const box = focusBoxFor({ x: 0, y: 0, w: FACE_W, h: FACE_H }, 4, 5) // opened
  close(box.x, -PAGE_WIDTH / 2)
  close(box.w, PAGE_WIDTH)
})

test('u runs left-to-right on both pages, so the spine sides meet at x=0', () => {
  // Right page, leftmost sliver -> just right of the spine.
  const right = focusBoxFor({ x: 0, y: 0, w: 1, h: FACE_H }, 5, 5)
  assert.ok(right.x >= 0 && right.x < 0.01, `right sliver at ${right.x}`)
  // Left page, rightmost sliver -> just left of the spine.
  const left = focusBoxFor({ x: FACE_W - 1, y: 0, w: 1, h: FACE_H }, 4, 5)
  assert.ok(left.x <= 0 && left.x > -0.01, `left sliver at ${left.x}`)
})

test('canvas y is inverted: a rect at the top maps to positive world y', () => {
  const top = focusBoxFor({ x: 0, y: 0, w: FACE_W, h: FACE_H / 4 }, 5, 5)
  const bottom = focusBoxFor({ x: 0, y: (FACE_H * 3) / 4, w: FACE_W, h: FACE_H / 4 }, 5, 5)
  assert.ok(top.y > 0, `top mapped to ${top.y}`)
  assert.ok(bottom.y < 0, `bottom mapped to ${bottom.y}`)
  close(top.y, -bottom.y)
})

test('a half-page photo keeps its real proportions in world units', () => {
  const box = focusBoxFor({ x: 88, y: 88, w: 400, h: 600 }, 5, 5)
  close(box.w, (400 / FACE_W) * PAGE_WIDTH)
  close(box.h, (600 / FACE_H) * PAGE_HEIGHT)
})

// ---- proportional lean-in (mirrors leanTarget in lib/focus.js) -------------

const LEAN_VIEW = 0.6
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n))

function leanTarget(box, point) {
  const relX = clamp((point.x - box.x) / (box.w / 2 || 1), -1, 1)
  const relY = clamp((point.y - box.y) / (box.h / 2 || 1), -1, 1)
  const panX = (box.w * (1 - LEAN_VIEW)) / 2
  const panY = (box.h * (1 - LEAN_VIEW)) / 2
  return { x: box.x + relX * panX, y: box.y + relY * panY, w: box.w * LEAN_VIEW, h: box.h * LEAN_VIEW }
}

const photo = { x: 0.6, y: 0.2, w: 0.5, h: 0.75 }

test('leaning in converges instead of drifting under a still cursor', () => {
  // The failure this guards against: centring the camera on the cursor moves
  // the world point under a stationary cursor by the same amount each frame,
  // so the target runs away and the photo slides out from under the pointer.
  let camera = { x: photo.x, y: photo.y }
  const cursorOffset = { x: 0.18, y: -0.12 } // cursor held off-centre
  const steps = []
  for (let i = 0; i < 40; i++) {
    // The world point under a fixed cursor tracks the camera one-for-one.
    const point = { x: camera.x + cursorOffset.x, y: camera.y + cursorOffset.y }
    const t = leanTarget(photo, point)
    steps.push(Math.hypot(t.x - camera.x, t.y - camera.y))
    camera = { x: t.x, y: t.y }
  }
  assert.ok(steps.at(-1) < 1e-6, `still moving by ${steps.at(-1)} after 40 steps`)
  assert.ok(steps.at(-1) < steps[0], 'steps must shrink, not grow')
  // And it must settle INSIDE the photograph, not on some far-off point.
  assert.ok(Math.abs(camera.x - photo.x) <= photo.w / 2, 'settled outside the photo')
  assert.ok(Math.abs(camera.y - photo.y) <= photo.h / 2, 'settled outside the photo')
})

test('the pointer can reach every corner of the photograph', () => {
  const tl = leanTarget(photo, { x: photo.x - photo.w / 2, y: photo.y + photo.h / 2 })
  const br = leanTarget(photo, { x: photo.x + photo.w / 2, y: photo.y - photo.h / 2 })
  // The framed view at each extreme should touch the photo's own edge.
  close(tl.x - tl.w / 2, photo.x - photo.w / 2)
  close(tl.y + tl.h / 2, photo.y + photo.h / 2)
  close(br.x + br.w / 2, photo.x + photo.w / 2)
  close(br.y - br.h / 2, photo.y - photo.h / 2)
})

test('a cursor beyond the photo clamps rather than flinging the camera', () => {
  const far = leanTarget(photo, { x: photo.x + 99, y: photo.y - 99 })
  const edge = leanTarget(photo, { x: photo.x + photo.w / 2, y: photo.y - photo.h / 2 })
  close(far.x, edge.x)
  close(far.y, edge.y)
})
