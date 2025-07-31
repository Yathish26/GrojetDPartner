import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Common color palette
export const Colors = {
  // Primary colors
  primary: '#4F46E5',
  primaryLight: '#C7D2FE',
  
  // Success colors
  success: '#059669',
  successLight: '#BBF7D0',
  successBg: '#F0FDF4',
  
  // Error colors
  error: '#DC2626',
  errorLight: '#FECACA',
  errorBg: '#FEF2F2',
  
  // Warning colors
  warning: '#D97706',
  warningLight: '#FDE68A',
  warningBg: '#FFFBEB',
  
  // Neutral colors
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
};

// Common typography
export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: '600',
    color: Colors.gray800,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.gray800,
  },
  h3: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.gray800,
  },
  h4: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.gray800,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.gray700,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.gray600,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.gray500,
  },
  button: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.white,
  },
};

// Common spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Common border radius
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 999,
};

// Common component styles
export const CommonStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  
  // Cards
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  cardShadow: {
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  // Buttons
  button: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonSuccess: {
    backgroundColor: Colors.success,
  },
  buttonError: {
    backgroundColor: Colors.error,
  },
  buttonDisabled: {
    backgroundColor: Colors.gray400,
  },
  buttonText: {
    ...Typography.button,
  },
  
  // Input fields
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorBg,
  },
  textInput: {
    flex: 1,
    marginLeft: Spacing.md,
    ...Typography.body,
  },
  
  // Headers
  header: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  
  // Text styles
  title: Typography.h2,
  subtitle: {
    ...Typography.body,
    color: Colors.gray600,
  },
  caption: Typography.caption,
  
  // Utility classes
  row: {
    flexDirection: 'row',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  spaceAround: {
    justifyContent: 'space-around',
  },
  alignCenter: {
    alignItems: 'center',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  
  // Margins and padding
  mt: (size) => ({ marginTop: size }),
  mb: (size) => ({ marginBottom: size }),
  ml: (size) => ({ marginLeft: size }),
  mr: (size) => ({ marginRight: size }),
  mx: (size) => ({ marginHorizontal: size }),
  my: (size) => ({ marginVertical: size }),
  pt: (size) => ({ paddingTop: size }),
  pb: (size) => ({ paddingBottom: size }),
  pl: (size) => ({ paddingLeft: size }),
  pr: (size) => ({ paddingRight: size }),
  px: (size) => ({ paddingHorizontal: size }),
  py: (size) => ({ paddingVertical: size }),
});

// Alert styles
export const AlertStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: Spacing.xl,
  },
  alertContainer: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 2,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTitle: {
    ...Typography.h4,
    marginBottom: 4,
  },
  alertMessage: {
    ...Typography.bodySmall,
    color: Colors.gray600,
    lineHeight: 20,
  },
  alertButton: {
    ...CommonStyles.button,
    paddingVertical: Spacing.md,
  },
  alertButtonText: {
    ...Typography.button,
  },
});

export default {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  CommonStyles,
  AlertStyles,
};
