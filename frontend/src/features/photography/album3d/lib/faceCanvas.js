// Composites one album page face into a single canvas.
//
// One canvas per face means one texture and one draw call per page, which is
// what keeps the frame budget flat while pages are turning. Slot geometry is
// returned alongside so the scene can place invisible hit-test planes for
// hover and zoom without re-deriving the layout.

import { HAND, HAND_INK } from './fonts'
import { paintCloth, paintPaper, seedFrom, shade } from './material'

export const FACE_W = 1024
export const FACE_H = 1367 // 0.749 — matches the page mesh aspect
// Generous margins on purpose: prints that reach the page edge, or sit tight
// against each other, read as a contact sheet rather than an album page.
const MARGIN = 88
const GAP = 52

const PAPER = '#f4f1ea'
const PAPER_EDGE = '#e6e0d4'
const INK = '#2b2721'

const CONTENT = { x: MARGIN, y: MARGIN, w: FACE_W - MARGIN * 2, h: FACE_H - MARGIN * 2 }

const pick = (value, language) => {
  if (value == null) return ''
  if (typeof value === 'string') return value
  return value[language] ?? value.en ?? Object.values(value)[0] ?? ''
}

/** Is this slot tall? Cards are always wide; a stack takes its top photo. */
function slotIsPortrait(slot) {
  if (slot.kind === 'photo') return slot.orientation === 'portrait'
  if (slot.kind === 'stack') return slot.photos[0]?.orientation === 'portrait'
  return false
}

/**
 * Divides a face between its slots.
 *
 * A page always carries two items, so the split direction has to follow their
 * shape: two landscapes stack as rows (each row is close to 3:2, so they fill
 * it), while two portraits sit side by side as columns. Splitting a pair of
 * portraits into rows would letterbox both of them into slivers.
 */
export function slotRects(face) {
  const slots = face.slots || []
  if (!slots.length) return []

  const full = slots.length === 1 || slots[0].kind === 'cover' || slots[0].kind === 'back-cover'
  if (full) return [{ slot: slots[0], ...CONTENT }]

  const columns = slots.every(slotIsPortrait)

  if (columns) {
    const w = (CONTENT.w - GAP) / 2
    // Nudge one up and the other down. Two portraits at identical heights read
    // as a grid; a small stagger reads as someone placing them.
    const stagger = CONTENT.h * 0.045
    return slots.slice(0, 2).map((slot, i) => ({
      slot,
      x: CONTENT.x + i * (w + GAP),
      y: CONTENT.y + (i === 0 ? 0 : stagger),
      w,
      h: CONTENT.h - stagger,
    }))
  }

  const h = (CONTENT.h - GAP) / 2
  return slots.slice(0, 2).map((slot, i) => ({
    slot, x: CONTENT.x, y: CONTENT.y + i * (h + GAP), w: CONTENT.w, h,
  }))
}

/** Fits a rect inside a box preserving aspect (contain). */
const contain = (box, aspect) => {
  let w = box.w
  let h = w / aspect
  if (h > box.h) { h = box.h; w = h * aspect }
  return { x: box.x + (box.w - w) / 2, y: box.y + (box.h - h) / 2, w, h }
}

function paper(ctx, seed) {
  paintPaper(ctx, FACE_W, FACE_H, PAPER, seed)
  const edge = ctx.createLinearGradient(0, 0, FACE_W * 0.18, 0)
  edge.addColorStop(0, 'rgba(0,0,0,0.10)')
  edge.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = edge
  ctx.fillRect(0, 0, FACE_W * 0.18, FACE_H)
}

function shadow(ctx, blur, alpha, dy = 6) {
  ctx.shadowColor = `rgba(0,0,0,${alpha})`
  ctx.shadowBlur = blur
  ctx.shadowOffsetY = dy
}
const noShadow = (ctx) => { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0 }

/** Draws `image` into `rect`, cropping to fill rather than letterboxing. */
function drawCover(ctx, image, rect) {
  const ia = image.naturalWidth / image.naturalHeight
  const ra = rect.w / rect.h
  let sw = image.naturalWidth
  let sh = image.naturalHeight
  if (ia > ra) sw = image.naturalHeight * ra
  else sh = image.naturalWidth / ra
  ctx.drawImage(
    image,
    (image.naturalWidth - sw) / 2, (image.naturalHeight - sh) / 2, sw, sh,
    rect.x, rect.y, rect.w, rect.h
  )
}

/**
 * Draws a print at an explicit rect: white border, soft shadow, and a degree
 * or two of rotation so the page never looks like a CSS grid.
 */
function drawPrintAt(ctx, image, fit, { tilt = 0, border = 0.045, color = '#ddd', cover = false } = {}) {
  const pad = Math.min(fit.w, fit.h) * border
  const cx = fit.x + fit.w / 2
  const cy = fit.y + fit.h / 2

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(tilt)
  ctx.translate(-cx, -cy)

  shadow(ctx, 26, 0.28, 8)
  ctx.fillStyle = '#fffdf8'
  ctx.fillRect(fit.x - pad, fit.y - pad, fit.w + pad * 2, fit.h + pad * 2.6) // deeper lower lip
  noShadow(ctx)

  if (image) {
    if (cover) drawCover(ctx, image, fit)
    else ctx.drawImage(image, fit.x, fit.y, fit.w, fit.h)
  } else {
    ctx.fillStyle = color
    ctx.fillRect(fit.x, fit.y, fit.w, fit.h)
  }

  // Slight sheen across the print.
  const g = ctx.createLinearGradient(fit.x, fit.y, fit.x + fit.w, fit.y + fit.h)
  g.addColorStop(0, 'rgba(255,255,255,0.10)')
  g.addColorStop(0.5, 'rgba(255,255,255,0)')
  g.addColorStop(1, 'rgba(0,0,0,0.06)')
  ctx.fillStyle = g
  ctx.fillRect(fit.x, fit.y, fit.w, fit.h)

  ctx.restore()
  return fit
}

/** Fits the print inside `box` by aspect, then draws it. */
function printedPhoto(ctx, image, box, aspect, opts = {}) {
  return drawPrintAt(ctx, image, contain(box, aspect), opts)
}

/** Word-wraps text and returns the number of lines drawn. */
function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = Infinity) {
  const paragraphs = String(text || '').split(/\n+/)
  let line = 0
  for (const para of paragraphs) {
    let current = ''
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const test = current ? `${current} ${word}` : word
      if (ctx.measureText(test).width > maxWidth && current) {
        if (line >= maxLines) return { lines: line, truncated: true }
        ctx.fillText(current, x, y + line * lineHeight)
        line++
        current = word
      } else {
        current = test
      }
    }
    if (current) {
      if (line >= maxLines) return { lines: line, truncated: true }
      ctx.fillText(current, x, y + line * lineHeight)
      line++
    }
    line += 0.35 // paragraph break
  }
  return { lines: line, truncated: false }
}

/** A postcard: handwritten chapter text, sized to sit in a normal photo slot. */
function postcard(ctx, box, slot, language, tilt = -0.012) {
  const card = contain(box, 1.5)
  const cx = card.x + card.w / 2
  const cy = card.y + card.h / 2

  ctx.save()
  ctx.translate(cx, cy); ctx.rotate(tilt); ctx.translate(-cx, -cy)

  shadow(ctx, 24, 0.26, 8)
  ctx.fillStyle = '#fdf8ec'
  ctx.fillRect(card.x, card.y, card.w, card.h)
  noShadow(ctx)

  ctx.strokeStyle = 'rgba(0,0,0,0.18)'
  ctx.lineWidth = 2
  ctx.strokeRect(card.x + 10, card.y + 10, card.w - 20, card.h - 20)

  // Divider and stamp box, as on the back of a real postcard.
  ctx.strokeStyle = 'rgba(0,0,0,0.10)'
  ctx.beginPath()
  ctx.moveTo(card.x + card.w * 0.62, card.y + 28)
  ctx.lineTo(card.x + card.w * 0.62, card.y + card.h - 28)
  ctx.stroke()
  ctx.strokeRect(card.x + card.w - 116, card.y + 28, 84, 100)
  ctx.save()
  ctx.font = `26px ${HAND}`
  ctx.fillStyle = 'rgba(0,0,0,0.28)'
  ctx.textAlign = 'center'
  ctx.fillText('POST', card.x + card.w - 74, card.y + 74)
  ctx.fillText('CARD', card.x + card.w - 74, card.y + 102)
  ctx.restore()

  const padX = card.x + 34
  let y = card.y + 76

  ctx.fillStyle = INK
  ctx.font = `700 52px ${HAND}`
  ctx.fillText(pick(slot.title, language), padX, y)
  y += 22

  ctx.strokeStyle = 'rgba(0,0,0,0.15)'
  ctx.beginPath(); ctx.moveTo(padX, y); ctx.lineTo(padX + 150, y); ctx.stroke()
  y += 52

  ctx.font = `36px ${HAND}`
  ctx.fillStyle = 'rgba(43,39,33,0.88)'
  const bodyWidth = card.w * 0.62 - 68
  const maxLines = Math.floor((card.h - (y - card.y) - 50) / 40)
  const { truncated } = wrapText(ctx, pick(slot.text, language), padX, y, bodyWidth, 40, maxLines)

  if (truncated) {
    ctx.font = `30px ${HAND}`
    ctx.fillStyle = 'rgba(43,39,33,0.5)'
    ctx.fillText(language === 'no' ? '… les mer' : '… read more', padX, card.y + card.h - 34)
  }

  ctx.restore()
  return card
}

/** A memo: a loose note clipped to the page, summarising what follows. */
function memo(ctx, box, slot, language) {
  const card = contain(box, 1.55)
  const cx = card.x + card.w / 2, cy = card.y + card.h / 2
  ctx.save()
  ctx.translate(cx, cy); ctx.rotate(0.014); ctx.translate(-cx, -cy)

  shadow(ctx, 22, 0.22, 7)
  ctx.fillStyle = '#fbf6e6'
  ctx.fillRect(card.x, card.y, card.w, card.h)
  noShadow(ctx)

  // Ruled lines, as on a notepad.
  ctx.strokeStyle = 'rgba(60,90,120,0.13)'
  ctx.lineWidth = 1.5
  for (let y = card.y + 104; y < card.y + card.h - 20; y += 46) {
    ctx.beginPath(); ctx.moveTo(card.x + 30, y); ctx.lineTo(card.x + card.w - 30, y); ctx.stroke()
  }

  ctx.fillStyle = INK
  ctx.font = `700 54px ${HAND}`
  ctx.fillText(pick(slot.title, language), card.x + 36, card.y + 74)

  ctx.font = `38px ${HAND}`
  ctx.fillStyle = 'rgba(43,39,33,0.86)'
  const maxLines = Math.floor((card.h - 150) / 46)
  wrapText(ctx, pick(slot.text, language), card.x + 36, card.y + 148, card.w - 72, 46, maxLines)

  const meta = slot.meta
  if (meta?.camera || meta?.dates) {
    ctx.font = `30px ${HAND_INK}`
    ctx.fillStyle = 'rgba(43,39,33,0.45)'
    const line = [pick(meta.camera, language), meta.dates?.start].filter(Boolean).join('  ·  ')
    ctx.fillText(line, card.x + 36, card.y + card.h - 26)
  }

  ctx.restore()
  return card
}

/** How many prints of a stack are drawn on the page. */
export const STACK_VISIBLE = 4

/**
 * A stack of photographs. Every sibling is drawn in the SAME frame as the top
 * print — only nudged and rotated — so their corners show past it and the pile
 * reads as a pile. Letting each sibling fit its own aspect would re-centre
 * them and produce a row of separate photos instead.
 */
function photoStack(ctx, box, slot, images, { offset = 0 } = {}) {
  const count = slot.photos.length
  const visible = Math.min(count, STACK_VISIBLE)
  const top = slot.photos[offset % count]

  // Leave room around the frame for the siblings to peek out of.
  const frame = contain({ x: box.x + 16, y: box.y + 14, w: box.w - 32, h: box.h - 34 }, top.aspect)

  for (let i = visible - 1; i >= 1; i--) {
    const sib = slot.photos[(offset + i) % count]
    const dir = i % 2 ? 1 : -1
    drawPrintAt(ctx, images.get(sib.src), {
      x: frame.x + dir * (7 + i * 6),
      y: frame.y + i * 6,
      w: frame.w,
      h: frame.h,
    }, { tilt: dir * (0.016 + i * 0.012), border: 0.03, color: sib.color, cover: true })
  }

  drawPrintAt(ctx, images.get(top.src), frame, {
    tilt: -0.006, border: 0.035, color: top.color, cover: true,
  })

  // Counter, written on the page rather than printed on the photo.
  ctx.save()
  ctx.font = `32px ${HAND}`
  ctx.fillStyle = 'rgba(43,39,33,0.55)'
  ctx.textAlign = 'right'
  ctx.fillText(`${count} photos —`, frame.x + frame.w + 6, frame.y + frame.h + 54)
  ctx.restore()

  return frame
}

/** Breaks text into lines that fit `maxWidth`, at the current font. */
function fitLines(ctx, text, maxWidth) {
  const lines = []
  let line = ''
  for (const word of String(text || '').split(/\s+/).filter(Boolean)) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

/**
 * The shade the boards and the binding are both painted, so a book is one
 * colour whichever face of it you are looking at.
 */
export const BOARD_SHADE = 0.12

function coverFace(ctx, slot, language, images, seed) {
  // Cloth-bound board, in the album's own colour so the board and the spine
  // you picked it out by are the same material.
  const cloth = slot.cloth || '#3d3730'
  paintCloth(ctx, FACE_W, FACE_H, shade(cloth, BOARD_SHADE), seed)

  // A board catches the light unevenly across its width.
  const g = ctx.createLinearGradient(0, 0, FACE_W, FACE_H)
  g.addColorStop(0, 'rgba(255,255,255,0.05)')
  g.addColorStop(0.55, 'rgba(0,0,0,0)')
  g.addColorStop(1, 'rgba(0,0,0,0.12)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, FACE_W, FACE_H)

  if (slot.photo) {
    printedPhoto(ctx, images.get(slot.photo.src), {
      x: MARGIN + 40, y: MARGIN + 90, w: CONTENT.w - 80, h: CONTENT.h * 0.62,
    }, slot.photo.aspect, { tilt: -0.014, border: 0.05, color: slot.photo.color })
  }

  ctx.save()
  ctx.textAlign = 'center'
  const maxWidth = CONTENT.w - 40

  // Title: shrink to fit rather than run off the board.
  ctx.fillStyle = slot.ink || '#f2ece0'
  let titleSize = 92
  const title = pick(slot.title, language)
  ctx.font = `700 ${titleSize}px ${HAND}`
  while (ctx.measureText(title).width > maxWidth && titleSize > 46) {
    titleSize -= 3
    ctx.font = `700 ${titleSize}px ${HAND}`
  }

  // Subtitle: wrapped, since a camera, a film stock and a date together are
  // routinely wider than the board and were being cut off at the edge.
  const sub = [pick(slot.subtitle, language), slot.dates?.start].filter(Boolean).join('   ·   ')
  ctx.font = `36px ${HAND}`
  const subLines = sub ? fitLines(ctx, sub, maxWidth) : []

  // Lay the block out from the bottom so extra lines push the title up
  // instead of overrunning the photograph.
  const subLineHeight = 44
  const bottom = FACE_H - 96
  const subTop = bottom - (subLines.length - 1) * subLineHeight

  ctx.globalAlpha = 0.62
  ctx.fillStyle = slot.ink || '#f2ece0'
  subLines.forEach((line, i) => ctx.fillText(line, FACE_W / 2, subTop + i * subLineHeight))

  ctx.globalAlpha = 1
  ctx.fillStyle = slot.ink || '#f2ece0'
  ctx.font = `700 ${titleSize}px ${HAND}`
  ctx.fillText(title, FACE_W / 2, subTop - 62)
  ctx.restore()
}

function backCoverFace(ctx, slot, language, seed) {
  const cloth = slot.cloth || '#3d3730'
  paintCloth(ctx, FACE_W, FACE_H, shade(cloth, BOARD_SHADE), seed)
  const g = ctx.createLinearGradient(0, 0, FACE_W, FACE_H)
  g.addColorStop(0, 'rgba(0,0,0,0.12)')
  g.addColorStop(1, 'rgba(255,255,255,0.04)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, FACE_W, FACE_H)
  ctx.save()
  ctx.textAlign = 'center'
  ctx.font = `40px ${HAND_INK}`
  ctx.globalAlpha = 0.34
  ctx.fillStyle = slot.ink || '#f2ece0'
  ctx.fillText(pick(slot.title, language), FACE_W / 2, FACE_H - 120)
  ctx.restore()
}

/**
 * Paints a face. `images` is a Map of src -> HTMLImageElement for whatever has
 * loaded so far; anything missing falls back to its average colour, so a face
 * is always drawable and simply sharpens as textures arrive.
 */
export function paintFace(
  canvas,
  face,
  { language = 'en', images = new Map(), stackOffsets = {}, scale = 1 } = {}
) {
  const ctx = canvas.getContext('2d')
  // Everything below draws in the same coordinate system whatever the scale,
  // so a cheaper texture is one number rather than a second layout pass.
  canvas.width = Math.round(FACE_W * scale)
  canvas.height = Math.round(FACE_H * scale)
  ctx.setTransform(scale, 0, 0, scale, 0, 0)
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'

  // Seeded from the face itself, so its grain is the same every repaint.
  const seed = seedFrom(face.role + (face.slots?.[0]?.src || face.slots?.[0]?.kind || '') + (face.slots?.length ?? 0))

  const first = face.slots?.[0]
  if (first?.kind === 'cover') { coverFace(ctx, first, language, images, seed); return [] }
  if (first?.kind === 'back-cover') { backCoverFace(ctx, first, language, seed); return [] }

  paper(ctx, seed)

  const rects = slotRects(face)
  const hitboxes = []

  rects.forEach(({ slot, x, y, w, h }, i) => {
    const box = { x, y, w, h }
    let drawn
    if (slot.kind === 'photo') {
      drawn = printedPhoto(ctx, images.get(slot.src), box, slot.aspect, {
        tilt: (i % 2 ? 1 : -1) * 0.008, color: slot.color,
      })
    } else if (slot.kind === 'postcard') {
      drawn = postcard(ctx, box, slot, language, (i % 2 ? 1 : -1) * 0.012)
    } else if (slot.kind === 'memo') {
      drawn = memo(ctx, box, slot, language)
    } else if (slot.kind === 'stack') {
      drawn = photoStack(ctx, box, slot, images, { offset: stackOffsets[i] || 0 })
    }
    if (drawn) hitboxes.push({ index: i, slot, rect: drawn })
  })

  return hitboxes
}

/** Every image source a face needs, in draw order. */
export function faceSources(face) {
  const out = []
  for (const slot of face.slots || []) {
    if (slot.kind === 'photo') out.push(slot)
    else if (slot.kind === 'cover' && slot.photo) out.push(slot.photo)
    else if (slot.kind === 'stack') out.push(...slot.photos.slice(0, STACK_VISIBLE))
  }
  return out
}
