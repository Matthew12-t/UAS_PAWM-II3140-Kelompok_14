import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../lib/supabase";

interface FinalTestViewProps {
  pathway: any;
  userId: string;
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
}

export default function FinalTestView({
  pathway,
  userId,
  onComplete,
  onBack,
}: FinalTestViewProps) {
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [testStarted, setTestStarted] = useState(false);

  // Get questions from pathway.content (same as quiz system)
  const questions: Question[] = pathway.content?.questions || [];

  useEffect(() => {
    // Questions are loaded from pathway.content, just set loading to false
    setLoading(false);
  }, []);

  // Timer effect
  useEffect(() => {
    if (!testStarted || showResults) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (answerIndex: number) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: answerIndex,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    // Calculate score
    let correctCount = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct_answer) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    setScore(calculatedScore);
    setShowResults(true);

    // Save to database
    try {
      // Save answers to quiz_answers table (for pembahasan in results page)
      for (let index = 0; index < questions.length; index++) {
        const q = questions[index];
        const userAnswer = answers[index];
        const isCorrect = userAnswer === q.correct_answer;
        
        const explanation = isCorrect
          ? `✓ Jawaban Anda benar!\n\n${q.explanation || "Selamat, jawaban Anda tepat!"}`
          : `✗ Jawaban Anda salah.\n\nJawaban yang benar adalah: ${q.options[q.correct_answer]}\n\n${q.explanation || "Silakan pelajari kembali materi ini."}`;

        // Delete existing answer first
        await supabase
          .from("quiz_answers")
          .delete()
          .eq("pathway_id", pathway.id)
          .eq("user_id", userId)
          .eq("question_id", q.id);

        // Insert new answer
        await supabase.from("quiz_answers").insert({
          user_id: userId,
          pathway_id: pathway.id,
          question_id: q.id,
          user_answer: userAnswer ?? -1,
          correct_answer: q.correct_answer,
          is_correct: isCorrect,
          explanation: explanation,
        });
      }

      // Update user_pathway_progress with score (same as quiz)
      await supabase
        .from("user_pathway_progress")
        .update({ score: calculatedScore, status: "completed" })
        .eq("pathway_id", pathway.id)
        .eq("user_id", userId);
    } catch (error) {
      console.error("Error saving results:", error);
    }

    // Don't call onComplete here - let user click button to go back
  };

  const confirmSubmit = () => {
    const unansweredCount = questions.length - Object.keys(answers).length;
    
    if (unansweredCount > 0) {
      Alert.alert(
        "Konfirmasi",
        `Masih ada ${unansweredCount} soal yang belum dijawab. Yakin ingin submit?`,
        [
          { text: "Batal", style: "cancel" },
          { text: "Submit", onPress: handleSubmit }
        ]
      );
    } else {
      Alert.alert(
        "Konfirmasi",
        "Yakin ingin submit tes final?",
        [
          { text: "Batal", style: "cancel" },
          { text: "Submit", onPress: handleSubmit }
        ]
      );
    }
  };

  const startTest = () => {
    setTestStarted(true);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#a5b4fc" />
        <Text style={{ color: "#a5b4fc", marginTop: 16 }}>Memuat tes final...</Text>
      </View>
    );
  }

  // Pre-test screen
  if (!testStarted) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
        <View style={{
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: 20,
          padding: 24,
          alignItems: "center",
          width: "100%",
          maxWidth: 340,
        }}>
          <Text style={{ fontSize: 60, marginBottom: 16 }}>📝</Text>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: "bold", 
            color: "white",
            textAlign: "center",
            marginBottom: 8
          }}>
            Tes Final
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: "#a5b4fc",
            textAlign: "center",
            marginBottom: 20
          }}>
            Tes Akhir
          </Text>

          <View style={{
            backgroundColor: "rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: 16,
            width: "100%",
            marginBottom: 20,
          }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
              <Text style={{ color: "#9ca3af", fontSize: 14 }}>Jumlah Soal</Text>
              <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>{questions.length} soal</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
              <Text style={{ color: "#9ca3af", fontSize: 14 }}>Waktu</Text>
              <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>10 menit</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "#9ca3af", fontSize: 14 }}>Passing Grade</Text>
              <Text style={{ color: "#22c55e", fontWeight: "600", fontSize: 14 }}>70%</Text>
            </View>
          </View>

          <Text style={{ 
            fontSize: 12, 
            color: "#f59e0b",
            textAlign: "center",
            marginBottom: 20,
            lineHeight: 18,
            paddingHorizontal: 8,
          }}>
            ⚠️ Setelah dimulai, tes tidak dapat dijeda.{"\n"}Pastikan Anda siap sebelum memulai.
          </Text>

          <TouchableOpacity
            onPress={startTest}
            style={{ width: "100%" }}
          >
            <LinearGradient
              colors={["#6366f1", "#8b5cf6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                Mulai Tes
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onBack}
            style={{ marginTop: 16 }}
          >
            <Text style={{ color: "#a5b4fc", fontSize: 14 }}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Results screen
  if (showResults) {
    const passed = score >= 70;
    const correctCount = questions.filter((q: Question, index: number) => answers[index] === q.correct_answer).length;
    
    const handleGoToDashboard = () => {
      onComplete(score);
    };
    
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
        {/* Score Card */}
        <View style={{
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: 20,
          padding: 32,
          alignItems: "center",
          width: "100%",
          maxWidth: 400,
        }}>
          <Text style={{ fontSize: 60, marginBottom: 16 }}>
            {passed ? "🎉" : "😔"}
          </Text>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: "bold", 
            color: "white",
            textAlign: "center",
            marginBottom: 8
          }}>
            {passed ? "Selamat!" : "Coba Lagi"}
          </Text>
          <Text style={{ 
            fontSize: 16, 
            color: "#a5b4fc",
            textAlign: "center",
            marginBottom: 24
          }}>
            {passed 
              ? "Anda telah menyelesaikan tes final!" 
              : "Anda belum mencapai passing grade."}
          </Text>

          <View style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            borderWidth: 6,
            borderColor: passed ? "#22c55e" : "#ef4444",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 24,
          }}>
            <Text style={{ 
              fontSize: 36, 
              fontWeight: "bold", 
              color: passed ? "#22c55e" : "#ef4444"
            }}>
              {score}%
            </Text>
          </View>

          <View style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            borderRadius: 12,
            padding: 16,
            width: "100%",
            marginBottom: 16,
          }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ color: "#9ca3af" }}>Jawaban Benar</Text>
              <Text style={{ color: "#22c55e", fontWeight: "600" }}>
                {correctCount} / {questions.length}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: "#9ca3af" }}>Status</Text>
              <Text style={{ 
                color: passed ? "#22c55e" : "#ef4444", 
                fontWeight: "600" 
              }}>
                {passed ? "LULUS" : "TIDAK LULUS"}
              </Text>
            </View>
          </View>

          {/* Info text */}
          <Text style={{ 
            color: "#9ca3af", 
            fontSize: 13, 
            textAlign: "center",
            marginBottom: 24,
            lineHeight: 20
          }}>
            💡 Lihat pembahasan lengkap di halaman{"\n"}"Hasil Pembelajaran"
          </Text>

          {/* Action Button */}
          <TouchableOpacity
            onPress={handleGoToDashboard}
            style={{ width: "100%" }}
          >
            <LinearGradient
              colors={["#6366f1", "#8b5cf6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                Kembali ke Dashboard
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <View style={{ flex: 1 }}>
      {/* Timer Header */}
      <View style={{
        backgroundColor: "rgba(255,255,255,0.1)",
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <Text style={{ color: "white", fontWeight: "600" }}>
          Soal {currentQuestionIndex + 1} / {questions.length}
        </Text>
        <View style={{
          backgroundColor: timeLeft < 60 ? "#ef4444" : "#6366f1",
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
        }}>
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
            ⏱️ {formatTime(timeLeft)}
          </Text>
        </View>
      </View>

      {/* Question Navigation Dots */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 60 }}
        contentContainerStyle={{ padding: 12 }}
      >
        {questions.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setCurrentQuestionIndex(index)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: answers[index] !== undefined 
                ? "#22c55e" 
                : currentQuestionIndex === index 
                  ? "#6366f1" 
                  : "rgba(255,255,255,0.1)",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 8,
              borderWidth: currentQuestionIndex === index ? 2 : 0,
              borderColor: "white",
            }}
          >
            <Text style={{ 
              color: "white", 
              fontSize: 14, 
              fontWeight: "500" 
            }}>
              {index + 1}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Question */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <View style={{
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
        }}>
          <Text style={{ 
            color: "white", 
            fontSize: 18, 
            lineHeight: 26 
          }}>
            {currentQuestion.question}
          </Text>
        </View>

        {/* Options */}
        {currentQuestion.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleAnswer(index)}
            style={{
              backgroundColor: answers[currentQuestionIndex] === index 
                ? "#6366f1" 
                : "rgba(255,255,255,0.05)",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: answers[currentQuestionIndex] === index 
                ? "#8b5cf6" 
                : "rgba(255,255,255,0.1)",
            }}
          >
            <View style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: answers[currentQuestionIndex] === index 
                ? "white" 
                : "rgba(255,255,255,0.1)",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}>
              <Text style={{ 
                color: answers[currentQuestionIndex] === index ? "#6366f1" : "white",
                fontWeight: "600"
              }}>
                {String.fromCharCode(65 + index)}
              </Text>
            </View>
            <Text style={{ 
              flex: 1,
              color: "white", 
              fontSize: 16,
              lineHeight: 22
            }}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={{
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "rgba(0,0,0,0.2)",
      }}>
        <TouchableOpacity
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
          style={{
            backgroundColor: currentQuestionIndex === 0 
              ? "rgba(255,255,255,0.05)" 
              : "rgba(255,255,255,0.1)",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ 
            color: currentQuestionIndex === 0 ? "#6b7280" : "white",
            fontWeight: "500"
          }}>
            ← Sebelumnya
          </Text>
        </TouchableOpacity>

        {currentQuestionIndex === questions.length - 1 ? (
          <TouchableOpacity onPress={confirmSubmit}>
            <LinearGradient
              colors={["#22c55e", "#16a34a"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingHorizontal: 32,
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>
                Submit ({answeredCount}/{questions.length})
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleNext}
            style={{
              backgroundColor: "#6366f1",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "white", fontWeight: "500" }}>
              Selanjutnya →
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
