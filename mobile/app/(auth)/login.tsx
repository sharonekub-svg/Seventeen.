import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signIn, signUp } from "@/lib/auth";
import { colors, spacing, radius } from "@/lib/theme";

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

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <Text style={styles.title}>
          {mode === "signin" ? "התחברות" : "הרשמה"}
        </Text>
        <Text style={styles.subtitle}>שאלה אחת ביום. הרצף שלך מתחיל כאן.</Text>

        {mode === "signup" && (
          <TextInput
            style={styles.input}
            placeholder="שם משתמש"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="אימייל"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="סיסמה"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={submit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <Text style={styles.buttonText}>
              {mode === "signin" ? "כניסה" : "צור חשבון"}
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          <Text style={styles.switch}>
            {mode === "signin"
              ? "אין לך חשבון? הרשמה"
              : "כבר רשום? התחברות"}
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, justifyContent: "center", padding: spacing.lg },
  title: { color: colors.text, fontSize: 28, fontWeight: "700", textAlign: "right" },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    textAlign: "right",
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    color: colors.text,
    padding: spacing.md,
    marginBottom: spacing.sm,
    textAlign: "right",
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  buttonText: { color: colors.primaryText, fontSize: 16, fontWeight: "600" },
  switch: {
    color: colors.primary,
    textAlign: "center",
    marginTop: spacing.lg,
    fontSize: 14,
  },
  error: { color: colors.danger, textAlign: "right", marginBottom: spacing.sm },
});
