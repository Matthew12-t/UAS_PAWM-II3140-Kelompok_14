import React, { useState, useEffect, useCallback } from "react";
import { View } from "react-native";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Linking from "expo-linking";
import CustomSplashScreen from "../components/SplashScreen";
import { supabase } from "../lib/supabase";
import { AudioProvider } from "../lib/AudioContext";
import { ThemeProvider } from "../lib/ThemeContext";
import "../global.css";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [appIsReady, setAppIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const prepare = async () => {
      setAppIsReady(true);
    };
    prepare();
  }, []);

  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      console.log("Deep link received:", url);

      if (url.includes("access_token") || url.includes("auth/callback")) {
        try {
          const hashPart = url.split("#")[1];
          if (hashPart) {
            const params = new URLSearchParams(hashPart);
            const accessToken = params.get("access_token");
            const refreshToken = params.get("refresh_token");

            if (accessToken && refreshToken) {
              const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (!error) {
                router.replace("/(tabs)");
                return;
              }
            }
          }
        } catch (error) {
          console.error("Error handling deep link:", error);
        }
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && !showSplash) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, showSplash]);

  if (!appIsReady || showSplash) {
    return <CustomSplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <ThemeProvider>
      <AudioProvider>
        <View style={{ flex: 1, backgroundColor: '#0f172a' }} onLayout={onLayoutRootView}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="auth/callback" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen 
              name="pathway/[id]" 
              options={{ 
                headerShown: false,
                presentation: "modal",
                animation: "slide_from_right"
              }} 
            />
          </Stack>
        </View>
      </AudioProvider>
    </ThemeProvider>
  );
}
