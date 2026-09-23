import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import { api } from "../src/api";
import { authToken } from "../src/session";
import { colors, common, shadow, spacing } from "../src/theme";
import { AppHeader } from "../src/components/AppHeader";
import { Button } from "../src/components/Button";

/** Rotating coastal accents for the card spines: coral, teal, sunrise amber. */
const SPINES = [
  { accent: colors.gold, soft: colors.goldSoft },
  { accent: colors.teal, soft: colors.tealSoft },
  { accent: "#F5A65B", soft: "rgba(245, 166, 91, 0.14)" },
] as const;

function TripCard({ trip, index, onPress }: { trip: any; index: number; onPress: () => void }) {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 600,
      delay: index * 110,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [index, progress]);
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [22, 0] });
  const opacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  const spine = SPINES[index % SPINES.length];
  const plan = trip.itinerary ?? {};

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open trip ${plan.trip_title ?? "saved escape"}`}
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      >
        <View style={[styles.spine, { backgroundColor: spine.accent }]} />
        <View style={[styles.blob, { backgroundColor: spine.soft }]} />

        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <Text style={styles.cardKicker}>ESCAPE 0{index + 1}</Text>
            <Text style={[styles.mark, { color: spine.accent }]}>✦</Text>
          </View>

          <View style={styles.cardMain}>
            <Text style={styles.cardTitle}>{plan.trip_title ?? "Untitled escape"}</Text>
            <Text style={[styles.destination, { color: spine.accent }]}>
              {plan.destination ?? "Somewhere with more sky"}
            </Text>
            {plan.summary ? (
              <Text style={styles.cardSummary} numberOfLines={2}>
                {plan.summary}
              </Text>
            ) : null}
          </View>

          <View style={styles.cardBottom}>
            <View>
              <Text style={styles.metaLabel}>DURATION</Text>
              <Text style={styles.metaValue}>{plan.duration_days ?? "—"} days</Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>BUDGET</Text>
              <Text style={styles.metaValue}>
                {plan.currency ?? "₹"} {plan.total_budget ?? "—"}
              </Text>
            </View>
            <View style={[styles.openChip, { backgroundColor: spine.soft }]}>
              <Text style={[styles.openArrow, { color: spine.accent }]}>↗</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function Trips() {
  const router = useRouter();
  const [trips, setTrips] = useState<any[]>([]);
  const [busy, setBusy] = useState(true);
  const token = authToken;

  const load = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    try {
      setTrips((await api.listTrips(token)).trips);
    } finally {
      setBusy(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  if (!token) return <Redirect href="/login" />;

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader active="trips" />
      <View style={styles.page}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={common.kicker}>THE COLLECTION</Text>
          <Text style={styles.heading}>Places worth leaving for.</Text>
          <Text style={styles.intro}>
            {trips.length
              ? `${trips.length} little adventure${trips.length === 1 ? "" : "s"} waiting in your pocket.`
              : "Your next story starts with a blank page."}
          </Text>

          {busy ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.gold} />
              <Text style={styles.muted}>Gathering your escapes…</Text>
            </View>
          ) : trips.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyMark}>
                <Text style={styles.emptyMarkText}>✦</Text>
              </View>
              <Text style={styles.empty}>Nothing saved yet.</Text>
              <Text style={styles.muted}>Ask the planner for somewhere with a little more sky.</Text>
              <Button
                title="Start planning"
                arrow
                onPress={() => router.push("/planner")}
                style={styles.emptyButton}
              />
            </View>
          ) : (
            trips.map((trip, index) => (
              <TripCard
                key={trip.id}
                trip={trip}
                index={index}
                onPress={() => router.push({ pathname: "/trip/[id]", params: { id: trip.id } })}
              />
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  page: { flex: 1, maxWidth: 820, width: "100%", alignSelf: "center" },
  content: { padding: spacing.lg, paddingBottom: 60 },

  heading: { color: colors.text, fontSize: 38, lineHeight: 44, fontWeight: "800", marginTop: 9 },
  intro: { color: colors.muted, fontSize: 16, lineHeight: 23, marginTop: 10, marginBottom: 25 },

  loading: { minHeight: 180, justifyContent: "center", alignItems: "center", gap: 12 },
  muted: { color: colors.muted, lineHeight: 22 },

  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...shadow.card,
    minHeight: 210,
    marginBottom: 16,
    overflow: "hidden",
  },
  cardPressed: { opacity: 0.88, transform: [{ scale: 0.995 }] },
  spine: { width: 5, borderRadius: 4, marginLeft: 18, alignSelf: "stretch", marginTop: 18, marginBottom: 18 },
  blob: {
    position: "absolute",
    top: -70,
    right: -60,
    width: 210,
    height: 210,
    borderRadius: 999,
    opacity: 0.9,
  },
  cardBody: { flex: 1, padding: 20, justifyContent: "space-between", gap: 14 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardKicker: { color: colors.faint, fontSize: 10, fontWeight: "800", letterSpacing: 1.6 },
  mark: { fontSize: 20 },
  cardMain: { gap: 2 },
  cardTitle: { color: colors.text, fontSize: 25, lineHeight: 30, fontWeight: "800" },
  destination: { fontSize: 15, fontWeight: "800", marginTop: 5 },
  cardSummary: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 9 },
  cardBottom: { flexDirection: "row", alignItems: "flex-end", gap: 28, marginTop: 12 },
  metaLabel: { color: colors.faint, fontSize: 9, fontWeight: "800", letterSpacing: 1.2 },
  metaValue: { color: colors.text, fontSize: 13, fontWeight: "800", marginTop: 3 },
  openChip: {
    marginLeft: "auto",
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  openArrow: { fontSize: 20, fontWeight: "800" },

  emptyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    borderRadius: 20,
    padding: spacing.xl,
    alignItems: "center",
    marginTop: 8,
  },
  emptyMark: {
    width: 58,
    height: 58,
    borderRadius: 999,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyMarkText: { color: colors.gold, fontSize: 26 },
  empty: { color: colors.text, fontSize: 23, fontWeight: "800", marginBottom: 7, textAlign: "center" },
  emptyButton: { marginTop: spacing.lg, minWidth: 220 },
});
