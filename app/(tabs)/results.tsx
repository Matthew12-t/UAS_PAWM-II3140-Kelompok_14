import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Animated,
  Easing,
  Modal,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { supabase, getCurrentUser } from "../../lib/supabase";
import { useTheme, ThemeColors } from "../../lib/ThemeContext";

// Stats Card Component
const StatsCard = ({ 
  title, 
  value, 
  maxValue,
  subtitle, 
  gradientColors 
}: { 
  title: string; 
  value: string | number; 
  maxValue?: string | number;
  subtitle: string;
  gradientColors: [string, string];
}) => (
  <LinearGradient
    colors={gradientColors}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{
      flex: 1,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 4,
      minHeight: 120,
    }}
  >
    <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: "600", marginBottom: 12 }}>
      {title}
    </Text>
    <View style={{ flexDirection: "row", alignItems: "baseline" }}>
      <Text style={{ color: "white", fontSize: 28, fontWeight: "bold" }}>
        {value}
      </Text>
      {maxValue !== undefined && (
        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "500" }}>
          {` / ${maxValue}`}
        </Text>
      )}
    </View>
    <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 8 }}>
      {subtitle}
    </Text>
  </LinearGradient>
);

// Result Item Component
const ResultItem = ({ 
  number, 
  title, 
  type, 
  score,
  onPress,
  theme,
}: { 
  number: number;
  title: string; 
  type: string;
  score: number;
  onPress: () => void;
  theme: ThemeColors;
}) => {
  const getScoreColor = () => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#eab308";
    return "#ef4444";
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.8}
      style={{ marginBottom: 12 }}
    >
      <View style={{
        backgroundColor: theme.cardBg,
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: theme.cardBorder,
      }}>
        {/* Number Badge */}
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: "#6366f1",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 16,
        }}>
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
            {number}
          </Text>
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          <Text style={{ 
            color: theme.textPrimary, 
            fontSize: 15, 
            fontWeight: "600",
            marginBottom: 2
          }}>
            {title}
          </Text>
          <Text style={{ 
            color: theme.textSecondary, 
            fontSize: 12 
          }}>
            {type} • Klik untuk melihat pembahasan
          </Text>
        </View>

        {/* Score */}
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ 
            color: getScoreColor(), 
            fontSize: 24, 
            fontWeight: "bold" 
          }}>
            {score}
          </Text>
          <Text style={{ color: "#9ca3af", fontSize: 11 }}>/ 100</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

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

// Attempt Selector Component
const AttemptSelector = ({
  attempts,
  selectedAttempt,
  onSelectAttempt,
}: {
  attempts: number;
  selectedAttempt: number;
  onSelectAttempt: (index: number) => void;
}) => {

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: "#9ca3af", fontSize: 12, marginBottom: 8 }}>
        Pilih Percobaan ({attempts} total)
      </Text>
      {attempts <= 1 ? (
        <Text style={{ color: "#a5b4fc", fontSize: 13 }}>
          Hanya ada 1 percobaan
        </Text>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {Array.from({ length: attempts }, (_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => onSelectAttempt(i)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: selectedAttempt === i ? "#6366f1" : "rgba(255,255,255,0.1)",
                borderWidth: 1,
                borderColor: selectedAttempt === i ? "#6366f1" : "rgba(255,255,255,0.2)",
              }}
            >
              <Text style={{ 
                color: selectedAttempt === i ? "white" : "#a5b4fc", 
                fontSize: 13,
                fontWeight: selectedAttempt === i ? "600" : "400",
              }}>
                Percobaan {i + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default function ResultsScreen() {
  const { theme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [pathways, setPathways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState<number | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  // Changed: Store grouped attempts instead of single attempt
  const [groupedAttempts, setGroupedAttempts] = useState<any[][]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState(0);
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

  // Fetch quiz detail when modal opens - Updated to group by attempts
  const fetchQuizDetail = async (pathwayId: number, title: string) => {
    setSelectedPathway(pathwayId);
    setSelectedTitle(title);
    setModalVisible(true);
    setModalLoading(true);
    setSelectedAttempt(0); // Reset to first (latest) attempt

    try {
      // Fetch pathway content for questions
      const { data: pathwayData } = await supabase
        .from("pathways")
        .select("content")
        .eq("id", pathwayId)
        .single();

      // Fetch user's answers
      const { data: answersData } = await supabase
        .from("quiz_answers")
        .select("*")
        .eq("pathway_id", pathwayId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (answersData && answersData.length > 0) {
        const questions = pathwayData?.content?.questions || [];
        
        // Determine questions per attempt
        let questionsPerAttempt = questions.length;
        
        if (questionsPerAttempt === 0) {
          // Count unique question_ids by looking for repeating pattern
          const questionIds: string[] = [];
          for (const answer of answersData) {
            // If we see a question_id that we've seen before, we found the boundary
            if (questionIds.includes(answer.question_id)) {
              break;
            }
            questionIds.push(answer.question_id);
          }
          questionsPerAttempt = questionIds.length || 3; // Default to 3 if can't determine
        }

        console.log("Questions per attempt:", questionsPerAttempt);
        console.log("Total answers:", answersData.length);
        console.log("Expected attempts:", Math.ceil(answersData.length / questionsPerAttempt));

        // Format all answers
        const formattedAnswers = answersData.map((answer: any, idx: number) => {
          const question = questions.find((q: any) => q.id === answer.question_id);
          
          let questionText = question?.question || "Pertanyaan tidak ditemukan";
          let options = question?.options || [];
          
          if (!question && answer.explanation) {
            questionText = `Pertanyaan ${(idx % questionsPerAttempt) + 1}`;
          }
          
          return {
            question_id: answer.question_id,
            user_answer: answer.user_answer,
            correct_answer: answer.correct_answer,
            is_correct: answer.is_correct,
            explanation: answer.explanation,
            question_text: questionText,
            options: options,
            created_at: answer.created_at,
          };
        });

        // Group answers into attempts
        const attempts: any[][] = [];
        for (let i = 0; i < formattedAnswers.length; i += questionsPerAttempt) {
          const attempt = formattedAnswers.slice(i, i + questionsPerAttempt);
          if (attempt.length > 0) {
            attempts.push(attempt);
          }
        }

        console.log("Number of attempts found:", attempts.length);

        // Keep chronological order: attempt 1 is oldest, last attempt is newest
        setGroupedAttempts(attempts);
        setSelectedAttempt(attempts.length - 1); // Select latest (last) attempt by default
      } else {
        setGroupedAttempts([]);
      }
    } catch (error) {
      console.error("Error fetching quiz detail:", error);
      setGroupedAttempts([]);
    } finally {
      setModalLoading(false);
    }
  };

  // Fetch quiz results from user_pathway_progress
  const fetchResults = async () => {
    if (!user) return;

    try {
      // Fetch user pathway progress
      const { data: progressData, error: progressError } = await supabase
        .from("user_pathway_progress")
        .select("*")
        .eq("user_id", user.id);

      if (progressError) {
        console.error("Error fetching progress:", progressError);
      }

      // Fetch all pathways to get titles and types
      const { data: pathwaysData, error: pathwaysError } = await supabase
        .from("pathways")
        .select("*")
        .order("order_number", { ascending: true });

      if (pathwaysError) {
        console.error("Error fetching pathways:", pathwaysError);
      }

      if (pathwaysData) {
        setPathways(pathwaysData);
      }

      if (progressData && pathwaysData) {
        // Filter for completed quiz/final_test with scores
        const formattedResults = progressData
          .filter((p: any) => p.status === "completed" && p.score !== null)
          .map((p: any) => {
            const pathway = pathwaysData.find((pw: any) => pw.id === p.pathway_id);
            return {
              id: p.id,
              pathwayId: p.pathway_id,
              title: pathway?.title || "Unknown",
              score: p.score || 0,
              status: p.status,
              type: pathway?.type,
              orderNumber: pathway?.order_number,
            };
          })
          .filter((r: any) => r.type === "quiz" || r.type === "final_test")
          .sort((a: any, b: any) => a.orderNumber - b.orderNumber);

        setQuizResults(formattedResults);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchResults();
    }
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchResults();
  };

  // Calculate statistics
  const totalScore = quizResults.reduce((sum, r) => sum + (r.score || 0), 0);
  const maxPossibleScore = quizResults.length * 100;
  const averageScore = quizResults.length > 0 
    ? Math.round(totalScore / quizResults.length) 
    : 0;
  const completedCount = quizResults.length;
  const totalQuizAndFinalTest = pathways.filter((p: any) => p.type === "quiz" || p.type === "final_test").length;

  // Get current attempt's answers and score
  const currentAttemptAnswers = groupedAttempts[selectedAttempt] || [];
  const currentAttemptScore = currentAttemptAnswers.length > 0
    ? Math.round((currentAttemptAnswers.filter((a: any) => a.is_correct).length / currentAttemptAnswers.length) * 100)
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
        <FloatingIcon emoji="📊" size={48} top={80} left={-10} delay={0} />
        <FloatingIcon emoji="🏆" size={36} top={200} right={10} delay={1000} />
        <FloatingIcon emoji="✅" size={40} bottom={200} left={20} delay={2000} />
        <FloatingIcon emoji="📝" size={36} bottom={100} right={-5} delay={1500} />
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
            source={require("../../assets/images/hasil.png")} 
            style={{ width: 32, height: 32 }} 
            resizeMode="contain"
          />
          <Text style={{ fontSize: 28, fontWeight: "bold", color: theme.textPrimary }}>Hasil Pembelajaran</Text>
        </View>
        <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 4 }}>Pantau progress dan nilai Anda</Text>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.textSecondary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <View style={{
          backgroundColor: "#172554",
          borderColor: "#2563EB", 
          borderWidth: 1,
          borderRadius: 12,
          padding: 14,
          marginBottom: 16,
          flexDirection: "row",
          alignItems: "flex-start",
        }}>
          <View style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: "white",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 10,
            marginTop: 8,
          }}>
            <Text style={{ color: "#7ac6e9ff", fontSize: 14, fontWeight: "bold" }}>i</Text>
          </View>
          <Text style={{ color: "white", fontSize: 12, flex: 1, lineHeight: 20 }}>
            Statistik di bawah dihitung berdasarkan <Text style={{ fontWeight: "bold" }}>PERCOBAAN TERAKHIR</Text> Anda pada setiap <Text style={{ fontWeight: "bold" }}>Kuis</Text> dan <Text style={{ fontWeight: "bold" }}>Tes Akhir</Text>.
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={{ flexDirection: "row", marginBottom: 24, marginHorizontal: -4 }}>
          <StatsCard
            title="Total Nilai Terkini"
            value={totalScore}
            maxValue={maxPossibleScore || 300}
            subtitle={`dari ${completedCount} Hasil`}
            gradientColors={["#06b6d4", "#3b82f6"]}
          />
          <StatsCard
            title="Rata-rata Terkini"
            value={averageScore}
            subtitle="dari 100"
            gradientColors={["#8b5cf6", "#a855f7"]}
          />
          <StatsCard
            title="Progres Materi"
            value={completedCount}
            maxValue={`${totalQuizAndFinalTest} Selesai`}
            subtitle="kuis & tes akhir"
            gradientColors={["#22c55e", "#10b981"]}
          />
        </View>

        {/* Results List */}
        <View style={{
          backgroundColor: theme.cardBg,
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: theme.cardBorder,
        }}>
          <Text style={{ 
            fontSize: 18, 
            fontWeight: "bold", 
            color: theme.textPrimary, 
            marginBottom: 16 
          }}>
            Detail Hasil
          </Text>

          {loading ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <Text style={{ color: theme.textSecondary }}>Memuat hasil...</Text>
            </View>
          ) : quizResults.length === 0 ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>📝</Text>
              <Text style={{ color: theme.textSecondary, textAlign: "center" }}>
                Belum ada hasil kuis atau tes.{"\n"}Selesaikan pembelajaran untuk melihat hasil.
              </Text>
            </View>
          ) : (
            quizResults.map((result, index) => (
              <ResultItem
                key={result.id}
                number={index + 1}
                title={result.title || `Kuis ${index + 1}`}
                type={result.type === "final_test" ? "Tes Akhir" : "Kuis"}
                score={result.score || 0}
                theme={theme}
                onPress={() => {
                  fetchQuizDetail(result.pathwayId, result.title);
                }}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Quiz Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
        }}>
          <View style={{
            flex: 1,
            marginTop: 60,
            backgroundColor: "#1e1b4b",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: "hidden",
          }}>
            {/* Modal Header */}
            <LinearGradient
              colors={["#6366f1", "#3b82f6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingTop: 20,
                paddingBottom: 20,
                paddingHorizontal: 20,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
                    {selectedTitle}
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4 }}>
                    {groupedAttempts.length > 0 
                      ? `${groupedAttempts.length} Percobaan • Skor: ${currentAttemptScore}/100`
                      : "Pembahasan Jawaban Anda"
                    }
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "white", fontSize: 18 }}>✕</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Modal Content */}
            <ScrollView 
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 20 }}
            >
              {modalLoading ? (
                <View style={{ padding: 40, alignItems: "center" }}>
                  <ActivityIndicator size="large" color="#a5b4fc" />
                  <Text style={{ color: "#a5b4fc", marginTop: 16 }}>Memuat pembahasan...</Text>
                </View>
              ) : groupedAttempts.length === 0 ? (
                <View style={{ padding: 40, alignItems: "center" }}>
                  <Text style={{ fontSize: 40, marginBottom: 12 }}>📝</Text>
                  <Text style={{ color: "#a5b4fc", textAlign: "center" }}>
                    Tidak ada data pembahasan yang ditemukan.
                  </Text>
                </View>
              ) : (
                <>
                  {/* Attempt Selector */}
                  <AttemptSelector
                    attempts={groupedAttempts.length}
                    selectedAttempt={selectedAttempt}
                    onSelectAttempt={setSelectedAttempt}
                  />

                  {/* Score Summary for Selected Attempt */}
                  <View style={{
                    backgroundColor: "rgba(99,102,241,0.2)",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <View>
                      <Text style={{ color: "#a5b4fc", fontSize: 12 }}>
                        Percobaan {selectedAttempt + 1}
                      </Text>
                      <Text style={{ color: "white", fontSize: 16, fontWeight: "600", marginTop: 4 }}>
                        {currentAttemptAnswers.filter((a: any) => a.is_correct).length} dari {currentAttemptAnswers.length} benar
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: currentAttemptScore >= 80 ? "#22c55e" : currentAttemptScore >= 60 ? "#eab308" : "#ef4444",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 12,
                    }}>
                      <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>
                        {currentAttemptScore}
                      </Text>
                    </View>
                  </View>

                  {/* Questions */}
                  {currentAttemptAnswers.map((answer: any, index: number) => (
                    <View 
                      key={index}
                      style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 16,
                        borderLeftWidth: 4,
                        borderLeftColor: answer.is_correct ? "#22c55e" : "#ef4444",
                      }}
                    >
                      {/* Question Header */}
                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                        <Text style={{ color: "white", fontSize: 15, fontWeight: "600", flex: 1, marginRight: 8 }}>
                          Pertanyaan {index + 1}
                        </Text>
                        <View style={{
                          backgroundColor: answer.is_correct ? "#22c55e" : "#ef4444",
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 12,
                        }}>
                          <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>
                            {answer.is_correct ? "✓ Benar" : "✗ Salah"}
                          </Text>
                        </View>
                      </View>

                      {/* Question Text */}
                      <Text style={{ color: "#e5e7eb", fontSize: 14, marginBottom: 12, lineHeight: 20 }}>
                        {answer.question_text}
                      </Text>

                      {/* User Answer */}
                      <View style={{ marginBottom: 8 }}>
                        <Text style={{ color: "#9ca3af", fontSize: 12, marginBottom: 4 }}>Jawaban Anda:</Text>
                        <View style={{
                          backgroundColor: answer.is_correct ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                          padding: 12,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: answer.is_correct ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)",
                        }}>
                          <Text style={{ color: "white", fontSize: 14 }}>
                            {answer.options && answer.options[answer.user_answer] 
                              ? answer.options[answer.user_answer] 
                              : "Tidak dijawab"}
                          </Text>
                        </View>
                      </View>

                      {/* Correct Answer (if wrong) */}
                      {!answer.is_correct && answer.options && answer.options[answer.correct_answer] && (
                        <View style={{ marginBottom: 8 }}>
                          <Text style={{ color: "#9ca3af", fontSize: 12, marginBottom: 4 }}>Jawaban yang Benar:</Text>
                          <View style={{
                            backgroundColor: "rgba(34,197,94,0.2)",
                            padding: 12,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: "rgba(34,197,94,0.3)",
                          }}>
                            <Text style={{ color: "#22c55e", fontSize: 14 }}>
                              {answer.options[answer.correct_answer]}
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* Explanation */}
                      {answer.explanation && (
                        <View>
                          <Text style={{ color: "#9ca3af", fontSize: 12, marginBottom: 4 }}>Pembahasan:</Text>
                          <View style={{
                            backgroundColor: "rgba(99,102,241,0.1)",
                            padding: 12,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: "rgba(99,102,241,0.2)",
                          }}>
                            <Text style={{ color: "#a5b4fc", fontSize: 13, lineHeight: 20 }}>
                              {answer.explanation}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  ))}
                </>
              )}
            </ScrollView>

            {/* Close Button */}
            <View style={{ padding: 20, paddingBottom: 40 }}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{
                  backgroundColor: "#6366f1",
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontSize: 16, fontWeight: "600" }}>Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}