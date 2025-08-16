import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Camera,
  Smartphone,
  Monitor,
  Users,
  Settings,
  Radio,
} from "lucide-react-native";

export default function GoLiveScreen() {
  console.log('[Live] render GoLiveScreen');
  const [streamTitle, setStreamTitle] = useState("");
  const [streamCategory, setStreamCategory] = useState("Just Chatting");
  const [enableCoHost, setEnableCoHost] = useState(false);
  const [coHostUsername, setCoHostUsername] = useState("");
  const [streamSource, setStreamSource] = useState<"mobile" | "pc" | "obs">(
    "mobile"
  );

  const categories = [
    "Just Chatting",
    "IRL",
    "Gaming",
    "Music",
    "Art",
    "Cooking",
    "Sports",
    "Education",
    "Technology",
  ];

  const handleStartStream = () => {
    if (!streamTitle) {
      Alert.alert("Error", "Please enter a stream title");
      return;
    }
    
    Alert.alert(
      "Start Streaming",
      `Starting "${streamTitle}" in ${streamCategory} category`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Start",
          onPress: () => router.push("/go-live"),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Go Live</Text>
            <Text style={styles.headerSubtitle}>
              Start streaming to your audience
            </Text>
          </View>

          {/* Stream Source Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stream Source</Text>
            <View style={styles.sourceOptions}>
              <TouchableOpacity
                style={[
                  styles.sourceOption,
                  streamSource === "mobile" && styles.sourceOptionActive,
                ]}
                onPress={() => setStreamSource("mobile")}
              >
                <Smartphone
                  size={24}
                  color={streamSource === "mobile" ? "#fff" : "#888"}
                />
                <Text
                  style={[
                    styles.sourceText,
                    streamSource === "mobile" && styles.sourceTextActive,
                  ]}
                >
                  Mobile
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sourceOption,
                  streamSource === "pc" && styles.sourceOptionActive,
                ]}
                onPress={() => setStreamSource("pc")}
              >
                <Monitor
                  size={24}
                  color={streamSource === "pc" ? "#fff" : "#888"}
                />
                <Text
                  style={[
                    styles.sourceText,
                    streamSource === "pc" && styles.sourceTextActive,
                  ]}
                >
                  PC Browser
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sourceOption,
                  streamSource === "obs" && styles.sourceOptionActive,
                ]}
                onPress={() => setStreamSource("obs")}
              >
                <Settings
                  size={24}
                  color={streamSource === "obs" ? "#fff" : "#888"}
                />
                <Text
                  style={[
                    styles.sourceText,
                    streamSource === "obs" && styles.sourceTextActive,
                  ]}
                >
                  OBS
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stream Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stream Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Stream Title"
              placeholderTextColor="#888"
              value={streamTitle}
              onChangeText={setStreamTitle}
            />

            <View style={styles.categorySelector}>
              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      streamCategory === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => setStreamCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        streamCategory === cat && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Co-Host Settings */}
          <View style={styles.section}>
            <View style={styles.coHostHeader}>
              <Users size={20} color="#FF8A00" />
              <Text style={styles.sectionTitle}>Co-Host Settings</Text>
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Enable Co-Host</Text>
              <Switch
                value={enableCoHost}
                onValueChange={setEnableCoHost}
                trackColor={{ false: "#333", true: "#FF8A00" }}
                thumbColor="#fff"
              />
            </View>
            {enableCoHost && (
              <TextInput
                style={styles.input}
                placeholder="@cohost_username"
                placeholderTextColor="#888"
                value={coHostUsername}
                onChangeText={(v) => setCoHostUsername(v.startsWith('@') ? v : `@${v}`)}
              />
            )}
          </View>

          {/* Stream Key (for OBS) */}
          {streamSource === "obs" && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Stream Key</Text>
              <View style={styles.streamKeyContainer}>
                <Text style={styles.streamKey}>rtmp://live.chatt.tv/live</Text>
                <TouchableOpacity style={styles.copyButton}>
                  <Text style={styles.copyButtonText}>Copy</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.streamKeyHint}>
                Use this URL in your OBS settings
              </Text>
            </View>
          )}

          {/* Start Stream Button */}
          <TouchableOpacity onPress={handleStartStream} activeOpacity={0.8}>
            <LinearGradient
              colors={["#FF8A00", "#FF6A00"]}
              style={styles.startButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Radio size={24} color="#fff" />
              <Text style={styles.startButtonText}>Start Streaming</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    paddingVertical: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#888",
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
  sourceOptions: {
    flexDirection: "row",
    gap: 12,
  },
  sourceOption: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  sourceOptionActive: {
    backgroundColor: "rgba(255, 138, 0, 0.15)",
    borderColor: "#FF8A00",
  },
  sourceText: {
    color: "#888",
    fontSize: 12,
    marginTop: 8,
  },
  sourceTextActive: {
    color: "#fff",
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  inputLabel: {
    color: "#888",
    fontSize: 14,
    marginBottom: 8,
  },
  categorySelector: {
    marginTop: 8,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryChip: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  categoryChipActive: {
    backgroundColor: "rgba(255, 138, 0, 0.15)",
    borderColor: "#FF8A00",
  },
  categoryChipText: {
    color: "#888",
    fontSize: 14,
  },
  categoryChipTextActive: {
    color: "#FF8A00",
  },
  coHostHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  switchLabel: {
    color: "#fff",
    fontSize: 16,
  },
  streamKeyContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streamKey: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
  },
  copyButton: {
    backgroundColor: "rgba(255, 138, 0, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  copyButtonText: {
    color: "#FF8A00",
    fontSize: 14,
    fontWeight: "600",
  },
  streamKeyHint: {
    color: "#888",
    fontSize: 12,
    marginTop: 8,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});