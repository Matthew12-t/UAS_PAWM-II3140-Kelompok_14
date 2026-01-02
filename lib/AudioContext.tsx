import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Audio, AVPlaybackStatus } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AudioContextType {
  isPlaying: boolean;
  isMuted: boolean;
  isLoaded: boolean;
  toggleMusic: () => Promise<void>;
  setMusicEnabled: (enabled: boolean) => Promise<void>;
}

const AudioContext = createContext<AudioContextType>({
  isPlaying: false,
  isMuted: true,
  isLoaded: false,
  toggleMusic: async () => {},
  setMusicEnabled: async () => {},
});

export const useAudio = () => useContext(AudioContext);

const MUSIC_ENABLED_KEY = "@chemlab_music_enabled";

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted by default
  const [isLoaded, setIsLoaded] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    console.log("[Audio] Setting up audio...");
    setupAudio();

    return () => {
      console.log("[Audio] Cleaning up audio...");
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const setupAudio = async () => {
    try {
      // Set audio mode for background playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      console.log("[Audio] Audio mode set, loading sound file...");

      // Load the audio file
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/audio/lofi-study.mp3"),
        { 
          isLooping: true,
          volume: 0.3,
          shouldPlay: false,
        },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setIsLoaded(true);
      console.log("[Audio] Sound loaded successfully!");

      // Check if music should be enabled from saved preference
      const savedPreference = await AsyncStorage.getItem(MUSIC_ENABLED_KEY);
      console.log("[Audio] Saved preference:", savedPreference);
      
      if (savedPreference === "true") {
        console.log("[Audio] Playing from saved preference...");
        setIsMuted(false);
        await sound.playAsync();
      }
    } catch (error) {
      console.log("[Audio] Error setting up audio:", error);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
    }
  };

  const toggleMusic = async () => {
    console.log("[Audio] toggleMusic called, isMuted:", isMuted, "isLoaded:", isLoaded);
    try {
      if (!soundRef.current) {
        console.log("[Audio] Sound ref is null");
        return;
      }
      if (!isLoaded) {
        console.log("[Audio] Sound not loaded yet");
        return;
      }

      if (isMuted) {
        // Turn on music
        console.log("[Audio] Turning ON music...");
        await soundRef.current.setVolumeAsync(0.3);
        const playResult = await soundRef.current.playAsync();
        console.log("[Audio] Play result:", playResult);
        setIsMuted(false);
        await AsyncStorage.setItem(MUSIC_ENABLED_KEY, "true");
        console.log("[Audio] Music turned ON");
      } else {
        // Turn off music
        console.log("[Audio] Turning OFF music...");
        await soundRef.current.pauseAsync();
        setIsMuted(true);
        await AsyncStorage.setItem(MUSIC_ENABLED_KEY, "false");
        console.log("[Audio] Music turned OFF");
      }
    } catch (error) {
      console.log("[Audio] Error toggling music:", error);
    }
  };

  const setMusicEnabled = async (enabled: boolean) => {
    console.log("[Audio] setMusicEnabled called with:", enabled, "isLoaded:", isLoaded);
    try {
      if (!soundRef.current) {
        console.log("[Audio] Sound ref is null");
        return;
      }
      if (!isLoaded) {
        console.log("[Audio] Sound not loaded yet");
        return;
      }

      if (enabled) {
        console.log("[Audio] Enabling music...");
        await soundRef.current.setVolumeAsync(0.3);
        const playResult = await soundRef.current.playAsync();
        console.log("[Audio] Play result:", playResult);
        setIsMuted(false);
      } else {
        console.log("[Audio] Disabling music...");
        await soundRef.current.pauseAsync();
        setIsMuted(true);
      }
      await AsyncStorage.setItem(MUSIC_ENABLED_KEY, enabled ? "true" : "false");
      console.log("[Audio] Music enabled set to:", enabled);
    } catch (error) {
      console.log("[Audio] Error setting music:", error);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        isMuted,
        isLoaded,
        toggleMusic,
        setMusicEnabled,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}
