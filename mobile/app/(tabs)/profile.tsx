import { useCallback, useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Flame, Trophy, Snowflake, Target, Mail } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useAuth, signOut } from "@/lib/auth";
import { registerForPush } from "@/lib/push";
import { colors, spacing, radius } from "@/lib/theme";

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
  const [nameDraft, setNameDraft] = useState("");
  const [saving, setSaving] = useState(false);

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
    if (data) setNameDraft((data as Profile).display_name);
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

  async function saveName() {
    const next = nameDraft.trim();
    if (!session || !next || next === profile?.display_name) return;
    setSaving(true);
    try {
      await supabase.from("profiles").update({ display_name: next }).eq("id", session.user.id);
      await load();
    } finally {
      setSaving(false);
    }
  }

  if (!profile) return <SafeAreaView style={styles.safe} />;

  const accuracy =
    profile.total_answered > 0
      ? Math.round((profile.total_correct / profile.total_answered) * 100)
      : 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.name}>{profile.display_name}</Text>
        <Text style={styles.handle}>@{profile.username}</Text>
      </View>

      <View style={styles.statsGrid}>
        <Stat icon={<Flame color={colors.streak} size={22} />} label="רצף נוכחי" value={profile.current_streak} />
        <Stat icon={<Trophy color={colors.primary} size={22} />} label="רצף שיא" value={profile.longest_streak} />
        <Stat icon={<Snowflake color={colors.textMuted} size={22} />} label="הקפאות" value={profile.streak_freezes} />
        <Stat icon={<Target color={colors.success} size={22} />} label="דיוק" value={`${accuracy}%`} />
      </View>

      <View style={styles.xpCard}>
        <Text style={styles.xpValue}>{profile.total_xp}</Text>
        <Text style={styles.xpLabel}>סך הכל XP · {profile.total_answered} שאלות</Text>
      </View>

      <Text style={styles.sectionTitle}>מסלול פעיל</Text>
      <View style={styles.trackRow}>
        {TRACKS.map((t) => (
          <Pressable
            key={t.key}
            style={[styles.trackBtn, profile.active_track === t.key && styles.trackActive]}
            onPress={() => switchTrack(t.key)}
          >
            <Text
              style={[styles.trackText, profile.active_track === t.key && styles.trackTextActive]}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>חשבון</Text>
      <View style={styles.accountCard}>
        <View style={styles.accountRow}>
          <Mail color={colors.textMuted} size={16} />
          <Text style={styles.accountEmail}>{session?.user.email}</Text>
        </View>
        <View style={styles.nameRow}>
          <TextInput
            style={styles.nameInput}
            value={nameDraft}
            onChangeText={setNameDraft}
            placeholder="שם תצוגה"
            placeholderTextColor={colors.textMuted}
            maxLength={40}
          />
          <Pressable
            style={[
              styles.saveBtn,
              (saving || !nameDraft.trim() || nameDraft.trim() === profile.display_name) && {
                opacity: 0.5,
              },
            ]}
            onPress={saveName}
            disabled={saving || !nameDraft.trim() || nameDraft.trim() === profile.display_name}
          >
            <Text style={styles.saveBtnText}>שמירה</Text>
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.signOut} onPress={() => signOut()}>
        <Text style={styles.signOutText}>התנתקות</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <View style={styles.stat}>
      {icon}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.lg, alignItems: "center" },
  name: { color: colors.text, fontSize: 24, fontWeight: "700" },
  handle: { color: colors.textMuted, fontSize: 14, marginTop: 2 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  stat: {
    flexGrow: 1,
    flexBasis: "47%",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  statValue: { color: colors.text, fontSize: 20, fontWeight: "700" },
  statLabel: { color: colors.textMuted, fontSize: 12 },
  xpCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    margin: spacing.md,
    padding: spacing.lg,
    alignItems: "center",
  },
  xpValue: { color: colors.primary, fontSize: 32, fontWeight: "800" },
  xpLabel: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: spacing.md,
    textAlign: "right",
  },
  trackRow: { flexDirection: "row", gap: spacing.sm, padding: spacing.md },
  trackBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    borderColor: colors.border,
    borderWidth: 1,
  },
  trackActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  trackText: { color: colors.text, fontWeight: "600" },
  trackTextActive: { color: colors.primaryText },
  accountCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.md,
    gap: spacing.sm,
  },
  accountRow: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.sm },
  accountEmail: { color: colors.textMuted, fontSize: 14, flex: 1, textAlign: "right" },
  nameRow: { flexDirection: "row", gap: spacing.sm },
  nameInput: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    color: colors.text,
    padding: spacing.sm,
    textAlign: "right",
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
  },
  saveBtnText: { color: colors.primaryText, fontWeight: "700" },
  signOut: { margin: spacing.md, padding: spacing.md, alignItems: "center" },
  signOutText: { color: colors.danger, fontWeight: "600" },
});
