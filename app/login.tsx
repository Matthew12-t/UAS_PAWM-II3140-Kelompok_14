import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, Animated, Easing, Image } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Input } from "../components/ui/input";
import { supabase, signInWithGoogle } from "../lib/supabase";
import * as WebBrowser from 'expo-web-browser';

// Warm up browser untuk Google OAuth
WebBrowser.maybeCompleteAuthSession();

// Animated Floating Icon Component
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Login Logic
  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.replace("/(tabs)");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await signInWithGoogle();
      
      if (error) {
        const errorMessage = (error as any).message || 'Google sign in failed';
        setError(errorMessage);
      } else if (data?.session) {
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#0f172a", "#312e81", "#1e1b4b"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      {/* Animated Background Icons */}
      <View style={{ position: "absolute", width: "100%", height: "100%" }} pointerEvents="none">
        <FloatingIcon emoji="⚛️" size={56} top={30} left={15} delay={0} />
        <FloatingIcon emoji="🧪" size={44} top={100} right={15} delay={1000} />
        <FloatingIcon emoji="🔬" size={52} bottom={60} left={40} delay={2000} />
        <FloatingIcon emoji="⚗️" size={44} bottom={140} right={25} delay={1500} />
        <FloatingIcon emoji="🧬" size={60} top={280} left={-10} delay={500} />
      </View>

      {/* Content */}
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 28 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Image 
              source={require("../assets/chemlab.png")} 
              style={{ width: 40, height: 40, borderRadius: 8 }}
              resizeMode="contain"
            />
            <Text style={{ fontSize: 36, fontWeight: "bold", color: "white", marginLeft: 8 }}>ChemLab</Text>
          </View>
          <Text style={{ color: "#a5b4fc", fontSize: 16 }}>Virtual Chemistry Laboratory</Text>
        </View>

        {/* Login Card */}
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
          {/* Email Input */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 }}>
              Email
            </Text>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!loading}
            />
          </View>

          {/* Password Input */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 }}>
              Password
            </Text>
            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="password"
              editable={!loading}
            />
          </View>

          {/* Error Message */}
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

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
            style={{
              backgroundColor: loading ? "#a5b4fc" : "#6366f1",
              borderRadius: 8,
              paddingVertical: 14,
              alignItems: "center",
              marginTop: 4,
            }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
              {loading ? "Signing in..." : "Sign In"}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
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

          {/* Google Button */}
          <TouchableOpacity
            onPress={handleGoogleLogin}
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
            <Text style={{ color: "#374151", fontSize: 15, fontWeight: "500" }}>Sign in with Google</Text>
          </TouchableOpacity>

          {/* Footer Link */}
          <View style={{ marginTop: 24, flexDirection: "row", justifyContent: "center" }}>
            <Text style={{ color: "#6b7280", fontSize: 14 }}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={{ color: "#6366f1", fontWeight: "600", fontSize: 14 }}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}