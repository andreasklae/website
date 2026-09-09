// Handwriting used across the album. Loaded once and awaited before any face
// is composited, because canvas fillText silently falls back to a system font
// if the face is not ready — and that fallback would be baked into a texture.

const GOOGLE_FONTS =
  'https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Homemade+Apple&display=swap'

export const HAND = "'Caveat', 'Bradley Hand', cursive"
export const HAND_INK = "'Homemade Apple', 'Caveat', cursive"

let ready = null

export function ensureFonts() {
  if (ready) return ready

  ready = (async () => {
    if (typeof document === 'undefined') return
    if (!document.querySelector('link[data-album-fonts]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = GOOGLE_FONTS
      link.setAttribute('data-album-fonts', '')
      document.head.appendChild(link)
    }
    try {
      // Explicitly load the sizes we draw at; document.fonts.ready alone does
      // not guarantee a lazily-subsetted webfont has been fetched.
      await Promise.all([
        document.fonts.load("700 96px 'Caveat'"),
        document.fonts.load("400 48px 'Caveat'"),
        document.fonts.load("400 40px 'Homemade Apple'"),
      ])
      await document.fonts.ready
    } catch {
      // Offline or blocked: the cursive fallback still reads as handwriting.
    }
  })()

  return ready
}
