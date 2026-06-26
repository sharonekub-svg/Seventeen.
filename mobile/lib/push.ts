import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { supabase } from "./supabase";

const isExpoGo = Constants.executionEnvironment === "storeClient";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // SDK 53+ replaced `shouldShowAlert` with the more granular
    // `shouldShowBanner` / `shouldShowList`.
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Requests permission, fetches the Expo push token, and stores it in
// profiles_private. Safe to call on app start / after login.
export async function registerForPush(userId: string): Promise<void> {
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
