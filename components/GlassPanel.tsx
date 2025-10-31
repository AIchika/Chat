import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, glass } from '../styles/colors';
import { shadows, glassDefaults } from '../styles/global';

interface Props {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
  tint?: 'light' | 'dark';
  cornerRadius?: number;
}

export default function GlassPanel({
  children,
  style,
  intensity = glass.blurIntensityHigh,
  tint = 'dark',
  cornerRadius = glassDefaults.cornerRadius,
}: Props) {
  return (
    <View style={[styles.container, { borderRadius: cornerRadius }, style]}>
      <BlurView intensity={intensity} tint={tint} style={[styles.blur, { borderRadius: cornerRadius }]} />
      <LinearGradient
        colors={[
          'rgba(255,122,0,0.25)',
          'rgba(173,216,230,0.15)',
          'rgba(255,182,193,0.15)',
          'transparent',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { borderRadius: cornerRadius }]}
      />
      <View style={[styles.overlay, { borderRadius: cornerRadius }]} />
      <View style={[styles.content, { borderRadius: cornerRadius }]}> {children} </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: colors.baseBlack,
    borderWidth: 1,
    borderColor: 'rgba(255,122,0,0.35)',
    ...shadows.soft,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: glass.overlayBg,
  },
  content: {
    padding: 12,
  },
});