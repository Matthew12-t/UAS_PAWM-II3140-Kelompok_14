import React, { useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../../lib/supabase";

interface QuizViewProps {
  pathway: any;
  user: any;
  onComplete: (score: number) => void;
  onBack: () => void;
  isFinalTest?: boolean;
}

// Quiz explanations for different pathways
const quizExplanations: { [key: string]: { [key: number]: string } } = {
  "Kuis 1: Ikatan Kimia": {
    0: "Ikatan ionik terbentuk melalui transfer elektron dari atom logam ke atom nonlogam. Atom yang kehilangan elektron menjadi kation (bermuatan positif) dan atom yang menerima elektron menjadi anion (bermuatan negatif).",
    1: "Ikatan kovalen terbentuk ketika dua atom berbagi pasangan elektron. Elektron dari kedua atom saling tumpang tindih membentuk orbital molekul.",
    2: "Ikatan logam terbentuk ketika elektron valensi dari atom-atom logam bergerak bebas membentuk 'laut elektron' yang mengelilingi kation-kation logam.",
  },
  "Kuis 2: Struktur dan Sifat Senyawa": {
    0: "Senyawa ionik memiliki struktur kristal yang teratur dengan ion-ion tersusun dalam pola 3D yang berulang.",
    1: "Senyawa kovalen dapat berupa molekul diskrit atau jaringan kovalen.",
    2: "Penamaan senyawa ionik mengikuti aturan: nama kation diikuti nama anion dengan akhiran -ida.",
  },
};

export default function QuizView({ pathway, user, onComplete, onBack, isFinalTest }: QuizViewProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const questions = pathway.content?.questions || [];

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      let correctCount = 0;

      // Save answers and calculate score
      for (let index = 0; index < questions.length; index++) {
        const q = questions[index];
        const isCorrect = answers[index] === q.correct_answer;
        if (isCorrect) correctCount++;

        const explanations = quizExplanations[pathway.title] || {};
        const baseExplanation = explanations[q.correct_answer] || q.explanation || "Silakan pelajari kembali materi ini.";

        const explanation = isCorrect
          ? `✓ Jawaban Anda benar!\n\n${baseExplanation}`
          : `✗ Jawaban Anda salah.\n\nJawaban yang benar adalah: ${q.options[q.correct_answer]}\n\n${baseExplanation}`;

        await supabase.from("quiz_answers").insert({
          user_id: user.id,
          pathway_id: pathway.id,
          question_id: q.id,
          user_answer: answers[index] ?? -1,
          correct_answer: q.correct_answer,
          is_correct: isCorrect,
          explanation: explanation,
        });
      }

      const finalScore = Math.round((correctCount / questions.length) * 100);
      setScore(finalScore);
      setShowResults(true);

      // Update progress with score
      await supabase
        .from("user_pathway_progress")
        .update({ score: finalScore, status: "completed" })
        .eq("pathway_id", pathway.id)
        .eq("user_id", user.id);
    } catch (error) {
      console.error("Error submitting quiz:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onComplete(score);
    } finally {
      setIsCompleting(false);
    }
  };

  // Results View
  if (showResults) {
    const correctCount = answers.filter((a, i) => a === questions[i]?.correct_answer).length;
    const passed = score >= 70;

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
          <Text style={{ fontSize: 22, fontWeight: "bold", color: "white" }}>
            Hasil {isFinalTest ? "Ujian Akhir" : "Kuis"}
          </Text>
        </View>

        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20 }}
        >
          {/* Score Card */}
          <LinearGradient
            colors={passed ? ["#059669", "#10b981", "#34d399"] : ["#dc2626", "#ef4444", "#f87171"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 20,
              padding: 32,
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 72, fontWeight: "bold", color: "white" }}>
              {score}%
            </Text>
            <Text style={{ fontSize: 18, color: "rgba(255,255,255,0.9)", marginTop: 8 }}>
              {passed ? "🎉 Selamat! Anda Lulus!" : "😕 Coba Lagi!"}
            </Text>
            <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 8 }}>
              {correctCount} dari {questions.length} jawaban benar
            </Text>
          </LinearGradient>

          {/* Answer Review */}
          <Text style={{ color: "white", fontSize: 18, fontWeight: "600", marginBottom: 16 }}>
            Ringkasan Jawaban
          </Text>
          
          {questions.map((q: any, index: number) => {
            const isCorrect = answers[index] === q.correct_answer;
            return (
              <View key={index} style={{
                backgroundColor: isCorrect ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: isCorrect ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)",
              }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <Text style={{ fontSize: 20, marginRight: 8 }}>
                    {isCorrect ? "✅" : "❌"}
                  </Text>
                  <Text style={{ color: "white", fontSize: 14, fontWeight: "600", flex: 1 }}>
                    Pertanyaan {index + 1}
                  </Text>
                </View>
                <Text style={{ color: "#e2e8f0", fontSize: 13 }} numberOfLines={2}>
                  {q.question}
                </Text>
                {!isCorrect && (
                  <Text style={{ color: "#34d399", fontSize: 12, marginTop: 8 }}>
                    Jawaban benar: {q.options[q.correct_answer]}
                  </Text>
                )}
              </View>
            );
          })}

          {/* Action Buttons */}
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
                {isCompleting ? "Menyimpan..." : "Lanjut →"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  // Quiz View
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <LinearGradient
      colors={["#0f172a", "#312e81", "#1e1b4b"]}
      style={{ flex: 1 }}
    >
      {/* Header */}
      <View style={{
        backgroundColor: "rgba(255,255,255,0.1)",
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.1)",
      }}>
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 8 }}>
          <Text style={{ color: "#a5b4fc", fontSize: 14 }}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
          {pathway.title}
        </Text>
        
        {/* Progress Bar */}
        <View style={{ marginTop: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ color: "#a5b4fc", fontSize: 13 }}>
              Pertanyaan {currentQuestion + 1} dari {questions.length}
            </Text>
            <Text style={{ color: "#a5b4fc", fontSize: 13 }}>
              {Math.round(progress)}%
            </Text>
          </View>
          <View style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 4, height: 6 }}>
            <View style={{ 
              backgroundColor: "#eab308", 
              borderRadius: 4, 
              height: 6,
              width: `${progress}%`,
            }} />
          </View>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Question */}
        <View style={{
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
        }}>
          <Text style={{ color: "white", fontSize: 18, fontWeight: "600", lineHeight: 28 }}>
            {question?.question}
          </Text>
        </View>

        {/* Options */}
        {question?.options.map((option: string, index: number) => {
          const isSelected = answers[currentQuestion] === index;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleAnswer(index)}
              style={{
                backgroundColor: isSelected ? "rgba(99, 102, 241, 0.3)" : "rgba(255,255,255,0.05)",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 2,
                borderColor: isSelected ? "#6366f1" : "rgba(255,255,255,0.1)",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: isSelected ? "#6366f1" : "rgba(255,255,255,0.1)",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}>
                <Text style={{ color: "white", fontWeight: "600" }}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text style={{ color: "white", fontSize: 15, flex: 1 }}>
                {option}
              </Text>
              {isSelected && (
                <Text style={{ fontSize: 18 }}>✓</Text>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Navigation Buttons */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 20, marginBottom: 40 }}>
          <TouchableOpacity
            onPress={handlePrevious}
            disabled={currentQuestion === 0}
            style={{
              flex: 1,
              backgroundColor: currentQuestion === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)",
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.2)",
            }}
          >
            <Text style={{ 
              color: currentQuestion === 0 ? "#6b7280" : "white", 
              fontSize: 16, 
              fontWeight: "600" 
            }}>
              ← Sebelumnya
            </Text>
          </TouchableOpacity>
          
          {currentQuestion === questions.length - 1 ? (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={answers.length !== questions.length || isSubmitting}
              style={{
                flex: 1,
                backgroundColor: answers.length === questions.length ? "#22c55e" : "#4b5563",
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                  Kirim Jawaban
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleNext}
              disabled={answers[currentQuestion] === undefined}
              style={{
                flex: 1,
                backgroundColor: answers[currentQuestion] !== undefined ? "#6366f1" : "#4b5563",
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>
                Selanjutnya →
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
