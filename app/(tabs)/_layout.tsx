import React from "react";
import { Tabs } from "expo-router";
import { Home as HomeIcon, Grid2X2, CirclePlus, Bell, User } from "lucide-react-native";
import { View } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#FF8A00",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#0b0b0d",
          borderTopColor: "rgba(255,138,0,0.12)",
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "700" },
      }}
    >
      {/* Left: Home */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <HomeIcon color={color as string} size={(size as number) ?? 20} />
          ),
        }}
      />
      {/* Left-middle: Activity */}
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ color, size }) => (
            <Bell color={color as string} size={(size as number) ?? 20} />
          ),
        }}
      />
      {/* Center: Live (Plus button) */}
      <Tabs.Screen
        name="live"
        options={{
          title: "",
          tabBarLabel: "",
          tabBarIcon: ({ size }) => (
            <View
              style={{
                backgroundColor: "#FF8A00",
                padding: 10,
                borderRadius: 24,
                marginTop: -10,
              }}
              testID="tab-plus"
            >
              <CirclePlus color="#0b0b0d" size={((size as number) ?? 20) + 4} />
            </View>
          ),
        }}
      />
      {/* Right-middle: Discover */}
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, size }) => (
            <Grid2X2 color={color as string} size={(size as number) ?? 20} />
          ),
        }}
      />
      {/* Right: Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <User color={color as string} size={(size as number) ?? 20} />
          ),
        }}
      />
    </Tabs>
  );
}
