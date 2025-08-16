import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { useSettings } from "@/providers/SettingsProvider";
import {
  Settings as SettingsIcon,
  LogOut,
  Video,
  Users,
  Heart,
  Clock,
  Edit,
  Check,
} from "lucide-react-native";

interface RecentStream {
  id: string;
  title: string;
  viewers: string; // e.g., "2.3K"
  date: string;
  thumbnail: string;
}

type SortKey = "Most Watched" | "Popular";

type Social = { twitter?: string; instagram?: string; youtube?: string; tiktok?: string };

const getSocialIcon = (platform: string) => {
  const key = platform.toLowerCase();
  const base = 'https://cdn.simpleicons.org';
  if (key.includes('tiktok')) return `${base}/tiktok/ffffff`;
  if (key.includes('twitter') || key.includes('x')) return `${base}/twitter/ffffff`;
  if (key.includes('instagram')) return `${base}/instagram/ffffff`;
  if (key.includes('youtube')) return `${base}/youtube/ffffff`;
  if (key.includes('facebook')) return `${base}/facebook/ffffff`;
  if (key.includes('twitch')) return `${base}/twitch/ffffff`;
  if (key.includes('discord')) return `${base}/discord/ffffff`;
  return `${base}/globe/ffffff`;
};

export default function ProfileScreen() {
  console.log('[Profile] render ProfileScreen');
  const { user, logout } = useAuth();
  const { social, profileBackgroundUrl, socialList } = useSettings();

  const [activeTab, setActiveTab] = useState<string>("Home");
  const [sortBy, setSortBy] = useState<SortKey>("Most Watched");

  const stats = [
    { label: "Followers", value: "12.5K", icon: Users },
    { label: "Total Views", value: "245K", icon: Video },
    { label: "Likes", value: "89K", icon: Heart },
    { label: "Stream Hours", value: "342", icon: Clock },
  ];

  const recentStreams: RecentStream[] = [
    {
      id: "1",
      title: "Late Night Gaming Session",
      viewers: "2.3K",
      date: "2 days ago",
      thumbnail: "https://picsum.photos/400/225?random=1",
    },
    {
      id: "2",
      title: "Just Chatting with Viewers",
      viewers: "1.8K",
      date: "5 days ago",
      thumbnail: "https://picsum.photos/400/225?random=2",
    },
    {
      id: "3",
      title: "Art Stream - Digital Painting",
      viewers: "956",
      date: "1 week ago",
      thumbnail: "https://picsum.photos/400/225?random=3",
    },
  ];

  const sortedStreams = useMemo<RecentStream[]>(() => {
    const parseViewers = (v: string) => {
      const num = v.toUpperCase();
      if (num.endsWith('K')) return Math.round(parseFloat(num) * 1000);
      if (num.endsWith('M')) return Math.round(parseFloat(num) * 1000000);
      return parseInt(num.replace(/\D/g, ''), 10);
    };
    const copy = [...recentStreams];
    if (sortBy === "Most Watched") {
      return copy.sort((a, b) => parseViewers(b.viewers) - parseViewers(a.viewers));
    }
    return copy; // Popular placeholder
  }, [sortBy]);

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  const renderSocial = (label: string, value?: string) => (
    <View key={label} style={styles.socialItem}>
      <Text style={styles.socialLabel}>{label}</Text>
      <Text style={[styles.socialValue, !value && { color: '#888' }]}>{value ?? 'Add in Settings'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Image source={{ uri: profileBackgroundUrl ?? 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=2000&auto=format&fit=crop' }} style={styles.headerBg} />
            <View style={styles.headerActions}>
              <TouchableOpacity style={[styles.headerButton, { marginRight: 'auto' }]} onPress={() => router.push('/profile/edit')} testID="edit-profile">
                <Edit size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/settings')} testID="open-settings">
                <SettingsIcon size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: user?.avatar }} style={styles.avatar} />
              </View>
              <Text style={styles.lastSeen}>Last seen 2h ago</Text>
              <View style={styles.nameRow}>
                <Text style={styles.username}>{user?.username}</Text>
                {(user as any)?.verified ? (
                  <View style={styles.verifiedBadge}>
                    <Check size={12} color="#0b0b0d" />
                  </View>
                ) : null}
              </View>
              <Text style={styles.bio}>{user?.bio ?? ' '}</Text>
              <View style={styles.headerSocialsRow}>
                {socialList.map((entry, idx) => {
                  const iconUrl = getSocialIcon(entry.platform);
                  return (
                    <TouchableOpacity key={idx} style={styles.headerSocial} onPress={() => Linking.openURL(entry.url)}>
                      <Image source={{ uri: iconUrl }} style={styles.socialIconImg} />
                      <Text style={styles.headerSocialText}>{entry.platform}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.statsContainer}>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <View key={index} style={styles.statCard}>
                  <Icon size={20} color="#FF8A00" />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.section}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {["Home", "Recent", "About", "Clips", "Videos", "Chat"].map((tab) => (
                <TouchableOpacity key={tab} style={styles.menuChip} onPress={() => setActiveTab(tab)} testID={`profile-tab-${tab}`}>
                  <Text style={[styles.menuChipText, activeTab === tab && styles.menuChipTextActive]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {activeTab === 'Home' && (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Saved (kept 7 days)</Text>
                <Text style={{ color: '#888' }}>Your highlights and saved streams are kept for 7 days.</Text>
              </View>
            </>
          )}

          {activeTab === 'Recent' && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Recent Streams</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {["Most Watched", "Popular"].map((s) => (
                    <TouchableOpacity key={s} style={[styles.sortChip, sortBy === s ? { borderColor: '#FF8A00' } : null]} onPress={() => setSortBy(s as SortKey)} testID={`sort-${s}`}>
                      <Text style={[styles.sortChipText, sortBy === s && styles.sortChipTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {sortedStreams.map((stream) => (
                <TouchableOpacity key={stream.id} style={styles.streamCard} activeOpacity={0.8}>
                  <Image source={{ uri: stream.thumbnail }} style={styles.streamThumbnail} />
                  <View style={styles.streamInfo}>
                    <Text style={styles.streamTitle} numberOfLines={1}>{stream.title}</Text>
                    <Text style={styles.streamMeta}>{stream.viewers} viewers • {stream.date}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === 'About' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={{ color: '#c9ced6' }}>Streaming games, art, and good vibes ✨</Text>
            </View>
          )}

          {activeTab === 'Clips' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Clips</Text>
              <Text style={{ color: '#888' }}>No clips yet</Text>
            </View>
          )}

          {activeTab === 'Videos' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Videos</Text>
              <Text style={{ color: '#888' }}>No videos yet</Text>
            </View>
          )}

          {activeTab === 'Chat' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chat</Text>
              <Text style={{ color: '#888' }}>Start chatting with your community</Text>
            </View>
          )}



          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>View Analytics</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout} testID="logout-button">
              <LogOut size={20} color="#ff4444" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0b0d",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#fff",
    marginBottom: 16,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  verifiedBadge: { backgroundColor: '#FF8A00', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  bio: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  lastSeen: { color: '#c9ced6', marginTop: 6, marginBottom: 6 },
  headerBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 1 },
  headerSocialsRow: { flexDirection: 'row', gap: 10, marginTop: 12, flexWrap: 'wrap' as const, justifyContent: 'center' },
  headerSocial: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  headerSocialText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  socialIconImg: { width: 14, height: 14, borderRadius: 2 },
  avatarWrapper: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  socialsOverlayRow: { display: 'none' },
  socialsOverlayChip: { display: 'none' },
  socialsOverlayText: { display: 'none' },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: -16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 16,
  },
  menuChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  menuChipText: { color: '#bbb', fontSize: 13, fontWeight: '600' },
  menuChipTextActive: { color: '#FF8A00' },
  socialRow: { flexDirection: 'row', flexWrap: 'wrap' as const, gap: 12 },
  socialItem: { width: '48%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 12 },
  socialLabel: { color: '#888', fontSize: 12, marginBottom: 6 },
  socialValue: { color: '#fff', fontSize: 14, fontWeight: '500' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sortChip: { backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  sortChipText: { color: '#bbb', fontSize: 12 },
  sortChipTextActive: { color: '#FF8A00' },
  streamCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  streamThumbnail: {
    width: 100,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  streamInfo: {
    flex: 1,
    justifyContent: "center",
  },
  streamTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  streamMeta: {
    color: "#888",
    fontSize: 12,
  },
  actions: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  actionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    borderColor: "rgba(255, 68, 68, 0.2)",
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: "#ff4444",
    fontSize: 16,
    fontWeight: "500",
  },
});