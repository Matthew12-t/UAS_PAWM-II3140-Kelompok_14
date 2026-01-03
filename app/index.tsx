import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Image } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../lib/supabase";

export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (session) {
          router.replace("/(tabs)");
        } else {
          router.replace("/login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.replace("/login");
      }
    };

    checkAuth();
  }, []);

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
