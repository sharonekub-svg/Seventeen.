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
