// The fox mascot, ported from the Claude Design vector shapes to RN Views.
// Pure shapes (no image asset, no emoji). Scales from a 96px base.
import React from "react";
import { View } from "react-native";
import { Bob } from "./anim";
import { colors } from "@/lib/theme";

export function Mascot({ size = 96, bob = true }: { size?: number; bob?: boolean }) {
  const s = size / 96;
  const px = (n: number) => n * s;
  const center = (w: number) => (size - px(w)) / 2;

  const ear = (side: "left" | "right") => ({
    position: "absolute" as const,
    top: px(-2),
    [side]: px(8),
    width: 0,
    height: 0,
    borderLeftWidth: px(13),
    borderRightWidth: px(13),
    borderBottomWidth: px(25),
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: colors.foxDark,
    transform: [{ rotate: side === "left" ? "-22deg" : "22deg" }],
  });

  const body = (
    <View style={{ width: size, height: size }}>
      <View style={ear("left")} />
      <View style={ear("right")} />
      {/* head */}
      <View
        style={{
          position: "absolute",
          top: px(14),
          left: center(78),
          width: px(78),
          height: px(66),
          backgroundColor: colors.fox,
          borderRadius: px(39),
        }}
      />
      {/* muzzle / belly */}
      <View
        style={{
          position: "absolute",
          top: px(40),
          left: center(50),
          width: px(50),
          height: px(40),
          backgroundColor: colors.foxBelly,
          borderTopLeftRadius: px(25),
          borderTopRightRadius: px(25),
          borderBottomLeftRadius: px(30),
          borderBottomRightRadius: px(30),
        }}
      />
      {/* eyes */}
      <View style={{ position: "absolute", top: px(36), left: px(25), width: px(11), height: px(13), backgroundColor: colors.foxEye, borderRadius: px(6) }} />
      <View style={{ position: "absolute", top: px(36), right: px(25), width: px(11), height: px(13), backgroundColor: colors.foxEye, borderRadius: px(6) }} />
      {/* nose */}
      <View
        style={{
          position: "absolute",
          top: px(54),
          left: center(14),
          width: px(14),
          height: px(11),
          backgroundColor: colors.foxEye,
          borderTopLeftRadius: px(6),
          borderTopRightRadius: px(6),
          borderBottomLeftRadius: px(7),
          borderBottomRightRadius: px(7),
        }}
      />
    </View>
  );

  return bob ? <Bob distance={6} duration={3000}>{body}</Bob> : body;
}
