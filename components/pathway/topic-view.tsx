import React, { useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Linking,
  Image,
  Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { WebContentContainer } from "../WebContainer";

const isWeb = Platform.OS === "web";

const { width: screenWidth } = Dimensions.get("window");

interface TopicViewProps {
  pathway: any;
  user: any;
  onComplete: () => void;
  onBack: () => void;
}

const getVideoIdByPathwayId = (pathwayId: number): string => {
  const videoMapping: { [key: number]: string } = {
    1: "7rodnBMRdCw", 
    4: "5x_2ctPpArM", 
  };
  return videoMapping[pathwayId] || "dQw4w9WgXcQ";
};

export default function TopicView({ pathway, user, onComplete, onBack }: TopicViewProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const sections = pathway.content?.sections || [];
  const videoId = getVideoIdByPathwayId(pathway.id);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onComplete();
    } finally {
      setIsCompleting(false);
    }
  };

  const openVideo = () => {
    Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`);
  };

  return (
    <LinearGradient
      colors={["#0f172a", "#312e81", "#1e1b4b"]}
      style={{ flex: 1 }}
    >
      <View style={{
        backgroundColor: "rgba(255,255,255,0.1)",
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.1)",
      }}>
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 8 }}>
          <Text style={{ color: "#a5b4fc", fontSize: 14 }}>← Kembali ke Dashboard</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "white" }}>
          {pathway.title}
        </Text>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          padding: 20, 
          alignItems: isWeb ? "center" : undefined 
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: "100%", maxWidth: isWeb ? 600 : undefined }}>
        <View style={{
          backgroundColor: "rgba(99, 102, 241, 0.2)",
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: "rgba(99, 102, 241, 0.3)",
        }}>
          <Text style={{ color: "white", fontSize: 16, lineHeight: 24 }}>
            {pathway.description}
          </Text>
        </View>

        <View style={{
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <Image
              source={require("../../assets/images/play.png")}
              style={{ width: 24, height: 24, marginRight: 8 }}
              resizeMode="contain"
            />
            <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
              Video Pembelajaran
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={openVideo}
            style={{
              borderRadius: 12,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Image
              source={{ uri: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` }}
              style={{ width: "100%", height: 180 }}
              resizeMode="cover"
            />
            <View style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.3)",
              justifyContent: "center",
              alignItems: "center",
            }}>
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: "#dc2626",
                justifyContent: "center",
                alignItems: "center",
              }}>
                <View style={{
                  width: 0,
                  height: 0,
                  marginLeft: 4,
                  borderLeftWidth: 20,
                  borderLeftColor: "white",
                  borderTopWidth: 12,
                  borderTopColor: "transparent",
                  borderBottomWidth: 12,
                  borderBottomColor: "transparent",
                }} />
              </View>
            </View>
          </TouchableOpacity>
          
          <Text style={{ color: "#a5b4fc", fontSize: 12, textAlign: "center", marginTop: 12 }}>
            Tap untuk menonton di YouTube
          </Text>
        </View>

        {sections.map((section: any, index: number) => (
          <View key={index} style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
          }}>
            <Text style={{ color: "white", fontSize: 18, fontWeight: "600", marginBottom: 12 }}>
              {section.title}
            </Text>
            {section.content.split("\n").map((line: string, i: number) => (
              <Text key={i} style={{ color: "#e2e8f0", fontSize: 15, lineHeight: 24, marginBottom: 8 }}>
                {line}
              </Text>
            ))}
          </View>
        ))}

        {pathway.id === 1 && (
          <View style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <Image
                source={require("../../assets/images/hasil.png")}
                style={{ width: 24, height: 24, marginRight: 8 }}
                resizeMode="contain"
              />
              <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
                Perbandingan Ikatan Kimia
              </Text>
            </View>
            <View style={{
              backgroundColor: "#f8fafc",
              borderRadius: 12,
              overflow: "hidden",
              padding: 8,
            }}>
              <Image
                source={require("../../assets/images/perbandingan.jpg")}
                style={{ width: "100%", height: 220 }}
                resizeMode="cover"
              />
            </View>
            <Text style={{ color: "#a5b4fc", fontSize: 12, textAlign: "center", marginTop: 8 }}>
              Tabel Perbandingan Ikatan Kimia
            </Text>
          </View>
        )}

        <View style={{ flexDirection: "row", gap: 12, marginTop: 10, marginBottom: 40 }}>
          <TouchableOpacity
            onPress={onBack}
            style={{
              flex: 1,
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.2)",
            }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>Kembali</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleComplete}
            disabled={isCompleting}
            style={{
              flex: 1,
              backgroundColor: isCompleting ? "#4338ca" : "#6366f1",
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
              {isCompleting ? "Menyimpan..." : "Selanjutnya →"}
            </Text>
          </TouchableOpacity>
        </View>
        </View>
        </ScrollView>
    </LinearGradient>
  );
}
