import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { supabase, getCurrentUser } from "../../lib/supabase";
import TopicView from "../../components/pathway/topic-view";
import QuizView from "../../components/pathway/quiz-view";
import SimulationView from "../../components/pathway/simulation-view";
import FinalTestView from "../../components/pathway/final-test-view";

export default function PathwayScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [pathway, setPathway] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.replace("/login");
          return;
        }
        setUser(currentUser);

        // Fetch pathway
        const { data: pathwayData, error: pathwayError } = await supabase
          .from("pathways")
          .select("*")
          .eq("id", id)
          .single();

        if (pathwayError) throw pathwayError;
        setPathway(pathwayData);

        // Create or update progress
        const { data: existingProgress, error: progressError } = await supabase
          .from("user_pathway_progress")
          .select("*")
          .eq("user_id", currentUser.id)
          .eq("pathway_id", id)
          .single();

        console.log("[Pathway] Existing progress on load:", existingProgress, "Error:", progressError);

        if (!existingProgress) {
          console.log("[Pathway] Creating new progress record for pathway:", id);
          const { error: insertError } = await supabase.from("user_pathway_progress").insert({
            user_id: currentUser.id,
            pathway_id: id,
            status: "in_progress",
          });
          
          if (insertError) {
            console.error("[Pathway] Error creating progress:", insertError);
          } else {
            console.log("[Pathway] Progress record created successfully");
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load pathway");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleComplete = async (score?: number) => {
    try {
      console.log("[Pathway] Completing pathway:", pathway.id, "for user:", user.id);
      
      // First check if progress exists
      const { data: existingProgress, error: fetchError } = await supabase
        .from("user_pathway_progress")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("pathway_id", pathway.id)
        .single();

      console.log("[Pathway] Existing progress:", existingProgress, "Error:", fetchError);

      const updateData: any = { 
        status: "completed",
        updated_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      };
      if (score !== undefined) {
        updateData.score = score;
      }

      if (existingProgress) {
        // Update existing record
        const { error: updateError } = await supabase
          .from("user_pathway_progress")
          .update(updateData)
          .eq("id", existingProgress.id);

        if (updateError) {
          console.error("[Pathway] Error updating progress:", updateError);
        } else {
          console.log("[Pathway] Progress updated successfully");
        }
      } else {
        // Insert new record
        const insertData = {
          user_id: user.id,
          pathway_id: pathway.id,
          status: "completed",
          score: score,
          completed_at: new Date().toISOString(),
        };
        
        const { error: insertError } = await supabase
          .from("user_pathway_progress")
          .insert(insertData);

        if (insertError) {
          console.error("[Pathway] Error inserting progress:", insertError);
        } else {
          console.log("[Pathway] Progress inserted successfully");
        }
      }

      // Find next pathway and navigate to it
      const { data: nextPathway } = await supabase
        .from("pathways")
        .select("id")
        .eq("order_number", pathway.order_number + 1)
        .single();

      if (nextPathway) {
        console.log("[Pathway] Navigating to next pathway:", nextPathway.id);
        router.replace(`/pathway/${nextPathway.id}`);
      } else {
        // No more pathways, go back to dashboard
        console.log("[Pathway] No more pathways, going to dashboard");
        router.replace("/(tabs)");
      }
    } catch (err) {
      console.error("[Pathway] Error completing pathway:", err);
      // Still navigate back even if there's an error
      router.replace("/(tabs)");
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#0f172a", "#312e81", "#1e1b4b"]}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color="#a5b4fc" />
        <Text style={{ color: "#a5b4fc", marginTop: 16 }}>Memuat pathway...</Text>
      </LinearGradient>
    );
  }

  if (error || !pathway) {
    return (
      <LinearGradient
        colors={["#0f172a", "#312e81", "#1e1b4b"]}
        style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}
      >
        <Text style={{ fontSize: 48, marginBottom: 16 }}>❌</Text>
        <Text style={{ color: "white", fontSize: 18, textAlign: "center", marginBottom: 20 }}>
          {error || "Pathway tidak ditemukan"}
        </Text>
        <TouchableOpacity
          onPress={handleBack}
          style={{
            backgroundColor: "#6366f1",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Kembali</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // Render appropriate view based on pathway type
  const renderContent = () => {
    if (pathway.type === "simulation") {
      return (
        <SimulationView
          pathway={pathway}
          user={user}
          onComplete={handleComplete}
          onBack={handleBack}
        />
      );
    }

    switch (pathway.type) {
      case "topic":
        return (
          <TopicView
            pathway={pathway}
            user={user}
            onComplete={handleComplete}
            onBack={handleBack}
          />
        );
      case "quiz":
        return (
          <QuizView
            pathway={pathway}
            user={user}
            onComplete={handleComplete}
            onBack={handleBack}
          />
        );
      case "final_test":
        return (
          <FinalTestView
            pathway={pathway}
            userId={user.id}
            onComplete={handleComplete}
            onBack={handleBack}
          />
        );
      default:
        return (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: "white" }}>Tipe pathway tidak dikenali</Text>
          </View>
        );
    }
  };

  return (
    <LinearGradient
      colors={["#0f172a", "#312e81", "#1e1b4b"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      {renderContent()}
    </LinearGradient>
  );
}
