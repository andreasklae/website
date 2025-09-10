import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { generateImageDescription } from '../utils/data.jsx'
import ImageCarousel from './ImageCarousel'

const CircularCarousel = ({ images, title, projectId, className = '' }) => {
  const { getText } = useLanguage()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const scrollContainerRef = useRef(null)

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index) => {
    setCurrentIndex(index)
  }

  const openFullscreen = (index) => {
    setCurrentIndex(index)
    setIsFullscreen(true)
  }

  const closeFullscreen = () => {
    setIsFullscreen(false)
  }

  // Create looped images for mobile carousel - many duplicates for true infinite scroll
  const loopedImages = images.length > 1 ? [
    ...images, // Original images
    ...images, // Duplicate set 1
    ...images, // Duplicate set 2
    ...images, // Duplicate set 3
    ...images, // Duplicate set 4
    ...images, // Duplicate set 5
  ] : images

  // Handle scroll position tracking for mobile (no auto-jumping)
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || images.length <= 1) return

    let scrollTimeout

    const handleScroll = () => {
      clearTimeout(scrollTimeout)
      
      // Wait for scroll to settle
      scrollTimeout = setTimeout(() => {
        const scrollLeft = container.scrollLeft
        const containerWidth = container.offsetWidth
        const itemWidth = container.children[0]?.offsetWidth || 0
        const gap = 24 // gap-6 = 1.5rem = 24px
        const itemTotalWidth = itemWidth + gap
        
        // Calculate which item is in the center
        const centerX = scrollLeft + containerWidth / 2
        const currentItemIndex = Math.floor(centerX / itemTotalWidth)
        
        // Calculate real index (modulo to handle duplicates)
        const realIndex = currentItemIndex % images.length
        setCurrentIndex(realIndex)
      }, 100)
    }

    // Add scroll event listener
    container.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      container.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [images.length])

  // Set initial scroll position to middle of the carousel
  useEffect(() => {
    const container = scrollContainerRef.current
    if (container && images.length > 1) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        const itemWidth = container.children[0]?.offsetWidth || 0
        const gap = 24
        const itemTotalWidth = itemWidth + gap
        const middleSetStart = images.length * 2 // Start of third set (middle)
        
        container.scrollTo({
          left: middleSetStart * itemTotalWidth,
          behavior: 'auto'
        })
      }, 100)
    }
  }, [images.length])

  if (!images || images.length === 0) return null

  return (
    <div className={`relative ${className}`}>
      {/* Mobile: Horizontal scroll with snap */}
      <div className="md:hidden">
        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto py-2 scrollbar-hide snap-x snap-mandatory"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth'
          }}
        >
          {loopedImages.map((image, index) => {
            // Convert looped index to real index for click handler
            const realIndex = index % images.length
            
            return (
              <div
                key={`${index}-${image}`}
                className="flex-shrink-0 snap-center"
                onClick={() => openFullscreen(realIndex)}
              >
                 <div 
                   className="h-96 max-w-64 rounded-xl overflow-hidden shadow-lg flex items-center justify-center cursor-pointer"
                 >
                  <img
                    src={image}
                    alt={`${title} - ${realIndex + 1}`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Image description for mobile */}
        <div className="text-center mt-4 mb-2">
          <p className="text-ide-text/90 text-sm font-medium">
            {generateImageDescription(images[currentIndex], projectId)}
          </p>
        </div>
        
        {/* Click instruction for mobile */}
        <div className="text-center mb-2">
          <p className="text-ide-text/70 text-sm">
            {getText({ en: 'Tap image to expand', no: 'Trykk på bilde for å utvide' })}
          </p>
        </div>
        
        {/* Photo counter for mobile */}
        {images.length > 1 && (
          <div className="flex justify-center mt-3">
            <span className="text-xs text-ide-text/70 bg-ide-surface/50 px-3 py-1 rounded-full backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        )}
      </div>

      {/* Desktop: Circular carousel with buttons */}
      <div className="hidden md:block relative flex items-center justify-center">
        {/* Previous button - positioned absolutely */}
        {images.length > 1 && (
          <button
            onClick={prevImage}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10 p-4 rounded-full backdrop-blur-2xl bg-white/25 border border-white/40 hover:bg-white/35 hover:border-white/60 transition-all duration-300 hover:scale-110 shadow-lg"
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
        <div className="grid grid-cols-3 gap-3 items-center">
          {/* Previous image (small) */}
          <div className="flex justify-end">
            {images.length > 1 && (
              <div 
                className="h-64 max-h-48 max-w-[20rem] cursor-pointer hover:opacity-80 transition-opacity duration-200"
                onClick={() => openFullscreen((currentIndex - 1 + images.length) % images.length)}
              >
                <img
                  src={images[(currentIndex - 1 + images.length) % images.length]}
                  alt={`${title} - Previous`}
                  className="h-full w-auto object-contain"
                />
              </div>
            )}
          </div>

          {/* Current image (large, highlighted) - Always centered */}
          <div className="flex justify-center">
            <div 
              className="h-[640px] max-h-[480px] max-w-[80rem] cursor-pointer hover:scale-105 transition-transform duration-200"
              onClick={() => openFullscreen(currentIndex)}
            >
              <img
                src={images[currentIndex]}
                alt={`${title} - ${currentIndex + 1}`}
                className="h-full w-auto object-contain"
              />
            </div>
          </div>

          {/* Next image (small) */}
          <div className="flex justify-start">
            {images.length > 1 && (
              <div 
                className="h-64 max-h-48 max-w-[20rem] cursor-pointer hover:opacity-80 transition-opacity duration-200"
                onClick={() => openFullscreen((currentIndex + 1) % images.length)}
              >
                <img
                  src={images[(currentIndex + 1) % images.length]}
                  alt={`${title} - Next`}
                  className="h-full w-auto object-contain"
                />
              </div>
            )}
          </div>
        </div>

        {/* Image description for desktop */}
        <div className="text-center mt-4">
          <p className="text-ide-text/90 text-sm font-medium">
            {generateImageDescription(images[currentIndex], projectId)}
          </p>
        </div>
        
        {/* Click instruction for desktop */}
        <div className="text-center mt-2">
          <p className="text-ide-text/70 text-sm">
            {getText({ en: 'Click image to expand', no: 'Klikk på bilde for å utvide' })}
          </p>
        </div>

        {/* Next button - positioned absolutely */}
        {images.length > 1 && (
          <button
            onClick={nextImage}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 z-10 p-4 rounded-full backdrop-blur-2xl bg-white/25 border border-white/40 hover:bg-white/35 hover:border-white/60 transition-all duration-300 hover:scale-110 shadow-lg"
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

      {/* Image counter - only show on desktop */}
      {images.length > 1 && (
        <div className="hidden md:block text-center mt-2">
          <span className="text-xs text-ide-text/70">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      )}

      {/* Fullscreen Image Carousel - Rendered to document body */}
      {isFullscreen && createPortal(
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={closeFullscreen}
        >
          <div
            className="relative w-full h-full"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Image - fits within screen with padding */}
            <div className="p-8 flex items-center justify-center h-full">
              <img
                src={images[currentIndex]}
                alt={`${title} - ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            {/* Image Description */}
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-center px-4">
              <p className="text-white text-sm font-medium">
                {generateImageDescription(images[currentIndex], projectId)}
              </p>
            </div>

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full">
                <span className="text-white text-sm">
                  {currentIndex + 1} / {images.length}
                </span>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default CircularCarousel
