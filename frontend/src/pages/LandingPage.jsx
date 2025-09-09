import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getCVData } from '../utils/dataUtils';
import LanguageToggle from '../components/LanguageToggle';

const LandingPage = () => {
  const { t } = useLanguage();
  const cvData = getCVData();

  const ctaButtons = [
    {
      to: '/software',
      label: { en: 'Software { }', no: 'Programvare { }' },
      icon: '{ }',
      className: 'btn-glass-light hover:shadow-lg'
    },
    {
      to: '/photography',
      label: { en: 'Photography ⟡', no: 'Fotografering ⟡' },
      icon: '⟡',
      className: 'btn-glass-light hover:shadow-lg'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Language toggle in top right */}
      <div className="fixed top-6 right-6 z-10">
        <LanguageToggle />
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto text-center animate-fade-in">
        {/* Hero section */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 animate-slide-up">
            {t(cvData.name)}
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t(cvData.role)}
          </p>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
            {t(cvData.summary)}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          {ctaButtons.map((button, index) => (
            <Link
              key={index}
              to={button.to}
              className={`${button.className} text-lg font-semibold min-w-[200px] group relative overflow-hidden`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {t(button.label)}
              </span>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </Link>
          ))}
        </div>

        {/* Contact info */}
        <div className="card-glass-light max-w-md mx-auto mb-12">
          <div className="text-sm text-gray-600 space-y-2">
            <p className="flex items-center justify-center gap-2">
              <span>📧</span>
              <a 
                href={`mailto:${cvData.contacts.email}`}
                className="hover:text-primary-600 transition-colors"
              >
                {cvData.contacts.email}
              </a>
            </p>
            <p className="flex items-center justify-center gap-2">
              <span>📱</span>
              <a 
                href={`tel:${cvData.contacts.phone}`}
                className="hover:text-primary-600 transition-colors"
              >
                {cvData.contacts.phone}
              </a>
            </p>
            <p className="flex items-center justify-center gap-2">
              <span>📍</span>
              <span>{t(cvData.contacts.location)}</span>
            </p>
            {cvData.contacts.github && (
              <p className="flex items-center justify-center gap-2">
                <span>💻</span>
                <a 
                  href={cvData.contacts.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-600 transition-colors"
                >
                  GitHub
                </a>
              </p>
            )}
          </div>
        </div>

        {/* Chatbot placeholder */}
        <div className="card-glass-light max-w-sm mx-auto opacity-50">
          <div className="text-center text-gray-500">
            <div className="text-2xl mb-2">🤖</div>
            <p className="text-sm">
              {t({
                en: 'AI Chatbot coming soon...',
                no: 'AI Chatbot kommer snart...'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
