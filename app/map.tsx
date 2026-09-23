import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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

/** Pin colors rotate through the coastal trio, matching trip cards. */
const PINS = [colors.gold, colors.teal, "#F5A65B"] as const;

export default function MapView() {
  const router = useRouter();
  const [trips, setTrips] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [busy, setBusy] = useState(true);
  const token = authToken;

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const result = await api.listTrips(token);
      setTrips(result.trips);
      setSelected(result.trips[0] || null);
    } finally {
      setBusy(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  if (!token) return <Redirect href="/login" />;

  const stops = selected
    ? (selected.itinerary.days || [])
        .flatMap((day: any) => (day.activities || []).map((activity: any) => ({ ...activity, day: day.day_number })))
        .filter((activity: any) => activity.lat != null && activity.lng != null)
    : [];

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader active="map" />
      <View style={styles.page}>
        {busy ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.gold} />
            <Text style={styles.muted}>Plotting your escapes…</Text>
          </View>
        ) : !selected ? (
          <View style={styles.center}>
            <View style={styles.emptyMark}>
              <Text style={styles.emptyMarkText}>◈</Text>
            </View>
            <Text style={styles.emptyTitle}>No map to draw yet.</Text>
            <Text style={styles.muted}>Save a trip and its stops will land here.</Text>
            <Button title="Plan a trip" arrow onPress={() => router.push("/planner")} style={styles.emptyButton} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={common.kicker}>THE MAP</Text>
            <Text style={styles.heading}>Every stop, one glance.</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {trips.map((trip) => {
                const isActive = selected.id === trip.id;
                return (
                  <Pressable
                    key={trip.id}
                    onPress={() => setSelected(trip)}
                    accessibilityRole="button"
                    style={[styles.chip, isActive && styles.chipActive]}
                  >
                    <Text style={isActive ? styles.chipTextActive : styles.chipText}>
                      {trip.itinerary.destination}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.map}>
              <View style={styles.mapGlow} />
              <View style={styles.mapHead}>
                <Text style={styles.mapTitle}>{selected.itinerary.destination}</Text>
                <Text style={styles.mapSub}>{stops.length} stops with coordinates</Text>
              </View>
              {stops.length === 0 ? (
                <Text style={styles.mapEmpty}>This plan has no pinned stops yet.</Text>
              ) : (
                stops.map((stop: any, index: number) => {
                  const pinColor = PINS[(Number(stop.day) - 1 || index) % PINS.length];
                  return (
                    <View key={`${stop.day}-${stop.title}`} style={styles.stop}>
                      <View style={[styles.pin, { backgroundColor: pinColor }]}>
                        <Text style={styles.pinText}>{stop.day}</Text>
                      </View>
                      <View style={styles.stopCopy}>
                        <Text style={styles.stopTitle}>{stop.title}</Text>
                        <Text style={styles.stopMeta}>
                          Day {stop.day} · {stop.lat.toFixed(3)}, {stop.lng.toFixed(3)}
                        </Text>
                      </View>
                      <Text style={[styles.stopArrow, { color: pinColor }]}>↗</Text>
                    </View>
                  );
                })
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  page: { flex: 1, maxWidth: 760, width: "100%", alignSelf: "center" },

  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, gap: 8 },
  muted: { color: colors.muted, fontSize: 15, lineHeight: 22, textAlign: "center" },
  emptyMark: {
    width: 58,
    height: 58,
    borderRadius: 999,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  emptyMarkText: { color: colors.gold, fontSize: 24 },
  emptyTitle: { color: colors.text, fontSize: 22, fontWeight: "800" },
  emptyButton: { marginTop: spacing.md, minWidth: 200 },

  content: { padding: spacing.lg, paddingBottom: 60 },
  heading: { color: colors.text, fontSize: 34, lineHeight: 40, fontWeight: "800", marginTop: 9, marginBottom: 18 },

  chips: { gap: 8, paddingBottom: 18 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipText: { color: colors.textDim, fontWeight: "600" },
  chipTextActive: { color: "#fff", fontWeight: "700" },

  map: {
    minHeight: 420,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: "hidden",
    ...shadow.card,
  },
  mapGlow: {
    position: "absolute",
    top: -110,
    right: -90,
    width: 300,
    height: 300,
    borderRadius: 999,
    backgroundColor: colors.tealSoft,
  },
  mapHead: { marginBottom: 20, gap: 4 },
  mapTitle: { color: colors.text, fontSize: 26, fontWeight: "800" },
  mapSub: { color: colors.teal, fontSize: 13, fontWeight: "700", letterSpacing: 0.4 },
  mapEmpty: { color: colors.muted, fontSize: 15, lineHeight: 22, paddingVertical: 18 },
  stop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  pin: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  pinText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  stopCopy: { flex: 1 },
  stopTitle: { color: colors.text, fontWeight: "700" },
  stopMeta: { color: colors.muted, fontSize: 12, marginTop: 3 },
  stopArrow: { fontSize: 17, fontWeight: "800" },
});
