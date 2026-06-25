import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Flame, Star, Lock, Check, Trophy } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { unitIcon } from "@/lib/icons";
import { colors, spacing, radius } from "@/lib/theme";

type Level = {
  id: number;
  position: number;
  title: string | null;
  kind: "practice" | "section_test";
  time_limit_seconds: number | null;
};
type Unit = {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  position: number;
  levels: Level[];
};
type Progress = { level_id: number; status: string; stars: number };

export default function PathScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [units, setUnits] = useState<Unit[]>([]);
  const [progress, setProgress] = useState<Record<number, Progress>>({});
  const [streak, setStreak] = useState(0);
  const [track, setTrack] = useState<string>("psychometric");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("active_track, current_streak")
      .eq("id", session.user.id)
      .single();
    const activeTrack = profile?.active_track ?? "psychometric";
    setTrack(activeTrack);
    setStreak(profile?.current_streak ?? 0);

    const { data: u } = await supabase
      .from("units")
      .select("id, name, description, icon, position, levels(id, position, title, kind, time_limit_seconds)")
      .eq("track", activeTrack)
      .order("position")
      .order("position", { foreignTable: "levels" });
    setUnits((u as Unit[]) ?? []);

    const { data: prog } = await supabase
      .from("user_level_progress")
      .select("level_id, status, stars")
      .eq("user_id", session.user.id);
    const map: Record<number, Progress> = {};
    (prog ?? []).forEach((p) => (map[p.level_id] = p as Progress));
    setProgress(map);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function levelState(unit: Unit, level: Level): "completed" | "unlocked" | "locked" {
    const p = progress[level.id];
    if (p?.status === "completed") return "completed";
    if (p?.status === "unlocked") return "unlocked";
    // The end-of-subject test unlocks only once every practice level is done.
    if (level.kind === "section_test") {
      const practice = unit.levels.filter((l) => l.kind !== "section_test");
      const allDone = practice.length > 0 && practice.every((l) => progress[l.id]?.status === "completed");
      return allDone ? "unlocked" : "locked";
    }
    // First level of each unit is open by default.
    if (level.position === 1) return "unlocked";
    return "locked";
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>המסלול שלי</Text>
        <View style={styles.streakBadge}>
          <Flame color={colors.streak} size={18} />
          <Text style={styles.streakText}>{streak}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />
        }
      >
        {units.map((unit) => {
          const Icon = unitIcon(unit.icon);
          return (
            <View key={unit.id} style={styles.unitCard}>
              <View style={styles.unitHeader}>
                <View style={styles.unitIcon}>
                  <Icon color={colors.primary} size={22} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.unitName}>{unit.name}</Text>
                  {unit.description && (
                    <Text style={styles.unitDesc}>{unit.description}</Text>
                  )}
                </View>
              </View>

              <View style={styles.levelRow}>
                {unit.levels.map((level) => {
                  const state = levelState(unit, level);
                  const locked = state === "locked";
                  const completed = state === "completed";
                  const stars = progress[level.id]?.stars ?? 0;
                  const isTest = level.kind === "section_test";
                  return (
                    <Pressable
                      key={level.id}
                      disabled={locked}
                      onPress={() =>
                        isTest
                          ? router.push({
                              pathname: "/test/[unitId]",
                              params: {
                                unitId: String(unit.id),
                                levelId: String(level.id),
                                timeLimit: String(level.time_limit_seconds ?? 600),
                                unitName: unit.name,
                              },
                            })
                          : router.push({
                              pathname: "/question/[mode]",
                              params: { mode: "level", unitId: String(unit.id), levelId: String(level.id) },
                            })
                      }
                      style={[
                        styles.level,
                        isTest && styles.levelTest,
                        completed && styles.levelDone,
                        locked && styles.levelLocked,
                      ]}
                    >
                      {locked ? (
                        <Lock color={colors.textMuted} size={16} />
                      ) : completed ? (
                        <Check color={colors.primaryText} size={18} />
                      ) : isTest ? (
                        <Trophy color={colors.primaryText} size={18} />
                      ) : (
                        <Text style={styles.levelNum}>{level.position}</Text>
                      )}
                      {completed && stars > 0 && (
                        <View style={styles.stars}>
                          {Array.from({ length: stars }).map((_, i) => (
                            <Star key={i} color={colors.streak} fill={colors.streak} size={9} />
                          ))}
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: { color: colors.text, fontSize: 22, fontWeight: "700" },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  streakText: { color: colors.text, fontWeight: "700" },
  unitCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderColor: colors.border,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  unitHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  unitIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  unitName: { color: colors.text, fontSize: 16, fontWeight: "600", textAlign: "right" },
  unitDesc: { color: colors.textMuted, fontSize: 12, textAlign: "right", marginTop: 2 },
  levelRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  level: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  levelTest: { backgroundColor: colors.streak },
  levelDone: { backgroundColor: colors.success },
  levelLocked: { backgroundColor: colors.locked },
  levelNum: { color: colors.primaryText, fontWeight: "700", fontSize: 15 },
  levelLockedText: { color: colors.textMuted },
  stars: { flexDirection: "row", position: "absolute", bottom: -2, gap: 1 },
});
