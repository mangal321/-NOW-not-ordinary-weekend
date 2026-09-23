import { useEffect, useState } from "react";
import { Alert, Linking, Pressable, SafeAreaView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { colors, shadow, spacing } from "../src/theme";

const CONTACT_KEY = "now_emergency_contact";

export default function SOS() {
  const router = useRouter();
  const [contact, setContact] = useState("");
  const [savedContact, setSavedContact] = useState("");
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CONTACT_KEY).then((value) => {
      setContact(value || "");
      setSavedContact(value || "");
    });
  }, []);

  function saveContact() {
    const value = contact.trim();
    if (!value) {
      Alert.alert("Add a contact", "Enter a phone number before saving.");
      return;
    }
    setContact(value);
    setSavedContact(value);
    AsyncStorage.setItem(CONTACT_KEY, value).catch(() => undefined);
    Alert.alert("Contact saved", "This number will be used only when you choose to share your location.");
  }

  async function shareCurrentLocation() {
    if (!savedContact) {
      Alert.alert("Add an emergency contact", "Save a trusted contact first.");
      return;
    }
    setSharing(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Location permission needed", "Allow location access to create a current-location message.");
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = position.coords;
      const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
      const message = `I may need help. My current location is: ${mapsUrl}`;
      if (typeof navigator !== "undefined" && /Android|iPhone|iPad/i.test(navigator.userAgent || "")) {
        await Linking.openURL(`sms:${encodeURIComponent(savedContact)}?body=${encodeURIComponent(message)}`);
      } else {
        await Share.share({ message });
      }
    } catch (error) {
      Alert.alert("Could not share location", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setSharing(false);
    }
  }

  async function callEmergencyServices() {
    await Linking.openURL("tel:112");
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Pressable onPress={() => router.back()} accessibilityRole="button">
          <Text style={styles.back}>← Back</Text>
        </Pressable>

        <View style={styles.hero}>
          <View style={styles.icon}>
            <Text style={styles.iconText}>SOS</Text>
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.title}>Need help?</Text>
            <Text style={styles.subtitle}>
              Save a trusted contact, then choose when to share your coordinates. Nothing is sent automatically.
            </Text>
          </View>
        </View>

        <View style={styles.contactPanel}>
          <Text style={styles.label}>Emergency contact</Text>
          <TextInput
            accessibilityLabel="Emergency contact phone number"
            placeholder="Phone number with country code"
            placeholderTextColor={colors.faint}
            keyboardType="phone-pad"
            value={contact}
            onChangeText={setContact}
            style={styles.input}
          />
          <Pressable accessibilityRole="button" onPress={saveContact} style={styles.saveButton}>
            <Text style={styles.saveText}>{savedContact ? "Update contact" : "Save contact"}</Text>
          </Pressable>
          {savedContact ? (
            <View style={styles.savedRow}>
              <View style={styles.savedDot} />
              <Text style={styles.savedText}>Ready — {savedContact}</Text>
            </View>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share current location with emergency contact"
          style={({ pressed }) => [styles.locationButton, pressed && styles.buttonPressed]}
          onPress={shareCurrentLocation}
          disabled={sharing}
        >
          <Text style={styles.locationText}>{sharing ? "Getting your location…" : "Share my current location"}</Text>
          <Text style={styles.arrow}>→</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Call emergency services"
          style={({ pressed }) => [styles.emergencyButton, pressed && styles.buttonPressed]}
          onPress={callEmergencyServices}
        >
          <Text style={styles.emergencyText}>Call emergency services</Text>
          <Text style={styles.number}>112</Text>
        </Pressable>

        <Text style={styles.note}>
          Your device will ask for location permission. On mobile, sharing opens SMS addressed to the saved contact;
          on web, it opens the system share sheet.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, justifyContent: "center", padding: spacing.lg, maxWidth: 620, width: "100%", alignSelf: "center" },

  back: { color: colors.muted, fontWeight: "700", marginBottom: spacing.xl, fontSize: 14 },

  hero: { flexDirection: "row", gap: 16, alignItems: "center", marginBottom: spacing.lg },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.card,
  },
  iconText: { color: "#fff", fontSize: 17, fontWeight: "800", letterSpacing: 1.5 },
  heroCopy: { flex: 1, gap: 6 },
  title: { color: colors.text, fontSize: 32, lineHeight: 38, fontWeight: "800" },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21 },

  contactPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSoft,
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: 12,
    ...shadow.card,
  },
  label: { color: colors.textDim, fontWeight: "700", fontSize: 13, marginBottom: 8, letterSpacing: 0.3 },
  input: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    marginBottom: 4,
    backgroundColor: colors.surface2,
    color: colors.text,
  },
  saveButton: { alignItems: "center", paddingVertical: 10 },
  saveText: { color: colors.gold, fontWeight: "800" },
  savedRow: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 8, justifyContent: "center" },
  savedDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success },
  savedText: { color: colors.success, fontSize: 12, fontWeight: "700" },

  locationButton: {
    backgroundColor: colors.gold,
    borderRadius: 16,
    minHeight: 62,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadow.card,
  },
  buttonPressed: { opacity: 0.88, transform: [{ scale: 0.995 }] },
  locationText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  arrow: { color: "#fff", fontSize: 24 },

  emergencyButton: {
    backgroundColor: colors.danger,
    borderRadius: 16,
    minHeight: 58,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  emergencyText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  number: { color: "#fff", fontSize: 23, fontWeight: "800" },

  note: { color: colors.faint, fontSize: 12, lineHeight: 18, marginTop: spacing.lg },
});
