import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const typography = StyleSheet.create({
  heading: {
    color: colors.pureWhite,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subheading: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  body: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '500',
  },
  username: {
    color: colors.accentOrange,
    fontSize: 13,
    fontWeight: '700',
  },
});

export const shadows = StyleSheet.create({
  elevated: {
    shadowColor: colors.accentOrange,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  soft: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
});

export const glassDefaults = {
  cornerRadius: 16,
};