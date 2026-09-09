// Phase 1 — derivative generation + image index.
//
// Reads every image referenced by the photography content JSON, emits three
// EXIF-oriented webp derivatives per image, and writes an index that records
// each image's true (post-rotation) dimensions so the layout compiler and the
// renderer never have to measure an image at runtime.

import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import sharp from 'sharp'

export const VARIANTS = {
  // 320px: spine labels, stack siblings, shelf-distance thumbnails
  thumb: { width: 320, quality: 72 },
  // 1400px: the texture actually composited onto a page face
  page: { width: 1400, quality: 80 },
  // 2400px: swapped in only when an image is hover-zoomed
  zoom: { width: 2400, quality: 82 },
}

const CACHE_VERSION = 1

/** Stable short id for a source path — sidesteps spaces/unicode in the originals. */
export const imageId = (relPath) =>
  crypto.createHash('sha1').update(relPath).digest('hex').slice(0, 16)

/**
 * Walks the photography content and returns every distinct image path it
 * references, so the pipeline never processes the ~450MB of software-project
 * screenshots that share the portfolio directory.
 */
export async function collectReferencedImages(publicDir) {
  const found = new Set()
  const add = (p) => { if (typeof p === 'string' && p.trim()) found.add(p.trim()) }

  const highlightsPath = path.join(publicDir, 'content/photography-highlights.json')
  if (fsSync.existsSync(highlightsPath)) {
    const list = JSON.parse(await fs.readFile(highlightsPath, 'utf8'))
    if (Array.isArray(list)) list.forEach(add)
  }

  const storiesDir = path.join(publicDir, 'content/photography/stories')
  if (fsSync.existsSync(storiesDir)) {
    for (const name of (await fs.readdir(storiesDir)).filter((n) => n.endsWith('.json'))) {
      const story = JSON.parse(await fs.readFile(path.join(storiesDir, name), 'utf8'))
      add(story.thumbnail)
      ;(story.highlights || []).forEach(add)
      for (const chapter of story.chapters || []) {
        add(chapter.mainImage)
        ;(chapter.gallery || []).forEach(add)
      }
    }
  }

  return [...found].sort()
}

/**
 * Generates the derivatives for one source image.
 * Returns the index entry, or null if the source is missing/unreadable.
 */
async function processImage(relPath, { publicDir, outDir, cache, force }) {
  const srcPath = path.join(publicDir, relPath)

  let stat
  try {
    stat = await fsSync.promises.stat(srcPath)
  } catch {
    return { error: 'missing' }
  }

  const id = imageId(relPath)
  const fingerprint = `${CACHE_VERSION}:${stat.size}:${Math.round(stat.mtimeMs)}`
  const cached = cache[relPath]

  // Trust the cache only if every derivative it claims is still on disk.
  if (!force && cached && cached.fingerprint === fingerprint) {
    const intact = Object.keys(VARIANTS).every(
      (v) => !cached.entry.variants[v] || fsSync.existsSync(path.join(outDir, cached.entry.variants[v]))
    )
    if (intact) return { entry: cached.entry, fingerprint, cached: true }
  }

  const image = sharp(srcPath, { failOn: 'none' }).rotate() // .rotate() applies EXIF orientation
  const meta = await image.metadata()

  // Post-rotation dimensions. sharp reports pre-rotation size in metadata, so
  // swap when the EXIF orientation is one of the 90/270-degree cases.
  const swapped = meta.orientation >= 5 && meta.orientation <= 8
  const width = swapped ? meta.height : meta.width
  const height = swapped ? meta.width : meta.height
  if (!width || !height) return { error: 'no-dimensions' }

  const variants = {}
  for (const [name, cfg] of Object.entries(VARIANTS)) {
    // Never upscale: skip a variant whose target is wider than the source.
    if (cfg.width > width && name !== 'thumb') continue
    const rel = path.join('derived', name, `${id}.webp`)
    const abs = path.join(outDir, rel)
    await fs.mkdir(path.dirname(abs), { recursive: true })
    await sharp(srcPath, { failOn: 'none' })
      .rotate()
      .resize({ width: Math.min(cfg.width, width), withoutEnlargement: true })
      .webp({ quality: cfg.quality })
      .toFile(abs)
    variants[name] = rel
  }

  // 1x1 average colour, used to paint a placeholder plane before the texture lands.
  const { data } = await sharp(srcPath, { failOn: 'none' })
    .rotate()
    .resize(1, 1, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true })
  const color = `#${[data[0], data[1], data[2]].map((c) => c.toString(16).padStart(2, '0')).join('')}`

  const aspect = width / height
  const entry = {
    id,
    src: relPath,
    w: width,
    h: height,
    aspect: Number(aspect.toFixed(4)),
    // The single fact the whole page layout turns on.
    orientation: aspect > 1.02 ? 'landscape' : aspect < 0.98 ? 'portrait' : 'square',
    color,
    variants,
  }

  return { entry, fingerprint }
}

/** Builds every derivative and returns the image index keyed by source path. */
export async function buildImageIndex({ publicDir, outDir, force = false, log = () => {} }) {
  await fs.mkdir(outDir, { recursive: true })
  const cachePath = path.join(outDir, '.cache.json')

  let cache = {}
  if (!force && fsSync.existsSync(cachePath)) {
    try { cache = JSON.parse(await fs.readFile(cachePath, 'utf8')) } catch { cache = {} }
  }

  const images = await collectReferencedImages(publicDir)
  log(`[albums] ${images.length} referenced images`)

  const index = {}
  const nextCache = {}
  const missing = []
  let built = 0
  let reused = 0

  // Bounded concurrency: sharp is already threaded, so a small pool keeps the
  // machine responsive without leaving cores idle.
  const CONCURRENCY = 6
  let cursor = 0
  const worker = async () => {
    while (cursor < images.length) {
      const relPath = images[cursor++]
      const result = await processImage(relPath, { publicDir, outDir, cache, force })
      if (result.error) { missing.push(relPath); continue }
      index[relPath] = result.entry
      nextCache[relPath] = { fingerprint: result.fingerprint, entry: result.entry }
      if (result.cached) reused++
      else { built++; if (built % 25 === 0) log(`[albums]   built ${built}…`) }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  await fs.writeFile(cachePath, JSON.stringify(nextCache))
  log(`[albums] derivatives: ${built} built, ${reused} reused${missing.length ? `, ${missing.length} missing` : ''}`)
  if (missing.length) missing.slice(0, 10).forEach((m) => log(`[albums]   missing: ${m}`))

  return { index, missing }
}
