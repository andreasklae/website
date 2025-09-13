import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { photographyHighlights, photographyStories } from '../utils/data.jsx'
import { getAssetPath } from '../utils/paths'

const PhotographyPage = () => {
  const { getText } = useLanguage()
  const [index, setIndex] = useState(0)
  const [images, setImages] = useState([])
  const touchStartX = useRef(null)
  const [autoPlay, setAutoPlay] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Load highlights from generated manifest; fallback to static list
    const load = async () => {
      try {
        const res = await fetch(getAssetPath('content/photography-highlights.json'), { cache: 'no-store' })
        if (!res.ok) throw new Error('No manifest')
        const list = await res.json()
        const urls = (Array.isArray(list) ? list : []).map((p) => getAssetPath(p))
        if (urls.length) {
          setImages(urls)
          setIndex(0)
          return
        }
        setImages(photographyHighlights || [])
      } catch {
        setImages(photographyHighlights || [])
      }
    }
    load()
  }, [])

  useEffect(() => {
    // Clamp index if images change
    if (index >= images.length) setIndex(0)
  }, [images.length, index])

  // Autoplay progress and advance logic (5s per image) with interval for smoother, reliable updates
  useEffect(() => {
    if (!images.length) return
    if (!autoPlay) return
    const DURATION = 5000
    const startAt = performance.now() - progress * DURATION

    const tick = () => {
      const now = performance.now()
      const p = Math.min(1, (now - startAt) / DURATION)
      setProgress(p)
      if (p >= 1) {
        setProgress(0)
        setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
      }
    }

    const id = setInterval(tick, 100)
    return () => clearInterval(id)
  }, [index, images.length, autoPlay])

  const previous = () => {
    setProgress(0)
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }
  const next = () => {
    setProgress(0)
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const shortDescription = getText({
    en: 'Selected photographs and journal entries.',
    no: 'Utvalgte fotografier og journalnotater.'
  })

  const picksTitle = getText({ en: 'Selected Work', no: 'Utvalgt arbeid' })
  const journalTitle = getText({ en: 'Journal', no: 'Journal' })

  return (
    <div className="min-h-screen bg-white text-black animate-page-enter font-serif">
      <div className="max-w-6xl mx-auto px-6 pt-32 lg:pt-40 pb-20">
        {/* Newspaper Header */}
        <header className="text-center select-none">
          <div className="border-y border-black py-4 mb-8">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight px-2" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}>
              {getText({ en: 'Photography', no: 'Foto' }).toUpperCase()}
            </h1>
          </div>
          <p className="text-lg md:text-xl italic" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}>
            {shortDescription}
          </p>
        </header>

        {/* Editor's Picks - In-page carousel (no image edits) */}
        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}>{picksTitle}</h2>
            <div className="flex items-center gap-6 basis-full sm:basis-auto">
              {images.length > 0 && (
                <span className="text-base md:text-lg font-semibold" aria-live="polite">{index + 1} / {images.length}</span>
              )}
              <div className="flex items-center gap-3">
                <span className="text-base md:text-lg font-medium select-none">{getText({ en: 'Auto skip', no: 'Auto-hopp' })}</span>
                <input
                  id="auto-skip"
                  type="checkbox"
                  className="h-5 w-5 sm:h-6 sm:w-6 border border-black accent-black cursor-pointer"
                  checked={autoPlay}
                  onChange={(e) => setAutoPlay(e.target.checked)}
                  aria-label={getText({ en: 'Toggle autoplay', no: 'Slå på/av automatisk avspilling' })}
                />
              </div>
            </div>
          </div>

          <div
            className="relative border border-black bg-white select-none p-2 sm:p-3 md:p-4"
            onTouchStart={(e) => (touchStartX.current = e.changedTouches?.[0]?.clientX ?? null)}
            onTouchEnd={(e) => {
              const endX = e.changedTouches?.[0]?.clientX ?? null
              if (touchStartX.current == null || endX == null) return
              const dx = endX - touchStartX.current
              if (Math.abs(dx) > 40) {
                if (dx < 0) next()
                else previous()
              }
              touchStartX.current = null
            }}
          >
            {/* Story-style progress bars */}
            {images.length > 0 && (
              <>
                <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-white/70 to-transparent z-10 pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 z-20 p-3 flex gap-1 pointer-events-none">
                  {images.map((_, i) => {
                    const w = i < index ? 1 : i === index ? progress : 0
                    return (
                      <div key={i} className="flex-1 h-1 bg-black/20">
                        <div className="h-full bg-black" style={{ width: `${Math.max(0, Math.min(1, w)) * 100}%`, transition: 'width 100ms linear' }} />
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* Image frame - fixed height (leaves room for title). Allow a bit more height on phones */}
            <div className="w-full h-[68vh] sm:h-[70vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
              {images.length > 0 && (
                <img
                  key={index}
                  src={images[index]}
                  alt={`Highlight ${index + 1}`}
                  className="max-w-full max-h-full object-contain block"
                  loading="eager"
                />
              )}
            </div>

            {/* Controls */}
            {images.length > 1 && (
              <>
                <button
                  onClick={previous}
                  aria-label={getText({ en: 'Previous image', no: 'Forrige bilde' })}
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-full px-4 text-3xl md:text-4xl hover:bg-black/5 active:bg-black/10 z-30"
                >
                  ‹
                </button>
                <button
                  onClick={next}
                  aria-label={getText({ en: 'Next image', no: 'Neste bilde' })}
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-full px-4 text-3xl md:text-4xl hover:bg-black/5 active:bg-black/10 z-30"
                >
                  ›
                </button>
                {/* Mobile tap zones (left/right halves to navigate) */}
                <button
                  onClick={previous}
                  className="md:hidden absolute left-0 top-0 bottom-0 w-1/2 opacity-0 z-10"
                  aria-hidden="true"
                  tabIndex={-1}
                />
                <button
                  onClick={next}
                  className="md:hidden absolute right-0 top-0 bottom-0 w-1/2 opacity-0 z-10"
                  aria-hidden="true"
                  tabIndex={-1}
                />
              </>
            )}
          </div>
        </section>

        {/* Journal / Stories */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}>{journalTitle}</h2>
            <div className="h-px flex-1 bg-black ml-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {photographyStories.map((story) => (
              <article key={story.id} className="border border-black">
                <Link to={`/photography/${story.id}`} className="block group">
                  <div className="aspect-[3/2] overflow-hidden bg-white">
                    <img
                      src={story.coverImage}
                      alt={getText(story.title)}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}>
                      {getText(story.title)}
                    </h3>
                    <p className="text-base leading-relaxed line-clamp-3" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}>
                      {getText(story.description)}
                    </p>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {/* Placeholder for future stories */}
          {photographyStories.length < 2 && (
            <div className="mt-8 text-sm text-black/70" style={{ fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' }}>
              {getText({ en: 'More entries coming soon.', no: 'Flere innlegg kommer snart.' })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default PhotographyPage
