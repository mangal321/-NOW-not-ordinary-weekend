import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, type } from "../theme";
import { Button } from "./Button";

type Props = {
  glyph: string;
  title: string;
  body: string;
  actionTitle?: string;
  onAction?: () => void;
};

export function EmptyState({ glyph, title, body, actionTitle, onAction }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.orb}>
        <Text style={styles.glyph}>{glyph}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {actionTitle && onAction ? (
        <Button title={actionTitle} arrow onPress={onAction} style={styles.cta} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
  },
  orb: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  glyph: { color: colors.gold, fontSize: 30 },
  title: { color: colors.text, fontSize: type.heading, fontWeight: "800", textAlign: "center" },
  body: { color: colors.muted, fontSize: type.small, lineHeight: 21, textAlign: "center", marginTop: 8, maxWidth: 380 },
  cta: { marginTop: spacing.md },
});
