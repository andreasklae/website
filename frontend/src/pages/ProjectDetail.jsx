import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getProjectData } from '../utils/dataUtils';
import LanguageToggle from '../components/LanguageToggle';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const project = getProjectData(projectId);

  useEffect(() => {
    // Apply dark theme for software pages
    document.documentElement.classList.add('dark');
    
    return () => {
      // Remove dark theme when leaving page
      document.documentElement.classList.remove('dark');
    };
  }, []);

  if (!project) {
    return (
      <div className="min-h-screen bg-dark-bg text-dark-text flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-text mb-4">
            {t({ en: 'Project not found', no: 'Prosjekt ikke funnet' })}
          </h1>
          <Link 
            to="/software" 
            className="btn-glass-dark"
          >
            {t({ en: 'Back to Software', no: 'Tilbake til programvare' })}
          </Link>
        </div>
      </div>
    );
  }

  const handleDownload = (pdfPath) => {
    window.open(pdfPath, '_blank');
  };

  const handleVisitWebsite = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text">
      {/* Header */}
      <header className="bg-dark-surface border-b border-dark-accent sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/software')}
              className="text-dark-purple hover:text-dark-blue transition-colors font-mono flex items-center gap-2"
            >
              ← back()
            </button>
            <LanguageToggle className="btn-glass-dark" />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Project Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-dark-purple to-dark-blue bg-clip-text text-transparent">
            <span className="font-mono text-dark-orange">{'<'}</span>
            {t(project.title)}
            <span className="font-mono text-dark-orange">{' />'}</span>
          </h1>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            {project.type === 'website' ? (
              <button
                onClick={() => handleVisitWebsite(project.link)}
                className="btn-glass-dark hover:bg-dark-purple/20 flex items-center gap-2"
              >
                <span>🌐</span>
                {t({ en: 'Visit Website', no: 'Besøk nettside' })}
              </button>
            ) : (
              project.pdfReport && (
                <button
                  onClick={() => handleDownload(project.pdfReport)}
                  className="btn-glass-dark hover:bg-dark-orange/20 flex items-center gap-2"
                >
                  <span>📄</span>
                  {t({ en: 'Download Report', no: 'Last ned rapport' })}
                </button>
              )
            )}
            
            {project.githubLink && (
              <button
                onClick={() => handleVisitWebsite(project.githubLink)}
                className="btn-glass-dark hover:bg-dark-blue/20 flex items-center gap-2"
              >
                <span>💻</span>
                GitHub
              </button>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-3 mb-8">
            {project.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-4 py-2 bg-dark-accent text-dark-text rounded-full font-mono text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Project Description */}
        <div className="card-glass-dark mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="font-mono text-dark-orange">const</span>
            <span className="text-dark-purple">description</span>
            <span className="font-mono text-dark-muted">= {`"`}</span>
          </h2>
          <div className="ml-8 mb-4">
            <p className="text-dark-text leading-relaxed text-lg">
              {t(project.description)}
            </p>
          </div>
          <div className="font-mono text-dark-muted">{`"`};</div>
        </div>

        {/* Image Gallery */}
        {project.images && project.images.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <span className="font-mono text-dark-orange">const</span>
              <span className="text-dark-purple">gallery</span>
              <span className="font-mono text-dark-muted">= [</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-8 mb-4">
              {project.images.map((image, index) => (
                <div 
                  key={index}
                  className="aspect-video bg-dark-accent rounded-lg overflow-hidden group cursor-pointer"
                >
                  <div className="w-full h-full bg-gradient-to-br from-dark-accent to-dark-surface flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <span className="text-dark-muted text-2xl">🖼️</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="font-mono text-dark-muted">];</div>
          </div>
        )}

        {/* Technical Details Placeholder */}
        <div className="card-glass-dark">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="font-mono text-dark-orange">function</span>
            <span className="text-dark-purple">getTechnicalDetails</span>
            <span className="font-mono text-dark-muted">() {'{'}</span>
          </h2>
          <div className="ml-8 mb-4 text-dark-muted">
            <p className="mb-4">
              <span className="font-mono text-dark-blue">// </span>
              {t({
                en: 'Detailed technical information and implementation details will be loaded here',
                no: 'Detaljert teknisk informasjon og implementeringsdetaljer vil bli lastet her'
              })}
            </p>
            <p>
              <span className="font-mono text-dark-blue">return </span>
              <span className="text-dark-text">"{t({
                en: 'Technical documentation coming soon...',
                no: 'Teknisk dokumentasjon kommer snart...'
              })}"</span>
              <span className="font-mono text-dark-muted">;</span>
            </p>
          </div>
          <div className="font-mono text-dark-muted">{'}'}</div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
