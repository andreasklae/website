import { useState, useMemo } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

const CourseFilter = ({ courses, onTagsChange, selectedTags }) => {
  const { language, getText } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  // Extract all unique tags from courses
  const allTags = useMemo(() => {
    const tagSet = new Set()
    courses.forEach(course => {
      if (course.tags[language]) {
        course.tags[language].forEach(tag => tagSet.add(tag))
      }
    })
    return Array.from(tagSet).sort()
  }, [courses, language])

  const handleTagToggle = (tag) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag]
    onTagsChange(newTags)
  }

  const clearFilters = () => {
    onTagsChange([])
  }

  return (
    <div className="mb-6">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-ide-surface border border-ide-border text-ide-text hover:text-white rounded-lg transition-colors"
      >
        <span className="code-decoration">[]</span>
        {getText({ en: 'Filter by tags', no: 'Filtrer etter emneord' })}
        {selectedTags.length > 0 && (
          <span className="px-2 py-0.5 bg-ide-accent-purple/20 text-ide-accent-purple text-xs rounded">
            {selectedTags.length}
          </span>
        )}
        <span className={`code-decoration transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ↓
        </span>
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="mt-4 p-4 bg-ide-surface border border-ide-border rounded-lg">
          <div className="flex flex-wrap gap-2 mb-4">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`
                  px-3 py-1 text-sm rounded-full transition-colors
                  ${selectedTags.includes(tag)
                    ? 'bg-ide-accent-blue text-white'
                    : 'bg-ide-bg text-ide-text hover:bg-ide-accent-blue/20 hover:text-ide-accent-blue border border-ide-border'
                  }
                `}
              >
                {tag}
              </button>
            ))}
          </div>
          
          {selectedTags.length > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t border-ide-border">
              <span className="text-ide-text text-sm">
                {getText({ 
                  en: `Showing ${courses.filter(course => 
                    course.tags[language]?.some(tag => selectedTags.includes(tag))
                  ).length} of ${courses.length} courses`,
                  no: `Viser ${courses.filter(course => 
                    course.tags[language]?.some(tag => selectedTags.includes(tag))
                  ).length} av ${courses.length} emner`
                })}
              </span>
              <button
                onClick={clearFilters}
                className="text-ide-accent-orange hover:text-white text-sm transition-colors"
              >
                {getText({ en: 'Clear filters', no: 'Fjern filtre' })}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CourseFilter
