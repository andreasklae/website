// Texture residency and detail for album faces.
//
// The constraint this exists to enforce: a 1024x1367 RGBA face texture costs
// ~5.6 MB of VRAM, and an album can have 90+ faces. Only faces near the
// current spread are allowed to hold a texture; everything else is disposed.
//
// That budget is also why a page is painted at 1024 across, which gives each
// photograph on it about 760 pixels — and 760 pixels stretched over a
// photograph the camera has leaned right in on is visibly soft.
//
// Detail is therefore demand-driven, in two steps that each cost only what
// they have to:
//
//   detail()  repaints the two faces being read at DETAIL_SCALE. Nothing is
//             downloaded: at twice the size a photograph is drawn about 1500
//             pixels wide, and the page derivative already in hand is 1400, so
//             the sharpness was being thrown away at paint time rather than
//             missing from the network. Faces drop back as the reader moves on,
//             so at most two are ever held at the larger size.
//
//   sharpen() fetches the largest derivative for ONE photograph — the one the
//             camera has leaned in on, which is the only time a photograph is
//             magnified past what the page derivative can carry. Those files
//             are ~800 KB against ~280 KB, which is worth it for one image and
//             not worth it for every image on every page in passing.

import { CanvasTexture, LinearFilter, LinearMipmapLinearFilter, SRGBColorSpace } from 'three'
import { paintFace, faceSources, FACE_W, FACE_H } from './faceCanvas'
import { ensureFonts } from './fonts'
import { assetUrl } from './assetUrl'

/** Derivatives, worst to best. A larger one may always stand in for a smaller. */
const RANK = { thumb: 0, page: 1, zoom: 2 }

/**
 * Shared, size-capped cache of decoded images keyed by source path.
 *
 * `map` holds the BEST derivative decoded so far for each source, because that
 * is what the painters want: they ask for a source, not for a size. Asking for
 * a better one later replaces it and the next repaint picks it up; asking for
 * a worse one is a no-op. Keying the cache by source alone — without the rank
 * — would mean whichever size happened to load first was the one every page
 * got for the rest of the session.
 */
class ImageCache {
  constructor(limit = 220) {
    this.limit = limit
    this.map = new Map() // src -> HTMLImageElement (best decoded so far)
    this.rank = new Map() // src -> RANK of what is in `map`
    this.pending = new Map() // `src|variant` -> Promise
  }

  get(src) { return this.map.get(src) }

  /** True once this source is held at `variant` quality or better. */
  has(src, variant = 'page') {
    return this.map.has(src) && this.rank.get(src) >= RANK[variant]
  }

  load(slot, variant = 'page') {
    const src = slot.src
    const want = RANK[variant] ?? RANK.page

    if (this.has(src, variant)) {
      // Refresh recency.
      const img = this.map.get(src)
      this.map.delete(src); this.map.set(src, img)
      return Promise.resolve(img)
    }

    const key = `${src}|${variant}`
    if (this.pending.has(key)) return this.pending.get(key)

    const rel = slot.variants?.[variant] || slot.variants?.page || slot.variants?.thumb
    if (!rel) return Promise.resolve(null)

    const promise = new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.decoding = 'async'
      img.onload = () => {
        this.pending.delete(key)
        // A slower, better derivative may land after a worse one; never go
        // backwards.
        if (!this.map.has(src) || want >= this.rank.get(src)) {
          this.map.delete(src)
          this.map.set(src, img)
          this.rank.set(src, want)
        }
        while (this.map.size > this.limit) {
          const oldest = this.map.keys().next().value
          this.map.delete(oldest)
          this.rank.delete(oldest)
        }
        resolve(this.map.get(src))
      }
      img.onerror = () => { this.pending.delete(key); resolve(this.map.get(src) ?? null) }
      img.src = assetUrl(`albums/${rel}`)
    })
    this.pending.set(key, promise)
    return promise
  }
}

export const imageCache = new ImageCache()

/** How much bigger the spread being read is painted than a face at rest. */
export const DETAIL_SCALE = 2

export class FaceTextureManager {
  constructor(album, { language = 'en', budget = 8, onUpdate = () => {}, colours = {} } = {}) {
    this.album = album
    this.language = language
    // The album's binding cloth. Its boards are faces like any other, so the
    // painter needs it here too — without it the chosen album's cover comes
    // out in the fallback colour, which is why covers looked right on the
    // shelf and wrong the moment a book was picked up.
    this.colours = colours
    this.budget = budget
    this.onUpdate = onUpdate
    this.faces = album ? album.sheets.flatMap((s) => [s.front, s.back]) : []
    this.entries = new Map() // faceIndex -> { canvas, texture, hitboxes }
    this.stackOffsets = new Map() // faceIndex -> { slotIndex: offset }
    // Teardown bumps this instead of latching a `disposed` flag. React
    // StrictMode mounts effects, cleans them up, then mounts again against the
    // SAME memoised instance — a latch would leave every page textureless for
    // the rest of the session.
    this.generation = 0
  }

  faceCount() { return this.faces.length }

  /**
   * Ensures a texture exists for a face and returns it immediately, painted
   * with whatever images are already decoded. Missing images stream in and
   * trigger a repaint, so nothing blocks on the network.
   */
  acquire(index) {
    if (index < 0 || index >= this.faces.length) return null
    let entry = this.entries.get(index)
    if (entry) {
      this.entries.delete(index); this.entries.set(index, entry) // recency
      return entry
    }

    const canvas = document.createElement('canvas')
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    texture.minFilter = LinearFilter
    texture.magFilter = LinearFilter
    texture.generateMipmaps = false
    texture.anisotropy = 4

    entry = { canvas, texture, hitboxes: [], index, scale: 1 }
    this.entries.set(index, entry)

    this.repaint(index)
    this.stream(index)
    this.evict()
    return entry
  }

  /**
   * Paints these faces at full detail and everything else back down.
   *
   * Nothing is downloaded: the page derivative already in hand is 1400 pixels
   * across, and at this size a photograph is drawn about 1500 — the sharpness
   * was being discarded at paint time, not missing from the network. It is
   * also synchronous, because repainting two canvases is cheap next to the
   * fetch it replaces.
   */
  detail(indices, scale = DETAIL_SCALE) {
    const wanted = new Set(indices)

    // Anything previously enlarged goes back to the cheap size, so only the
    // spread in front of the reader is ever held at the bigger one.
    for (const [index, entry] of this.entries) {
      if (!wanted.has(index) && entry.scale !== 1) {
        entry.scale = 1
        this.setFiltering(entry)
        this.repaint(index)
      }
    }

    for (const index of wanted) {
      const entry = this.entries.get(index)
      if (!entry || entry.scale === scale) continue
      entry.scale = scale
      this.setFiltering(entry)
      this.repaint(index)
    }
  }

  /**
   * Mipmaps, but only once a face is bigger than the screen.
   *
   * At the base size a page is being magnified, where a mipmap chain is wasted
   * memory and a blurrier result. At twice the size the same page is being
   * MINIFIED whenever you are looking at the whole spread, and minifying
   * without mipmaps trades the blur this was meant to fix for shimmer along
   * every edge in the photograph, which is worse.
   */
  setFiltering(entry) {
    const big = (entry.scale ?? 1) > 1
    entry.texture.generateMipmaps = big
    entry.texture.minFilter = big ? LinearMipmapLinearFilter : LinearFilter
    entry.texture.anisotropy = big ? 8 : 4
    entry.texture.needsUpdate = true
  }

  /**
   * Fetches the largest derivative of ONE photograph and repaints its face.
   *
   * Called when the camera leans in on a photograph, which is the only time
   * one is magnified past what the page derivative can carry. Those files are
   * ~800 KB against ~280 KB — worth it for the image being looked at, and not
   * worth it for every image on every page in passing.
   */
  async sharpen(index, slot) {
    if (!slot?.src || imageCache.has(slot.src, 'zoom')) return
    const generation = this.generation
    await imageCache.load(slot, 'zoom')
    if (this.generation !== generation || !this.entries.has(index)) return
    this.repaint(index)
  }

  /** Loads this face's images, repainting as each batch arrives. */
  async stream(index) {
    const face = this.faces[index]
    if (!face) return
    // Anything that resolves after a teardown belongs to a past generation and
    // must not paint into a canvas that has since been released.
    const generation = this.generation
    const stale = () => this.generation !== generation || !this.entries.has(index)

    await ensureFonts()
    if (stale()) return
    this.repaint(index) // fonts are ready even if images are not

    await Promise.all(faceSources(face).map(async (slot) => {
      await imageCache.load(slot, 'page')
      if (stale()) return
      this.repaint(index)
    }))
  }

  repaint(index) {
    const entry = this.entries.get(index)
    const face = this.faces[index]
    if (!entry || !face) return
    entry.hitboxes = paintFace(entry.canvas, face, {
      language: this.language,
      images: imageCache.map,
      stackOffsets: this.stackOffsets.get(index) || {},
      scale: entry.scale ?? 1,
      ...this.colours,
    })
    entry.texture.needsUpdate = true
    this.onUpdate(index)
  }

  /** Advances a stack to its next photograph and repaints just that face. */
  cycleStack(faceIndex, slotIndex, delta = 1) {
    const offsets = this.stackOffsets.get(faceIndex) || {}
    offsets[slotIndex] = (offsets[slotIndex] || 0) + delta
    this.stackOffsets.set(faceIndex, offsets)
    this.repaint(faceIndex)
  }

  setLanguage(language) {
    if (language === this.language) return
    this.language = language
    for (const index of this.entries.keys()) this.repaint(index)
  }

  /** Drops the least recently used faces once over budget. */
  evict() {
    while (this.entries.size > this.budget) {
      const oldest = this.entries.keys().next().value
      this.release(oldest)
    }
  }

  release(index) {
    const entry = this.entries.get(index)
    if (!entry) return
    entry.texture.dispose()
    entry.canvas.width = entry.canvas.height = 1 // let the backing store go
    this.entries.delete(index)
  }

  /** Marks a set of faces as the ones worth keeping, releasing the rest. */
  keepOnly(indices) {
    const keep = new Set(indices)
    for (const index of [...this.entries.keys()]) {
      if (!keep.has(index)) this.release(index)
    }
  }

  /**
   * Releases every texture. The manager stays usable: callers may acquire
   * again afterwards, which is what StrictMode's remount does.
   */
  dispose() {
    this.generation++
    for (const index of [...this.entries.keys()]) this.release(index)
  }
}

export { FACE_W, FACE_H }
