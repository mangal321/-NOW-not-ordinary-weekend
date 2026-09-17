import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { api } from "../src/api";
import { authToken } from "../src/session";
import { colors, common, radius, spacing, type } from "../src/theme";
import { Button } from "../src/components/Button";
import { Screen } from "../src/components/Screen";

const OPTIONS = [
  { value: "beaches", label: "Beaches", glyph: "◠" },
  { value: "mountains", label: "Mountains", glyph: "▲" },
  { value: "food", label: "Food & cafés", glyph: "⬔" },
  { value: "culture", label: "Culture", glyph: "⬒" },
  { value: "adventure", label: "Adventure", glyph: "➤" },
  { value: "nightlife", label: "Nightlife", glyph: "☾" },
  { value: "nature", label: "Nature", glyph: "❧" },
  { value: "history", label: "History", glyph: "◫" },
  { value: "shopping", label: "Shopping", glyph: "⬓" },
  { value: "relaxation", label: "Slow & cozy", glyph: "♨" },
  { value: "road-trips", label: "Road trips", glyph: "➔" },
  { value: "photography", label: "Photography", glyph: "◎" },
];

export default function Interests() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!authToken) return <Redirect href="/login" />;

  function toggle(value: string) {
    setSelected((current) =>
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    );
  }

  async function save() {
    if (!authToken) return;
    setBusy(true);
    setError("");
    try {
      await api.updateMe(authToken, { interests: selected });
      router.replace("/planner");
    } catch (value) {
      setError(value instanceof Error ? value.message : "Could not save. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen maxWidth={720}>
      <View style={styles.page}>
        <Text style={common.kicker}>ALMOST THERE · STEP 2 OF 2</Text>
        <Text style={styles.title}>What makes a weekend perfect for you?</Text>
        <Text style={styles.sub}>
          Pick a few — NOW will shape every itinerary around them. You can change these anytime in your profile.
        </Text>
        <View style={styles.grid}>
          {OPTIONS.map((opt) => {
            const active = selected.includes(opt.value);
            return (
              <Pressable
                key={opt.value}
                accessibilityRole="button"
                accessibilityLabel={opt.label}
                onPress={() => toggle(opt.value)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.glyph, active && styles.glyphActive]}>{opt.glyph}</Text>
                <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          title={selected.length ? `Continue with ${selected.length} interest${selected.length === 1 ? "" : "s"}` : "Continue"}
          arrow
          loading={busy}
          onPress={save}
          style={styles.cta}
        />
        <Button title="Skip for now" variant="ghost" onPress={() => router.replace("/planner")} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, justifyContent: "center", paddingVertical: spacing.xl },
  title: { color: colors.text, fontSize: 32, fontWeight: "800", lineHeight: 38, marginTop: 10 },
  sub: { color: colors.muted, fontSize: type.body, lineHeight: 24, marginTop: 10, marginBottom: spacing.lg },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chipActive: { backgroundColor: colors.goldSoft, borderColor: colors.goldBorder },
  glyph: { color: colors.faint, fontSize: 15 },
  glyphActive: { color: colors.gold },
  label: { color: colors.textDim, fontSize: type.small, fontWeight: "600" },
  labelActive: { color: colors.text },
  error: { color: colors.danger, fontSize: type.small, marginTop: 14 },
  cta: { marginTop: spacing.lg, width: "100%" },
});
