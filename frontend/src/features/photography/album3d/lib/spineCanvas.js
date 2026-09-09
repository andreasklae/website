// The spine you read when the albums are shelved side-on: cloth board, a
// metal label holder, and a handwritten title card slipped into it.

import { HAND, HAND_INK } from './fonts'


export const SPINE_H = 1024

/** Nominal width; the real one follows the album's own proportions. */
export const SPINE_W = 256

import { clothFor } from './cloth'
import { paintCloth, paintPaper, seedFrom, shade } from './material'
import { BOARD_SHADE } from './faceCanvas'

const pick = (value, language) => {
  if (value == null) return ''
  if (typeof value === 'string') return value
  return value[language] ?? value.en ?? ''
}

export function paintSpine(canvas, album, { language = 'en', index = 0, aspect = 0.25 } = {}) {
  const ctx = canvas.getContext('2d')
  // Painted at the spine's own width-to-height ratio, so the label and the
  // lettering are not stretched to fit a shape they were not drawn for.
  const SPINE_W = Math.max(96, Math.round(SPINE_H * aspect))
  canvas.width = SPINE_W
  canvas.height = SPINE_H

  const { cloth } = clothFor(index)
  // The same shade the boards are painted, so a book is one colour whichever
  // face of it you are looking at.
  paintCloth(ctx, SPINE_W, SPINE_H, shade(cloth, BOARD_SHADE), seedFrom(String(album.id) + 'spine'))

  // Rolled edges catch the light.
  const edge = ctx.createLinearGradient(0, 0, SPINE_W, 0)
  edge.addColorStop(0, 'rgba(0,0,0,0.45)')
  edge.addColorStop(0.12, 'rgba(255,255,255,0.07)')
  edge.addColorStop(0.5, 'rgba(255,255,255,0.02)')
  edge.addColorStop(0.88, 'rgba(255,255,255,0.05)')
  edge.addColorStop(1, 'rgba(0,0,0,0.45)')
  ctx.fillStyle = edge
  ctx.fillRect(0, 0, SPINE_W, SPINE_H)

  // Head and tail bands.
  ctx.fillStyle = 'rgba(0,0,0,0.28)'
  ctx.fillRect(0, 42, SPINE_W, 3)
  ctx.fillRect(0, SPINE_H - 45, SPINE_W, 3)

  // --- label holder ---------------------------------------------------------
  const holder = { x: 24, y: SPINE_H * 0.22, w: SPINE_W - 48, h: SPINE_H * 0.46 }

  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.5)'
  ctx.shadowBlur = 14
  ctx.shadowOffsetY = 3
  const brass = ctx.createLinearGradient(holder.x, 0, holder.x + holder.w, 0)
  brass.addColorStop(0, '#8a7a55')
  brass.addColorStop(0.35, '#d8c48a')
  brass.addColorStop(0.6, '#b8a066')
  brass.addColorStop(1, '#6f6242')
  ctx.fillStyle = brass
  ctx.fillRect(holder.x, holder.y, holder.w, holder.h)
  ctx.restore()

  // The card sitting inside the holder — a slip of the same paper the album is
  // made of, so it ages like the rest of it rather than sitting there as a
  // flat rectangle.
  const card = { x: holder.x + 9, y: holder.y + 9, w: holder.w - 18, h: holder.h - 18 }
  ctx.save()
  ctx.beginPath()
  ctx.rect(card.x, card.y, card.w, card.h)
  ctx.clip()
  ctx.translate(card.x, card.y)
  paintPaper(ctx, card.w, card.h, '#f6f1e3', seedFrom(String(album.id) + 'label'))
  // Settled a little further into the holder at the top than the bottom.
  const settle = ctx.createLinearGradient(0, 0, 0, card.h)
  settle.addColorStop(0, 'rgba(0,0,0,0.16)')
  settle.addColorStop(0.14, 'rgba(0,0,0,0)')
  settle.addColorStop(0.86, 'rgba(0,0,0,0)')
  settle.addColorStop(1, 'rgba(0,0,0,0.1)')
  ctx.fillStyle = settle
  ctx.fillRect(0, 0, card.w, card.h)
  ctx.restore()

  ctx.strokeStyle = 'rgba(0,0,0,0.14)'
  ctx.lineWidth = 1
  ctx.strokeRect(card.x + 0.5, card.y + 0.5, card.w - 1, card.h - 1)

  // Title runs down the spine, so rotate into the card.
  ctx.save()
  ctx.translate(card.x + card.w / 2, card.y + card.h / 2)
  ctx.rotate(Math.PI / 2)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#2b2721'

  // Shrink to fit, then break to a second line rather than shrinking further —
  // a two-line spine label still reads, a 24px one does not.
  const title = pick(album.title, language)
  const available = card.h - 30
  let size = 68
  const fits = (lines) => {
    ctx.font = `700 ${size}px ${HAND}`
    return lines.every((l) => ctx.measureText(l).width <= available)
  }

  let lines = [title]
  while (!fits(lines) && size > 40) size -= 2
  if (!fits(lines)) {
    const words = title.split(' ')
    if (words.length > 1) {
      // Split at the point that balances the two halves.
      let best = 1, bestDiff = Infinity
      for (let i = 1; i < words.length; i++) {
        const diff = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length)
        if (diff < bestDiff) { bestDiff = diff; best = i }
      }
      lines = [words.slice(0, best).join(' '), words.slice(best).join(' ')]
      size = 60
      while (!fits(lines) && size > 26) size -= 2
    } else {
      while (!fits(lines) && size > 22) size -= 2
    }
  }

  ctx.font = `700 ${size}px ${HAND}`
  const lineGap = size * 0.92
  const startX = -((lines.length - 1) * lineGap) / 2
  lines.forEach((line, i) => ctx.fillText(line, 0, startX + i * lineGap - 4))

  const year = album.dates?.start?.slice(0, 4)
  if (year) {
    ctx.font = `28px ${HAND_INK}`
    ctx.fillStyle = 'rgba(43,39,33,0.55)'
    ctx.fillText(year, 0, startX + lines.length * lineGap + 14)
  }
  ctx.restore()

  return canvas
}
