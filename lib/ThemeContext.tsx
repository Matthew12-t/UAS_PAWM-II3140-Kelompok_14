import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Theme colors type
export type ThemeColors = {
  gradient: readonly [string, string, string];
  headerBg: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  iconBg: string;
  dangerBg: string;
  inputBg: string;
  modalBg: string;
  tabBarBg: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
};

export const themes: { dark: ThemeColors; light: ThemeColors } = {
  dark: {
    gradient: ["#0f172a", "#312e81", "#1e1b4b"],
    headerBg: "rgba(30, 27, 75, 0.95)",
    cardBg: "rgba(255,255,255,0.05)",
    cardBorder: "rgba(255,255,255,0.1)",
    textPrimary: "white",
    textSecondary: "#a5b4fc",
    textMuted: "#9ca3af",
    iconBg: "rgba(99, 102, 241, 0.2)",
    dangerBg: "rgba(239, 68, 68, 0.2)",
    inputBg: "rgba(255,255,255,0.1)",
    modalBg: "#1e1b4b",
    tabBarBg: "#1e1b4b",
    tabBarBorder: "rgba(255,255,255,0.1)",
    tabBarActive: "#a5b4fc",
    tabBarInactive: "#6b7280",
  },
  light: {
    gradient: ["#f8fafc", "#e0e7ff", "#c7d2fe"],
    headerBg: "rgba(248, 250, 252, 0.95)",
    cardBg: "rgba(255,255,255,0.9)",
    cardBorder: "rgba(99, 102, 241, 0.2)",
    textPrimary: "#1e1b4b",
    textSecondary: "#4f46e5",
    textMuted: "#6b7280",
    iconBg: "rgba(99, 102, 241, 0.15)",
    dangerBg: "rgba(239, 68, 68, 0.15)",
    inputBg: "rgba(0,0,0,0.05)",
    modalBg: "#f8fafc",
    tabBarBg: "#ffffff",
    tabBarBorder: "rgba(99, 102, 241, 0.2)",
    tabBarActive: "#4f46e5",
    tabBarInactive: "#9ca3af",
  },
};

type ThemeContextType = {
  isDarkMode: boolean;
  theme: ThemeColors;
  toggleTheme: () => void;
  setDarkMode: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Load theme preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme");
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === "dark");
        }
      } catch (e) {
        console.log("Failed to load theme", e);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    try {
      await AsyncStorage.setItem("theme", newValue ? "dark" : "light");
    } catch (e) {
      console.log("Failed to save theme", e);
    }
  };

  const setDarkMode = async (value: boolean) => {
    setIsDarkMode(value);
    try {
      await AsyncStorage.setItem("theme", value ? "dark" : "light");
    } catch (e) {
      console.log("Failed to save theme", e);
    }
  };

  const theme = isDarkMode ? themes.dark : themes.light;

  return (
    <ThemeContext.Provider value={{ isDarkMode, theme, toggleTheme, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
