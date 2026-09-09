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
