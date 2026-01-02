import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Animated,
  Easing,
  AppState,
  Image,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { supabase, getCurrentUser, signOut } from "../../lib/supabase";
import { useTheme, ThemeColors } from "../../lib/ThemeContext";

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
  const opacity = useRef(new Animated.Value(0.1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 2000,
          delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.1,
          duration: 2000,
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

// Pathway Card Component
const PathwayCard = ({ 
  pathway, 
  index, 
  locked, 
  progress,
  onPress,
  theme,
}: { 
  pathway: any; 
  index: number; 
  locked: boolean;
  progress?: any;
  onPress: () => void;
  theme: ThemeColors;
}) => {
  const getStatusColor = () => {
    if (locked) return "#9ca3af";
    if (progress?.status === "completed") return "#22c55e";
    if (progress?.status === "in_progress") return "#eab308";
    return "#6366f1";
  };

  const getStatusText = () => {
    if (locked) return "Terkunci";
    if (progress?.status === "completed") return "Selesai ✓";
    if (progress?.status === "in_progress") return "Lanjutkan";
    return "Mulai";
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      disabled={locked}
      activeOpacity={0.8}
      style={{ marginBottom: 16 }}
    >
      <View style={{
        backgroundColor: locked ? theme.cardBg : theme.cardBg,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: locked ? theme.cardBorder : theme.cardBorder,
        flexDirection: "row",
        alignItems: "center",
      }}>
        {/* Number Circle */}
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: locked ? "#6b7280" : "#6366f1",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 16,
        }}>
          {locked ? (
            <Text style={{ fontSize: 20 }}>🔒</Text>
          ) : (
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>
              {pathway.order_number}
            </Text>
          )}
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <Text style={{ 
            color: locked ? theme.textMuted : theme.textPrimary, 
            fontSize: 16, 
            fontWeight: "600",
            marginBottom: 4
          }}>
            {pathway.title}
          </Text>
          <Text style={{ 
            color: locked ? theme.textMuted : theme.textSecondary, 
            fontSize: 13 
          }} numberOfLines={2}>
            {pathway.description}
          </Text>
        </View>

        {/* Status Badge */}
        <View style={{
          backgroundColor: getStatusColor(),
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 12,
        }}>
          <Text style={{ color: "white", fontSize: 12, fontWeight: "500" }}>
            {getStatusText()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function DashboardScreen() {
  const { theme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [pathways, setPathways] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.replace("/login");
        return;
      }
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  // Fetch pathways and progress
  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch pathways
      const { data: pathwaysData } = await supabase
        .from("pathways")
        .select("*")
        .order("order_number", { ascending: true });

      if (pathwaysData) {
        setPathways(pathwaysData);
      }

      // Fetch user progress
      const { data: progressData } = await supabase
        .from("user_pathway_progress")
        .select("*")
        .eq("user_id", user.id);

      if (progressData) {
        setUserProgress(progressData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Refresh data when screen comes into focus (after returning from pathway)
  useFocusEffect(
    useCallback(() => {
      if (user) {
        console.log("[Dashboard] Screen focused, refreshing data...");
        fetchData();
      }
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const isPathwayLocked = (orderNumber: number): boolean => {
    if (orderNumber === 1) return false;
    const previousPathway = pathways.find((p) => p.order_number === orderNumber - 1);
    if (!previousPathway) return false;
    const previousProgress = userProgress.find((p) => p.pathway_id === previousPathway.id);
    return previousProgress?.status !== "completed";
  };

  const getProgressForPathway = (pathwayId: number) => {
    return userProgress.find((p) => p.pathway_id === pathwayId);
  };

  const completedCount = userProgress.filter((p) => p.status === "completed").length;
  const progressPercentage = pathways.length > 0 
    ? Math.round((completedCount / pathways.length) * 100) 
    : 0;

  if (!user) {
    return (
      <LinearGradient
        colors={[...theme.gradient]}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text style={{ color: theme.textPrimary }}>Loading...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[...theme.gradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      {/* Background Icons */}
      <View style={{ position: "absolute", width: "100%", height: "100%" }} pointerEvents="none">
        <FloatingIcon emoji="⚛️" size={48} top={80} left={-10} delay={0} />
        <FloatingIcon emoji="🧪" size={36} top={200} right={10} delay={1000} />
        <FloatingIcon emoji="🔬" size={40} bottom={200} left={20} delay={2000} />
        <FloatingIcon emoji="⚗️" size={36} bottom={100} right={-5} delay={1500} />
      </View>

      {/* Header - Fixed */}
      <View style={{
        backgroundColor: theme.cardBg,
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.cardBorder,
        height: 110,
      }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Image 
            source={require("../../assets/images/chemlab.png")} 
            style={{ width: 32, height: 32 }} 
            resizeMode="contain"
          />
          <Text style={{ fontSize: 28, fontWeight: "bold", color: theme.textPrimary }}>ChemLab</Text>
        </View>
        <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 4 }}>Virtual Chemistry Laboratory</Text>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.textSecondary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 26, fontWeight: "bold", color: theme.textPrimary, marginBottom: 4 }}>
            Selamat datang, {user?.user_metadata?.full_name || "Siswa"}!
          </Text>
          <Text style={{ fontSize: 15, color: theme.textSecondary }}>
            Lanjutkan perjalanan belajar kimia Anda
          </Text>
        </View>

        {/* Progress Card */}
        <LinearGradient
          colors={["#6366f1", "#3b82f6", "#06b6d4"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "white", marginBottom: 4 }}>
                Progress Pembelajaran
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.8)" }}>
                {completedCount} dari {pathways.length} pathway selesai
              </Text>
            </View>
            <Text style={{ fontSize: 36, fontWeight: "bold", color: "white" }}>
              {progressPercentage}%
            </Text>
          </View>
          <View style={{ 
            backgroundColor: "rgba(255,255,255,0.3)", 
            borderRadius: 8, 
            height: 12 
          }}>
            <View style={{ 
              backgroundColor: "white", 
              borderRadius: 8, 
              height: 12,
              width: `${progressPercentage}%`,
            }} />
          </View>
        </LinearGradient>

        {/* Pathways Section */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <View style={{ 
              width: 4, 
              height: 28, 
              backgroundColor: "#6366f1", 
              borderRadius: 2, 
              marginRight: 12 
            }} />
            <View>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: theme.textPrimary }}>
                Ikatan Kimia
              </Text>
              <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                Pembelajaran interaktif ikatan kimia
              </Text>
            </View>
          </View>

          {loading ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <Text style={{ color: theme.textSecondary }}>Memuat pathway...</Text>
            </View>
          ) : pathways.length === 0 ? (
            <View style={{ 
              padding: 40, 
              alignItems: "center",
              backgroundColor: theme.cardBg,
              borderRadius: 16,
            }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>📚</Text>
              <Text style={{ color: theme.textSecondary, textAlign: "center" }}>
                Belum ada pathway tersedia.{"\n"}Silakan coba lagi nanti.
              </Text>
            </View>
          ) : (
            pathways.map((pathway, index) => (
              <PathwayCard
                key={pathway.id}
                pathway={pathway}
                index={index}
                locked={isPathwayLocked(pathway.order_number)}
                progress={getProgressForPathway(pathway.id)}
                theme={theme}
                onPress={() => {
                  // Navigate to pathway detail
                  router.push(`/pathway/${pathway.id}`);
                }}
              />
            ))
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
