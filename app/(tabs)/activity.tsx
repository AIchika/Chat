import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ActivityItem {
  id: string;
  text: string;
}

const DATA: ActivityItem[] = [
  { id: "1", text: "ProGamer123 started a stream" },
  { id: "2", text: "ChefMaria went live" },
  { id: "3", text: "JazzVibes uploaded a new clip" },
];

export default function ActivityScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <Text style={styles.title}>Activity</Text>
        <FlatList
          data={DATA}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item} testID={`activity-item-${item.id}`}>
              <Text style={styles.itemText}>{item.text}</Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0b0d" },
  safeArea: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  title: { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 12 },
  item: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255, 138, 0, 0.15)",
  },
  itemText: { color: "#fff", fontSize: 14 },
  sep: { height: 10 },
});