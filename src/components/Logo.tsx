import { Image, StyleSheet } from "react-native";

/**
 * Brand assets generated from assets/brand/now-logo.png (master).
 *  - mark:   the N☀W sunrise monogram, no tagline (nav / compact spots)
 *  - lockup: full logo with "NOT ORDINARY WEEKEND" tagline (auth panel hero)
 */
const MARK = require("../../assets/brand/now-mark.png");
const LOCKUP = require("../../assets/brand/now-lockup.png");

export function Logo({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Image
        source={MARK}
        style={styles.mark}
        resizeMode="contain"
        accessibilityLabel="NOW"
        accessibilityRole="image"
      />
    );
  }
  return (
    <Image
      source={LOCKUP}
      style={styles.lockup}
      resizeMode="contain"
      accessibilityLabel="NOW — not ordinary weekend"
      accessibilityRole="image"
    />
  );
}

const styles = StyleSheet.create({
  mark: { width: 78, height: 40 },
  lockup: { height: 84, aspectRatio: 610 / 360, maxWidth: "100%" },
});
