import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import chattSocket from "@/lib/socket";
import { useAuth } from "./AuthProvider";

interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: Date;
}

export const [ChatProvider, useChat] = createContextHook(() => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const handleNewMessage = (data: { userId: string; message: string; timestamp: Date }) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        username: data.userId,
        text: data.message,
        timestamp: new Date(data.timestamp),
      };
      setMessages((prev) => [...prev, newMessage].slice(-100));
    };

    chattSocket.on('new-chat-message', handleNewMessage as any);
    return () => {
      chattSocket.off('new-chat-message', handleNewMessage as any);
    };
  }, []);

  const sendMessage = (streamId: string, text: string, userId?: string) => {
    const uid = userId || user?.id || 'You';
    chattSocket.sendChatMessage(streamId, uid, text);
    const newMessage: Message = {
      id: Date.now().toString(),
      username: uid,
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage].slice(-100));
  };

  return {
    messages,
    sendMessage,
  };
});