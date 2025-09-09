import { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Lightbox = ({ images, currentIndex, onClose, onNavigate }) => {
  const { t } = useLanguage();

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onNavigate(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNavigate(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length, onClose, onNavigate]);

  // Focus trap
  useEffect(() => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
      lightbox.focus();
    }
  }, []);

  const goToPrevious = () => {
    onNavigate(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
  };

  const goToNext = () => {
    onNavigate(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
  };

  return (
    <div
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
    >
      <div
        id="lightbox"
        className="relative max-w-6xl w-full max-h-full"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 text-white">
          <h2 id="lightbox-title" className="text-xl font-semibold">
            {t({ en: 'Photography Highlights', no: 'Fotografi høydepunkter' })}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">
              {currentIndex + 1} / {images.length}
            </span>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white/10"
              aria-label={t({ en: 'Close lightbox', no: 'Lukk lysboks' })}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Main Image */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <div className="w-full h-auto max-h-[80vh] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="aspect-[4/3] w-full max-w-4xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center rounded">
              <span className="text-6xl text-gray-400">📸</span>
            </div>
          </div>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-colors backdrop-blur-sm"
                aria-label={t({ en: 'Previous image', no: 'Forrige bilde' })}
              >
                ←
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-colors backdrop-blur-sm"
                aria-label={t({ en: 'Next image', no: 'Neste bilde' })}
              >
                →
              </button>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center text-gray-400 text-sm mt-6">
          <p>
            {t({
              en: 'Use arrow keys to navigate • Press Escape to close • Click outside to close',
              no: 'Bruk piltaster for å navigere • Trykk Escape for å lukke • Klikk utenfor for å lukke'
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Lightbox;
