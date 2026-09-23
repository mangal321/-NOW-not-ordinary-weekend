import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "../../src/api";
import { authToken } from "../../src/session";
import { colors, common, shadow, spacing } from "../../src/theme";
import { Button } from "../../src/components/Button";

/** Day chips rotate through the coastal trio, matching trips and map. */
const DAY_ACCENTS = [colors.gold, colors.teal, "#F5A65B"] as const;

export default function TripDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(true);

  const load = useCallback(async () => {
    if (!authToken || !id) return;
    setBusy(true);
    try {
      const [tripResult, expenseResult] = await Promise.all([api.getTrip(authToken, id), api.listExpenses(authToken, id)]);
      setTrip(tripResult);
      setExpenses(expenseResult.expenses);
    } finally {
      setBusy(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function addExpense() {
    const value = Number(amount);
    if (!authToken || !id || !value || value <= 0) return;
    await api.addExpense(authToken, id, { category: "other", amount: value, note });
    setAmount("");
    setNote("");
    load();
  }

  async function remove() {
    if (authToken && id) {
      await api.deleteTrip(authToken, id);
      router.replace("/trips");
    }
  }

  if (busy) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} />
        </View>
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Trip not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const plan = trip.itinerary;
  const spent = expenses.reduce((total, item) => total + Number(item.amount), 0);
  const total = Number(plan.total_budget) || 0;
  const pct = total > 0 ? Math.min(100, Math.round((spent / total) * 100)) : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.back}>← Back to trips</Text>
        </Pressable>

        <Text style={common.kicker}>THE ESCAPE</Text>
        <Text style={styles.title}>{plan.trip_title}</Text>
        <Text style={styles.destination}>
          {plan.destination} · {plan.duration_days} days · {plan.currency} {plan.total_budget}
        </Text>
        <Text style={styles.summary}>{plan.summary}</Text>

        {(plan.days || []).map((day: any, dayIndex: number) => {
          const accent = DAY_ACCENTS[dayIndex % DAY_ACCENTS.length];
          return (
            <View key={day.day_number} style={styles.day}>
              <View style={[styles.dayChip, { backgroundColor: accent }]}>
                <Text style={styles.dayChipText}>{day.day_number}</Text>
              </View>
              <View style={styles.dayCopy}>
                <Text style={styles.dayTitle}>{day.title}</Text>
                {(day.activities || []).map((activity: any) => (
                  <View key={activity.title} style={styles.activity}>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                    <Text style={styles.activityLine}>
                      {activity.title}
                      {activity.cost ? (
                        <Text style={styles.activityCost}> · {plan.currency} {activity.cost}</Text>
                      ) : null}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        <View style={styles.budget}>
          <View style={styles.budgetGlow} />
          <Text style={styles.section}>Budget</Text>
          <Text style={styles.total}>
            {plan.currency} {spent.toFixed(2)} spent of {plan.total_budget} · {pct}%
          </Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%` }]} />
          </View>
          <TextInput
            accessibilityLabel="Expense amount"
            placeholder="Expense amount"
            placeholderTextColor={colors.faint}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            style={styles.input}
          />
          <TextInput
            accessibilityLabel="Expense note"
            placeholder="What was it?"
            placeholderTextColor={colors.faint}
            value={note}
            onChangeText={setNote}
            style={styles.input}
          />
          <Button title="Add expense" onPress={addExpense} style={styles.addButton} />
          {expenses.map((expense) => (
            <View key={expense.id} style={styles.expenseRow}>
              <Text style={styles.expenseDot}>•</Text>
              <Text style={styles.expense}>
                {expense.note || expense.category} · {plan.currency} {expense.amount}
              </Text>
            </View>
          ))}
        </View>

        <Pressable onPress={remove} accessibilityRole="button" style={styles.deleteButton}>
          <Text style={styles.delete}>Delete this trip</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  emptyText: { color: colors.muted, fontSize: 17 },
  content: { padding: spacing.lg, paddingBottom: 60, maxWidth: 760, width: "100%", alignSelf: "center" },

  back: { color: colors.muted, fontWeight: "700", marginBottom: spacing.xl, fontSize: 14 },

  title: { color: colors.text, fontSize: 34, lineHeight: 40, fontWeight: "800", marginTop: 8 },
  destination: { color: colors.gold, fontWeight: "800", marginTop: 8, fontSize: 15 },
  summary: { color: colors.muted, lineHeight: 23, marginTop: 14 },

  day: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 18,
    padding: spacing.md,
    marginTop: 14,
    ...shadow.card,
  },
  dayChip: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 2 },
  dayChipText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  dayCopy: { flex: 1, gap: 9 },
  dayTitle: { color: colors.text, fontWeight: "800", fontSize: 16 },
  activity: { flexDirection: "row", gap: 10, alignItems: "baseline" },
  activityTime: { color: colors.faint, fontSize: 12, fontWeight: "700", minWidth: 64 },
  activityLine: { color: colors.textDim, fontSize: 14, lineHeight: 21, flex: 1 },
  activityCost: { color: colors.teal, fontWeight: "700" },

  budget: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderWidth: 1,
    borderRadius: 20,
    padding: spacing.lg,
    marginTop: 18,
    overflow: "hidden",
    ...shadow.card,
  },
  budgetGlow: {
    position: "absolute",
    top: -90,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: colors.goldSoft,
  },
  section: { color: colors.text, fontSize: 20, fontWeight: "800" },
  total: { color: colors.teal, marginTop: 6, marginBottom: 12, fontWeight: "700" },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.surface3, overflow: "hidden", marginBottom: 6 },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.gold },
  input: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    backgroundColor: colors.surface2,
    color: colors.text,
    fontSize: 15,
  },
  addButton: { marginTop: 12 },
  expenseRow: { flexDirection: "row", gap: 8, marginTop: 12, alignItems: "baseline" },
  expenseDot: { color: colors.gold, fontWeight: "800" },
  expense: { color: colors.muted, flex: 1 },

  deleteButton: { alignItems: "center", marginTop: spacing.xl, paddingBottom: 30, padding: 8 },
  delete: { color: colors.danger, fontWeight: "700" },
});
