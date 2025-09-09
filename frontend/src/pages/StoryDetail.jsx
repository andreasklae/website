import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getStoryData } from '../utils/dataUtils';
import LanguageToggle from '../components/LanguageToggle';
import Lightbox from '../components/Lightbox';

const StoryDetail = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedPart, setSelectedPart] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  const story = getStoryData(storyId);

  useEffect(() => {
    // Ensure light theme for photography pages
    document.documentElement.classList.remove('dark');
  }, []);

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t({ en: 'Story not found', no: 'Historie ikke funnet' })}
          </h1>
          <Link 
            to="/photography" 
            className="btn-glass-light"
          >
            {t({ en: 'Back to Photography', no: 'Tilbake til fotografering' })}
          </Link>
        </div>
      </div>
    );
  }

  const currentPart = story.parts[selectedPart];
  const allImages = currentPart?.highlights || [];

  const openLightbox = (imageIndex) => {
    setLightboxIndex(imageIndex);
    setSelectedImage(allImages[imageIndex]);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const goToNextPart = () => {
    if (selectedPart < story.parts.length - 1) {
      setSelectedPart(selectedPart + 1);
    }
  };

  const goToPreviousPart = () => {
    if (selectedPart > 0) {
      setSelectedPart(selectedPart - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/photography')}
              className="text-primary-600 hover:text-primary-700 transition-colors font-medium flex items-center gap-2"
            >
              ← {t({ en: 'Back to Photography', no: 'Tilbake til fotografering' })}
            </button>
            <LanguageToggle />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Story Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t(story.title)}
          </h1>
          
          {/* Part Navigation */}
          <div className="flex justify-center gap-2 mb-8">
            {story.parts.map((part, index) => (
              <button
                key={part.id}
                onClick={() => setSelectedPart(index)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  index === selectedPart
                    ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-200'
                    : 'bg-white/50 text-gray-600 hover:bg-white/70'
                }`}
              >
                {t({ en: `Part ${index + 1}`, no: `Del ${index + 1}` })}
              </button>
            ))}
          </div>
        </div>

        {/* Current Part Content */}
        {currentPart && (
          <div className="space-y-12">
            {/* Part Title and Description */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t(currentPart.title)}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {t(currentPart.description)}
              </p>
            </div>

            {/* Highlighted Photos */}
            <div className="space-y-8">
              <h3 className="text-2xl font-semibold text-gray-900 text-center">
                {t({ en: 'Highlights', no: 'Høydepunkter' })}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentPart.highlights.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-[4/3] bg-gray-200 rounded-xl overflow-hidden cursor-pointer group card-glass-light hover:shadow-xl transition-all duration-300"
                    onClick={() => openLightbox(index)}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                      <span className="text-gray-500 text-2xl">📸</span>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Photo Carousel Placeholder */}
            <div className="space-y-8">
              <h3 className="text-2xl font-semibold text-gray-900 text-center">
                {t({ en: 'All Photos', no: 'Alle bilder' })}
              </h3>
              
              <div className="card-glass-light text-center py-12">
                <div className="text-4xl mb-4">🎠</div>
                <p className="text-gray-600">
                  {t({
                    en: 'Photo carousel will be implemented here',
                    no: 'Fotokarusell vil bli implementert her'
                  })}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-8 border-t border-gray-200">
              <button
                onClick={goToPreviousPart}
                disabled={selectedPart === 0}
                className={`btn-glass-light flex items-center gap-2 ${
                  selectedPart === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                ← {t({ en: 'Previous Part', no: 'Forrige del' })}
              </button>

              <div className="text-center text-gray-600">
                {t({ en: `Part ${selectedPart + 1} of ${story.parts.length}`, no: `Del ${selectedPart + 1} av ${story.parts.length}` })}
              </div>

              <button
                onClick={goToNextPart}
                disabled={selectedPart === story.parts.length - 1}
                className={`btn-glass-light flex items-center gap-2 ${
                  selectedPart === story.parts.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {t({ en: 'Next Part', no: 'Neste del' })} →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <Lightbox
          images={allImages}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
};

export default StoryDetail;
