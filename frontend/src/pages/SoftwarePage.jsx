import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { loadCVData, loadCoursesData, portfolioProjects, formatDateRange, parseMarkdownText } from '../utils/data.jsx'
import LanguageToggle from '../components/LanguageToggle'
import ProjectCard from '../components/ProjectCard'

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

  // Handle hash scrolling when component mounts
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      // Small delay to ensure the page has rendered
      setTimeout(() => {
        const element = document.querySelector(hash)
        if (element) {
          // Get navbar height and add offset
          const navbarHeight = 100 // Approximate navbar height
          const elementPosition = element.offsetTop - navbarHeight
          window.scrollTo({ 
            top: elementPosition, 
            behavior: 'smooth' 
          })
        }
      }, 100)
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
  }, [coursesData, filters])

  // Recalculate heights on window resize
  useEffect(() => {
    let resizeTimeout
    let lastWidth = window.innerWidth
    
    const handleResize = () => {
      const currentWidth = window.innerWidth
      
      // Only recalculate if the courses per row would actually change
      const getCoursesPerRow = (width) => {
        if (width < 768) return 1
        if (width < 1024) return 2
        return 3
      }
      
      const oldCoursesPerRow = getCoursesPerRow(lastWidth)
      const newCoursesPerRow = getCoursesPerRow(currentWidth)
      
      // Only proceed if the layout actually changes
      if (oldCoursesPerRow !== newCoursesPerRow) {
        setIsResizing(true)
        
        // Clear any existing timeout
        if (resizeTimeout) {
          clearTimeout(resizeTimeout)
        }
        
        // Debounce the resize handling
        resizeTimeout = setTimeout(() => {
          if (coursesData.length > 0) {
            const categorizedCourses = categorizeCourses(coursesData)
            const categories = ['informatics', 'mediaCommunication', 'other']
            
            categories.forEach(categoryKey => {
              const courses = categorizedCourses[categoryKey]
              if (courses.length > 0) {
                // Measure immediately without delay during resize
                measureCategoryHeight(categoryKey, newCoursesPerRow)
              }
            })
          }
          
          // Re-enable animations after resize is complete
          setTimeout(() => {
            setIsResizing(false)
          }, 50)
        }, 100) // Longer debounce to reduce jitter
      }
      
      lastWidth = currentWidth
    }

    window.addEventListener('resize', handleResize)
    
    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
    }
  }, [coursesData, filters])


  const applyFilters = (course) => {
    const tags = course.tags[language] || []
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
          return tags.some(tag => 
            tag === 'programming' || tag === 'programvareutvikling' || tag === 'software-engineering'
          )
        case 'design':
          return tags.some(tag => tag === 'design')
        case 'algorithms-data':
          return tags.some(tag => 
            tag === 'algorithms-and-data' || tag === 'algoritmer-og-data'
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
      if (tags.includes('informatikk') || tags.includes('informatics')) {
        if (applyFilters(course)) {
          categories.informatics.push(course)
        }
      } else if (tags.includes('medier-og-kommunikasjon') || tags.includes('media-communication')) {
        categories.mediaCommunication.push(course)
    } else {
        categories.other.push(course)
      }
    })

    return categories
  }

  const measureCategoryHeight = (categoryKey, coursesPerRow) => {
    const ref = categoryRefs.current[categoryKey]
    if (ref) {
      const grid = ref.querySelector('.grid')
      if (grid) {
        // Get the actual height of the first row by measuring the grid's scroll height
        // when we temporarily set it to show only the first row
        const originalHeight = grid.style.height
        const originalOverflow = grid.style.overflow
        
        // Temporarily set height to auto to get natural height
        grid.style.height = 'auto'
        grid.style.overflow = 'visible'
        
        // Get the height of just the first row
        const children = Array.from(grid.children)
        if (children.length > 0) {
          // Create a temporary container to measure just the first row
          const tempContainer = document.createElement('div')
          tempContainer.style.position = 'absolute'
          tempContainer.style.visibility = 'hidden'
          tempContainer.style.top = '-9999px'
          tempContainer.style.width = grid.offsetWidth + 'px'
          tempContainer.className = grid.className
          
          // Clone only the first row elements
          children.slice(0, coursesPerRow).forEach(child => {
            tempContainer.appendChild(child.cloneNode(true))
          })
          
          document.body.appendChild(tempContainer)
          const firstRowHeight = tempContainer.offsetHeight
          document.body.removeChild(tempContainer)
          
          // Restore original styles
          grid.style.height = originalHeight
          grid.style.overflow = originalOverflow
          
          setCategoryHeights(prev => ({
            ...prev,
            [categoryKey]: firstRowHeight
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
          const navbarHeight = 100 // Approximate navbar height
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
    <div className="min-h-screen text-ide-text animate-page-enter">
      <div className="max-w-7xl mx-auto px-6 pt-32 lg:pt-40 pb-12">
        {/* About Section */}
        <section className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="code-decoration">{'{'}</span>
            {getText({ en: 'Software Engineer', no: 'Programvareutvikler' })}
            <span className="code-decoration">{'}'}</span>
          </h1>
          
          {cvData && (
            <div className="text-ide-text text-lg leading-relaxed max-w-4xl">
                {parseMarkdownText(getText(cvData.summary), true)}
            </div>
          )}
        </section>

        {/* Education Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
            <span className="code-decoration">//</span>
            {getText({ en: 'Education', no: 'Utdanning' })}
          </h2>
          
          <div className="space-y-6">
            {cvData?.education?.filter(edu => !edu.degree.en.includes('Upper Secondary')).map((edu, index) => {
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
                <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
                  <h3 className="text-xl font-semibold text-white">
                    {getText(edu.degree)}
                  </h3>
                  <span className="text-ide-accent-blue font-mono text-sm">
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
                          backgroundColor: 'rgba(59, 130, 246, 0.15)',
                          borderColor: 'rgba(59, 130, 246, 0.2)',
                          borderRadius: '2rem',
                          color: '#60a5fa',
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
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
            <span className="code-decoration">[</span>
            {getText({ en: 'Courses', no: 'Emner' })}
            <span className="code-decoration">]</span>
          </h2>
          
          
          
          <div className="space-y-8 mt-8">
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
                              className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
                                isActive
                                  ? 'bg-ide-accent-blue text-white shadow-lg'
                                  : 'bg-transparent border border-ide-accent-blue text-ide-accent-blue hover:bg-ide-accent-blue/10'
                              }`}
                              style={{
                                borderRadius: '50px'
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
                            className="px-6 py-3 text-sm font-medium transition-all duration-200 bg-transparent border border-ide-accent-orange text-ide-accent-orange hover:bg-ide-accent-orange/10"
                            style={{
                              borderRadius: '50px'
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
                        transition: isResizing ? 'none' : 'max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                
                                <p className="text-ide-text text-sm mb-4">
                                  {getText(course.summary)}
                                </p>
                                
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {course.tags[language]?.map((tag, i) => (
                                    <span 
                                      key={i}
                                      className="px-2 py-1 bg-ide-accent-blue/20 text-ide-accent-blue text-xs rounded font-mono"
                                    >
                                      {tag}
                                    </span>
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
                      backgroundColor: 'rgba(59, 130, 246, 0.15)',
                      borderColor: 'rgba(59, 130, 246, 0.2)',
                      borderRadius: '2rem',
                      color: '#60a5fa',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <span>{getText({ en: 'Course Info', no: 'Emneinfo' })}</span>
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  {course.portfolioLink && (
                    <a
                      href={course.portfolioLink}
                      className="inline-flex items-center justify-center px-6 py-3 backdrop-blur-sm border transition-all duration-300 hover:scale-105 text-sm font-medium ml-auto"
                      style={{
                        backgroundColor: 'rgba(34, 197, 94, 0.15)',
                        borderColor: 'rgba(34, 197, 94, 0.2)',
                        borderRadius: '2rem',
                        color: '#4ade80',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <span>{getText({ en: 'Portfolio', no: 'Portefølje' })}</span>
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
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
                          className="glass-bubble inline-flex items-center justify-center px-6 py-3 backdrop-blur-sm border transition-all duration-500 hover:scale-105 hover:shadow-xl text-sm font-medium group"
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
                            className={`ml-2 w-4 h-4 transition-all duration-500 transform ${
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
