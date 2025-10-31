import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
  Modal,
  ScrollView,
  Animated,
  useWindowDimensions,
  Pressable,
  Share
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  X,
  Heart,
  Share2,
  Users,
  Send,
  Gift,
  MoreVertical,
  Wifi,
  UserPlus,
  Mic,
  Camera,
  PhoneOff,
  Star,
  Eye,
  Monitor,
  Sparkles,
  Circle,
  RefreshCw,
  MessageSquare,
  Paperclip,
  Wallet,
  Plus,
  Check,
} from "lucide-react-native";
import { useChat } from "@/providers/ChatProvider";
import { useStreams } from "@/providers/StreamProvider";
import { useSettings } from "@/providers/SettingsProvider";
import { useAuth } from "@/providers/AuthProvider";
import chattSocket from "@/lib/socket";
import { LiveKitProvider, useLiveKit } from "@/providers/LiveKitProvider";
import LiquidGlass from "@/components/LiquidGlass";
import GlassPanel from "@/components/GlassPanel";
import GlassButton from "@/components/GlassButton";
import CoHostBubble from "@/components/CoHostBubble";
import * as Haptics from 'expo-haptics'
import { CameraView, useCameraPermissions } from 'expo-camera'

interface ChatItem {
  id: string;
  username: string;
  text: string;
}

type GiftOption = { id: string; label: string; price: number };

type Friend = { id: string; username: string; avatar: string; online: boolean };

type InviteState = "idle" | "sending" | "sent" | "accepted" | "error";

function StreamScreenInner() {
  const { streamId } = useLocalSearchParams();
  const { messages, sendMessage } = useChat();
  const { getStreamById } = useStreams();
  const { chat } = useSettings();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // LiveKit state
  const { join, recentJoins, participants, setMicEnabled, setCamEnabled } = useLiveKit();

  const [message, setMessage] = useState<string>("");
  const [muted, setMuted] = useState<boolean>(false);
  const [camOn, setCamOn] = useState<boolean>(true);
  const [isBackCamera, setIsBackCamera] = useState<boolean>(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showGifts, setShowGifts] = useState<boolean>(false);
  const [showSubscribe, setShowSubscribe] = useState<boolean>(false);
  const [fireworks, setFireworks] = useState<boolean>(false);
  const [lastCelebrationPrice, setLastCelebrationPrice] = useState<number | null>(null);
  const [lastGifterName, setLastGifterName] = useState<string>("You");
  const [showCoHostInvite, setShowCoHostInvite] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [inviteStatus, setInviteStatus] = useState<Record<string, InviteState>>({});
  const [avatarBadgeStep, setAvatarBadgeStep] = useState<number>(0);
  const handleAvatarBadgePress = () => {
    try { Haptics.selectionAsync() } catch { }
    if (avatarBadgeStep === 0) {
      setIsFollowing(true);
      setAvatarBadgeStep(1);
      return;
    }
    if (avatarBadgeStep === 1) {
      if (stream?.streamer) {
        setInviteStatus(prev => ({ ...prev, [String(stream.streamer)]: 'sending' }));
        setTimeout(() => {
          setInviteStatus(prev => ({ ...prev, [String(stream.streamer)]: 'sent' }));
        }, 600);
      }
      setAvatarBadgeStep(2);
      return;
    }
    // avatarBadgeStep === 2 => cancel
    setIsFollowing(false);
    if (stream?.streamer) {
      setInviteStatus(prev => {
        const next = { ...prev } as Record<string, InviteState>;
        delete next[String(stream.streamer)];
        return next;
      });
    }
    setAvatarBadgeStep(0);
  };
  const flatListRef = useRef<FlatList<ChatItem> | null>(null);
  const fadeAnim = useRef(new Animated.Value(1));

  // UI visibility and timers
  const [uiVisible, setUiVisible] = useState(true)
  const uiHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTapRef = useRef<number>(0)

  // Live pulse animation
  const livePulseAnim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(livePulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(livePulseAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    )
    loop.start()
    return () => loop.stop()
  }, [])

  // Quick toolbar and reactions (existing)
  const [quickToolbarVisible, setQuickToolbarVisible] = useState(true)
  const toolbarHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [floatingReactions, setFloatingReactions] = useState<Array<{ id: number; anim: Animated.Value }>>([])
  const spawnReaction = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) } catch { }
    const id = Date.now()
    const anim = new Animated.Value(0)
    setFloatingReactions(prev => [...prev, { id, anim }])
    Animated.timing(anim, { toValue: 1, duration: 2500, useNativeDriver: true }).start(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== id))
    })
    setQuickToolbarVisible(true)
    if (toolbarHideTimer.current) clearTimeout(toolbarHideTimer.current)
    toolbarHideTimer.current = setTimeout(() => setQuickToolbarVisible(false), 3000)
  }

  const { height: screenHeight } = useWindowDimensions()
  const chatOverlayHeight = Math.round(screenHeight * 0.30)
  const [pinnedMessage, setPinnedMessage] = useState<string | null>(null)

  // Utility: strip emojis from chat text display
  const stripEmojis = (t: string) => t.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

  // Health tooltip
  const [showHealth, setShowHealth] = useState(false)
  const healthInfo = { bitrate: '6 Mbps', fps: 60, packetLoss: '0.2%' }

  // Reaction menu
  const [showReactionMenu, setShowReactionMenu] = useState(false)

  useEffect(() => {
    if (!streamId) return;
    // Auto-join LiveKit room for this stream
    join(String(streamId));
  }, [streamId]);

  // Request camera permission on mount if not granted
  useEffect(() => {
    if (!cameraPermission?.granted) {
      requestCameraPermission().catch(() => { });
    }
  }, [cameraPermission?.granted]);

  const friends = useMemo<Friend[]>(
    () => [
      { id: 'f1', username: 'alex', avatar: 'https://i.pravatar.cc/150?u=alex', online: true },
      { id: 'f2', username: 'bella', avatar: 'https://i.pravatar.cc/150?u=bella', online: true },
      { id: 'f3', username: 'cody', avatar: 'https://i.pravatar.cc/150?u=cody', online: false },
      { id: 'f4', username: 'dina', avatar: 'https://i.pravatar.cc/150?u=dina', online: true },
    ],
    []
  );

  const stream = getStreamById(String(streamId ?? ""));

  useEffect(() => {
    if (!streamId || !user?.id) return;
    chattSocket.joinStream(String(streamId), user.id, 'broadcaster');

    const handleCohostAccept = (data: { streamId: string; userId: string }) => {
      if (String(data.streamId) !== String(streamId)) return;
      setInviteStatus((prev) => ({ ...prev, [data.userId]: 'accepted' }));
      setShowCoHostInvite(false);
    };

    const handleCohostJoined = (data: { userId: string }) => {
      setInviteStatus((prev) => ({ ...prev, [data.userId]: 'accepted' }));
    };

    chattSocket.on('cohost-accept', handleCohostAccept as any);
    chattSocket.on('cohost-joined', handleCohostJoined as any);

    return () => {
      chattSocket.off('cohost-accept', handleCohostAccept as any);
      chattSocket.off('cohost-joined', handleCohostJoined as any);
      chattSocket.leaveStream(String(streamId), user.id);
    };
  }, [streamId, user?.id]);

  const gifts = useMemo<GiftOption[]>(
    () => [
      { id: "g1", label: "Thumbs Up", price: 1 },
      { id: "g2", label: "Rose", price: 5 },
      { id: "g3", label: "Diamond", price: 10 },
      { id: "g4", label: "Rocket", price: 20 },
      { id: "g5", label: "Anime Cat", price: 2 },
      { id: "g6", label: "Chibi Dancer", price: 3 },
      { id: "g7", label: "Fire Dragon", price: 15 },
      { id: "g8", label: "Galaxy Portal", price: 25 },
      { id: "g9", label: "Phoenix Premium", price: 50 },
      { id: "g10", label: "Mythic Whale (Premium)", price: 100 },
    ],
    []
  );

  // TikTok-style gifts: categories and animation values
  const giftCategories = useMemo(() => ['Popular', 'Cars', 'Toys', 'Memes'], []);
  const [activeGiftCategory, setActiveGiftCategory] = useState<string>('Popular');
  const categorizedGifts = useMemo<Record<string, GiftOption[]>>(() => ({
    Popular: gifts,
    Cars: [
      { id: 'car1', label: 'Sport Car', price: 50 },
      { id: 'car2', label: 'Supercar', price: 100 },
      { id: 'car3', label: 'Cyber Truck', price: 80 },
      { id: 'car4', label: 'Retro Roadster', price: 30 },
    ],
    Toys: [
      { id: 'toy1', label: 'Teddy Bear', price: 5 },
      { id: 'toy2', label: 'RC Drone', price: 20 },
      { id: 'toy3', label: 'Rubik Cube', price: 3 },
      { id: 'toy4', label: 'Game Controller', price: 15 },
    ],
    Memes: [
      { id: 'meme1', label: 'Doge', price: 7 },
      { id: 'meme2', label: 'Pepe', price: 9 },
      { id: 'meme3', label: 'Nyan Cat', price: 12 },
      { id: 'meme4', label: 'Distracted Boyfriend', price: 11 },
    ],
  }), [gifts]);

  const giftsAnim = useRef(new Animated.Value(40)).current;
  const giftsOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (showGifts) {
      Animated.parallel([
        Animated.timing(giftsAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(giftsOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      giftsAnim.setValue(40);
      giftsOpacity.setValue(0);
    }
  }, [showGifts]);

  // Subscription tiers and animation values
  const subscriptionTiers = useMemo(() => [
    { id: 'sub1', label: 'Supporter', desc: 'Badge + custom emojis' },
    { id: 'sub2', label: 'VIP', desc: 'Priority chat + exclusive gifts' },
    { id: 'sub3', label: 'Legend', desc: 'All perks + monthly shoutout' },
  ], []);

  const subscribeAnim = useRef(new Animated.Value(40)).current;
  const subscribeOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (showSubscribe) {
      Animated.parallel([
        Animated.timing(subscribeAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(subscribeOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      subscribeAnim.setValue(40);
      subscribeOpacity.setValue(0);
    }
  }, [showSubscribe]);
  const handleSendMessage = () => {
    if (message.trim() && streamId && user?.id) {
      sendMessage(String(streamId), message.trim(), user.id);
      setMessage("");
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };

  const giftPhraseFor = (price: number): string => {
    if (price >= 10) return chat.giftPhraseHigh ?? "Real one, dawg!";
    if (price >= 5) return chat.giftPhraseMid ?? "Chillz!";
    return chat.giftPhraseLow ?? "Thanks for the gift!";
  };

  const renderMessage = ({ item }: { item: ChatItem }) => {
    const usernameColor = chat.primaryColor ?? "#FF8A00";
    return (
      <View style={styles.messageContainer}>
        <Text style={[styles.messageInline, { color: usernameColor, fontWeight: "700" }]}>
          {item.username}: {" "}
        </Text>
        <Text style={styles.messageInline}>{stripEmojis(item.text)}</Text>
      </View>
    );
  };

  if (!stream) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Stream not found</Text>
      </View>
    );
  }

  const handleExit = () => {
    Animated.timing(fadeAnim.current, { toValue: 0, duration: 300, useNativeDriver: true }).start(({ finished }) => {
      if (finished) router.back();
    });
  };

  const viewerCount = stream.viewers ?? 0;
  const onShare = async () => {
    try {
      await Share.share({
        title: stream.title ?? 'Live Stream',
        message: `${stream.title} — Join now!`,
        url: `https://example.com/streams/${String(streamId)}`,
      });
    } catch (e) {
      console.log('Share error', e);
    }
  };

  const isMicOn = !muted;
  const isCamOn = camOn;
  const toggleMic = () => {
    setMuted((m) => {
      const next = !m;
      try { setMicEnabled(next); } catch { }
      return next;
    });
  };
  const toggleCamera = () => {
    setCamOn((c) => {
      const next = !c;
      try { setCamEnabled(next); } catch { }
      return next;
    });
  };
  const openInvite = () => setShowCoHostInvite(true);

  // Top bar details state and responsive variants
  const [showDetails, setShowDetails] = useState(false);
  const { width: screenWidth } = useWindowDimensions();
  const topBarVariant: 'compact' | 'split' | 'twoRow' = screenWidth < 380 ? 'compact' : screenWidth < 600 ? 'split' : 'twoRow';
  const title = stream?.title || 'Live Stream';
  const description = stream?.description || '';
  const isOverflow = (title.length > (topBarVariant === 'compact' ? 22 : 32)) || (description.length > (topBarVariant === 'twoRow' ? 40 : 28));

  return (
  <Animated.View style={{ flex: 1 }}>
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.videoContainer} onPress={() => setUiVisible((v) => !v)}>
          <LiquidGlass style={[styles.lgTopBar, { top: insets.top + 12, opacity: uiVisible ? 1 : 0 }]} intensity={25} tint="dark" glowColor={chat.primaryColor}>
      <View style={styles.topBarLeft}>
        <View style={styles.avatarWrap}>
          <Image source={{ uri: `https://i.pravatar.cc/120?u=${stream.streamer}` }} style={styles.avatar} />
          <TouchableOpacity
            style={[styles.avatarBadge, { backgroundColor: avatarBadgeStep === 0 ? '#FF8A00' : avatarBadgeStep === 1 ? '#22c55e' : '#EF4444' }]}
            onPress={handleAvatarBadgePress}
            hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Follow toggle"
          >
            {avatarBadgeStep === 0 ? <Plus size={12} color="#0b0b0d" /> : avatarBadgeStep === 1 ? <Check size={12} color="#0b0b0d" /> : <X size={12} color="#0b0b0d" />}
          </TouchableOpacity>
        </View>
        <Text style={styles.streamTitle} numberOfLines={1} ellipsizeMode="tail">@{stream.streamer}</Text>
      </View>

      {/* Center: title/description with overflow indicators */}
      <View style={styles.topBarCenter}>
        {topBarVariant === 'twoRow' ? (
          <View style={styles.topTextWrap}>
            <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
            <Text style={styles.descText} numberOfLines={1} ellipsizeMode="tail">{description}</Text>
            {isOverflow && (
              <LinearGradient colors={["transparent", "rgba(0,0,0,0.5)"]} style={styles.fadeRight} />
            )}
          </View>
        ) : (
          <View style={styles.topTextWrap}>
            <Text style={styles.titleText} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
            {isOverflow && (
              <LinearGradient colors={["transparent", "rgba(0,0,0,0.5)"]} style={styles.fadeRight} />
            )}
          </View>
        )}
        {isOverflow && (
          <TouchableOpacity
            style={styles.moreBtn}
            onPress={() => setShowDetails(true)}
            accessibilityRole="button"
            accessibilityLabel="Show full details"
          >
            <MoreVertical size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Right: LIVE, viewers, health, close (always visible) */}
      <View style={styles.topBarRight}>
        <Animated.View style={[styles.livePill, { borderColor: chat.primaryColor, transform: [{ scale: livePulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }] }]}>
          <View style={[styles.liveDot, { backgroundColor: chat.primaryColor }]} />
          <Text style={[styles.liveText, { color: chat.primaryColor }]}>LIVE</Text>
        </Animated.View>
        <View style={styles.viewersPill}>
          <Eye color="#fff" size={16} />
          <Text style={styles.viewersText}>{stream.viewers ?? 0}</Text>
        </View>
        <TouchableOpacity style={styles.actionButtonTinyGhost} onPress={() => setShowHealth(true)} accessibilityRole="button" accessibilityLabel="Stream health">
          <Wifi size={18} color={chat.primaryColor} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topIcon} onPress={handleExit} accessibilityRole="button" accessibilityLabel="Close stream">
          <X color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    </LiquidGlass>

  {/* Details modal for overflow content */ }
  <Modal transparent visible={showDetails} animationType="fade" onRequestClose={() => setShowDetails(false)}>
    <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowDetails(false)}>
      <View style={styles.menuCard}>
        <Text style={{ color: '#fff', fontWeight: '700', marginBottom: 8 }}>Stream Details</Text>
        <Text style={{ color: '#fff', fontWeight: '700' }}>{title}</Text>
        {!!description && <Text style={{ color: '#c9ced6', marginTop: 6 }}>{description}</Text>}
      </View>
    </TouchableOpacity>
  </Modal>

  {/* Quick Toolbar (auto-hide) */ }
  <View style={[styles.quickToolbar, { opacity: uiVisible && quickToolbarVisible ? 1 : 0 }]}>
    {/* quick toolbar icons moved to input row */}
  </View>

  {/* Floating Reactions on the right */ }
  <View pointerEvents="none" style={styles.reactionsWrap}>
    {floatingReactions.map(r => (
      <Animated.View key={r.id} style={{ position: 'absolute', right: 16, bottom: chatOverlayHeight + 80, transform: [{ translateY: r.anim.interpolate({ inputRange: [0, 1], outputRange: [0, -180] }) }], opacity: r.anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }) }}>
        <Heart color={chat.primaryColor} size={28} />
      </Animated.View>
    ))}
  </View>


  {/* Chat Overlay (30% height default, transparent) */ }
  <GlassPanel intensity={0} style={[styles.chatContainer, { height: chatOverlayHeight }]}>
    {/* Chat Header removed per spec */}

    {/* Pinned message bar */}
    {!!pinnedMessage && (
      <View style={styles.pinnedBar}>
        <Text style={styles.pinnedLabel}>Pinned</Text>
        <Text style={styles.pinnedText} numberOfLines={1}>{pinnedMessage}</Text>
      </View>
    )}

    {/* Messages */}
    <FlatList
      ref={flatListRef}
      data={(messages as unknown as ChatItem[]).slice(-30)}
      renderItem={renderMessage}
      keyExtractor={(item) => (item as ChatItem).id}
      style={styles.messagesList}
      contentContainerStyle={styles.messagesContent}
      onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      showsVerticalScrollIndicator={false}
    />
  </GlassPanel>

  {/* Input row moved below chat overlay */ }
  <View style={styles.inputWrap}>
    <View style={styles.inputRow}>
      <TouchableOpacity style={styles.quickAction} onPress={onShare}><Share2 size={16} color="#fff" /></TouchableOpacity>
      <TouchableOpacity style={styles.quickAction} onPress={() => setShowGifts(true)}><Gift size={16} color="#fff" /></TouchableOpacity>
      <TouchableOpacity style={styles.quickAction} onPress={() => setShowSubscribe(true)}><Gift size={16} color={chat.primaryColor} /></TouchableOpacity>
      <TextInput style={styles.messageInput} placeholder="Type a message..." placeholderTextColor="#888" value={message} onChangeText={setMessage} onFocus={() => setUiVisible(true)} onSubmitEditing={handleSendMessage} />
      <TouchableOpacity style={[styles.sendBtn, { backgroundColor: chat.primaryColor }]} onPress={handleSendMessage}><Send size={20} color="#0b0b0d" /></TouchableOpacity>
    </View>
    
    {/* Controls Bar organized in two rows for better layout */}
    <View style={styles.controlsBarContainer}>
      <View style={styles.controlsBarRow}>
        <Text style={styles.controlsGroupLabel}>Audio/Video</Text>
        <View style={styles.controlsGroup}>
          <GlassButton onPress={() => { setMuted(m => !m); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium) } catch { } }} style={styles.controlBtn} active={!muted}><Mic size={18} color={!muted ? chat.primaryColor : '#bbb'} /></GlassButton>
          <GlassButton onPress={toggleCamera} style={styles.controlBtn} active={camOn}><Camera size={18} color={camOn ? chat.primaryColor : '#bbb'} /></GlassButton>
          <GlassButton onPress={() => { setIsBackCamera(prev => { const next = !prev; try { chattSocket.switchCamera(String(streamId), next ? 'back' : 'front', String(user?.id || 'unknown')); } catch { }; return next; }); try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) } catch { } }} style={styles.controlBtn} active={isBackCamera}><RefreshCw size={18} color={isBackCamera ? chat.primaryColor : '#fff'} /></GlassButton>
          <GlassButton onPress={() => console.log('screen source')} style={styles.controlBtn}><Monitor size={18} color="#fff" /></GlassButton>
        </View>
      </View>
      <View style={styles.controlsBarRow}>
        <Text style={styles.controlsGroupLabel}>Stream</Text>
        <View style={styles.controlsGroup}>
          <GlassButton onPress={() => setShowCoHostInvite(true)} style={styles.controlBtn}><UserPlus size={18} color="#fff" /></GlassButton>
          <GlassButton onPress={() => console.log('effects')} style={styles.controlBtn}><Sparkles size={18} color="#fff" /></GlassButton>
          <GlassButton onPress={() => console.log('record toggle')} style={styles.controlBtn}><Circle size={18} color={chat.primaryColor} /></GlassButton>
          <GlassButton onPress={() => { try { Haptics.selectionAsync() } catch { }; setShowMenu(true); }} style={styles.controlBtn}><MoreVertical size={18} color="#fff" /></GlassButton>
        </View>
      </View>
    </View>
  </View>

  {/* Reaction menu sheet */ }
  <Modal transparent visible={showReactionMenu} animationType="fade" onRequestClose={() => setShowReactionMenu(false)}>
    <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowReactionMenu(false)}>
      <View style={styles.menuCard}>
        <Text style={{ color: '#fff', marginBottom: 8 }}>Reactions</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {['❤️', '🔥', '👏', '🎉', '😮'].map(e => (
            <TouchableOpacity key={e} onPress={() => { setShowReactionMenu(false); spawnReaction(); }} style={{ padding: 8 }}>
              <Text style={{ fontSize: 22 }}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  </Modal>

  {/* Gifts sheet */ }
  <Modal transparent visible={showGifts} animationType="fade" onRequestClose={() => setShowGifts(false)}>
    <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowGifts(false)}>
      <Animated.View style={[styles.menuCard, { transform: [{ translateY: giftsAnim }], opacity: giftsOpacity }]}>
        <Text style={{ color: '#fff', fontWeight: '700', marginBottom: 8 }}>Send a Gift</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 8 }}>
          {giftCategories.map((cat) => (
            <TouchableOpacity key={cat} onPress={() => setActiveGiftCategory(cat)} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: activeGiftCategory === cat ? 'rgba(255,138,0,0.25)' : 'rgba(255,255,255,0.08)' }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {categorizedGifts[activeGiftCategory].map((g) => (
            <TouchableOpacity
              key={g.id}
              style={{ width: '48%', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)' }}
              onPress={() => {
                try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) } catch { }
                setLastCelebrationPrice(g.price);
                setFireworks(true);
                setShowGifts(false);
              }}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>{g.label}</Text>
              <Text style={{ color: '#c9ced6', fontSize: 12 }}>${g.price}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    </TouchableOpacity>
  </Modal>

  {/* Subscribe sheet */ }
  <Modal transparent visible={showSubscribe} animationType="fade" onRequestClose={() => setShowSubscribe(false)}>
    <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowSubscribe(false)}>
      <Animated.View style={[styles.menuCard, { transform: [{ translateY: subscribeAnim }], opacity: subscribeOpacity }]}>
        <Text style={{ color: '#fff', fontWeight: '700', marginBottom: 8 }}>Subscribe</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
          {subscriptionTiers.map((tier) => (
            <TouchableOpacity
              key={tier.id}
              style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)' }}
              onPress={() => {
                try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) } catch { }
                setShowSubscribe(false);
              }}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>{tier.label}</Text>
              <Text style={{ color: '#c9ced6', fontSize: 12 }}>{tier.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </TouchableOpacity>
  </Modal>

  {/* Menu dropdown */ }
  <Modal transparent visible={showMenu} animationType="fade" onRequestClose={() => setShowMenu(false)}>
    <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
      <View style={styles.menuCard}>
        <Text style={{ color: '#fff', fontWeight: '700', marginBottom: 8 }}>Menu</Text>
        <View style={{ gap: 8 }}>
          <TouchableOpacity style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)' }} onPress={() => { setShowMenu(false); onShare(); }}>
            <Text style={{ color: '#fff' }}>Share Stream</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)' }} onPress={() => { setShowMenu(false); console.log('Report'); }}>
            <Text style={{ color: '#fff' }}>Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)' }} onPress={() => { setShowMenu(false); router.push('/settings'); }}>
            <Text style={{ color: '#fff' }}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  </Modal>
  {/* Health tooltip */ }
  <Modal transparent visible={showHealth} animationType="fade" onRequestClose={() => setShowHealth(false)}>
    <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowHealth(false)}>
      <View style={styles.menuCard}>
        <Text style={{ color: '#fff', fontWeight: '700', marginBottom: 8 }}>Stream Health</Text>
        <Text style={{ color: '#c9ced6' }}>Bitrate: {healthInfo.bitrate}</Text>
        <Text style={{ color: '#c9ced6' }}>FPS: {healthInfo.fps}</Text>
        <Text style={{ color: '#c9ced6' }}>Packet Loss: {healthInfo.packetLoss}</Text>
      </View>
    </TouchableOpacity>
  </Modal>
  </Pressable >
</KeyboardAvoidingView >
</SafeAreaView >
</Animated.View >
);
}

export default function StreamScreen() {
  return (
    <LiveKitProvider>
      <StreamScreenInner />
    </LiveKitProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0b0d" },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  videoContainer: { flex: 1, backgroundColor: "#000", position: "relative" },
  videoPlaceholder: { width: "100%", height: "100%" },
  videoGradient: { position: "absolute", left: 0, right: 0, bottom: 0, height: 140 },
  lgTopBar: { position: "absolute", left: 12, right: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#333' },
  avatarWrap: { position: 'relative' },
  avatarBadge: { position: 'absolute', right: -4, bottom: -4, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#0b0b0d' },
  streamTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  streamDescription: { color: '#c9ced6', fontSize: 12 },
  categoryPill: { marginTop: 2, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.15)' },
  categoryPillText: { color: '#c9ced6', fontSize: 12, fontWeight: '600' },
  topBarCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topTextWrap: { flexDirection: 'row', alignItems: 'center', maxWidth: '70%', position: 'relative' },
  titleText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  descText: { color: '#c9ced6', fontSize: 12 },
  fadeRight: { position: 'absolute', right: 0, width: 24, height: '100%' },
  moreBtn: { padding: 6 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(79,70,229,0.2)', borderWidth: 1, borderColor: 'rgba(79,70,229,0.4)' },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: 12, fontWeight: '700' },
  viewersPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)' },
  viewersText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  topIcon: { padding: 6 },

  quickToolbar: { position: 'absolute', right: 12, top: '40%', gap: 12 },
  quickBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },

  reactionsWrap: { position: 'absolute', right: 0, bottom: 0, left: 0, top: 0 },

  controlsBarContainer: { width: '100%' },
  controlsBarRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  controlsGroup: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  controlsGroupLabel: { color: '#fff', fontSize: 14, fontWeight: '500', opacity: 0.8 },
  controlBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999 },

  chatContainer: { position: 'absolute', left: 12, right: 12, bottom: 12, borderRadius: 16, overflow: 'hidden', backgroundColor: 'transparent', maxHeight: '60%' },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  chatTitle: { fontSize: 16, fontWeight: '600', color: '#fff' },
  subscribePill: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  subscribePillText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  pinnedBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'transparent' },
  pinnedLabel: { color: '#FF8A00', fontWeight: '800', fontSize: 12 },
  pinnedText: { color: '#c9ced6', fontSize: 12 },

  messagesList: { flex: 1 },
  messagesContent: { paddingHorizontal: 12, paddingVertical: 8, maxHeight: 300 },

  emoteBar: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6 },
  emoteBtn: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)' },
  emoteText: { fontSize: 16 },

  inputWrap: { position: 'absolute', left: 12, right: 12, bottom: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  quickAction: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  quickActionText: { color: '#fff' },
  messageInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, color: '#fff', fontSize: 14 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  actionButtonTinyGhost: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  messageContainer: { marginBottom: 12, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end' },
  messageInline: { color: '#fff', fontSize: 14 },
  stickerImage: { width: 64, height: 64, borderRadius: 8, marginLeft: 6 },
  errorText: { color: '#fff', fontSize: 16, textAlign: 'center', marginTop: 50 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  menuCard: { backgroundColor: '#1a1a1a', padding: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,138,0,0.2)' },
})
