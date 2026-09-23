import { ReactNode, useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import { api } from "../src/api";
import { authToken } from "../src/session";
import { colors, common, radius, spacing, type } from "../src/theme";
import { AppHeader } from "../src/components/AppHeader";
import BorderGlow from "../src/components/BorderGlow";
import { Button } from "../src/components/Button";
import { Itinerary, ItineraryCard } from "../src/components/ItineraryCard";
import { ScheduleCard, TripWindow, DEFAULT_TRIP_WINDOW } from "../src/components/ScheduleCard";
import { ThinkingCard } from "../src/components/ThinkingCard";

const QUICK_PROMPTS = [
  { label: "Hill escape", prompt: "2 days in Mahabaleshwar for a couple under INR 10,000" },
  { label: "Food weekend", prompt: "A food-focused weekend in Tokyo under $900" },
  { label: "Beach reset", prompt: "A relaxed 3-day beach trip with good sunsets" },
  { label: "Culture dive", prompt: "A culture-packed 2-day weekend in Jaipur under ₹15,000" },
];

function FadeIn({ id, children }: { id: number; children: ReactNode }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    anim.setValue(0);
    const run = Animated.timing(anim, { toValue: 1, duration: 450, useNativeDriver: true });
    run.start();
    return () => run.stop();
  }, [anim, id]);
  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

export default function Planner() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [plan, setPlan] = useState<Itinerary | null>(null);
  const [planId, setPlanId] = useState(0);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [tripWindow, setTripWindow] = useState<TripWindow>(DEFAULT_TRIP_WINDOW);

  if (!authToken) return <Redirect href="/login" />;

  async function send(override?: string) {
    const base = (override ?? message).trim();
    if (!authToken || !base || busy) return;
    const text = `${base} (leave ${tripWindow.start}, return ${tripWindow.end} — ${tripWindow.duration.toLowerCase()})`;
    setBusy(true);
    setError("");
    setReply("");
    setPlan(null);
    setSaved(false);
    try {
      const result = await api.chat(authToken, `session-${Date.now()}`, text);
      setReply(result.reply);
      setPlan(result.itinerary as Itinerary);
      setPlanId((n) => n + 1);
    } catch (value) {
      setError(value instanceof Error ? value.message : "The concierge is unavailable right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function surprise() {
    const pick = QUICK_PROMPTS[Math.floor(Math.random() * QUICK_PROMPTS.length)];
    setMessage(pick.prompt);
    send(pick.prompt);
  }

  async function saveTrip() {
    if (!authToken || !plan || saving || saved) return;
    setSaving(true);
    setError("");
    try {
      await api.createTrip(authToken, plan);
      setSaved(true);
    } catch (value) {
      setError(value instanceof Error ? value.message : "Could not save this trip. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader active="plan" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.inner}>
          {/* Hero */}
          <Text style={common.kicker}>THE ESCAPE DESK</Text>
          <Text style={styles.title}>Where to this weekend?</Text>
          <Text style={styles.subtitle}>
            Describe the vibe — destination, people, budget — and NOW drafts a
            day-by-day escape in seconds.
          </Text>

          {/* Quick prompts */}
          <Text style={styles.sectionLabel}>START WITH A FEELING</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Surprise me with a random weekend"
              onPress={surprise}
              style={[styles.chip, styles.chipGold]}
            >
              <Text style={styles.chipGoldText}>✦ Surprise me</Text>
            </Pressable>
            {QUICK_PROMPTS.map((item) => (
              <Pressable
                key={item.label}
                accessibilityRole="button"
                onPress={() => setMessage(item.prompt)}
                style={styles.chip}
              >
                <Text style={styles.chipDot}>●</Text>
                <Text style={styles.chipText}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Trip window — compact scheduling card */}
          <View style={styles.block}>
            <ScheduleCard value={tripWindow} onChange={setTripWindow} />
          </View>

          {/* Composer */}
          <View style={styles.composerWrap}>
            <BorderGlow
              backgroundColor={colors.surface}
              borderRadius={20}
              glowColor="7 90 62"
              colors={["#FF8E70", "#FF6B57", "#FFC98F"]}
              fillOpacity={0.35}
              edgeSensitivity={25}
              glowRadius={36}
              glowIntensity={1.1}
              animated
            >
              <View style={styles.composerInner}>
                <View style={styles.composerTop}>
                  <Text style={styles.composerLabel}>DESCRIBE YOUR ESCAPE</Text>
                  <Text style={styles.composerHint}>✦ AI concierge</Text>
                </View>
                <TextInput
                  accessibilityLabel="Trip request"
                  multiline
                  placeholder="A quiet hill weekend for two, under ₹10,000…"
                  placeholderTextColor={colors.faint}
                  value={message}
                  onChangeText={setMessage}
                  style={styles.input}
                />
                <Button
                  title="Build my itinerary"
                  arrow
                  loading={busy}
                  disabled={!message.trim()}
                  onPress={() => send()}
                  style={styles.build}
                />
              </View>
            </BorderGlow>
          </View>

          {error ? (
            <View style={styles.banner}>
              <Text style={styles.bannerText}>{error}</Text>
            </View>
          ) : null}

          {busy ? (
            <View style={styles.block}>
              <ThinkingCard />
            </View>
          ) : null}

          {!busy && reply ? (
            <FadeIn id={planId}>
              <View style={styles.response}>
                <View style={styles.responseMark}>
                  <Text style={styles.responseMarkText}>N</Text>
                </View>
                <View style={styles.responseCopy}>
                  <Text style={styles.responseLabel}>NOW SAYS</Text>
                  <Text style={styles.reply}>{reply}</Text>
                </View>
              </View>
            </FadeIn>
          ) : null}

          {!busy && plan ? (
            <FadeIn id={planId}>
              <View style={styles.block}>
                <ItineraryCard
                  plan={plan}
                  footer={
                    saved ? (
                      <View style={styles.savedRow}>
                        <View style={styles.savedBadge}>
                          <Text style={styles.savedBadgeText}>✓ Saved to your collection</Text>
                        </View>
                        <Button title="View in Trips" variant="secondary" onPress={() => router.push("/trips")} />
                      </View>
                    ) : (
                      <View style={styles.saveRow}>
                        <Button title="Save this itinerary" arrow loading={saving} onPress={saveTrip} style={styles.saveBtn} />
                        <Button title="Start over" variant="ghost" onPress={() => { setPlan(null); setReply(""); setMessage(""); }} />
                      </View>
                    )
                  }
                />
              </View>
            </FadeIn>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, padding: spacing.lg, paddingBottom: 64 },
  inner: { width: "100%", maxWidth: 900, alignSelf: "center" },
  title: { color: colors.text, fontSize: 34, fontWeight: "800", marginTop: 10 },
  subtitle: { color: colors.muted, fontSize: type.body, lineHeight: 24, marginTop: 8, maxWidth: 620 },
  sectionLabel: { color: colors.faint, fontSize: type.kicker, fontWeight: "800", letterSpacing: 1.6, marginTop: spacing.lg, marginBottom: 10 },
  chips: { gap: 10, paddingBottom: 4 },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chipGold: { backgroundColor: colors.goldSoft, borderColor: colors.goldBorder },
  chipGoldText: { color: colors.gold, fontSize: 13, fontWeight: "800" },
  chipDot: { color: colors.gold, fontSize: 9 },
  chipText: { color: colors.textDim, fontSize: 13, fontWeight: "700" },
  composerWrap: { marginTop: spacing.md },
  composerInner: { padding: spacing.lg },
  composerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  composerLabel: { color: colors.faint, fontSize: type.kicker, fontWeight: "800", letterSpacing: 1.6 },
  composerHint: { color: colors.gold, fontSize: type.small, fontWeight: "700" },
  input: { minHeight: 88, color: colors.text, fontSize: 17, lineHeight: 25, paddingVertical: 14, textAlignVertical: "top" },
  build: { width: "100%" },
  banner: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    padding: 14,
    marginTop: spacing.md,
  },
  bannerText: { color: colors.danger, fontSize: type.small, lineHeight: 20 },
  block: { marginTop: spacing.md },
  response: { flexDirection: "row", gap: 12, marginTop: spacing.lg, paddingHorizontal: 2 },
  responseMark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  responseMarkText: { color: colors.gold, fontWeight: "800", fontSize: 13 },
  responseCopy: { flex: 1 },
  responseLabel: { color: colors.gold, fontSize: type.kicker, fontWeight: "800", letterSpacing: 1.6 },
  reply: { color: colors.textDim, fontSize: 15, lineHeight: 23, marginTop: 5 },
  saveRow: { gap: 4 },
  saveBtn: { width: "100%" },
  savedRow: { gap: 10 },
  savedBadge: {
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: radius.md,
    padding: 12,
    alignItems: "center",
  },
  savedBadgeText: { color: colors.success, fontSize: type.small, fontWeight: "700" },
});
