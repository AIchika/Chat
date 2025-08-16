import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Switch, TouchableOpacity, Image } from 'react-native';
import { Stack } from 'expo-router';
import { useSettings } from '@/providers/SettingsProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { Save, ChevronDown, ChevronUp, Check } from 'lucide-react-native';

export default function SettingsScreen() {
  const { theme, setTheme, chat, updateChat, notifications, updateNotifications, privacy, updatePrivacy, device, updateDevice, social, updateSocial, subscriptions, updateSubscriptions, contentPreferences, updateContentPreferences, security, updateSecurity, sharing, updateSharing, socialList, setSocialList, setProfileBackgroundUrl } = useSettings();
  const [local, setLocal] = useState({
    theme,
    primaryColor: chat.primaryColor,
    secondaryColor: chat.secondaryColor,
    fontSize: chat.fontSize.toString(),
    reactionsEnabled: chat.reactionsEnabled,
    emojiStyle: chat.emojiStyle,
    pushFollowers: notifications.pushFollowers,
    pushNewStreams: notifications.pushNewStreams,
    pushMessages: notifications.pushMessages,
    pushMentions: notifications.pushMentions,
    showOnlineStatus: privacy.showOnlineStatus,
    allowFriendRequests: privacy.allowFriendRequests,
    shareActivity: privacy.shareActivity,
    defaultCamera: device.defaultCamera,
    defaultMicEnabled: device.defaultMicEnabled,
    videoQuality: device.videoQuality,
    twitter: social.twitter ?? '',
    instagram: social.instagram ?? '',
    youtube: social.youtube ?? '',
    tiktok: social.tiktok ?? '',
  });

  const [showAddSocial, setShowAddSocial] = useState<boolean>(false);
  const [addSocialUrl, setAddSocialUrl] = useState<string>("");
  const [open, setOpen] = useState<{ [key: string]: boolean }>({
    theme: false,
    chat: false,
    notifications: false,
    privacy: false,
    device: false,
    socials: false,
    subscriptions: false,
    content: false,
    security: false,
    sharing: false,
  });
  const [emailDraft, setEmailDraft] = useState<string>(security.email ?? '');
  const [phoneDraft, setPhoneDraft] = useState<string>(security.phoneNumber ?? '');

  const detectPlatform = (url: string) => {
    const u = url.toLowerCase();
    if (u.includes('tiktok.com')) return 'TikTok';
    if (u.includes('instagram.com')) return 'Instagram';
    if (u.includes('twitter.com') || u.includes('x.com')) return 'Twitter';
    if (u.includes('youtube.com') || u.includes('youtu.be')) return 'YouTube';
    if (u.includes('facebook.com')) return 'Facebook';
    if (u.includes('twitch.tv')) return 'Twitch';
    if (u.includes('discord.gg') || u.includes('discord.com')) return 'Discord';
    if (u.includes('linkedin.com')) return 'LinkedIn';
    if (u.includes('snapchat.com')) return 'Snapchat';
    if (u.includes('reddit.com')) return 'Reddit';
    return 'Website';
  };

  const iconForPlatform = (platform: string) => {
    const base = 'https://cdn.simpleicons.org';
    const key = platform.toLowerCase();
    if (key === 'tiktok') return `${base}/tiktok/ffffff`;
    if (key === 'instagram') return `${base}/instagram/ffffff`;
    if (key === 'twitter') return `${base}/twitter/ffffff`;
    if (key === 'youtube') return `${base}/youtube/ffffff`;
    if (key === 'facebook') return `${base}/facebook/ffffff`;
    if (key === 'twitch') return `${base}/twitch/ffffff`;
    if (key === 'discord') return `${base}/discord/ffffff`;
    if (key === 'linkedin') return `${base}/linkedin/ffffff`;
    if (key === 'snapchat') return `${base}/snapchat/ffffff`;
    if (key === 'reddit') return `${base}/reddit/ffffff`;
    return `${base}/globe/ffffff`;
  };

  const apply = () => {
    setTheme(local.theme as any);
    updateChat({ primaryColor: local.primaryColor, secondaryColor: local.secondaryColor, fontSize: parseInt(local.fontSize, 10) || 14, reactionsEnabled: local.reactionsEnabled, emojiStyle: local.emojiStyle as any });
    updateNotifications({ pushFollowers: local.pushFollowers, pushNewStreams: local.pushNewStreams, pushMessages: local.pushMessages, pushMentions: local.pushMentions });
    updatePrivacy({ showOnlineStatus: local.showOnlineStatus, allowFriendRequests: local.allowFriendRequests, shareActivity: local.shareActivity });
    updateDevice({ defaultCamera: local.defaultCamera as any, defaultMicEnabled: local.defaultMicEnabled, videoQuality: local.videoQuality as any });
    updateSocial({ twitter: local.twitter || undefined, instagram: local.instagram || undefined, youtube: local.youtube || undefined, tiktok: local.tiktok || undefined });
    console.log('[Settings] Applied changes');
  };

  const ToggleHeader = ({ id, title }: { id: string; title: string }) => (
    <TouchableOpacity style={styles.accordionHeader} onPress={() => setOpen((p) => ({ ...p, [id]: !p[id] }))} testID={`accordion-${id}`}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {open[id] ? <ChevronUp size={18} color="#fff" /> : <ChevronDown size={18} color="#fff" />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Settings', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0b0b0d' }, headerBackTitle: 'Back' }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <LinearGradient colors={["#FF8A00", "#FF6A00"]} style={styles.hero}>
          <Text style={styles.heroTitle}>Settings</Text>
          <Text style={styles.heroSubtitle}>Personalize your experience</Text>
        </LinearGradient>

        <View style={styles.section}>
          <ToggleHeader id="theme" title="Theme" />
          {open.theme && (
            <View>
              <View style={styles.row}>
                {['light','dark'].map((t) => (
                  <TouchableOpacity key={t} style={[styles.chip, local.theme === t && styles.chipActive]} onPress={() => setLocal({ ...local, theme: t as any })}>
                    <Text style={[styles.chipText, local.theme === t && styles.chipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <ToggleHeader id="chat" title="Chat Appearance" />
          {open.chat && (
            <View>
              <View style={styles.row}>
                {['#FF8A00','#10B981','#3B82F6','#F59E0B','#EF4444','#8B5CF6'].map((c) => (
                  <TouchableOpacity key={c} style={[styles.colorSwatch, { backgroundColor: c }, local.primaryColor === c && styles.colorSwatchActive]} onPress={() => setLocal({ ...local, primaryColor: c })} testID={`color-${c}`} />
                ))}
              </View>
              <View style={[styles.row, { marginTop: 8 }]}>
                {['#FF6A00','#059669','#2563EB','#D97706','#DC2626','#7C3AED'].map((c) => (
                  <TouchableOpacity key={c} style={[styles.colorSwatch, { backgroundColor: c }, local.secondaryColor === c && styles.colorSwatchActive]} onPress={() => setLocal({ ...local, secondaryColor: c })} testID={`color2-${c}`} />
                ))}
              </View>
              <TextInput style={styles.input} placeholder="Font Size" keyboardType="number-pad" placeholderTextColor="#888" value={local.fontSize} onChangeText={(v) => setLocal({ ...local, fontSize: v })} />
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Reactions Enabled</Text>
                <Switch value={local.reactionsEnabled} onValueChange={(v) => setLocal({ ...local, reactionsEnabled: v })} trackColor={{ false: '#333', true: '#FF8A00' }} thumbColor="#fff" />
              </View>
              <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Gift Pop-up</Text>
              <View style={styles.row}>
                {['#FFFFFF','#FFD700','#00E5FF','#FF8A00'].map((c) => (
                  <TouchableOpacity key={c} style={[styles.colorSwatch, { backgroundColor: c }, chat.giftPopupColor === c && styles.colorSwatchActive]} onPress={() => updateChat({ giftPopupColor: c })} testID={`giftpopup-${c}`} />
                ))}
              </View>

              <TextInput style={styles.input} placeholder="Low value gift phrase (e.g. Thanks for the gift!)" placeholderTextColor="#888" value={chat.giftPhraseLow} onChangeText={(v) => updateChat({ giftPhraseLow: v })} />
              <View style={styles.row}>
                {['#FF8A00','#FFD700','#00E5FF','#FFFFFF'].map((c) => (
                  <TouchableOpacity key={c} style={[styles.colorSwatch, { backgroundColor: c }, chat.giftPhraseLowColor === c && styles.colorSwatchActive]} onPress={() => updateChat({ giftPhraseLowColor: c })} testID={`giftlowcolor-${c}`} />
                ))}
              </View>
              <TextInput style={styles.input} placeholder="Mid value gift phrase (e.g. Chillz!)" placeholderTextColor="#888" value={chat.giftPhraseMid} onChangeText={(v) => updateChat({ giftPhraseMid: v })} />
              <View style={styles.row}>
                {['#FF8A00','#FFD700','#00E5FF','#FFFFFF'].map((c) => (
                  <TouchableOpacity key={c} style={[styles.colorSwatch, { backgroundColor: c }, chat.giftPhraseMidColor === c && styles.colorSwatchActive]} onPress={() => updateChat({ giftPhraseMidColor: c })} testID={`giftmidcolor-${c}`} />
                ))}
              </View>
              <TextInput style={styles.input} placeholder="High value gift phrase (e.g. Real one, dawg!)" placeholderTextColor="#888" value={chat.giftPhraseHigh} onChangeText={(v) => updateChat({ giftPhraseHigh: v })} />
              <View style={styles.row}>
                {['#FF8A00','#FFD700','#00E5FF','#FFFFFF'].map((c) => (
                  <TouchableOpacity key={c} style={[styles.colorSwatch, { backgroundColor: c }, chat.giftPhraseHighColor === c && styles.colorSwatchActive]} onPress={() => updateChat({ giftPhraseHighColor: c })} testID={`gifthighcolor-${c}`} />
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <ToggleHeader id="notifications" title="Notifications" />
          {open.notifications && (
            <View>
              {[
                ['Followers', 'pushFollowers'],
                ['New Streams', 'pushNewStreams'],
                ['Messages', 'pushMessages'],
                ['Mentions', 'pushMentions'],
              ].map(([label, key]) => (
                <View key={key} style={styles.switchRow}>
                  <Text style={styles.switchLabel}>{label}</Text>
                  <Switch value={(local as any)[key]} onValueChange={(v) => setLocal({ ...local, [key]: v } as any)} trackColor={{ false: '#333', true: '#FF8A00' }} thumbColor="#fff" />
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <ToggleHeader id="privacy" title="Privacy" />
          {open.privacy && (
            <View>
              {[
                ['Show Online Status', 'showOnlineStatus'],
                ['Allow Friend Requests', 'allowFriendRequests'],
                ['Share Activity', 'shareActivity'],
              ].map(([label, key]) => (
                <View key={key} style={styles.switchRow}>
                  <Text style={styles.switchLabel}>{label}</Text>
                  <Switch value={(local as any)[key]} onValueChange={(v) => setLocal({ ...local, [key]: v } as any)} trackColor={{ false: '#333', true: '#FF8A00' }} thumbColor="#fff" />
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <ToggleHeader id="device" title="Device Defaults" />
          {open.device && (
            <View>
              <View style={styles.row}>
                {['front','back'].map((c) => (
                  <TouchableOpacity key={c} style={[styles.chip, local.defaultCamera === c && styles.chipActive]} onPress={() => setLocal({ ...local, defaultCamera: c as any })}>
                    <Text style={[styles.chipText, local.defaultCamera === c && styles.chipTextActive]}>{c} camera</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Mic Enabled</Text>
                <Switch value={local.defaultMicEnabled} onValueChange={(v) => setLocal({ ...local, defaultMicEnabled: v })} trackColor={{ false: '#333', true: '#FF8A00' }} thumbColor="#fff" />
              </View>
              <View style={styles.row}>
                {['auto','1080p','720p','480p'].map((q) => (
                  <TouchableOpacity key={q} style={[styles.chip, local.videoQuality === q && styles.chipActive]} onPress={() => setLocal({ ...local, videoQuality: q as any })}>
                    <Text style={[styles.chipText, local.videoQuality === q && styles.chipTextActive]}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <ToggleHeader id="socials" title="Socials" />
          {open.socials && (
            <View>
              <View style={styles.rowTop}>
                <TouchableOpacity style={[styles.chip, { borderColor: '#FF8A00' }]} onPress={() => setShowAddSocial((s) => !s)} testID="add-social">
                  <Text style={[styles.chipText, { color: '#FF8A00' }]}>+ Add Social</Text>
                </TouchableOpacity>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1, minWidth: 0 }} contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
                  {socialList.map((s, idx) => (
                    <View key={`${s.platform}-${idx}`} style={styles.socialPill}>
                      <Image source={{ uri: iconForPlatform(s.platform) }} style={{ width: 14, height: 14, marginRight: 6, borderRadius: 2 }} />
                      <Text style={styles.socialPillText}>{s.platform}</Text>
                      <TouchableOpacity onPress={() => setSocialList(socialList.filter((_, i) => i !== idx))}>
                        <Text style={styles.removePill}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
              <Text style={styles.hint}>Add up to 5 socials</Text>
              {showAddSocial && (
                <View style={styles.addSocialCard}>
                  <Text style={styles.switchLabel}>Paste Social URL</Text>
                  <View style={styles.addRow}>
                    <TextInput value={addSocialUrl} onChangeText={setAddSocialUrl} placeholder="https://tiktok.com/@username" placeholderTextColor="#888" style={[styles.input, { flex: 1, marginBottom: 0, minWidth: 0, flexShrink: 1 }]} />
                    <TouchableOpacity
                      style={[styles.doneButton]}
                      onPress={() => {
                        if (!addSocialUrl.trim()) return;
                        if (socialList.length >= 5) return;
                        const platform = detectPlatform(addSocialUrl.trim());
                        const next = [...socialList, { platform, url: addSocialUrl.trim() }];
                        setSocialList(next);
                        setAddSocialUrl("");
                        setShowAddSocial(false);
                      }}
                      testID="confirm-add-social"
                    >
                      <Text style={styles.doneButtonText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <ToggleHeader id="subscriptions" title="Subscriptions" />
          {open.subscriptions && (
            <View>
              <Text style={styles.hint}>Comma-separated</Text>
              <TextInput style={styles.input} placeholder="Active (e.g. GamerX, ChefMaria)" placeholderTextColor="#888" value={subscriptions.active.join(', ')} onChangeText={(v) => updateSubscriptions({ active: v.split(',').map(s => s.trim()).filter(Boolean) })} />
              <TextInput style={styles.input} placeholder="Expired" placeholderTextColor="#888" value={subscriptions.expired.join(', ')} onChangeText={(v) => updateSubscriptions({ expired: v.split(',').map(s => s.trim()).filter(Boolean) })} />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <ToggleHeader id="content" title="Content Preferences" />
          {open.content && (
            <View>
              <Text style={styles.hint}>Comma-separated categories</Text>
              <TextInput style={styles.input} placeholder="Preferred Categories" placeholderTextColor="#888" value={contentPreferences.preferredCategories.join(', ')} onChangeText={(v) => updateContentPreferences({ preferredCategories: v.split(',').map(s => s.trim()).filter(Boolean) })} />
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Show Mature Content</Text>
                <Switch value={contentPreferences.matureContent} onValueChange={(v) => updateContentPreferences({ matureContent: v })} trackColor={{ false: '#333', true: '#FF8A00' }} thumbColor="#fff" />
              </View>
              <TextInput style={styles.input} placeholder="Language (e.g. en, es)" placeholderTextColor="#888" value={contentPreferences.language} onChangeText={(v) => updateContentPreferences({ language: v })} />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <ToggleHeader id="security" title="Security" />
          {open.security && (
            <View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>2FA via Email</Text>
                <Switch value={security.twoFAEmail} onValueChange={(v) => updateSecurity({ twoFAEmail: v })} trackColor={{ false: '#333', true: '#FF8A00' }} thumbColor="#fff" />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>2FA via Phone</Text>
                <Switch value={security.twoFAPhone} onValueChange={(v) => updateSecurity({ twoFAPhone: v })} trackColor={{ false: '#333', true: '#FF8A00' }} thumbColor="#fff" />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>2FA via Google Authenticator</Text>
                <Switch value={security.twoFAGoogleEnabled} onValueChange={(v) => updateSecurity({ twoFAGoogleEnabled: v })} trackColor={{ false: '#333', true: '#FF8A00' }} thumbColor="#fff" />
              </View>
              <View style={styles.addRow}>
                <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="Email" placeholderTextColor="#888" value={emailDraft} onChangeText={setEmailDraft} />
                <TouchableOpacity style={styles.doneButton} onPress={() => updateSecurity({ email: emailDraft })} testID="email-done">
                  <Check size={16} color="#0b0b0d" />
                </TouchableOpacity>
              </View>
              <View style={styles.addRow}>
                <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="Phone Number" placeholderTextColor="#888" value={phoneDraft} onChangeText={setPhoneDraft} />
                <TouchableOpacity style={styles.doneButton} onPress={() => updateSecurity({ phoneNumber: phoneDraft })} testID="phone-done">
                  <Check size={16} color="#0b0b0d" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <ToggleHeader id="sharing" title="Sharing" />
          {open.sharing && (
            <View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Story Clip Sharing</Text>
                <Switch value={sharing.storyClipSharing} onValueChange={(v) => updateSharing({ storyClipSharing: v })} trackColor={{ false: '#333', true: '#FF8A00' }} thumbColor="#fff" />
              </View>
              <Text style={[styles.switchLabel, { marginTop: 12 }]}>Clips Visibility</Text>
              <View style={styles.row}>
                {(['public','followers','private'] as const).map((v) => (
                  <TouchableOpacity key={v} style={[styles.chip, sharing.clipsVisibility === v && styles.chipActive]} onPress={() => updateSharing({ clipsVisibility: v })}>
                    <Text style={[styles.chipText, sharing.clipsVisibility === v && styles.chipTextActive]}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>



        <TouchableOpacity onPress={apply} activeOpacity={0.8} testID="save-settings">
          <LinearGradient colors={["#FF8A00", "#FF6A00"]} style={styles.saveButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Save size={22} color="#0b0b0d" />
            <Text style={styles.saveText}>Save Changes</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b0d' },
  hero: { paddingHorizontal: 16, paddingVertical: 24 },
  heroTitle: { color: '#fff', fontSize: 28, fontWeight: '800' },
  heroSubtitle: { color: 'rgba(255,255,255,0.8)', marginTop: 6 },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' as const },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chip: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
  chipActive: { borderColor: '#FF8A00' },
  colorSwatch: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'transparent' },
  colorSwatchActive: { borderColor: '#fff' },
  chipText: { color: '#bbb', fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#FF8A00' },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 12, color: '#fff', marginBottom: 10 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 12, marginBottom: 10 },
  switchLabel: { color: '#fff', fontSize: 15 },
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginHorizontal: 16, marginBottom: 32, paddingVertical: 14, borderRadius: 12 },
  doneButton: { backgroundColor: '#FF8A00', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, marginLeft: 8 },
  doneButtonText: { color: '#0b0b0d', fontWeight: '800' },
  saveText: { color: '#0b0b0d', fontSize: 16, fontWeight: '800' },
  hint: { color: '#888', fontSize: 12, marginBottom: 8 },
  addSocialCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 12, marginTop: 10 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  socialRowItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 10 },
  socialPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, maxWidth: 160 },
  socialPillText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  removePill: { color: '#FF8A00', marginLeft: 6, fontSize: 14, fontWeight: '900' }
});