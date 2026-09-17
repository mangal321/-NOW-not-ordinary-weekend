import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { api } from "../src/api";
import { consumeSessionExpired, setAuthToken } from "../src/session";
import { colors, type } from "../src/theme";
import { AuthShell } from "../src/components/AuthShell";
import { Button } from "../src/components/Button";
import { TextField } from "../src/components/TextField";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice] = useState(() => consumeSessionExpired());

  async function submit() {
    if (!email.trim() || !password) {
      setError("Enter your email and password to continue.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await api.login(email.trim(), password);
      setAuthToken(result.token);
      router.replace("/planner");
    } catch (value) {
      setError(value instanceof Error ? value.message : "Could not sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      kicker="WELCOME BACK"
      title="Sign in"
      subtitle="Your next escape is waiting. Pick up right where you left off."
      footer={
        <Text style={styles.footer}>
          New to NOW?{" "}
          <Text style={styles.link} onPress={() => router.push("/signup")}>
            Create a free account
          </Text>
        </Text>
      }
    >
      {notice ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>Your session expired. Please sign in again to continue.</Text>
        </View>
      ) : null}
      {error ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{error}</Text>
        </View>
      ) : null}
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="next"
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Your password"
        secure
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      <Button title="Sign in" arrow loading={busy} onPress={submit} style={styles.submit} />
      <Pressable onPress={() => router.push("/onboarding")} accessibilityRole="button">
        <Text style={styles.tour}>First time here? Take the tour →</Text>
      </Pressable>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  notice: {
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  noticeText: { color: colors.gold, fontSize: type.small, lineHeight: 20 },
  banner: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  bannerText: { color: colors.danger, fontSize: type.small, lineHeight: 20 },
  submit: { marginTop: 4, width: "100%" },
  tour: { color: colors.faint, fontSize: type.small, textAlign: "center", marginTop: 16 },
  footer: { color: colors.muted, fontSize: type.small },
  link: { color: colors.gold, fontWeight: "700" },
});
