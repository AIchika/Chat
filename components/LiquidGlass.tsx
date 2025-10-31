import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

export type LiquidGlassProps = {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
  tint?: 'dark' | 'light' | 'default';
  glowColor?: string; // neon accent
};

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  style,
  intensity = 30,
  tint = 'dark',
  glowColor = '#ff6a00',
}) => {
  return (
    <BlurView intensity={intensity} tint={tint} style={[styles.glass, style, getGlow(glowColor)]}>
      {children}
    </BlurView>
  );
};

function getGlow(color: string) {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    borderColor: color,
    borderWidth: StyleSheet.hairlineWidth,
  } as ViewStyle;
}

const styles = StyleSheet.create({
  glass: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(15,15,20,0.35)',
  },
});

export default LiquidGlass;