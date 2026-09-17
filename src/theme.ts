import { Platform, StyleSheet } from "react-native";

/**
 * NOW design system — "Dark Premium"
 * A luxury travel-magazine aesthetic: deep ink backgrounds, warm gold accents,
 * generous spacing and crisp typography.
 */

export const colors = {
  bg: "#0A0C10",
  bgSoft: "#0E1219",
  surface: "#141A25",
  surface2: "#1B2331",
  surface3: "#232D3F",
  border: "#232D3F",
  borderSoft: "#1A2230",
  gold: "#E2A63B",
  goldDeep: "#B97F22",
  goldSoft: "rgba(226, 166, 59, 0.12)",
  goldBorder: "rgba(226, 166, 59, 0.35)",
  text: "#F5F1E6",
  textDim: "#C9CFD9",
  muted: "#98A1B3",
  faint: "#5F6A7E",
  success: "#57B981",
  successSoft: "rgba(87, 185, 129, 0.12)",
  danger: "#E0605E",
  dangerSoft: "rgba(224, 96, 94, 0.12)",
  overlay: "rgba(4, 6, 10, 0.72)",
  onGold: "#151006",
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
    web: { boxShadow: "0 24px 60px rgba(0, 0, 0, 0.45)" },
    default: {
      shadowColor: "#000",
      shadowOpacity: 0.45,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 8,
    },
  }),
  glow: Platform.select({
    web: { boxShadow: "0 0 0 1px rgba(226,166,59,0.35), 0 8px 32px rgba(226,166,59,0.18)" },
    default: {
      shadowColor: colors.gold,
      shadowOpacity: 0.25,
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
