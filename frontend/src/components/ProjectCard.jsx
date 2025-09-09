import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import ImageCarousel from './ImageCarousel';

const ProjectCard = ({ project }) => {
  const { t } = useLanguage();
  const [showCarousel, setShowCarousel] = useState(false);

  const handleDownload = (pdfPath) => {
    // In a real app, this would handle PDF downloads
    window.open(pdfPath, '_blank');
  };

  const handleVisitWebsite = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="card-glass-dark group relative overflow-hidden">
      {/* Project Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-dark-text group-hover:text-dark-purple transition-colors">
          {t(project.title)}
        </h3>
        <div className="flex gap-2">
          {project.type === 'website' ? (
            <button
              onClick={() => handleVisitWebsite(project.link)}
              className="btn-glass-dark text-sm hover:bg-dark-purple/20"
              aria-label={t({ en: 'Visit Website', no: 'Besøk nettside' })}
            >
              🌐 {t({ en: 'Visit', no: 'Besøk' })}
            </button>
          ) : (
            project.pdfReport && (
              <button
                onClick={() => handleDownload(project.pdfReport)}
                className="btn-glass-dark text-sm hover:bg-dark-orange/20"
                aria-label={t({ en: 'Download PDF Report', no: 'Last ned PDF-rapport' })}
              >
                📄 PDF
              </button>
            )
          )}
          
          {project.githubLink && (
            <button
              onClick={() => handleVisitWebsite(project.githubLink)}
              className="btn-glass-dark text-sm hover:bg-dark-blue/20"
              aria-label={t({ en: 'View on GitHub', no: 'Se på GitHub' })}
            >
              💻 GitHub
            </button>
          )}
        </div>
      </div>

      {/* Project Description */}
      <p className="text-dark-muted mb-6 leading-relaxed">
        {t(project.description)}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {project.tags.map((tag, index) => (
          <span 
            key={index}
            className="px-3 py-1 bg-dark-accent text-dark-text text-sm rounded-full font-mono"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Image Preview & Carousel Button */}
      {project.images && project.images.length > 0 && (
        <div className="relative mb-4">
          <div 
            className="aspect-video bg-dark-accent rounded-lg overflow-hidden cursor-pointer group/image"
            onClick={() => setShowCarousel(true)}
          >
            <img
              src={project.images[0]}
              alt={t(project.title)}
              className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                <div className="bg-dark-surface/90 backdrop-blur-sm rounded-full p-3">
                  <span className="text-2xl">🖼️</span>
                </div>
              </div>
            </div>
          </div>
          
          {project.images.length > 1 && (
            <div className="absolute top-2 right-2 bg-dark-surface/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-dark-text">
              +{project.images.length - 1}
            </div>
          )}
        </div>
      )}

      {/* View Details Link */}
      <Link
        to={`/software/projects/${project.id}`}
        className="inline-flex items-center gap-2 text-dark-purple hover:text-dark-blue transition-colors font-medium"
      >
        <span>{t({ en: 'View Details', no: 'Se detaljer' })}</span>
        <span className="font-mono">→</span>
      </Link>

      {/* Image Carousel Modal */}
      {showCarousel && (
        <ImageCarousel
          images={project.images}
          title={t(project.title)}
          onClose={() => setShowCarousel(false)}
        />
      )}
    </div>
  );
};

export default ProjectCard;
