import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, common, radius, spacing, type } from "../theme";
import { formatMoney } from "../format";

export type Activity = {
  title: string;
  category?: string;
  time?: string;
  cost?: number;
  lat?: number;
  lng?: number;
};

export type DayPlan = {
  day_number: number;
  title?: string;
  activities?: Activity[];
};

export type Itinerary = {
  trip_title: string;
  destination?: string;
  duration_days?: number;
  currency?: string;
  total_budget?: number;
  summary?: string;
  days?: DayPlan[];
};

const CATEGORY_GLYPH: Record<string, string> = {
  food: "⬔",
  sightseeing: "◎",
  adventure: "➤",
  culture: "⬒",
  transport: "➔",
  stay: "◠",
  nightlife: "☾",
  nature: "❧",
  relaxation: "♨",
  shopping: "⬓",
};

function glyphFor(category?: string): string {
  if (!category) return "✦";
  return CATEGORY_GLYPH[category.toLowerCase()] ?? "✦";
}

type Props = {
  plan: Itinerary;
  eyebrow?: string;
  footer?: ReactNode;
};

/** Full itinerary renderer: header, day timeline, costs. Shared by planner + trip detail. */
export function ItineraryCard({ plan, eyebrow = "YOUR FIRST DRAFT", footer }: Props) {
  const currency = plan.currency ?? "USD";
  const days = plan.days ?? [];

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.headCopy}>
          <Text style={common.kicker}>{eyebrow}</Text>
          <Text style={styles.title}>{plan.trip_title}</Text>
          {plan.destination ? <Text style={styles.destination}>{plan.destination}</Text> : null}
        </View>
        <View style={styles.badges}>
          {typeof plan.total_budget === "number" ? (
            <View style={styles.budget}>
              <Text style={styles.budgetValue}>{formatMoney(currency, plan.total_budget)}</Text>
              <Text style={styles.budgetLabel}>budget</Text>
            </View>
          ) : null}
          {typeof plan.duration_days === "number" ? (
            <View style={styles.pill}>
              <Text style={styles.pillText}>
                {plan.duration_days} day{plan.duration_days === 1 ? "" : "s"}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {plan.summary ? <Text style={styles.summary}>{plan.summary}</Text> : null}

      {days.map((day) => {
        const activities = day.activities ?? [];
        const dayTotal = activities.reduce((sum, a) => sum + (a.cost ?? 0), 0);
        return (
          <View key={day.day_number} style={styles.day}>
            <View style={styles.rail}>
              <View style={styles.dayBadge}>
                <Text style={styles.dayNumber}>{String(day.day_number).padStart(2, "0")}</Text>
              </View>
              <View style={styles.railLine} />
            </View>
            <View style={styles.dayBody}>
              <Text style={styles.dayKicker}>DAY {day.day_number}</Text>
              <Text style={styles.dayTitle}>{day.title || `Day ${day.day_number}`}</Text>
              {activities.map((activity, i) => (
                <View key={`${day.day_number}-${i}`} style={styles.activity}>
                  <Text style={styles.time}>{activity.time || "––:––"}</Text>
                  <View style={styles.actGlyph}>
                    <Text style={styles.actGlyphText}>{glyphFor(activity.category)}</Text>
                  </View>
                  <View style={styles.actCopy}>
                    <Text style={styles.actTitle}>{activity.title}</Text>
                    <Text style={styles.actMeta}>
                      {activity.category || "experience"}
                      {typeof activity.cost === "number" && activity.cost > 0
                        ? ` · ${formatMoney(currency, activity.cost)}`
                        : " · on the house"}
                    </Text>
                  </View>
                </View>
              ))}
              <Text style={styles.dayTotal}>
                Day {day.day_number} total · {formatMoney(currency, dayTotal)}
              </Text>
            </View>
          </View>
        );
      })}

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  head: { flexDirection: "row", justifyContent: "space-between", gap: 14 },
  headCopy: { flex: 1 },
  title: { color: colors.text, fontSize: 24, lineHeight: 30, fontWeight: "800", marginTop: 8 },
  destination: { color: colors.gold, fontSize: type.body, fontWeight: "700", marginTop: 4 },
  badges: { alignItems: "flex-end", gap: 8 },
  budget: {
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: "flex-end",
  },
  budgetValue: { color: colors.gold, fontSize: type.small, fontWeight: "800" },
  budgetLabel: { color: colors.muted, fontSize: type.caption, marginTop: 1 },
  pill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillText: { color: colors.textDim, fontSize: type.caption, fontWeight: "600" },
  summary: {
    color: colors.muted,
    fontSize: type.small,
    lineHeight: 22,
    marginTop: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  day: { flexDirection: "row", gap: 14, marginTop: 18 },
  rail: { alignItems: "center" },
  dayBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumber: { color: colors.gold, fontSize: 12, fontWeight: "800" },
  railLine: { width: 1, flex: 1, backgroundColor: colors.border, marginTop: 8, minHeight: 24 },
  dayBody: { flex: 1, paddingBottom: 6 },
  dayKicker: { color: colors.faint, fontSize: type.caption, fontWeight: "800", letterSpacing: 1.6 },
  dayTitle: { color: colors.text, fontSize: type.body, fontWeight: "800", marginTop: 2, marginBottom: 6 },
  activity: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  time: { color: colors.gold, fontSize: type.small, fontWeight: "700", width: 52 },
  actGlyph: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  actGlyphText: { color: colors.textDim, fontSize: 14 },
  actCopy: { flex: 1 },
  actTitle: { color: colors.text, fontSize: type.small, fontWeight: "700" },
  actMeta: { color: colors.faint, fontSize: type.caption, marginTop: 2 },
  dayTotal: { color: colors.muted, fontSize: type.caption, fontWeight: "600", marginTop: 6 },
  footer: { marginTop: spacing.md, gap: 10 },
});
