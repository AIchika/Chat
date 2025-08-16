import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, useWindowDimensions, Platform, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Users, Share2, VolumeX, MoreVertical, Maximize2, Plus, Check } from "lucide-react-native";
import { router } from "expo-router";
import { useStreams } from "@/providers/StreamProvider";
import * as ScreenOrientation from 'expo-screen-orientation';

const avatarUrl = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FF8A00&color=0b0b0d&size=64`;

export default function HomeScreen() {
  const { liveStreams } = useStreams();
  const { height, width } = useWindowDimensions();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [mode, setMode] = useState<"browse" | "feed">("feed");
  const listRef = useRef<FlatList<any> | null>(null);
  const [visibleIndex, setVisibleIndex] = useState<number>(0);
  const [idleOverlayIndex, setIdleOverlayIndex] = useState<number | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mutedIds, setMutedIds] = useState<string[]>([]);
  const [followedIds, setFollowedIds] = useState<string[]>([]);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);

  const categories: string[] = useMemo(() => ["All", "Just chatting", "IRL", "Gaming", "Action"], []);

  const filtered = useMemo(() => {
    if (selectedCategory === "All") return liveStreams;
    return liveStreams.filter((s) => (s.category ?? "").toLowerCase() === selectedCategory.toLowerCase());
  }, [liveStreams, selectedCategory]);

  const onSelectCategory = useCallback((cat: string) => {
    console.log("Home:onSelectCategory", cat);
    setSelectedCategory(cat);
    setMode("feed");
  }, []);

  const renderFeedItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const feedHeight = height;
    const feedWidth = width;
    const isIdleBlur = idleOverlayIndex === index;
    const isMuted = mutedIds.includes(String(item.id));
    const isFullscreen = fullscreenIndex === index;
    const boxHeight = isFullscreen ? feedHeight : Math.min(feedHeight * 0.65, 620);
    const boxWidth = isFullscreen ? feedWidth : Math.min(feedWidth * 0.96, 900);
    const chipsBarTop = 6;
    const chipsBarHeight = 48;
    const desiredTop = isFullscreen ? 0 : chipsBarTop + chipsBarHeight + 18;
    return (
      <View
        style={[styles.feedItem, { width: feedWidth, height: feedHeight }]}
        testID={`feed-item-${item.id}`}
      >
        <Image source={{ uri: item.thumbnail }} style={styles.feedBg} blurRadius={Platform.OS === 'web' ? 8 : 18} />
        <LinearGradient colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.7)"]} style={styles.feedGradient} />

        <View style={styles.centerBoxWrap} pointerEvents="box-none">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push(`/stream/${item.id}`)}
            style={[styles.streamBox, { width: boxWidth, height: boxHeight, position: 'absolute', top: desiredTop, borderRadius: isFullscreen ? 0 : 28 }]}
            testID={`stream-box-${item.id}`}
          >
            <Image source={{ uri: item.thumbnail }} style={styles.streamBoxImage} />
            <View style={styles.boxTopRow}>
              <View style={styles.feedLivePill}>
                <Text style={styles.feedLiveText}>LIVE</Text>
              </View>
              <View style={styles.feedViewersPill}>
                <Users size={14} color="#0b0b0d" />
                <Text style={styles.feedViewersText}>{item.viewers}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {!isFullscreen && (
          <View style={styles.feedActionsColumn}>
            <TouchableOpacity
              style={styles.feedActionBtn}
              onPress={() => {
                setMutedIds((prev) => prev.includes(String(item.id)) ? prev.filter((id) => id !== String(item.id)) : [...prev, String(item.id)]);
              }}
              testID={`feed-mute-${item.id}`}
            >
              <VolumeX size={18} color={isMuted ? '#FF8A00' : '#fff'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.feedActionBtn}
              onPress={async () => {
                try {
                  await Share.share({ message: `${item.title} by ${item.streamer}`, url: item.thumbnail, title: item.title });
                } catch (e: unknown) {
                  console.log('Share error', e);
                }
              }}
              testID={`feed-share-${item.id}`}
            >
              <Share2 size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.feedActionBtn}
              onPress={async () => {
                const toggle = fullscreenIndex === index ? null : index;
                setFullscreenIndex(toggle);
                if (Platform.OS !== 'web') {
                  try {
                    if (toggle !== null) {
                      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
                    } else {
                      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
                    }
                  } catch (e) {
                    console.log('Orientation lock error', e);
                  }
                } else {
                  console.log('Fullscreen simulated on web');
                }
              }}
              testID={`feed-fullscreen-${item.id}`}
            >
              <Maximize2 size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.feedActionBtn} onPress={() => router.push(`/stream/${item.id}`)} testID={`feed-more-${item.id}`}>
              <MoreVertical size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}


        {!isFullscreen && (
          <View style={styles.feedProfileRow}>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: avatarUrl(item.streamer) }} style={styles.feedAvatar} />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ selected: followedIds.includes(String(item.id)) }}
                onPress={() => {
                  setFollowedIds((prev) => prev.includes(String(item.id)) ? prev.filter((id) => id !== String(item.id)) : [...prev, String(item.id)]);
                }}
                style={[styles.avatarBadge, followedIds.includes(String(item.id)) ? styles.avatarBadgeFollowed : undefined]}
                testID={`feed-follow-${item.id}`}
              >
                {followedIds.includes(String(item.id)) ? (
                  <Check size={14} color="#fff" />
                ) : (
                  <Plus size={14} color="#0b0b0d" />
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.feedTextWrap}>
              <Text numberOfLines={1} style={styles.feedTitle}>{item.title}</Text>
              <Text numberOfLines={1} style={styles.feedMeta}>@{item.streamer} • {item.category}</Text>
            </View>
          </View>
        )}

        {isIdleBlur && (
          <View style={styles.idleOverlay} pointerEvents="box-none">
            <View style={styles.idleCard}>
              <Text style={styles.idleTitle}>Watch this stream?</Text>
              <Text style={styles.idleSubtitle}>Tap to open. We’ll hide previews if you stay idle.</Text>
              <TouchableOpacity onPress={() => router.push(`/stream/${item.id}`)} style={styles.idleCta}>
                <Text style={styles.idleCtaText}>Watch now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }, [height, width, idleOverlayIndex, mutedIds, followedIds, fullscreenIndex]);

  const keyExtractor = useCallback((it: any) => String(it.id), []);

  useEffect(() => {
    try {
      if (mode === "feed" && filtered.length > 0) {
        console.log("Home:scrollToIndex -> 0");
        listRef.current?.scrollToIndex?.({ index: 0, animated: false });
      }
    } catch (e) {
      console.warn("Home:scrollToIndex failed", e);
    }
  }, [mode, filtered.length]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: Array<{ index?: number | null }> }) => {
    const idx = (viewableItems?.[0]?.index ?? 0) as number;
    if (idx !== visibleIndex) setVisibleIndex(idx);
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    idleTimerRef.current = setTimeout(() => {
      setIdleOverlayIndex(idx);
    }, 120000);
    setIdleOverlayIndex(null);
    if (fullscreenIndex !== null && fullscreenIndex !== idx) {
      setFullscreenIndex(null);
      if (Platform.OS !== 'web') {
        void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch((e) => console.log('Orientation reset error', e));
      }
    }
  }).current;

  if (mode === "feed") {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          <FlatList
            ref={listRef}
            data={filtered}
            keyExtractor={keyExtractor}
            renderItem={renderFeedItem}
            extraData={{ mutedIds, followedIds, fullscreenIndex, selectedCategory }}
            pagingEnabled
            snapToInterval={height}
            decelerationRate={Platform.OS === "ios" ? "fast" : 0.98}
            disableIntervalMomentum
            bounces={false}
            snapToAlignment="start"
            getItemLayout={(data, index) => ({ length: height, offset: height * index, index })}
            showsVerticalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
            removeClippedSubviews
            ListHeaderComponent={null}
            ListEmptyComponent={(
              <View style={{ height, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#c9ced6", fontSize: 16, marginBottom: 12 }}>
                  No streams in {selectedCategory}
                </Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => setSelectedCategory("All")}
                    style={[styles.categoryChip, styles.categoryChipActive]}
                    testID="empty-cta-all"
                  >
                    <Text style={[styles.categoryChipText, styles.categoryChipTextActive]}>See All</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            testID="feed-list"
          />
          <View style={styles.categoriesBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryChips}>
              {categories.map((c) => {
                const active = c === selectedCategory;
                return (
                  <TouchableOpacity
                    key={c}
                    onPress={() => onSelectCategory(c)}
                    style={[styles.categoryChip, active ? styles.categoryChipActive : undefined]}
                    testID={`chip-${c}`}
                  >
                    <Text style={[styles.categoryChipText, active ? styles.categoryChipTextActive : undefined]}>{c}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <FlatList
          ref={listRef}
          data={filtered}
          keyExtractor={keyExtractor}
          renderItem={renderFeedItem}
          extraData={{ mutedIds, followedIds, fullscreenIndex, selectedCategory }}
          pagingEnabled
          snapToInterval={height}
          decelerationRate={Platform.OS === "ios" ? "fast" : 0.98}
          disableIntervalMomentum
          bounces={false}
          snapToAlignment="start"
          getItemLayout={(data, index) => ({ length: height, offset: height * index, index })}
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          removeClippedSubviews
          ListHeaderComponent={null}
          ListEmptyComponent={(
            <View style={{ height, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#c9ced6", fontSize: 16, marginBottom: 12 }}>
                No streams in {selectedCategory}
              </Text>
            </View>
          )}
          testID="feed-list"
        />
        <View style={styles.categoriesBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryChips}>
            {categories.map((c) => {
              const active = c === selectedCategory;
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => onSelectCategory(c)}
                  style={[styles.categoryChip, active ? styles.categoryChipActive : undefined]}
                  testID={`chip-${c}`}
                >
                  <Text style={[styles.categoryChipText, active ? styles.categoryChipTextActive : undefined]}>{c}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0b0d" },
  safeArea: { flex: 1 },
  hero: { paddingBottom: 12 },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  heroTitle: { color: "#fff", fontSize: 24, fontWeight: "800" },
  clipsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FF8A00",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  clipsText: { color: "#0b0b0d", fontSize: 12, fontWeight: "700" },
  cardsRow: { paddingHorizontal: 12, gap: 12, paddingBottom: 4 },
  cardWrap: { width: 280, marginHorizontal: 4 },
  card: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  cardImage: { width: "100%", height: "100%" },
  cardOverlay: { position: "absolute", left: 0, right: 0, bottom: 0, height: 60 },
  cardBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FF8A00",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardBadgeText: { color: "#0b0b0d", fontSize: 10, fontWeight: "900" },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  detailTextWrap: { flex: 1 },
  avatar: { width: 28, height: 28, borderRadius: 14 },
  cardTitle: { color: '#fff', fontSize: 14, fontWeight: '800' },
  cardMeta: { color: '#c9ced6', fontSize: 12 },
  livePill: {
    backgroundColor: "#FF8A00",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  livePillText: { color: "#0b0b0d", fontSize: 11, fontWeight: "900", textTransform: "uppercase" },

  section: { paddingHorizontal: 16, paddingVertical: 16 },

  categoryChips: { paddingHorizontal: 8, gap: 8, paddingBottom: 12 },
  categoryChip: {
    backgroundColor: "rgba(255, 138, 0, 0.18)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 138, 0, 0.3)",
    marginHorizontal: 4,
  },
  categoryChipActive: {
    backgroundColor: "#FF8A00",
    borderColor: "#FF8A00",
  },
  categoryChipText: { color: "#FF8A00", fontSize: 13, fontWeight: "700" },
  categoryChipTextActive: { color: "#0b0b0d" },

  idleOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  idleCard: { backgroundColor: 'rgba(12,12,14,0.28)', padding: 16, borderRadius: 16, width: '84%', alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.16)' },
  idleTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 6 },
  idleSubtitle: { color: '#c9ced6', fontSize: 12, marginBottom: 12, textAlign: 'center' },
  idleCta: { backgroundColor: '#FF8A00', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  idleCtaText: { color: '#0b0b0d', fontSize: 12, fontWeight: '800' },

  // Fullscreen feed styles
  feedItem: { position: "relative", overflow: "hidden" },
  feedBg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" },
  feedGradient: { position: "absolute", left: 0, right: 0, bottom: 0, top: 0 },
  feedTopRow: { position: "absolute", top: 12, left: 12, right: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  feedTopRowBelowChips: { position: "absolute", top: 56, left: 12, right: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  centerBoxWrap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  streamBox: { borderRadius: 28, overflow: 'hidden', backgroundColor: '#111', borderWidth: 1, borderColor: 'rgba(255,138,0,0.35)' },
  streamBoxImage: { width: '100%', height: '100%', resizeMode: 'cover' as const },
  boxTopRow: { position: 'absolute', top: 10, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feedLivePill: { backgroundColor: "#FF8A00", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  feedLiveText: { color: "#0b0b0d", fontSize: 12, fontWeight: "900" },
  feedViewersPill: { backgroundColor: "#FF8A00", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, flexDirection: "row", alignItems: "center", gap: 6 },
  feedViewersText: { color: "#0b0b0d", fontSize: 12, fontWeight: "900" },
  feedProfileRow: { position: "absolute", left: 12, right: 80, bottom: 100, flexDirection: "row", alignItems: "center", gap: 10 },
  avatarWrap: { position: 'relative', width: 40, height: 40 },
  feedAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "#FF8A00" },
  avatarBadge: { position: 'absolute', right: -2, bottom: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: '#FF8A00', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#0b0b0d' },
  avatarBadgeFollowed: { backgroundColor: '#22c55e', borderColor: '#0b0b0d' },
  feedTextWrap: { flex: 1 },
  feedTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  feedMeta: { color: "#c9ced6", fontSize: 13, marginTop: 2 },

  // Floating categories bar for feed mode
  categoriesBar: { position: "absolute", top: 6, left: 0, right: 0 },

  feedActionsColumn: { position: 'absolute', right: 12, bottom: 100, alignItems: 'center', gap: 10 },
  feedActionBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  followBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FF8A00', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  followBtnActive: { backgroundColor: '#22c55e' }
});
