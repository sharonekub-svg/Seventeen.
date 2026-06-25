// PostHog analytics. Initialised from EXPO_PUBLIC_POSTHOG_KEY so the app still
// runs (as a no-op) when analytics isn't configured. The project key is a
// publishable client key — safe to ship in the bundle.
import PostHog from "posthog-react-native";

let client: PostHog | null = null;

export function initAnalytics(): void {
  if (client) return;
  const key = process.env.EXPO_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  client = new PostHog(key, {
    host: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
  });
}

// Callers pass plain objects; PostHog only accepts JSON-serialisable values, so
// we cast at this single boundary rather than threading the SDK's type outward.
type Props = Record<string, unknown>;

export function capture(event: string, properties?: Props): void {
  client?.capture(event, properties as Record<string, never>);
}

export function identify(distinctId: string, properties?: Props): void {
  client?.identify(distinctId, properties as Record<string, never>);
}

export function resetAnalytics(): void {
  client?.reset();
}
