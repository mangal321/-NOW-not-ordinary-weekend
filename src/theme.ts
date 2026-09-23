import { Platform, StyleSheet } from "react-native";

/**
 * NOW design system — "Sunrise Coastal"
 * A bright, optimistic travel aesthetic: warm off-white canvas, deep navy ink,
 * sunrise-coral accent with a deep-teal second note, soft floating cards.
 * Feels like first light on the highway out of town.
 *
 * NOTE: accent keys keep their historical `gold*` names so existing screens
 * keep working; their VALUES are the coral accent now.
 */

export const colors = {
  bg: "#FAF7F1",
  bgSoft: "#F3EEE4",
  surface: "#FFFFFF",
  surface2: "#FBF7F0",
  surface3: "#F1EADB",
  border: "#E9E0CF",
  borderSoft: "#F0EADC",
  gold: "#FF6B57", // accent (sunrise coral)
  goldDeep: "#E04E38",
  goldSoft: "rgba(255, 107, 87, 0.10)",
  goldBorder: "rgba(255, 107, 87, 0.35)",
  teal: "#0E8A7B", // secondary accent (deep coastal teal)
  tealSoft: "rgba(14, 138, 123, 0.10)",
  text: "#132A3E",
  textDim: "#3C5468",
  muted: "#5E7A8C",
  faint: "#93A8B6",
  success: "#0E8A7B",
  successSoft: "rgba(14, 138, 123, 0.12)",
  danger: "#D64545",
  dangerSoft: "rgba(214, 69, 69, 0.10)",
  overlay: "rgba(19, 42, 62, 0.45)",
  onGold: "#FFFFFF",
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 36,
  xxl: 56,
} as const;

export const type = {
  hero: 52,
  display: 38,
  title: 26,
  heading: 20,
  body: 16,
  small: 14,
  caption: 12,
  kicker: 11,
} as const;

export const shadow = {
  card: Platform.select({
    web: { boxShadow: "0 18px 44px rgba(19, 42, 62, 0.10), 0 2px 8px rgba(19, 42, 62, 0.05)" },
    default: {
      shadowColor: "#132A3E",
      shadowOpacity: 0.1,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 4,
    },
  }),
  glow: Platform.select({
    web: { boxShadow: "0 0 0 1px rgba(255,107,87,0.35), 0 10px 30px rgba(255,107,87,0.22)" },
    default: {
      shadowColor: colors.gold,
      shadowOpacity: 0.3,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
  }),
} as const;

/** Shared building blocks used across screens. */
export const common = StyleSheet.create({
  kicker: {
    color: colors.gold,
    fontSize: type.kicker,
    fontWeight: "800",
    letterSpacing: 2.4,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
