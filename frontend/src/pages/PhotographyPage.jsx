import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getPhotographyHighlights, getPhotographyStories } from '../utils/dataUtils';
import LanguageToggle from '../components/LanguageToggle';
import Lightbox from '../components/Lightbox';

const PhotographyPage = () => {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  const highlights = getPhotographyHighlights();
  const stories = getPhotographyStories();

  // Sample highlights from the Stavern story for now
  const sampleHighlights = [
    '/src/data/portfolio/photography/highlights/sample1.jpeg',
    '/src/data/portfolio/photography/highlights/sample2.jpeg',
    '/src/data/portfolio/photography/highlights/sample3.jpeg',
    '/src/data/portfolio/photography/highlights/sample4.jpeg',
    '/src/data/portfolio/photography/highlights/sample5.jpeg',
    '/src/data/portfolio/photography/highlights/sample6.jpeg',
  ];

  useEffect(() => {
    // Ensure light theme for photography page
    document.documentElement.classList.remove('dark');
  }, []);

  const openLightbox = (imageIndex) => {
    setLightboxIndex(imageIndex);
    setSelectedImage(sampleHighlights[imageIndex]);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link 
              to="/" 
              className="text-primary-600 hover:text-primary-700 transition-colors font-medium"
            >
              ← {t({ en: 'Back to Home', no: 'Tilbake til hjem' })}
            </Link>
            <LanguageToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t({ en: 'Photography', no: 'Fotografering' })} ⟡
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t({
              en: 'Capturing moments, stories, and the beauty found in everyday life through the lens.',
              no: 'Fanger øyeblikk, historier og skjønnheten som finnes i hverdagslivet gjennom linsen.'
            })}
          </p>
        </section>

        {/* Highlights Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t({ en: 'Highlights', no: 'Høydepunkter' })}
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            {t({
              en: 'A curated selection of my favorite photographs from various projects and moments.',
              no: 'Et utvalg av mine favorittbilder fra ulike prosjekter og øyeblikk.'
            })}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleHighlights.map((image, index) => (
              <div
                key={index}
                className="aspect-square bg-gray-200 rounded-xl overflow-hidden cursor-pointer group card-glass-light hover:shadow-xl transition-all duration-300"
                onClick={() => openLightbox(index)}
              >
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  <span className="text-gray-500 text-lg">📸</span>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Stories Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t({ en: 'Stories', no: 'Historier' })}
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            {t({
              en: 'Photo series that tell complete stories, from travels to everyday adventures.',
              no: 'Fotoserier som forteller komplette historier, fra reiser til hverdagslige eventyr.'
            })}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {stories.map((story) => (
              <Link
                key={story.id}
                to={`/photography/stories/${story.id}`}
                className="group card-glass-light hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Story Cover Image */}
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-200 to-indigo-300 mb-6 rounded-lg overflow-hidden relative">
                  <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <span className="text-4xl">🌅</span>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>

                {/* Story Info */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {t(story.title)}
                  </h3>
                  
                  <div className="text-gray-600">
                    <p className="mb-2">
                      {story.parts.length} {t({ en: 'parts', no: 'deler' })}
                    </p>
                    <p className="text-sm">
                      {t({
                        en: 'A photographic journey through different moments and experiences.',
                        no: 'En fotografisk reise gjennom forskjellige øyeblikk og opplevelser.'
                      })}
                    </p>
                  </div>

                  {/* Preview of parts */}
                  <div className="flex gap-2 pt-2">
                    {story.parts.slice(0, 4).map((part, index) => (
                      <div 
                        key={part.id}
                        className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500"
                      >
                        {index + 1}
                      </div>
                    ))}
                    {story.parts.length > 4 && (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
                        +{story.parts.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <Lightbox
          images={sampleHighlights}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
};

export default PhotographyPage;
