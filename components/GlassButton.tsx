import React, { useMemo } from 'react';
import { TouchableOpacity, ViewStyle, StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/colors';
import { shadows } from '../styles/global';

interface Props {
  onPress?: () => void;
  active?: boolean;
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
  label?: string;
}

export default function GlassButton({ onPress, active, style, children, label }: Props) {
  const borderColor = useMemo(
    () => (active ? 'rgba(255,122,0,0.9)' : 'rgba(255,122,0,0.45)'),
    [active]
  );
  const glowOpacity = active ? 0.6 : 0.25;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.button, { borderColor }, style]}>
      <LinearGradient
        colors={[`rgba(255,122,0,${glowOpacity})`, 'rgba(255,255,255,0.06)', 'transparent']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View style={styles.content}>{children}{label ? <Text style={styles.label}>{label}</Text> : null}</View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'relative',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    ...shadows.elevated,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.pureWhite,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});