import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../lib/supabase";
import * as Linking from "expo-linking";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Memverifikasi email...");

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      // Get the full URL
      const url = await Linking.getInitialURL();
      
      if (url) {
        // Parse the URL to extract tokens
        const parsedUrl = Linking.parse(url);
        
        // Check for access_token in the URL fragment (hash)
        // Supabase sends tokens in the URL fragment after email verification
        if (url.includes("access_token") || url.includes("refresh_token")) {
          // Extract tokens from URL
          const hashParams = url.split("#")[1];
          if (hashParams) {
            const urlParams = new URLSearchParams(hashParams);
            const accessToken = urlParams.get("access_token");
            const refreshToken = urlParams.get("refresh_token");
            const type = urlParams.get("type");

            if (accessToken && refreshToken) {
              // Set the session with the tokens
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (error) {
                throw error;
              }

              if (type === "signup" || type === "email") {
                setStatus("success");
                setMessage("Email berhasil diverifikasi! Mengalihkan...");
                
                // Redirect to main app after short delay
                setTimeout(() => {
                  router.replace("/(tabs)");
                }, 1500);
                return;
              }

              // For other auth types (recovery, etc.)
              setStatus("success");
              setMessage("Autentikasi berhasil! Mengalihkan...");
              setTimeout(() => {
                router.replace("/(tabs)");
              }, 1500);
              return;
            }
          }
        }

        // Check for error in URL
        if (url.includes("error")) {
          const hashParams = url.split("#")[1] || url.split("?")[1];
          if (hashParams) {
            const urlParams = new URLSearchParams(hashParams);
            const errorDescription = urlParams.get("error_description");
            throw new Error(errorDescription || "Verification failed");
          }
        }
      }

      // If we reach here, check if there's already a valid session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setStatus("success");
        setMessage("Sudah login! Mengalihkan...");
        setTimeout(() => {
          router.replace("/(tabs)");
        }, 1500);
      } else {
        // No session, redirect to login
        setStatus("success");
        setMessage("Silakan login untuk melanjutkan");
        setTimeout(() => {
          router.replace("/login");
        }, 1500);
      }
    } catch (error: any) {
      console.error("Auth callback error:", error);
      setStatus("error");
      setMessage(error.message || "Terjadi kesalahan saat verifikasi");
      
      // Redirect to login after showing error
      setTimeout(() => {
        router.replace("/login");
      }, 3000);
    }
  };

  return (
    <LinearGradient
      colors={["#0f172a", "#312e81", "#1e1b4b"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}
    >
      <View style={{
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 20,
        padding: 40,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
      }}>
        {status === "loading" && (
          <ActivityIndicator size="large" color="#a5b4fc" style={{ marginBottom: 20 }} />
        )}
        
        {status === "success" && (
          <Text style={{ fontSize: 48, marginBottom: 20 }}>✅</Text>
        )}
        
        {status === "error" && (
          <Text style={{ fontSize: 48, marginBottom: 20 }}>❌</Text>
        )}

        <Text style={{ 
          color: "white", 
          fontSize: 18, 
          fontWeight: "600",
          textAlign: "center",
          marginBottom: 8
        }}>
          {status === "loading" ? "Memproses..." : status === "success" ? "Berhasil!" : "Gagal"}
        </Text>
        
        <Text style={{ 
          color: "#a5b4fc", 
          fontSize: 14, 
          textAlign: "center" 
        }}>
          {message}
        </Text>
      </View>
    </LinearGradient>
  );
}
