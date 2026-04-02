import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginUser, registerUser } from "../utils/api";
import { Ionicons } from "@expo/vector-icons";
import { Toast } from "../components/Toast";

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        router.replace("/home");
      }
    };
    checkLogin();
  }, []);

  const handleAuth = async () => {
    setError("");
    setLoading(true);
    try {
      const userData = isLogin
        ? { email: email.trim(), password }
        : { email: email.trim(), password, username: username.trim() };

      const { data } = isLogin
        ? await loginUser(userData)
        : await registerUser(userData);

      if (data && data.token) {
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("personalGroupId", data.personalGroup);
        
        setToastMessage(isLogin ? "Welcome back!" : "Account created successfully!");
        setToastType("success");
        setToastVisible(true);

        // Navigate after a delay to show the toast
        setTimeout(() => {
          router.replace("/home");
        }, 1500);
      } else {
        setError(data.message || "Authentication failed.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <Toast 
        visible={toastVisible} 
        message={toastMessage} 
        type={toastType} 
        onHide={() => setToastVisible(false)} 
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>

          <Text style={styles.title}>
            {isLogin ? "Welcome back" : "Create account"}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin
              ? "Login to access your shared lists"
              : "Start collaborating with family and friends"}
          </Text>
        </View>

        <View style={styles.formCard}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleBtn, isLogin && styles.toggleBtnActive]}
              onPress={() => {
                setIsLogin(true);
                setError("");
              }}
            >
              <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>
                Log in
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, !isLogin && styles.toggleBtnActive]}
              onPress={() => {
                setIsLogin(false);
                setError("");
              }}
            >
              <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>
                Sign up
              </Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="yourusername"
                placeholderTextColor="#9ca3af"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.passwordHeader}>
              <Text style={styles.label}>Password</Text>
              {isLogin && (
                <TouchableOpacity>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.continueBtn, loading && styles.continueBtnDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={styles.continueBtnText}>
              {loading ? "Please wait..." : "Continue"}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialBtn}>
              <Image
                source={{ uri: "https://img.icons8.com/color/24/000000/google-logo.png" }}
                style={styles.socialIcon}
              />
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-github" size={20} color="#000" />
              <Text style={styles.socialBtnText}>GitHub</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.termsText}>
            By continuing you agree to our{" "}
            <Text style={styles.linkText}>Terms</Text> and{" "}
            <Text style={styles.linkText}>Privacy</Text>.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6", // Light gray background
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1f2937",
    marginLeft: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },
  toggleTextActive: {
    color: "#4f46e5",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#111827",
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  forgotText: {
    fontSize: 12,
    color: "#4f46e5",
    fontWeight: "600",
  },
  continueBtn: {
    backgroundColor: "#4f46e5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  continueBtnDisabled: {
    backgroundColor: "#9ca3af",
  },
  continueBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#9ca3af",
  },
  socialContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    gap: 8,
  },
  socialIcon: {
    width: 20,
    height: 20,
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  termsText: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 18,
  },
  linkText: {
    color: "#6b7280",
    textDecorationLine: "underline",
  },
});
