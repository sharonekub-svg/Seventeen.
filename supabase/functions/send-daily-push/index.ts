// Sends a daily reminder to keep the streak. Triggered nightly by pg_cron.
// Protected by a shared secret header so it can't be invoked publicly. The
// expected secret is read from public.app_config (seeded by migration 0004 and
// also used by the cron job, so the two never drift), with a fallback to the
// CRON_SECRET env var for deployments that prefer Supabase function secrets.
import { createClient } from "jsr:@supabase/supabase-js@2";
import { json } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: cfg } = await admin
    .from("app_config").select("value").eq("key", "cron_secret").maybeSingle();
  const expected = cfg?.value ?? Deno.env.get("CRON_SECRET");

  const secret = req.headers.get("x-cron-secret");
  if (!expected || secret !== expected) {
    return json({ error: "Forbidden" }, 403);
  }

  const { data: rows } = await admin
    .from("profiles_private")
    .select("push_token")
    .not("push_token", "is", null);

  const messages = (rows ?? []).map((r) => ({
    to: r.push_token,
    title: "השאלה היומית מחכה",
    body: "דקה ביום שומרת על הרצף.",
    sound: "default",
  }));

  // Expo accepts up to 100 messages per request.
  for (let i = 0; i < messages.length; i += 100) {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messages.slice(i, i + 100)),
    });
  }

  return json({ sent: messages.length });
});
