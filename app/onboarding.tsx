import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors, common, radius, spacing, type } from "../src/theme";
import { Button } from "../src/components/Button";
import Grainient from "../src/components/Grainient";
import { Logo } from "../src/components/Logo";

const SLIDES = [
  {
    glyph: "◈",
    kicker: "PLAN IN SECONDS",
    title: "Say the vibe.\nGet the weekend.",
    body: "“Two slow days in the hills under ₹10,000.” NOW drafts a complete day-by-day itinerary — stays, food, views and hidden corners.",
  },
  {
    glyph: "⬔",
    kicker: "SPEND WITHOUT STRESS",
    title: "Every rupee,\nbeautifully tracked.",
    body: "Set a trip budget, log expenses in two taps, and see exactly where your money went — no spreadsheets, no guilt.",
  },
  {
    glyph: "◎",
    kicker: "TRAVEL SAFE",
    title: "Adventure more.\nWorry less.",
    body: "Save a trusted contact and share your live location with one tap. Plus one-tap access to emergency services, anywhere.",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const last = index === SLIDES.length - 1;

  async function finish(path: "/signup" | "/login") {
    try {
      await AsyncStorage.setItem("now_onboarded", "1");
    } catch {
      /* first-run flag is best-effort */
    }
    router.replace(path);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Grainient
          color1="#FFD9A8"
          color2="#FF8E70"
          color3="#79CBBE"
          lightMode
          timeSpeed={0.22}
          warpStrength={0.8}
          contrast={1.08}
          saturation={1.0}
          grainAmount={0.06}
          zoom={1.1}
        />
      </View>
      <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="none" />
      <View style={styles.page}>
        <View style={styles.top}>
          <Pressable onPress={() => router.replace("/")} accessibilityRole="button">
            <Logo compact />
          </Pressable>
          <Pressable onPress={() => finish("/signup")} accessibilityRole="button">
            <Text style={styles.skip}>Skip →</Text>
          </Pressable>
        </View>

        <View style={styles.slide}>
          <View style={styles.orb}>
            <Text style={styles.orbGlyph}>{slide.glyph}</Text>
          </View>
          <Text style={[common.kicker, styles.kicker]}>{slide.kicker}</Text>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.body}>{slide.body}</Text>
        </View>

        <View style={styles.bottom}>
          <View style={styles.dots}>
            {SLIDES.map((s, i) => (
              <Pressable
                key={s.kicker}
                accessibilityRole="button"
                accessibilityLabel={`Go to slide ${i + 1}`}
                onPress={() => setIndex(i)}
                style={[styles.dot, i === index && styles.dotActive]}
              />
            ))}
          </View>
          {last ? (
            <View style={styles.ctas}>
              <Button title="Create free account" arrow onPress={() => finish("/signup")} style={styles.cta} />
              <Button title="I already have an account" variant="ghost" onPress={() => finish("/login")} />
            </View>
          ) : (
            <View style={styles.ctas}>
              <Button title="Next" arrow onPress={() => setIndex(index + 1)} style={styles.cta} />
              {index > 0 ? (
                <Button title="Back" variant="ghost" onPress={() => setIndex(index - 1)} />
              ) : null}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  page: { flex: 1, maxWidth: 640, width: "100%", alignSelf: "center", padding: spacing.lg },
  overlay: { backgroundColor: "rgba(250, 247, 241, 0.55)" },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  skip: { color: colors.muted, fontSize: type.small, fontWeight: "600" },
  slide: { flex: 1, justifyContent: "center", alignItems: "flex-start" },
  orb: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
  },
  orbGlyph: { color: colors.gold, fontSize: 40 },
  kicker: { marginBottom: 12 },
  title: { color: colors.text, fontSize: 42, lineHeight: 48, fontWeight: "800" },
  body: { color: colors.muted, fontSize: 17, lineHeight: 27, marginTop: 16, maxWidth: 480 },
  bottom: { gap: spacing.md },
  dots: { flexDirection: "row", gap: 8, marginBottom: spacing.sm },
  dot: { width: 28, height: 6, borderRadius: radius.pill, backgroundColor: colors.surface3 },
  dotActive: { backgroundColor: colors.gold, width: 44 },
  ctas: { gap: 4 },
  cta: { width: "100%" },
});
