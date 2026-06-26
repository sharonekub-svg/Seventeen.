import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { supabase } from "./supabase";

// Expo Go (SDK 53+) removed support for remote push notifications, so calling
// getExpoPushTokenAsync there errors out. Detect Expo Go and skip push setup.
const isExpoGo = Constants.executionEnvironment === "storeClient";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Requests permission, fetches the Expo push token, and stores it in
// profiles_private. Safe to call on app start / after login.
export async function registerForPush(userId: string): Promise<void> {
  // Remote push isn't available in Expo Go — no-op so the app stays usable.
  if (isExpoGo) return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let status = existing;
  if (existing !== "granted") {
    status = (await Notifications.requestPermissionsAsync()).status;
  }
  if (status !== "granted") return;

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  await supabase
    .from("profiles_private")
    .upsert({ id: userId, push_token: token, updated_at: new Date().toISOString() });
}
