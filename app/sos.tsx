import { useEffect, useState } from "react";
import { Alert, Linking, Pressable, SafeAreaView, Share, StyleSheet, Text, TextInput, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useRouter } from "expo-router";

const CONTACT_KEY = "now_emergency_contact";

export default function SOS() {
  const router = useRouter();
  const [contact, setContact] = useState("");
  const [savedContact, setSavedContact] = useState("");
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CONTACT_KEY).then((value) => { setContact(value || ""); setSavedContact(value || ""); });
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
        <Pressable onPress={() => router.back()} accessibilityRole="button"><Text style={styles.back}>Back to planner</Text></Pressable>
        <View style={styles.icon}><Text style={styles.iconText}>SOS</Text></View>
        <Text style={styles.title}>Need help?</Text>
        <Text style={styles.subtitle}>Save a trusted contact, then choose when to share your current coordinates. Nothing is sent automatically.</Text>
        <View style={styles.contactPanel}>
          <Text style={styles.label}>Emergency contact</Text>
          <TextInput accessibilityLabel="Emergency contact phone number" placeholder="Phone number with country code" keyboardType="phone-pad" value={contact} onChangeText={setContact} style={styles.input} />
          <Pressable accessibilityRole="button" onPress={saveContact} style={styles.saveButton}><Text style={styles.saveText}>{savedContact ? "Update contact" : "Save contact"}</Text></Pressable>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Share current location with emergency contact" style={styles.locationButton} onPress={shareCurrentLocation} disabled={sharing}><Text style={styles.locationText}>{sharing ? "Getting your location..." : "Share my current location"}</Text><Text style={styles.arrow}>→</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Call emergency services" style={styles.emergencyButton} onPress={callEmergencyServices}><Text style={styles.emergencyText}>Call emergency services</Text><Text style={styles.number}>112</Text></Pressable>
        <Text style={styles.note}>Your device will ask for location permission. On mobile, sharing opens SMS addressed to the saved contact; on web, it opens the system share sheet.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: "#fff8f6" }, container: { flex: 1, justifyContent: "center", padding: 24, maxWidth: 620, width: "100%", alignSelf: "center" }, back: { color: "#9c3025", fontWeight: "600", marginBottom: 34 }, icon: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#b23a3a", alignItems: "center", justifyContent: "center", marginBottom: 18 }, iconText: { color: "#fff", fontSize: 18, fontWeight: "800", letterSpacing: 1 }, title: { color: "#351b1b", fontSize: 38, fontWeight: "700" }, subtitle: { color: "#654c4c", fontSize: 16, lineHeight: 24, marginTop: 10, marginBottom: 20 }, contactPanel: { backgroundColor: "#fff", borderColor: "#ead9d5", borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 12 }, label: { color: "#654c4c", fontWeight: "700", marginBottom: 8 }, input: { borderColor: "#d9aaa5", borderWidth: 1, borderRadius: 9, padding: 12, fontSize: 15, marginBottom: 9 }, saveButton: { alignItems: "center", paddingVertical: 8 }, saveText: { color: "#9c3025", fontWeight: "700" }, locationButton: { backgroundColor: "#9c3025", borderRadius: 12, minHeight: 60, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, locationText: { color: "#fff", fontSize: 16, fontWeight: "700" }, arrow: { color: "#fff", fontSize: 24 }, emergencyButton: { backgroundColor: "#b23a3a", borderRadius: 12, minHeight: 58, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 }, emergencyText: { color: "#fff", fontSize: 16, fontWeight: "700" }, number: { color: "#fff", fontSize: 23, fontWeight: "800" }, note: { color: "#806d6d", fontSize: 12, lineHeight: 18, marginTop: 18 }, });
