// Returns (or assigns) today's question for the authenticated user.
// The correct answer is never sent to the client here.
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "Unauthorized" }, 401);

  const today = new Date().toISOString().slice(0, 10);

  // Existing assignment for today?
  let { data: assignment } = await supabase
    .from("daily_assignments")
    .select("question_id, completed")
    .eq("user_id", user.id)
    .eq("assigned_date", today)
    .maybeSingle();

  if (!assignment) {
    const { data: profile } = await supabase
      .from("profiles").select("active_track").eq("id", user.id).single();

    const { data: answered } = await supabase
      .from("user_answers").select("question_id").eq("user_id", user.id);
    const answeredIds = (answered ?? []).map((a) => a.question_id);

    let q = supabase
      .from("questions").select("id")
      .eq("track", profile!.active_track)
      .eq("is_active", true)
      .limit(1);
    if (answeredIds.length) q = q.not("id", "in", `(${answeredIds.join(",")})`);

    const { data: picked } = await q.maybeSingle();
    if (!picked) return json({ question: null, completed: false });

    await supabase.from("daily_assignments").insert({
      user_id: user.id, question_id: picked.id, assigned_date: today,
    });
    assignment = { question_id: picked.id, completed: false };
  }

  const { data: question } = await supabase
    .from("questions")
    .select("id, body, image_url, type, answer_options(id, label, body, position)")
    .eq("id", assignment.question_id)
    .single();

  return json({ question, completed: assignment.completed });
});
