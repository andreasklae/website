// node --test frontend/scripts/albums/layout.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { compileStoryAlbum, __test } from './layout.mjs'

const img = (id, orientation) => ({
  id, src: id, w: orientation === 'portrait' ? 800 : 1200, h: orientation === 'portrait' ? 1200 : 800,
  aspect: orientation === 'portrait' ? 0.667 : 1.5, orientation, color: '#888', variants: { page: `p/${id}.webp` },
})

const index = Object.fromEntries(
  [...Array(30)].map((_, i) => [`L${i}`, img(`L${i}`, 'landscape')])
    .concat([...Array(30)].map((_, i) => [`P${i}`, img(`P${i}`, 'portrait')]))
)

const chapter = (mainImage, gallery) => ({ id: 'c', title: { en: 'C' }, text: { en: 't' }, mainImage, gallery })

const flatten = (pages) => pages.flatMap((p) => p.slots.map((s) => s.kind))

test('a chapter never exceeds one spread', () => {
  for (const main of ['L0', 'P0']) {
    const pages = __test.compileChapter(chapter(main, [...Array(20)].map((_, i) => `L${i + 1}`)), index)
    assert.ok(pages.length <= 2, `got ${pages.length} pages`)
    for (const p of pages) assert.ok(p.used <= 2)
  }
})

test('a portrait main image still leaves room for the stack', () => {
  // The regression that motivated summing free units across all pages: a
  // portrait fills the page it opens, stranding a slot on the page before it.
  const pages = __test.compileChapter(chapter('P0', ['L1', 'L2', 'L3']), index)
  assert.ok(flatten(pages).includes('stack'), 'stack must be placed')
  assert.ok(flatten(pages).includes('photo'), 'main image must survive')
})

test('no gallery image is ever dropped', () => {
  const gallery = [...Array(25)].map((_, i) => `L${i + 1}`)
  const pages = __test.compileChapter(chapter('P0', gallery), index)
  const seen = new Set()
  for (const p of pages) for (const s of p.slots) {
    if (s.kind === 'photo') seen.add(s.src)
    if (s.kind === 'stack') s.photos.forEach((x) => seen.add(x.src))
  }
  for (const g of ['P0', ...gallery]) assert.ok(seen.has(g), `${g} was dropped`)
})

test('every page carries two items, portrait or not', () => {
  const pages = __test.compileHighlights(['P0', 'P1', 'L0', 'L1', 'P2', 'L2'], index, null)
  // Only the final page may be short, when the run does not divide evenly.
  pages.slice(0, -1).forEach((p, i) => {
    assert.equal(p.slots.length, 2, `page ${i} holds ${p.slots.length}`)
  })
  assert.ok(pages.every((p) => p.slots.length <= 2))
})

test('a chapter fills all four slots of its spread', () => {
  const pages = __test.compileChapter(chapter('P0', ['P1', 'P2', 'L1', 'L2', 'L3']), index)
  const kinds = flatten(pages)
  assert.equal(kinds.length, 4, `got ${kinds.join()}`)
  assert.equal(kinds[0], 'postcard')
  assert.equal(kinds.at(-1), 'stack')
})

test('chapters begin on a left-hand page', () => {
  const story = {
    id: 's', title: { en: 'S' }, description: { en: 'd' }, thumbnail: 'L0',
    highlights: ['P0', 'L1'],
    chapters: [chapter('L2', ['L3', 'L4', 'L5']), chapter('P1', ['L6', 'L7'])],
  }
  const album = compileStoryAlbum(story, index)
  const faces = album.sheets.flatMap((s) => [s.front, s.back])
  faces.forEach((f, i) => {
    const prev = faces[i - 1]
    if (f.role === 'chapter' && prev?.role !== 'chapter') {
      assert.equal(i % 2, 1, `chapter starts at face ${i}, must be odd`)
    }
  })
})
