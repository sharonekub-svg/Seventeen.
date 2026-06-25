import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, X, Flame } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { getDailyQuestion, submitAnswer, type DailyQuestion } from "@/lib/api";
import { starsFor } from "@/lib/scoring";
import { capture } from "@/lib/analytics";
import { colors, spacing, radius } from "@/lib/theme";

type Result = {
  isCorrect: boolean;
  correctOptionId: number | null;
  explanation: string;
  streak: number;
  xpGain: number;
};

export default function QuestionScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const params = useLocalSearchParams<{ mode: string; levelId?: string }>();
  const isLevel = params.mode === "level";

  const [queue, setQueue] = useState<DailyQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [correctInLevel, setCorrectInLevel] = useState(0);

  const current = queue[index];

  const load = useCallback(async () => {
    setLoading(true);
    if (isLevel && params.levelId) {
      const { data } = await supabase
        .from("questions")
        .select("id, body, image_url, type, answer_options(id, label, body, position)")
        .eq("level_id", Number(params.levelId))
        .eq("is_active", true)
        .order("position");
      setQueue((data as DailyQuestion[]) ?? []);
    } else {
      const { question } = await getDailyQuestion();
      setQueue(question ? [question] : []);
    }
    setLoading(false);
  }, [isLevel, params.levelId]);

  useEffect(() => {
    load();
  }, [load]);

  async function check() {
    if (selected == null || submitting) return;
    setSubmitting(true);
    try {
      const r = await submitAnswer(selected);
      setResult(r);
      if (r.isCorrect) setCorrectInLevel((c) => c + 1);
    } finally {
      setSubmitting(false);
    }
  }

  async function next() {
    if (index + 1 < queue.length) {
      setIndex(index + 1);
      setSelected(null);
      setResult(null);
      return;
    }
    // Level finished: record progress + unlock the next level.
    if (isLevel && params.levelId && session) {
      const total = queue.length;
      const stars = starsFor(correctInLevel, total);
      await supabase.from("user_level_progress").upsert(
        {
          user_id: session.user.id,
          level_id: Number(params.levelId),
          status: stars >= 1 ? "completed" : "unlocked",
          stars,
          correct_count: correctInLevel,
          completed_at: stars >= 1 ? new Date().toISOString() : null,
        },
        { onConflict: "user_id,level_id" },
      );
      if (stars >= 1) await unlockNext(Number(params.levelId), session.user.id);
      capture("level_completed", { level_id: Number(params.levelId), stars, correct: correctInLevel, total });
    }
    router.back();
  }

  async function unlockNext(levelId: number, userId: string) {
    const { data: cur } = await supabase
      .from("levels").select("unit_id, position").eq("id", levelId).single();
    if (!cur) return;
    const { data: nextLevel } = await supabase
      .from("levels").select("id")
      .eq("unit_id", cur.unit_id).eq("position", cur.position + 1).maybeSingle();
    if (nextLevel) {
      await supabase.from("user_level_progress").upsert(
        { user_id: userId, level_id: nextLevel.id, status: "unlocked" },
        { onConflict: "user_id,level_id" },
      );
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!current) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.empty}>אין שאלות זמינות כרגע.</Text>
        <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
          <Text style={styles.primaryBtnText}>חזרה</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((index + 1) / queue.length) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.counter}>
          שאלה {index + 1} מתוך {queue.length}
        </Text>
        <Text style={styles.body}>{current.body}</Text>

        <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
          {current.answer_options
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((opt) => {
              const isSelected = selected === opt.id;
              const showCorrect = result && result.correctOptionId === opt.id;
              const showWrong = result && isSelected && !result.isCorrect;
              return (
                <Pressable
                  key={opt.id}
                  disabled={!!result}
                  onPress={() => setSelected(opt.id)}
                  style={[
                    styles.option,
                    isSelected && !result && styles.optionSelected,
                    showCorrect && styles.optionCorrect,
                    showWrong && styles.optionWrong,
                  ]}
                >
                  <Text style={styles.optionLabel}>{opt.label}</Text>
                  <Text style={styles.optionBody}>{opt.body}</Text>
                  {showCorrect && <Check color={colors.success} size={18} />}
                  {showWrong && <X color={colors.danger} size={18} />}
                </Pressable>
              );
            })}
        </View>

        {result && (
          <View style={styles.explanation}>
            <View style={styles.resultHeader}>
              <Text style={[styles.resultText, { color: result.isCorrect ? colors.success : colors.danger }]}>
                {result.isCorrect ? "תשובה נכונה" : "תשובה שגויה"}
              </Text>
              {result.isCorrect && (
                <View style={styles.streakWrap}>
                  <Flame color={colors.streak} size={16} />
                  <Text style={styles.streakText}>{result.streak} · +{result.xpGain} XP</Text>
                </View>
              )}
            </View>
            <Text style={styles.explanationText}>{result.explanation}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {!result ? (
          <Pressable
            style={[styles.primaryBtn, (selected == null || submitting) && { opacity: 0.5 }]}
            onPress={check}
            disabled={selected == null || submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={styles.primaryBtnText}>בדיקה</Text>
            )}
          </Pressable>
        ) : (
          <Pressable style={styles.primaryBtn} onPress={next}>
            <Text style={styles.primaryBtnText}>
              {index + 1 < queue.length ? "השאלה הבאה" : "סיום"}
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", gap: spacing.md },
  empty: { color: colors.textMuted, fontSize: 16 },
  progressBar: { height: 6, backgroundColor: colors.surfaceAlt },
  progressFill: { height: 6, backgroundColor: colors.primary },
  counter: { color: colors.textMuted, fontSize: 13, textAlign: "right" },
  body: { color: colors.text, fontSize: 19, fontWeight: "600", textAlign: "right", marginTop: spacing.sm, lineHeight: 28 },
  option: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  optionSelected: { borderColor: colors.primary },
  optionCorrect: { borderColor: colors.success, backgroundColor: "#14271C" },
  optionWrong: { borderColor: colors.danger, backgroundColor: "#2A1718" },
  optionLabel: { color: colors.textMuted, fontWeight: "700", width: 22, textAlign: "center" },
  optionBody: { color: colors.text, fontSize: 16, flex: 1, textAlign: "right" },
  explanation: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  resultHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  resultText: { fontSize: 16, fontWeight: "700" },
  streakWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  streakText: { color: colors.text, fontWeight: "600", fontSize: 13 },
  explanationText: { color: colors.text, fontSize: 15, lineHeight: 24, textAlign: "right" },
  footer: { padding: spacing.md, borderTopColor: colors.border, borderTopWidth: 1 },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: "center" },
  primaryBtnText: { color: colors.primaryText, fontSize: 16, fontWeight: "700" },
});
