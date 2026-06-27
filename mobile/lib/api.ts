import { supabase } from "./supabase";

async function authedHeaders() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

const FUNCTIONS_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1`;

export type AnswerOption = {
  id: number;
  label: string;
  body: string;
  position: number;
};

export type DailyQuestion = {
  id: number;
  body: string;
  image_url: string | null;
  type: string;
  answer_options: AnswerOption[];
};

// Loads an ordered (easy->hard) question set produced by a SQL function that
// returns `{ id, body, image_url, type, difficulty, slot }` rows. Options are
// fetched separately so the correct answer is never pulled to the client.
async function loadOrderedQuestions(
  rpc: "level_questions" | "exam_questions",
  levelId: number,
): Promise<DailyQuestion[]> {
  const { data: rows, error } = await supabase.rpc(rpc, { p_level_id: levelId });
  if (error) throw error;
  const ordered = (rows ?? []) as Array<{
    id: number;
    body: string;
    image_url: string | null;
    type: string;
    difficulty: number;
    slot: number;
  }>;
  if (ordered.length === 0) return [];

  const ids = ordered.map((r) => r.id);
  const { data: opts } = await supabase
    .from("answer_options")
    .select("question_id, id, label, body, position")
    .in("question_id", ids);

  const byQuestion = new Map<number, AnswerOption[]>();
  for (const o of opts ?? []) {
    const list = byQuestion.get(o.question_id) ?? [];
    list.push({ id: o.id, label: o.label, body: o.body, position: o.position });
    byQuestion.set(o.question_id, list);
  }

  return ordered
    .slice()
    .sort((a, b) => a.slot - b.slot)
    .map((r) => ({
      id: r.id,
      body: r.body,
      image_url: r.image_url,
      type: r.type,
      answer_options: byQuestion.get(r.id) ?? [],
    }));
}

// A practice level's graduated set (2 easy -> 3 medium -> 5 hard).
export function getLevelQuestions(levelId: number): Promise<DailyQuestion[]> {
  return loadOrderedQuestions("level_questions", levelId);
}

// A unit's summary exam: a full, timed test over the whole subject
// (4 easy -> 6 medium -> 10 hard), ordered easy->hard.
export function getExamQuestions(levelId: number): Promise<DailyQuestion[]> {
  return loadOrderedQuestions("exam_questions", levelId);
}

export async function getDailyQuestion(): Promise<{
  question: DailyQuestion | null;
  completed: boolean;
}> {
  const res = await fetch(`${FUNCTIONS_URL}/daily-question`, {
    method: "POST",
    headers: await authedHeaders(),
  });
  if (!res.ok) throw new Error(`daily-question failed: ${res.status}`);
  return res.json();
}

export async function submitAnswer(selectedOptionId: number): Promise<{
  isCorrect: boolean;
  correctOptionId: number | null;
  explanation: string;
  streak: number;
  xpGain: number;
}> {
  const res = await fetch(`${FUNCTIONS_URL}/submit-answer`, {
    method: "POST",
    headers: await authedHeaders(),
    body: JSON.stringify({ selectedOptionId }),
  });
  if (!res.ok) throw new Error(`submit-answer failed: ${res.status}`);
  return res.json();
}
