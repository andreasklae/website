/**
 * Procedural cloth and paper.
 *
 * Everything here is seeded rather than using Math.random: faces are repainted
 * when their photographs arrive and when the language changes, and unseeded
 * noise would reshuffle the grain underneath you each time.
 */

/** Small, fast, deterministic PRNG (mulberry32). */
export function seeded(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const seedFrom = (text) => {
  let h = 2166136261
  for (let i = 0; i < String(text).length; i++) {
    h ^= String(text).charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const parse = (hex) => {
  const n = parseInt(String(hex).replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Moves a hex colour toward black (positive) or white (negative). */
export function shade(hex, amount) {
  const c = parse(hex).map((v) =>
    Math.max(0, Math.min(255, Math.round(amount >= 0 ? v * (1 - amount) : v + (255 - v) * -amount)))
  )
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`
}

/**
 * Bookbinding cloth: a woven grid, irregular slubs where threads bunch, and
 * wear along the edges where a book is handled.
 */
export function paintCloth(ctx, w, h, colour, seed = 1) {
  const rnd = seeded(seed)

  ctx.fillStyle = colour
  ctx.fillRect(0, 0, w, h)

  // The weave: a fine grid, each line varying slightly in strength so it
  // reads as thread rather than as a screen.
  ctx.save()
  const pitch = Math.max(3, Math.round(w / 260))
  for (let x = 0; x < w; x += pitch) {
    ctx.globalAlpha = 0.05 + rnd() * 0.07
    ctx.fillStyle = rnd() > 0.5 ? '#ffffff' : '#000000'
    ctx.fillRect(x, 0, 1, h)
  }
  for (let y = 0; y < h; y += pitch) {
    ctx.globalAlpha = 0.05 + rnd() * 0.07
    ctx.fillStyle = rnd() > 0.5 ? '#ffffff' : '#000000'
    ctx.fillRect(0, y, w, 1)
  }
  ctx.restore()

  // Slubs: short thickenings in the thread, scattered.
  ctx.save()
  for (let i = 0; i < (w * h) / 5000; i++) {
    const x = rnd() * w
    const y = rnd() * h
    const long = rnd() > 0.5
    ctx.globalAlpha = 0.03 + rnd() * 0.05
    ctx.fillStyle = rnd() > 0.45 ? '#000000' : '#ffffff'
    ctx.fillRect(x, y, long ? pitch * (2 + rnd() * 6) : pitch, long ? pitch : pitch * (2 + rnd() * 6))
  }
  ctx.restore()

  // Broad mottling, so the colour is never perfectly flat.
  ctx.save()
  for (let i = 0; i < 26; i++) {
    const r = (0.12 + rnd() * 0.3) * Math.max(w, h)
    const g = ctx.createRadialGradient(rnd() * w, rnd() * h, 0, rnd() * w, rnd() * h, r)
    const dark = rnd() > 0.5
    g.addColorStop(0, dark ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.035)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  }
  ctx.restore()

  // Edge wear: boards rub pale along their borders before anywhere else.
  ctx.save()
  const edge = Math.min(w, h) * 0.05
  const sides = [
    [0, 0, edge, h, 'left'], [w - edge, 0, edge, h, 'right'],
    [0, 0, w, edge, 'top'], [0, h - edge, w, edge, 'bottom'],
  ]
  for (const [x, y, ww, hh, which] of sides) {
    const horizontal = which === 'left' || which === 'right'
    const g = ctx.createLinearGradient(
      x, y,
      horizontal ? x + (which === 'left' ? ww : -ww) : x,
      horizontal ? y : y + (which === 'top' ? hh : -hh)
    )
    g.addColorStop(0, 'rgba(255,255,255,0.09)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(x, y, ww, hh)
  }
  ctx.restore()
}

/**
 * Album paper: laid fibres, a warm uneven tone, and a little foxing. Flat
 * cream reads as plastic; what makes paper look like paper is that no two
 * square inches of it are the same.
 */
export function paintPaper(ctx, w, h, base, seed = 1) {
  const rnd = seeded(seed)

  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)

  // Uneven tone across the sheet.
  ctx.save()
  for (let i = 0; i < 22; i++) {
    const r = (0.15 + rnd() * 0.4) * Math.max(w, h)
    const cx = rnd() * w
    const cy = rnd() * h
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    g.addColorStop(0, rnd() > 0.5 ? 'rgba(120,100,70,0.035)' : 'rgba(255,255,255,0.05)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  }
  ctx.restore()

  // Laid lines: the faint ribbing of the mould paper was made on.
  ctx.save()
  ctx.globalAlpha = 0.022
  ctx.fillStyle = '#6b5f4a'
  for (let y = 0; y < h; y += 9) ctx.fillRect(0, y, w, 1)
  ctx.restore()

  // Fibres: short pale and dark hairs pressed into the sheet.
  ctx.save()
  for (let i = 0; i < (w * h) / 900; i++) {
    const x = rnd() * w
    const y = rnd() * h
    const len = 2 + rnd() * 9
    const angle = rnd() * Math.PI
    ctx.globalAlpha = 0.03 + rnd() * 0.05
    ctx.strokeStyle = rnd() > 0.42 ? '#8d8064' : '#ffffff'
    ctx.lineWidth = rnd() > 0.8 ? 1.4 : 0.8
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len)
    ctx.stroke()
  }
  ctx.restore()

  // Foxing: the odd faint age spot.
  ctx.save()
  for (let i = 0; i < 14; i++) {
    const r = 2 + rnd() * 9
    const cx = rnd() * w
    const cy = rnd() * h
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    g.addColorStop(0, 'rgba(150,120,78,0.07)')
    g.addColorStop(1, 'rgba(150,120,78,0)')
    ctx.fillStyle = g
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
  }
  ctx.restore()
}

/**
 * Sawn timber: growth rings running the length of the board, darker latewood
 * bands, the odd knot, and a little wear where hands and books have been.
 */
export function paintWood(ctx, w, h, base, seed = 1) {
  const rnd = seeded(seed)

  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)

  // Growth rings, drifting as they run so the grain is never mechanical.
  const rings = Math.round(h / 7)
  for (let i = 0; i < rings; i++) {
    const y0 = rnd() * h
    const drift = (rnd() - 0.5) * h * 0.12
    const weight = 0.6 + rnd() * 2.6
    ctx.globalAlpha = 0.03 + rnd() * 0.07
    ctx.strokeStyle = rnd() > 0.35 ? '#3a2312' : '#c39a68'
    ctx.lineWidth = weight
    ctx.beginPath()
    ctx.moveTo(0, y0)
    // Two arcs give a plausible cathedral figure without any real cost.
    ctx.bezierCurveTo(w * 0.3, y0 + drift, w * 0.7, y0 - drift, w, y0 + drift * 0.4)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  // Latewood: broader, darker bands between the rings.
  for (let i = 0; i < Math.round(h / 90); i++) {
    const y0 = rnd() * h
    const g = ctx.createLinearGradient(0, y0 - 14, 0, y0 + 14)
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(0.5, 'rgba(58,35,18,0.13)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, y0 - 14, w, 28)
  }

  // A knot or two, with the grain sweeping around them.
  for (let i = 0; i < (rnd() > 0.5 ? 1 : 2); i++) {
    const cx = rnd() * w
    const cy = rnd() * h
    const r = 6 + rnd() * 14
    for (let k = 0; k < 7; k++) {
      ctx.globalAlpha = 0.1 - k * 0.012
      ctx.strokeStyle = '#3a2312'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.ellipse(cx, cy, r + k * 3.5, r * 0.6 + k * 2, rnd() * 0.4, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.globalAlpha = 0.22
    ctx.fillStyle = '#2c1a0d'
    ctx.beginPath()
    ctx.ellipse(cx, cy, r * 0.55, r * 0.34, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Wear: lighter where things have been slid across it.
  for (let i = 0; i < 10; i++) {
    const cx = rnd() * w
    const cy = rnd() * h
    const r = (0.08 + rnd() * 0.22) * Math.max(w, h)
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    g.addColorStop(0, rnd() > 0.5 ? 'rgba(255,240,215,0.05)' : 'rgba(0,0,0,0.05)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  }
}

/** Painted plaster: flat, with just enough unevenness to catch a lamp. */
export function paintPlaster(ctx, w, h, base, seed = 1) {
  const rnd = seeded(seed)
  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)

  for (let i = 0; i < 40; i++) {
    const cx = rnd() * w
    const cy = rnd() * h
    const r = (0.1 + rnd() * 0.35) * Math.max(w, h)
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    g.addColorStop(0, rnd() > 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.03)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  }

  ctx.globalAlpha = 0.025
  for (let i = 0; i < (w * h) / 1400; i++) {
    ctx.fillStyle = rnd() > 0.5 ? '#ffffff' : '#000000'
    ctx.fillRect(rnd() * w, rnd() * h, 2, 2)
  }
  ctx.globalAlpha = 1
}
