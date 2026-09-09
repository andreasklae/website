// Orchestrates the album build: derivatives -> image index -> compiled layouts.

import fs from 'node:fs/promises'
import fsSync from 'node:fs'
import path from 'node:path'
import { buildImageIndex } from './images.mjs'
import { compileStoryAlbum, compileHighlightsAlbum } from './layout.mjs'

const HIGHLIGHTS_ALBUM = {
  id: 'highlights',
  title: { en: 'Highlights', no: 'Høydepunkter' },
  description: {
    en: 'The frames worth keeping — pulled from every roll, every trip, every walk home. Shot mostly on film, developed slowly, chosen even more slowly.',
    no: 'Bildene som var verdt å beholde — hentet fra hver filmrull, hver reise, hver tur hjem. Stort sett skutt på film, fremkalt sakte, og valgt ut enda saktere.',
  },
}

export async function buildAlbums({ root, force = false, log = console.log }) {
  const publicDir = path.join(root, 'public')
  const outAssets = path.join(publicDir, 'albums')
  const outContent = path.join(publicDir, 'content/albums')

  const { index, missing } = await buildImageIndex({ publicDir, outDir: outAssets, force, log })

  const storiesDir = path.join(publicDir, 'content/photography/stories')
  const stories = []
  if (fsSync.existsSync(storiesDir)) {
    const names = (await fs.readdir(storiesDir)).filter((n) => n.endsWith('.json')).sort()
    for (const name of names) {
      stories.push(JSON.parse(await fs.readFile(path.join(storiesDir, name), 'utf8')))
    }
  }

  // Newest first, so the shelf reads left-to-right as most-recent-first.
  stories.sort((a, b) => String(b.dates?.start || '').localeCompare(String(a.dates?.start || '')))

  const highlightsPath = path.join(publicDir, 'content/photography-highlights.json')
  const globalHighlights = fsSync.existsSync(highlightsPath)
    ? JSON.parse(await fs.readFile(highlightsPath, 'utf8'))
    : []

  await fs.mkdir(outContent, { recursive: true })

  const albums = []

  // The highlights album leads the shelf; its cover borrows the first
  // landscape pick so the printed-photograph cover art is not cropped hard.
  const coverSrc =
    globalHighlights.find((s) => index[s]?.orientation === 'landscape') || globalHighlights[0]
  // Highlights spans everything the journals do, so its spine reads as a
  // range rather than borrowing one story's date.
  const years = stories
    .flatMap((s) => [s.dates?.start, s.dates?.end])
    .filter(Boolean)
    .map((d) => String(d).slice(0, 4))
    .sort()

  const highlightsAlbum = compileHighlightsAlbum({
    ...HIGHLIGHTS_ALBUM,
    dates: years.length ? { start: years[0], end: years[years.length - 1] } : null,
    globalHighlights,
    stories,
    index,
    cover: coverSrc && index[coverSrc] ? { kind: 'photo', src: coverSrc, ...index[coverSrc] } : null,
  })
  albums.push(highlightsAlbum)

  for (const story of stories) albums.push(compileStoryAlbum(story, index))

  for (const album of albums) {
    await fs.writeFile(
      path.join(outContent, `${album.id}.json`),
      JSON.stringify(album, null, process.env.NODE_ENV === 'production' ? 0 : 1)
    )
  }

  // The shelf manifest: everything needed to draw spines without loading albums.
  const shelf = albums.map((a) => ({
    id: a.id,
    kind: a.kind,
    title: a.title,
    description: a.description ?? null,
    dates: a.dates ?? null,
    camera: a.camera ?? null,
    cover: a.cover ? { src: a.cover.src, variants: a.cover.variants, color: a.cover.color, aspect: a.cover.aspect } : null,
    sheetCount: a.sheets.length,
    faceCount: a.faceCount,
  }))
  await fs.writeFile(path.join(outContent, 'shelf.json'), JSON.stringify(shelf, null, 1))

  log(`[albums] ${albums.length} albums compiled`)
  for (const a of albums) log(`[albums]   ${a.id}: ${a.faceCount} faces / ${a.sheets.length} sheets`)
  if (missing.length) log(`[albums] WARNING ${missing.length} referenced images not found on disk`)

  return { albums, shelf, missing, imageCount: Object.keys(index).length }
}

// CLI entry: `node scripts/albums/build.mjs [--force]`
if (import.meta.url === `file://${process.argv[1]}`) {
  const root = process.cwd()
  buildAlbums({ root, force: process.argv.includes('--force') })
    .then(() => console.log('[albums] done'))
    .catch((err) => { console.error('[albums] failed:', err); process.exit(1) })
}
