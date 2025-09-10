import { useState, useEffect, useRef, cloneElement } from 'react'
import { useLocation } from 'react-router-dom'

const PageTransition = ({ children }) => {
  const [displayLocation, setDisplayLocation] = useState(null)
  const [transitionStage, setTransitionStage] = useState('idle') // 'idle', 'fadeOut', 'fadeIn'
  const [transitionColor, setTransitionColor] = useState('white')
  const location = useLocation()
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip transition on first render
    if (isFirstRender.current) {
      setDisplayLocation(location)
      isFirstRender.current = false
      return
    }

    // Determine transition color based on destination
    const isGoingToSoftware = location.pathname.startsWith('/software')
    const newTransitionColor = isGoingToSoftware ? 'black' : 'white'
    setTransitionColor(newTransitionColor)

    // Step 1: Fade out current content
    setTransitionStage('fadeOut')

    // Step 2: After overlay is fully opaque, scroll and change content
    const scrollTimer = setTimeout(() => {
      // Only scroll to top if there's no hash in the URL (to allow hash scrolling to work)
      if (!location.hash) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
        document.body.scrollTop = 0
        document.documentElement.scrollTop = 0
      }
    }, 250) // Wait for overlay to be fully opaque

    // Step 3: Change the page content slightly after scroll
    const changePageTimer = setTimeout(() => {
      setDisplayLocation(location)
      setTransitionStage('fadeIn')
    }, 300) // Change content after scroll

    // Step 4: Fade in new content (wait for slower fade-in to complete)
    const fadeInTimer = setTimeout(() => {
      setTransitionStage('idle')
    }, 700) // Wait for 400ms fade-in + buffer

    return () => {
      clearTimeout(scrollTimer)
      clearTimeout(changePageTimer)
      clearTimeout(fadeInTimer)
    }
  }, [location.pathname])

  const overlayOpacity = transitionStage === 'fadeOut' || transitionStage === 'fadeIn' ? 'opacity-100' : 'opacity-0'
  
  // Content animation states - slower fade, same slide timing
  let contentClasses = 'transition-all duration-400 ease-out '
  if (transitionStage === 'fadeOut') {
    contentClasses += 'opacity-0'
  } else if (transitionStage === 'fadeIn') {
    contentClasses += 'opacity-0 translate-y-4'
  } else {
    contentClasses += 'opacity-100 translate-y-0'
  }

  return (
    <div className="relative w-full h-full">
      {/* Transition overlay - contained within this wrapper */}
      <div
        className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-500 ease-in-out ${overlayOpacity}`}
        style={{
          backgroundColor: transitionColor,
        }}
      />
      
      {/* Page content */}
      <div className={contentClasses}>
        {displayLocation && cloneElement(children, { key: displayLocation.pathname, location: displayLocation })}
      </div>
    </div>
  )
}

export default PageTransition
