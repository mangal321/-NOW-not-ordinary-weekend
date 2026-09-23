import { ReactNode } from "react";
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
import { colors, common, radius, spacing, type } from "../theme";
import { Logo } from "./Logo";

const WIDE_BREAKPOINT = 940;

const HIGHLIGHTS = [
  { glyph: "◈", title: "Weekends, engineered", body: "Tell NOW your vibe and budget — get a day-by-day escape in seconds." },
  { glyph: "⬔", title: "Every rupee accounted", body: "Built-in budget tracking keeps spontaneous trips guilt-free." },
  { glyph: "◎", title: "Never truly alone", body: "One-tap SOS shares your live location with someone you trust." },
];

type Props = {
  kicker: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Split-screen shell for auth pages: brand panel on wide screens,
 * compact stacked header on phones.
 */
export function AuthShell({ kicker, title, subtitle, children, footer }: Props) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const wide = width >= WIDE_BREAKPOINT;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.page, wide && styles.pageWide]}>
        {wide ? (
          <View style={styles.panel}>
            <Pressable onPress={() => router.replace("/")} accessibilityRole="button">
              <Logo />
            </Pressable>
            <View style={styles.panelCopy}>
              <Text style={common.kicker}>THE WEEKEND CLUB</Text>
              <Text style={styles.panelTitle}>Ordinary weekends end here.</Text>
              <Text style={styles.panelSub}>
                Join thousands of spontaneous travellers planning unforgettable
                48-hour escapes with NOW.
              </Text>
            </View>
            <View style={styles.highlights}>
              {HIGHLIGHTS.map((item) => (
                <View key={item.title} style={styles.highlight}>
                  <View style={styles.glyph}>
                    <Text style={styles.glyphText}>{item.glyph}</Text>
                  </View>
                  <View style={styles.highlightCopy}>
                    <Text style={styles.highlightTitle}>{item.title}</Text>
                    <Text style={styles.highlightBody}>{item.body}</Text>
                  </View>
                </View>
              ))}
            </View>
            <Text style={styles.panelFoot}>✦  4.9 from weekenders everywhere</Text>
          </View>
        ) : null}

        <ScrollView
          contentContainerStyle={[styles.formScroll, wide && styles.formScrollWide]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formInner}>
            <Pressable onPress={() => router.replace("/")} accessibilityRole="button" style={styles.backRow}>
              <Text style={styles.back}>←  Back</Text>
            </Pressable>
            {!wide ? (
              <View style={styles.mobileBrand}>
                <Logo compact />
              </View>
            ) : null}
            <Text style={common.kicker}>{kicker}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <View style={styles.card}>{children}</View>
            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  page: { flex: 1 },
  pageWide: { flexDirection: "row", maxWidth: 1200, width: "100%", alignSelf: "center" },
  panel: {
    width: 460,
    backgroundColor: colors.bgSoft,
    borderRightWidth: 1,
    borderRightColor: colors.borderSoft,
    padding: spacing.xl,
    justifyContent: "space-between",
  },
  panelCopy: { marginTop: spacing.xl },
  panelTitle: { color: colors.text, fontSize: type.display, fontWeight: "800", lineHeight: 44, marginTop: 14 },
  panelSub: { color: colors.muted, fontSize: type.body, lineHeight: 25, marginTop: 14, maxWidth: 360 },
  highlights: { gap: 20, marginTop: spacing.xl },
  highlight: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  glyph: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  glyphText: { color: colors.gold, fontSize: 17 },
  highlightCopy: { flex: 1 },
  highlightTitle: { color: colors.text, fontSize: type.body, fontWeight: "700" },
  highlightBody: { color: colors.muted, fontSize: type.small, lineHeight: 21, marginTop: 4 },
  panelFoot: { color: colors.faint, fontSize: type.small, marginTop: spacing.xl },
  formScroll: { flexGrow: 1, justifyContent: "center", padding: spacing.lg },
  formScrollWide: { padding: spacing.xl },
  formInner: { width: "100%", maxWidth: 460, alignSelf: "center" },
  backRow: { alignSelf: "flex-start", marginBottom: spacing.lg },
  back: { color: colors.muted, fontSize: type.small, fontWeight: "600" },
  mobileBrand: { marginBottom: spacing.lg },
  title: { color: colors.text, fontSize: 32, fontWeight: "800", marginTop: 10 },
  subtitle: { color: colors.muted, fontSize: type.body, lineHeight: 24, marginTop: 8, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  footer: { marginTop: spacing.md, alignItems: "center" },
});
