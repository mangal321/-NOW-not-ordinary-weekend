import { ReactNode } from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { colors, spacing } from "../theme";

type Props = {
  children: ReactNode;
  maxWidth?: number;
  scroll?: boolean;
};

/** App screen wrapper: safe area + centered max-width container. */
export function Screen({ children, maxWidth = 1120, scroll = true }: Props) {
  const body = (
    <View style={[styles.inner, { maxWidth }]}>
      {children}
    </View>
  );
  return (
    <SafeAreaView style={styles.safe}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {body}
        </ScrollView>
      ) : (
        <View style={styles.fill}>{body}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1 },
  scroll: { flexGrow: 1, padding: spacing.lg },
  inner: { width: "100%", alignSelf: "center", flex: 1 },
});
