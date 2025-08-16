import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStreams } from '@/providers/StreamProvider';
import { Share2, Play, Users } from 'lucide-react-native';

interface ClipItem {
  id: string;
  title: string;
  thumbnail: string;
  views: string;
  streamer: string;
}

export default function ClipsScreen() {
  const { liveStreams } = useStreams();
  const { width } = Dimensions.get('window');
  const cardW = Math.floor((width - 16 * 2 - 8) / 2);

  const clips = useMemo<ClipItem[]>(() => {
    return liveStreams.slice(0, 20).map((s, idx) => ({
      id: `clip-${s.id}-${idx}`,
      title: `${s.title}`,
      thumbnail: s.thumbnail.replace('/400/225', '/400/400'),
      views: `${Math.floor(Math.random() * 900 + 100)}K`,
      streamer: s.streamer,
    }));
  }, [liveStreams]);

  const renderItem = ({ item }: { item: ClipItem }) => (
    <TouchableOpacity
      style={[styles.card, { width: cardW, height: cardW * 1.4 }]}
      activeOpacity={0.85}
      onPress={() => router.push(`/stream/${item.id.replace('clip-','').split('-').slice(0,2).join('-')}`)}
      testID={`clip-${item.id}`}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <View style={styles.overlay} />
      <View style={styles.playBadge}>
        <Play size={12} color="#0b0b0d" />
        <Text style={styles.playText}>Play</Text>
      </View>
      <View style={styles.metaRow}>
        <Text numberOfLines={2} style={styles.title}>{item.title}</Text>
        <View style={styles.viewsRow}>
          <Users size={12} color="#c9ced6" />
          <Text style={styles.viewsText}>{item.views}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.shareBtn}>
        <Share2 size={14} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Clips', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0b0b0d' } }} />
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <FlatList
          contentContainerStyle={{ padding: 16, gap: 8 }}
          columnWrapperStyle={{ gap: 8 }}
          data={clips}
          renderItem={renderItem}
          keyExtractor={(it) => it.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          testID="clips-grid"
          ListEmptyComponent={<Text style={{ color: '#c9ced6', textAlign: 'center', marginTop: 32 }}>No clips yet</Text>}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b0d' },
  card: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#111', position: 'relative' as const },
  thumbnail: { width: '100%', height: '70%' },
  overlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.18)' },
  playBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#FF8A00', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, flexDirection: 'row', alignItems: 'center', gap: 6 },
  playText: { color: '#0b0b0d', fontSize: 10, fontWeight: '900' },
  metaRow: { position: 'absolute', left: 8, right: 8, bottom: 8 },
  title: { color: '#fff', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  viewsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  viewsText: { color: '#c9ced6', fontSize: 11 },
  shareBtn: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.35)' },
});