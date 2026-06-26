import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signIn, signUp } from "@/lib/auth";
import { Mascot } from "@/components/Mascot";
import { Button3D } from "@/components/Button3D";
import { colors, fonts, radius, spacing, step3d } from "@/lib/theme";

export default function Login() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const { error } =
        mode === "signin"
          ? await signIn(email.trim(), password)
          : await signUp(email.trim(), password, username.trim());
      if (error) setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  const isSignup = mode === "signup";

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Mascot size={96} />
          <Text style={styles.brand}>מַסְלוּל</Text>
          <Text style={styles.tagline}>שאלה אחת ביום. הרצף שלך מתחיל כאן.</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{isSignup ? "הרשמה" : "התחברות"}</Text>

            {isSignup && (
              <Field label="שם מלא">
                <TextInput
                  style={styles.input}
                  placeholder="איך קוראים לך?"
                  placeholderTextColor={colors.textSoft}
                  autoCapitalize="none"
                  value={username}
                  onChangeText={setUsername}
                />
              </Field>
            )}

            <Field label="אימייל">
              <TextInput
                style={[styles.input, styles.ltr]}
                placeholder="name@email.com"
                placeholderTextColor={colors.textSoft}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </Field>

            <Field label="סיסמה">
              <TextInput
                style={[styles.input, styles.ltr]}
                placeholder="••••••••"
                placeholderTextColor={colors.textSoft}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </Field>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button3D
              title={isSignup ? "יצירת חשבון" : "התחברות"}
              onPress={submit}
              loading={loading}
              style={{ marginTop: spacing.sm }}
            />
          </View>

          <Text style={styles.switchText}>
            {isSignup ? "כבר יש לך חשבון? " : "עוד אין לך חשבון? "}
            <Text style={styles.switchLink} onPress={() => setMode(isSignup ? "signin" : "signup")}>
              {isSignup ? "התחברות" : "הרשמה"}
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#eaf6ee" },
  container: { padding: spacing.lg, paddingTop: spacing.xl, alignItems: "center" },
  brand: { fontFamily: fonts.display, fontSize: 34, color: colors.primary, marginTop: 10 },
  tagline: { fontFamily: fonts.medium, fontSize: 15, color: colors.textMuted, marginTop: 4, marginBottom: 26 },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: radius.xl,
    padding: 22,
    ...step3d(colors.borderShadow, 8),
  },
  cardTitle: { fontFamily: fonts.display, fontSize: 21, color: colors.text, marginBottom: 16, textAlign: "right" },
  fieldLabel: { fontFamily: fonts.bold, fontSize: 13, color: colors.textSoft, marginBottom: 5, marginHorizontal: 4, textAlign: "right" },
  input: {
    width: "100%",
    borderWidth: 2,
    borderColor: colors.borderInput,
    backgroundColor: colors.inputBg,
    borderRadius: radius.md,
    paddingVertical: 13,
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: fonts.body,
    color: colors.text,
    textAlign: "right",
  },
  ltr: { textAlign: "left" },
  error: { color: colors.danger, fontFamily: fonts.bold, fontSize: 13, textAlign: "right", marginBottom: 8 },
  switchText: { marginTop: 22, fontFamily: fonts.medium, fontSize: 15, color: colors.textMuted },
  switchLink: { color: colors.primary, fontFamily: fonts.extrabold },
});
