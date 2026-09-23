import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
const TILE = 256;
const MIN_Z = 3;
const MAX_Z = 16;

/** Slippy-map tile math (Web Mercator), as used by OpenStreetMap. */
function lngToTileX(lng: number, z: number): number {
  return ((lng + 180) / 360) * Math.pow(2, z);
}

function latToTileY(lat: number, z: number): number {
  const s = Math.sin((lat * Math.PI) / 180);
  return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * Math.pow(2, z);
}

type Stop = { title: string; day: number; lat: number; lng: number };

export default function MapView() {
  const router = useRouter();
  const [trips, setTrips] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [busy, setBusy] = useState(true);
  const [zoom, setZoom] = useState(12);
  const [panel, setPanel] = useState({ w: 0, h: 0 });
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

  const stops: Stop[] = selected
    ? (selected.itinerary.days || [])
        .flatMap((day: any) =>
          (day.activities || []).map((activity: any) => ({ ...activity, day: day.day_number }))
        )
        .filter((activity: any) => activity.lat != null && activity.lng != null)
        .map((activity: any) => ({
          title: activity.title,
          day: Number(activity.day) || 1,
          lat: Number(activity.lat),
          lng: Number(activity.lng),
        }))
    : [];

  // Map center: average of stops (stable per selected trip).
  const center = useMemo<{ lat: number; lng: number }>(() => {
    if (stops.length === 0) return { lat: 18.5204, lng: 73.8567 }; // default: Pune
    return {
      lat: stops.reduce((total, stop) => total + stop.lat, 0) / stops.length,
      lng: stops.reduce((total, stop) => total + stop.lng, 0) / stops.length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const centerTileX = lngToTileX(center.lng, zoom);
  const centerTileY = latToTileY(center.lat, zoom);
  const topLeftX = centerTileX - panel.w / (2 * TILE);
  const topLeftY = centerTileY - panel.h / (2 * TILE);
  const maxIndex = Math.pow(2, zoom);

  const tiles: { key: string; url: string; left: number; top: number }[] = [];
  if (panel.w > 0 && panel.h > 0) {
    for (let ty = Math.floor(topLeftY); ty <= Math.floor(topLeftY + panel.h / TILE); ty++) {
      if (ty < 0 || ty >= maxIndex) continue;
      for (let tx = Math.floor(topLeftX); tx <= Math.floor(topLeftX + panel.w / TILE); tx++) {
        const wrapped = ((tx % maxIndex) + maxIndex) % maxIndex;
        tiles.push({
          key: `${zoom}/${tx}/${ty}`,
          url: `https://tile.openstreetmap.org/${zoom}/${wrapped}/${ty}.png`,
          left: (tx - topLeftX) * TILE,
          top: (ty - topLeftY) * TILE,
        });
      }
    }
  }

  function zoomBy(delta: number) {
    setZoom((current) => Math.min(MAX_Z, Math.max(MIN_Z, current + delta)));
  }

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
            <Text style={styles.heading}>Every stop, on the ground.</Text>

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

            <View style={styles.map} onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setPanel({ w: width, h: height });
            }}>
              {tiles.map((tile) => (
                <Image
                  key={tile.key}
                  source={{ uri: tile.url, width: TILE, height: TILE }}
                  style={[styles.tile, { left: tile.left, top: tile.top }]}
                />
              ))}

              {stops.map((stop, index) => {
                const pinColor = PINS[(stop.day - 1 || index) % PINS.length];
                const left = (lngToTileX(stop.lng, zoom) - topLeftX) * TILE - 15;
                const top = (latToTileY(stop.lat, zoom) - topLeftY) * TILE - 15;
                return (
                  <View
                    key={`${stop.day}-${stop.title}`}
                    style={[styles.pin, { left, top, backgroundColor: pinColor }]}
                  >
                    <Text style={styles.pinText}>{stop.day}</Text>
                  </View>
                );
              })}

              <View style={styles.zoomStack}>
                <Pressable accessibilityRole="button" accessibilityLabel="Zoom in" onPress={() => zoomBy(1)} style={styles.zoomButton}>
                  <Text style={styles.zoomText}>+</Text>
                </Pressable>
                <View style={styles.zoomDivider} />
                <Pressable accessibilityRole="button" accessibilityLabel="Zoom out" onPress={() => zoomBy(-1)} style={styles.zoomButton}>
                  <Text style={styles.zoomText}>−</Text>
                </Pressable>
              </View>

              <View style={styles.attribution}>
                <Text style={styles.attributionText}>© OpenStreetMap contributors</Text>
              </View>

              {stops.length === 0 ? (
                <View style={styles.mapEmptyWrap}>
                  <Text style={styles.mapEmpty}>This plan has no pinned stops yet.</Text>
                </View>
              ) : null}
            </View>

            <View style={[styles.map, styles.listPanel]}>
              <View style={styles.mapGlow} />
              <View style={styles.mapHead}>
                <Text style={styles.mapTitle}>{selected.itinerary.destination}</Text>
                <Text style={styles.mapSub}>{stops.length} stops with coordinates</Text>
              </View>
              {stops.map((stop, index) => {
                const pinColor = PINS[(stop.day - 1 || index) % PINS.length];
                return (
                  <View key={`${stop.day}-${stop.title}`} style={styles.stop}>
                    <View style={[styles.stopPin, { backgroundColor: pinColor }]}>
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
              })}
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
    height: 400,
    backgroundColor: colors.surface3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: "hidden",
    ...shadow.card,
  },
  tile: { position: "absolute", width: TILE, height: TILE },
  pin: {
    position: "absolute",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
    ...shadow.card,
  },
  pinText: { color: "#fff", fontWeight: "800", fontSize: 13 },

  zoomStack: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: "hidden",
  },
  zoomButton: { width: 38, height: 34, alignItems: "center", justifyContent: "center" },
  zoomDivider: { height: 1, backgroundColor: colors.borderSoft },
  zoomText: { color: colors.text, fontSize: 19, fontWeight: "800", lineHeight: 22 },

  attribution: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(250, 247, 241, 0.85)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderTopLeftRadius: 8,
  },
  attributionText: { color: colors.muted, fontSize: 9, fontWeight: "600" },
  mapEmptyWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  mapEmpty: {
    color: colors.textDim,
    fontSize: 15,
    fontWeight: "700",
    backgroundColor: "rgba(250, 247, 241, 0.92)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },

  listPanel: { height: undefined, marginTop: 16, padding: 20 },
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
  stopPin: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  stopCopy: { flex: 1 },
  stopTitle: { color: colors.text, fontWeight: "700" },
  stopMeta: { color: colors.muted, fontSize: 12, marginTop: 3 },
  stopArrow: { fontSize: 17, fontWeight: "800" },
});
