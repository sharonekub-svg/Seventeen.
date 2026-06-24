import { Tabs } from "expo-router";
import { View } from "react-native";
import { Route, BarChart3, Users, User, type LucideIcon } from "lucide-react-native";
import { colors, fonts } from "@/lib/theme";

function TabIcon({ Icon, focused }: { Icon: LucideIcon; focused: boolean }) {
  return (
    <View
      style={{
        width: 52,
        height: 38,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: focused ? colors.primary : "transparent",
        shadowColor: colors.primaryDark,
        shadowOffset: { width: 0, height: focused ? 4 : 0 },
        shadowOpacity: focused ? 1 : 0,
        shadowRadius: 0,
        elevation: focused ? 3 : 0,
      }}
    >
      <Icon color={focused ? "#fff" : colors.textFaint} size={24} strokeWidth={2.4} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: colors.border,
          borderTopWidth: 2,
          height: 70,
          paddingTop: 8,
          paddingBottom: 12,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSoft,
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "מסלול", tabBarIcon: ({ focused }) => <TabIcon Icon={Route} focused={focused} /> }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{ title: "טבלה", tabBarIcon: ({ focused }) => <TabIcon Icon={BarChart3} focused={focused} /> }}
      />
      <Tabs.Screen
        name="friends"
        options={{ title: "חברים", tabBarIcon: ({ focused }) => <TabIcon Icon={Users} focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "פרופיל", tabBarIcon: ({ focused }) => <TabIcon Icon={User} focused={focused} /> }}
      />
    </Tabs>
  );
}
