import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const ImageCarousel = ({ images, title, onClose }) => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  // Focus trap
  useEffect(() => {
    const carousel = document.getElementById('image-carousel');
    if (carousel) {
      carousel.focus();
    }
  }, []);

  const goToPrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : images.length - 1);
  };

  const goToNext = () => {
    setCurrentIndex(prev => prev < images.length - 1 ? prev + 1 : 0);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="carousel-title"
    >
      <div
        id="image-carousel"
        className="relative max-w-5xl w-full max-h-full"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 text-white">
          <h2 id="carousel-title" className="text-xl font-semibold">
            {title}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">
              {currentIndex + 1} / {images.length}
            </span>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors p-2"
              aria-label={t({ en: 'Close carousel', no: 'Lukk karusell' })}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Main Image */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <img
            src={images[currentIndex]}
            alt={`${title} - ${t({ en: 'Image', no: 'Bilde' })} ${currentIndex + 1}`}
            className="w-full h-auto max-h-[70vh] object-contain"
          />

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                aria-label={t({ en: 'Previous image', no: 'Forrige bilde' })}
              >
                ←
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                aria-label={t({ en: 'Next image', no: 'Neste bilde' })}
              >
                →
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-4 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-white shadow-lg'
                    : 'border-gray-600 hover:border-gray-400'
                }`}
                aria-label={`${t({ en: 'Go to image', no: 'Gå til bilde' })} ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`${title} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="text-center text-gray-400 text-sm mt-4">
          <p>
            {t({
              en: 'Use arrow keys to navigate • Press Escape to close',
              no: 'Bruk piltaster for å navigere • Trykk Escape for å lukke'
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
