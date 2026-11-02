import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  type TextInputInstance,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { StateLayer } from "@/components/ui/state-layer";
import { Spacing } from "@/constants/theme";
import { IS_AUTH_MOCKED, useSession } from "@/context/session";
import { GoogleSignInError, isGoogleSignInAvailable } from "@/lib/google-auth";
import { BrandColors, ComponentShape, Disabled, useAppTheme } from "@/theme";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { dark, colors } = useAppTheme();
  const google = BrandColors.google[dark ? "dark" : "light"];
  const { signIn, signInWithGoogle } = useSession();
  const passwordRef = useRef<TextInputInstance>(null);

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
              <ThemedText type="headlineMedium">Bem vindo</ThemedText>
              <ThemedText themeColor="onSurfaceVariant">
                Faca login para continuar
              </ThemedText>
            </View>

            <View style={styles.form}>
              <FormField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                editable={!isBusy}
              />

              <View>
                <FormField
                  ref={passwordRef}
                  label="Senha"
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Your password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="current-password"
                  textContentType="password"
                  returnKeyType="go"
                  onSubmitEditing={handleSubmit}
                  editable={!isBusy}
                />
                <Button
                  label={showPassword ? "Hide" : "Show"}
                  variant="text"
                  tone="secondary"
                  onPress={() => setShowPassword((value) => !value)}
                  accessibilityLabel={
                    showPassword ? "Hide password" : "Show password"
                  }
                  style={styles.togglePassword}
                />
              </View>

              {error && (
                <ThemedText
                  type="bodyMedium"
                  themeColor="error"
                  accessibilityRole="alert"
                >
                  {error}
                </ThemedText>
              )}

              <Button
                label="Sign in"
                size="medium"
                fullWidth
                loading={isSubmitting}
                disabled={isGoogleSubmitting}
                onPress={handleSubmit}
                style={styles.submit}
              />

              {isGoogleSignInAvailable && (
                <>
                  <View style={styles.divider}>
                    <View
                      style={[
                        styles.dividerLine,
                        { backgroundColor: colors.outlineVariant },
                      ]}
                    />
                    <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
                      ou
                    </ThemedText>
                    <View
                      style={[
                        styles.dividerLine,
                        { backgroundColor: colors.outlineVariant },
                      ]}
                    />
                  </View>

                  {/* Google sign-in button: colors follow Google's branding, not the app theme. */}
                  <Pressable
                    onPress={handleGoogleSignIn}
                    disabled={isBusy}
                    accessibilityRole="button"
                    accessibilityLabel="Continuar com Google"
                    style={[
                      styles.googleButton,
                      {
                        backgroundColor: google.container,
                        borderColor: google.outline,
                      },
                      isBusy && !isGoogleSubmitting && styles.disabled,
                    ]}
                  >
                    {({ pressed }) => (
                      <>
                        <StateLayer color={google.content} pressed={pressed} />
                        {isGoogleSubmitting ? (
                          <ActivityIndicator color={google.content} />
                        ) : (
                          <>
                            <ThemedText
                              type="titleLarge"
                              emphasized
                              style={{ color: BrandColors.google.mark }}
                            >
                              G
                            </ThemedText>
                            <ThemedText
                              type="titleMedium"
                              style={{ color: google.content }}
                            >
                              Continuar com Google
                            </ThemedText>
                          </>
                        )}
                      </>
                    )}
                  </Pressable>
                </>
              )}

              <View style={styles.signupRow}>
                <ThemedText type="bodyMedium" themeColor="onSurfaceVariant">
                  Não tem conta?
                </ThemedText>
                <Button
                  label="Criar conta"
                  variant="text"
                  tone="secondary"
                  onPress={() => router.push("/signup")}
                  disabled={isBusy}
                  accessibilityRole="link"
                />
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
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.five,
    gap: Spacing.five,
  },
  header: {
    gap: Spacing.two,
  },
  form: {
    gap: Spacing.three,
  },
  passwordInput: {
    paddingRight: Spacing.six + Spacing.three,
  },
  togglePassword: {
    position: "absolute",
    right: Spacing.one,
    bottom: Spacing.two,
  },
  submit: {
    marginTop: Spacing.two,
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
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    borderRadius: ComponentShape.button,
    borderWidth: 1,
    overflow: "hidden",
  },
  disabled: {
    opacity: Disabled.content,
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.one,
    marginTop: Spacing.two,
  },
});
