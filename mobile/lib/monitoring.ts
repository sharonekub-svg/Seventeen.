// Lightweight error monitoring. Routes caught errors to PostHog as structured
// `app_error` events (queryable in PostHog error tracking) and, when a Sentry
// DSN is configured via EXPO_PUBLIC_SENTRY_DSN, leaves a single seam to forward
// there too. Kept dependency-light so it works in the Expo managed workflow.
import { capture } from "./analytics";

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  const e = error instanceof Error ? error : new Error(String(error));
  capture("app_error", { message: e.message, stack: e.stack, ...context });
  if (__DEV__) console.error("[captureError]", e, context);
}
