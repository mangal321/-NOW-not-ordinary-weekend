import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, radius } from "../theme";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  arrow?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
};

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  arrow = false,
  style,
  accessibilityLabel,
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.onGold : colors.gold} />
      ) : (
        <Text style={[styles.text, textStyleFor(variant)]}>
          {title}
          {arrow ? "  →" : ""}
        </Text>
      )}
    </Pressable>
  );
}

function textStyleFor(variant: Variant) {
  switch (variant) {
    case "primary":
      return styles.primaryText;
    case "secondary":
      return styles.secondaryText;
    case "ghost":
      return styles.ghostText;
    case "danger":
      return styles.dangerText;
  }
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    flexDirection: "row",
  },
  primary: { backgroundColor: colors.gold },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: { backgroundColor: "transparent" },
  danger: { backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: colors.danger },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.5 },
  text: { fontSize: 16, fontWeight: "700" },
  primaryText: { color: colors.onGold },
  secondaryText: { color: colors.text },
  ghostText: { color: colors.muted },
  dangerText: { color: colors.danger },
});
