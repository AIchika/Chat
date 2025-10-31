import React, { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Text, FlatList, TextInput, PanResponder, Dimensions } from 'react-native';
import GlassPanel from '../components/GlassPanel';
import GlassButton from '../components/GlassButton';
import ChatBubble from '../components/ChatBubble';
import { colors } from '../styles/colors';
import { typography } from '../styles/global';

const mockMessages = Array.from({ length: 16 }).map((_, i) => ({
  id: `m-${i}`,
  username: i % 3 === 0 ? 'Aurora' : i % 3 === 1 ? 'Nova' : 'Orion',
  avatarUrl: 'https://placekitten.com/80/80',
  message: i % 5 === 0 ? 'Thanks for the stream! Donated 5$' : 'This looks so good! 🔥',
  highlighted: i % 5 === 0,
}));

export default function ChatScreen() {
  const [viewerListOpen, setViewerListOpen] = useState(false);
  const [floatingMode, setFloatingMode] = useState(false);
  const [text, setText] = useState('');
  const width = Dimensions.get('window').width;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 20,
      onPanResponderRelease: (_, g) => {
        if (g.dx < -40) setViewerListOpen(true); // swipe left
        if (g.dx > 40) setFloatingMode(true); // swipe right
      },
    })
  ).current;

  const data = useMemo(() => mockMessages, []);

  return (
    <View style={styles.screen} {...panResponder.panHandlers}>
      <GlassPanel style={styles.fullGlass} intensity={40}>
        <Text style={[typography.heading, styles.title]}>Chat</Text>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={{ paddingBottom: 90 }}
          renderItem={({ item }) => (
            <ChatBubble
              avatarUrl={item.avatarUrl}
              username={item.username}
              message={item.message}
              highlighted={item.highlighted}
            />
          )}
        />
      </GlassPanel>

      {/* Viewer list overlay */}
      {viewerListOpen && (
        <GlassPanel style={[styles.viewerOverlay, { width: width * 0.5 }]}> 
          <Text style={[typography.subheading]}>Viewer List</Text>
          <Text style={[typography.body, { marginTop: 8 }]}>Coming soon.</Text>
          <GlassButton label="Close" onPress={() => setViewerListOpen(false)} style={{ marginTop: 12 }} />
        </GlassPanel>
      )}

      {/* Bottom input bar */}
      <View style={styles.inputBarWrap}>
        <GlassPanel style={styles.inputBar}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message"
            placeholderTextColor="rgba(245,245,245,0.7)"
            style={styles.input}
          />
          <GlassButton label="Send" active onPress={() => setText('')} style={styles.sendBtn} />
        </GlassPanel>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.baseBlack,
  },
  fullGlass: {
    flex: 1,
    margin: 16,
  },
  title: {
    marginBottom: 8,
  },
  list: {
    flex: 1,
  },
  inputBarWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    color: colors.pureWhite,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  sendBtn: {
    marginLeft: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  viewerOverlay: {
    position: 'absolute',
    top: 100,
    right: 0,
    height: 300,
    marginRight: 12,
    padding: 12,
  },
});