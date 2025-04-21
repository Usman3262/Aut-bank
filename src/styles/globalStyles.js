import { StyleSheet, Dimensions } from 'react-native';

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('screen');

// Color palette
const COLORS = {
  primary: '#d4a373',
  secondary: '#EA7300',
  background: '#FFFFFF',
  text: '#333333',
  placeholder: '#A9A9A9', // Ensure this is a visible color
  success: '#28A745',
  danger: '#DC3545',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#E5E7EB',
  dotActive: '#60A5FA',
  dotInactive: '#D1D5DB',
};

// Font sizes
const FONT_SIZES = {
  tiny: 10,
  small: 12,
  medium: 16,
  large: 20,
  xlarge: 32,
};

// Common spacing
const SPACING = {
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.medium,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  text: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
  },
  textTiny: {
    fontSize: FONT_SIZES.tiny,
    color: COLORS.text,
  },
  textSmall: {
    fontSize: FONT_SIZES.small,
    color: COLORS.secondary,
  },
  textSmallGray: {
    fontSize: FONT_SIZES.small,
    color: COLORS.placeholder,
    textAlign: 'center',
  },
  textLarge: {
    fontSize: FONT_SIZES.large,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  textXLarge: {
    fontSize: FONT_SIZES.xlarge,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  textXLargeBlack: {
    fontSize: FONT_SIZES.xlarge,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  textError: {
    fontSize: FONT_SIZES.small,
    color: COLORS.danger,
    marginBottom: SPACING.small,
  },
  textSuccess: {
    fontSize: FONT_SIZES.small,
    color: COLORS.success,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.medium,
  },
  circle: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  circlePrimary: {
    backgroundColor: COLORS.primary,
    marginRight: -20,
  },
  circleSecondary: {
    backgroundColor: COLORS.secondary,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.xlarge,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.small,
    width: width * 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.xlarge,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.small,
    width: width * 0.7,
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: SPACING.medium,
    paddingHorizontal: SPACING.xlarge,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.small,
    width: width * 0.7,
  },
  buttonOutlineText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SPACING.medium,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: SPACING.tiny,
  },
  dotActive: {
    backgroundColor: COLORS.dotActive,
  },
  dotInactive: {
    backgroundColor: COLORS.dotInactive,
  },
  dotFirst: {
    backgroundColor: COLORS.danger,
  },
  placeholderLogo: {
    fontSize: 100,
    color: COLORS.primary,
    marginBottom: SPACING.medium,
  },
  input: {
  width: '100%',
  height: 50,
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingHorizontal: 10,
  marginVertical: 10,
  fontSize: 16,
},
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: COLORS.danger,
    borderWidth: 1,
  },
  inputLabel: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    marginBottom: SPACING.tiny,
  },
  linkText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.text,
    marginTop: SPACING.medium,
  },
});

const globalStyles = {
  ...styles,
  SPACING,
  COLORS,
  FONT_SIZES,
};

export default globalStyles;