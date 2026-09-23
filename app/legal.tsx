import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, common, shadow, spacing } from "../src/theme";
import { Logo } from "../src/components/Logo";

const SECTIONS: { heading: string; body: string }[] = [
  {
    heading: "The short version",
    body: "NOW stores only what it needs to plan great weekends: your name, email, home city, interests, the trips you save and the expenses you log. We don't sell data, we don't run ads, and we don't track you across the internet.",
  },
  {
    heading: "What we store",
    body: "Account basics (name, email, hashed password), your saved preferences, saved itineraries and expense entries. Planning conversations are stored only to keep context while you refine a trip. Your emergency contact in the SOS screen never leaves your device.",
  },
  {
    heading: "Passwords & security",
    body: "Passwords are hashed with salted PBKDF2 — never stored in plain text. Sessions use signed, expiring tokens. You can sign out anywhere to clear your local session.",
  },
  {
    heading: "Location & SOS",
    body: "Your location is read only when you explicitly tap Share my location, is used solely to compose the message you choose to send, and is not stored by NOW.",
  },
  {
    heading: "Deleting your data",
    body: "You can delete any saved trip from its detail page. To delete your account and everything tied to it, contact us and we will remove it completely.",
  },
  {
    heading: "Terms of use",
    body: "NOW helps you plan; you're still the traveller. Verify opening hours, prices, safety conditions and travel advisories before acting on a plan. Itineraries are suggestions, not bookings. Use the service kindly and lawfully.",
  },
];

export default function Legal() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.back}>← Back</Text>
        </Pressable>
        <Logo compact />
        <Text style={common.kicker}>THE FINE PRINT</Text>
        <Text style={styles.title}>Privacy & terms, in plain words.</Text>
        <Text style={styles.updated}>Last updated: September 2026</Text>

        {SECTIONS.map((section) => (
          <View key={section.heading} style={styles.card}>
            <Text style={styles.heading}>{section.heading}</Text>
            <Text style={styles.body}>{section.body}</Text>
          </View>
        ))}

        <Text style={styles.footer}>NOW · Not Ordinary Weekend · Crafted for spontaneous souls ✦</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 60, maxWidth: 720, width: "100%", alignSelf: "center" },
  back: { color: colors.muted, fontWeight: "700", marginBottom: spacing.lg, fontSize: 14 },
  title: { color: colors.text, fontSize: 32, lineHeight: 38, fontWeight: "800", marginTop: 8 },
  updated: { color: colors.faint, fontSize: 12, marginTop: 6, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 18,
    padding: spacing.md,
    marginTop: 12,
    ...shadow.card,
  },
  heading: { color: colors.text, fontSize: 17, fontWeight: "800", marginBottom: 6 },
  body: { color: colors.muted, fontSize: 14, lineHeight: 22 },
  footer: { color: colors.faint, fontSize: 12, textAlign: "center", marginTop: spacing.xl },
});
