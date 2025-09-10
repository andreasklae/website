import { useState, useEffect } from 'react'

const CircularCarousel = ({ images, title, className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index) => {
    setCurrentIndex(index)
  }


  if (!images || images.length === 0) return null

  return (
    <div className={`relative ${className}`}>
      {/* Main carousel container */}
      <div className="relative flex items-center justify-center">
        {/* Previous button - positioned absolutely */}
        {images.length > 1 && (
          <button
            onClick={prevImage}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-4 rounded-full backdrop-blur-2xl bg-white/25 border border-white/40 hover:bg-white/35 hover:border-white/60 transition-all duration-300 hover:scale-110 shadow-lg"
            style={{
              borderRadius: '2rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            aria-label="Previous image"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Images container */}
        <div className="flex items-center space-x-3">
          {/* Previous image (small) */}
          {images.length > 1 && (
            <div className="w-16 h-12 rounded-lg overflow-hidden border-2 border-ide-border opacity-60 flex-shrink-0">
              <img
                src={images[(currentIndex - 1 + images.length) % images.length]}
                alt={`${title} - Previous`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Current image (large, highlighted) */}
          <div className="relative flex-1">
            <div className="w-full h-96 rounded-xl overflow-hidden shadow-lg">
              <img
                src={images[currentIndex]}
                alt={`${title} - ${currentIndex + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Next image (small) */}
          {images.length > 1 && (
            <div className="w-16 h-12 rounded-lg overflow-hidden border-2 border-ide-border opacity-60 flex-shrink-0">
              <img
                src={images[(currentIndex + 1) % images.length]}
                alt={`${title} - Next`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Next button - positioned absolutely */}
        {images.length > 1 && (
          <button
            onClick={nextImage}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-4 rounded-full backdrop-blur-2xl bg-white/25 border border-white/40 hover:bg-white/35 hover:border-white/60 transition-all duration-300 hover:scale-110 shadow-lg"
            style={{
              borderRadius: '2rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            aria-label="Next image"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>


      {/* Image counter */}
      {images.length > 1 && (
        <div className="text-center mt-2">
          <span className="text-xs text-ide-text/70">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </div>
  )
}

export default CircularCarousel
