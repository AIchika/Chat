import React, { useMemo, useRef, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  Users,
  Send,
  Gift,
  MoreVertical,
  VolumeX,
  UserCheck,
  UserPlus,
} from "lucide-react-native";
import { useChat } from "@/providers/ChatProvider";
import { useStreams } from "@/providers/StreamProvider";
import { useSettings } from "@/providers/SettingsProvider";

interface ChatItem {
  id: string;
  username: string;
  text: string;
}

type GiftOption = { id: string; label: string; price: number };

type Friend = { id: string; username: string; avatar: string; online: boolean };

type InviteState = "idle" | "sending" | "sent" | "accepted" | "error";

export default function StreamScreen() {
  const { streamId } = useLocalSearchParams();
  const { messages, sendMessage } = useChat();
  const { getStreamById } = useStreams();
  const { chat } = useSettings();

  const [message, setMessage] = useState<string>("");
  const [followed, setFollowed] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showEmoji, setShowEmoji] = useState<boolean>(false);
  const [showStickers, setShowStickers] = useState<boolean>(false);
  const [showGifts, setShowGifts] = useState<boolean>(false);
  const [showSubscribe, setShowSubscribe] = useState<boolean>(false);
  const [fireworks, setFireworks] = useState<boolean>(false);
  const [lastCelebrationPrice, setLastCelebrationPrice] = useState<number | null>(null);
  const [lastGifterName, setLastGifterName] = useState<string>("You");
  const [coHostLayout, setCoHostLayout] = useState<'pip' | 'vertical' | 'horizontal' | 'game'>(String(streamId ?? '') === 'demo-cohost-game' ? 'game' : 'pip');
  const [showCoHostInvite, setShowCoHostInvite] = useState<boolean>(false);
  const [inviteStatus, setInviteStatus] = useState<Record<string, InviteState>>({});
  const flatListRef = useRef<FlatList<ChatItem> | null>(null);

  const defaultStickers: string[] = [
    "https://i.imgur.com/4M34hi2.png",
    "https://i.imgur.com/0Z8FQ10.png",
    "https://i.imgur.com/6XKx3.gif",
    "https://i.imgur.com/kq5z3eN.png",
  ];

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

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message);
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
    if (typeof item.text === "string" && item.text.startsWith("::sticker::")) {
      const url = item.text.replace("::sticker::", "");
      return (
        <View style={styles.messageContainer}>
          <Text style={[styles.messageInline, { color: usernameColor, fontWeight: "700" }]}>
            {item.username}: {" "}
          </Text>
          <Image source={{ uri: url }} style={styles.stickerImage} />
        </View>
      );
    }
    return (
      <View style={styles.messageContainer}>
        <Text style={[styles.messageInline, { color: usernameColor, fontWeight: "700" }]}>
          {item.username}: {" "}
        </Text>
        <Text style={styles.messageInline}>{item.text}</Text>
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

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
          <View style={styles.videoContainer}>
            <Image source={{ uri: stream.thumbnail }} style={styles.videoPlaceholder} />
            <LinearGradient colors={["transparent", "rgba(0,0,0,0.8)"]} style={styles.videoGradient} />

            <View style={styles.streamHeader}>
              <TouchableOpacity style={styles.closeButton} onPress={() => router.back()} testID="close-stream">
                <X size={24} color="#fff" />
              </TouchableOpacity>
              <View style={[styles.liveIndicator, { backgroundColor: chat.primaryColor }]}>
                <Text style={styles.liveText}>LIVE</Text>
              </View>
              <View style={styles.viewerCount}>
                <Users size={16} color="#fff" />
                <Text style={styles.viewerText}>{stream.viewers}</Text>
              </View>
            </View>

            <View style={styles.streamInfoOverlay}>
              <View style={styles.streamerInfo}>
                <Image
                  source={{ uri: `https://i.pravatar.cc/150?u=${stream.streamer}` }}
                  style={[styles.streamerAvatar, { borderColor: chat.primaryColor }]}
                />
                <View style={styles.streamerDetails}>
                  <View style={styles.nameRow}>
                    <Text style={styles.streamerNameBig}>@{stream.streamer}</Text>
                    <TouchableOpacity
                      onPress={() => setFollowed((f) => !f)}
                      style={styles.followPill}
                      testID="follow-button"
                    >
                      {followed ? <UserCheck size={16} color="#0b0b0d" /> : <Heart size={16} color="#0b0b0d" fill="#0b0b0d" />}
                      <Text style={styles.followText}>{followed ? "Following" : "Follow"}</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.streamDescription} numberOfLines={2}>
                    {stream.description}
                  </Text>
                  <View style={styles.actionsRowCompact}>
                    <TouchableOpacity style={styles.actionButtonTinyGhost} onPress={() => setMuted((m) => !m)} testID="mute-button">
                      <VolumeX size={18} color={muted ? chat.primaryColor : "#fff"} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButtonTinyGhost} onPress={() => setShowCoHostInvite(true)} testID="cohost-button">
                      <UserPlus size={18} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButtonTinyGhost} onPress={() => console.log("share")} testID="share-button">
                      <Share2 size={18} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButtonTinyGhost} onPress={() => setShowGifts(true)} testID="gift-button">
                      <Gift size={18} color="#fff" />
                    </TouchableOpacity>
                    {stream.isCoHost && (
                      <TouchableOpacity
                        style={[styles.actionButtonTinyGhost, { borderWidth: 1, borderColor: 'rgba(255,138,0,0.5)' }]}
                        onPress={() => {
                          setCoHostLayout((prev) => prev === 'pip' ? 'vertical' : prev === 'vertical' ? 'horizontal' : prev === 'horizontal' ? 'game' : 'pip');
                        }}
                        testID="layout-toggle"
                      >
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{coHostLayout.toUpperCase()}</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.actionButtonTinyGhost} onPress={() => setShowMenu(true)} testID="more-button">
                      <MoreVertical size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
            </View>
            </View>

            {stream.isCoHost && coHostLayout !== 'game' && (
              <View style={[styles.coHostContainer, coHostLayout === 'horizontal' ? { width: '40%', height: 120, top: 90 } : {}, { borderColor: chat.primaryColor }]}
                testID="cohost-tile"
              >
                <View style={styles.coHostVideo}>
                  <Image source={{ uri: "https://picsum.photos/200/300?random=10" }} style={styles.coHostImage} />
                  <Text style={[styles.coHostLabel, { backgroundColor: chat.primaryColor }]}>Co-Host</Text>
                </View>
              </View>
            )}
            {stream.isCoHost && coHostLayout === 'vertical' && (
              <View style={[styles.coHostContainer, { right: undefined, left: 16, borderColor: chat.primaryColor }]}
                testID="cohost-tile-2"
              >
                <View style={styles.coHostVideo}>
                  <Image source={{ uri: "https://picsum.photos/200/300?random=11" }} style={styles.coHostImage} />
                  <Text style={[styles.coHostLabel, { backgroundColor: chat.primaryColor }]}>Co-Host</Text>
                </View>
              </View>
            )}
            {stream.isCoHost && coHostLayout === 'game' && (
              <View style={styles.gameLayoutWrap} testID="game-layout">
                <View style={styles.gameTopRow} testID="dual-cams">
                  <View style={styles.gameCol} testID="host-cam">
                    <Image
                      source={{ uri: `https://i.pravatar.cc/400?u=${stream.streamer}` }}
                      style={styles.gameColImage}
                    />
                    <View style={styles.nameTagWrap}>
                      <Text style={styles.nameTagText}>@{stream.streamer}</Text>
                    </View>
                  </View>
                  <View style={styles.gameCol} testID="cohost-cam">
                    <Image
                      source={{ uri: 'https://i.pravatar.cc/400?u=cohost_' + (stream.streamer ?? 'guest') }}
                      style={styles.gameColImage}
                    />
                    <View style={styles.nameTagWrap}>
                      <Text style={styles.nameTagText}>@{(stream as any).coHost ?? 'guest42'}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.gameMain} testID="game-capture">
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1600&auto=format&fit=crop' }}
                    style={styles.gameMainImage}
                  />
                </View>
              </View>
            )}
          </View>

          <View style={[styles.chatContainer, stream.isCoHost && coHostLayout === 'game' ? { marginTop: 8 } : null]}>
            <View style={styles.chatHeader}>
              <MessageCircle size={20} color={chat.primaryColor} />
              <Text style={styles.chatTitle}>Live Chat</Text>
              <TouchableOpacity style={styles.subscribeBtn} onPress={() => setShowSubscribe(true)} testID="subscribe-button">
                <Text style={styles.subscribeText}>Subscribe $20</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              ref={flatListRef}
              data={messages as unknown as ChatItem[]}
              renderItem={renderMessage}
              keyExtractor={(item) => (item as ChatItem).id}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContent}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            <View style={styles.inputContainer}>
              <TouchableOpacity
                onPress={() => {
                  setShowEmoji((p) => !p);
                  setShowStickers(false);
                }}
                style={[styles.toolButton, { borderColor: chat.primaryColor }]}
                testID="emoji-toggle"
              >
                <Text style={[styles.toolButtonText, { color: chat.primaryColor }]}>😊</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowStickers((p) => !p);
                  setShowEmoji(false);
                }}
                style={[styles.toolButton, { borderColor: chat.primaryColor }]}
                testID="sticker-toggle"
              >
                <Text style={[styles.toolButtonText, { color: chat.primaryColor }]}>🖼️</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.messageInput}
                placeholder="Type a message..."
                placeholderTextColor="#888"
                value={message}
                onChangeText={setMessage}
                onSubmitEditing={handleSendMessage}
                testID="chat-input"
              />
              <TouchableOpacity style={[styles.sendButton, { backgroundColor: chat.primaryColor }]} onPress={handleSendMessage} testID="send-message">
                <Send size={20} color="#0b0b0d" />
              </TouchableOpacity>
            </View>
            {showEmoji && (
              <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {["😀", "😂", "😍", "🔥", "👍", "🙏", "🎉", "😎", "🥳", "🤯", "💯", "🧡"].map((e) => (
                    <TouchableOpacity key={e} onPress={() => setMessage((prev) => prev + e)} style={{ padding: 8 }}>
                      <Text style={{ fontSize: 22 }}>{e}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            {showStickers && (
              <View style={{ paddingHorizontal: 12, paddingBottom: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 12 }}>
                    {defaultStickers.map((u) => (
                      <TouchableOpacity
                        key={u}
                        onPress={() => {
                          sendMessage(`::sticker::${u}`);
                          setShowStickers(false);
                        }}
                        style={{ marginRight: 8 }}
                      >
                        <Image source={{ uri: u }} style={{ width: 72, height: 72, borderRadius: 12 }} />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}
          </View>

          <Modal transparent visible={showMenu} animationType="fade" onRequestClose={() => setShowMenu(false)}>
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
              <View style={styles.menuCard}>
                <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); }} testID="not-interested">
                  <Text style={styles.menuItemText}>Not interested</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); }} testID="block">
                  <Text style={styles.menuItemText}>Block</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={() => { setShowMenu(false); }} testID="report">
                  <Text style={styles.menuItemText}>Report</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

          <Modal transparent visible={showGifts} animationType="slide" onRequestClose={() => setShowGifts(false)}>
            <View style={styles.bottomSheet}>
              <Text style={styles.sheetTitle}>Send a Gift</Text>
              <View style={styles.giftsRow}>
                {gifts.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    style={[styles.giftChip, g.price >= 50 ? styles.giftChipPremium : undefined]}
                    onPress={() => {
                      setShowGifts(false);
                      setLastCelebrationPrice(g.price);
                      setLastGifterName("You");
                      if (chat.reactionsEnabled) {
                        setFireworks(true);
                        setTimeout(() => setFireworks(false), 2200);
                      }
                      console.log("Gift sent:", g.label, g.price);
                    }}
                    testID={`gift-${g.id}`}
                  >
                    <Gift size={18} color="#0b0b0d" />
                    <Text style={styles.giftLabel}>{g.label}</Text>
                    <Text style={styles.giftPrice}>${g.price}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Modal>

          <Modal transparent visible={showSubscribe} animationType="slide" onRequestClose={() => setShowSubscribe(false)}>
            <View style={styles.bottomSheet}>
              <Text style={styles.sheetTitle}>Subscribe</Text>
              <TouchableOpacity
                style={styles.subscribePlan}
                onPress={() => {
                  setShowSubscribe(false);
                  setLastCelebrationPrice(20);
                  setLastGifterName("You");
                  if (chat.reactionsEnabled) {
                    setFireworks(true);
                    setTimeout(() => setFireworks(false), 2500);
                  }
                }}
                testID="subscribe-confirm"
              >
                <Text style={styles.subscribePlanText}>Monthly Subscription</Text>
                <Text style={styles.subscribePlanPrice}>$20</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          <Modal transparent visible={showCoHostInvite} animationType="slide" onRequestClose={() => setShowCoHostInvite(false)}>
            <View style={styles.bottomSheet}>
              <Text style={styles.sheetTitle}>Invite a Co-Host</Text>
              <ScrollView style={{ maxHeight: 360 }} contentContainerStyle={{ paddingBottom: 8 }}>
                {friends.map((f) => {
                  const state: InviteState = inviteStatus[f.id] ?? 'idle';
                  const isOnline = f.online;
                  const disabled = !isOnline || state === 'sending' || state === 'sent' || state === 'accepted';
                  return (
                    <View key={f.id} style={styles.friendRow}>
                      <Image source={{ uri: f.avatar }} style={styles.friendAvatar} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.friendName}>@{f.username}</Text>
                        <Text style={[styles.friendStatus, { color: isOnline ? '#4ade80' : '#9ca3af' }]}>{isOnline ? 'Online' : 'Offline'}</Text>
                      </View>
                      <TouchableOpacity
                        disabled={disabled}
                        onPress={() => {
                          console.log('Invite co-host ->', f.username);
                          setInviteStatus((prev) => ({ ...prev, [f.id]: 'sending' }));
                          setTimeout(() => {
                            setInviteStatus((prev) => ({ ...prev, [f.id]: 'sent' }));
                          }, 900);
                        }}
                        style={[styles.inviteBtn, disabled ? styles.inviteBtnDisabled : { backgroundColor: chat.primaryColor }]}
                        testID={`invite-${f.id}`}
                      >
                        <Text style={styles.inviteBtnText}>{state === 'sent' || state === 'accepted' ? 'Invited' : state === 'sending' ? 'Sending…' : 'Invite'}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </Modal>

          {fireworks && (
            <View style={styles.fireworksOverlay} pointerEvents="none">
              <Text style={[styles.fireworksText, { color: chat.giftPopupColor }]}>🎆 {lastGifterName}: <Text style={{ color: (lastCelebrationPrice ?? 0) >= 10 ? chat.giftPhraseHighColor : (lastCelebrationPrice ?? 0) >= 5 ? chat.giftPhraseMidColor : chat.giftPhraseLowColor, fontWeight: '800' }}>{giftPhraseFor(lastCelebrationPrice ?? 5)}</Text> 🎆</Text>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0b0d" },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  videoContainer: { height: 360, backgroundColor: "#000", position: "relative" },
  videoPlaceholder: { width: "100%", height: "100%" },
  videoGradient: { position: "absolute", left: 0, right: 0, bottom: 0, height: 150 },
  streamHeader: { position: "absolute", top: 16, left: 16, right: 16, flexDirection: "row", alignItems: "center" },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center" },
  liveIndicator: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, marginLeft: 12 },
  liveText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  viewerCount: { flexDirection: "row", alignItems: "center", gap: 4, marginLeft: "auto", backgroundColor: "rgba(0, 0, 0, 0.5)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  viewerText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  actionButtonTiny: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
  actionButtonTinyGhost: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  streamInfoOverlay: { position: "absolute", bottom: 10, left: 16, right: 16 },
  streamerInfo: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  streamerAvatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: "#FF8A00", marginRight: 12 },
  streamerDetails: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  streamerNameBig: { color: "#fff", fontSize: 18, fontWeight: "800" },
  followPill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FF8A00", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  followText: { color: "#0b0b0d", fontSize: 12, fontWeight: "800" },
  streamDescription: { color: "#c9ced6", fontSize: 14, marginTop: 6 },
  actionsRowCompact: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  actionButtonSmall: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center" },
  coHostContainer: { position: "absolute", top: 80, right: 16, width: 120, height: 160, borderRadius: 12, overflow: "hidden", borderWidth: 2, borderColor: "#FF8A00" },
  coHostVideo: { flex: 1 },
  coHostImage: { width: "100%", height: "100%" },
  coHostLabel: { position: "absolute", bottom: 4, left: 4, backgroundColor: "#FF8A00", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 10, color: "#0b0b0d", fontWeight: "800" },
  gameLayoutWrap: { position: 'absolute', left: 12, right: 12, top: 70, bottom: 12 },
  gameTopRow: { flex: 0.35, flexDirection: 'row' },
  gameCol: { flex: 1, backgroundColor: '#000', overflow: 'hidden' },
  gameColImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  nameTagWrap: { position: 'absolute', left: 8, bottom: 8, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  nameTagText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  gameMain: { flex: 0.65, marginTop: 8, backgroundColor: '#000', overflow: 'hidden' },
  gameMainImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  chatContainer: { flex: 1, backgroundColor: "#121212", borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24, paddingTop: 16 },
  chatHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "rgba(255, 255, 255, 0.1)" },
  subscribeBtn: { marginLeft: "auto", backgroundColor: "#FF8A00", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  subscribeText: { color: "#0b0b0d", fontSize: 12, fontWeight: "800" },
  chatTitle: { fontSize: 16, fontWeight: "600", color: "#fff" },
  messagesList: { flex: 1 },
  messagesContent: { paddingHorizontal: 16, paddingVertical: 12 },
  messageContainer: { marginBottom: 12, flexDirection: "row", flexWrap: "wrap", alignItems: "flex-end" },
  messageInline: { color: "#fff", fontSize: 14 },
  inputContainer: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "rgba(255, 255, 255, 0.1)" },
  messageInput: { flex: 1, backgroundColor: "rgba(255, 255, 255, 0.1)", borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, color: "#fff", fontSize: 14, marginRight: 8 },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#FF8A00", justifyContent: "center", alignItems: "center" },
  errorText: { color: "#fff", fontSize: 16, textAlign: "center", marginTop: 50 },
  toolButton: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, justifyContent: "center", alignItems: "center", marginRight: 8 },
  toolButtonText: { fontSize: 18, fontWeight: "700" },
  stickerImage: { width: 64, height: 64, borderRadius: 8, marginLeft: 6 },
  scrollRow: { flexDirection: "row", alignItems: "center" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  menuCard: { backgroundColor: "#1a1a1a", padding: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(255,138,0,0.2)" },
  menuItem: { paddingVertical: 12 },
  menuItemText: { color: "#fff", fontSize: 16 },
  bottomSheet: { marginTop: "auto", backgroundColor: "#1a1a1a", padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(255,138,0,0.2)" },
  sheetTitle: { color: "#fff", fontSize: 16, fontWeight: "800", marginBottom: 12 },
  giftsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  giftChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FF8A00", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, marginRight: 8, marginBottom: 8 },
  giftChipPremium: { backgroundColor: '#FFD700' },
  giftLabel: { color: "#0b0b0d", fontSize: 12, fontWeight: "800" },
  giftPrice: { color: "#0b0b0d", fontSize: 12 },
  subscribePlan: { backgroundColor: "#FF8A00", padding: 14, borderRadius: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  subscribePlanText: { color: "#0b0b0d", fontSize: 14, fontWeight: "800" },
  subscribePlanPrice: { color: "#0b0b0d", fontSize: 14, fontWeight: "800" },
  fireworksOverlay: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  fireworksText: { fontSize: 22, color: "#fff", backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  friendRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4 },
  friendAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  friendName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  friendStatus: { color: '#9ca3af', fontSize: 12, marginTop: 2 },
  inviteBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FF8A00' },
  inviteBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.15)' },
  inviteBtnText: { color: '#0b0b0d', fontSize: 12, fontWeight: '800' },
});
