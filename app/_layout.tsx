import { Stack } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { colors, common, radius, spacing, type } from "../src/theme";
import { Logo } from "../src/components/Logo";

/** Root error boundary: a branded recovery screen instead of a white screen. */
export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        <Logo />
        <View style={styles.card}>
          <Text style={common.kicker}>SOMETHING WENT OFF-ROAD</Text>
          <Text style={styles.title}>This weekend hit a detour.</Text>
          <Text style={styles.body}>
            {__DEV__ ? error.message : "The app ran into a problem loading this screen. Your trips and account are safe."}
          </Text>
          <Pressable accessibilityRole="button" onPress={retry} style={styles.button}>
            <Text style={styles.buttonText}>Try again →</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function Layout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  page: { flex: 1, justifyContent: "center", padding: spacing.lg, maxWidth: 560, width: "100%", alignSelf: "center", gap: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  title: { color: colors.text, fontSize: type.title, fontWeight: "800", marginTop: 10 },
  body: { color: colors.muted, fontSize: type.body, lineHeight: 24, marginTop: 10 },
  button: {
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  buttonText: { color: colors.onGold, fontSize: type.body, fontWeight: "700" },
});
