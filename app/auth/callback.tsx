import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../lib/supabase";
import * as Linking from "expo-linking";

const isWeb = Platform.OS === 'web';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Memverifikasi...");

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      let url: string | null = null;

      // Get URL differently for web and mobile
      if (isWeb && typeof window !== 'undefined') {
        url = window.location.href;
      } else {
        url = await Linking.getInitialURL();
      }
      
      if (url) {
        const parsedUrl = Linking.parse(url);
        
        if (url.includes("access_token") || url.includes("refresh_token")) {
          const hashParams = url.split("#")[1];
          if (hashParams) {
            const urlParams = new URLSearchParams(hashParams);
            const accessToken = urlParams.get("access_token");
            const refreshToken = urlParams.get("refresh_token");
            const type = urlParams.get("type");

            if (accessToken && refreshToken) {
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
                
                setTimeout(() => {
                  router.replace("/(tabs)");
                }, 1500);
                return;
              }

              setStatus("success");
              setMessage("Autentikasi berhasil! Mengalihkan...");
              setTimeout(() => {
                router.replace("/(tabs)");
              }, 1500);
              return;
            }
          }
        }

        if (url.includes("error")) {
          const hashParams = url.split("#")[1] || url.split("?")[1];
          if (hashParams) {
            const urlParams = new URLSearchParams(hashParams);
            const errorDescription = urlParams.get("error_description");
            throw new Error(errorDescription || "Verification failed");
          }
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setStatus("success");
        setMessage("Sudah login! Mengalihkan...");
        setTimeout(() => {
          router.replace("/(tabs)");
        }, 1500);
      } else {
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
