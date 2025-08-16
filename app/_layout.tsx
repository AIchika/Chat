import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/providers/AuthProvider";
import { StreamProvider } from "@/providers/StreamProvider";
import { ChatProvider } from "@/providers/ChatProvider";
import { SettingsProvider } from "@/providers/SettingsProvider";
import AppErrorBoundary from "@/components/ErrorBoundary";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen
        name="settings"
        options={{ headerShown: true, headerTintColor: '#fff', headerStyle: { backgroundColor: '#0b0b0d' }, presentation: "modal", title: 'Settings' }}
      />
      <Stack.Screen
        name="stream/[streamId]"
        options={{ headerShown: false, presentation: "fullScreenModal" }}
      />
      <Stack.Screen
        name="go-live"
        options={{ headerShown: false, presentation: "modal" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SettingsProvider>
        <AuthProvider>
          <StreamProvider>
            <ChatProvider>
              <AppErrorBoundary>
                <RootLayoutNav />
              </AppErrorBoundary>
            </ChatProvider>
          </StreamProvider>
        </AuthProvider>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}