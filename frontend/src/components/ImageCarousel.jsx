import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

const ImageCarousel = ({ images, title, onClose }) => {
  const { getText } = useLanguage()
  const [currentIndex, setCurrentIndex] = useState(0)

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1)
          break
        case 'ArrowRight':
          setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, images.length])

  // Focus trap
  useEffect(() => {
    const focusableElements = document.querySelectorAll(
      '[data-carousel] button, [data-carousel] [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => document.removeEventListener('keydown', handleTabKey)
  }, [])

  const goToPrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1)
  }

  const goToNext = () => {
    setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0)
  }

  if (!images || images.length === 0) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
      data-carousel
    >
      <div
        className="relative max-w-6xl max-h-full w-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex justify-between items-center">
            <div className="text-white">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm opacity-75">
                {currentIndex + 1} {getText({ en: 'of', no: 'av' })} {images.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-black/50 hover:bg-black/75 text-white rounded-full flex items-center justify-center transition-colors"
              aria-label={getText({ en: 'Close carousel', no: 'Lukk karusell' })}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Main Image */}
        <div className="relative bg-black rounded-lg overflow-hidden mx-4 my-8">
          <img
            src={images[currentIndex]}
            alt={`${title} - ${currentIndex + 1}`}
            className="max-w-full max-h-[80vh] object-contain mx-auto block"
          />
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/75 text-white rounded-full flex items-center justify-center transition-colors"
              aria-label={getText({ en: 'Previous image', no: 'Forrige bilde' })}
            >
              ←
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/75 text-white rounded-full flex items-center justify-center transition-colors"
              aria-label={getText({ en: 'Next image', no: 'Neste bilde' })}
            >
              →
            </button>
          </>
        )}

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
            <div className="flex justify-center gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`
                    flex-shrink-0 w-16 h-12 rounded overflow-hidden transition-opacity
                    ${index === currentIndex ? 'opacity-100 ring-2 ring-white' : 'opacity-50 hover:opacity-75'}
                  `}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageCarousel
