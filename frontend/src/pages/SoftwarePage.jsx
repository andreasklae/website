import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { loadCVData, loadCoursesData, portfolioProjects, formatDateRange, parseMarkdownText } from '../utils/data.jsx'
import LanguageToggle from '../components/LanguageToggle'
import ProjectCard from '../components/ProjectCard'
import Tag from '../components/Tag'

const SoftwarePage = () => {
  const { getText, language } = useLanguage()
  const [cvData, setCvData] = useState(null)
  const [coursesData, setCoursesData] = useState([])
  const [expandedCategories, setExpandedCategories] = useState({})
  const [categoryHeights, setCategoryHeights] = useState({})
  const [isResizing, setIsResizing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    subjectAreas: []
  })
  const categoryRefs = useRef({})

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cv, courses] = await Promise.all([
          loadCVData(),
          loadCoursesData()
        ])
        setCvData(cv)
        setCoursesData(courses)
        setLoading(false)
      } catch (error) {
        console.error('Error loading data:', error)
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Handle hash scrolling when data is loaded (projects are rendered)
  useEffect(() => {
    if (!loading) {
      const hash = window.location.hash
      if (hash) {
        // Delay to ensure projects are rendered and page transition is complete
        setTimeout(() => {
          const element = document.querySelector(hash)
          if (element) {
            const navbarHeight = 92 // Navbar height (h-20 + mt-3 = 80px + 12px)
            const elementPosition = element.offsetTop - navbarHeight
            window.scrollTo({ 
              top: elementPosition, 
              behavior: 'smooth' 
            })
          }
        }, 800) // Wait for page transition to complete (700ms + buffer)
      }
    }
  }, [loading])

  // Handle hash scrolling when component mounts or when hash changes
  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash
      if (hash) {
        // Wait for the page to be fully rendered
        const scrollToElement = () => {
          const element = document.querySelector(hash)
          if (element) {
            // Get navbar height and add offset
            const navbarHeight = 92 // Navbar height (h-20 + mt-3 = 80px + 12px)
            const elementPosition = element.offsetTop - navbarHeight
            window.scrollTo({ 
              top: elementPosition, 
              behavior: 'smooth' 
            })
            return true
          }
          return false
        }

        // Try immediately first
        if (!scrollToElement()) {
          // If element not found, try with increasing delays
          const delays = [100, 300, 600, 900] // Longer delays to account for page transitions
          delays.forEach(delay => {
            setTimeout(() => {
              scrollToElement()
            }, delay)
          })
        }
      }
    }

    // Handle initial hash
    handleHashScroll()

    // Listen for hash changes (in case user navigates with hash)
    window.addEventListener('hashchange', handleHashScroll)

    return () => {
      window.removeEventListener('hashchange', handleHashScroll)
    }
  }, [])

  // Measure category heights when courses change
  useEffect(() => {
    if (coursesData.length > 0) {
      const categorizedCourses = categorizeCourses(coursesData)
      const categories = ['informatics', 'mediaCommunication', 'other']
      
      categories.forEach(categoryKey => {
        const courses = categorizedCourses[categoryKey]
        if (courses.length > 0) {
          const getCoursesPerRow = () => {
            if (typeof window !== 'undefined') {
              if (window.innerWidth < 768) return 1
              if (window.innerWidth < 1024) return 2
              return 3
            }
            return 3
          }
          const coursesPerRow = getCoursesPerRow()
          
          // Small delay to ensure DOM is updated
          setTimeout(() => {
            measureCategoryHeight(categoryKey, coursesPerRow)
          }, 100)
        }
      })
    }
  }, [coursesData, filters, language])

  // Recalculate heights on window resize - continuously during resize
  useEffect(() => {
    let resizeTimeout
    let resizeObserver
    let resizeInterval
    
    const getCoursesPerRow = (width) => {
      if (width < 768) return 1
      if (width < 1024) return 2
      return 3
    }
    
    const recalculateAllHeights = () => {
      if (coursesData.length > 0) {
        const categorizedCourses = categorizeCourses(coursesData)
        const categories = ['informatics', 'mediaCommunication', 'other']
        const coursesPerRow = getCoursesPerRow(window.innerWidth)
        
        categories.forEach(categoryKey => {
          const courses = categorizedCourses[categoryKey]
          if (courses.length > 0) {
            // Use requestAnimationFrame to ensure DOM is updated
            requestAnimationFrame(() => {
              measureCategoryHeight(categoryKey, coursesPerRow)
            })
          }
        })
      }
    }
    
    const handleResize = () => {
      // Clear any existing timeout and interval
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      if (resizeInterval) {
        clearInterval(resizeInterval)
      }
      
      setIsResizing(true)
      
      // Recalculate immediately during resize
      recalculateAllHeights()
      
      // Continue recalculating during resize for smoother curtain animation
      resizeInterval = setInterval(() => {
        recalculateAllHeights()
      }, 16) // ~60fps
      
      // Debounce the end of resize
      resizeTimeout = setTimeout(() => {
        setIsResizing(false)
        if (resizeInterval) {
          clearInterval(resizeInterval)
        }
      }, 150)
    }

    // Set up ResizeObserver to watch for changes in individual course cards
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver((entries) => {
        // Only recalculate if we're not already resizing (to avoid conflicts)
        if (!isResizing) {
          recalculateAllHeights()
        }
      })
      
      // Observe all category containers
      Object.values(categoryRefs.current).forEach(ref => {
        if (ref) {
          resizeObserver.observe(ref)
        }
      })
    }

    window.addEventListener('resize', handleResize)
    
    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      if (resizeInterval) {
        clearInterval(resizeInterval)
      }
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [coursesData, filters, isResizing, language])


  const applyFilters = (course) => {
    const tags = course.tags[language] || []
    const tagsLower = tags.map(tag => tag.toLowerCase())
    const courseName = getText(course.name).toLowerCase()
    const courseCode = course.code.toLowerCase()
    
    // If no filters are selected, show all courses
    if (filters.subjectAreas.length === 0) {
      return true
    }
    
    // Check if course matches any of the selected subject areas
    const hasMatchingSubjectArea = filters.subjectAreas.some(selectedArea => {
      switch (selectedArea) {
        case 'programming':
          return tagsLower.some(tag => 
            tag === 'programming' || tag === 'programmering' || tag === 'programvareutvikling' || tag === 'software engineering'
          )
        case 'design':
          return tagsLower.some(tag => tag === 'design')
        case 'algorithms-data':
          return tagsLower.some(tag => 
            tag === 'algorithms/data' || tag === 'algoritmer/data'
          ) && !isComputerSystemsCourse(course)
        case 'computer-systems':
          return isComputerSystemsCourse(course)
        default:
          return false
      }
    })
    
    return hasMatchingSubjectArea
  }

  const isComputerSystemsCourse = (course) => {
    const courseName = getText(course.name).toLowerCase()
    const courseCode = course.code.toLowerCase()
    
    // Check for computer systems related keywords in course name
    const systemsKeywords = [
      'computer technology', 'datateknologi',
      'operating systems', 'operativsystemer',
      'data communication', 'datakommunikasjon',
      'computer', 'datamaskin',
      'systems', 'systemer',
      'hardware', 'maskinvare',
      'networks', 'nettverk'
    ]
    
    const hasSystemsKeyword = systemsKeywords.some(keyword => 
      courseName.includes(keyword)
    )
    
    // Check for specific course codes that are computer systems related
    const systemsCourseCodes = ['in1020', 'in2140']
    const hasSystemsCode = systemsCourseCodes.includes(courseCode)
    
    return hasSystemsKeyword || hasSystemsCode
  }

  const categorizeCourses = (courses) => {
    const categories = {
      informatics: [],
      mediaCommunication: [],
      other: []
    }

    courses.forEach(course => {
      const tags = course.tags[language] || []
      const tagsLower = tags.map(tag => tag.toLowerCase())
      
      if (tagsLower.includes('informatikk') || tagsLower.includes('informatics')) {
        if (applyFilters(course)) {
          categories.informatics.push(course)
        }
      } else if (tagsLower.includes('medier og kommunikasjon') || tagsLower.includes('media communication')) {
        categories.mediaCommunication.push(course)
      } else {
        categories.other.push(course)
      }
    })

    // Sort courses by semester (newest first)
    const sortCoursesBySemester = (courseList) => {
      return courseList.sort((a, b) => {
        // Extract year and semester from semester string (e.g., "Høst 2024" or "Spring 2024")
        const getSemesterValue = (semester) => {
          const semesterText = getText(semester).toLowerCase()
          const yearMatch = semesterText.match(/(\d{4})/)
          const year = yearMatch ? parseInt(yearMatch[1]) : 0
          
          // Assign higher values to more recent semesters
          if (semesterText.includes('høst') || semesterText.includes('autumn') || semesterText.includes('fall')) {
            return year * 10 + 2 // Autumn gets higher value
          } else if (semesterText.includes('vår') || semesterText.includes('spring')) {
            return year * 10 + 1 // Spring gets lower value
          }
          return year * 10
        }
        
        return getSemesterValue(b.semester) - getSemesterValue(a.semester)
      })
    }

    // Sort each category
    categories.informatics = sortCoursesBySemester(categories.informatics)
    categories.mediaCommunication = sortCoursesBySemester(categories.mediaCommunication)
    categories.other = sortCoursesBySemester(categories.other)

    return categories
  }

  const measureCategoryHeight = (categoryKey, coursesPerRow) => {
    const ref = categoryRefs.current[categoryKey]
    if (ref) {
      const grid = ref.querySelector('.grid')
      if (grid) {
        const children = Array.from(grid.children)
        if (children.length > 0) {
          // Create a temporary container to measure the exact first row height
          const tempContainer = document.createElement('div')
          tempContainer.style.position = 'absolute'
          tempContainer.style.visibility = 'hidden'
          tempContainer.style.top = '-9999px'
          tempContainer.style.left = '-9999px'
          tempContainer.style.width = grid.offsetWidth + 'px'
          tempContainer.style.height = 'auto'
          
          // Copy all grid styles including margins and paddings
          const gridStyles = window.getComputedStyle(grid)
          tempContainer.style.display = gridStyles.display
          tempContainer.style.gridTemplateColumns = gridStyles.gridTemplateColumns
          tempContainer.style.gap = gridStyles.gap
          tempContainer.style.padding = gridStyles.padding
          tempContainer.style.margin = gridStyles.margin
          tempContainer.style.boxSizing = gridStyles.boxSizing
          tempContainer.className = grid.className
          
          // Clone only the first row elements
          const firstRowChildren = children.slice(0, coursesPerRow)
          firstRowChildren.forEach(child => {
            const clonedChild = child.cloneNode(true)
            // Ensure the cloned child has the same styles and dimensions
            const childStyles = window.getComputedStyle(child)
            clonedChild.style.margin = childStyles.margin
            clonedChild.style.padding = childStyles.padding
            clonedChild.style.width = childStyles.width
            clonedChild.style.height = 'auto'
            clonedChild.style.minHeight = childStyles.minHeight
            clonedChild.style.maxHeight = childStyles.maxHeight
            clonedChild.style.boxSizing = childStyles.boxSizing
            clonedChild.style.display = childStyles.display
            clonedChild.style.flexDirection = childStyles.flexDirection
            clonedChild.style.justifyContent = childStyles.justifyContent
            clonedChild.style.alignItems = childStyles.alignItems
            tempContainer.appendChild(clonedChild)
          })
          
          document.body.appendChild(tempContainer)
          
          // Force a reflow to ensure accurate measurements
          tempContainer.offsetHeight
          
          // Get the total height including margins and paddings
          const totalHeight = Math.max(tempContainer.offsetHeight, 200) // Minimum height of 200px
          
          document.body.removeChild(tempContainer)
          
          setCategoryHeights(prev => ({
            ...prev,
            [categoryKey]: totalHeight
          }))
        }
      }
    }
  }

  const toggleCategory = (category) => {
    const isCurrentlyExpanded = expandedCategories[category]
    
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
    
    // If collapsing, scroll to the top of the section after a short delay
    if (isCurrentlyExpanded) {
      setTimeout(() => {
        const sectionElement = document.querySelector(`[data-category="${category}"]`)
        if (sectionElement) {
          const navbarHeight = 92 // Navbar height (h-20 + mt-3 = 80px + 12px)
          const elementPosition = sectionElement.offsetTop - navbarHeight
          window.scrollTo({ 
            top: elementPosition, 
            behavior: 'smooth' 
          })
        }
      }, 100) // Small delay to ensure state update has taken effect
    }
  }

  const toggleSubjectAreaFilter = (area) => {
    setFilters(prev => {
      const currentAreas = prev.subjectAreas
      if (currentAreas.includes(area)) {
        // Remove the area if it's already selected
        return {
          ...prev,
          subjectAreas: currentAreas.filter(a => a !== area)
        }
      } else {
        // Add the area if it's not selected
        return {
          ...prev,
          subjectAreas: [...currentAreas, area]
        }
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen ide-theme flex items-center justify-center">
        <div className="text-ide-text">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-ide-text animate-page-enter container-responsive">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 lg:pt-40 pb-12 w-full">
        {/* About Section */}
        <section className="mb-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 flex items-center justify-center gap-3">
            <span className="code-decoration">{'['}</span>
            {getText({ en: 'Metadata', no: 'Metadata' })}
            <span className="code-decoration">{']'}</span>
          </h1>
          
          {/* Quick Navigation */}
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            <button
              onClick={() => {
                const element = document.querySelector('#education')
                if (element) {
                  const navbarHeight = 92 // Navbar height (h-20 + mt-3 = 80px + 12px)
                  const elementPosition = element.offsetTop - navbarHeight
                  window.scrollTo({ top: elementPosition, behavior: 'smooth' })
                }
              }}
              className="glass-bubble px-6 py-3 text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2"
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                borderColor: 'rgba(34, 197, 94, 0.2)',
                borderRadius: '2rem',
                color: '#86efac'
              }}
            >
              {getText({ en: 'Education', no: 'Utdanning' })}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => {
                const element = document.querySelector('#courses')
                if (element) {
                  const navbarHeight = 92 // Navbar height (h-20 + mt-3 = 80px + 12px)
                  const elementPosition = element.offsetTop - navbarHeight
                  window.scrollTo({ top: elementPosition, behavior: 'smooth' })
                }
              }}
              className="glass-bubble px-6 py-3 text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2"
              style={{
                backgroundColor: 'rgba(251, 146, 60, 0.15)',
                borderColor: 'rgba(251, 146, 60, 0.2)',
                borderRadius: '2rem',
                color: '#fb923c'
              }}
            >
              {getText({ en: 'Courses', no: 'Emner' })}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => {
                const element = document.querySelector('#projects')
                if (element) {
                  const navbarHeight = 92 // Navbar height (h-20 + mt-3 = 80px + 12px)
                  const elementPosition = element.offsetTop - navbarHeight
                  window.scrollTo({ top: elementPosition, behavior: 'smooth' })
                }
              }}
              className="glass-bubble px-6 py-3 text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center gap-2"
              style={{
                backgroundColor: 'rgba(168, 85, 247, 0.15)',
                borderColor: 'rgba(168, 85, 247, 0.2)',
                borderRadius: '2rem',
                color: '#c084fc'
              }}
            >
              {getText({ en: 'Projects', no: 'Prosjekter' })}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {cvData && (
            <div className="text-ide-text text-lg leading-relaxed text-wrap max-w-4xl mx-auto">
                {parseMarkdownText(getText(cvData.summary), true)}
            </div>
          )}

          {/* Technologies Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center justify-center gap-2">
              <span className="code-decoration">//</span>
              {getText({ en: "I've worked with:", no: 'Jeg har jobbet med:' })}
            </h3>
            
            <div className="flex flex-wrap gap-8 items-center justify-center max-w-4xl mx-auto">
              {/* Web Technologies (Most Popular) */}
              {/* JavaScript */}
              <img src="/IT logos/programming languages/javascript.svg" alt="JavaScript" className="w-20 h-20 object-contain" />
              
              {/* HTML */}
              <img src="/IT logos/others/html.svg" alt="HTML" className="w-20 h-20 object-contain" />
              
              {/* CSS */}
              <img src="/IT logos/others/css.svg" alt="CSS" className="w-20 h-20 object-contain" />
              
              {/* React */}
              <img src="/IT logos/frameworks/react.svg" alt="React" className="w-20 h-20 object-contain" />
              
              {/* Tailwind CSS */}
              <img src="/IT logos/frameworks/tailwind-svgrepo-com.svg" alt="Tailwind CSS" className="w-20 h-20 object-contain" />
              
              {/* Python & ML */}
              {/* Python */}
              <img src="/IT logos/programming languages/python.svg" alt="Python" className="w-20 h-20 object-contain" />
              
              {/* PyTorch */}
              <img src="/IT logos/others/pytorch-svgrepo-com.svg" alt="PyTorch" className="w-20 h-20 object-contain" />
              
              {/* Java Family */}
              {/* Java */}
              <img src="/IT logos/programming languages/java.svg" alt="Java" className="w-20 h-20 object-contain" />
              
              {/* Kotlin */}
              <img src="/IT logos/programming languages/kotlin.svg" alt="Kotlin" className="w-20 h-20 object-contain" />
              
              {/* C Family */}
              {/* C++ */}
              <img src="/IT logos/programming languages/c++.svg" alt="C++" className="w-20 h-20 object-contain" />
              
              {/* C */}
              <img src="/IT logos/programming languages/c.svg" alt="C" className="w-20 h-20 object-contain" />
              
              {/* Version Control */}
              {/* Git */}
              <img src="/IT logos/others/git.svg" alt="Git" className="w-20 h-20 object-contain" />
              
              {/* Github */}
              <img src="/IT logos/cloud/github.svg" alt="Github" className="w-20 h-20 object-contain invert" />
              
              {/* Database */}
              {/* SQL (PostgreSQL) */}
              <img src="/IT logos/databases/postgresql-vertical.svg" alt="SQL" className="w-20 h-20 object-contain" />
              
              {/* Cloud & DevOps */}
              {/* Azure */}
              <img src="/IT logos/cloud/azure.svg" alt="Azure" className="w-20 h-20 object-contain" />
              
              {/* Mobile Development */}
              {/* Android Studio */}
              <img src="/IT logos/ides/android-studio.svg" alt="Android Studio" className="w-20 h-20 object-contain" />
              
              {/* Jetpack Compose */}
              <img src="/IT logos/others/jetpackcompose-original.svg" alt="Jetpack Compose" className="w-20 h-20 object-contain" />
              
              {/* Hardware */}
              {/* Arduino */}
              <img src="/IT logos/others/arduino-official.svg" alt="Arduino" className="w-20 h-20 object-contain" />
              
              {/* Raspberry Pi */}
              <img src="/IT logos/others/raspberry-pi.svg" alt="Raspberry Pi" className="w-20 h-20 object-contain" />
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section id="education" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
            <span className="code-decoration">//</span>
            {getText({ en: 'Education', no: 'Utdanning' })}
          </h2>
          
          <div className="space-y-8">
            {cvData?.education?.filter(edu => !edu.degree.en.includes('Upper Secondary'))
              .sort((a, b) => {
                // Sort by start date (most recent first)
                // Convert YYYY-MM format to comparable number
                const getStartDateValue = (edu) => {
                  const startDate = edu.start || edu.startDate || ''
                  if (startDate === 'present') return 999999 // Present studies go first
                  const [year, month] = startDate.split('-').map(Number)
                  return year * 12 + (month || 0) // Convert to months since year 0
                }
                return getStartDateValue(b) - getStartDateValue(a)
              })
              .map((edu, index) => {
              // Define program URLs and button text based on degree and school
              const getProgramUrl = (edu) => {
                if (edu.degree.en.includes('MSc in Informatics: Programming and Systems Architecture')) {
                  return 'https://www.uio.no/studier/program/informatikk-programmering-master/'
                } else if (edu.degree.en.includes('BSc in Informatics: Design, Use, Interaction')) {
                  return 'https://www.uio.no/studier/program/inf-design/'
                } else if (edu.school.en.includes('Freie Universität Berlin')) {
                  return 'https://www.fu-berlin.de/en/index.html'
                }
                return null
              }

              const getButtonText = (edu) => {
                if (edu.school.en.includes('University of Oslo')) {
                  return { en: 'Visit Program', no: 'Besøk program' }
                } else if (edu.school.en.includes('Freie Universität Berlin')) {
                  return { en: 'Visit University', no: 'Besøk universitet' }
                }
                return { en: 'Learn More', no: 'Les mer' }
              }

              const programUrl = getProgramUrl(edu)
              const buttonText = getButtonText(edu)

              return (
              <div key={index} className="card-dark">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                  <h3 className="text-xl font-semibold text-white">
                    {getText(edu.degree)}
                  </h3>
                  <span className="text-ide-accent-purple font-mono text-sm">
                    {formatDateRange(edu.start, edu.end, language)}
                  </span>
                </div>
                <p className="text-ide-accent-orange font-medium mb-2">
                  {getText(edu.school)}
                </p>
                {edu.bullets[language]?.length > 0 && (
                    <ul className="text-ide-text space-y-1 mb-4">
                    {edu.bullets[language].map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="code-decoration mt-1">→</span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
                  {programUrl && (
                    <div className="pt-2">
                      <a
                        href={programUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-6 py-3 backdrop-blur-sm border transition-all duration-300 hover:scale-105 text-sm font-medium"
                        style={{
                          backgroundColor: 'rgba(34, 197, 94, 0.15)',
                          borderColor: 'rgba(34, 197, 94, 0.2)',
                          borderRadius: '2rem',
                          color: '#86efac',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <span>{getText(buttonText)}</span>
                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
              </div>
              )
            })}
          </div>
        </section>

        {/* Courses Section */}
        <section id="courses" className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
            <span className="code-decoration">[</span>
            {getText({ en: 'Courses', no: 'Emner' })}
            <span className="code-decoration">]</span>
          </h2>
          
          
          
          <div className="space-y-8">
            {(() => {
              const categorizedCourses = categorizeCourses(coursesData)
              const categories = [
                { 
                  key: 'informatics', 
                  title: { en: 'Informatics', no: 'Informatikk' }, 
                  courses: categorizedCourses.informatics 
                },
                { 
                  key: 'mediaCommunication', 
                  title: { en: 'Media and Communication', no: 'Medier og kommunikasjon' }, 
                  courses: categorizedCourses.mediaCommunication 
                },
                { 
                  key: 'other', 
                  title: { en: 'Other', no: 'Andre' }, 
                  courses: categorizedCourses.other 
                }
              ]

              return categories.map(category => {
                const isExpanded = expandedCategories[category.key]
                
                // Calculate courses per row based on screen size
                // Mobile: 1, Tablet: 2, Desktop: 3
                const getCoursesPerRow = () => {
                  if (typeof window !== 'undefined') {
                    if (window.innerWidth < 768) return 1
                    if (window.innerWidth < 1024) return 2
                    return 3
                  }
                  return 3 // Default for SSR
                }
                
                const coursesPerRow = getCoursesPerRow()
                const hasMore = category.courses.length > coursesPerRow
                
                // Always show all courses, but control visibility with container height
                const coursesToShow = category.courses

                return (
                  <div key={category.key} data-category={category.key} className="space-y-4">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                      <span className="code-decoration">//</span>
                      {getText(category.title)}
                      <span className="text-ide-accent-blue text-sm font-normal">
                        ({category.courses.length} {getText({ en: 'courses', no: 'emner' })})
                      </span>
                  </h3>
                  
                  {/* Filters for Informatics Courses */}
                  {category.key === 'informatics' && (
                    <div className="mb-6">
                      <h4 className="text-sm text-ide-accent-blue font-medium mb-4">
                        {getText({ en: 'Filter by Subject Area', no: 'Filtrer etter fagområde' })}
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {/* Subject Area Filter Buttons */}
                        {[
                          { key: 'programming', label: { en: 'Programming', no: 'Programmering' } },
                          { key: 'design', label: { en: 'Design', no: 'Design' } },
                          { key: 'algorithms-data', label: { en: 'Algorithms & Data', no: 'Algoritmer og data' } },
                          { key: 'computer-systems', label: { en: 'Computer Systems', no: 'Datasystemer' } }
                        ].map((filter) => {
                          const isActive = filters.subjectAreas.includes(filter.key)
                          return (
                            <button
                              key={filter.key}
                              onClick={() => toggleSubjectAreaFilter(filter.key)}
                              className={`px-6 py-3 text-sm font-medium transition-all duration-300 ${
                                isActive
                                  ? 'bg-ide-accent-blue text-white shadow-lg'
                                  : 'bg-transparent border border-ide-accent-blue text-ide-accent-blue hover:bg-ide-accent-blue/10'
                              }`}
                              style={{
                                borderRadius: '2rem'
                              }}
                            >
                              {getText(filter.label)}
                            </button>
                          )
                        })}
                        
                        {/* Clear All Filters Button */}
                        {filters.subjectAreas.length > 0 && (
                          <button
                            onClick={() => setFilters(prev => ({ ...prev, subjectAreas: [] }))}
                            className="px-6 py-3 text-sm font-medium transition-all duration-300 bg-transparent border border-red-400 text-red-400 hover:bg-red-400/10"
                            style={{
                              borderRadius: '2rem'
                            }}
                          >
                            {getText({ en: 'Clear All', no: 'Tøm alle' })}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                    
                    <div 
                      ref={el => categoryRefs.current[category.key] = el}
                      className={`course-container ${isExpanded ? 'expanded' : 'collapsed'}`}
                      style={{
                        maxHeight: isExpanded ? '5000px' : `${categoryHeights[category.key] || 200}px`,
                        transition: isResizing ? 'none' : 'max-height 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        overflow: 'hidden'
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
                        {coursesToShow.map((course, index) => {
                          return (
                            <div 
                              key={`${course.code}-${index}`}
                              className="card-dark flex flex-col justify-between"
                            >
                              <div className="flex-1">
                                <div className="mb-3">
                                  <span className="text-ide-accent-purple font-mono text-sm">
                                    {course.code}
                                  </span>
                                  <h4 className="text-lg font-semibold text-white mt-1">
                                    {getText(course.name)}
                                  </h4>
                                </div>
                                
                                <p className="text-ide-accent-orange text-sm mb-2">
                                  {getText(course.semester)} • {course.ects} ECTS
                                  {course.grade && (
                                    <span className="ml-2 text-ide-accent-green">
                                      Grade: {course.grade}
                                    </span>
                                  )}
                                </p>
                                
                                <p className="text-ide-text text-sm mb-4 text-wrap break-words">
                                  {getText(course.summary)}
                                </p>
                                
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {course.tags[language]?.map((tag, i) => (
                                    <Tag key={i} size="sm" variant="default">
                                      {tag}
                                    </Tag>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="flex gap-2 mt-auto">
                  <a
                    href={course.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 backdrop-blur-sm border transition-all duration-300 hover:scale-105 text-sm font-medium"
                    style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.15)',
                      borderColor: 'rgba(34, 197, 94, 0.2)',
                      borderRadius: '2rem',
                      color: '#86efac',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <span>{getText({ en: 'Course Info', no: 'Emneinfo' })}</span>
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  {course.pdfExam && (
                    <a
                      href={course.pdfExam}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3 backdrop-blur-sm border transition-all duration-300 hover:scale-105 text-sm font-medium"
                      style={{
                        backgroundColor: 'rgba(251, 146, 60, 0.15)',
                        borderColor: 'rgba(251, 146, 60, 0.2)',
                        borderRadius: '2rem',
                        color: '#fb923c',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <span>{getText({ en: 'Exam', no: 'Eksamen' })}</span>
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </a>
                  )}
                  {course.portfolioLink && (
                    <button
                      onClick={() => {
                        const element = document.querySelector(course.portfolioLink.replace('/software', ''))
                        if (element) {
                          const navbarHeight = 92 // Navbar height (h-20 + mt-3 = 80px + 12px)
                          const elementPosition = element.offsetTop - navbarHeight
                          window.scrollTo({ 
                            top: elementPosition, 
                            behavior: 'smooth' 
                          })
                        }
                      }}
                      className="inline-flex items-center justify-center px-6 py-3 backdrop-blur-sm border transition-all duration-300 hover:scale-105 text-sm font-medium ml-auto"
                      style={{
                        backgroundColor: 'rgba(34, 197, 94, 0.15)',
                        borderColor: 'rgba(34, 197, 94, 0.2)',
                        borderRadius: '2rem',
                        color: '#86efac',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <span>{getText({ en: 'Project', no: 'Prosjekt' })}</span>
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
                        )
                      })}
                      </div>
                    </div>

                    {hasMore && (
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleCategory(category.key)}
                          className="glass-bubble inline-flex items-center justify-center px-6 py-3 backdrop-blur-sm border transition-all duration-300 hover:scale-105 hover:shadow-xl text-sm font-medium group"
                          style={{
                            backgroundColor: 'rgba(59, 130, 246, 0.15)',
                            borderColor: 'rgba(59, 130, 246, 0.2)',
                            borderRadius: '2rem',
                            color: '#60a5fa'
                          }}
                        >
                          <span className="transition-all duration-300 group-hover:text-white">
                            {isExpanded 
                              ? getText({ en: 'Show Less', no: 'Vis mindre' })
                              : getText({ en: 'Show All', no: 'Vis alle' })
                            }
                          </span>
                          <svg 
                            className={`ml-2 w-4 h-4 transition-all duration-300 transform ${
                              isExpanded ? 'rotate-180' : 'rotate-0'
                            } group-hover:scale-110`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M19 9l-7 7-7-7" 
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            })()}
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
            <span className="code-decoration">{'<'}</span>
            {getText({ en: 'Projects', no: 'Prosjekter' })}
            <span className="code-decoration">{' / >'}</span>
          </h2>
          
          <div className="space-y-8">
            {portfolioProjects.map((project) => (
              <ProjectCard 
                key={project.id}
                project={project}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default SoftwarePage
