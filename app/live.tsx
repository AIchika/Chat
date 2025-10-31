import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Live() {
  return (
    <View style={styles.container}>
      <View style={styles.preview}>
        <Ionicons name="videocam" size={48} color="#6366f1" />
        <Text style={styles.previewText}>Preview</Text>
      </View>
      
      <View style={styles.controls}>
        <View style={styles.button}>
          <Ionicons name="mic" size={24} color="#fff" />
        </View>
        <View style={[styles.button, styles.primaryButton]}>
          <Ionicons name="radio" size={24} color="#fff" />
        </View>
        <View style={styles.button}>
          <Ionicons name="camera-reverse" size={24} color="#fff" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  preview: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4b5563',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
});