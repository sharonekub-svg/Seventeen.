// Chunky 3D button with a colored bottom "step" that compresses on press.
import React, { useState } from "react";
import { Pressable, Text, View, StyleProp, ViewStyle, TextStyle, ActivityIndicator } from "react-native";
import { colors, fonts, radius as R } from "@/lib/theme";

type Tone = "primary" | "white" | "danger" | "muted";

const TONES: Record<Tone, { face: string; step: string; text: string; border?: string }> = {
  primary: { face: colors.primary, step: colors.primaryDark, text: "#fff" },
  danger: { face: colors.danger, step: colors.dangerDark, text: "#fff" },
  white: { face: "#fff", step: colors.borderInput, text: colors.textMid, border: colors.borderInput },
  muted: { face: "#e1e7e3", step: "#cdd5cf", text: "#aab2ac" },
};

export function Button3D({
  title,
  children,
  onPress,
  disabled,
  loading,
  tone = "primary",
  depth = 5,
  radius = R.md,
  fontSize = 19,
  style,
  textStyle,
}: {
  title?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  tone?: Tone;
  depth?: number;
  radius?: number;
  fontSize?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  const [pressed, setPressed] = useState(false);
  const t = disabled ? TONES.muted : TONES[tone];
  const isDown = pressed && !disabled;

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={style}
    >
      <View style={{ backgroundColor: t.step, borderRadius: radius, paddingBottom: isDown ? 1 : depth }}>
        <View
          style={{
            backgroundColor: t.face,
            borderRadius: radius,
            borderWidth: t.border ? 2 : 0,
            borderColor: t.border,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 8,
            paddingVertical: 14,
            paddingHorizontal: 16,
          }}
        >
          {loading ? (
            <ActivityIndicator color={t.text} />
          ) : children ? (
            children
          ) : (
            <Text style={[{ color: t.text, fontFamily: fonts.display, fontSize }, textStyle]}>{title}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
