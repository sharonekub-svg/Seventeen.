// Design tokens for the "מסלול" green/white, playful, 3D look.
// Ported from the Claude Design handoff (Maslul). Light theme, RTL-first.

export const colors = {
  // Surfaces
  bg: "#f4f8f4",
  bgSoft: "#f6fbf7",
  surface: "#ffffff",
  surfaceAlt: "#eef2ef",
  inputBg: "#f7faf8",

  // Brand green
  primary: "#1f9e6f",
  primaryDark: "#167150", // 3D "step" shadow under primary buttons
  primaryText: "#ffffff",
  active: "#23ad7b",
  activeDark: "#15815a",
  done: "#2bbe84",
  doneDark: "#1c8a5f",
  success: "#2bbe84",

  // Path sky gradient (top -> hill)
  sky: ["#cfeeff", "#dcf3e6", "#bfe7ad", "#a3dd92"] as const,

  // Locked node
  locked: "#d3dad5",
  lockedDark: "#b9c2bc",

  // Borders
  border: "#eef2ef",
  borderInput: "#e7ece8",
  borderShadow: "#e9efea", // soft 3D step on white cards

  // Text
  text: "#3c463f",
  textBody: "#4b554d",
  textMid: "#5b655d",
  textMuted: "#8a948d",
  textSoft: "#9aa39d",
  textFaint: "#b7c0ba",

  // Accents
  streak: "#ff8a3d",
  streakBorder: "#ffe6cf",
  streakShadow: "#f3d9c0",
  xp: "#f0a500",
  xpBorder: "#ffe9bf",
  xpShadow: "#f3deaf",
  heart: "#ff5a6a",
  heartBorder: "#ffd6d9",
  heartShadow: "#f3c2c6",
  freeze: "#3a86ff",
  purple: "#a06bff",
  gold: "#ffc83d",

  // Wrong / danger
  danger: "#ff5a6a",
  dangerDark: "#d83f49",

  // Mascot (fox)
  foxDark: "#ef9a44",
  fox: "#f2a253",
  foxBelly: "#ffffff",
  foxEye: "#33312f",
};

export const fonts = {
  display: "VarelaRound_400Regular",
  body: "Heebo_400Regular",
  medium: "Heebo_500Medium",
  bold: "Heebo_700Bold",
  extrabold: "Heebo_800ExtraBold",
  black: "Heebo_900Black",
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 8, md: 14, lg: 18, xl: 24, pill: 999 };

// Reusable 3D press feedback: a solid bottom "step" via shadow color.
export function step3d(color: string, depth = 4) {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: depth },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: depth,
  };
}
