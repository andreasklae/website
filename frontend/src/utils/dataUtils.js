// Import JSON data
import personalData from '../data/personal.json';
import cvData from '../data/cv.json';
import coursesData from '../data/courses.json';

// Data getters
export const getPersonalData = () => personalData;
export const getCVData = () => cvData;
export const getCoursesData = () => coursesData;

// Portfolio data utilities
export const getProjectData = (projectId) => {
  const projects = {
    'fjordquest-adventure': {
      id: 'fjordquest-adventure',
      title: {
        en: 'Fjord Quest Adventure Website',
        no: 'Fjord Quest Adventure nettside'
      },
      description: {
        en: 'A high-end travel website for Fjord Quest Adventure, a Norwegian luxury travel company. Built with React, Tailwind, and shadcn/ui, it integrates JSON and Markdown content for daytrips, accommodations, and services.',
        no: 'En eksklusiv reiseside for Fjord Quest Adventure, et norsk luksusreiseselskap. Bygget med React, Tailwind og shadcn/ui, integrerer den JSON- og Markdown-innhold for dagsturer, overnatting og tjenester.'
      },
      tags: ['React', 'Tailwind CSS', 'JavaScript', 'Web Design'],
      link: 'https://www.fjordquestadventure.no/',
      type: 'website',
      images: [
        '/src/data/portfolio/Software engineering/Fjordquest adventure/Photos/landingpage.jpg',
        '/src/data/portfolio/Software engineering/Fjordquest adventure/Photos/landingpage2.jpg',
        '/src/data/portfolio/Software engineering/Fjordquest adventure/Photos/activitiespage.jpg'
      ]
    },
    'in1060': {
      id: 'in1060',
      title: {
        en: 'Smart Temperature Logger',
        no: 'Smart temperaturlogger'
      },
      description: {
        en: 'Arduino-based temperature logging device for restaurant health inspections. Features ESP32 microcontroller, custom-calibrated thermistor sensors, LCD display, and Antarctic-inspired minimalist design.',
        no: 'Arduino-basert temperaturlogging-enhet for restauranthelseinspeksjoner. Har ESP32-mikrokontroller, egenkalibrerte termistor-sensorer, LCD-display og antarktisk-inspirert minimalistisk design.'
      },
      tags: ['Arduino', 'ESP32', 'IoT', 'Hardware', 'UX Design'],
      pdfReport: '/src/data/portfolio/Software engineering/IN1060/Teknisk rapport.pdf',
      type: 'hardware',
      images: [
        '/src/data/portfolio/Software engineering/IN1060/photos/prototype_finished_front.png',
        '/src/data/portfolio/Software engineering/IN1060/photos/prototype_finished.png',
        '/src/data/portfolio/Software engineering/IN1060/photos/UI_sketch_3d.png'
      ]
    },
    'in2000': {
      id: 'in2000',
      title: {
        en: 'VærSmart Weather App',
        no: 'VærSmart vær-app'
      },
      description: {
        en: 'Award-winning weather app designed for young users (13-25), featuring AI-powered mascot "Mr. Praktisk" for personalized weather advice. Built with Android/Kotlin and integrates MET.no APIs.',
        no: 'Prisvinnende vær-app designet for unge brukere (13-25), med AI-drevet maskot "Mr. Praktisk" for personlige værråd. Bygget med Android/Kotlin og integrerer MET.no APIer.'
      },
      tags: ['Android', 'Kotlin', 'MVVM', 'API Integration', 'UX Research'],
      pdfReport: '/src/data/portfolio/Software engineering/IN2000/Rapport.pdf',
      githubLink: 'https://github.com/andreasklae/varsmart',
      type: 'mobile',
      images: [
        '/src/data/portfolio/Software engineering/IN2000/Photos/front_page.png',
        '/src/data/portfolio/Software engineering/IN2000/Photos/farevarsel_screen_map.png',
        '/src/data/portfolio/Software engineering/IN2000/Photos/Settings_screen.png'
      ]
    },
    'ml-project': {
      id: 'ml-project',
      title: {
        en: 'GraphSynergy: Drug Synergy Prediction',
        no: 'GraphSynergy: Legemiddelsynergi-prediksjon'
      },
      description: {
        en: 'Graph neural network research project for predicting drug combination synergy using protein-protein interaction networks. Comprehensive evaluation of AI-assisted drug discovery approaches.',
        no: 'Graf-nevralt nettverk forskningsprosjekt for å forutsi legemiddelkombinasjon-synergi ved bruk av protein-protein interaksjonsnettverk. Omfattende evaluering av AI-assisterte legemiddeloppdagelsesmetoder.'
      },
      tags: ['Python', 'PyTorch', 'Graph Neural Networks', 'Bioinformatics', 'Machine Learning'],
      pdfReport: '/src/data/portfolio/Software engineering/ML project/Rapport.pdf',
      githubLink: 'https://github.com/julianhesse/GraphSynergy_Swp',
      type: 'research',
      images: [] // Will be populated from the photos directory
    }
  };
  
  return projects[projectId] || null;
};

// Photography data utilities
export const getPhotographyHighlights = () => {
  // This would typically scan the highlights directory
  // For now, return a placeholder structure
  return [
    // Will be populated with actual image paths
  ];
};

export const getPhotographyStories = () => {
  return [
    {
      id: 'stavern-sommer-2025',
      title: {
        en: 'Stavern Summer 2025',
        no: 'Stavern sommer 2025'
      },
      coverImage: '/src/data/portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/Highlights/04CAB51D-54E2-4453-8D28-C36321A46635_1_105_c.jpeg',
      parts: [
        {
          id: 'part-1',
          title: {
            en: 'Cabin Days',
            no: 'Dager på hytta'
          },
          description: {
            en: 'Short, salty days around the grill. Evenings with small laughs and the sea settling in.',
            no: 'Korte, salte dager rundt grillen. Kvelder med lave lattere mens sjøen legger seg.'
          },
          highlights: [
            '/src/data/portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/Highlights/04CAB51D-54E2-4453-8D28-C36321A46635_1_105_c.jpeg',
            '/src/data/portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/Highlights/23E90F2C-3975-432C-850C-CD6A49B74DDB_1_105_c.jpeg',
            '/src/data/portfolio/photography/Stavern sommer 2025/photos/Part 1 - Cabin Days/Highlights/68209391-AA1C-4272-A78D-E2E7EC5CD546_1_105_c.jpeg'
          ]
        },
        {
          id: 'part-2',
          title: {
            en: 'Coastal Walks',
            no: 'Kystturer'
          },
          description: {
            en: 'Walking, swimming, volleyball—and sunsets that kept us out longer than planned.',
            no: 'Gåturer, bading, volleyball—og solnedganger som holdt oss ute lenger enn planlagt.'
          },
          highlights: [
            '/src/data/portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/highlights/0CF0A802-D8A2-44EC-80DB-8509AB5960DC_1_105_c.jpeg',
            '/src/data/portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/highlights/1AAB2DEA-765F-466C-B563-895DDB2511CD_1_105_c.jpeg',
            '/src/data/portfolio/photography/Stavern sommer 2025/photos/Part 2 - Coastal Walks/highlights/34CEC9DA-1E89-4166-A46F-59904B6CE428_1_105_c.jpeg'
          ]
        },
        {
          id: 'part-3',
          title: {
            en: 'Festival Day',
            no: 'Festivallørdag'
          },
          description: {
            en: 'Saturday was noise and color. Music, glitter, and shared smiling buzz at Stavernfestivalen.',
            no: 'Lørdagen var lyd og farger. Musikk, glitter og felles god stemning på Stavernfestivalen.'
          },
          highlights: [
            '/src/data/portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/highlights/1DD4F0E1-95E5-4AF9-9FAD-3F6AFE1E1AC6_1_105_c.jpeg',
            '/src/data/portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/highlights/284A1B7B-F731-4DCA-8735-A01FFC325FB4_1_105_c.jpeg',
            '/src/data/portfolio/photography/Stavern sommer 2025/photos/Part 3 - Festival Day/highlights/3A378108-010C-4944-AEED-66519AFCC108_1_105_c.jpeg'
          ]
        },
        {
          id: 'part-4',
          title: {
            en: 'The Walk Home',
            no: 'Turen hjem'
          },
          description: {
            en: 'A field that caught my eye, a doe that vanished, and golden tall straws in warm silence.',
            no: 'Et jorde som fanget blikket mitt, et rådyr som forsvant, og gylne, høye strå i varm stillhet.'
          },
          highlights: [
            '/src/data/portfolio/photography/Stavern sommer 2025/photos/Part 4 - The Walk Home/Highlights/0F072DF0-6376-47A4-9EA6-0F6E2709CE92_1_105_c.jpeg',
            '/src/data/portfolio/photography/Stavern sommer 2025/photos/Part 4 - The Walk Home/Highlights/1B28F38D-D879-4965-AAE1-F24967382940_1_105_c.jpeg',
            '/src/data/portfolio/photography/Stavern sommer 2025/photos/Part 4 - The Walk Home/Highlights/3CE8CF6A-912F-49D9-BC16-DCAEEDDE8158_1_105_c.jpeg'
          ]
        }
      ]
    }
  ];
};

export const getStoryData = (storyId) => {
  const stories = getPhotographyStories();
  return stories.find(story => story.id === storyId) || null;
};
