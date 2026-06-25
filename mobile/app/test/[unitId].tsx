import { useCallback, useEffect, useRef, useState } from "react";
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
import { Timer, Star, Trophy } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { submitAnswer, type DailyQuestion } from "@/lib/api";
import { starsFor } from "@/lib/scoring";
import { capture } from "@/lib/analytics";
import { captureError } from "@/lib/monitoring";
import { colors, spacing, radius } from "@/lib/theme";

// End-of-subject timed test: a fixed pool of questions drawn from across the
// whole unit, answered against a countdown. No per-question feedback — the user
// gets a single score at the end, like a real exam section.
export default function SectionTestScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const params = useLocalSearchParams<{
    unitId: string;
    levelId?: string;
    timeLimit?: string;
    unitName?: string;
  }>();

  const limitSeconds = Number(params.timeLimit) || 600;

  const [queue, setQueue] = useState<DailyQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(limitSeconds);
  const [finished, setFinished] = useState(false);

  const finishedRef = useRef(false);
  const current = queue[index];

  const finish = useCallback(
    async (finalCorrect: number, finalAnswered: number) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      setFinished(true);
      const total = queue.length || 1;
      const stars = starsFor(finalCorrect, total);
      capture("section_test_completed", {
        unit_id: Number(params.unitId),
        correct: finalCorrect,
        total,
        answered: finalAnswered,
        stars,
      });
      if (params.levelId && session) {
        try {
          await supabase.from("user_level_progress").upsert(
            {
              user_id: session.user.id,
              level_id: Number(params.levelId),
              status: stars >= 1 ? "completed" : "unlocked",
              stars,
              correct_count: finalCorrect,
              completed_at: stars >= 1 ? new Date().toISOString() : null,
            },
            { onConflict: "user_id,level_id" },
          );
        } catch (e) {
          captureError(e, { where: "section_test.finish" });
        }
      }
    },
    [queue.length, params.unitId, params.levelId, session],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("section_test", {
        p_unit: Number(params.unitId),
        p_limit: 12,
      });
      if (error) throw error;
      setQueue((data as DailyQuestion[]) ?? []);
    } catch (e) {
      captureError(e, { where: "section_test.load", unitId: params.unitId });
      setQueue([]);
    }
    setLoading(false);
  }, [params.unitId]);

  useEffect(() => {
    load();
  }, [load]);

  // Countdown — auto-submits when it hits zero.
  useEffect(() => {
    if (loading || finished || queue.length === 0) return;
    if (secondsLeft <= 0) {
      finish(correct, answered);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, loading, finished, queue.length, correct, answered, finish]);

  async function submitCurrent() {
    if (selected == null || submitting || !current) return;
    setSubmitting(true);
    try {
      const r = await submitAnswer(selected);
      const nextCorrect = correct + (r.isCorrect ? 1 : 0);
      const nextAnswered = answered + 1;
      setCorrect(nextCorrect);
      setAnswered(nextAnswered);
      setSelected(null);
      if (index + 1 < queue.length) {
        setIndex(index + 1);
      } else {
        await finish(nextCorrect, nextAnswered);
      }
    } catch (e) {
      captureError(e, { where: "section_test.submit" });
    } finally {
      setSubmitting(false);
    }
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const low = secondsLeft <= 30;

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (finished) {
    const total = queue.length || 1;
    const stars = starsFor(correct, total);
    const passed = stars >= 1;
    return (
      <SafeAreaView style={styles.center}>
        <Trophy color={passed ? colors.streak : colors.textMuted} size={56} />
        <Text style={styles.summaryTitle}>{passed ? "כל הכבוד!" : "כמעט שם"}</Text>
        <Text style={styles.summaryScore}>
          {correct}/{total} נכונות
        </Text>
        <View style={styles.starRow}>
          {[0, 1, 2].map((i) => (
            <Star
              key={i}
              size={28}
              color={colors.streak}
              fill={i < stars ? colors.streak : "transparent"}
            />
          ))}
        </View>
        <Text style={styles.summarySub}>
          {passed ? "סיימת את המבחן המסכם של הנושא." : "עברו 50% מהשאלות כדי לסיים את הנושא."}
        </Text>
        <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
          <Text style={styles.primaryBtnText}>חזרה למסלול</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!current) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.empty}>אין מספיק שאלות לנושא הזה עדיין.</Text>
        <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
          <Text style={styles.primaryBtnText}>חזרה</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={[styles.timer, low && styles.timerLow]}>
          <Timer color={low ? colors.danger : colors.text} size={16} />
          <Text style={[styles.timerText, low && { color: colors.danger }]}>
            {mm}:{ss}
          </Text>
        </View>
        <Text style={styles.counter}>
          שאלה {index + 1} מתוך {queue.length}
        </Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((index + 1) / queue.length) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.body}>{current.body}</Text>
        <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
          {current.answer_options
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((opt) => {
              const isSelected = selected === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => setSelected(opt.id)}
                  style={[styles.option, isSelected && styles.optionSelected]}
                >
                  <Text style={styles.optionLabel}>{opt.label}</Text>
                  <Text style={styles.optionBody}>{opt.body}</Text>
                </Pressable>
              );
            })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.primaryBtn, (selected == null || submitting) && { opacity: 0.5 }]}
          onPress={submitCurrent}
          disabled={selected == null || submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <Text style={styles.primaryBtnText}>
              {index + 1 < queue.length ? "השאלה הבאה" : "סיום המבחן"}
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.lg },
  empty: { color: colors.textMuted, fontSize: 16 },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  timer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  timerLow: { backgroundColor: "#2A1718" },
  timerText: { color: colors.text, fontWeight: "700", fontVariant: ["tabular-nums"] },
  counter: { color: colors.textMuted, fontSize: 13 },
  progressBar: { height: 6, backgroundColor: colors.surfaceAlt },
  progressFill: { height: 6, backgroundColor: colors.primary },
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
  optionLabel: { color: colors.textMuted, fontWeight: "700", width: 22, textAlign: "center" },
  optionBody: { color: colors.text, fontSize: 16, flex: 1, textAlign: "right" },
  footer: { padding: spacing.md, borderTopColor: colors.border, borderTopWidth: 1 },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: "center", marginTop: spacing.sm },
  primaryBtnText: { color: colors.primaryText, fontSize: 16, fontWeight: "700" },
  summaryTitle: { color: colors.text, fontSize: 24, fontWeight: "800" },
  summaryScore: { color: colors.text, fontSize: 18, fontWeight: "600" },
  summarySub: { color: colors.textMuted, fontSize: 14, textAlign: "center", paddingHorizontal: spacing.lg },
  starRow: { flexDirection: "row", gap: spacing.xs },
});
