import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import ImageCarousel from './ImageCarousel'

const CircularCarousel = ({ images, title, className = '' }) => {
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

  // Create looped images for mobile carousel
  const loopedImages = images.length > 1 ? [
    images[images.length - 1], // Last image at the beginning
    ...images, // All original images
    images[0] // First image at the end
  ] : images

  // Handle infinite scroll loop for mobile
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || images.length <= 1) return

    let scrollTimeout
    let isScrolling = false

    const handleScroll = () => {
      if (isTransitioning) return
      
      isScrolling = true
      // Clear existing timeout
      clearTimeout(scrollTimeout)
      
      // Update current index based on scroll position
      const scrollLeft = container.scrollLeft
      const containerWidth = container.offsetWidth
      const centerX = scrollLeft + containerWidth / 2
      
      // Find which image is closest to center
      let closestIndex = 0
      let minDistance = Infinity
      
      Array.from(container.children).forEach((child, index) => {
        const childCenter = child.offsetLeft + child.offsetWidth / 2
        const distance = Math.abs(centerX - childCenter)
        if (distance < minDistance) {
          minDistance = distance
          closestIndex = index
        }
      })
      
      // Convert looped index to real index
      let realIndex = closestIndex
      if (closestIndex === 0) realIndex = images.length - 1 // First duplicate = last real
      else if (closestIndex === container.children.length - 1) realIndex = 0 // Last duplicate = first real
      else realIndex = closestIndex - 1 // Middle images are real images
      
      setCurrentIndex(realIndex)
      
      // Wait for scroll to settle
      scrollTimeout = setTimeout(() => {
        isScrolling = false
        const firstRealImage = container.children[1]
        const lastRealImage = container.children[container.children.length - 2]
        const duplicateFirstImage = container.children[0]
        const duplicateLastImage = container.children[container.children.length - 1]
        
        // Check if we're at the duplicate last image (should jump to real first)
        if (Math.abs(scrollLeft - (duplicateLastImage?.offsetLeft || 0)) < 10) {
          setIsTransitioning(true)
          container.scrollLeft = firstRealImage?.offsetLeft || 0
          setCurrentIndex(0)
          setTimeout(() => setIsTransitioning(false), 100)
        }
        // Check if we're at the duplicate first image (should jump to real last)
        else if (Math.abs(scrollLeft - (duplicateFirstImage?.offsetLeft || 0)) < 10) {
          setIsTransitioning(true)
          container.scrollLeft = lastRealImage?.offsetLeft || 0
          setCurrentIndex(images.length - 1)
          setTimeout(() => setIsTransitioning(false), 100)
        }
      }, 200) // Increased timeout for better touch handling
    }

    // Add both scroll and touch events for better mobile support
    container.addEventListener('scroll', handleScroll, { passive: true })
    container.addEventListener('touchmove', handleScroll, { passive: true })
    container.addEventListener('touchend', handleScroll, { passive: true })
    
    return () => {
      container.removeEventListener('scroll', handleScroll)
      container.removeEventListener('touchmove', handleScroll)
      container.removeEventListener('touchend', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [images.length, isTransitioning])

  // Set initial scroll position
  useEffect(() => {
    const container = scrollContainerRef.current
    if (container && images.length > 1) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        const firstRealImage = container.children[1]
        if (firstRealImage) {
          container.scrollLeft = firstRealImage.offsetLeft
        }
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
            let realIndex = index
            if (index === 0) realIndex = images.length - 1
            else if (index === loopedImages.length - 1) realIndex = 0
            else realIndex = index - 1
            
            return (
              <div
                key={`${index}-${image}`}
                className={`flex-shrink-0 snap-center ${index === 0 ? 'ml-6' : ''} ${index === loopedImages.length - 1 ? 'mr-6' : ''}`}
                onClick={() => openFullscreen(realIndex)}
              >
                 <div 
                   className="h-96 max-w-64 rounded-xl overflow-hidden shadow-lg flex items-center justify-center cursor-pointer"
                 >
                  <img
                    src={image}
                    alt={`${title} - ${index + 1}`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            )
          })}
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

            {/* Image - fits within screen */}
            <img
              src={images[currentIndex]}
              alt={`${title} - ${currentIndex + 1}`}
              className="w-full h-full object-contain"
            />

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
