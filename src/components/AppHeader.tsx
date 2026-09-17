import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useRouter } from "expo-router";
import { colors, type } from "../theme";
import { Logo } from "./Logo";

export type AppRoute = "plan" | "trips" | "map" | "profile";

const LINKS: { key: AppRoute; label: string; href: string }[] = [
  { key: "plan", label: "Plan", href: "/planner" },
  { key: "trips", label: "Trips", href: "/trips" },
  { key: "map", label: "Map", href: "/map" },
  { key: "profile", label: "Profile", href: "/profile" },
];

export function AppHeader({ active }: { active: AppRoute }) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const narrow = width < 640;

  const links = (
    <View style={[styles.links, narrow && styles.linksNarrow]}>
      {LINKS.map((link) => {
        const isActive = link.key === active;
        return (
          <Pressable
            key={link.key}
            accessibilityRole="button"
            accessibilityLabel={`Go to ${link.label}`}
            onPress={() => router.push(link.href as never)}
            style={[styles.link, isActive && styles.linkActive]}
          >
            <Text style={[styles.linkText, isActive && styles.linkTextActive]}>{link.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View style={styles.bar}>
      <View style={styles.inner}>
        <View style={styles.top}>
          <Pressable onPress={() => router.push("/planner")} accessibilityRole="button">
            <Logo compact />
          </Pressable>
          {!narrow ? links : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open SOS safety screen"
            onPress={() => router.push("/sos")}
            style={styles.sos}
          >
            <Text style={styles.sosText}>SOS</Text>
          </Pressable>
        </View>
        {narrow ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {links}
          </ScrollView>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  inner: { maxWidth: 1120, width: "100%", alignSelf: "center", paddingHorizontal: 20, paddingVertical: 12 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  links: { flexDirection: "row", alignItems: "center", gap: 6 },
  linksNarrow: { marginTop: 12, paddingBottom: 4 },
  link: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  linkActive: { backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: colors.goldBorder },
  linkText: { color: colors.muted, fontSize: type.small, fontWeight: "600" },
  linkTextActive: { color: colors.gold, fontWeight: "700" },
  sos: {
    backgroundColor: colors.danger,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sosText: { color: "#fff", fontSize: 12, fontWeight: "800", letterSpacing: 1 },
});
