import globalStyles from './globalStyles';

const defaultHomeScreenTheme = {
  primary: globalStyles.COLORS.primary || '#3498db', // Header, buttons, QR code icon
  white: globalStyles.COLORS.white || '#fff', // Balance card, avatar background
  black: globalStyles.COLORS.black || '#2c3e50', // Text, avatar letter
  secondary: '#7f8c8d', // Balance title, transaction date
  background: '#fff', // Main container, white section
  serviceBackground: '#ecf0f1', // Service item background
  credit: '#2ecc71', // Credit transaction icon/amount
  debit: '#e74c3c', // Debit transaction icon/amount, error text
  link: globalStyles.COLORS.primary || '#3498db', // See All, Retry links
  retryButton: '#3498db', // Retry button background
  retryButtonText: '#fff', // Retry button text
  notificationIcon: '#fff', // Notification icon
};

// Function to create a custom HomeScreen theme
const createHomeScreenTheme = (customColors = {}) => ({
  ...defaultHomeScreenTheme,
  ...customColors,
});

// Export the default theme (can be overridden by calling createHomeScreenTheme)
export const homeScreenTheme = createHomeScreenTheme();

export default homeScreenTheme;