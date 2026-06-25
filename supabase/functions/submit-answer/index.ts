// Checks an answer server-side, updates adaptive ability (Elo), XP, streak,
// and returns correctness + explanation. Uses the service role internally so
// the correct answer never has to be exposed to the client.
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";
import { eloUpdate, nextStreak, xpFor } from "../_shared/scoring.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Unauthorized" }, 401);

  // user-scoped client to identify the caller
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return json({ error: "Unauthorized" }, 401);

  const { selectedOptionId } = await req.json().catch(() => ({}));
  if (!selectedOptionId) return json({ error: "selectedOptionId required" }, 400);

  // admin client for trusted reads/writes
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: option } = await admin
    .from("answer_options")
    .select("is_correct, question_id, questions(elo, level_id, levels(unit_id))")
    .eq("id", selectedOptionId)
    .single();
  if (!option) return json({ error: "Option not found" }, 404);

  const isCorrect = option.is_correct;
  const questionId = option.question_id;
  // deno-lint-ignore no-explicit-any
  const q: any = option.questions;
  const questionElo: number = q?.elo ?? 1000;
  const unitId: number | null = q?.levels?.unit_id ?? null;

  // Record the answer (unique constraint enforces the "solve once" lock).
  const { error: insertErr } = await admin.from("user_answers").insert({
    user_id: user.id,
    question_id: questionId,
    selected_option_id: selectedOptionId,
    is_correct: isCorrect,
  });
  if (insertErr && insertErr.code !== "23505") {
    return json({ error: insertErr.message }, 400);
  }

  // ----- Adaptive Elo update (skip if already answered) -----
  if (!insertErr && unitId) {
    const { data: ab } = await admin
      .from("user_ability")
      .select("ability, questions_seen")
      .eq("user_id", user.id).eq("unit_id", unitId).maybeSingle();
    const ability = ab?.ability ?? 1000;
    const seen = ab?.questions_seen ?? 0;

    const { newAbility, newElo } = eloUpdate(ability, questionElo, isCorrect);

    await admin.from("user_ability").upsert({
      user_id: user.id, unit_id: unitId,
      ability: newAbility, questions_seen: seen + 1,
    });
    await admin.from("questions").update({ elo: newElo }).eq("id", questionId);
  }

  // ----- XP + streak -----
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  const { data: p } = await admin
    .from("profiles")
    .select("current_streak, longest_streak, last_active_date, total_xp, total_answered, total_correct")
    .eq("id", user.id).single();

  const streak = nextStreak(p!.current_streak, p!.last_active_date, today, yesterday);
  const xpGain = xpFor(isCorrect);

  await admin.from("profiles").update({
    current_streak: streak,
    longest_streak: Math.max(streak, p!.longest_streak),
    last_active_date: today,
    total_xp: p!.total_xp + xpGain,
    total_answered: p!.total_answered + (insertErr ? 0 : 1),
    total_correct: p!.total_correct + (!insertErr && isCorrect ? 1 : 0),
  }).eq("id", user.id);

  await admin.from("daily_assignments")
    .update({ completed: true })
    .eq("user_id", user.id).eq("assigned_date", today)
    .eq("question_id", questionId);

  const { data: question } = await admin
    .from("questions").select("explanation").eq("id", questionId).single();
  const { data: correctOpt } = await admin
    .from("answer_options").select("id")
    .eq("question_id", questionId).eq("is_correct", true).single();

  return json({
    isCorrect,
    correctOptionId: correctOpt?.id ?? null,
    explanation: question?.explanation ?? "",
    streak,
    xpGain,
  });
});
