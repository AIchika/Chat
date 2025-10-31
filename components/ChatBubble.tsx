import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Text, Animated } from 'react-native';
import GlassPanel from './GlassPanel';
import { colors } from '../styles/colors';
import { typography } from '../styles/global';

interface Props {
  avatarUrl?: string;
  username: string;
  message: string;
  highlighted?: boolean; // donation or pin
}

export default function ChatBubble({ avatarUrl, username, message, highlighted }: Props) {
  const spark = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!highlighted) return;
    Animated.sequence([
      Animated.timing(spark, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(spark, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [highlighted, spark]);

  const sparkStyle = {
    opacity: spark,
    transform: [{ scale: spark.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.1] }) }],
  };

  return (
    <GlassPanel style={styles.container}>
      <View style={styles.row}>
        <Image
          source={{ uri: avatarUrl || 'https://placekitten.com/60/60' }}
          style={styles.avatar}
        />
        <View style={styles.textWrap}>
          <Text style={[typography.username]}>{username}</Text>
          <Text style={[typography.body, styles.message]} numberOfLines={4}>{message}</Text>
        </View>
        {highlighted ? (
          <Animated.View style={[styles.spark, sparkStyle]} />
        ) : null}
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginVertical: 6,
    borderRadius: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,122,0,0.45)',
  },
  textWrap: {
    flex: 1,
  },
  message: {
    color: colors.white,
    marginTop: 2,
  },
  spark: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accentOrange,
    marginLeft: 8,
  },
});