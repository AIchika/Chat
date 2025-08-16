import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark";
export type VideoQuality = "auto" | "1080p" | "720p" | "480p";
export type EmojiStyle = "native" | "flat" | "vibrant";

export interface ChatAppearanceSettings {
  primaryColor: string;
  secondaryColor: string;
  fontSize: number;
  emojiStyle: EmojiStyle;
  reactionsEnabled: boolean;
  giftPopupColor: string;
  giftPhraseLow: string;
  giftPhraseLowColor: string;
  giftPhraseMid: string;
  giftPhraseMidColor: string;
  giftPhraseHigh: string;
  giftPhraseHighColor: string;
}

export interface NotificationSettings {
  pushFollowers: boolean;
  pushNewStreams: boolean;
  pushMessages: boolean;
  pushMentions: boolean;
}

export interface PrivacySettings {
  showOnlineStatus: boolean;
  allowFriendRequests: boolean;
  shareActivity: boolean;
}

export interface DeviceDefaultsSettings {
  defaultCamera: "front" | "back";
  defaultMicEnabled: boolean;
  videoQuality: VideoQuality;
}

export type SocialLinks = {
  twitter?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
};

export interface SubscriptionsSettings {
  active: string[];
  expired: string[];
}

export interface ContentPreferencesSettings {
  preferredCategories: string[];
  matureContent: boolean;
  language: string;
}

export interface SecuritySettings {
  twoFAEmail: boolean;
  twoFAPhone: boolean;
  twoFAGoogleEnabled: boolean;
  googleTotpSecret?: string;
  email?: string;
  phoneNumber?: string;
}

export interface SharingSettings {
  storyClipSharing: boolean;
  clipsVisibility: 'public' | 'followers' | 'private';
}

export type SocialEntry = { platform: string; url: string };

export interface SettingsState {
  theme: ThemeMode;
  chat: ChatAppearanceSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  device: DeviceDefaultsSettings;
  social: SocialLinks;
  socialList: SocialEntry[];
  subscriptions: SubscriptionsSettings;
  contentPreferences: ContentPreferencesSettings;
  security: SecuritySettings;
  sharing: SharingSettings;
  profileBackgroundUrl?: string;
  setTheme: (t: ThemeMode) => void;
  updateChat: (partial: Partial<ChatAppearanceSettings>) => void;
  updateNotifications: (partial: Partial<NotificationSettings>) => void;
  updatePrivacy: (partial: Partial<PrivacySettings>) => void;
  updateDevice: (partial: Partial<DeviceDefaultsSettings>) => void;
  updateSocial: (partial: Partial<SocialLinks>) => void;
  setSocialList: (next: SocialEntry[]) => void;
  updateSubscriptions: (partial: Partial<SubscriptionsSettings>) => void;
  updateContentPreferences: (partial: Partial<ContentPreferencesSettings>) => void;
  updateSecurity: (partial: Partial<SecuritySettings>) => void;
  updateSharing: (partial: Partial<SharingSettings>) => void;
  setProfileBackgroundUrl: (url?: string) => void;
  isHydrating: boolean;
}

const STORAGE_KEY = "settings";

export const [SettingsProvider, useSettings] = createContextHook<SettingsState>(() => {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [isHydrating, setIsHydrating] = useState<boolean>(true);
  const [chat, setChat] = useState<ChatAppearanceSettings>({
    primaryColor: "#FF8A00",
    secondaryColor: "#FF6A00",
    fontSize: 14,
    emojiStyle: "vibrant",
    reactionsEnabled: true,
    giftPopupColor: "#FFFFFF",
    giftPhraseLow: "Thanks for the gift!",
    giftPhraseLowColor: "#FF8A00",
    giftPhraseMid: "Chillz!",
    giftPhraseMidColor: "#FFD700",
    giftPhraseHigh: "Real one, dawg!",
    giftPhraseHighColor: "#00E5FF",
  });
  const [notifications, setNotifications] = useState<NotificationSettings>({
    pushFollowers: true,
    pushNewStreams: true,
    pushMessages: true,
    pushMentions: true,
  });
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    showOnlineStatus: true,
    allowFriendRequests: true,
    shareActivity: false,
  });
  const [device, setDevice] = useState<DeviceDefaultsSettings>({
    defaultCamera: "front",
    defaultMicEnabled: true,
    videoQuality: "auto",
  });
  const [social, setSocial] = useState<SocialLinks>({});
  const [subscriptions, setSubscriptions] = useState<SubscriptionsSettings>({ active: [], expired: [] });
  const [contentPreferences, setContentPreferences] = useState<ContentPreferencesSettings>({ preferredCategories: [], matureContent: false, language: 'en' });
  const [security, setSecurity] = useState<SecuritySettings>({ twoFAEmail: false, twoFAPhone: false, twoFAGoogleEnabled: false });
  const [sharing, setSharing] = useState<SharingSettings>({ storyClipSharing: true, clipsVisibility: 'public' });
  const [profileBackgroundUrl, setProfileBackgroundUrlState] = useState<string | undefined>(undefined);
  const [socialList, setSocialListState] = useState<SocialEntry[]>([]);

  useEffect(() => {
    void hydrate();
  }, []);

  useEffect(() => {
    if (!isHydrating) {
      void persist();
    }
  }, [theme, chat, notifications, privacy, device, social, isHydrating, subscriptions, contentPreferences, security, sharing, profileBackgroundUrl, socialList]);

  const hydrate = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<SettingsState> & { isHydrating?: boolean };
        if (parsed.theme) setThemeState(parsed.theme);
        if (parsed.chat) setChat(parsed.chat);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.privacy) setPrivacy(parsed.privacy);
        if (parsed.device) setDevice(parsed.device);
        if (parsed.social) setSocial(parsed.social);
        if (parsed.socialList) setSocialListState(parsed.socialList);
        if (parsed.subscriptions) setSubscriptions(parsed.subscriptions);
        if (parsed.contentPreferences) setContentPreferences(parsed.contentPreferences);
        if (parsed.security) setSecurity(parsed.security);
        if (parsed.sharing) setSharing(parsed.sharing);
        if (parsed.profileBackgroundUrl !== undefined) setProfileBackgroundUrlState(parsed.profileBackgroundUrl);
      }
    } catch (e) {
      console.log("Settings hydrate error", e);
    } finally {
      setIsHydrating(false);
    }
  };

  const persist = useCallback(async () => {
    try {
      const data = JSON.stringify({ theme, chat, notifications, privacy, device, social, socialList, subscriptions, contentPreferences, security, sharing, profileBackgroundUrl });
      await AsyncStorage.setItem(STORAGE_KEY, data);
    } catch (e) {
      console.log("Settings persist error", e);
    }
  }, [theme, chat, notifications, privacy, device, social, subscriptions, contentPreferences, security, sharing, profileBackgroundUrl]);

  const setTheme = useCallback((t: ThemeMode) => setThemeState(t), []);
  const updateChat = useCallback((partial: Partial<ChatAppearanceSettings>) => setChat((prev) => ({ ...prev, ...partial })), []);
  const updateNotifications = useCallback((partial: Partial<NotificationSettings>) => setNotifications((prev) => ({ ...prev, ...partial })), []);
  const updatePrivacy = useCallback((partial: Partial<PrivacySettings>) => setPrivacy((prev) => ({ ...prev, ...partial })), []);
  const updateDevice = useCallback((partial: Partial<DeviceDefaultsSettings>) => setDevice((prev) => ({ ...prev, ...partial })), []);
  const updateSocial = useCallback((partial: Partial<SocialLinks>) => setSocial((prev) => ({ ...prev, ...partial })), []);
  const updateSubscriptions = useCallback((partial: Partial<SubscriptionsSettings>) => setSubscriptions((prev) => ({ ...prev, ...partial })), []);
  const updateContentPreferences = useCallback((partial: Partial<ContentPreferencesSettings>) => setContentPreferences((prev) => ({ ...prev, ...partial })), []);
  const updateSecurity = useCallback((partial: Partial<SecuritySettings>) => setSecurity((prev) => ({ ...prev, ...partial })), []);
  const updateSharing = useCallback((partial: Partial<SharingSettings>) => setSharing((prev) => ({ ...prev, ...partial })), []);
  const setProfileBackgroundUrl = useCallback((url?: string) => setProfileBackgroundUrlState(url), []);
  const setSocialList = useCallback((next: SocialEntry[]) => setSocialListState(next), []);

  return useMemo(() => ({
    theme,
    chat,
    notifications,
    privacy,
    device,
    social,
    subscriptions,
    contentPreferences,
    security,
    sharing,
    profileBackgroundUrl,
    setTheme,
    updateChat,
    updateNotifications,
    updatePrivacy,
    updateDevice,
    updateSocial,
    socialList,
    setSocialList,
    updateSubscriptions,
    updateContentPreferences,
    updateSecurity,
    updateSharing,
    setProfileBackgroundUrl,
    isHydrating,
  }), [theme, chat, notifications, privacy, device, social, socialList, subscriptions, contentPreferences, security, sharing, profileBackgroundUrl, isHydrating]);
});