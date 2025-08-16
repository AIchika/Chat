import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";

interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: Date;
}

export const [ChatProvider, useChat] = createContextHook(() => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Simulate incoming messages
    const mockMessages: Message[] = [
      {
        id: "1",
        username: "User123",
        text: "Hey everyone! 👋",
        timestamp: new Date(),
      },
      {
        id: "2",
        username: "StreamFan",
        text: "This stream is awesome!",
        timestamp: new Date(),
      },
      {
        id: "3",
        username: "Viewer456",
        text: "First time here, loving the content",
        timestamp: new Date(),
      },
    ];
    setMessages(mockMessages);

    // Simulate random incoming messages
    const interval = setInterval(() => {
      const randomMessages = [
        "Great stream!",
        "Hello from Brazil 🇧🇷",
        "Can you play my favorite song?",
        "Love the energy!",
        "Keep it up!",
        "🔥🔥🔥",
        "Amazing content",
        "Following now!",
      ];
      
      const randomUsername = `User${Math.floor(Math.random() * 1000)}`;
      const randomText = randomMessages[Math.floor(Math.random() * randomMessages.length)];
      
      const newMessage: Message = {
        id: Date.now().toString(),
        username: randomUsername,
        text: randomText,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, newMessage].slice(-50)); // Keep last 50 messages
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const sendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      username: "You",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  return {
    messages,
    sendMessage,
  };
});