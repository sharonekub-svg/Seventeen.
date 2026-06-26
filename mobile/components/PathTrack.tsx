// Endless serpentine learning path. Geometry is generated for an arbitrary
// number of nodes, so the road never "ends" — more levels simply extend it.
import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import Svg, { Path, Rect, Defs, LinearGradient, Stop } from "react-native-svg";
import { Lock, Check, Star, Gift, Play } from "lucide-react-native";
import { Mascot } from "./Mascot";
import { Bob, PulseRing } from "./anim";
import { colors, fonts } from "@/lib/theme";

export type PathNode = {
  key: string;
  kind: "level" | "chest";
  state: "completed" | "active" | "open" | "locked";
  stars?: number;
  unitLabel?: string; // when set, a unit banner floats above this node
  onPress?: () => void;
};

const SPACING = 150;
const TOP_PAD = 120;
const BOTTOM_PAD = 220;
const SIZE = 76;
const ACTIVE_SIZE = 84;
const DEPTH = 9;

export function PathTrack({ nodes, width }: { nodes: PathNode[]; width: number }) {
  const center = width / 2;
  const amp = Math.min(width * 0.26, 104);

  const layout = useMemo(() => {
    return nodes.map((n, i) => ({
      ...n,
      x: center + amp * Math.sin(i * 0.9 + 0.35),
      y: TOP_PAD + i * SPACING,
    }));
  }, [nodes, center, amp]);

  const totalHeight = TOP_PAD + Math.max(0, nodes.length - 1) * SPACING + BOTTOM_PAD;

  // Smooth road through every node center.
  const roadPath = useMemo(() => {
    if (layout.length === 0) return "";
    let d = `M ${layout[0].x.toFixed(1)} ${layout[0].y.toFixed(1)}`;
    for (let i = 1; i < layout.length; i++) {
      const p = layout[i - 1];
      const c = layout[i];
      const my = (p.y + c.y) / 2;
      d += ` C ${p.x.toFixed(1)} ${my.toFixed(1)} ${c.x.toFixed(1)} ${my.toFixed(1)} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
    }
    return d;
  }, [layout]);

  const active = layout.find((n) => n.state === "active");

  return (
    <View style={{ width, height: totalHeight }}>
      {/* sky + hill gradient and the road */}
      <Svg width={width} height={totalHeight} style={{ position: "absolute", top: 0, left: 0 }}>
        <Defs>
          <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.sky[0]} />
            <Stop offset="0.18" stopColor={colors.sky[1]} />
            <Stop offset="0.5" stopColor={colors.sky[2]} />
            <Stop offset="1" stopColor={colors.sky[3]} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={totalHeight} fill="url(#sky)" />
        {roadPath ? (
          <>
            <Path d={roadPath} fill="none" stroke="#7fc56b" strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" />
            <Path d={roadPath} fill="none" stroke="#eef7e6" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 22" opacity={0.85} />
          </>
        ) : null}
      </Svg>

      {/* unit banners */}
      {layout.map((n) =>
        n.unitLabel ? (
          <View
            key={`banner-${n.key}`}
            style={{
              position: "absolute",
              top: n.y - 96,
              left: 0,
              right: 0,
              alignItems: "center",
            }}
          >
            <View style={{ backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 8, paddingHorizontal: 18 }}>
              <Text style={{ color: "#fff", fontFamily: fonts.display, fontSize: 15 }}>{n.unitLabel}</Text>
            </View>
          </View>
        ) : null,
      )}

      {/* nodes */}
      {layout.map((n) => (
        <Node key={n.key} node={n} />
      ))}

      {/* mascot beside the active node */}
      {active ? (
        <View
          style={{
            position: "absolute",
            top: active.y - 30,
            left: active.x > center ? active.x - 96 : active.x + 60,
          }}
        >
          <Mascot size={74} />
        </View>
      ) : null}
    </View>
  );
}

function Node({ node }: { node: PathNode & { x: number; y: number } }) {
  const isActive = node.state === "active";
  const size = isActive ? ACTIVE_SIZE : SIZE;

  let face = colors.locked;
  let dark = colors.lockedDark;
  if (node.state === "completed") {
    face = colors.done;
    dark = colors.doneDark;
  } else if (isActive || node.state === "open") {
    face = colors.active;
    dark = colors.activeDark;
  }

  const Icon = () => {
    if (node.state === "locked") return node.kind === "chest" ? <Gift color="#fff" size={28} /> : <Lock color="#aeb6b0" size={26} />;
    if (node.state === "completed") return <Star color="#fff" fill="#fff" size={30} />;
    if (node.kind === "chest") return <Gift color="#fff" size={28} />;
    return <Play color="#fff" fill="#fff" size={28} />;
  };

  return (
    <Pressable
      disabled={node.state === "locked" || !node.onPress}
      onPress={node.onPress}
      style={{ position: "absolute", left: node.x - size / 2, top: node.y - size / 2, width: size, height: size + DEPTH, alignItems: "center" }}
    >
      {/* "התחל" callout above active node */}
      {isActive ? (
        <Bob distance={5} duration={2600} style={{ position: "absolute", top: -50, alignItems: "center", zIndex: 5 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 14, paddingVertical: 7, paddingHorizontal: 16 }}>
            <Text style={{ color: colors.primary, fontFamily: fonts.display, fontSize: 15 }}>התחל</Text>
          </View>
          <View
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: 7,
              borderRightWidth: 7,
              borderTopWidth: 8,
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderTopColor: "#fff",
            }}
          />
        </Bob>
      ) : null}

      {isActive ? <PulseRing size={size} /> : null}

      {/* 3D circular step */}
      <View style={{ position: "absolute", top: DEPTH, width: size, height: size, borderRadius: size / 2, backgroundColor: dark }} />
      <View
        style={{
          position: "absolute",
          top: 0,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: face,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon />
      </View>

      {/* star pips for completed levels */}
      {node.state === "completed" && (node.stars ?? 0) > 0 ? (
        <View style={{ position: "absolute", bottom: -2, flexDirection: "row", gap: 2 }}>
          {Array.from({ length: node.stars ?? 0 }).map((_, i) => (
            <Star key={i} color={colors.gold} fill={colors.gold} size={11} />
          ))}
        </View>
      ) : null}
    </Pressable>
  );
}
