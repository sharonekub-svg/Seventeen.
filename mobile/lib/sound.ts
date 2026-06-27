// Answer feedback: a short sound + a haptic tap for right / wrong answers.
// Everything here is best-effort — audio or haptics failing must never block
// the quiz flow, so all calls are guarded and fire-and-forget.
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";

let correct: Audio.Sound | null = null;
let wrong: Audio.Sound | null = null;
let loading: Promise<void> | null = null;

// Load both clips once. Plays even when the iOS ringer is on silent, since
// this is intentional UI feedback the user just triggered.
function ensureLoaded(): Promise<void> {
  if (loading) return loading;
  loading = (async () => {
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const c = await Audio.Sound.createAsync(
        require("../assets/sounds/correct.wav"),
      );
      const w = await Audio.Sound.createAsync(
        require("../assets/sounds/wrong.wav"),
      );
      correct = c.sound;
      wrong = w.sound;
    } catch {
      // leave sounds null; playback becomes a no-op
    }
  })();
  return loading;
}

async function play(sound: Audio.Sound | null) {
  try {
    await sound?.replayAsync();
  } catch {
    // ignore — feedback is non-critical
  }
}

export async function playCorrect() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
    () => {},
  );
  await ensureLoaded();
  play(correct);
}

export async function playWrong() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
    () => {},
  );
  await ensureLoaded();
  play(wrong);
}

export async function unloadSounds() {
  await correct?.unloadAsync().catch(() => {});
  await wrong?.unloadAsync().catch(() => {});
  correct = null;
  wrong = null;
  loading = null;
}
