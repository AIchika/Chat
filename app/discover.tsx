import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Discover() {
  const streams = [
    { id: 1, title: 'Gaming Stream', viewers: 1200, user: 'GameMaster' },
    { id: 2, title: 'Music Session', viewers: 850, user: 'MusicPro' },
    { id: 3, title: 'Cooking Show', viewers: 650, user: 'ChefLife' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Popular Streams</Text>
      </View>

      {streams.map(stream => (
        <View key={stream.id} style={styles.streamCard}>
          <View style={styles.streamPreview}>
            <Ionicons name="play-circle" size={40} color="#6366f1" />
          </View>
          <View style={styles.streamInfo}>
            <Text style={styles.streamTitle}>{stream.title}</Text>
            <Text style={styles.streamUser}>{stream.user}</Text>
            <Text style={styles.streamViewers}>
              <Ionicons name="eye" size={16} /> {stream.viewers}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  streamCard: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  streamPreview: {
    width: 80,
    height: 80,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streamInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  streamTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  streamUser: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  streamViewers: {
    fontSize: 14,
    color: '#6366f1',
    marginTop: 4,
  },
});