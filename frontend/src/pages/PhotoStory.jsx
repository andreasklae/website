import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { photographyStories } from '../utils/data.jsx'
import LanguageToggle from '../components/LanguageToggle'
import ImageCarousel from '../components/ImageCarousel'

const PhotoStory = () => {
  const { storyId } = useParams()
  const { getText } = useLanguage()
  const [story, setStory] = useState(null)
  const [currentPartIndex, setCurrentPartIndex] = useState(0)
  const [partData, setPartData] = useState(null)
  const [showCarousel, setShowCarousel] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const foundStory = photographyStories.find(s => s.id === storyId)
    if (foundStory) {
      setStory(foundStory)
      loadPartData(foundStory.parts[0])
    } else {
      setLoading(false)
    }
  }, [storyId])

  const loadPartData = async (part) => {
    setLoading(true)
    try {
      // In a real implementation, you would load:
      // 1. Description from the markdown file
      // 2. Highlight images from the highlights directory
      // 3. All photos from the photos directory
      
      // For now, we'll simulate this with sample data
      const simulatedData = {
        description: {
          en: `This is a simulated description for ${getText(part.title)}. In the real implementation, this would be loaded from the markdown file at ${part.description}.`,
          no: `Dette er en simulert beskrivelse for ${getText(part.title)}. I den virkelige implementasjonen ville dette blitt lastet fra markdown-filen på ${part.description}.`
        },
        highlights: [
          // These would be loaded from the highlights directory
          `${part.highlights}sample1.jpeg`,
          `${part.highlights}sample2.jpeg`,
          `${part.highlights}sample3.jpeg`,
        ].filter(Boolean),
        photos: [
          // These would be loaded from the photos directory
          `${part.photos}photo1.jpeg`,
          `${part.photos}photo2.jpeg`,
          `${part.photos}photo3.jpeg`,
          `${part.photos}photo4.jpeg`,
          `${part.photos}photo5.jpeg`,
        ].filter(Boolean)
      }
      
      setPartData(simulatedData)
      setLoading(false)
    } catch (error) {
      console.error('Error loading part data:', error)
      setLoading(false)
    }
  }

  const goToPart = (index) => {
    if (story && index >= 0 && index < story.parts.length) {
      setCurrentPartIndex(index)
      loadPartData(story.parts[index])
    }
  }

  const goToNextPart = () => {
    if (currentPartIndex < story.parts.length - 1) {
      goToPart(currentPartIndex + 1)
    }
  }

  const goToPreviousPart = () => {
    if (currentPartIndex > 0) {
      goToPart(currentPartIndex - 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-gray-600">Loading story...</div>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {getText({ en: 'Story not found', no: 'Historie ikke funnet' })}
          </h1>
            <Link to="/photography" className="text-blue-600 hover:text-blue-700">
            {getText({ en: 'Back to Photography', no: 'Tilbake til foto' })}
          </Link>
        </div>
      </div>
    )
  }

  const currentPart = story.parts[currentPartIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 animate-page-enter">
      <div className="max-w-4xl mx-auto px-6 pt-32 lg:pt-40 pb-12">
        {/* Story Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {getText(story.title)}
          </h1>
          <p className="text-xl text-gray-600">
            {getText(story.description)}
          </p>
        </div>

        {/* Part Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 p-2 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200">
            {story.parts.map((part, index) => (
              <button
                key={part.id}
                onClick={() => goToPart(index)}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium transition-colors
                  ${index === currentPartIndex
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }
                `}
              >
                {index + 1}. {getText(part.title)}
              </button>
            ))}
          </div>
        </div>

        {/* Current Part Content */}
        <div className="space-y-12">
          {/* Part Title */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {getText(currentPart.title)}
            </h2>
          </div>

          {/* Part Description */}
          {partData?.description && (
            <div className="card max-w-3xl mx-auto">
              <p className="text-lg text-gray-700 leading-relaxed">
                {getText(partData.description)}
              </p>
            </div>
          )}

          {/* Highlighted Photos */}
          {partData?.highlights && partData.highlights.length > 0 && (
            <section>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                {getText({ en: 'Highlights', no: 'Høydepunkter' })}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {partData.highlights.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-video bg-gray-200 rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => setShowCarousel(true)}
                  >
                    <img
                      src={image}
                      alt={`${getText(currentPart.title)} highlight ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Photo Carousel Section */}
          {partData?.photos && partData.photos.length > 0 && (
            <section>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">
                  {getText({ en: 'All Photos', no: 'Alle bilder' })}
                </h3>
                <button
                  onClick={() => setShowCarousel(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {getText({ en: 'View Carousel', no: 'Se karusell' })} ({partData.photos.length})
                </button>
              </div>
              
              {/* Photo Grid Preview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {partData.photos.slice(0, 8).map((photo, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => setShowCarousel(true)}
                  >
                    <img
                      src={photo}
                      alt={`${getText(currentPart.title)} photo ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
              
              {partData.photos.length > 8 && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => setShowCarousel(true)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    +{partData.photos.length - 8} {getText({ en: 'more photos', no: 'flere bilder' })}
                  </button>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Part Navigation */}
        <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-200">
          <button
            onClick={goToPreviousPart}
            disabled={currentPartIndex === 0}
            className={`
              px-6 py-3 rounded-lg transition-colors flex items-center gap-2
              ${currentPartIndex === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            ← {getText({ en: 'Previous Part', no: 'Forrige del' })}
          </button>
          
          <span className="text-gray-500">
            {currentPartIndex + 1} {getText({ en: 'of', no: 'av' })} {story.parts.length}
          </span>
          
          <button
            onClick={goToNextPart}
            disabled={currentPartIndex === story.parts.length - 1}
            className={`
              px-6 py-3 rounded-lg transition-colors flex items-center gap-2
              ${currentPartIndex === story.parts.length - 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            {getText({ en: 'Next Part', no: 'Neste del' })} →
          </button>
        </div>
      </div>

      {/* Image Carousel */}
      {showCarousel && partData?.photos && (
        <ImageCarousel
          images={partData.photos}
          title={`${getText(story.title)} - ${getText(currentPart.title)}`}
          onClose={() => setShowCarousel(false)}
        />
      )}
    </div>
  )
}

export default PhotoStory
