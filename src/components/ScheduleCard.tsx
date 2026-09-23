import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, shadow, spacing } from "../theme";

/**
 * ScheduleCard — compact time-range card (Scheduling-2 pattern):
 * a start select, an end select, and a wrap-around duration chip set.
 * Ported natively to the NOW design system (no shadcn/Tailwind runtime here).
 */

export type TripWindow = {
  start: string;
  end: string;
  duration: string;
};

export const DEFAULT_TRIP_WINDOW: TripWindow = {
  start: "Sat morning",
  end: "Sun evening",
  duration: "2 days",
};

const STARTS = ["Fri evening", "Sat morning", "Sat afternoon"] as const;
const ENDS = [
  { label: "Sat night", duration: "Same day" },
  { label: "Sun morning", duration: "1 night" },
  { label: "Sun evening", duration: "2 days" },
  { label: "Mon morning", duration: "Long weekend" },
] as const;
const DURATIONS = ["Same day", "1 night", "2 days", "Long weekend"] as const;

type Props = {
  value: TripWindow;
  onChange: (value: TripWindow) => void;
};

export function ScheduleCard({ value, onChange }: Props) {
  function pickStart(start: string) {
    onChange({ ...value, start });
  }

  function pickEnd(end: string) {
    const match = ENDS.find((item) => item.label === end);
    onChange({ ...value, end, duration: match ? match.duration : value.duration });
  }

  function pickDuration(duration: string) {
    const match = ENDS.find((item) => item.duration === duration);
    if (match) onChange({ ...value, end: match.label, duration });
  }

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.kicker}>TRIP WINDOW</Text>
        <Text style={styles.hint}>◈ tap to set</Text>
      </View>

      <Text style={styles.label}>Leaving</Text>
      <View style={styles.row}>
        {STARTS.map((start) => {
          const isSelected = value.start === start;
          return (
            <Pressable
              key={start}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Leave ${start}`}
              onPress={() => pickStart(start)}
              style={[styles.select, isSelected && styles.selectActive]}
            >
              <Text style={isSelected ? styles.selectTextActive : styles.selectText}>{start}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Returning</Text>
      <View style={styles.row}>
        {ENDS.map((item) => {
          const isSelected = value.end === item.label;
          return (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Return ${item.label}`}
              onPress={() => pickEnd(item.label)}
              style={[styles.select, isSelected && styles.selectActive]}
            >
              <Text style={isSelected ? styles.selectTextActive : styles.selectText}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Duration</Text>
      <View style={styles.chipWrap}>
        {DURATIONS.map((duration) => {
          const isSelected = value.duration === duration;
          return (
            <Pressable
              key={duration}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Duration ${duration}`}
              onPress={() => pickDuration(duration)}
              style={[styles.chip, isSelected && styles.chipActive]}
            >
              <Text style={isSelected ? styles.chipTextActive : styles.chipText}>{duration}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {value.start} → {value.end} · {value.duration}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 20,
    padding: spacing.md,
    ...shadow.card,
  },

  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  kicker: { color: colors.gold, fontSize: 11, fontWeight: "800", letterSpacing: 2.2 },
  hint: { color: colors.faint, fontSize: 11, fontWeight: "600" },

  label: {
    color: colors.faint,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginTop: 12,
    marginBottom: 7,
  },

  row: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  select: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface2,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  selectActive: { backgroundColor: colors.text, borderColor: colors.text },
  selectText: { color: colors.textDim, fontSize: 13, fontWeight: "600" },
  selectTextActive: { color: "#fff", fontSize: 13, fontWeight: "700" },

  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  chip: {
    borderWidth: 1,
    borderColor: colors.goldBorder,
    backgroundColor: colors.goldSoft,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipText: { color: colors.goldDeep, fontSize: 13, fontWeight: "700" },
  chipTextActive: { color: "#fff", fontSize: 13, fontWeight: "800" },

  summary: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    flexDirection: "row",
    alignItems: "center",
  },
  summaryText: { color: colors.teal, fontWeight: "800", fontSize: 13, letterSpacing: 0.3 },
});
