// node --test frontend/scripts/albums/focus.test.mjs
// Mirrors src/features/photography/album3d/lib/focus.js so the world-space
// mapping can be checked without a browser or a GPU.
import test from 'node:test'
import assert from 'node:assert/strict'

const FACE_W = 1024, FACE_H = 1367, PAGE_WIDTH = 1.28, PAGE_HEIGHT = 1.71

function focusBoxFor(rect, sheetIndex, page, hingeX = 0) {
  const opened = sheetIndex < page
  const u0 = rect.x / FACE_W, u1 = (rect.x + rect.w) / FACE_W
  const v0 = 1 - (rect.y + rect.h) / FACE_H, v1 = 1 - rect.y / FACE_H
  const toWorldX = (u) => hingeX + (opened ? -(1 - u) * PAGE_WIDTH : u * PAGE_WIDTH)
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

// ---- anchored zoom (mirrors anchoredTarget in lib/focus.js) ---------------

const LEAN_PAN_GAIN = 1.7
const BOUNDS = { x: PAGE_WIDTH, y: PAGE_HEIGHT * 0.5 }
const clamp2 = (n, lo, hi) => Math.min(hi, Math.max(lo, n))

function anchoredTarget(focus, halfW, halfH) {
  const { anchor, ndc, ndc0 } = focus
  const x = anchor.x - ndc0.x * halfW + (ndc.x - ndc0.x) * LEAN_PAN_GAIN * halfW
  const y = anchor.y - ndc0.y * halfH + (ndc.y - ndc0.y) * LEAN_PAN_GAIN * halfH
  return { x: clamp2(x, -BOUNDS.x, BOUNDS.x), y: clamp2(y, -BOUNDS.y, BOUNDS.y) }
}

const halfHAt = (d) => d * Math.tan((30 * Math.PI) / 180 / 2)
const ASPECT = 1.78
/** Where a world point lands on screen, in NDC, for a camera looking at T. */
const screenOf = (p, target, halfW, halfH) => ({
  x: (p.x - target.x) / halfW,
  y: (p.y - target.y) / halfH,
})

test('the spot you pointed at stays exactly under the pointer while zooming', () => {
  // The property the whole hover interaction is judged on. The anchor is
  // captured through the resting camera, so it must be constructed that way.
  const rest = 3.79
  const ndc0 = { x: 0.31, y: -0.17 }
  const restingTarget = { x: 0, y: -0.05 }
  const h0 = halfHAt(rest)
  const anchor = {
    x: restingTarget.x + ndc0.x * h0 * ASPECT,
    y: restingTarget.y + ndc0.y * h0,
  }
  const focus = { anchor, ndc: ndc0, ndc0 }

  for (const d of [rest, 3.5, 3.2, 3.1]) {
    const halfH = halfHAt(d)
    const halfW = halfH * ASPECT
    const seen = screenOf(anchor, anchoredTarget(focus, halfW, halfH), halfW, halfH)
    close(seen.x, ndc0.x, 1e-9)
    close(seen.y, ndc0.y, 1e-9)
  }
})

test('leaning in does not jerk the camera at the moment it engages', () => {
  const rest = 3.79
  const ndc0 = { x: -0.4, y: 0.22 }
  const restingTarget = { x: 0, y: -0.05 }
  const halfH = halfHAt(rest)
  const halfW = halfH * ASPECT
  const anchor = { x: restingTarget.x + ndc0.x * halfW, y: restingTarget.y + ndc0.y * halfH }
  const t = anchoredTarget({ anchor, ndc: ndc0, ndc0 }, halfW, halfH)
  close(t.x, restingTarget.x, 1e-9)
  close(t.y, restingTarget.y, 1e-9)
})

test('moving the pointer pans, but by less than one-for-one', () => {
  const halfH = halfHAt(3.1)
  const halfW = halfH * ASPECT
  const ndc0 = { x: 0, y: 0 }
  const anchor = { x: 0.2, y: 0.1 }
  const still = anchoredTarget({ anchor, ndc: ndc0, ndc0 }, halfW, halfH)
  const moved = anchoredTarget({ anchor, ndc: { x: 0.3, y: 0 }, ndc0 }, halfW, halfH)
  // The view must FOLLOW the pointer: right means right.
  assert.ok(moved.x > still.x, 'panning must follow the pointer, not oppose it')
  const shift = Math.abs(moved.x - still.x)
  const pinned = 0.3 * halfW
  // Above one-for-one, so the whole photograph is reachable without taking the
  // pointer to the edge of the screen — and it never sticks to the pointer.
  assert.ok(shift > pinned, 'panning should outrun the pointer')
  assert.notEqual(LEAN_PAN_GAIN, 1, 'at exactly 1 the photo is pinned and cannot be left')
  close(shift, pinned * LEAN_PAN_GAIN)
})

test('the camera never wanders off the spread', () => {
  const halfH = halfHAt(3.1)
  const halfW = halfH * ASPECT
  const t = anchoredTarget(
    { anchor: { x: 1.2, y: 0.5 }, ndc: { x: -1, y: 1 }, ndc0: { x: -1, y: 1 } },
    halfW, halfH
  )
  assert.ok(Math.abs(t.x) <= PAGE_WIDTH + 1e-9, `x ran to ${t.x}`)
  assert.ok(Math.abs(t.y) <= PAGE_HEIGHT / 2 + 1e-9, `y ran to ${t.y}`)
})

test('the solution uses no camera-derived input, so it cannot oscillate', () => {
  // Re-evaluating with the same inputs must give the same answer: neither the
  // anchor nor the pointer's screen position moves when the camera does. The
  // earlier versions failed exactly here.
  const focus = { anchor: { x: 0.62, y: 0.28 }, ndc: { x: 0.25, y: -0.1 }, ndc0: { x: 0.2, y: 0 } }
  const halfH = halfHAt(3.1)
  const halfW = halfH * ASPECT
  const first = anchoredTarget(focus, halfW, halfH)
  for (let i = 0; i < 25; i++) {
    const again = anchoredTarget(focus, halfW, halfH)
    close(again.x, first.x, 1e-12)
    close(again.y, first.y, 1e-12)
  }
})

test('anchors follow the album when it drifts across as it turns', () => {
  // The album does not stay in its own slot: it moves half a page to the left
  // as it turns, so the cover ends up centred over the row. Everything the
  // focus maths measures is taken from the hinge, so the hinge has to be an
  // input — otherwise every anchor lands half a page from its photograph.
  const hingeX = -PAGE_WIDTH / 2
  const rect = { x: 200, y: 300, w: 400, h: 600 }

  const atOrigin = focusBoxFor(rect, 5, 5)
  const shifted = focusBoxFor(rect, 5, 5, hingeX)
  close(shifted.x, atOrigin.x + hingeX)
  close(shifted.w, atOrigin.w)

  // And on the left-hand page, which is mirrored.
  const leftAtOrigin = focusBoxFor(rect, 4, 5)
  const leftShifted = focusBoxFor(rect, 4, 5, hingeX)
  close(leftShifted.x, leftAtOrigin.x + hingeX)
})
