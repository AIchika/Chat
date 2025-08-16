import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, TrendingUp, Clock, Star } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useStreams } from "@/providers/StreamProvider";

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const { liveStreams, categories, trendingTags } = useStreams();

  const filteredStreams = liveStreams.filter(
    (stream) =>
      stream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.streamer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTag = ({ item }: { item: string }) => (
    <TouchableOpacity style={styles.tagChip} activeOpacity={0.7}>
      <Text style={styles.tagText}>#{item}</Text>
    </TouchableOpacity>
  );

  const renderStreamResult = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.searchResult}
      onPress={() => router.push(`/stream/${item.id}`)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.thumbnail }} style={styles.resultImage} />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.resultStreamer}>{item.streamer}</Text>
        <View style={styles.resultMeta}>
          <Text style={styles.resultCategory}>{item.category}</Text>
          <Text style={styles.resultViewers}>{item.viewers} viewers</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Discover</Text>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search streams, games, or streamers..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {searchQuery ? (
            <View style={styles.searchResults}>
              <Text style={styles.sectionTitle}>Search Results</Text>
              <FlatList
                data={filteredStreams}
                renderItem={renderStreamResult}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No results found</Text>
                }
              />
            </View>
          ) : (
            <>
              {/* Trending Tags */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <TrendingUp size={20} color="#FF8A00" />
                  <Text style={styles.sectionTitle}>Trending Tags</Text>
                </View>
                <FlatList
                  data={trendingTags}
                  renderItem={renderTag}
                  keyExtractor={(item) => item}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.tagList}
                />
              </View>

              {/* Popular Categories */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Star size={20} color="#FF8A00" />
                  <Text style={styles.sectionTitle}>Popular Categories</Text>
                </View>
                <View style={styles.categoryGrid}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={styles.categoryCard}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={category.colors as [string, string, ...string[]]}
                        style={styles.categoryGradient}
                      >
                        <Text style={styles.categoryName}>{category.name}</Text>
                        <Text style={styles.categoryStreamCount}>
                          {category.streamCount} streams
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Recent Streams */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Clock size={20} color="#FF8A00" />
                  <Text style={styles.sectionTitle}>Recently Started</Text>
                </View>
                <FlatList
                  data={liveStreams.slice(0, 5)}
                  renderItem={renderStreamResult}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              </View>
            </>
          )}
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
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: "#fff",
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  tagList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tagChip: {
    backgroundColor: "rgba(255, 138, 0, 0.18)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 138, 0, 0.3)",
    marginRight: 8,
  },
  tagText: {
    color: "#FF8A00",
    fontSize: 14,
    fontWeight: "500",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    width: "47%",
    height: 100,
  },
  categoryGradient: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    justifyContent: "space-between",
  },
  categoryName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  categoryStreamCount: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  searchResults: {
    paddingHorizontal: 16,
  },
  searchResult: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 138, 0, 0.15)",
  },
  resultImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  resultTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  resultStreamer: {
    color: "#FF8A00",
    fontSize: 12,
  },
  resultMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  resultCategory: {
    color: "#888",
    fontSize: 11,
  },
  resultViewers: {
    color: "#888",
    fontSize: 11,
  },
  emptyText: {
    color: "#888",
    textAlign: "center",
    marginTop: 32,
  },
});