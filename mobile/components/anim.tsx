// Animation primitives for the playful UI, rebuilt on RN Animated.
// (The design prototype used CSS @keyframes; these are the native equivalents.)
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, StyleProp, ViewStyle } from "react-native";
import { colors } from "@/lib/theme";

/** Gentle up/down float — used by the mascot, callouts, hint bubbles. */
export function Bob({
  children,
  distance = 7,
  duration = 2800,
  style,
}: {
  children: React.ReactNode;
  distance?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: duration / 2, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: duration / 2, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v, duration]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [0, -distance] });
  return <Animated.View style={[style, { transform: [{ translateY }] }]}>{children}</Animated.View>;
}

/** Expanding glow ring behind the active level node. */
export function PulseRing({ size, color = colors.active }: { size: number; color?: string }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(v, { toValue: 1, duration: 2000, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] });
  const opacity = v.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.5, 0, 0] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

/** A repeating scale "heartbeat" — used to make the streak flame feel alive. */
export function Heartbeat({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 600, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.delay(900),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  return <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>;
}

/** Horizontal shake — trigger it on a wrong answer. */
export function useShake() {
  const x = useRef(new Animated.Value(0)).current;
  const trigger = () => {
    x.setValue(0);
    Animated.sequence([
      Animated.timing(x, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(x, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(x, { toValue: 0.6, duration: 60, useNativeDriver: true }),
      Animated.timing(x, { toValue: -0.4, duration: 60, useNativeDriver: true }),
      Animated.timing(x, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };
  const translateX = x.interpolate({ inputRange: [-1, 1], outputRange: [-9, 9] });
  return { style: { transform: [{ translateX }] }, trigger };
}

/** One-shot pop/scale-in for cards. */
export function PopIn({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 320, delay, easing: Easing.out(Easing.back(1.6)), useNativeDriver: true }).start();
  }, [v, delay]);
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  return <Animated.View style={[style, { opacity: v, transform: [{ scale }] }]}>{children}</Animated.View>;
}

type Piece = { left: string; size: number; color: string; round: boolean; delay: number; duration: number; rot: number };

/** Falling confetti burst — render while showConfetti is true. */
export function Confetti({ count = 44, height = 700 }: { count?: number; height?: number }) {
  const pieces = useMemo<Piece[]>(() => {
    const cols = ["#ffc83d", "#2bbe84", "#ff5a7a", "#3aa0ff", "#ff8a3d", "#a06bff"];
    return Array.from({ length: count }, () => ({
      left: `${(Math.random() * 100).toFixed(1)}%`,
      size: 6 + Math.random() * 7,
      color: cols[Math.floor(Math.random() * cols.length)],
      round: Math.random() > 0.5,
      delay: Math.random() * 350,
      duration: 1000 + Math.random() * 700,
      rot: 300 + Math.random() * 360,
    }));
  }, [count]);

  return (
    <>
      {pieces.map((p, i) => (
        <ConfettiPiece key={i} piece={p} height={height} />
      ))}
    </>
  );
}

function ConfettiPiece({ piece, height }: { piece: Piece; height: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: piece.duration, delay: piece.delay, easing: Easing.in(Easing.quad), useNativeDriver: true }).start();
  }, [v, piece]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [-24, height] });
  const rotate = v.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${piece.rot}deg`] });
  const opacity = v.interpolate({ inputRange: [0, 0.12, 0.85, 1], outputRange: [0, 1, 1, 0] });
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: piece.left as any,
        width: piece.size,
        height: piece.size * 1.4,
        backgroundColor: piece.color,
        borderRadius: piece.round ? piece.size : 2,
        opacity,
        transform: [{ translateY }, { rotate }],
      }}
    />
  );
}

/** Bottom sheet that slides up on mount. */
export function SheetUp({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [v]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [400, 0] });
  return <Animated.View style={[style, { transform: [{ translateY }] }]}>{children}</Animated.View>;
}
