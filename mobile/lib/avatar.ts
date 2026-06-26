// Deterministic avatar colors from a name's first character.
// Soft tinted background + matching saturated text, matching the design.
const PALETTE = [
  { bg: "#dceefe", color: "#2f7fc4" },
  { bg: "#ffe6d2", color: "#d97a3a" },
  { bg: "#e3e0ff", color: "#6b5bd0" },
  { bg: "#d8f5e4", color: "#1f9e6f" },
  { bg: "#ffe0ea", color: "#d44b78" },
  { bg: "#fff0c9", color: "#cf9e1a" },
  { bg: "#d9f0f5", color: "#2c93a8" },
];

export function avatarColors(name?: string) {
  const key = name?.trim() || "?";
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}
