import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { photographyStories, photographyHighlights } from '../utils/data.jsx'
import LanguageToggle from '../components/LanguageToggle'
import ImageCarousel from '../components/ImageCarousel'

const PhotographyPage = () => {
  const { getText } = useLanguage()
  const [highlights, setHighlights] = useState([])
  const [showLightbox, setShowLightbox] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load actual highlights from the portfolio
    const loadHighlights = async () => {
      try {
        setHighlights(photographyHighlights)
        setLoading(false)
      } catch (error) {
        console.error('Error loading highlights:', error)
        setLoading(false)
      }
    }
    loadHighlights()
  }, [])

  const openLightbox = (index) => {
    setLightboxIndex(index)
    setShowLightbox(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 animate-page-enter">
      <div className="max-w-7xl mx-auto px-6 pt-32 lg:pt-40 pb-12">
        {/* Photography Header */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-3">
            {getText({ en: 'Photography', no: 'Foto' })}
            <span className="text-amber-500">⟡</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {getText({
              en: 'Capturing moments, telling stories through light and composition. A collection of my visual narratives.',
              no: 'Fanger øyeblikk, forteller historier gjennom lys og komposisjon. En samling av mine visuelle fortellinger.'
            })}
          </p>
        </section>

        {/* Highlights Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {getText({ en: 'Highlights', no: 'Høydepunkter' })}
          </h2>
          
          {highlights.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {highlights.map((image, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => openLightbox(index)}
                >
                  <img
                    src={image}
                    alt={`Highlight ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {getText({ 
                  en: 'Highlights will be loaded dynamically from the portfolio directory.',
                  no: 'Høydepunkter vil bli lastet dynamisk fra porteføljemappen.'
                })}
              </p>
            </div>
          )}
        </section>

        {/* Stories Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {getText({ en: 'Stories', no: 'Historier' })}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {photographyStories.map((story) => (
              <Link
                key={story.id}
                to={`/photography/${story.id}`}
                className="group card hover:shadow-xl transition-all duration-300"
              >
                {/* Story Cover Image */}
                <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden mb-4">
                  <img
                    src={story.coverImage}
                    alt={getText(story.title)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                
                {/* Story Info */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {getText(story.title)}
                </h3>
                <p className="text-gray-600 mb-4">
                  {getText(story.description)}
                </p>
                
                {/* Story Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {story.parts.length} {getText({ en: 'parts', no: 'deler' })}
                  </span>
                  <span className="text-blue-600 group-hover:text-blue-700 transition-colors">
                    {getText({ en: 'View Story', no: 'Se historie' })} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Lightbox for Highlights */}
      {showLightbox && highlights.length > 0 && (
        <ImageCarousel
          images={highlights}
          title={getText({ en: 'Photography Highlights', no: 'Foto høydepunkter' })}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </div>
  )
}

export default PhotographyPage
