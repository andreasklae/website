// Texture residency for album faces.
//
// The constraint this exists to enforce: a 1024x1367 RGBA face texture costs
// ~5.6 MB of VRAM, and an album can have 90+ faces. Only faces near the
// current spread are allowed to hold a texture; everything else is disposed.

import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three'
import { paintFace, faceSources, FACE_W, FACE_H } from './faceCanvas'
import { ensureFonts } from './fonts'
import { assetUrl } from './assetUrl'

/** Shared, size-capped cache of decoded images keyed by source path. */
class ImageCache {
  constructor(limit = 220) {
    this.limit = limit
    this.map = new Map() // src -> HTMLImageElement (decoded)
    this.pending = new Map()
  }

  get(src) { return this.map.get(src) }

  load(slot, variant = 'page') {
    const src = slot.src
    if (this.map.has(src)) {
      // Refresh recency.
      const img = this.map.get(src)
      this.map.delete(src); this.map.set(src, img)
      return Promise.resolve(img)
    }
    if (this.pending.has(src)) return this.pending.get(src)

    const rel = slot.variants?.[variant] || slot.variants?.page || slot.variants?.thumb
    if (!rel) return Promise.resolve(null)

    const promise = new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.decoding = 'async'
      img.onload = () => {
        this.map.set(src, img)
        this.pending.delete(src)
        while (this.map.size > this.limit) this.map.delete(this.map.keys().next().value)
        resolve(img)
      }
      img.onerror = () => { this.pending.delete(src); resolve(null) }
      img.src = assetUrl(`albums/${rel}`)
    })
    this.pending.set(src, promise)
    return promise
  }
}

export const imageCache = new ImageCache()

export class FaceTextureManager {
  constructor(album, { language = 'en', budget = 8, onUpdate = () => {} } = {}) {
    this.album = album
    this.language = language
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

    entry = { canvas, texture, hitboxes: [], index }
    this.entries.set(index, entry)

    this.repaint(index)
    this.stream(index)
    this.evict()
    return entry
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
