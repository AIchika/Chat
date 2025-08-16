import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  displayName?: string;
  bio?: string;
  verified?: boolean;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const mockUser: User = {
      id: "1",
      username: email.split("@")[0],
      email,
      avatar: `https://i.pravatar.cc/150?u=${email}`,
      displayName: email.split("@")[0],
      bio: 'Streaming games, art, and good vibes ✨',
      verified: true,
    };
    setUser(mockUser);
    await AsyncStorage.setItem("user", JSON.stringify(mockUser));
  };

  const signup = async (username: string, email: string, password: string) => {
    const mockUser: User = {
      id: Date.now().toString(),
      username,
      email,
      avatar: `https://i.pravatar.cc/150?u=${email}`,
      displayName: username,
      bio: 'Hi! I am new here',
      verified: true,
    };
    setUser(mockUser);
    await AsyncStorage.setItem("user", JSON.stringify(mockUser));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("user");
  };

  const updateProfile = async (partial: Partial<User>) => {
    setUser((prev) => {
      const next = { ...(prev as User), ...partial } as User;
      void AsyncStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  };

  return {
    user,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
  };
});