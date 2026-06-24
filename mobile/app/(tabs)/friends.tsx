import { useCallback, useState } from "react";
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Search, UserPlus, Check, X } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { colors, fonts, radius, spacing } from "@/lib/theme";
import { avatarColors } from "@/lib/avatar";

type Profile = { id: string; username: string; display_name: string };
type Request = { id: number; requester: string; profiles: Profile };

function Avatar({ name }: { name?: string }) {
  const ac = avatarColors(name);
  return (
    <View style={[styles.avatar, { backgroundColor: ac.bg }]}>
      <Text style={[styles.avatarText, { color: ac.color }]}>{name?.[0] ?? "?"}</Text>
    </View>
  );
}

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
    await supabase.from("friendships").insert({ requester: session.user.id, addressee, status: "pending" });
    setResults((r) => r.filter((p) => p.id !== addressee));
  }

  async function respond(id: number, accept: boolean) {
    if (accept) await supabase.from("friendships").update({ status: "accepted" }).eq("id", id);
    else await supabase.from("friendships").delete().eq("id", id);
    loadPending();
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.title}>חברים</Text>

      <View style={styles.searchRow}>
        <Search color={colors.textFaint} size={20} />
        <TextInput
          style={styles.input}
          placeholder="חיפוש לפי שם משתמש"
          placeholderTextColor={colors.textFaint}
          autoCapitalize="none"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={search}
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md, paddingTop: spacing.sm }}
        ListHeaderComponent={
          <View>
            {pending.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>בקשות חברות</Text>
                {pending.map((req) => (
                  <View key={req.id} style={styles.row}>
                    <Avatar name={req.profiles?.display_name} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name}>{req.profiles?.display_name}</Text>
                      <Text style={styles.handle}>@{req.profiles?.username}</Text>
                    </View>
                    <Pressable style={[styles.miniBtn, { backgroundColor: colors.primary }]} onPress={() => respond(req.id, true)}>
                      <Check color="#fff" size={20} strokeWidth={3} />
                    </Pressable>
                    <Pressable style={[styles.miniBtn, styles.miniGhost]} onPress={() => respond(req.id, false)}>
                      <X color={colors.textSoft} size={20} strokeWidth={3} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
            {results.length > 0 && <Text style={styles.sectionTitle}>תוצאות חיפוש</Text>}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Avatar name={item.display_name} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.display_name}</Text>
              <Text style={styles.handle}>@{item.username}</Text>
            </View>
            <Pressable style={[styles.miniBtn, { backgroundColor: colors.primary }]} onPress={() => sendRequest(item.id)}>
              <UserPlus color="#fff" size={20} strokeWidth={2.6} />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          pending.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.empty}>חפשו חברים לפי שם המשתמש שלהם והוסיפו אותם כדי להתחרות יחד.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: { fontFamily: fonts.display, fontSize: 24, color: colors.text, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12, textAlign: "right" },
  searchRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    backgroundColor: "#fff",
    borderColor: colors.border,
    borderWidth: 2,
    borderRadius: radius.md,
    paddingHorizontal: 14,
  },
  input: { flex: 1, color: colors.text, paddingVertical: 13, fontFamily: fonts.medium, fontSize: 15, textAlign: "right" },
  section: { marginBottom: spacing.sm },
  sectionTitle: { fontFamily: fonts.extrabold, fontSize: 13, color: colors.textSoft, marginBottom: spacing.sm, marginTop: spacing.sm, textAlign: "right" },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#fff",
    borderRadius: radius.lg,
    padding: 11,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.border,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: fonts.display, fontSize: 18 },
  name: { fontFamily: fonts.extrabold, fontSize: 15, color: colors.textBody, textAlign: "right" },
  handle: { fontFamily: fonts.medium, fontSize: 12, color: colors.textSoft, textAlign: "right", marginTop: 1 },
  miniBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  miniGhost: { backgroundColor: "#f0f3f1", borderWidth: 2, borderColor: colors.border },
  emptyWrap: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  empty: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 14, textAlign: "center", lineHeight: 22 },
});
