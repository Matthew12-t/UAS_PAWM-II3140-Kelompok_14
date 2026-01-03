import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, Animated, Easing, Image, Modal, Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Input } from "../components/ui/input";
import { supabase, signInWithGoogle } from "../lib/supabase";
import * as WebBrowser from 'expo-web-browser';
import { WebConstrainedScrollView } from "../components/WebContainer";
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

// Get redirect URL for email verification
const redirectUrl = AuthSession.makeRedirectUri({
  scheme: 'chemlab',
  path: 'auth/callback',
});

const FloatingIcon = ({ 
  emoji, 
  size, 
  top, 
  left, 
  right,
  bottom,
  delay = 0 
}: { 
  emoji: string; 
  size: number; 
  top?: number; 
  left?: number;
  right?: number;
  bottom?: number;
  delay?: number;
}) => {
  const opacity = useRef(new Animated.Value(0.15)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 1500,
          delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.15,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.Text
      style={{
        position: "absolute",
        top,
        left,
        right,
        bottom,
        fontSize: size,
        opacity,
      }}
    >
      {emoji}
    </Animated.Text>
  );
};

export default function SignupScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError(null);
    }
  };

  // Signup Logic
  const handleSignup = async () => {
    setError(null);

    if (!fullName.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: redirectUrl,
        },
      });

      if (signupError) {
        setError(signupError.message);
        setLoading(false);
      } else {
        setLoading(false);
        if (Platform.OS === 'web') {
          setShowSuccessModal(true);
        } else {
          Alert.alert(
            "Success!",
            "Account created successfully. Please check your email for verification.",
            [{ text: "OK", onPress: () => router.replace("/login") }]
          );
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await signInWithGoogle();
      
      if (error) {
        const errorMessage = (error as any).message || 'Google sign up failed';
        setError(errorMessage);
      } else if ((data as any)?.session) {
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = fullName.trim() && email && password && !emailError;

  return (
    <LinearGradient
      colors={["#0f172a", "#312e81", "#1e1b4b"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowSuccessModal(false);
          router.replace("/login");
        }}
      >
        <View style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}>
          <View style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: 24,
            width: "100%",
            maxWidth: 340,
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 10,
          }}>
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "#dcfce7",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}>
              <Text style={{ fontSize: 28 }}>✓</Text>
            </View>
            <Text style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#1f2937",
              marginBottom: 8,
              textAlign: "center",
            }}>
              Success!
            </Text>
            <Text style={{
              fontSize: 14,
              color: "#6b7280",
              textAlign: "center",
              marginBottom: 20,
              lineHeight: 20,
            }}>
              Account created successfully. Please check your email for verification.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowSuccessModal(false);
                router.replace("/login");
              }}
              style={{
                backgroundColor: "#6366f1",
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 32,
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ position: "absolute", width: "100%", height: "100%" }} pointerEvents="none">
        <FloatingIcon emoji="⚛️" size={56} top={30} left={15} delay={0} />
        <FloatingIcon emoji="🧪" size={44} top={100} right={15} delay={1000} />
        <FloatingIcon emoji="🔬" size={52} bottom={60} left={40} delay={2000} />
        <FloatingIcon emoji="⚗️" size={44} bottom={140} right={25} delay={1500} />
        <FloatingIcon emoji="🧬" size={60} top={280} left={-10} delay={500} />
      </View>

      <WebConstrainedScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}
        showsVerticalScrollIndicator={false}
        maxWidth={420}
      >
        <View style={{ alignItems: "center", marginBottom: 28 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Image 
              source={require("../assets/chemlab.png")} 
              style={{ width: 40, height: 40, borderRadius: 8 }}
              resizeMode="contain"
            />
            <Text style={{ fontSize: 36, fontWeight: "bold", color: "white", marginLeft: 8 }}>ChemLab</Text>
          </View>
          <Text style={{ color: "#a5b4fc", fontSize: 16 }}>Create Your Account</Text>
        </View>

        <View style={{ 
          backgroundColor: "rgba(255, 255, 255, 0.97)", 
          borderRadius: 16, 
          padding: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        }}>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 }}>
              Full Name
            </Text>
            <Input
              value={fullName}
              onChangeText={setFullName}
              placeholder="John Doe"
              autoCapitalize="words"
              autoComplete="name"
              editable={!loading}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 }}>
              Email
            </Text>
            <Input
              value={email}
              onChangeText={handleEmailChange}
              placeholder="your@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!loading}
            />
            {emailError && (
              <Text style={{ marginTop: 4, fontSize: 12, color: "#dc2626" }}>{emailError}</Text>
            )}
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 }}>
              Password
            </Text>
            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="new-password"
              editable={!loading}
            />
            <Text style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
              Minimum 6 characters
            </Text>
          </View>

          {error && (
            <View style={{ 
              padding: 12, 
              backgroundColor: "#fef2f2", 
              borderWidth: 1, 
              borderColor: "#fecaca", 
              borderRadius: 8,
              marginBottom: 16
            }}>
              <Text style={{ color: "#b91c1c", fontSize: 14 }}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading || !isFormValid}
            activeOpacity={0.8}
            style={{
              backgroundColor: (loading || !isFormValid) ? "#a5b4fc" : "#6366f1",
              borderRadius: 8,
              paddingVertical: 14,
              alignItems: "center",
              marginTop: 4,
            }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
              {loading ? "Creating account..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <View style={{ marginVertical: 24, position: "relative", height: 20, justifyContent: "center" }}>
            <View style={{ 
              position: "absolute", 
              left: 0, 
              right: 0, 
              height: 1, 
              backgroundColor: "#e5e7eb" 
            }} />
            <View style={{ alignItems: "center" }}>
              <Text style={{ 
                backgroundColor: "rgba(255, 255, 255, 0.97)", 
                paddingHorizontal: 12, 
                color: "#9ca3af", 
                fontSize: 13 
              }}>
                Or continue with
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleGoogleSignup}
            disabled={loading}
            activeOpacity={0.7}
            style={{
              backgroundColor: "white",
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#e5e7eb",
            }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 18, color: "#4285F4", marginRight: 8 }}>G</Text>
            <Text style={{ color: "#374151", fontSize: 15, fontWeight: "500" }}>Sign up with Google</Text>
          </TouchableOpacity>

          <View style={{ marginTop: 24, flexDirection: "row", justifyContent: "center" }}>
            <Text style={{ color: "#6b7280", fontSize: 14 }}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={{ color: "#6366f1", fontWeight: "600", fontSize: 14 }}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </WebConstrainedScrollView>
    </LinearGradient>
  );
}
