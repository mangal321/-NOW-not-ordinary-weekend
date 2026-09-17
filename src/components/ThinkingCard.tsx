import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, type } from "../theme";

const STEPS = [
  "Reading your vibe…",
  "Scouting the best stops…",
  "Timing golden hour…",
  "Balancing the budget…",
];

/** Animated "AI is working" card with cycling progress steps. */
export function ThinkingCard() {
  const [step, setStep] = useState(0);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 1400);
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => {
      clearInterval(timer);
      animation.stop();
    };
  }, [pulse]);

  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] });

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Animated.View style={[styles.orb, { opacity }]}>
          <Text style={styles.orbGlyph}>✦</Text>
        </Animated.View>
        <View>
          <Text style={styles.kicker}>NOW IS PLANNING</Text>
          <Text style={styles.title}>Crafting your escape…</Text>
        </View>
      </View>
      <View style={styles.steps}>
        {STEPS.map((label, i) => (
          <View key={label} style={styles.step}>
            <Text style={[styles.check, i <= step && styles.checkDone]}>{i < step ? "●" : "○"}</Text>
            <Text style={[styles.stepText, i <= step && styles.stepTextDone]}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.goldBorder,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  head: { flexDirection: "row", alignItems: "center", gap: 14 },
  orb: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  orbGlyph: { color: colors.gold, fontSize: 24 },
  kicker: { color: colors.gold, fontSize: type.kicker, fontWeight: "800", letterSpacing: 2 },
  title: { color: colors.text, fontSize: type.heading, fontWeight: "800", marginTop: 4 },
  steps: { marginTop: spacing.md, gap: 8 },
  step: { flexDirection: "row", alignItems: "center", gap: 10 },
  check: { color: colors.faint, fontSize: 12 },
  checkDone: { color: colors.gold },
  stepText: { color: colors.faint, fontSize: type.small },
  stepTextDone: { color: colors.textDim },
});
