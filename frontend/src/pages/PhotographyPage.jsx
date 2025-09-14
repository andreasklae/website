import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { photographyHighlights, photographyStories } from '../utils/data.jsx'
import { getAssetPath } from '../utils/paths'
import PhotoCarousel from '../components/PhotoCarousel'

const PhotographyPage = () => {
  const { getText } = useLanguage()
  const [images, setImages] = useState([])

  useEffect(() => {
    // Load highlights from generated manifest; fallback to static list
    const load = async () => {
      try {
        const res = await fetch(getAssetPath('content/photography-highlights.json'), { cache: 'no-store' })
        if (!res.ok) throw new Error('No manifest')
        const list = await res.json()
        const urls = (Array.isArray(list) ? list : []).map((p) => getAssetPath(p))
        if (urls.length) { setImages(urls); return }
        setImages(photographyHighlights || [])
      } catch {
        setImages(photographyHighlights || [])
      }
    }
    load()
  }, [])

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
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight px-2" style={{ fontFamily: 'Georgia, Cambria, \"Times New Roman\", Times, serif' }}>
              {getText({ en: 'Photography', no: 'Foto' }).toUpperCase()}
            </h1>
          </div>
          <p className="text-lg md:text-xl italic" style={{ fontFamily: 'Georgia, Cambria, \"Times New Roman\", Times, serif' }}>
            {shortDescription}
          </p>
        </header>

        {/* Editor's Picks - Shared carousel */}
        <section className="mt-12">
          <PhotoCarousel images={images} title={picksTitle} showTitle={true} />
        </section>

        {/* Journal / Stories */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Georgia, Cambria, \"Times New Roman\", Times, serif' }}>{journalTitle}</h2>
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
                    <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ fontFamily: 'Georgia, Cambria, \"Times New Roman\", Times, serif' }}>
                      {getText(story.title)}
                    </h3>
                    <p className="text-base leading-relaxed line-clamp-3" style={{ fontFamily: 'Georgia, Cambria, \"Times New Roman\", Times, serif' }}>
                      {getText(story.description)}
                    </p>
                  </div>
                </Link>
              </article>
            ))}
          </div>

          {/* Placeholder for future stories */}
          {photographyStories.length < 2 && (
            <div className="mt-8 text-sm text-black/70" style={{ fontFamily: 'Georgia, Cambria, \"Times New Roman\", Times, serif' }}>
              {getText({ en: 'More entries coming soon.', no: 'Flere innlegg kommer snart.' })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default PhotographyPage

