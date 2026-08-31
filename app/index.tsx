import { useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { api } from "../src/api";
import { setAuthToken } from "../src/session";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("Weekend in Paris");
  const [token, setToken] = useState<string | null>(null);
  const [reply, setReply] = useState("Sign in or create a local account to start planning.");
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true);
    try {
      const result = await api.login(email, password);
      setAuthToken(result.token);
      setToken(result.token);
      router.replace("/planner");
    } catch (error) {
      setReply(error instanceof Error ? error.message : "Unable to sign in");
    } finally {
      setBusy(false);
    }
  }

  async function plan() {
    if (!token) return;
    setBusy(true);
    try {
      const result = await api.chat(token, "local", message);
      setReply(`${result.itinerary.trip_title}\n\n${result.itinerary.summary}`);
    } catch (error) {
      setReply(error instanceof Error ? error.message : "Unable to plan trip");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>NOW</Text>
        <Text style={styles.title}>Not ordinary weekend.</Text>
        <Text style={styles.subtitle}>A local-first travel planner for your next good story.</Text>
        <View style={styles.panel}>
          {!token ? <>
            <Text style={styles.heading}>Start planning</Text>
            <TextInput accessibilityLabel="Email" autoCapitalize="none" placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
            <TextInput accessibilityLabel="Password" placeholder="Password (6+ characters)" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
            <Pressable style={styles.button} onPress={signIn} disabled={busy}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
            </Pressable>
            <Pressable onPress={() => router.push("/signup")}><Text style={styles.link}>Create a new account</Text></Pressable>
          </> : <>
            <Text style={styles.heading}>Where to next?</Text>
            <TextInput accessibilityLabel="Trip request" value={message} onChangeText={setMessage} style={styles.input} />
            <Pressable style={styles.button} onPress={plan} disabled={busy}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Plan my escape</Text>}
            </Pressable>
          </>}
          <Text style={styles.reply}>{reply}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9f6f0" },
  container: { flex: 1, justifyContent: "center", padding: 24, maxWidth: 620, width: "100%", alignSelf: "center" },
  eyebrow: { color: "#d95a41", fontSize: 16, fontWeight: "700", letterSpacing: 2 },
  title: { color: "#1a1a1a", fontSize: 38, fontWeight: "700", marginTop: 8 },
  subtitle: { color: "#6b6b6b", fontSize: 17, lineHeight: 25, marginTop: 12, marginBottom: 28 },
  panel: { backgroundColor: "#fff", borderColor: "#e5e0d8", borderWidth: 1, borderRadius: 16, padding: 20 },
  heading: { color: "#1a1a1a", fontSize: 22, fontWeight: "600", marginBottom: 14 },
  input: { borderColor: "#d7d0c5", borderWidth: 1, borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 16, color: "#1a1a1a" },
  button: { backgroundColor: "#d95a41", borderRadius: 10, minHeight: 48, alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  link: { color: "#b5412a", fontSize: 14, textAlign: "center", marginTop: 16 },
  hint: { color: "#6b6b6b", fontSize: 13, lineHeight: 19, marginTop: 14 },
  reply: { color: "#333", fontSize: 16, lineHeight: 24, marginTop: 20 },
});
