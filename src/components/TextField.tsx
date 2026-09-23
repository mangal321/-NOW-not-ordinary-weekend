import { useState } from "react";
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors, radius, type } from "../theme";

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secure?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  error?: string;
  returnKeyType?: "done" | "next" | "go" | "send";
  onSubmitEditing?: () => void;
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secure = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  error,
  returnKeyType = "next",
  onSubmitEditing,
}: Props) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secure);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.box,
          focused && styles.boxFocused,
          error ? styles.boxError : null,
        ]}
      >
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.faint}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={styles.input}
        />
        {secure ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
            onPress={() => setHidden((v) => !v)}
            style={styles.toggle}
          >
            <Text style={styles.toggleText}>{hidden ? "Show" : "Hide"}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: {
    color: colors.textDim,
    fontSize: type.small,
    fontWeight: "600",
    marginBottom: 8,
  },
  box: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  boxFocused: { borderColor: colors.goldBorder },
  boxError: { borderColor: colors.danger },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: type.body,
    paddingVertical: 12,
  },
  toggle: { paddingLeft: 12, paddingVertical: 8 },
  toggleText: { color: colors.gold, fontSize: type.small, fontWeight: "700" },
  error: { color: colors.danger, fontSize: type.small, marginTop: 6 },
});
