import { useCallback, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Flame } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { colors, spacing, radius } from "@/lib/theme";

type Row = {
  username: string;
  display_name: string;
  current_streak: number;
  total_xp: number;
  is_self?: boolean;
};

export default function Leaderboard() {
  const [scope, setScope] = useState<"global" | "friends">("global");
  const [rows, setRows] = useState<Row[]>([]);

  const load = useCallback(async () => {
    if (scope === "global") {
      const { data } = await supabase.rpc("global_leaderboard", { p_limit: 50 });
      setRows((data as Row[]) ?? []);
    } else {
      const { data } = await supabase.rpc("friends_leaderboard");
      setRows((data as Row[]) ?? []);
    }
  }, [scope]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.title}>טבלת מובילים</Text>

      <View style={styles.toggle}>
        <Pressable
          style={[styles.toggleBtn, scope === "global" && styles.toggleActive]}
          onPress={() => setScope("global")}
        >
          <Text style={[styles.toggleText, scope === "global" && styles.toggleTextActive]}>
            כללי
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleBtn, scope === "friends" && styles.toggleActive]}
          onPress={() => setScope("friends")}
        >
          <Text style={[styles.toggleText, scope === "friends" && styles.toggleTextActive]}>
            חברים
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item, i) => `${item.username}-${i}`}
        contentContainerStyle={{ padding: spacing.md }}
        renderItem={({ item, index }) => (
          <View style={[styles.row, item.is_self && styles.rowSelf]}>
            <Text style={styles.rank}>{index + 1}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.display_name}</Text>
              <Text style={styles.handle}>@{item.username}</Text>
            </View>
            <View style={styles.streakWrap}>
              <Flame color={colors.streak} size={16} />
              <Text style={styles.streak}>{item.current_streak}</Text>
            </View>
            <Text style={styles.xp}>{item.total_xp} XP</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {scope === "friends" ? "עדיין אין חברים. הוסף חברים בלשונית 'חברים'." : "אין נתונים עדיין."}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    padding: spacing.md,
    textAlign: "right",
  },
  toggle: {
    flexDirection: "row",
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 4,
  },
  toggleBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.sm, alignItems: "center" },
  toggleActive: { backgroundColor: colors.primary },
  toggleText: { color: colors.textMuted, fontWeight: "600" },
  toggleTextActive: { color: colors.primaryText },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowSelf: { borderColor: colors.primary, borderWidth: 1 },
  rank: { color: colors.textMuted, width: 24, fontWeight: "700", textAlign: "center" },
  name: { color: colors.text, fontSize: 15, fontWeight: "600", textAlign: "right" },
  handle: { color: colors.textMuted, fontSize: 12, textAlign: "right" },
  streakWrap: { flexDirection: "row", alignItems: "center", gap: 2 },
  streak: { color: colors.text, fontWeight: "600" },
  xp: { color: colors.textMuted, fontSize: 13, width: 64, textAlign: "left" },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: spacing.xl },
});
