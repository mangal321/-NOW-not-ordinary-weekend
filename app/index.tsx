import { useEffect } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { authToken } from "../src/session";
import { colors, common, radius, spacing, type } from "../src/theme";
import { Button } from "../src/components/Button";
import Grainient from "../src/components/Grainient";
import { Logo } from "../src/components/Logo";

const FEATURES = [
  {
    glyph: "◈",
    title: "Weekends, engineered",
    body: "Describe your vibe and budget. NOW drafts a day-by-day escape — stays, food, views and hidden corners — in seconds.",
  },
  {
    glyph: "⬔",
    title: "Spend without stress",
    body: "Set a trip budget, log expenses on the go, and watch every rupee with live category breakdowns.",
  },
  {
    glyph: "◎",
    title: "Safety in your pocket",
    body: "One-tap SOS shares your live location with someone you trust. Adventure more, worry less.",
  },
];

const STEPS = [
  { n: "01", title: "Say the vibe", body: "“Two slow days in the hills under ₹10,000.” That's all it takes." },
  { n: "02", title: "Get the plan", body: "A polished itinerary with timings, costs and map pins — ready to save." },
  { n: "03", title: "Live the weekend", body: "Track spending, revisit stops, and collect stories worth retelling." },
];

const STATS = [
  { value: "48h", label: "Perfectly planned" },
  { value: "100%", label: "Budget clarity" },
  { value: "1-tap", label: "Emergency SOS" },
];

export default function Landing() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  useEffect(() => {
    if (authToken) router.replace("/planner");
  }, [router]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.inner, wide && styles.innerWide]}>
          {/* Nav */}
          <View style={styles.nav}>
            <Pressable onPress={() => router.replace("/")} accessibilityRole="button">
              <Logo compact />
            </Pressable>
            <View style={styles.navLinks}>
              <Pressable onPress={() => router.push("/onboarding")} accessibilityRole="button">
                <Text style={styles.navLink}>How it works</Text>
              </Pressable>
              <Pressable onPress={() => router.push("/login")} accessibilityRole="button">
                <Text style={styles.navLink}>Sign in</Text>
              </Pressable>
              <Button title="Get started" onPress={() => router.push("/signup")} style={styles.navCta} />
            </View>
          </View>

          {/* Hero */}
          <View style={styles.stage}>
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Grainient
                color1="#FFC98F"
                color2="#FF7E67"
                color3="#5FBFAE"
                lightMode
                timeSpeed={0.3}
                warpStrength={0.9}
                contrast={1.1}
                saturation={1.05}
                grainAmount={0.06}
              />
            </View>
            <View style={[StyleSheet.absoluteFill, styles.stageOverlay]} pointerEvents="none" />
            <View style={[styles.hero, wide && styles.heroWide]}>
            <View style={styles.heroCopy}>
              <Text style={common.kicker}>NOT ORDINARY WEEKEND</Text>
              <Text style={[styles.heroTitle, wide && styles.heroTitleWide]}>
                Your next 48 hours,{"\n"}unforgettable<Text style={styles.gold}>.</Text>
              </Text>
              <Text style={styles.heroSub}>
                NOW turns a free weekend into a story worth retelling — AI-planned
                itineraries, effortless budgeting, and safety built in.
              </Text>
              <View style={[styles.ctaRow, !wide && styles.ctaColumn]}>
                <Button title="Create free account" arrow onPress={() => router.push("/signup")} style={styles.ctaMain} />
                <Button title="Take the tour" variant="secondary" onPress={() => router.push("/onboarding")} style={styles.ctaMain} />
              </View>
              <View style={styles.stats}>
                {STATS.map((s) => (
                  <View key={s.label} style={styles.stat}>
                    <Text style={styles.statValue}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={[styles.heroCard, wide && styles.heroCardWide]}>
              <View style={styles.cardGlow} />
              <Text style={common.kicker}>THIS WEEKEND IN</Text>
              <Text style={styles.cardDest}>Mahabaleshwar</Text>
              <Text style={styles.cardMeta}>2 days · 2 travellers · ₹10,000</Text>
              <View style={common.divider} />
              {[
                ["SAT 10:00", "Venna Lake boat ride"],
                ["SAT 13:00", "Strawberry cream at Mapro"],
                ["SAT 17:30", "Sunset at Wilson Point"],
                ["SUN 08:30", "Pratapgad Fort sunrise"],
              ].map(([time, what]) => (
                <View key={what} style={styles.cardRow}>
                  <Text style={styles.cardTime}>{time}</Text>
                  <Text style={styles.cardWhat}>{what}</Text>
                </View>
              ))}
              <Pressable onPress={() => router.push("/signup")} accessibilityRole="button" style={styles.cardLink}>
                <Text style={styles.cardLinkText}>Plan mine →</Text>
              </Pressable>
            </View>
            </View>
          </View>

          {/* Features */}
          <Text style={[common.kicker, styles.sectionKicker]}>WHY NOW</Text>
          <Text style={styles.sectionTitle}>Everything a great weekend needs.</Text>
          <View style={[styles.cards, wide && styles.cardsWide]}>
            {FEATURES.map((f) => (
              <View key={f.title} style={[styles.card, wide && styles.cardWide]}>
                <View style={styles.glyph}>
                  <Text style={styles.glyphText}>{f.glyph}</Text>
                </View>
                <Text style={styles.cardTitle}>{f.title}</Text>
                <Text style={styles.cardBody}>{f.body}</Text>
              </View>
            ))}
          </View>

          {/* Steps */}
          <Text style={[common.kicker, styles.sectionKicker]}>HOW IT WORKS</Text>
          <Text style={styles.sectionTitle}>From “bored” to booked in minutes.</Text>
          <View style={[styles.cards, wide && styles.cardsWide]}>
            {STEPS.map((s) => (
              <View key={s.n} style={[styles.card, wide && styles.cardWide]}>
                <Text style={styles.stepNum}>{s.n}</Text>
                <Text style={styles.cardTitle}>{s.title}</Text>
                <Text style={styles.cardBody}>{s.body}</Text>
              </View>
            ))}
          </View>

          {/* CTA band */}
          <View style={styles.band}>
            <Text style={styles.bandKicker}>THE WEEKEND CLUB</Text>
            <Text style={styles.bandTitle}>Ordinary weekends end here.</Text>
            <Text style={styles.bandSub}>Free to start. Unforgettable by Sunday night.</Text>
            <Button title="Start planning — it's free" arrow onPress={() => router.push("/signup")} style={styles.bandCta} />
          </View>

          <View style={styles.footerLinks}>
            <Pressable onPress={() => router.push("/legal")} accessibilityRole="button">
              <Text style={styles.footerLink}>Privacy & terms</Text>
            </Pressable>
            <Text style={styles.footerDot}>·</Text>
            <Text style={styles.footerLink} onPress={() => {}}>© 2026 NOW</Text>
          </View>
          <Text style={styles.footer}>NOW · Not Ordinary Weekend · Crafted for spontaneous souls ✦</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, padding: spacing.lg },
  inner: { width: "100%", maxWidth: 680, alignSelf: "center" },
  innerWide: { maxWidth: 1120 },
  nav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: spacing.sm },
  navLinks: { flexDirection: "row", alignItems: "center", gap: 22 },
  navLink: { color: colors.muted, fontSize: type.small, fontWeight: "600" },
  navCta: { minHeight: 42, paddingHorizontal: 18 },
  hero: { gap: spacing.xl },
  heroWide: { flexDirection: "row", alignItems: "center", gap: spacing.xl },
  stage: {
    marginTop: spacing.xl,
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.goldBorder,
    padding: spacing.lg,
  },
  stageOverlay: { backgroundColor: "rgba(250, 247, 241, 0.42)" },
  heroCopy: { flex: 1.2 },
  heroTitle: { color: colors.text, fontSize: type.display, fontWeight: "800", lineHeight: 44, marginTop: 14 },
  heroTitleWide: { fontSize: type.hero, lineHeight: 58 },
  gold: { color: colors.gold },
  heroSub: { color: colors.muted, fontSize: 17, lineHeight: 27, marginTop: 16, maxWidth: 520 },
  ctaRow: { flexDirection: "row", gap: 12, marginTop: spacing.lg },
  ctaColumn: { flexDirection: "column" },
  ctaMain: { flex: 1 },
  stats: { flexDirection: "row", gap: 32, marginTop: spacing.xl },
  stat: {},
  statValue: { color: colors.gold, fontSize: 22, fontWeight: "800" },
  statLabel: { color: colors.faint, fontSize: type.small, marginTop: 2 },
  heroCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    overflow: "hidden",
  },
  heroCardWide: { flex: 0.9 },
  cardGlow: {
    position: "absolute",
    top: -70,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.goldSoft,
  },
  cardDest: { color: colors.text, fontSize: 32, fontWeight: "800", marginTop: 8 },
  cardMeta: { color: colors.muted, fontSize: type.small, marginTop: 4, marginBottom: 16 },
  cardRow: { flexDirection: "row", gap: 14, paddingVertical: 9 },
  cardTime: { color: colors.gold, fontSize: type.small, fontWeight: "700", width: 76 },
  cardWhat: { color: colors.textDim, fontSize: type.small, flex: 1 },
  cardLink: { marginTop: 14, alignSelf: "flex-start" },
  cardLinkText: { color: colors.gold, fontWeight: "700", fontSize: type.body },
  sectionKicker: { marginTop: spacing.xxl },
  sectionTitle: { color: colors.text, fontSize: type.title, fontWeight: "800", marginTop: 10, marginBottom: spacing.md },
  cards: { gap: 14 },
  cardsWide: { flexDirection: "row" },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  cardWide: { flex: 1 },
  glyph: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  glyphText: { color: colors.gold, fontSize: 20 },
  cardTitle: { color: colors.text, fontSize: type.heading, fontWeight: "700" },
  cardBody: { color: colors.muted, fontSize: type.small, lineHeight: 22, marginTop: 8 },
  stepNum: { color: colors.gold, fontSize: type.small, fontWeight: "800", letterSpacing: 2, marginBottom: 10 },
  band: {
    marginTop: spacing.xxl,
    backgroundColor: colors.surface,
    borderColor: colors.goldBorder,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
  },
  bandKicker: { color: colors.gold, fontSize: type.kicker, fontWeight: "800", letterSpacing: 2.4 },
  bandTitle: { color: colors.text, fontSize: 30, fontWeight: "800", marginTop: 10, textAlign: "center" },
  bandSub: { color: colors.muted, fontSize: type.body, marginTop: 8, marginBottom: spacing.md, textAlign: "center" },
  bandCta: { minWidth: 280 },
  footer: { color: colors.faint, fontSize: type.small, textAlign: "center", marginTop: spacing.xxl, marginBottom: spacing.md },
  footerLinks: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, marginTop: spacing.xxl },
  footerLink: { color: colors.muted, fontSize: type.caption, fontWeight: "700" },
  footerDot: { color: colors.faint, fontSize: type.caption },
});
