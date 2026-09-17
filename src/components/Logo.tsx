import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.row}>
      <View style={[styles.mark, compact && styles.markCompact]}>
        <Text style={[styles.markText, compact && styles.markTextCompact]}>✦</Text>
      </View>
      <View>
        <Text style={[styles.word, compact && styles.wordCompact]}>
          NOW<Text style={styles.dot}>.</Text>
        </Text>
        {!compact ? <Text style={styles.tag}>NOT ORDINARY WEEKEND</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  mark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  markCompact: { width: 34, height: 34, borderRadius: 11 },
  markText: { color: colors.gold, fontSize: 20 },
  markTextCompact: { fontSize: 16 },
  word: { color: colors.text, fontSize: 26, fontWeight: "800", letterSpacing: 4 },
  wordCompact: { fontSize: 19, letterSpacing: 3 },
  dot: { color: colors.gold },
  tag: { color: colors.faint, fontSize: 9, fontWeight: "700", letterSpacing: 2.2, marginTop: 2 },
});
