import { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Flame, Zap, Heart } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { PathTrack, type PathNode } from "@/components/PathTrack";
import { Heartbeat } from "@/components/anim";
import { colors, fonts, radius, spacing } from "@/lib/theme";

type Level = { id: number; position: number; title: string | null };
type Unit = { id: number; name: string; description: string | null; icon: string | null; position: number; levels: Level[] };
type Progress = { level_id: number; status: string; stars: number };

// Shown only until a real, seeded backend returns units — keeps the path
// looking endless even before content exists. Real data always wins.
const DEMO_UNITS: Unit[] = [
  { id: 1, name: "חשיבה כמותית", description: null, icon: null, position: 1, levels: Array.from({ length: 10 }, (_, i) => ({ id: i + 1, position: i + 1, title: null })) },
  { id: 2, name: "אנלוגיות מילוליות", description: null, icon: null, position: 2, levels: Array.from({ length: 10 }, (_, i) => ({ id: i + 11, position: i + 1, title: null })) },
  { id: 3, name: "הבנת הוראות", description: null, icon: null, position: 3, levels: Array.from({ length: 10 }, (_, i) => ({ id: i + 21, position: i + 1, title: null })) },
];
const DEMO_PROGRESS: Record<number, Progress> = {
  1: { level_id: 1, status: "completed", stars: 3 },
  2: { level_id: 2, status: "completed", stars: 2 },
  3: { level_id: 3, status: "completed", stars: 3 },
};

export default function PathScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [units, setUnits] = useState<Unit[]>([]);
  const [progress, setProgress] = useState<Record<number, Progress>>({});
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("active_track, current_streak, total_xp")
      .eq("id", session.user.id)
      .single();
    const activeTrack = profile?.active_track ?? "psychometric";
    setStreak(profile?.current_streak ?? 0);
    setXp(profile?.total_xp ?? 0);

    const { data: u } = await supabase
      .from("units")
      .select("id, name, description, icon, position, levels(id, position, title)")
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

  const useDemo = units.length === 0;
  const srcUnits = useDemo ? DEMO_UNITS : units;
  const srcProgress = useDemo ? DEMO_PROGRESS : progress;

  function levelState(level: Level): "completed" | "unlocked" | "locked" {
    const p = srcProgress[level.id];
    if (p?.status === "completed") return "completed";
    if (p?.status === "unlocked") return "unlocked";
    if (level.position === 1) return "unlocked";
    return "locked";
  }

  // Flatten every unit's levels into one continuous, endless serpentine.
  const nodes: PathNode[] = [];
  let activeAssigned = false;
  for (const unit of srcUnits) {
    unit.levels.forEach((level, i) => {
      const ls = levelState(level);
      let state: PathNode["state"];
      if (ls === "completed") state = "completed";
      else if (ls === "locked") state = "locked";
      else if (!activeAssigned) {
        state = "active";
        activeAssigned = true;
      } else state = "open";

      nodes.push({
        key: `u${unit.id}-l${level.id}`,
        kind: "level",
        state,
        stars: srcProgress[level.id]?.stars ?? 0,
        unitLabel: i === 0 ? `יחידה ${unit.position} · ${unit.name}` : undefined,
        onPress:
          ls === "locked"
            ? undefined
            : () =>
                router.push({
                  pathname: "/question/[mode]",
                  params: { mode: "level", unitId: String(unit.id), levelId: String(level.id) },
                }),
      });
    });
    // reward chest at the end of each unit
    const unitDone = unit.levels.every((l) => levelState(l) === "completed");
    nodes.push({ key: `u${unit.id}-chest`, kind: "chest", state: unitDone ? "completed" : "locked" });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.hud}>
        <Chip border={colors.streakBorder} shadow={colors.streakShadow}>
          <Heartbeat>
            <Flame color={colors.streak} fill={colors.streak} size={18} />
          </Heartbeat>
          <Text style={[styles.chipText, { color: colors.streak }]}>{streak}</Text>
        </Chip>
        <View style={{ flex: 1 }} />
        <Chip border={colors.xpBorder} shadow={colors.xpShadow}>
          <Zap color={colors.xp} fill={colors.xp} size={17} />
          <Text style={[styles.chipText, { color: colors.xp }]}>{xp.toLocaleString()}</Text>
        </Chip>
        <Chip border={colors.heartBorder} shadow={colors.heartShadow}>
          <Heart color={colors.heart} fill={colors.heart} size={17} />
          <Text style={[styles.chipText, { color: colors.heart }]}>5</Text>
        </Chip>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <PathTrack nodes={nodes} width={width} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Chip({ children, border, shadow }: { children: React.ReactNode; border: string; shadow: string }) {
  return (
    <View style={[styles.chip, { borderColor: border, shadowColor: shadow }]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bgSoft },
  hud: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 12,
    backgroundColor: colors.bgSoft,
    zIndex: 30,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderRadius: radius.md,
    paddingVertical: 7,
    paddingHorizontal: 13,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  chipText: { fontFamily: fonts.display, fontSize: 18 },
});
