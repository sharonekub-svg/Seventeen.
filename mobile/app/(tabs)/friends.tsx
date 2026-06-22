import { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { UserPlus, Check, X } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { colors, spacing, radius } from "@/lib/theme";

type Profile = { id: string; username: string; display_name: string };
type Request = { id: number; requester: string; profiles: Profile };

export default function Friends() {
  const { session } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [pending, setPending] = useState<Request[]>([]);

  const loadPending = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase
      .from("friendships")
      .select("id, requester, profiles!friendships_requester_fkey(id, username, display_name)")
      .eq("addressee", session.user.id)
      .eq("status", "pending");
    setPending((data as unknown as Request[]) ?? []);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      loadPending();
    }, [loadPending]),
  );

  async function search() {
    if (!query.trim() || !session) return;
    const { data } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .ilike("username", `%${query.trim()}%`)
      .neq("id", session.user.id)
      .limit(20);
    setResults((data as Profile[]) ?? []);
  }

  async function sendRequest(addressee: string) {
    if (!session) return;
    await supabase
      .from("friendships")
      .insert({ requester: session.user.id, addressee, status: "pending" });
    setResults((r) => r.filter((p) => p.id !== addressee));
  }

  async function respond(id: number, accept: boolean) {
    if (accept) {
      await supabase.from("friendships").update({ status: "accepted" }).eq("id", id);
    } else {
      await supabase.from("friendships").delete().eq("id", id);
    }
    loadPending();
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.title}>חברים</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="חיפוש לפי שם משתמש"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={search}
        />
        <Pressable style={styles.searchBtn} onPress={search}>
          <Text style={styles.searchBtnText}>חפש</Text>
        </Pressable>
      </View>

      {pending.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>בקשות חברות</Text>
          {pending.map((req) => (
            <View key={req.id} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{req.profiles?.display_name}</Text>
                <Text style={styles.handle}>@{req.profiles?.username}</Text>
              </View>
              <Pressable style={styles.iconBtn} onPress={() => respond(req.id, true)}>
                <Check color={colors.success} size={20} />
              </Pressable>
              <Pressable style={styles.iconBtn} onPress={() => respond(req.id, false)}>
                <X color={colors.danger} size={20} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md }}
        ListHeaderComponent={
          results.length ? <Text style={styles.sectionTitle}>תוצאות</Text> : null
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.display_name}</Text>
              <Text style={styles.handle}>@{item.username}</Text>
            </View>
            <Pressable style={styles.iconBtn} onPress={() => sendRequest(item.id)}>
              <UserPlus color={colors.primary} size={20} />
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: { color: colors.text, fontSize: 22, fontWeight: "700", padding: spacing.md, textAlign: "right" },
  searchRow: { flexDirection: "row", gap: spacing.sm, paddingHorizontal: spacing.md },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    color: colors.text,
    padding: spacing.md,
    textAlign: "right",
  },
  searchBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
  },
  searchBtnText: { color: colors.primaryText, fontWeight: "600" },
  section: { paddingHorizontal: spacing.md, marginTop: spacing.md },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: spacing.sm,
    textAlign: "right",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  name: { color: colors.text, fontSize: 15, fontWeight: "600", textAlign: "right" },
  handle: { color: colors.textMuted, fontSize: 12, textAlign: "right" },
  iconBtn: { padding: spacing.sm },
});
