import { useCallback, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Flame, Trophy, Snowflake, Target, Zap, LogOut } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useAuth, signOut } from "@/lib/auth";
import { registerForPush } from "@/lib/push";
import { Mascot } from "@/components/Mascot";
import { colors, fonts, radius, spacing } from "@/lib/theme";

type Profile = {
  display_name: string;
  username: string;
  active_track: string;
  current_streak: number;
  longest_streak: number;
  streak_freezes: number;
  total_xp: number;
  total_answered: number;
  total_correct: number;
};

const TRACKS: { key: string; label: string }[] = [
  { key: "psychometric", label: "פסיכומטרי" },
  { key: "daper", label: "מבחן מיון" },
];

export default function ProfileScreen() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  const load = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase
      .from("profiles")
      .select(
        "display_name, username, active_track, current_streak, longest_streak, streak_freezes, total_xp, total_answered, total_correct",
      )
      .eq("id", session.user.id)
      .single();
    setProfile(data as Profile);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      load();
      if (session) registerForPush(session.user.id).catch(() => {});
    }, [load, session]),
  );

  async function switchTrack(track: string) {
    if (!session) return;
    await supabase.from("profiles").update({ active_track: track }).eq("id", session.user.id);
    load();
  }

  if (!profile) return <SafeAreaView style={styles.safe} />;

  const accuracy = profile.total_answered > 0 ? Math.round((profile.total_correct / profile.total_answered) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.header}>
          <View style={styles.avatarRing}>
            <Mascot size={78} bob={false} />
          </View>
          <Text style={styles.name}>{profile.display_name}</Text>
          <Text style={styles.handle}>@{profile.username}</Text>
        </View>

        <View style={styles.xpCard}>
          <View style={styles.xpIcon}>
            <Zap color="#fff" fill="#fff" size={22} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.xpValue}>{profile.total_xp.toLocaleString()} XP</Text>
            <Text style={styles.xpLabel}>{profile.total_answered} שאלות נענו</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <Stat icon={<Flame color={colors.streak} size={24} />} tint={colors.streak} label="רצף נוכחי" value={profile.current_streak} />
          <Stat icon={<Trophy color={colors.gold} size={24} />} tint={colors.gold} label="רצף שיא" value={profile.longest_streak} />
          <Stat icon={<Snowflake color={colors.freeze} size={24} />} tint={colors.freeze} label="הקפאות" value={profile.streak_freezes} />
          <Stat icon={<Target color={colors.done} size={24} />} tint={colors.done} label="דיוק" value={`${accuracy}%`} />
        </View>

        <Text style={styles.sectionTitle}>מסלול פעיל</Text>
        <View style={styles.trackRow}>
          {TRACKS.map((t) => {
            const active = profile.active_track === t.key;
            return (
              <Pressable key={t.key} style={[styles.trackBtn, active && styles.trackActive]} onPress={() => switchTrack(t.key)}>
                <Text style={[styles.trackText, active && styles.trackTextActive]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.signOut} onPress={() => signOut()}>
          <LogOut color={colors.danger} size={18} strokeWidth={2.6} />
          <Text style={styles.signOutText}>התנתקות</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: number | string; tint: string }) {
  return (
    <View style={styles.stat}>
      <View style={[styles.statIcon, { backgroundColor: tint + "1f" }]}>{icon}</View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingTop: spacing.md, paddingBottom: spacing.lg, alignItems: "center" },
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  name: { fontFamily: fonts.display, fontSize: 24, color: colors.text },
  handle: { fontFamily: fonts.medium, fontSize: 14, color: colors.textSoft, marginTop: 2 },
  xpCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    marginHorizontal: spacing.md,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  xpIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.xp, alignItems: "center", justifyContent: "center" },
  xpValue: { fontFamily: fonts.display, fontSize: 22, color: colors.text, textAlign: "right" },
  xpLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSoft, textAlign: "right", marginTop: 1 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: spacing.md, gap: spacing.sm, marginTop: spacing.sm },
  stat: {
    flexGrow: 1,
    flexBasis: "47%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 2,
    borderColor: colors.border,
  },
  statIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  statValue: { fontFamily: fonts.display, fontSize: 21, color: colors.text, textAlign: "right" },
  statLabel: { fontFamily: fonts.medium, fontSize: 12, color: colors.textSoft, textAlign: "right" },
  sectionTitle: { fontFamily: fonts.extrabold, fontSize: 14, color: colors.textMid, paddingHorizontal: spacing.md, marginTop: spacing.lg, marginBottom: spacing.sm, textAlign: "right" },
  trackRow: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.md },
  trackBtn: { flex: 1, backgroundColor: "#fff", borderRadius: radius.md, paddingVertical: 14, alignItems: "center", borderColor: colors.border, borderWidth: 2 },
  trackActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  trackText: { fontFamily: fonts.bold, fontSize: 15, color: colors.textMid },
  trackTextActive: { color: "#fff" },
  signOut: { flexDirection: "row-reverse", gap: 8, marginTop: spacing.lg, padding: spacing.md, alignItems: "center", justifyContent: "center" },
  signOutText: { fontFamily: fonts.bold, fontSize: 15, color: colors.danger },
});
