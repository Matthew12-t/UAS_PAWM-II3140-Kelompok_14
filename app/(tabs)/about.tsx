import React, { useRef, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Linking, Image, Animated, Easing } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme, ThemeColors } from "../../lib/ThemeContext";

const { width } = Dimensions.get("window");

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

// Feature Card Component
const FeatureCard = ({
  icon,
  title,
  description,
  gradientColors,
  theme,
}: {
  icon: string;
  title: string;
  description: string;
  gradientColors: string[];
  theme: ThemeColors;
}) => (
  <View
    style={{
      backgroundColor: theme.cardBg,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.cardBorder,
    }}
  >
    <LinearGradient
      colors={gradientColors as [string, string]}
      style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
      }}
    >
      <Text style={{ fontSize: 24 }}>{icon}</Text>
    </LinearGradient>
    <Text
      style={{
        color: theme.textPrimary,
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
      }}
    >
      {title}
    </Text>
    <Text style={{ color: theme.textSecondary, fontSize: 14, lineHeight: 20 }}>
      {description}
    </Text>
  </View>
);

// Pathway Preview Card Component
const PathwayPreviewCard = ({
  icon,
  title,
  description,
  modules,
  duration,
  gradientColors,
  theme,
}: {
  icon: string;
  title: string;
  description: string;
  modules: number;
  duration: string;
  gradientColors: string[];
  theme: ThemeColors;
}) => (
  <View
    style={{
      backgroundColor: theme.cardBg,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      width: width * 0.75,
      marginRight: 16,
    }}
  >
    <LinearGradient
      colors={gradientColors as [string, string]}
      style={{
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      <Text style={{ fontSize: 28 }}>{icon}</Text>
    </LinearGradient>
    <Text
      style={{
        color: theme.textPrimary,
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 8,
      }}
    >
      {title}
    </Text>
    <Text
      style={{
        color: theme.textSecondary,
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
      }}
    >
      {description}
    </Text>
    <View style={{ flexDirection: "row", gap: 12 }}>
      <View
        style={{
          backgroundColor: "rgba(99, 102, 241, 0.2)",
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 20,
        }}
      >
        <Text style={{ color: "#6366f1", fontSize: 12 }}>{modules} Modules</Text>
      </View>
      <View
        style={{
          backgroundColor: "rgba(99, 102, 241, 0.2)",
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 20,
        }}
      >
        <Text style={{ color: "#6366f1", fontSize: 12 }}>{duration}</Text>
      </View>
    </View>
  </View>
);

// Photo placeholders mapping
const teamPhotos: { [key: string]: any } = {
  matthew: require("../../assets/images/matthew.png"),
  darryl: require("../../assets/images/darryl.png"),
};

// Team Member Card
const TeamMemberCard = ({
  name,
  nim,
  photoKey,
  theme,
}: {
  name: string;
  nim: string;
  photoKey: string;
  theme: ThemeColors;
}) => (
  <View
    style={{
      backgroundColor: theme.cardBg,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      alignItems: "center",
      minHeight: 180,
    }}
  >
    <View style={{
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: "#6366f1",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
      overflow: "hidden",
    }}>
      <Image
        source={teamPhotos[photoKey]}
        style={{ width: 70, height: 70 }}
        resizeMode="cover"
      />
    </View>
    <Text style={{ 
      color: theme.textPrimary, 
      fontSize: 14, 
      fontWeight: "bold", 
      marginBottom: 4,
      textAlign: "center",
    }}>
      {name}
    </Text>
    <Text style={{ color: theme.textSecondary, fontSize: 11, textAlign: "center" }}>
      NIM: {nim}
    </Text>
  </View>
);

export default function AboutScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  return (
    <LinearGradient
      colors={[...theme.gradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      {/* Background Icons */}
      <View style={{ position: "absolute", width: "100%", height: "100%" }} pointerEvents="none">
        <FloatingIcon emoji="ℹ️" size={48} top={80} left={-10} delay={0} />
        <FloatingIcon emoji="📚" size={36} top={200} right={10} delay={1000} />
        <FloatingIcon emoji="🎓" size={40} bottom={200} left={20} delay={2000} />
        <FloatingIcon emoji="💡" size={36} bottom={100} right={-5} delay={1500} />
      </View>

      {/* Header - Fixed */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 50,
          paddingBottom: 16,
          backgroundColor: theme.cardBg,
          borderBottomWidth: 1,
          borderBottomColor: theme.cardBorder,
          height: 110,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Image 
            source={require("../../assets/images/about.png")} 
            style={{ width: 32, height: 32 }} 
            resizeMode="contain"
          />
          <Text style={{ color: theme.textPrimary, fontSize: 28, fontWeight: "bold" }}>
            About ChemLab
          </Text>
        </View>
        <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 4 }}>
          Virtual Chemistry Laboratory
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >

        {/* About Section */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 30 }}>
          <Text
            style={{
              color: theme.textPrimary,
              fontSize: 28,
              fontWeight: "bold",
              lineHeight: 36,
              marginBottom: 16,
            }}
          >
            Experience Chemistry{"\n"}
            <Text style={{ color: "#818cf8" }}>Like Never Before</Text>
          </Text>

          <Text
            style={{
              color: theme.textMuted,
              fontSize: 16,
              lineHeight: 24,
              marginBottom: 0,
            }}
          >
            ChemLab adalah platform pembelajaran kimia interaktif yang memungkinkan Anda mempelajari ikatan kimia melalui simulasi virtual dan pembelajaran hands-on.
          </Text>
        </View>

        {/* Features Section */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 0 }}>
          <Text
            style={{
              color: theme.textPrimary,
              fontSize: 22,
              fontWeight: "bold",
              marginBottom: 8,
            }}
          >
            Fitur Utama
          </Text>
          <Text
            style={{
              color: theme.textMuted,
              fontSize: 14,
              marginBottom: 20,
            }}
          >
            Semua yang Anda butuhkan untuk belajar kimia
          </Text>

          <FeatureCard
            icon="🎯"
            title="Pembelajaran Interaktif"
            description="Pelajari kimia melalui eksperimen virtual dan simulasi hands-on."
            gradientColors={["#6366f1", "#8b5cf6"]}
            theme={theme}
          />
          <FeatureCard
            icon="📊"
            title="Pantau Progress"
            description="Monitor perjalanan belajar Anda dengan analitik detail dan metrik performa."
            gradientColors={["#06b6d4", "#3b82f6"]}
            theme={theme}
          />
          <FeatureCard
            icon="🏆"
            title="Kuis & Tes"
            description="Dapatkan feedback instan dan bangun pengetahuan kimia Anda dengan kuis interaktif."
            gradientColors={["#10b981", "#06b6d4"]}
            theme={theme}
          />
          <FeatureCard
            icon="📱"
            title="Cross-Platform"
            description="Akses dari web browser atau aplikasi mobile, belajar kapan saja di mana saja."
            gradientColors={["#f59e0b", "#ef4444"]}
            theme={theme}
          />
        </View>

        {/* Learning Pathways Preview */}
        <View style={{ paddingVertical: 30 }}>
          <Text
            style={{
              color: theme.textPrimary,
              fontSize: 22,
              fontWeight: "bold",
              marginBottom: 8,
              paddingHorizontal: 20,
            }}
          >
            Learning Pathways
          </Text>
          <Text
            style={{
              color: theme.textMuted,
              fontSize: 14,
              marginBottom: 20,
              paddingHorizontal: 20,
            }}
          >
            Pilih jalur pembelajaran Anda
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            <PathwayPreviewCard
              icon="🔗"
              title="Chemical Bonding"
              description="Pelajari ikatan ionik, kovalen, logam, dan hidrogen melalui simulasi interaktif."
              modules={3}
              duration="3 jam"
              gradientColors={["#6366f1", "#8b5cf6"]}
              theme={theme}
            />
            <PathwayPreviewCard
              icon="🧬"
              title="Structure & Properties"
              description="Eksplorasi struktur molekul, properti senyawa, dan konvensi penamaan IUPAC."
              modules={3}
              duration="4 jam"
              gradientColors={["#06b6d4", "#3b82f6"]}
              theme={theme}
            />
            <PathwayPreviewCard
              icon="📝"
              title="Final Test"
              description="Uji pengetahuan Anda dengan asesmen komprehensif."
              modules={1}
              duration="1 jam"
              gradientColors={["#10b981", "#06b6d4"]}
              theme={theme}
            />
          </ScrollView>
        </View>

        {/* Tech Stack */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
          <Text
            style={{
              color: theme.textPrimary,
              fontSize: 22,
              fontWeight: "bold",
              marginBottom: 16,
            }}
          >
            Tech Stack
          </Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {["React", "Next.js", "Expo", "React Native", "Supabase", "TypeScript", "TailwindCSS", "NativeWind"].map((tech) => (
              <View
                key={tech}
                style={{
                  backgroundColor: theme.cardBg,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: theme.cardBorder,
                }}
              >
                <Text style={{ color: "#6366f1", fontSize: 13 }}>{tech}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Developer Info */}
        <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
          <Text
            style={{
              color: theme.textPrimary,
              fontSize: 22,
              fontWeight: "bold",
              marginBottom: 16,
            }}
          >
            Developer Team
          </Text>

          {/* Container untuk layout Kanan-Kiri */}
          <View style={{ flexDirection: "row", gap: 12 }}>
            
            {/* Developer 1 (Kiri) */}
            <View style={{ flex: 1 }}>
              <TeamMemberCard
                name="Matthew Sebastian Kurniawan"
                nim="18223096"
                photoKey="matthew"
                theme={theme}
              />
            </View>

            {/* Developer 2 (Kanan) */}
            <View style={{ flex: 1 }}>
              <TeamMemberCard
                name="Darryl Rayhananta Adenan" 
                nim="18223042"
                photoKey="darryl"
                theme={theme}
              />
            </View>

          </View>
        </View>

        {/* Footer */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 32,
            alignItems: "center",
            borderTopWidth: 1,
            borderTopColor: theme.cardBorder,
            marginTop: 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <Image 
              source={require("../../assets/images/chemlab.png")} 
              style={{ width: 28, height: 28 }} 
              resizeMode="contain"
            />
            <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: "bold" }}>
              ChemLab
            </Text>
          </View>
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 12,
              textAlign: "center",
            }}
          >
            © 2025 ChemLab Virtual Laboratory.{"\n"}
            Tugas PAWM - Institut Teknologi Bandung
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
