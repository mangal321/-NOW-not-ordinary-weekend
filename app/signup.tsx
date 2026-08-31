import { useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { api } from "../src/api";
import { setAuthToken } from "../src/session";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError("Enter your name, email, and a password of at least 6 characters.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await api.signup(email.trim(), password, name.trim());
      setAuthToken(result.token);
      router.replace("/planner");
    } catch (value) {
      setError(value instanceof Error ? value.message : "Could not create account");
    } finally {
      setBusy(false);
    }
  }

  return <SafeAreaView style={styles.safe}><View style={styles.container}>
    <Pressable onPress={() => router.back()}><Text style={styles.back}>Back</Text></Pressable>
    <Text style={styles.eyebrow}>NOW</Text><Text style={styles.title}>Make room for a good story.</Text>
    <View style={styles.panel}>
      <TextInput placeholder="Your name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Password (6+ characters)" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.button} onPress={submit} disabled={busy}>{busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}</Pressable>
    </View>
  </View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9f6f0" }, container: { flex: 1, justifyContent: "center", padding: 24, maxWidth: 620, width: "100%", alignSelf: "center" },
  back: { color: "#b5412a", fontSize: 15, marginBottom: 40 }, eyebrow: { color: "#d95a41", fontSize: 16, fontWeight: "700", letterSpacing: 2 }, title: { color: "#1a1a1a", fontSize: 36, fontWeight: "700", marginTop: 8, marginBottom: 28 },
  panel: { backgroundColor: "#fff", borderColor: "#e5e0d8", borderWidth: 1, borderRadius: 16, padding: 20 }, input: { borderColor: "#d7d0c5", borderWidth: 1, borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 16 }, error: { color: "#b23a3a", marginBottom: 12 }, button: { backgroundColor: "#d95a41", borderRadius: 10, minHeight: 48, alignItems: "center", justifyContent: "center" }, buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
