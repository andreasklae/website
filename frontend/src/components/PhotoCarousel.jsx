import { useEffect, useRef, useState, useMemo } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { getAssetPath } from '../utils/paths'

// Reusable in-page photo carousel used across photography pages
// Props:
// - images: string[] (relative or absolute)
// - title: string (optional)
// - showTitle: boolean (default true)
// - showAutoSkip: boolean (default true)
// - showCounter: boolean (default true)
// - durationMs: number (default 5000)
// - heightClass: string (tailwind classes for height)
// - objectFit: 'contain' | 'cover' (default 'contain')
// - className: string
export default function PhotoCarousel({
  images = [],
  title = '',
  showTitle = true,
  showAutoSkip = true,
  showCounter = true,
  durationMs = 5000,
  heightClass = 'h-[68vh] sm:h-[70vh] md:h-[70vh]',
  objectFit = 'contain',
  className = ''
}) {
  const { getText } = useLanguage()
  const [index, setIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)
  const [progress, setProgress] = useState(0)
  const touchStartX = useRef(null)

  // Resolve image URLs safely to avoid double-encoding
  const urls = useMemo(() => {
    return (images || []).map((p) => {
      const s = String(p || '')
      if (s.startsWith('/') || s.startsWith('http') || s.startsWith('data:')) return s
      return getAssetPath(s)
    })
  }, [images])

  useEffect(() => { if (index >= urls.length) setIndex(0) }, [urls.length, index])

  // Autoplay ticker
  useEffect(() => {
    if (!urls.length) return
    if (!autoPlay) return
    const DURATION = Math.max(1200, Number(durationMs) || 5000)
    const startAt = performance.now() - progress * DURATION
    const tick = () => {
      const now = performance.now()
      const p = Math.min(1, (now - startAt) / DURATION)
      setProgress(p)
      if (p >= 1) {
        setProgress(0)
        setIndex((prev) => (prev === urls.length - 1 ? 0 : prev + 1))
      }
    }
    const id = setInterval(tick, 100)
    return () => clearInterval(id)
  }, [index, urls.length, autoPlay, durationMs])

  const previous = () => { setProgress(0); setIndex((prev) => (prev === 0 ? urls.length - 1 : prev - 1)) }
  const next = () => { setProgress(0); setIndex((prev) => (prev === urls.length - 1 ? 0 : prev + 1)) }

  if (!urls || urls.length === 0) return null

  return (
    <div className={`select-none ${className}`}>
      {/* Header row: Title → x/n → Auto-skip */}
      <div className="flex items-center gap-3 sm:gap-4 mb-2">
        {showTitle && !!title && (
          <h3 className="flex-1 min-w-0 truncate text-xl md:text-2xl lg:text-3xl font-bold" style={{ fontFamily: 'Georgia, Cambria, \"Times New Roman\", Times, serif' }}>
            {title}
          </h3>
        )}
        {showCounter && (
          <span className="hidden md:inline text-sm md:text-base font-semibold bg-white/70 px-2 py-0.5 rounded" aria-live="polite">
            {index + 1} / {urls.length}
          </span>
        )}
        {showAutoSkip && (
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <span className="text-sm md:text-base">{getText({ en: 'Auto skip', no: 'Auto-hopp' })}</span>
            <input
              type="checkbox"
              className="h-5 w-5 sm:h-6 sm:w-6 border border-black accent-black"
              checked={autoPlay}
              onChange={(e) => setAutoPlay(e.target.checked)}
              aria-label={getText({ en: 'Toggle autoplay', no: 'Slå på/av automatisk avspilling' })}
            />
          </label>
        )}
      </div>

      {/* Progress bars */}
      <div className="flex gap-1 mb-2">
        {urls.map((_, i) => {
          const w = i < index ? 1 : i === index ? (autoPlay ? progress : 1) : 0
          return (
            <div key={i} className="flex-1 h-1 bg-black/20 rounded-full overflow-hidden">
              <div className="h-full bg-black" style={{ width: `${Math.max(0, Math.min(1, w)) * 100}%`, transition: 'width 100ms linear' }} />
            </div>
          )
        })}
      </div>

      {/* Image frame */}
      <div className="relative border border-black bg-white p-2 sm:p-3 md:p-4">
        <div
          className={`w-full ${heightClass} flex items-center justify-center overflow-hidden`}
          onTouchStart={(e) => (touchStartX.current = e.changedTouches?.[0]?.clientX ?? null)}
          onTouchEnd={(e) => {
            const endX = e.changedTouches?.[0]?.clientX ?? null
            if (touchStartX.current == null || endX == null) return
            const dx = endX - touchStartX.current
            if (Math.abs(dx) > 40) { if (dx < 0) next(); else previous() }
            touchStartX.current = null
          }}
        >
          <img
            key={index}
            src={urls[index]}
            alt={`${title || 'Image'} ${index + 1}`}
            className={`max-w-full max-h-full object-${objectFit} block`}
            loading="eager"
          />
        </div>

        {/* Controls */}
        {urls.length > 1 && (
          <>
            <button
              onClick={previous}
              aria-label="Previous image"
              className="absolute left-0 top-1/2 -translate-y-1/2 h-full px-4 text-3xl md:text-4xl hover:bg-black/5 active:bg-black/10 z-30"
            >
              ‹
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-0 top-1/2 -translate-y-1/2 h-full px-4 text-3xl md:text-4xl hover:bg-black/5 active:bg-black/10 z-30"
            >
              ›
            </button>
            {/* Mobile tap zones */}
            <button onClick={previous} className="md:hidden absolute left-0 top-0 bottom-0 w-1/2 opacity-0 z-10" aria-hidden="true" tabIndex={-1} />
            <button onClick={next} className="md:hidden absolute right-0 top-0 bottom-0 w-1/2 opacity-0 z-10" aria-hidden="true" tabIndex={-1} />
          </>
        )}
      </div>
    </div>
  )
}
