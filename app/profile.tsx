import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import { api, User } from "../src/api";
import { authToken, clearAuthToken } from "../src/session";
import { colors, common, shadow, spacing } from "../src/theme";
import { AppHeader } from "../src/components/AppHeader";
import { Button } from "../src/components/Button";

const interestOptions = ["food", "nature", "culture", "adventure", "nightlife", "relaxation"];

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [city, setCity] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [busy, setBusy] = useState(true);
  const [saved, setSaved] = useState(false);
  const token = authToken;

  useEffect(() => {
    if (!token) return;
    api
      .me(token)
      .then((value) => {
        setUser(value);
        setCity(value.home_city || "");
        setInterests(value.interests || []);
      })
      .finally(() => setBusy(false));
  }, [token]);

  if (!token) return <Redirect href="/login" />;

  async function save() {
    if (!authToken) return;
    setBusy(true);
    const value = await api.updateMe(authToken, { home_city: city, interests });
    setUser(value);
    setSaved(true);
    setBusy(false);
  }

  function signOut() {
    clearAuthToken();
    router.replace("/");
  }

  if (busy && !user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} />
        </View>
      </SafeAreaView>
    );
  }

  const initial = (user?.name || "?").trim().charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader active="profile" />
      <View style={styles.page}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={common.kicker}>YOUR PROFILE</Text>
          <Text style={styles.heading}>The traveller.</Text>

          <View style={styles.card}>
            <View style={styles.identity}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
              <View style={styles.identityCopy}>
                <Text style={styles.name}>{user?.name}</Text>
                <Text style={styles.email}>{user?.email}</Text>
              </View>
            </View>

            <Text style={styles.label}>Home city</Text>
            <TextInput
              accessibilityLabel="Home city"
              placeholder="Where are you based?"
              placeholderTextColor={colors.faint}
              value={city}
              onChangeText={setCity}
              style={styles.input}
            />

            <Text style={styles.label}>Interests</Text>
            <View style={styles.tags}>
              {interestOptions.map((interest) => {
                const isSelected = interests.includes(interest);
                return (
                  <Pressable
                    key={interest}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() =>
                      setInterests((current) =>
                        current.includes(interest)
                          ? current.filter((item) => item !== interest)
                          : [...current, interest]
                      )
                    }
                    style={[styles.tag, isSelected && styles.tagSelected]}
                  >
                    <Text style={isSelected ? styles.tagTextSelected : styles.tagText}>{interest}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Button title={saved ? "Saved ✓" : "Save preferences"} onPress={save} loading={busy} style={styles.saveButton} />
            <Pressable accessibilityRole="button" onPress={signOut} style={styles.signOutButton}>
              <Text style={styles.signOut}>Sign out</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg },
  page: { flex: 1, maxWidth: 760, width: "100%", alignSelf: "center" },
  content: { padding: spacing.lg, paddingBottom: 60 },

  heading: { color: colors.text, fontSize: 34, lineHeight: 40, fontWeight: "800", marginTop: 9, marginBottom: 18 },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 20,
    padding: spacing.lg,
    ...shadow.card,
  },

  identity: { flexDirection: "row", alignItems: "center", gap: 16, marginBottom: spacing.lg },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.goldBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.gold, fontSize: 26, fontWeight: "800" },
  identityCopy: { gap: 3 },
  name: { color: colors.text, fontSize: 28, fontWeight: "800" },
  email: { color: colors.muted, fontSize: 14 },

  label: { color: colors.textDim, fontWeight: "700", fontSize: 13, marginTop: 16, marginBottom: 8, letterSpacing: 0.3 },
  input: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 13,
    backgroundColor: colors.surface2,
    color: colors.text,
    fontSize: 15,
  },

  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.surface2,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  tagSelected: { backgroundColor: colors.teal, borderColor: colors.teal },
  tagText: { color: colors.textDim, fontWeight: "600", textTransform: "capitalize" },
  tagTextSelected: { color: "#fff", fontWeight: "700", textTransform: "capitalize" },

  saveButton: { marginTop: spacing.xl },
  signOutButton: { alignItems: "center", marginTop: spacing.lg, padding: 6 },
  signOut: { color: colors.danger, fontWeight: "700" },
});
