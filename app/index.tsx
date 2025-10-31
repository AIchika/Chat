import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Chatt</Text>
      <Text style={styles.subtitle}>Live Streaming Community</Text>
      
      <View style={styles.buttonsContainer}>
        <Link href="/live" style={styles.button}>
          <Text style={styles.buttonText}>Go Live</Text>
        </Link>
        
        <Link href="/discover" style={styles.button}>
          <Text style={styles.buttonText}>Discover Streams</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#6366f1',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
  },
  buttonsContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});