import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { generateImageDescription } from '../utils/data.jsx'
import ImageCarousel from './ImageCarousel'
import Carousel from './Carousel'

const CircularCarousel = ({ images, title, projectId, className = '' }) => {
  const { getText } = useLanguage()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [centerIndex, setCenterIndex] = useState(0)
  const scrollContainerRef = useRef(null)
  const carouselRef = useRef(null)

  // Visual heights (consistent across images)
  const MOBILE_IMAGE_HEIGHT_REM = 28   // ~448px
  const DESKTOP_IMAGE_HEIGHT_REM = 35  // ~560px

  // Helper to keep index in [0, images.length - 1]
  const getRealIndex = (index) => {
    if (!images || images.length === 0) return 0
    if (index < 0) return images.length - 1
    if (index >= images.length) return 0
    return index
  }

  const openFullscreen = (index) => {
    setCurrentIndex(index)
    setIsFullscreen(true)
  }

  const closeFullscreen = () => {
    setIsFullscreen(false)
  }

  // Create looped images for mobile scroll
  const loopedImages = images && images.length > 1
    ? [...images, ...images, ...images, ...images, ...images, ...images]
    : images || []

  // Track current index on mobile by center proximity
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || !images || images.length <= 1) return

    let scrollTimeout
    let isScrolling = false

    const handleScroll = () => {
      if (!isScrolling) {
        isScrolling = true
        clearTimeout(scrollTimeout)
      }
      scrollTimeout = setTimeout(() => {
        const containerRect = container.getBoundingClientRect()
        const containerCenterX = containerRect.left + containerRect.width / 2
        let closestIndex = 0
        let closestDistance = Infinity

        for (let i = 0; i < container.children.length; i++) {
          const child = container.children[i]
          if (!child) continue
          const r = child.getBoundingClientRect()
          const childCenterX = r.left + r.width / 2
          const d = Math.abs(childCenterX - containerCenterX)
          if (d < closestDistance) {
            closestDistance = d
            closestIndex = i
          }
        }
        const real = images.length ? (closestIndex % images.length) : 0
        setCurrentIndex(real)
        isScrolling = false
      }, 150)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [images])

  // Track center image for desktop carousel based on carousel navigation
  useEffect(() => {
    if (!images || images.length <= 1) return

    // Start with image 1 in center (second image in the [n, 1, 2] layout)
    setCenterIndex(0)

    // Listen for carousel navigation button clicks
    const carousel = carouselRef.current
    if (!carousel) return

    const handleNextClick = () => {
      setCenterIndex(prev => {
        const next = prev + 1
        return next >= images.length ? 0 : next
      })
    }

    const handlePrevClick = () => {
      setCenterIndex(prev => {
        const next = prev - 1
        return next < 0 ? images.length - 1 : next
      })
    }

    // Find the navigation buttons
    const nextButton = carousel.querySelector('.right-arrow-button')
    const prevButton = carousel.querySelector('.left-arrow-button')

    if (nextButton) {
      nextButton.addEventListener('click', handleNextClick)
    }
    if (prevButton) {
      prevButton.addEventListener('click', handlePrevClick)
    }

    return () => {
      if (nextButton) {
        nextButton.removeEventListener('click', handleNextClick)
      }
      if (prevButton) {
        prevButton.removeEventListener('click', handlePrevClick)
      }
    }
  }, [images])

  // Start mobile scroller centered on a middle set
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || !images || images.length <= 1) return

    const id = setTimeout(() => {
      const middleSetStart = images.length * 2
      let scrollPosition = 0
      for (let i = 0; i < middleSetStart; i++) {
        const child = container.children[i]
        if (child) scrollPosition += child.offsetWidth
      }
      container.scrollTo({ left: scrollPosition, behavior: 'auto' })
    }, 300)

    return () => clearTimeout(id)
  }, [images])

  if (!images || images.length === 0) return null

  return (
    <div className={`relative ${className}`}>
      {/* Mobile: horizontal scroll & snap */}
      <div className="md:hidden">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto py-2 scrollbar-hide snap-x snap-mandatory"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
            scrollSnapType: 'x mandatory',
            overscrollBehavior: 'contain',
            touchAction: 'pan-x',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {loopedImages.map((image, index) => {
            const realIndex = images.length ? (index % images.length) : 0
            return (
              <div
                key={`${index}-${image}`}
                className="snap-center flex-none px-2" // flex-none so width doesn't shrink, px-2 for horizontal spacing
                onClick={() => openFullscreen(realIndex)}
                style={{ 
                  maxWidth: 'min(80vw, 400px)' // maximum width for mobile, capped at 400px
                }}
              >
                {/* Fixed-height container, width adjusts to image aspect */}
                <div
                  className="flex items-center justify-center cursor-pointer overflow-hidden"
                  style={{ 
                    height: `${MOBILE_IMAGE_HEIGHT_REM}rem`,
                    width: 'fit-content', // width adjusts to content
                    maxWidth: '100%', // but don't exceed parent
                    borderRadius: '1rem' // 16px border radius on container
                  }}
                >
                  <img
                    src={image}
                    alt={`${title} - ${realIndex + 1}`}
                    className="block"
                    style={{
                      maxHeight: '100%',                      
                      width: 'auto', // let width adjust naturally
                      maxWidth: '100%',
                      objectFit: 'contain',
                      borderRadius: '1rem' // 16px border radius on image
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Image description (mobile) */}
        <div className="text-center mt-4 mb-2">
          <p className="text-ide-text/90 text-sm font-medium transition-all duration-500 ease-in-out">
            {images && images[getRealIndex(currentIndex)]
              ? generateImageDescription(images[getRealIndex(currentIndex)], projectId)
              : 'Image'}
          </p>
        </div>

        {/* Hint (mobile) */}
        <div className="text-center mb-2">
          <p className="text-ide-text/70 text-sm">
            {getText({ en: 'Swipe to browse • Tap to expand', no: 'Sveip for å bla • Trykk for å utvide' })}
          </p>
        </div>

        {/* Counter (mobile) */}
        {images.length > 1 && (
          <div className="flex justify-center mt-3">
            <span className="text-xs text-ide-text/70 bg-ide-surface/50 px-3 py-1 rounded-full backdrop-blur-sm">
              {getRealIndex(currentIndex) + 1} / {images.length}
            </span>
          </div>
        )}
      </div>

      {/* Desktop: Carousel (kept same API) */}
      <div className="hidden md:block py-6" ref={carouselRef}>
        <Carousel
          visibleItemsCount={3}
          withIndicator
          isInfinite
          initialIndex={2}
          imageHeight={DESKTOP_IMAGE_HEIGHT_REM * 16} // 560px
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="w-full flex items-center justify-center cursor-pointer px-4 py-1"
              style={{ maxHeight: `${DESKTOP_IMAGE_HEIGHT_REM}rem` }}
            >
               <img
                 src={image}
                 alt={`${title} - ${index + 1}`}
                 className="block transition-all duration-300 ease-in-out"
                 style={{
                   maxWidth: '100%',
                   maxHeight: centerIndex === index ? '100%' : '40%',
                   width: 'auto',
                   height: 'auto',
                   objectFit: 'contain',
                   borderRadius: centerIndex === index ? '2rem' : '1.4rem', // Scale border radius with image scale (2rem * 0.7 = 1.4rem)
                   transform: centerIndex === index ? 'scale(1)' : 'scale(0.7)',
                   opacity: centerIndex === index ? 1 : 0.6
                 }}
                 onClick={() => openFullscreen(index)}
               />
            </div>
          ))}
        </Carousel>

        {/* Desktop hint */}
        <div className="text-center mt-4">
          <p className="text-ide-text/90 text-sm font-medium">
            {getText({ en: 'Click image to expand', no: 'Klikk på bilde for å utvide' })}
          </p>
          <p className="text-ide-text/70 text-xs mt-1">
            {centerIndex + 1} / {images.length}
          </p>
        </div>
      </div>

      {/* Fullscreen overlay */}
      {isFullscreen && createPortal(
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={closeFullscreen}
        >
          <div
            className="relative w-full h-full"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Nav */}
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

            {/* Image */}
            <div className="p-8 flex items-center justify-center h-full">
              <img
                src={images[currentIndex]}
                alt={`${title} - ${currentIndex + 1}`}
                className="rounded-xl block"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>

            {/* Description */}
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-center px-4">
              <p className="text-white text-sm font-medium">
                {images && images[getRealIndex(currentIndex)]
                  ? generateImageDescription(images[getRealIndex(currentIndex)], projectId)
                  : 'Image'}
              </p>
            </div>

            {/* Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full">
                <span className="text-white text-sm">
                  {getRealIndex(currentIndex) + 1} / {images.length}
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