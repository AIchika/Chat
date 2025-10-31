import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Animated, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles/colors';

interface Props {
  avatarUrl?: string;
  name?: string;
}

export default function CoHostBubble({ avatarUrl, name }: Props) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scale, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [scale, opacity]);

  return (
    <Animated.View style={[styles.wrap, { transform: [{ scale }], opacity }]}> 
      <LinearGradient colors={['rgba(255,122,0,0.4)', 'transparent']} style={styles.gradient} />
      <Image
        source={{ uri: avatarUrl || 'https://placekitten.com/80/80' }}
        style={styles.avatar}
      />
      {name ? <Text style={styles.label} numberOfLines={1}>{name}</Text> : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  gradient: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,122,0,0.55)',
  },
  label: {
    color: colors.white,
    fontSize: 11,
    marginTop: 4,
    maxWidth: 60,
  },
});