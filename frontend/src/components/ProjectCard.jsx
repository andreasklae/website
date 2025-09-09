import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import ImageCarousel from './ImageCarousel'

const ProjectCard = ({ project }) => {
  const { getText } = useLanguage()
  const [showCarousel, setShowCarousel] = useState(false)

  const handleDownloadPDF = () => {
    if (project.pdfReport) {
      window.open(project.pdfReport, '_blank')
    }
  }

  const handleVisitWebsite = () => {
    if (project.link) {
      window.open(project.link, '_blank')
    }
  }

  return (
    <>
      <div id={project.id} className="card-dark group">
        {/* Project Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-white group-hover:text-ide-accent-blue transition-colors">
            {getText(project.title)}
          </h3>
          <div className="flex gap-2">
            {project.type === 'website' ? (
              <button
                onClick={handleVisitWebsite}
                className="px-3 py-1 bg-ide-accent-green/20 text-ide-accent-green hover:bg-ide-accent-green hover:text-ide-bg text-xs rounded transition-colors"
              >
                {getText({ en: 'Visit Website', no: 'Besøk nettside' })}
              </button>
            ) : project.pdfReport && (
              <button
                onClick={handleDownloadPDF}
                className="px-3 py-1 bg-ide-accent-orange/20 text-ide-accent-orange hover:bg-ide-accent-orange hover:text-ide-bg text-xs rounded transition-colors"
              >
                {getText({ en: 'Download PDF', no: 'Last ned PDF' })}
              </button>
            )}
          </div>
        </div>

        {/* Project Description */}
        <p className="text-ide-text mb-4">
          {getText(project.description)}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-ide-accent-purple/20 text-ide-accent-purple text-xs rounded font-mono"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Photos Section */}
        {project.photos && project.photos.length > 0 && (
          <div className="border-t border-ide-border pt-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-ide-text">
                {getText({ en: 'Project Photos', no: 'Prosjektbilder' })}
              </h4>
              <button
                onClick={() => setShowCarousel(true)}
                className="text-ide-accent-blue hover:text-white text-xs transition-colors"
              >
                {getText({ en: 'View All', no: 'Se alle' })} ({project.photos.length})
              </button>
            </div>
            
            {/* Photo Grid Preview */}
            <div className="grid grid-cols-3 gap-2">
              {project.photos.slice(0, 3).map((photo, index) => (
                <div
                  key={index}
                  className="aspect-video bg-ide-surface rounded overflow-hidden cursor-pointer group/img"
                  onClick={() => setShowCarousel(true)}
                >
                  <img
                    src={photo}
                    alt={`${getText(project.title)} - ${index + 1}`}
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            
            {project.photos.length > 3 && (
              <button
                onClick={() => setShowCarousel(true)}
                className="w-full mt-2 text-center text-ide-accent-blue hover:text-white text-sm py-2 border border-ide-border hover:border-ide-accent-blue rounded transition-colors"
              >
                +{project.photos.length - 3} {getText({ en: 'more photos', no: 'flere bilder' })}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Image Carousel Modal */}
      {showCarousel && (
        <ImageCarousel
          images={project.photos}
          title={getText(project.title)}
          onClose={() => setShowCarousel(false)}
        />
      )}
    </>
  )
}

export default ProjectCard
