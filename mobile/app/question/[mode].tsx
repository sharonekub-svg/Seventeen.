import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { X, Check, Heart } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { getDailyQuestion, submitAnswer, type DailyQuestion } from "@/lib/api";
import { Mascot } from "@/components/Mascot";
import { Button3D } from "@/components/Button3D";
import { Confetti, SheetUp, useShake } from "@/components/anim";
import { colors, fonts, radius, spacing } from "@/lib/theme";

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
  const shake = useShake();

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
      else shake.trigger();
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
    if (isLevel && params.levelId && session) {
      const total = queue.length;
      const stars = correctInLevel === total ? 3 : correctInLevel >= total * 0.8 ? 2 : correctInLevel >= total * 0.5 ? 1 : 0;
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
    }
    router.back();
  }

  async function unlockNext(levelId: number, userId: string) {
    const { data: cur } = await supabase.from("levels").select("unit_id, position").eq("id", levelId).single();
    if (!cur) return;
    const { data: nextLevel } = await supabase
      .from("levels")
      .select("id")
      .eq("unit_id", cur.unit_id)
      .eq("position", cur.position + 1)
      .maybeSingle();
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
        <Mascot size={90} />
        <Text style={styles.empty}>אין שאלות זמינות כרגע.</Text>
        <Button3D title="חזרה" onPress={() => router.back()} style={{ width: 200 }} />
      </SafeAreaView>
    );
  }

  const options = current.answer_options.slice().sort((a, b) => a.position - b.position);
  const progress = Math.round(((index + (result ? 1 : 0)) / Math.max(1, queue.length)) * 100);

  return (
    <SafeAreaView style={styles.safe}>
      {/* header: close · progress · hearts */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <X color={colors.textFaint} size={26} strokeWidth={3} />
        </Pressable>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.hearts}>
          <Heart color={colors.heart} fill={colors.heart} size={17} />
          <Text style={styles.heartsText}>5</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 8 }}>
        <Text style={styles.prompt}>בחרו את התשובה הנכונה</Text>

        <Animated.View style={shake.style}>
          <View style={styles.qCard}>
            <Mascot size={58} bob={false} />
            <Text style={styles.qBody}>{current.body}</Text>
          </View>
        </Animated.View>

        <View style={{ gap: 12, marginTop: 22 }}>
          {options.map((opt) => {
            const isSel = selected === opt.id;
            const showCorrect = result && result.correctOptionId === opt.id;
            const showWrong = result && isSel && !result.isCorrect;

            let bg = "#fff", border = colors.borderInput, step = "#e3e8e4", txt = colors.textMid;
            if (!result && isSel) {
              bg = "#e7f6ef"; border = colors.primary; step = "#9fdcc0"; txt = colors.primary;
            } else if (showCorrect) {
              bg = "#d7f5e4"; border = colors.done; step = colors.doneDark; txt = "#157a52";
            } else if (showWrong) {
              bg = "#ffe3e3"; border = "#ff6a72"; step = "#e05a5a"; txt = "#cc3b3b";
            }

            return (
              <Pressable key={opt.id} disabled={!!result} onPress={() => setSelected(opt.id)}>
                <View style={{ backgroundColor: step, borderRadius: radius.md, paddingBottom: 4 }}>
                  <View style={[styles.option, { backgroundColor: bg, borderColor: border }]}>
                    <Text style={[styles.optLabel, { color: txt }]}>{opt.label}</Text>
                    <Text style={[styles.optBody, { color: txt }]}>{opt.body}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {!result ? (
        <View style={styles.footer}>
          <Button3D title="בדיקה" onPress={check} loading={submitting} disabled={selected == null} />
        </View>
      ) : null}

      {/* confetti on correct */}
      {result?.isCorrect ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Confetti />
        </View>
      ) : null}

      {/* explanation sheet */}
      {result ? (
        <View style={styles.sheetWrap} pointerEvents="box-none">
          <SheetUp style={[styles.sheet, { backgroundColor: result.isCorrect ? "#eafaf1" : "#fdecec" }]}>
            <View style={styles.sheetHead}>
              <View style={[styles.sheetIcon, { backgroundColor: result.isCorrect ? colors.done : colors.danger }]}>
                {result.isCorrect ? <Check color="#fff" size={24} strokeWidth={3} /> : <X color="#fff" size={24} strokeWidth={3} />}
              </View>
              <Text style={[styles.sheetTitle, { color: result.isCorrect ? colors.primary : colors.dangerDark }]}>
                {result.isCorrect ? `מצוין! +${result.xpGain} XP` : "לא בדיוק..."}
              </Text>
            </View>
            <Text style={styles.sheetExpl}>{result.explanation}</Text>
            <Button3D
              title={index + 1 < queue.length ? "המשך" : "סיום"}
              tone={result.isCorrect ? "primary" : "danger"}
              onPress={next}
            />
          </SheetUp>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", gap: spacing.md },
  empty: { color: colors.textMuted, fontFamily: fonts.bold, fontSize: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 13, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 12 },
  progressTrack: { flex: 1, height: 14, backgroundColor: "#e6ece8", borderRadius: 8, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.done, borderRadius: 8 },
  hearts: { flexDirection: "row", alignItems: "center", gap: 4 },
  heartsText: { fontFamily: fonts.display, fontSize: 16, color: colors.heart },
  prompt: { fontFamily: fonts.display, fontSize: 21, color: colors.text, marginBottom: 18, textAlign: "right" },
  qCard: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 26,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 16,
    shadowColor: colors.borderShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  qBody: { flex: 1, fontFamily: fonts.bold, fontSize: 22, color: "#2c3530", textAlign: "right", lineHeight: 30 },
  option: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 2,
    borderRadius: radius.md,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optLabel: { fontFamily: fonts.extrabold, fontSize: 15, width: 22, textAlign: "center" },
  optBody: { flex: 1, fontFamily: fonts.bold, fontSize: 18, textAlign: "right" },
  footer: { padding: spacing.md, paddingBottom: 24 },
  sheetWrap: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end", zIndex: 70 },
  sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 22, paddingBottom: 28 },
  sheetHead: { flexDirection: "row-reverse", alignItems: "center", gap: 12, marginBottom: 12 },
  sheetIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  sheetTitle: { fontFamily: fonts.display, fontSize: 22 },
  sheetExpl: { fontFamily: fonts.medium, fontSize: 14, color: colors.textMid, lineHeight: 22, marginBottom: 16, textAlign: "right" },
});
