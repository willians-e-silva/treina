import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Brand, Spacing } from "@/constants/theme";
import { IS_AUTH_MOCKED, useSession } from "@/context/session";
import { useTheme } from "@/hooks/use-theme";
import { GoogleSignInError, isGoogleSignInAvailable } from "@/lib/google-auth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const theme = useTheme();
  const { signIn, signInWithGoogle } = useSession();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const isBusy = isSubmitting || isGoogleSubmitting;

  async function handleGoogleSignIn() {
    setError(null);
    setIsGoogleSubmitting(true);
    try {
      // On success the root layout's guard swaps this screen for the main
      // flow, which shows its loading state before the tabs.
      if (!(await signInWithGoogle())) {
        setIsGoogleSubmitting(false);
      }
    } catch (e) {
      setError(
        e instanceof GoogleSignInError
          ? e.message
          : "Não foi possível entrar com o Google.",
      );
      setIsGoogleSubmitting(false);
    }
  }

  async function handleSubmit() {
    const trimmedEmail = email.trim();
    if (!IS_AUTH_MOCKED) {
      if (!EMAIL_PATTERN.test(trimmedEmail)) {
        setError("Enter a valid email address.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
    }

    setError(null);
    setIsSubmitting(true);
    try {
      // On success the root layout's guard swaps this screen for the tabs.
      await signIn(trimmedEmail, password);
    } catch {
      setError("Could not sign in. Check your credentials and try again.");
      setIsSubmitting(false);
    }
  }

  const inputStyle = [
    styles.input,
    { backgroundColor: theme.backgroundElement, color: theme.text },
  ];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <ThemedText type="subtitle">Bem vindo</ThemedText>
              <ThemedText themeColor="textSecondary">
                Faca login para continuar
              </ThemedText>
            </View>

            <View style={styles.form}>
              <View style={styles.field}>
                <ThemedText type="smallBold">Email</ThemedText>
                <TextInput
                  style={inputStyle}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={theme.textSecondary}
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  editable={!isBusy}
                />
              </View>

              <View style={styles.field}>
                <ThemedText type="smallBold">Senha</ThemedText>
                <View>
                  <TextInput
                    ref={passwordRef}
                    style={[inputStyle, styles.passwordInput]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Your password"
                    placeholderTextColor={theme.textSecondary}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="current-password"
                    textContentType="password"
                    returnKeyType="go"
                    onSubmitEditing={handleSubmit}
                    editable={!isBusy}
                  />
                  <Pressable
                    style={styles.togglePassword}
                    onPress={() => setShowPassword((value) => !value)}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword ? "Hide password" : "Show password"
                    }
                    hitSlop={8}
                  >
                    <ThemedText type="small" themeColor="textSecondary">
                      {showPassword ? "Hide" : "Show"}
                    </ThemedText>
                  </Pressable>
                </View>
              </View>

              {error && (
                <ThemedText
                  type="small"
                  style={styles.error}
                  accessibilityRole="alert"
                >
                  {error}
                </ThemedText>
              )}

              <Pressable
                onPress={handleSubmit}
                disabled={isBusy}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.button,
                  (pressed || isSubmitting) && styles.buttonPressed,
                ]}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <ThemedText style={styles.buttonText}>Sign in</ThemedText>
                )}
              </Pressable>

              {isGoogleSignInAvailable && (
                <>
                  <View style={styles.divider}>
                    <View
                      style={[
                        styles.dividerLine,
                        { backgroundColor: theme.backgroundSelected },
                      ]}
                    />
                    <ThemedText type="small" themeColor="textSecondary">
                      ou
                    </ThemedText>
                    <View
                      style={[
                        styles.dividerLine,
                        { backgroundColor: theme.backgroundSelected },
                      ]}
                    />
                  </View>

                  <Pressable
                    onPress={handleGoogleSignIn}
                    disabled={isBusy}
                    accessibilityRole="button"
                    accessibilityLabel="Continuar com Google"
                    style={({ pressed }) => [
                      styles.button,
                      styles.googleButton,
                      { borderColor: theme.backgroundSelected },
                      (pressed || isGoogleSubmitting) && styles.buttonPressed,
                    ]}
                  >
                    {isGoogleSubmitting ? (
                      <ActivityIndicator color="#1F1F1F" />
                    ) : (
                      <>
                        <ThemedText style={styles.googleLogo}>G</ThemedText>
                        <ThemedText style={styles.googleButtonText}>
                          Continuar com Google
                        </ThemedText>
                      </>
                    )}
                  </Pressable>
                </>
              )}

              <View style={styles.signupRow}>
                <ThemedText type="small" themeColor="textSecondary">
                  Não tem conta?
                </ThemedText>
                <Pressable
                  onPress={() => router.push("/signup")}
                  disabled={isBusy}
                  accessibilityRole="link"
                  hitSlop={Spacing.two}
                >
                  <ThemedText type="smallBold" style={styles.signupLink}>
                    Criar conta
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    gap: Spacing.five,
  },
  header: {
    gap: Spacing.two,
  },
  form: {
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.two,
  },
  input: {
    height: 52,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  passwordInput: {
    paddingRight: 64,
  },
  togglePassword: {
    position: "absolute",
    right: Spacing.three,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  error: {
    color: "#E5484D",
  },
  button: {
    height: 52,
    borderRadius: Spacing.three,
    backgroundColor: Brand.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.two,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: 600,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  googleButton: {
    flexDirection: "row",
    gap: Spacing.two,
    marginTop: 0,
    backgroundColor: "#ffffff",
    borderWidth: 1,
  },
  googleLogo: {
    color: "#4285F4",
    fontSize: 20,
    fontWeight: 700,
  },
  googleButtonText: {
    color: "#1F1F1F",
    fontWeight: 600,
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.one,
    marginTop: Spacing.two,
  },
  signupLink: {
    color: Brand.primary,
  },
});
