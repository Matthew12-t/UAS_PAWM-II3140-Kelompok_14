import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface SimulationViewProps {
  pathway: any;
  user: any;
  onComplete: () => void;
  onBack: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ============= SIMULASI SENYAWA (Element Selector) =============
function SimulasiSenyawa({ pathway, onComplete, onBack }: { pathway: any; onComplete: () => void; onBack: () => void }) {
  const [leftElement, setLeftElement] = useState("Hydrogen");
  const [rightElement, setRightElement] = useState("Oxygen");
  const [distance, setDistance] = useState(120); // Reduced initial distance so atoms are visible
  const [interaction, setInteraction] = useState("Attractive");
  const [showLeftPicker, setShowLeftPicker] = useState(false);
  const [showRightPicker, setShowRightPicker] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Animated positions for atoms
  const leftPos = useRef(new Animated.Value(-distance / 2)).current;
  const rightPos = useRef(new Animated.Value(distance / 2)).current;

  const elements = ["Hydrogen", "Oxygen", "Carbon"];

  const elementColors: Record<string, string> = {
    Hydrogen: "#a0d8ef",
    Oxygen: "#ff7f7f",
    Carbon: "#a8a8a8",
  };

  const elementSizes: Record<string, number> = {
    Hydrogen: 70,
    Oxygen: 90,
    Carbon: 100,
  };

  const radii = useMemo(() => {
    const rL = elementSizes[leftElement] / 2;
    const rR = elementSizes[rightElement] / 2;
    return { rL, rR };
  }, [leftElement, rightElement]);

  const thresholds = useMemo(() => {
    const buffer = 10;
    const repulsiveD = radii.rL + radii.rR + buffer;
    const noInteractionD = repulsiveD * 2.6;
    return { repulsiveD, noInteractionD };
  }, [radii]);

  const classify = (d: number) => {
    if (d < thresholds.repulsiveD) return "Repulsive";
    if (d > thresholds.noInteractionD) return "No Interaction";
    return "Attractive";
  };

  useEffect(() => {
    const minD = thresholds.repulsiveD * 0.9;
    const maxD = thresholds.noInteractionD * 1.1;
    const clamped = Math.min(maxD, Math.max(minD, distance));
    setDistance(clamped);
    setInteraction(classify(clamped));
  }, [leftElement, rightElement]);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(leftPos, {
        toValue: -distance / 2,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.spring(rightPos, {
        toValue: distance / 2,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();
  }, [distance]);

  const handleMove = (delta: number) => {
    let newDist = distance + delta;
    const minD = thresholds.repulsiveD * 0.8;
    const maxD = thresholds.noInteractionD * 1.3;
    newDist = Math.min(maxD, Math.max(minD, newDist));
    setDistance(newDist);
    setInteraction(classify(newDist));
  };

  // Calculate energy level percentage
  const energyPercentage = Math.max(
    0,
    Math.min(
      100,
      ((thresholds.noInteractionD - distance) /
        (thresholds.noInteractionD - thresholds.repulsiveD)) *
        100
    )
  );

  const handleComplete = async () => {
    setIsCompleting(true);
    onComplete();
  };

  return (
    <LinearGradient
      colors={["#0f172a", "#312e81", "#1e1b4b"]}
      style={{ flex: 1 }}
    >
      {/* Header - Same as other pathways */}
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
          {pathway?.title || "Simulasi Senyawa"}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Main Layout - Row for Energy + Simulation */}
        <View style={styles.mainRow}>
        {/* Potential Energy Bar */}
        <View style={styles.energyContainer}>
          <Text style={styles.energyTitle}>Potential{"\n"}Energy</Text>
          <View style={styles.energyBar}>
            <LinearGradient
              colors={["#86efac", "#4ade80"]}
              style={StyleSheet.absoluteFill}
            />
            <View
              style={[
                styles.energyFill,
                { height: `${energyPercentage}%` },
              ]}
            />
          </View>
          <Text style={styles.energyLabel}>Energy Level</Text>
        </View>

        {/* Simulation Box */}
        <View style={styles.simulationBox}>
          {/* Left Atom */}
          <Animated.View
            style={[
              styles.atom,
              {
                width: elementSizes[leftElement],
                height: elementSizes[leftElement],
                borderRadius: elementSizes[leftElement] / 2,
                backgroundColor: elementColors[leftElement],
                transform: [{ translateX: leftPos }],
              },
            ]}
          >
            <Text style={styles.atomLabel}>{leftElement[0]}</Text>
          </Animated.View>

          {/* Right Atom */}
          <Animated.View
            style={[
              styles.atom,
              {
                width: elementSizes[rightElement],
                height: elementSizes[rightElement],
                borderRadius: elementSizes[rightElement] / 2,
                backgroundColor: elementColors[rightElement],
                transform: [{ translateX: rightPos }],
              },
            ]}
          >
            <Text style={styles.atomLabel}>{rightElement[0]}</Text>
          </Animated.View>

          {/* Interaction Status */}
          <View style={styles.interactionContainer}>
            <Text style={styles.interactionLabel}>Overall interaction:</Text>
            <Text
              style={[
                styles.interactionValue,
                {
                  color:
                    interaction === "Attractive"
                      ? "#4ade80"
                      : interaction === "Repulsive"
                      ? "#f97316"
                      : "#9ca3af",
                },
              ]}
            >
              {interaction}
            </Text>
          </View>
        </View>
      </View>

      {/* Control Panel */}
      <View style={styles.controlPanel}>
        {/* Left Element Selector */}
        <View style={[styles.selectorGroup, { zIndex: 200 }]}>
          <Text style={styles.selectorLabel}>Left Element</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => {
              setShowLeftPicker(!showLeftPicker);
              setShowRightPicker(false);
            }}
          >
            <Text style={styles.selectorText}>{leftElement}</Text>
            <Text style={styles.selectorArrow}>▼</Text>
          </TouchableOpacity>
          {showLeftPicker && (
            <View style={styles.pickerDropdown}>
              {elements.map((el) => (
                <TouchableOpacity
                  key={el}
                  style={[
                    styles.pickerOption,
                    leftElement === el && styles.pickerOptionSelected,
                  ]}
                  onPress={() => {
                    setLeftElement(el);
                    setShowLeftPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      leftElement === el && styles.pickerOptionTextSelected,
                    ]}
                  >
                    {el}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Right Element Selector */}
        <View style={[styles.selectorGroup, { zIndex: 100 }]}>
          <Text style={styles.selectorLabel}>Right Element</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => {
              setShowRightPicker(!showRightPicker);
              setShowLeftPicker(false);
            }}
          >
            <Text style={styles.selectorText}>{rightElement}</Text>
            <Text style={styles.selectorArrow}>▼</Text>
          </TouchableOpacity>
          {showRightPicker && (
            <View style={styles.pickerDropdown}>
              {elements.map((el) => (
                <TouchableOpacity
                  key={el}
                  style={[
                    styles.pickerOption,
                    rightElement === el && styles.pickerOptionSelected,
                  ]}
                  onPress={() => {
                    setRightElement(el);
                    setShowRightPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      rightElement === el && styles.pickerOptionTextSelected,
                    ]}
                  >
                    {el}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Distance Controls */}
        <View style={styles.distanceGroup}>
          <Text style={styles.selectorLabel}>Distance</Text>
          <View style={styles.distanceButtons}>
            <TouchableOpacity
              style={styles.moveCloserBtn}
              onPress={() => handleMove(-20)}
            >
              <Text style={styles.moveBtnText}>Move{"\n"}Closer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.moveApartBtn}
              onPress={() => handleMove(20)}
            >
              <Text style={styles.moveBtnText}>Move{"\n"}Apart</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.distanceValue}>{Math.round(distance)} px</Text>
        </View>
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleComplete}
          disabled={isCompleting}
        >
          <LinearGradient
            colors={["#6366f1", "#8b5cf6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.completeButtonGradient}
          >
            <Text style={styles.completeButtonText}>
              {isCompleting ? "Menyimpan..." : "Selanjutnya →"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </LinearGradient>
  );
}

// ============= SIMULASI PEMBENTUKAN IKATAN (Draggable Atoms with Force) =============
function SimulasiPembentukanIkatan({ pathway, onComplete, onBack }: { pathway: any; onComplete: () => void; onBack: () => void }) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [interaction, setInteraction] = useState("Neutral");
  const [interactionColor, setInteractionColor] = useState("#9ca3af");

  const canvasWidth = SCREEN_WIDTH - 32;
  const canvasHeight = 350;
  const atomR = 24;
  const bias = 100;
  const midY = canvasHeight / 2;

  // Atom positions - default to neutral (farther apart)
  const [a1X, setA1X] = useState(canvasWidth * 0.20);
  const [a2X, setA2X] = useState(canvasWidth * 0.80);

  // Refs for pan responders
  const a1Offset = useRef(0);
  const a2Offset = useRef(0);

  // Force calculation (Lennard-Jones)
  const computeForce = (x1: number, x2: number) => {
    const r = Math.abs(x2 - x1);
    if (r < 1) return { mag: 0, kind: "Neutral" };
    
    const sOverR = bias / r;
    const s6 = Math.pow(sOverR, 6);
    const s12 = s6 * s6;
    const Fmag = 24 * 1.0 * (2 * s12 / r - s6 / r);
    
    const kind = Math.abs(Fmag) < 0.002 ? "Neutral" : Fmag > 0 ? "Repulsive" : "Attractive";
    return { mag: Fmag, kind };
  };

  useEffect(() => {
    const force = computeForce(a1X, a2X);
    setInteraction(force.kind);
    setInteractionColor(
      force.kind === "Attractive"
        ? "#90EE90" // lightgreen
        : force.kind === "Repulsive"
        ? "#FFA500" // orange
        : "#808080" // gray
    );
  }, [a1X, a2X]);

  const panResponder1 = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        a1Offset.current = a1X;
      },
      onPanResponderMove: (_, gesture) => {
        const newX = Math.max(atomR + 20, Math.min(canvasWidth / 2 - atomR, a1Offset.current + gesture.dx));
        setA1X(newX);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const panResponder2 = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        a2Offset.current = a2X;
      },
      onPanResponderMove: (_, gesture) => {
        const newX = Math.max(canvasWidth / 2 + atomR, Math.min(canvasWidth - atomR - 20, a2Offset.current + gesture.dx));
        setA2X(newX);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const handleReset = () => {
    setA1X(canvasWidth * 0.20);
    setA2X(canvasWidth * 0.80);
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    onComplete();
  };

  // Arrow direction based on force
  const force = computeForce(a1X, a2X);

  // Calculate distance and overlap factor for electron clouds
  const distance = Math.abs(a2X - a1X);
  const overlapFactor = Math.max(0, 1 - distance / 300);
  
  // Base cloud radius (smaller when far apart)
  const baseCloudRadius = 80;
  const cloudRadius = baseCloudRadius + overlapFactor * 40;
  
  // Arrow length based on force magnitude
  const arrowLength = Math.min(60, Math.max(20, Math.abs(force.mag) * 100 + 20));

  return (
    <LinearGradient
      colors={["#0f172a", "#312e81", "#1e1b4b"]}
      style={{ flex: 1 }}
    >
      {/* Header - Same as other pathways */}
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
          {pathway?.title || "Simulasi Pembentukan Ikatan Kimia"}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {/* Canvas Container */}
        <View style={styles.canvasContainer}>
          {/* Header */}
          <View style={styles.canvasHeader}>
            <Text style={styles.canvasHeaderText}>Pembentukkan Ikatan Kimia</Text>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {/* Cyan border */}
          <View style={styles.canvasBorder} />

          {/* Canvas */}
          <View style={[styles.canvas, { width: canvasWidth, height: canvasHeight }]}>
            
            {/* Red glow effect for LEFT atom - individual cloud */}
            <View
              style={{
                position: "absolute",
                left: a1X - cloudRadius,
                top: midY - cloudRadius,
                width: cloudRadius * 2,
                height: cloudRadius * 2,
                borderRadius: cloudRadius,
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={[
                  `rgba(255,0,0,${0.6 - overlapFactor * 0.2})`, 
                  `rgba(255,0,0,${0.3 - overlapFactor * 0.1})`, 
                  "rgba(255,0,0,0.05)", 
                  "transparent"
                ]}
                style={{
                  width: cloudRadius * 2,
                  height: cloudRadius * 2,
                  borderRadius: cloudRadius,
                }}
                start={{ x: 0.5, y: 0.5 }}
                end={{ x: 1, y: 1 }}
              />
            </View>

            {/* Red glow effect for RIGHT atom - individual cloud */}
            <View
              style={{
                position: "absolute",
                left: a2X - cloudRadius,
                top: midY - cloudRadius,
                width: cloudRadius * 2,
                height: cloudRadius * 2,
                borderRadius: cloudRadius,
                overflow: "hidden",
              }}
            >
              <LinearGradient
                colors={[
                  `rgba(255,0,0,${0.6 - overlapFactor * 0.2})`, 
                  `rgba(255,0,0,${0.3 - overlapFactor * 0.1})`, 
                  "rgba(255,0,0,0.05)", 
                  "transparent"
                ]}
                style={{
                  width: cloudRadius * 2,
                  height: cloudRadius * 2,
                  borderRadius: cloudRadius,
                }}
                start={{ x: 0.5, y: 0.5 }}
                end={{ x: 1, y: 1 }}
              />
            </View>

            {/* Merged cloud in the middle when overlapping (attractive zone) */}
            {overlapFactor > 0.2 && (
              <View
                style={{
                  position: "absolute",
                  left: (a1X + a2X) / 2 - cloudRadius * 1.2,
                  top: midY - cloudRadius * 0.8,
                  width: cloudRadius * 2.4,
                  height: cloudRadius * 1.6,
                  borderRadius: cloudRadius,
                  overflow: "hidden",
                }}
              >
                <LinearGradient
                  colors={[
                    `rgba(255,0,0,${0.5 * overlapFactor})`, 
                    `rgba(255,0,0,${0.3 * overlapFactor})`, 
                    "transparent"
                  ]}
                  style={{
                    width: cloudRadius * 2.4,
                    height: cloudRadius * 1.6,
                    borderRadius: cloudRadius,
                  }}
                  start={{ x: 0.5, y: 0.5 }}
                  end={{ x: 1, y: 1 }}
                />
              </View>
            )}

            {/* Left Arrow - starts from atom, points LEFT when repulsive, RIGHT when attractive */}
            <View 
              style={{ 
                position: "absolute", 
                left: force.kind === "Repulsive" ? a1X - arrowLength - atomR : a1X + atomR,
                top: midY - 2,
                width: arrowLength,
                height: 4,
                backgroundColor: "#FFD700",
              }} 
            />
            {/* Left Arrow Head */}
            <Text style={{ 
              position: "absolute", 
              left: force.kind === "Repulsive" ? a1X - arrowLength - atomR - 12 : a1X + atomR + arrowLength - 4,
              top: midY - 12,
              fontSize: 16, 
              color: "#FFD700", 
              fontWeight: "bold",
            }}>
              {force.kind === "Repulsive" ? "◀" : "▶"}
            </Text>

            {/* Right Arrow - starts from atom, points RIGHT when repulsive, LEFT when attractive */}
            <View 
              style={{ 
                position: "absolute", 
                left: force.kind === "Repulsive" ? a2X + atomR : a2X - arrowLength - atomR,
                top: midY - 2,
                width: arrowLength,
                height: 4,
                backgroundColor: "#FFD700",
              }} 
            />
            {/* Right Arrow Head */}
            <Text style={{ 
              position: "absolute", 
              left: force.kind === "Repulsive" ? a2X + atomR + arrowLength - 4 : a2X - arrowLength - atomR - 12,
              top: midY - 12,
              fontSize: 16, 
              color: "#FFD700", 
              fontWeight: "bold",
            }}>
              {force.kind === "Repulsive" ? "▶" : "◀"}
            </Text>

            {/* Atom 1 (Left) */}
            <View
              {...panResponder1.panHandlers}
              style={[
                styles.draggableAtom,
                {
                  left: a1X - atomR,
                  top: midY - atomR,
                },
              ]}
            >
              <LinearGradient
                colors={["#87CEEB", "#4682B4"]}
                style={styles.atomGradient}
              >
                <View style={styles.atomHighlight} />
              </LinearGradient>
            </View>

            {/* Atom 2 (Right) */}
            <View
              {...panResponder2.panHandlers}
              style={[
                styles.draggableAtom,
                {
                  left: a2X - atomR,
                  top: midY - atomR,
                },
              ]}
            >
              <LinearGradient
                colors={["#87CEEB", "#4682B4"]}
                style={styles.atomGradient}
              >
                <View style={styles.atomHighlight} />
              </LinearGradient>
            </View>

            {/* Interaction Status */}
            <View style={styles.canvasInteraction}>
              <Text style={[styles.canvasInteractionText, { color: interactionColor }]}>
                Overall interaction: {interaction}
              </Text>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            💡 Seret atom untuk mengubah jarak dan lihat bagaimana gaya interaksi berubah.
            Jingga = Repulsive (tolak menolak), Hijau = Attractive (tarik menarik).
          </Text>
        </View>

        {/* Bottom Buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Kembali</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleComplete}
            disabled={isCompleting}
          >
            <LinearGradient
              colors={["#6366f1", "#8b5cf6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.completeButtonGradient}
            >
              <Text style={styles.completeButtonText}>
                {isCompleting ? "Menyimpan..." : "Selanjutnya →"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

// ============= MAIN SIMULATION VIEW =============
export default function SimulationView({
  pathway,
  user,
  onComplete,
  onBack,
}: SimulationViewProps) {
  // Determine which simulation to show based on pathway title or content
  const isIkatanSimulation = 
    pathway.title?.toLowerCase().includes("pembentukan") ||
    pathway.title?.toLowerCase().includes("ikatan kimia") ||
    pathway.order_number === 4; // Assuming order 4 is the bond formation simulation

  if (isIkatanSimulation) {
    return <SimulasiPembentukanIkatan pathway={pathway} onComplete={onComplete} onBack={onBack} />;
  }

  return <SimulasiSenyawa pathway={pathway} onComplete={onComplete} onBack={onBack} />;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  divider: {
    height: 2,
    backgroundColor: "#6366f1",
    marginBottom: 16,
  },
  mainRow: {
    flexDirection: "row",
    gap: 12,
  },
  energyContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    width: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  energyTitle: {
    fontSize: 10,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    marginBottom: 8,
  },
  energyBar: {
    width: 32,
    height: 140,
    backgroundColor: "#86efac",
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
  },
  energyFill: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#ef4444",
  },
  energyLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 6,
    textAlign: "center",
  },
  simulationBox: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 12,
    height: 260,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  atom: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.3)",
  },
  atomLabel: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  interactionContainer: {
    position: "absolute",
    bottom: 16,
    alignItems: "center",
  },
  interactionLabel: {
    fontSize: 11,
    color: "#fde047",
  },
  interactionValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  controlPanel: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectorGroup: {
    marginBottom: 16,
    position: "relative",
  },
  selectorLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  selector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "white",
  },
  selectorText: {
    fontSize: 14,
    color: "#374151",
  },
  selectorArrow: {
    fontSize: 12,
    color: "#6b7280",
  },
  pickerDropdown: {
    position: "absolute",
    top: 68,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  pickerOptionSelected: {
    backgroundColor: "#3b82f6",
  },
  pickerOptionText: {
    fontSize: 14,
    color: "#374151",
  },
  pickerOptionTextSelected: {
    color: "white",
  },
  distanceGroup: {
    marginTop: 0,
  },
  distanceButtons: {
    flexDirection: "row",
    gap: 10,
  },
  moveCloserBtn: {
    flex: 1,
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  moveApartBtn: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  moveBtnText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  distanceValue: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
  },
  bottomButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    paddingBottom: 40,
  },
  backButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  backButtonText: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "500",
  },
  completeButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  completeButtonGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  completeButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  // Simulasi Pembentukan Ikatan styles
  canvasContainer: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  canvasHeader: {
    backgroundColor: "#061a1a",
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  canvasHeaderText: {
    color: "#cfe",
    fontSize: 14,
    fontWeight: "500",
  },
  canvasBorder: {
    height: 2,
    backgroundColor: "#00e0c6",
  },
  resetButton: {
    backgroundColor: "#072",
    borderWidth: 1,
    borderColor: "#1c9",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  resetButtonText: {
    color: "#dff",
    fontSize: 13,
    fontWeight: "500",
  },
  canvas: {
    backgroundColor: "#000",
    position: "relative",
  },
  glowEffect: {
    position: "absolute",
    borderRadius: 120,
    backgroundColor: "rgba(255,0,0,0.6)",
  },
  draggableAtom: {
    position: "absolute",
    width: 48,
    height: 48,
  },
  atomGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  atomHighlight: {
    position: "absolute",
    top: 6,
    left: 10,
    width: 14,
    height: 10,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 8,
  },
  arrowLeft: {
    position: "absolute",
  },
  arrowRight: {
    position: "absolute",
  },
  arrowText: {
    fontSize: 20,
    color: "#ffea00",
    fontWeight: "bold",
  },
  connectionLine: {
    position: "absolute",
    height: 3,
    backgroundColor: "#ffea00",
  },
  canvasInteraction: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  canvasInteractionText: {
    fontSize: 18,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  instructions: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
  },
  instructionsText: {
    color: "#a5b4fc",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
});
