import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const CourseFilter = ({ onTagsChange, courses }) => {
  const { t, language } = useLanguage();
  const [selectedTags, setSelectedTags] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Extract all unique tags from courses
  const allTags = [...new Set(
    courses.flatMap(course => course.tags[language] || course.tags.en || [])
  )].sort();

  const handleTagToggle = (tag) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newSelectedTags);
    onTagsChange(newSelectedTags);
  };

  const clearFilters = () => {
    setSelectedTags([]);
    onTagsChange([]);
  };

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-glass-dark flex items-center gap-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="font-mono text-dark-orange">filter</span>
        <span className="font-mono text-dark-muted">(</span>
        <span className="text-dark-purple">
          {selectedTags.length > 0 
            ? `${selectedTags.length} ${t({ en: 'selected', no: 'valgt' })}`
            : t({ en: 'all courses', no: 'alle emner' })
          }
        </span>
        <span className="font-mono text-dark-muted">)</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 card-glass-dark z-10 max-h-80 overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-dark-text">
                {t({ en: 'Filter by tags', no: 'Filtrer etter emneord' })}
              </h3>
              {selectedTags.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-dark-orange hover:text-dark-purple transition-colors text-sm font-mono"
                >
                  clear()
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              {allTags.map(tag => (
                <label
                  key={tag}
                  className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-dark-accent/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => handleTagToggle(tag)}
                    className="w-4 h-4 rounded border-2 border-dark-muted bg-transparent checked:bg-dark-purple checked:border-dark-purple focus:ring-2 focus:ring-dark-purple focus:ring-offset-2 focus:ring-offset-dark-bg"
                  />
                  <span className="text-dark-text font-mono text-sm">
                    #{tag}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default CourseFilter;
