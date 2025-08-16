import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  useWindowDimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  X,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Users,
  Radio,
  FlipHorizontal2,
} from "lucide-react-native";
import chattAPI, { StreamData } from "@/lib/api";
import chattSocket from "@/lib/socket";

type Audience = "Public" | "Followers" | "Subscribers";

type Latency = "Normal" | "Low" | "Ultra Low";

type Orientation = "Portrait" | "Landscape";

type Resolution = "720p" | "1080p";

export default function GoLiveModal() {
  const { height } = useWindowDimensions();
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isFrontCamera, setIsFrontCamera] = useState<boolean>(true);

  const [title, setTitle] = useState<string>("");
  const [category, setCategory] = useState<string>("Just chatting");
  const [tags, setTags] = useState<string>("");
  const [audience, setAudience] = useState<Audience>("Public");
  const [latency, setLatency] = useState<Latency>("Low");
  const [orientation, setOrientation] = useState<Orientation>("Portrait");
  const [resolution, setResolution] = useState<Resolution>("1080p");
  const [slowMode, setSlowMode] = useState<boolean>(false);
  const [followersOnly, setFollowersOnly] = useState<boolean>(false);
  const [emoteOnly, setEmoteOnly] = useState<boolean>(false);
  const [saveVOD, setSaveVOD] = useState<boolean>(true);
  const [ageRestricted, setAgeRestricted] = useState<boolean>(false);

  const selectableCategories: string[] = useMemo(() => [
    "Just chatting",
    "Gaming",
    "IRL",
    "Music",
    "Sports",
    "Art",
  ], []);

  const handleStartStream = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please add a stream title");
      return;
    }

    try {
      // Prepare stream data for backend
      const streamData: StreamData = {
        userId: "user_" + Date.now(), // TODO: Replace with actual user ID from auth
        title: title.trim(),
        description: `Live stream in ${category}`,
        category,
        tags: tags.split(/[,#\s]+/).filter(Boolean),
        audience,
        latency,
        orientation,
        resolution,
        chatSettings: { slowMode, followersOnly, emoteOnly },
        recording: { saveVOD, ageRestricted },
        devices: { camera: isCameraOn, mic: isMicOn, frontCamera: isFrontCamera },
      };

      console.log("GoLive: Starting stream with data:", streamData);

      // Call backend API to start stream
      const response = await chattAPI.startStream(streamData);
      
      if (response.success) {
        console.log("GoLive: Stream started successfully:", response.streamId);
        
        // Join stream room via Socket.io
        chattSocket.joinStream(response.streamId, streamData.userId, 'broadcaster');
        
        // Update UI state
        setIsStreaming(true);
        
        // Navigate to stream page
        router.push(`/stream/${response.streamId}`);
      } else {
        Alert.alert("Error", "Failed to start stream. Please try again.");
      }
    } catch (error) {
      console.error("GoLive: Failed to start stream:", error);
      Alert.alert("Error", "Failed to start stream. Please check your connection and try again.");
    }
  };

  const handleEndStream = async () => {
    try {
      // TODO: Get actual stream ID from state
      const streamId = "current_stream_id"; // This should come from stream state
      
      if (streamId) {
        // Call backend API to end stream
        await chattAPI.endStream(streamId);
        console.log("GoLive: Stream ended successfully");
        
        // Leave stream room via Socket.io
        chattSocket.leaveStream(streamId, "user_" + Date.now());
      }
    } catch (error) {
      console.error("GoLive: Failed to end stream:", error);
    } finally {
      setIsStreaming(false);
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            testID="go-live-close"
          >
            <X size={24} color="#fff" />
          </TouchableOpacity>
          {isStreaming && (
            <View style={styles.liveIndicator}>
              <Radio size={16} color="#fff" />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
          {isStreaming && (
            <View style={styles.viewerCount}>
              <Users size={16} color="#fff" />
              <Text style={styles.viewerText}>0</Text>
            </View>
          )}
        </View>

        <View style={[styles.cameraContainer, { height: Math.min(420, height * 0.52) }]}>
          <Image
            source={{ uri: "https://picsum.photos/400/600?random=99" }}
            style={styles.cameraPreview}
          />
          {!isCameraOn && (
            <View style={styles.cameraOff}>
              <CameraOff size={48} color="#888" />
              <Text style={styles.cameraOffText}>Camera is off</Text>
            </View>
          )}
        </View>

        <ScrollView style={styles.form} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionLabel}>Stream info</Text>
          <TextInput
            placeholder="Add a title"
            placeholderTextColor="#9aa0a6"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            maxLength={80}
            testID="title-input"
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {selectableCategories.map((c) => {
              const active = c === category;
              return (
                <TouchableOpacity key={c} onPress={() => setCategory(c)} style={[styles.chip, active ? styles.chipActive : undefined]} testID={`cat-${c}`}>
                  <Text style={[styles.chipText, active ? styles.chipTextActive : undefined]}>{c}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TextInput
            placeholder="Tags (comma or # separated)"
            placeholderTextColor="#9aa0a6"
            value={tags}
            onChangeText={setTags}
            style={styles.input}
            testID="tags-input"
          />

          <Text style={styles.sectionLabel}>Audience</Text>
          <View style={styles.rowWrap}>
            {["Public", "Followers", "Subscribers"].map((a) => {
              const act = a === audience;
              return (
                <TouchableOpacity key={a} onPress={() => setAudience(a as Audience)} style={[styles.togglePill, act ? styles.togglePillOn : undefined]} testID={`aud-${a}`}>
                  <Text style={[styles.togglePillText, act ? styles.togglePillTextOn : undefined]}>{a}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>Latency</Text>
          <View style={styles.rowWrap}>
            {["Normal", "Low", "Ultra Low"].map((l) => {
              const act = l === latency;
              return (
                <TouchableOpacity key={l} onPress={() => setLatency(l as Latency)} style={[styles.togglePill, act ? styles.togglePillOn : undefined]} testID={`lat-${l}`}>
                  <Text style={[styles.togglePillText, act ? styles.togglePillTextOn : undefined]}>{l}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>Video</Text>
          <View style={styles.rowWrap}>
            {["Portrait", "Landscape"].map((o) => {
              const act = o === orientation;
              return (
                <TouchableOpacity key={o} onPress={() => setOrientation(o as Orientation)} style={[styles.togglePill, act ? styles.togglePillOn : undefined]} testID={`ori-${o}`}>
                  <Text style={[styles.togglePillText, act ? styles.togglePillTextOn : undefined]}>{o}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.rowWrap}>
            {["1080p", "720p"].map((r) => {
              const act = r === resolution;
              return (
                <TouchableOpacity key={r} onPress={() => setResolution(r as Resolution)} style={[styles.togglePill, act ? styles.togglePillOn : undefined]} testID={`res-${r}`}>
                  <Text style={[styles.togglePillText, act ? styles.togglePillTextOn : undefined]}>{r}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>Chat</Text>
          <View style={styles.rowWrap}>
            <TouchableOpacity onPress={() => setSlowMode(!slowMode)} style={[styles.togglePill, slowMode ? styles.togglePillOn : undefined]} testID="chat-slow">
              <Text style={[styles.togglePillText, slowMode ? styles.togglePillTextOn : undefined]}>Slow mode</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFollowersOnly(!followersOnly)} style={[styles.togglePill, followersOnly ? styles.togglePillOn : undefined]} testID="chat-followers">
              <Text style={[styles.togglePillText, followersOnly ? styles.togglePillTextOn : undefined]}>Followers only</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEmoteOnly(!emoteOnly)} style={[styles.togglePill, emoteOnly ? styles.togglePillOn : undefined]} testID="chat-emote">
              <Text style={[styles.togglePillText, emoteOnly ? styles.togglePillTextOn : undefined]}>Emote only</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Recording</Text>
          <View style={styles.rowWrap}>
            <TouchableOpacity onPress={() => setSaveVOD(!saveVOD)} style={[styles.togglePill, saveVOD ? styles.togglePillOn : undefined]} testID="vod">
              <Text style={[styles.togglePillText, saveVOD ? styles.togglePillTextOn : undefined]}>Save VOD</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAgeRestricted(!ageRestricted)} style={[styles.togglePill, ageRestricted ? styles.togglePillOn : undefined]} testID="age">
              <Text style={[styles.togglePillText, ageRestricted ? styles.togglePillTextOn : undefined]}>18+</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.controls}>
          <View style={styles.controlButtons}>
            <TouchableOpacity
              style={[styles.controlButton, !isCameraOn && styles.controlButtonOff]}
              onPress={() => setIsCameraOn(!isCameraOn)}
              testID="toggle-camera"
            >
              {isCameraOn ? (
                <Camera size={24} color="#fff" />
              ) : (
                <CameraOff size={24} color="#fff" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, !isMicOn && styles.controlButtonOff]}
              onPress={() => setIsMicOn(!isMicOn)}
              testID="toggle-mic"
            >
              {isMicOn ? (
                <Mic size={24} color="#fff" />
              ) : (
                <MicOff size={24} color="#fff" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setIsFrontCamera(!isFrontCamera)}
              testID="toggle-camera-face"
            >
              <FlipHorizontal2 size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {!isStreaming ? (
            <TouchableOpacity onPress={handleStartStream} activeOpacity={0.8} testID="start-stream">
              <LinearGradient
                colors={["#FF8A00", "#fb5607"]}
                style={styles.startButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Radio size={24} color="#0b0b0d" />
                <Text style={styles.startButtonText}>Start Stream</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.endButton}
              onPress={handleEndStream}
              testID="end-stream"
            >
              <Text style={styles.endButtonText}>End Stream</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1a",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ff0000",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  liveText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  viewerCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: "auto",
  },
  viewerText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  cameraContainer: {
    width: "100%",
    backgroundColor: "#000",
    position: "relative",
  },
  cameraPreview: {
    width: "100%",
    height: "100%",
  },
  cameraOff: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraOffText: {
    color: "#888",
    fontSize: 16,
    marginTop: 12,
  },
  form: { flex: 1 },
  formContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 120, gap: 12 },
  sectionLabel: { color: "#c9ced6", fontSize: 12, fontWeight: "800" },
  input: { backgroundColor: "#14141a", borderColor: "#222230", borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: "#fff", fontSize: 14 },
  chipsRow: { paddingVertical: 6, gap: 8 },
  chip: { backgroundColor: "rgba(255,138,0,0.18)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,138,0,0.35)", marginRight: 8 },
  chipActive: { backgroundColor: "#FF8A00", borderColor: "#FF8A00" },
  chipText: { color: "#FF8A00", fontSize: 12, fontWeight: "800" },
  chipTextActive: { color: "#0b0b0d" },
  rowWrap: { flexDirection: "row", flexWrap: "wrap" as const, gap: 8 },
  togglePill: { backgroundColor: "#14141a", borderColor: "#222230", borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  togglePillOn: { backgroundColor: "#FF8A00", borderColor: "#FF8A00" },
  togglePillText: { color: "#c9ced6", fontSize: 12, fontWeight: "800" },
  togglePillTextOn: { color: "#0b0b0d" },

  controls: {
    position: "absolute",
    bottom: 24,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  controlButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginBottom: 24,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  controlButtonOff: {
    backgroundColor: "rgba(255, 68, 68, 0.2)",
    borderColor: "rgba(255, 68, 68, 0.3)",
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 16,
    borderRadius: 28,
  },
  startButtonText: {
    color: "#0b0b0d",
    fontSize: 16,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  endButton: {
    backgroundColor: "#ff4444",
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
  },
  endButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});