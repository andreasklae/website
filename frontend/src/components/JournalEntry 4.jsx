import { useMemo, useEffect, useRef, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import PhotoCarousel from './PhotoCarousel'
import { getAssetPath } from '../utils/paths'

// Descriptive text: fade in + move up when entering viewport
function AnimatedText({ children }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      className="transition-all duration-700"
      style={{ transform: visible ? 'translateY(0)' : 'translateY(12px)', opacity: visible ? 1 : 0 }}
    >
      {children}
    </div>
  )
}

function AnimatedIn({ children }) {
  return (
    <div className="transition-all duration-500" style={{ transform: 'translateY(0)', opacity: 1 }}>
      {children}
    </div>
  )
}

function sortPhotosByNameDate(list = []) {
  const parse = (src) => {
    try {
      const name = String(src).split('/').pop() || ''
      const m = name.match(/(20\d{2})[-_]?([01]\d)[-_]?([0-3]\d)(?:[-_]?([0-2]\d)([0-5]\d)([0-5]\d))?/)
      if (!m) return 0
      const [_, y, mo, d, h = '00', mi = '00', s = '00'] = m
      const dt = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s))
      return dt.getTime() || 0
    } catch { return 0 }
  }
  return [...list].sort((a, b) => {
    const da = parse(a)
    const db = parse(b)
    if (da && db) return da - db
    if (da) return -1
    if (db) return 1
    return String(a).localeCompare(String(b))
  })
}

function PreviewGrid({ photos, onOpen, title }) {
  // Responsive columns based on viewport width (keep it simple here)
  const cols = useMemo(() => {
    if (typeof window === 'undefined') return 2
    const w = window.innerWidth
    if (w < 768) return 2
    // Cap grid at max 3 columns on larger screens
    return 3
  }, [])

  const frames = Math.max(2, cols * 2)
  const needsOverlay = photos.length > frames
  const visible = needsOverlay ? photos.slice(0, frames - 1) : photos.slice(0, frames)

  return (
    <div>
      <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {visible.map((src, i) => (
          <button
            key={i}
            type="button"
            className="aspect-square bg-white border border-black overflow-hidden cursor-pointer group"
            onClick={() => onOpen(i)}
          >
            <img src={src} alt={`${title} ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </button>
        ))}
        {needsOverlay && (
          <button onClick={() => onOpen(frames - 1)} className="relative aspect-square border border-black bg-white group" type="button">
            <img src={photos[frames - 1]} alt={`${title} more`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gray-200/70 flex items-center justify-center">
              <span className="text-xl md:text-2xl font-bold text-black">+{photos.length - (frames - 1)}</span>
            </div>
          </button>
        )}
      </div>
    </div>
  )
}

export default function JournalEntry({
  story,
  getText,
  getHeroImages,
  getPartContent,
  getChapterHero, // optional: returns { main, extras: [] } per chapter
  meta, // optional: { dates: {start,end}, camera: {en,no} }
  onOpenGallery
}) {
  if (!story) return null

  const { language } = useLanguage()
  const hero = (getHeroImages?.(story) || [])

  const formatOrdinalEn = (n) => {
    const v = Number(n) || 0
    const teen = v % 100
    if (teen >= 11 && teen <= 13) return `${v}th`
    switch (v % 10) {
      case 1: return `${v}st`
      case 2: return `${v}nd`
      case 3: return `${v}rd`
      default: return `${v}th`
    }
  }
  const formatDateHuman = (iso) => {
    if (!iso) return ''
    const locale = language === 'no' ? 'no-NO' : 'en-US'
    const monthYearMatch = typeof iso === 'string' ? iso.match(/^(\d{4})-(\d{2})$/) : null
    if (monthYearMatch) {
      const [_, year, month] = monthYearMatch
      const d = new Date(Number(year), Number(month) - 1, 1)
      if (Number.isNaN(d.getTime())) return iso
      const formatted = d.toLocaleString(locale, { month: 'long', year: 'numeric' })
      if (language === 'no') {
        return formatted.charAt(0).toUpperCase() + formatted.slice(1)
      }
      return formatted
    }
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    const day = d.getDate()
    const year = d.getFullYear()
    if (language === 'no') {
      const month = d.toLocaleString(locale, { month: 'long' })
      const capMonth = month.charAt(0).toUpperCase() + month.slice(1)
      return `${day}. ${capMonth} ${year}`
    } else {
      const month = d.toLocaleString(locale, { month: 'long' })
      return `${formatOrdinalEn(day)} of ${month} ${year}`
    }
  }

  return (
    <div>
      {/* Header */}
      <header className="text-center select-none mb-10">
        <div className="border-y border-black py-4 mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight px-2" style={{ fontFamily: 'Georgia, Cambria, \"Times New Roman\", Times, serif' }}>
            {getText(story.title).toUpperCase()}
          </h1>
        </div>
        <p className="text-lg md:text-xl italic" style={{ fontFamily: 'Georgia, Cambria, \"Times New Roman\", Times, serif' }}>
          {getText(story.description)}
        </p>
        {meta && (
          <div className="mt-2 text-sm md:text-base text-black/80" style={{ fontFamily: 'Georgia, Cambria, \"Times New Roman\", Times, serif' }}>
            <div>{formatDateHuman(meta.dates?.start)} – {formatDateHuman(meta.dates?.end)}</div>
            <div>{getText(meta.camera || { en: '', no: '' })}</div>
          </div>
        )}
      </header>

      {/* Top-level Highlights carousel (optional) */}
      {hero.length > 0 && (
        <div className="mb-10">
          <PhotoCarousel
            images={hero}
            title={getText({ en: 'Highlights', no: 'Høydepunkter' })}
            showTitle={true}
            heightClass="h-[55vh] sm:h-[55vh] md:h-[60vh]"
            objectFit="contain"
          />
        </div>
      )}

      {/* Chapters */}
      {(story.parts || []).map((p, idx) => {
        const { description, photos } = getPartContent?.(story, p) || { description: '', photos: [] }
        const chapterRoot = (p.photos || '').replace(/photos\/?$/i, '')
        const defaultMain = chapterRoot ? getAssetPath(`${chapterRoot}main.jpeg`) : null
        const hero = getChapterHero ? (getChapterHero(story, p) || null) : null
        const mainImage = hero?.main || defaultMain
        const extras = Array.isArray(hero?.extras) ? hero.extras : []
        const gridPhotos = extras.length ? photos.filter((src) => !extras.includes(src)) : photos

        return (
          <section key={p.id} className="mt-14">
            <AnimatedIn>
              <div className="text-center mb-6">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ fontFamily: 'Georgia, Cambria, \"Times New Roman\", Times, serif' }}>
                  {getText({ en: `Chapter ${idx + 1}: `, no: `Del ${idx + 1}: ` })}{getText(p.title)}
                </h2>
              </div>
            </AnimatedIn>

            {mainImage && (
              <AnimatedIn>
                <div className="w-full mb-8">
                  <div className="w-full flex items-center justify-center">
                    <img
                      src={mainImage}
                      alt={`${getText(p.title)} – main`}
                      className="w-auto max-w-full h-auto max-h-[75vh] object-contain"
                    />
                  </div>
                </div>
              </AnimatedIn>
            )}

            {extras && extras.length > 0 && (
              <div className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  {extras.slice(0, 2).map((src, i) => (
                    <div key={i} className="w-full flex items-center justify-center">
                      <img
                        src={src}
                        alt={`${getText(p.title)} – extra ${i + 1}`}
                        className="w-auto max-w-full h-auto max-h-[75vh] object-contain border border-black"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {description && (
              <div className="max-w-3xl mx-auto mt-8">
                <AnimatedText>
                  <p className="text-2xl md:text-3xl leading-relaxed whitespace-pre-line text-center" style={{ fontFamily: 'Georgia, Cambria, \"Times New Roman\", Times, serif' }}>
                    {description}
                  </p>
                </AnimatedText>
              </div>
            )}

            {gridPhotos && gridPhotos.length > 0 && (
              <div className="mt-8">
                <AnimatedIn>
                  <h3 className="text-xl md:text-2xl font-bold mb-4" style={{ fontFamily: 'Georgia, Cambria, \"Times New Roman\", Times, serif' }}>
                    {getText({ en: 'Gallery', no: 'Galleri' })}
                  </h3>
                </AnimatedIn>
                <AnimatedIn>
                  <PreviewGrid
                    photos={sortPhotosByNameDate(gridPhotos)}
                    onOpen={(startAt = 0) => {
                      const sorted = sortPhotosByNameDate(gridPhotos)
                      onOpenGallery?.(sorted, `${getText(story.title)} - ${getText(p.title)}`, startAt)
                    }}
                    title={getText(p.title)}
                  />
                </AnimatedIn>
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
