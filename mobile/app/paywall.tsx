import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Check, Crown } from "lucide-react-native";
import { capture } from "@/lib/analytics";
import { colors, spacing, radius } from "@/lib/theme";

// Paywall scaffold (issue #5). The purchase flow itself (StoreKit / IAP) is
// wired once App Store subscription products + an Apple Developer account exist;
// here we present the value proposition and record intent.
const PERKS = [
  "גישה לכל הנושאים והרמות",
  "מבחני סיכום ללא הגבלה",
  "הסברים מפורטים לכל שאלה",
  "מעקב התקדמות מתקדם",
];

export default function PaywallScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <View style={styles.hero}>
          <Crown color={colors.streak} size={48} />
          <Text style={styles.title}>Aptitude Pro</Text>
          <Text style={styles.subtitle}>הכנה מלאה לפסיכומטרי ולמבחן המיון</Text>
        </View>

        <View style={styles.perks}>
          {PERKS.map((p) => (
            <View key={p} style={styles.perkRow}>
              <Check color={colors.success} size={18} />
              <Text style={styles.perkText}>{p}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={styles.primaryBtn}
          onPress={() => {
            capture("paywall_subscribe_tapped");
            router.back();
          }}
        >
          <Text style={styles.primaryBtnText}>התחל ניסיון חינם</Text>
        </Pressable>
        <Text style={styles.note}>
          רכישות בתוך האפליקציה יופעלו בקרוב. תודה על הסבלנות!
        </Text>

        <Pressable onPress={() => router.back()} style={styles.dismiss}>
          <Text style={styles.dismissText}>אולי מאוחר יותר</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  hero: { alignItems: "center", gap: spacing.sm, marginTop: spacing.lg },
  title: { color: colors.text, fontSize: 28, fontWeight: "800" },
  subtitle: { color: colors.textMuted, fontSize: 15, textAlign: "center" },
  perks: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  perkRow: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.sm },
  perkText: { color: colors.text, fontSize: 16, flex: 1, textAlign: "right" },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: radius.md, padding: spacing.md, alignItems: "center" },
  primaryBtnText: { color: colors.primaryText, fontSize: 16, fontWeight: "700" },
  note: { color: colors.textMuted, fontSize: 12, textAlign: "center" },
  dismiss: { padding: spacing.md, alignItems: "center" },
  dismissText: { color: colors.textMuted, fontWeight: "600" },
});
