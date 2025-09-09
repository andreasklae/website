import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getCVData, getCoursesData, getProjectData } from '../utils/dataUtils';
import LanguageToggle from '../components/LanguageToggle';
import ProjectCard from '../components/ProjectCard';
import CourseFilter from '../components/CourseFilter';

const SoftwarePage = () => {
  const { t } = useLanguage();
  const cvData = getCVData();
  const coursesData = getCoursesData();
  
  const [filteredCourses, setFilteredCourses] = useState(coursesData);
  const [selectedTags, setSelectedTags] = useState([]);

  // Project data
  const projects = [
    getProjectData('fjordquest-adventure'),
    getProjectData('in1060'),
    getProjectData('in2000'),
    getProjectData('ml-project')
  ].filter(Boolean);

  const handleTagFilter = (tags) => {
    setSelectedTags(tags);
    if (tags.length === 0) {
      setFilteredCourses(coursesData);
    } else {
      const filtered = coursesData.filter(course => 
        tags.some(tag => 
          course.tags.en.includes(tag) || course.tags.no.includes(tag)
        )
      );
      setFilteredCourses(filtered);
    }
  };

  useEffect(() => {
    // Apply dark theme for software page
    document.documentElement.classList.add('dark');
    
    return () => {
      // Remove dark theme when leaving page
      document.documentElement.classList.remove('dark');
    };
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text">
      {/* Header */}
      <header className="relative bg-dark-surface border-b border-dark-accent">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link 
              to="/" 
              className="text-dark-purple hover:text-dark-blue transition-colors font-mono"
            >
              ← back()
            </Link>
            <LanguageToggle className="btn-glass-dark" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-dark-purple to-dark-blue bg-clip-text text-transparent">
            <span className="font-mono text-dark-orange">{'<'}</span>
            {t({ en: 'Software Engineer', no: 'Programvareutvikler' })}
            <span className="font-mono text-dark-orange">{' />'}</span>
          </h1>
          <div className="text-lg text-dark-muted max-w-3xl mx-auto leading-relaxed">
            <span className="font-mono text-dark-purple">// </span>
            {t(cvData.summary)}
          </div>
        </section>

        {/* About Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="font-mono text-dark-orange">function</span>
            <span className="text-dark-purple">aboutMe</span>
            <span className="font-mono text-dark-muted">() {'{'}</span>
          </h2>
          <div className="card-glass-dark ml-8 mb-4">
            <p className="text-dark-text leading-relaxed">
              <span className="font-mono text-dark-blue">return </span>
              <span className="text-dark-text">"{t(cvData.summary)}"</span>
              <span className="font-mono text-dark-muted">;</span>
            </p>
          </div>
          <div className="font-mono text-dark-muted">{'}'}</div>
        </section>

        {/* Education Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="font-mono text-dark-orange">const</span>
            <span className="text-dark-purple">education</span>
            <span className="font-mono text-dark-muted">= [</span>
          </h2>
          <div className="space-y-6 ml-8">
            {cvData.education.map((edu, index) => (
              <div key={index} className="card-glass-dark">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-dark-text mb-2">
                      {t(edu.degree)}
                    </h3>
                    <p className="text-dark-blue font-medium">
                      {t(edu.school)}
                    </p>
                    {edu.bullets && edu.bullets.en && edu.bullets.en.length > 0 && (
                      <ul className="mt-3 text-dark-muted text-sm list-disc list-inside">
                        {t(edu.bullets).map((bullet, idx) => (
                          <li key={idx}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="text-right text-dark-muted font-mono text-sm">
                    <div>{edu.start} - {edu.end}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="font-mono text-dark-muted mt-4">];</div>
        </section>

        {/* Courses Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="font-mono text-dark-orange">const</span>
            <span className="text-dark-purple">courses</span>
            <span className="font-mono text-dark-muted">= await getCourses(</span>
          </h2>
          
          <div className="ml-8 mb-6">
            <CourseFilter onTagsChange={handleTagFilter} courses={coursesData} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-8">
            {filteredCourses.map((course, index) => (
              <div key={index} className="card-glass-dark">
                <div className="flex justify-between items-start mb-3">
                  <div className="font-mono text-dark-orange text-sm">
                    {course.code}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-dark-muted text-sm">{course.ects} ECTS</span>
                    {course.grade && (
                      <span className="bg-dark-purple px-2 py-1 rounded text-xs font-medium">
                        {course.grade}
                      </span>
                    )}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-dark-text mb-3">
                  {t(course.name)}
                </h3>
                
                <p className="text-dark-muted text-sm mb-4 leading-relaxed">
                  {t(course.summary)}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {t(course.tags).map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-1 bg-dark-accent text-dark-text text-xs rounded font-mono"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-dark-muted">{t(course.semester)}</span>
                  <div className="flex gap-2">
                    {course.link && (
                      <a 
                        href={course.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-dark-blue hover:text-dark-purple transition-colors"
                      >
                        UiO
                      </a>
                    )}
                    {course.portfolioLink && (
                      <Link 
                        to={course.portfolioLink}
                        className="text-dark-purple hover:text-dark-blue transition-colors"
                      >
                        Portfolio
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="font-mono text-dark-muted mt-4">);</div>
        </section>

        {/* Projects Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="font-mono text-dark-orange">class</span>
            <span className="text-dark-purple">Projects</span>
            <span className="font-mono text-dark-muted">{'{'}</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ml-8">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          
          <div className="font-mono text-dark-muted mt-8">{'}'}</div>
        </section>
      </div>
    </div>
  );
};

export default SoftwarePage;
