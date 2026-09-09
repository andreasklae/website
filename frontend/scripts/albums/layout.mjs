// Phase 2 — layout compiler.
//
// Turns a story into an ordered list of album page faces. Pure and
// side-effect free so it can be unit-tested without touching disk.
//
// The rule that drives everything: a page holds either two landscape images
// (stacked) or one portrait image (filling the page). Modelled as a capacity
// of 2 "units" per page, where landscape costs 1 and portrait costs 2.

export const PAGE_UNITS = 2
export const SPREAD_PAGES = 2

/**
 * Units consumed by a slot. Every slot costs one: a page always carries two
 * items, whatever their orientation. The page decides how to divide itself —
 * two landscapes stack, two portraits sit side by side — so orientation is a
 * rendering concern, not a packing one.
 */
const unitsFor = () => 1

const newPage = (role) => ({ role, slots: [], used: 0 })

/**
 * Drops a trailing year from a title.
 *
 * Albums carry their date on the spine and the cover already, so repeating it
 * in the title says the same thing twice — and on a spine, where the label is
 * narrow, the year is what squeezes the name. The source content keeps its
 * full titles; only the album's own reads short.
 */
export const stripYear = (title) => {
  if (title == null) return title
  if (typeof title === 'string') return title.replace(/[\s\u2013-]*\b(19|20)\d{2}\b\s*$/, '').trim() || title
  return Object.fromEntries(Object.entries(title).map(([k, v]) => [k, stripYear(v)]))
}

/**
 * Free units left across the whole page budget. Must count holes left in
 * earlier pages too: a portrait photo fills the page it opens, which can
 * leave a usable half-slot stranded behind it.
 */
const freeUnits = (pages, maxPages) =>
  (maxPages - pages.length) * PAGE_UNITS +
  pages.reduce((n, p) => n + (PAGE_UNITS - p.used), 0)

/**
 * Places a single-unit slot in the last page that still has room, opening a
 * new page in preference to backfilling when the budget allows. Used for the
 * stack, which must land in the last genuinely available spot.
 */
const placeInLastFreeSlot = (pages, slot, maxPages, role) => {
  if (pages.length < maxPages && pages[pages.length - 1].used === PAGE_UNITS) {
    return place(pages, slot, maxPages, role)
  }
  for (let i = pages.length - 1; i >= 0; i--) {
    if (PAGE_UNITS - pages[i].used >= unitsFor(slot)) {
      pages[i].slots.push(slot)
      pages[i].used += unitsFor(slot)
      return true
    }
  }
  return place(pages, slot, maxPages, role)
}

/**
 * Greedily places a slot, opening a new page when the current one cannot hold
 * it. Returns false if the page budget is exhausted.
 */
const place = (pages, slot, maxPages, role) => {
  const size = unitsFor(slot)
  let cur = pages[pages.length - 1]
  if (cur.used + size > PAGE_UNITS) {
    if (pages.length >= maxPages) return false
    cur = newPage(role)
    pages.push(cur)
  }
  cur.slots.push(slot)
  cur.used += size
  return true
}

const photoSlot = (src, index, extra = {}) => {
  const meta = index[src]
  if (!meta) return null
  return {
    kind: 'photo',
    src,
    id: meta.id,
    w: meta.w,
    h: meta.h,
    aspect: meta.aspect,
    orientation: meta.orientation,
    color: meta.color,
    variants: meta.variants,
    ...extra,
  }
}

/**
 * A stack slot: the visible top photo plus the tail the viewer sifts through
 * on hover. Renders with its siblings deliberately misaligned so the depth
 * reads at a glance.
 */
const stackSlot = (sources, index) => {
  const photos = sources.map((s) => photoSlot(s, index)).filter(Boolean)
  if (!photos.length) return null
  return { kind: 'stack', count: photos.length, photos }
}

const cardSlot = (kind, { title, text, meta }) => ({ kind, title, text, meta })

/**
 * Compiles one chapter into a single spread.
 *
 * Slot order is postcard -> mainImage -> gallery, with the LAST free slot always
 * reserved for a stack holding every gallery image that did not get its own
 * slot. Placement is simulated rather than predicted arithmetically: a portrait
 * photo forces a fresh page and can swallow capacity that a units-remaining
 * calculation would wrongly assume is still splittable.
 */
function compileChapter(chapter, index, opts = {}) {
  const maxPages = opts.maxPages ?? SPREAD_PAGES
  const pages = [newPage('chapter')]
  const placed = []

  place(pages, cardSlot('postcard', {
    title: chapter.title,
    text: chapter.text,
    meta: { chapterId: chapter.id },
  }), maxPages, 'chapter')

  const queue = []
  if (chapter.mainImage) queue.push(chapter.mainImage)
  for (const g of chapter.gallery || []) if (g !== chapter.mainImage) queue.push(g)

  const snapshot = () => pages.map((p) => ({ role: p.role, slots: [...p.slots], used: p.used }))
  const restore = (snap) => { pages.length = 0; pages.push(...snap) }

  for (const src of queue) {
    const slot = photoSlot(src, index)
    if (!slot) continue
    const before = snapshot()
    if (!place(pages, slot, maxPages, 'chapter')) { restore(before); break }
    // Reject the placement if it leaves no room for the stack.
    if (freeUnits(pages, maxPages) < 1) { restore(before); break }
    placed.push(src)
  }

  const leftover = queue.filter((s) => !placed.includes(s) && index[s])

  if (leftover.length) {
    // A stack must always be reachable. If nothing fits, give back the last
    // photo placed rather than dropping the tail of the chapter silently.
    if (freeUnits(pages, maxPages) < 1 && placed.length) {
      const evicted = placed.pop()
      const last = pages[pages.length - 1]
      const slot = last.slots.pop()
      last.used -= unitsFor(slot)
      if (!last.slots.length && pages.length > 1) pages.pop()
      leftover.unshift(evicted)
    }
    const stack = stackSlot(leftover, index)
    if (stack) placeInLastFreeSlot(pages, stack, maxPages, 'chapter')
  }

  return pages
}

/** Compiles the highlights run that opens every album, led by a memo. */
function compileHighlights(sources, index, memo) {
  const pages = [newPage('highlights')]
  const MAX = 64 // generous ceiling; highlights runs are short in practice
  if (memo) place(pages, cardSlot('memo', memo), MAX, 'highlights')
  for (const src of sources) {
    const slot = photoSlot(src, index)
    if (slot) place(pages, slot, MAX, 'highlights')
  }
  return pages
}

const blankFace = (role = 'blank') => ({ role, slots: [], used: 0 })

/**
 * When the book is open you see the BACK of one sheet on the left and the
 * FRONT of the next on the right, so a visual spread is the face pair
 * (1,2), (3,4), (5,6)... Sections that should read as one spread therefore
 * have to begin on an odd face index; pad with a blank when they do not.
 */
const alignToSpread = (faces) => {
  if (faces.length % 2 === 0) faces.push(blankFace('spacer'))
}

/**
 * Pairs page faces into the {front, back} sheets the renderer flips, padding
 * so no sheet is half-empty and the back cover lands on its own face.
 */
function toSheets(faces) {
  const padded = [...faces]
  if (padded.length % 2 !== 0) padded.push(blankFace())
  const sheets = []
  for (let i = 0; i < padded.length; i += 2) {
    sheets.push({ front: padded[i], back: padded[i + 1] })
  }
  return sheets
}

/** Compiles a journal story into a full album. */
export function compileStoryAlbum(story, index) {
  const faces = []
  const title = stripYear(story.title)

  faces.push({
    role: 'cover',
    slots: [{
      kind: 'cover',
      title,
      subtitle: story.camera,
      dates: story.dates,
      photo: photoSlot(story.thumbnail, index),
    }],
    used: PAGE_UNITS,
  })

  alignToSpread(faces)
  faces.push(...compileHighlights(story.highlights || [], index, {
    title,
    text: story.description,
    meta: { dates: story.dates, camera: story.camera },
  }))

  for (const chapter of story.chapters || []) {
    // Each chapter is one spread, so it must open on the left-hand page.
    alignToSpread(faces)
    faces.push(...compileChapter(chapter, index))
  }

  faces.push({ role: 'back-cover', slots: [{ kind: 'back-cover', title: story.title }], used: PAGE_UNITS })

  return {
    id: story.id,
    kind: 'story',
    title,
    description: story.description,
    dates: story.dates,
    camera: story.camera,
    cover: photoSlot(story.thumbnail, index),
    sheets: toSheets(faces),
    faceCount: faces.length,
  }
}

/**
 * Compiles the standalone highlights album that sits alongside the journals
 * on the shelf: an overview memo, the global picks, then one memo per story
 * introducing that story's own best frames.
 */
export function compileHighlightsAlbum({ id, title, description, dates, globalHighlights, stories, index, cover }) {
  const faces = []

  faces.push({
    role: 'cover',
    slots: [{ kind: 'cover', title, subtitle: null, dates, photo: cover }],
    used: PAGE_UNITS,
  })

  alignToSpread(faces)
  faces.push(...compileHighlights(globalHighlights || [], index, { title, text: description }))

  for (const story of stories || []) {
    alignToSpread(faces)
    faces.push(...compileHighlights(story.highlights || [], index, {
      title: stripYear(story.title),
      text: story.description,
      meta: { dates: story.dates, camera: story.camera, storyId: story.id },
    }))
  }

  faces.push({ role: 'back-cover', slots: [{ kind: 'back-cover', title }], used: PAGE_UNITS })

  return {
    id,
    kind: 'highlights',
    title,
    description,
    dates,
    cover,
    sheets: toSheets(faces),
    faceCount: faces.length,
  }
}

export const __test = { compileChapter, compileHighlights, toSheets, freeUnits, unitsFor, alignToSpread, placeInLastFreeSlot }
