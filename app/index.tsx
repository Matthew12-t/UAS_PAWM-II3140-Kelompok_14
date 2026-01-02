import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Image } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../lib/supabase";

export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status after splash screen finishes
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Small delay for smooth transition
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (session) {
          // User is logged in, go to dashboard
          router.replace("/(tabs)");
        } else {
          // User is not logged in, go to login
          router.replace("/login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // On error, default to login
        router.replace("/login");
      }
    };

    checkAuth();
  }, []);

  // Loading screen while checking auth
  return (
    <LinearGradient
      colors={["#0f172a", "#312e81", "#1e1b4b"]}
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Image 
        source={require("../assets/chemlab.png")} 
        style={{ width: 80, height: 80, borderRadius: 16, marginBottom: 20 }}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#a5b4fc" />
      <Text style={{ color: "#a5b4fc", marginTop: 16, fontSize: 16 }}>
        Loading...
      </Text>
    </LinearGradient>
  );
}
