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
import { UserPlus, Check, X, MessageCircle } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { openWhatsAppInvite } from "@/lib/invite";
import { colors, spacing, radius } from "@/lib/theme";

type Profile = { id: string; username: string; display_name: string };
type Suggestion = Profile & { total_xp: number; mutual: number };
type Request = { id: number; requester: string; profiles: Profile };

export default function Friends() {
  const { session } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [pending, setPending] = useState<Request[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [myUsername, setMyUsername] = useState<string | undefined>();

  const loadPending = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase
      .from("friendships")
      .select("id, requester, profiles!friendships_requester_fkey(id, username, display_name)")
      .eq("addressee", session.user.id)
      .eq("status", "pending");
    setPending((data as unknown as Request[]) ?? []);
  }, [session]);

  const loadSuggestions = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase.rpc("friend_suggestions", { p_limit: 10 });
    setSuggestions((data as Suggestion[]) ?? []);
  }, [session]);

  const loadMe = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", session.user.id)
      .single();
    setMyUsername(data?.username);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      loadPending();
      loadSuggestions();
      loadMe();
    }, [loadPending, loadSuggestions, loadMe]),
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
    setSuggestions((s) => s.filter((p) => p.id !== addressee));
  }

  async function respond(id: number, accept: boolean) {
    if (accept) {
      await supabase.from("friendships").update({ status: "accepted" }).eq("id", id);
    } else {
      await supabase.from("friendships").delete().eq("id", id);
    }
    loadPending();
    loadSuggestions();
  }

  const showingResults = results.length > 0;
  const listData: (Profile | Suggestion)[] = showingResults ? results : suggestions;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.title}>חברים</Text>

      <Pressable style={styles.inviteBtn} onPress={() => openWhatsAppInvite(myUsername)}>
        <MessageCircle color="#25D366" size={20} />
        <Text style={styles.inviteText}>הזמינו חברים ב‑WhatsApp</Text>
      </Pressable>

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
        data={listData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md }}
        ListHeaderComponent={
          listData.length ? (
            <Text style={styles.sectionTitle}>
              {showingResults ? "תוצאות" : "אנשים שאולי תכירו"}
            </Text>
          ) : null
        }
        ListEmptyComponent={
          showingResults ? null : (
            <Text style={styles.emptyHint}>
              חפשו לפי שם משתמש או הזמינו חברים ב‑WhatsApp כדי להתחיל.
            </Text>
          )
        }
        renderItem={({ item }) => {
          const mutual = !showingResults ? (item as Suggestion).mutual : 0;
          return (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.display_name}</Text>
                <Text style={styles.handle}>
                  @{item.username}
                  {mutual > 0 ? ` · ${mutual} חברים משותפים` : ""}
                </Text>
              </View>
              <Pressable style={styles.iconBtn} onPress={() => sendRequest(item.id)}>
                <UserPlus color={colors.primary} size={20} />
              </Pressable>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: { color: colors.text, fontSize: 22, fontWeight: "700", padding: spacing.md, textAlign: "right" },
  inviteBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#25D366",
    backgroundColor: colors.surface,
  },
  inviteText: { color: colors.text, fontWeight: "700", fontSize: 15 },
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
  emptyHint: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    lineHeight: 20,
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
