import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      'Welcome': 'Welcome',
      'Login': 'Login',
      'Dashboard': 'Dashboard',
      'Driver Dashboard': 'Driver Dashboard',
      'Vehicle Tracking': 'Vehicle Tracking',
      'Reports': 'Reports',
      'Admin': 'Admin',
      'Submit': 'Submit',
      'Report Issue': 'Report Issue',
      'Track Vehicle': 'Track Vehicle',
      'View Schedules': 'View Schedules',
      'Next Pickup': 'Next Pickup',
      'Waste Segregation Tips': 'Waste Segregation Tips',
      'Community Leaderboard': 'Community Leaderboard',
      'Your Points': 'Your Points',
      'Incident Reporting': 'Incident Reporting',
      'Live Status / Location': 'Live Status / Location',
      'Assigned Route': 'Assigned Route',
      'Today\'s Route & Schedule': "Today's Route & Schedule",
      'Language': 'Language',
    }
  },
  kn: {
    translation: {
      'Welcome': 'ಸ್ವಾಗತ',
      'Login': 'ಲಾಗಿನ್',
      'Dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      'Driver Dashboard': 'ಚಾಲಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      'Vehicle Tracking': 'ವಾಹನ ಟ್ರ್ಯಾಕಿಂಗ್',
      'Reports': 'ವರದಿಗಳು',
      'Admin': 'ನಿರ್ವಾಹಕ',
      'Submit': 'ಸಲ್ಲಿಸು',
      'Report Issue': 'ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ',
      'Track Vehicle': 'ವಾಹನವನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
      'View Schedules': 'ವೇಳಾಪಟ್ಟಿಗಳನ್ನು ನೋಡಿ',
      'Next Pickup': 'ಮುಂದಿನ ಸಂಗ್ರಹ',
      'Waste Segregation Tips': 'ಮಾಲಿನ್ಯ ವಿಭಜನೆ ಸಲಹೆಗಳು',
      'Community Leaderboard': 'ಸಮುದಾಯ ಲೀಡರ್ಬೋರ್ಡ್',
      'Your Points': 'ನಿಮ್ಮ ಅಂಕಗಳು',
      'Incident Reporting': 'ಘಟನೆ ವರದಿ',
      'Live Status / Location': 'ನೈಜ ಸ್ಥಿತಿ / ಸ್ಥಳ',
      'Assigned Route': 'ನಿಯೋಜಿತ ಮಾರ್ಗ',
      'Today\'s Route & Schedule': 'ಇಂದು ಮಾರ್ಗ ಮತ್ತು ವೇಳಾಪಟ್ಟಿ',
      'Language': 'ಭಾಷೆ',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n; 