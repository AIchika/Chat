import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, useWindowDimensions, Platform, Share, Animated, LayoutAnimation } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();
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
    // Center the live preview perfectly with balanced spacing
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
            style={[styles.streamBox, { width: boxWidth, height: boxHeight, borderRadius: isFullscreen ? 0 : 28, margin: isFullscreen ? 0 : 16 }]}
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

        {/* Bottom-right Follow Avatar (replaces old controls) */}
        {!isFullscreen && (
          <View style={styles.followAvatarContainer}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ selected: followedIds.includes(String(item.id)) }}
              activeOpacity={0.8}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setFollowedIds((prev) => prev.includes(String(item.id)) ? prev.filter((id) => id !== String(item.id)) : [...prev, String(item.id)]);
              }}
              style={styles.followAvatarWrap}
              testID={`feed-follow-avatar-${item.id}`}
            >
              <Image source={{ uri: avatarUrl(item.streamer) }} style={styles.followAvatar} />
              <View style={[styles.followBadge, followedIds.includes(String(item.id)) ? styles.followBadgeGood : styles.followBadgePlus]}>
                {followedIds.includes(String(item.id)) ? (
                  <Check size={24} color="#0b0b0d" />
                ) : (
                  <Plus size={24} color="#0b0b0d" />
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Left-side information layout */}
        {!isFullscreen && (
          <View style={styles.feedInfoBlock}>
            <View style={styles.feedInfoRow}>
              <Text style={styles.userName} numberOfLines={1}>@{item.streamer}</Text>
              {/* Removed duplicate avatar as it's already shown in the follow button */}
            </View>
            <View style={styles.feedInfoTexts}>
              <Text numberOfLines={1} style={styles.feedTitle}>{item.title}</Text>
              <Text numberOfLines={1} style={styles.feedDescription}>{item.description ?? item.category}</Text>
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
        try {
          void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        } catch (e) {
          console.log('Orientation lock error', e);
        }
      }
    }
  }).current;

  if (mode === "browse") {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={["top"]} style={styles.safeArea}>
          <View style={styles.hero}>
            <View style={[styles.heroHeader, { paddingTop: insets.top + 12 }]}>
              <Text style={styles.heroTitle}>Explore</Text>
              <TouchableOpacity style={styles.clipsButton} onPress={() => router.push('/clips')} testID="clips-button">
                <Users size={20} color="#0b0b0d" />
                <Text style={styles.clipsText}>Clips</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsRow}>
              {[0, 1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.cardWrap}>
                  <View style={styles.card}>
                    <Image source={{ uri: `https://picsum.photos/400/300?random=${i}` }} style={styles.cardImage} />
                    <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.cardOverlay} />
                    <View style={styles.cardBadge}>
                      <Users size={12} color="#0b0b0d" />
                      <Text style={styles.cardBadgeText}>Trending</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Image source={{ uri: avatarUrl("pro") }} style={styles.avatar} />
                      <View style={styles.detailTextWrap}>
                        <Text style={styles.cardTitle}>Pro stream</Text>
                        <Text style={styles.cardMeta}>#gaming</Text>
                      </View>
                      <View style={styles.livePill}>
                        <Text style={styles.livePillText}>LIVE</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={[styles.categoriesBar, { top: insets.top + 6 }]}>
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
        <View style={[styles.categoriesBar, { top: insets.top + 6 }]}>
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
    height: 200,
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

  categoryChips: { paddingHorizontal: 8, gap: 8, paddingBottom: 16 },
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

  feedItem: { position: "relative", overflow: "hidden" },
  feedBg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%" },
  feedGradient: { position: "absolute", left: 0, right: 0, bottom: 0, top: 0 },
  feedTopRow: { position: "absolute", top: 12, left: 12, right: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  feedTopRowBelowChips: { position: "absolute", top: 90, left: 12, right: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
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

  // Follow avatar styles
  followAvatarContainer: { position: 'absolute', right: 12, bottom: 100 },
  followAvatarWrap: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', backgroundColor: '#0b0b0d', borderWidth: 2, borderColor: '#FF8A00' },
  followAvatar: { width: '100%', height: '100%' },
  followBadge: { position: 'absolute', left: 16, top: 16, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  followBadgePlus: { backgroundColor: '#FF8A00' },
  followBadgeGood: { backgroundColor: '#22c55e' },

  // Left-side feed info block styles
  feedInfoBlock: { position: 'absolute', left: 12, right: 120, bottom: 100, gap: 16 },
  feedInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  userName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  infoAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#FF8A00' },
  feedInfoTexts: { marginTop: 8 },
  feedDescription: { color: '#c9ced6', fontSize: 14 },

  categoriesBar: { position: "absolute", left: 0, right: 0 },

  feedActionsColumn: { position: 'absolute', right: 12, bottom: 100, alignItems: 'center', gap: 10 },
  feedActionBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  followBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FF8A00', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  followBtnActive: { backgroundColor: '#22c55e' }
});
