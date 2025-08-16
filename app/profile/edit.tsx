import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, Platform, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/AuthProvider';
import { useSettings } from '@/providers/SettingsProvider';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus } from 'lucide-react-native';

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const { profileBackgroundUrl, setProfileBackgroundUrl } = useSettings();

  const [displayName, setDisplayName] = useState<string>(user?.displayName ?? '');
  const [username, setUsername] = useState<string>(user?.username ?? '');
  const [bio, setBio] = useState<string>(user?.bio ?? '');
  const [avatar, setAvatar] = useState<string>(user?.avatar ?? '');
  const [banner, setBanner] = useState<string>(profileBackgroundUrl ?? '');

  const onSave = async () => {
    if (!username.trim()) {
      Alert.alert('Validation', 'Username is required');
      return;
    }
    await updateProfile({ displayName, username, avatar, bio });
    setProfileBackgroundUrl(banner || undefined);
    Alert.alert('Saved', 'Your profile was updated');
  };

  const pickImage = async (forField: 'avatar' | 'banner') => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow photo library access');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
      if (!res.canceled && res.assets && res.assets[0]?.uri) {
        const uri = res.assets[0].uri as string;
        if (forField === 'avatar') setAvatar(uri);
        else setBanner(uri);
      }
    } catch (e) {
      console.warn('Image pick failed', e);
      Alert.alert('Error', 'Could not pick image');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Edit Profile', headerTintColor: '#fff', headerStyle: { backgroundColor: '#0b0b0d' } }} />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <LinearGradient colors={["#FF8A00", "#FF6A00"]} style={styles.banner}>
            {banner ? <Image source={{ uri: banner }} style={styles.bannerImg} /> : null}
            <View style={styles.bannerOverlay} />
            <TouchableOpacity style={styles.bannerPick} onPress={() => pickImage('banner')} testID="pick-banner">
              <ImagePlus size={18} color="#0b0b0d" />
              <Text style={styles.bannerPickText}>Upload banner</Text>
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.section}>
            <Text style={styles.label}>Banner URL</Text>
            <TextInput value={banner} onChangeText={setBanner} placeholder="https://images..." placeholderTextColor="#888" style={styles.input} autoCapitalize="none" />

            <Text style={styles.label}>Avatar</Text>
            <View style={styles.avatarRow}>
              <Image source={{ uri: avatar || 'https://ui-avatars.com/api/?name=U&background=FF8A00&color=0b0b0d' }} style={styles.avatarPreview} />
              <TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage('avatar')} testID="pick-avatar">
                <ImagePlus size={16} color="#0b0b0d" />
                <Text style={styles.uploadText}>Upload</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Or Avatar URL</Text>
            <TextInput value={avatar} onChangeText={setAvatar} placeholder="https://..." placeholderTextColor="#888" style={styles.input} autoCapitalize="none" />

            <Text style={styles.label}>Display Name</Text>
            <TextInput value={displayName} onChangeText={setDisplayName} placeholder="Display name" placeholderTextColor="#888" style={styles.input} />

            <Text style={styles.label}>Username</Text>
            <TextInput value={username} onChangeText={setUsername} placeholder="username" placeholderTextColor="#888" style={styles.input} autoCapitalize="none" />

            <Text style={styles.label}>Bio</Text>
            <TextInput value={bio} onChangeText={setBio} placeholder="Tell people about you" placeholderTextColor="#888" style={[styles.input, { height: 100 }]} multiline />
          </View>

          <TouchableOpacity onPress={onSave} activeOpacity={0.85} testID="save-profile">
            <LinearGradient colors={["#FF8A00", "#FF6A00"]} style={styles.saveButton} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.saveText}>Save</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0b0d' },
  banner: { height: 140, marginBottom: 16, position: 'relative' },
  bannerImg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.4 },
  bannerOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  bannerPick: { position: 'absolute', right: 12, bottom: 12, backgroundColor: '#FF8A00', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 6 },
  bannerPickText: { color: '#0b0b0d', fontSize: 12, fontWeight: '800' },
  section: { paddingHorizontal: 16 },
  label: { color: '#fff', marginBottom: 6, marginTop: 8 },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 12, color: '#fff', marginBottom: 10 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  avatarPreview: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.1)' },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FF8A00', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  uploadText: { color: '#0b0b0d', fontSize: 12, fontWeight: '800' },
  saveButton: { marginHorizontal: 16, marginTop: 8, marginBottom: 24, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: '#0b0b0d', fontSize: 16, fontWeight: '800' },
});