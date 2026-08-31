import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { api } from "../src/api";
import { authToken } from "../src/session";

const QUICK_PROMPTS = [
  { label: "Hill escape", prompt: "2 days in Mahabaleshwar for a couple under INR 10,000" },
  { label: "Food weekend", prompt: "A food-focused weekend in Tokyo under $900" },
  { label: "Beach reset", prompt: "A relaxed 3-day beach trip with good sunsets" },
];

function AnimatedLogo() {
  const rotation = useRef(new Animated.Value(0)).current;
  const arrival = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(Animated.timing(rotation, { toValue: 1, duration: 4200, useNativeDriver: false }));
    animation.start();
    Animated.spring(arrival, { toValue: 1, friction: 7, tension: 35, useNativeDriver: false }).start();
    return () => { animation.stop(); arrival.stopAnimation(); };
  }, [arrival, rotation]);
  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const routeX = rotation.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, 12, 0, -12, 0] });
  const routeY = rotation.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, -5, 0, 5, 0] });
  const lift = arrival.interpolate({ inputRange: [0, 1], outputRange: [8, 0] });
  const fade = arrival.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  return <Animated.View style={[styles.logo, { opacity: fade, transform: [{ translateY: lift }] }]} accessibilityLabel="NOW"><Text style={styles.logoLetter}>N</Text><View style={{ width: 23, height: 24, alignItems: "center", justifyContent: "center", position: "relative" }}><Animated.Text style={[styles.globe, { transform: [{ rotateY: spin }] }]}>🌐</Animated.Text><Animated.Text style={{ position: "absolute", color: "#55735b", fontSize: 18, fontWeight: "800", opacity: 0.9, transform: [{ translateX: routeX }, { translateY: routeY }] }}>•</Animated.Text></View><Text style={styles.logoLetter}>W</Text></Animated.View>;
}

export default function Planner() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("Tell me the destination, dates, budget, and what you love to do.");
  const [plan, setPlan] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function send() {
    if (!authToken || !message.trim()) return;
    setBusy(true); setSaved(false);
    try { const result = await api.chat(authToken, `session-${Date.now()}`, message.trim()); setReply(result.reply); setPlan(result.itinerary); }
    catch (value) { setReply(value instanceof Error ? value.message : "Claude is unavailable right now."); }
    finally { setBusy(false); }
  }

  async function saveTrip() {
    if (!authToken || !plan) return;
    setBusy(true);
    try { await api.createTrip(authToken, plan); setSaved(true); }
    catch (value) { setReply(value instanceof Error ? value.message : "Could not save this trip"); }
    finally { setBusy(false); }
  }

  return <SafeAreaView style={styles.safe}><View style={styles.page}>
    <View style={styles.nav}><AnimatedLogo /><View style={styles.navLinks}><Pressable accessibilityRole="button" accessibilityLabel="Open SOS safety screen" onPress={() => router.push("/sos")} style={styles.sos}><Text style={styles.sosText}>SOS</Text></Pressable><Pressable onPress={() => router.push("/trips")}><Text style={styles.navText}>Trips</Text></Pressable><Pressable onPress={() => router.push("/map")}><Text style={styles.navText}>Map</Text></Pressable><Pressable onPress={() => router.push("/profile")}><Text style={styles.navText}>Profile</Text></Pressable></View></View>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}><View style={styles.sun} /><View style={styles.heroCopy}><Text style={styles.kicker}>THE ESCAPE DESK · 01</Text><Text style={styles.title}>Make this weekend{`\n`}feel farther away.</Text><Text style={styles.subtitle}>Your AI travel concierge for small escapes, big scenery, and plans that leave room for serendipity.</Text></View><View style={styles.route}><View><Text style={styles.routeLabel}>FROM</Text><Text style={styles.routeValue}>Somewhere familiar</Text></View><Text style={styles.routeArrow}>→</Text><View><Text style={styles.routeLabel}>TO</Text><Text style={styles.routeValue}>Somewhere good</Text></View></View></View>
      <Text style={styles.sectionLabel}>START WITH A FEELING</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{QUICK_PROMPTS.map((item) => <Pressable key={item.label} style={styles.chip} onPress={() => setMessage(item.prompt)}><Text style={styles.chipDot}>●</Text><Text style={styles.chipText}>{item.label}</Text></Pressable>)}</ScrollView>
      <View style={styles.composer}><View style={styles.composerTop}><Text style={styles.composerLabel}>DESCRIBE YOUR ESCAPE</Text><Text style={styles.composerHint}>AI assisted</Text></View><TextInput accessibilityLabel="Trip request" multiline placeholder="A quiet hill weekend for two, under ₹10,000..." placeholderTextColor="#938d83" value={message} onChangeText={setMessage} style={styles.input} /><Pressable style={[styles.button, (!message.trim() || busy) && styles.buttonDisabled]} onPress={send} disabled={busy || !message.trim()}>{busy ? <ActivityIndicator color="#fff" /> : <><Text style={styles.buttonText}>Build my itinerary</Text><Text style={styles.buttonArrow}>↗</Text></>}</Pressable></View>
      <View style={styles.response}><View style={styles.responseMark}><Text style={styles.responseMarkText}>N</Text></View><View style={styles.responseCopy}><Text style={styles.responseLabel}>NOW SAYS</Text><Text style={styles.reply}>{reply}</Text></View></View>
      {plan ? <View style={styles.plan}><View style={styles.planHeader}><View><Text style={styles.planEyebrow}>YOUR FIRST DRAFT</Text><Text style={styles.planTitle}>{plan.trip_title}</Text><Text style={styles.destination}>{plan.destination}</Text></View><View style={styles.budgetBadge}><Text style={styles.budgetValue}>{plan.currency} {plan.total_budget}</Text><Text style={styles.budgetLabel}>{plan.duration_days} days</Text></View></View><Text style={styles.summary}>{plan.summary}</Text>{(plan.days || []).map((day: any) => <View key={day.day_number} style={styles.day}><View style={styles.dayBadge}><Text style={styles.dayNumber}>0{day.day_number}</Text></View><View style={styles.dayBody}><Text style={styles.dayTitle}>{day.title}</Text>{(day.activities || []).map((activity: any) => <View key={activity.title} style={styles.activity}><Text style={styles.activityTime}>{activity.time}</Text><View><Text style={styles.activityTitle}>{activity.title}</Text><Text style={styles.activityMeta}>{activity.category} · {plan.currency} {activity.cost}</Text></View></View>)}</View></View>)}<Pressable style={[styles.saveButton, saved && styles.saved]} onPress={saveTrip} disabled={busy || saved}><Text style={styles.saveText}>{saved ? "Trip saved to your collection" : "Save this itinerary"}</Text><Text style={styles.saveArrow}>↗</Text></Pressable></View> : null}
    </ScrollView>
  </View></SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: "#f2eee6" }, page: { flex: 1, maxWidth: 900, width: "100%", alignSelf: "center" }, nav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 28, paddingVertical: 18, backgroundColor: "#f2eee6", borderBottomWidth: 1, borderBottomColor: "#ddd5c8" }, logo: { flexDirection: "row", alignItems: "center", height: 26 }, logoLetter: { color: "#c94d38", fontWeight: "800", letterSpacing: 3, fontSize: 18 }, globe: { color: "#c94d38", fontSize: 18, lineHeight: 21, marginHorizontal: 1 }, navLinks: { flexDirection: "row", alignItems: "center", gap: 18 }, navText: { color: "#615c54", fontSize: 13, fontWeight: "700" }, sos: { backgroundColor: "#9f3835", borderRadius: 7, paddingHorizontal: 10, paddingVertical: 7 }, sosText: { color: "#fff", fontSize: 11, fontWeight: "800" }, content: { padding: 22, paddingBottom: 70 }, hero: { minHeight: 310, backgroundColor: "#dbe1d1", borderRadius: 24, overflow: "hidden", padding: 26, justifyContent: "space-between", position: "relative" }, sun: { position: "absolute", width: 190, height: 190, borderRadius: 95, right: -45, top: -55, backgroundColor: "#e7b85f", opacity: 0.8 }, heroCopy: { maxWidth: 610 }, kicker: { color: "#526b52", fontSize: 11, fontWeight: "800", letterSpacing: 1.5 }, title: { color: "#28372b", fontSize: 42, lineHeight: 46, fontWeight: "800", marginTop: 12 }, subtitle: { color: "#566052", fontSize: 16, lineHeight: 24, maxWidth: 540, marginTop: 14 }, route: { flexDirection: "row", alignItems: "center", gap: 18, marginTop: 26 }, routeLabel: { color: "#73806e", fontSize: 10, fontWeight: "800", letterSpacing: 1.2 }, routeValue: { color: "#28372b", fontSize: 13, fontWeight: "700", marginTop: 4 }, routeArrow: { color: "#c94d38", fontSize: 26 }, sectionLabel: { color: "#82796c", fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginTop: 28, marginBottom: 10 }, chips: { gap: 10, paddingBottom: 3 }, chip: { backgroundColor: "#fffaf2", borderWidth: 1, borderColor: "#e0d6c5", borderRadius: 30, paddingHorizontal: 14, paddingVertical: 11, flexDirection: "row", alignItems: "center", gap: 7 }, chipDot: { color: "#c94d38", fontSize: 10 }, chipText: { color: "#514c44", fontSize: 13, fontWeight: "700" }, composer: { backgroundColor: "#fffaf2", borderWidth: 1, borderColor: "#e0d6c5", borderRadius: 18, padding: 18, marginTop: 22 }, composerTop: { flexDirection: "row", justifyContent: "space-between" }, composerLabel: { color: "#82796c", fontSize: 10, fontWeight: "800", letterSpacing: 1.4 }, composerHint: { color: "#73906f", fontSize: 11, fontWeight: "700" }, input: { minHeight: 78, color: "#302e2a", fontSize: 17, lineHeight: 24, paddingTop: 14, paddingBottom: 14 }, button: { minHeight: 48, borderRadius: 10, backgroundColor: "#c94d38", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 12 }, buttonDisabled: { opacity: 0.45 }, buttonText: { color: "#fff", fontSize: 15, fontWeight: "800" }, buttonArrow: { color: "#fff", fontSize: 20 }, response: { flexDirection: "row", gap: 12, marginVertical: 24, paddingHorizontal: 3 }, responseMark: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#526b52", alignItems: "center", justifyContent: "center" }, responseMarkText: { color: "#fff", fontWeight: "800", fontSize: 12 }, responseCopy: { flex: 1 }, responseLabel: { color: "#526b52", fontSize: 10, fontWeight: "800", letterSpacing: 1.4 }, reply: { color: "#514c44", fontSize: 15, lineHeight: 23, marginTop: 5 }, plan: { backgroundColor: "#fffaf2", borderWidth: 1, borderColor: "#e0d6c5", borderRadius: 18, padding: 20 }, planHeader: { flexDirection: "row", justifyContent: "space-between", gap: 14 }, planEyebrow: { color: "#82796c", fontSize: 10, fontWeight: "800", letterSpacing: 1.4 }, planTitle: { color: "#302e2a", fontSize: 25, lineHeight: 30, fontWeight: "800", marginTop: 7, maxWidth: 500 }, destination: { color: "#c94d38", fontSize: 14, fontWeight: "800", marginTop: 4 }, budgetBadge: { backgroundColor: "#e6eee0", borderRadius: 10, padding: 10, alignSelf: "flex-start", minWidth: 86 }, budgetValue: { color: "#526b52", fontSize: 12, fontWeight: "800" }, budgetLabel: { color: "#71806c", fontSize: 11, marginTop: 3 }, summary: { color: "#615c54", fontSize: 14, lineHeight: 22, marginTop: 16, paddingBottom: 17, borderBottomWidth: 1, borderBottomColor: "#e7ded0" }, day: { flexDirection: "row", gap: 14, paddingTop: 18 }, dayBadge: { width: 35, height: 35, borderRadius: 18, backgroundColor: "#f0d8cd", alignItems: "center", justifyContent: "center" }, dayNumber: { color: "#c94d38", fontSize: 11, fontWeight: "800" }, dayBody: { flex: 1 }, dayTitle: { color: "#302e2a", fontWeight: "800", fontSize: 15, marginBottom: 8 }, activity: { flexDirection: "row", gap: 12, paddingVertical: 7 }, activityTime: { color: "#9b9285", fontSize: 12, width: 43, paddingTop: 2 }, activityTitle: { color: "#514c44", fontSize: 14, fontWeight: "700" }, activityMeta: { color: "#938d83", fontSize: 11, marginTop: 2 }, saveButton: { backgroundColor: "#526b52", minHeight: 49, borderRadius: 10, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10, marginTop: 20 }, saved: { backgroundColor: "#6e8b6a" }, saveText: { color: "#fff", fontSize: 14, fontWeight: "800" }, saveArrow: { color: "#fff", fontSize: 18 } });
