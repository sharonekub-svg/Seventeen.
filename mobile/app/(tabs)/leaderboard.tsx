import { useCallback, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Crown, Zap } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { colors, fonts, radius, spacing } from "@/lib/theme";
import { avatarColors } from "@/lib/avatar";

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
    const { data } =
      scope === "global"
        ? await supabase.rpc("global_leaderboard", { p_limit: 50 })
        : await supabase.rpc("friends_leaderboard");
    setRows((data as Row[]) ?? []);
  }, [scope]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>טבלת המובילים</Text>
        <Text style={styles.subtitle}>ליגת הזהב</Text>
      </View>

      <View style={styles.toggle}>
        {(["global", "friends"] as const).map((s) => (
          <Pressable key={s} style={[styles.toggleBtn, scope === s && styles.toggleActive]} onPress={() => setScope(s)}>
            <Text style={[styles.toggleText, scope === s && styles.toggleTextActive]}>
              {s === "global" ? "כללי" : "חברים"}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={rest}
        keyExtractor={(item, i) => `${item.username}-${i}`}
        contentContainerStyle={{ padding: spacing.md, paddingTop: 4 }}
        ListHeaderComponent={podium.length >= 3 ? <Podium rows={podium} /> : null}
        renderItem={({ item, index }) => {
          const ac = avatarColors(item.display_name);
          return (
            <View style={[styles.row, item.is_self && styles.rowSelf]}>
              <Text style={[styles.rank, item.is_self && { color: colors.primary }]}>{index + 4}</Text>
              <View style={[styles.avatar, { backgroundColor: ac.bg }]}>
                <Text style={[styles.avatarText, { color: ac.color, fontSize: 16 }]}>{item.display_name[0]}</Text>
              </View>
              <Text style={styles.name}>{item.display_name}</Text>
              <View style={styles.xpWrap}>
                <Zap color={colors.xp} fill={colors.xp} size={14} />
                <Text style={styles.xp}>{item.total_xp.toLocaleString()}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          podium.length < 3 ? (
            <Text style={styles.empty}>
              {scope === "friends" ? "הוסיפו חברים כדי להשוות התקדמות." : "אין נתונים עדיין."}
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function Podium({ rows }: { rows: Row[] }) {
  const order = [1, 0, 2]; // 2nd place, 1st (center), 3rd
  const heights = [96, 130, 76];
  const bar = ["#d3dcd5", "#ffd968", "#e6c09a"];
  const barDark = ["#b6c0b8", "#f3b21f", "#cf9f6f"];

  return (
    <View style={styles.podium}>
      {order.map((idx, pos) => {
        const r = rows[idx];
        if (!r) return <View key={pos} style={{ flex: 1 }} />;
        const ac = avatarColors(r.display_name);
        const first = idx === 0;
        return (
          <View key={pos} style={styles.podCol}>
            <View style={{ height: 26, justifyContent: "flex-end" }}>
              {first ? <Crown color={colors.gold} fill={colors.gold} size={24} /> : null}
            </View>
            <View
              style={[
                styles.podAvatar,
                {
                  width: first ? 62 : 52,
                  height: first ? 62 : 52,
                  borderRadius: first ? 31 : 26,
                  backgroundColor: ac.bg,
                  borderColor: first ? colors.gold : "#c4cdc6",
                },
              ]}
            >
              <Text style={[styles.avatarText, { color: ac.color, fontSize: first ? 24 : 20 }]}>{r.display_name[0]}</Text>
            </View>
            <Text style={styles.podName} numberOfLines={1}>
              {r.display_name}
            </Text>
            <View style={styles.podXpWrap}>
              <Zap color={colors.xp} fill={colors.xp} size={12} />
              <Text style={styles.podXp}>{r.total_xp.toLocaleString()}</Text>
            </View>
            <View style={[styles.podBar, { height: heights[pos], backgroundColor: bar[pos], borderBottomColor: barDark[pos] }]}>
              <Text style={styles.podRank}>{idx + 1}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  title: { fontFamily: fonts.display, fontSize: 24, color: colors.text, textAlign: "right" },
  subtitle: { fontFamily: fonts.medium, fontSize: 14, color: colors.textSoft, marginTop: 2, textAlign: "right" },
  toggle: {
    flexDirection: "row",
    marginHorizontal: spacing.md,
    backgroundColor: "#fff",
    borderRadius: radius.md,
    padding: 4,
    borderWidth: 2,
    borderColor: colors.border,
  },
  toggleBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.sm, alignItems: "center" },
  toggleActive: { backgroundColor: colors.primary },
  toggleText: { fontFamily: fonts.bold, color: colors.textSoft },
  toggleTextActive: { color: "#fff" },
  podium: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 8, marginTop: 16, marginBottom: 8 },
  podCol: { flex: 1, alignItems: "center" },
  podAvatar: { alignItems: "center", justifyContent: "center", borderWidth: 3, marginBottom: 6 },
  podName: { fontFamily: fonts.extrabold, fontSize: 13, color: colors.textMid, maxWidth: "100%" },
  podXpWrap: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 1, marginBottom: 7 },
  podXp: { fontFamily: fonts.bold, fontSize: 12, color: colors.textSoft },
  podBar: { width: "100%", borderTopLeftRadius: 14, borderTopRightRadius: 14, borderBottomWidth: 5, alignItems: "center", paddingTop: 8 },
  podRank: { fontFamily: fonts.display, fontSize: 26, color: "#fff" },
  avatarText: { fontFamily: fonts.display },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    padding: 11,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.border,
  },
  rowSelf: { backgroundColor: "#e7f6ef", borderColor: "#9fdcc0" },
  rank: { fontFamily: fonts.display, fontSize: 17, color: colors.textSoft, width: 28, textAlign: "center" },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  name: { flex: 1, fontFamily: fonts.extrabold, fontSize: 15, color: colors.textBody, textAlign: "right" },
  xpWrap: { flexDirection: "row", alignItems: "center", gap: 4 },
  xp: { fontFamily: fonts.extrabold, fontSize: 14, color: colors.textSoft },
  empty: { color: colors.textMuted, fontFamily: fonts.bold, textAlign: "center", marginTop: spacing.xl },
});
