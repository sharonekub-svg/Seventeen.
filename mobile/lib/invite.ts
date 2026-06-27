// Inviting friends over WhatsApp. Builds a ready-to-send message and opens it
// in WhatsApp (falling back to the wa.me web link, which still routes into the
// app if installed).
import { Linking } from "react-native";

// Where the app can be downloaded. Update once a real App Store / TestFlight
// link exists.
export const APP_INVITE_URL = "https://aptitude.app";

export function inviteMessage(username?: string): string {
  const handle = username ? ` חפשו אותי באפליקציה: @${username}.` : "";
  return (
    "אני מתכונן/ת למבחני המיון והפסיכומטרי עם Aptitude — שאלה ביום, הסברים " +
    `מלאים ורצף יומי. בואו נתחרה!${handle} הורידו כאן: ${APP_INVITE_URL}`
  );
}

export async function openWhatsAppInvite(username?: string) {
  const text = encodeURIComponent(inviteMessage(username));
  const appUrl = `whatsapp://send?text=${text}`;
  const webUrl = `https://wa.me/?text=${text}`;
  try {
    const supported = await Linking.canOpenURL(appUrl);
    await Linking.openURL(supported ? appUrl : webUrl);
  } catch {
    await Linking.openURL(webUrl);
  }
}
