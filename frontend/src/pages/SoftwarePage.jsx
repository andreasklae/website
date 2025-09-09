import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { loadCVData, loadCoursesData, portfolioProjects, formatDateRange, parseMarkdownText } from '../utils/data.jsx'
import LanguageToggle from '../components/LanguageToggle'
import ProjectCard from '../components/ProjectCard'
import CourseFilter from '../components/CourseFilter'

const SoftwarePage = () => {
  const { getText, language } = useLanguage()
  const [cvData, setCvData] = useState(null)
  const [coursesData, setCoursesData] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [selectedTags, setSelectedTags] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cv, courses] = await Promise.all([
          loadCVData(),
          loadCoursesData()
        ])
        setCvData(cv)
        setCoursesData(courses)
        setFilteredCourses(courses)
        setLoading(false)
      } catch (error) {
        console.error('Error loading data:', error)
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleTagFilter = (tags) => {
    setSelectedTags(tags)
    if (tags.length === 0) {
      setFilteredCourses(coursesData)
    } else {
      const filtered = coursesData.filter(course =>
        course.tags[language]?.some(tag => tags.includes(tag))
      )
      setFilteredCourses(filtered)
    }
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
            <div className="card-dark max-w-4xl">
              <div className="text-ide-text text-lg leading-relaxed">
                {parseMarkdownText(getText(cvData.summary), true)}
              </div>
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
            {cvData?.education?.map((edu, index) => (
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
                  <ul className="text-ide-text space-y-1">
                    {edu.bullets[language].map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="code-decoration mt-1">→</span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Courses Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
            <span className="code-decoration">[]</span>
            {getText({ en: 'Courses', no: 'Emner' })}
          </h2>
          
          <CourseFilter 
            courses={coursesData}
            onTagsChange={handleTagFilter}
            selectedTags={selectedTags}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {filteredCourses.map((course, index) => (
              <div key={index} className="card-dark">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-white">
                    {getText(course.name)}
                  </h3>
                  <span className="text-ide-accent-purple font-mono text-sm">
                    {course.code}
                  </span>
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
                
                <div className="flex gap-2">
                  <a
                    href={course.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ide-accent-blue hover:text-white text-sm transition-colors"
                  >
                    {getText({ en: 'Course Info', no: 'Emneinfo' })} →
                  </a>
                  {course.portfolioLink && (
                    <a
                      href={course.portfolioLink}
                      className="text-ide-accent-green hover:text-white text-sm transition-colors ml-auto"
                    >
                      {getText({ en: 'Portfolio', no: 'Portefølje' })} →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section id="projects">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
            <span className="code-decoration">{'<>'}</span>
            {getText({ en: 'Projects', no: 'Prosjekter' })}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
