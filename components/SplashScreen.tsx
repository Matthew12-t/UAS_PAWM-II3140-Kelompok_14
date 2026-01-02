import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

// Prevent native splash screen from autohiding
SplashScreen.preventAutoHideAsync().catch(() => {});

const { width, height } = Dimensions.get('window');

// Floating chemistry icon component (matches login screen style)
const FloatingIcon = ({
  emoji,
  size,
  top,
  left,
  right,
  bottom,
  delay = 0,
}: {
  emoji: string;
  size: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  delay?: number;
}) => {
  const opacity = useRef(new Animated.Value(0.15)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const opacityAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 1500,
          delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.15,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const floatAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -10,
          duration: 2000,
          delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    opacityAnim.start();
    floatAnim.start();

    return () => {
      opacityAnim.stop();
      floatAnim.stop();
    };
  }, []);

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        top,
        left,
        right,
        bottom,
        fontSize: size,
        opacity,
        transform: [{ translateY }],
      }}
    >
      {emoji}
    </Animated.Text>
  );
};

export default function CustomSplashScreen({ onFinish }: { onFinish: () => void }) {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Hide native splash immediately when custom splash mounts
    SplashScreen.hideAsync().catch(() => {});
    
    // Small delay before starting animations
    const startDelay = setTimeout(() => {
      // Animation sequence: logo appears → title → subtitle → finish
      Animated.sequence([
        // Logo scale and fade in
        Animated.parallel([
          Animated.spring(logoScale, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        // Title fade in
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        // Subtitle fade in
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Wait longer then hide splash (2 seconds total view time)
        setTimeout(() => {
          onFinish();
        }, 1500);
      });
    }, 300);

    return () => clearTimeout(startDelay);
  }, []);

  return (
    <LinearGradient
      colors={['#4F46E5', '#7C3AED', '#A855F7']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar style="light" />

      {/* Floating Chemistry Icons */}
      <FloatingIcon emoji="⚗️" size={50} top={height * 0.08} left={30} delay={0} />
      <FloatingIcon emoji="🧪" size={40} top={height * 0.15} right={40} delay={200} />
      <FloatingIcon emoji="🔬" size={45} top={height * 0.25} left={50} delay={400} />
      <FloatingIcon emoji="⚛️" size={55} top={height * 0.12} right={80} delay={100} />
      <FloatingIcon emoji="🧬" size={35} bottom={height * 0.25} left={40} delay={300} />
      <FloatingIcon emoji="💊" size={40} bottom={height * 0.18} right={50} delay={500} />
      <FloatingIcon emoji="🌡️" size={38} bottom={height * 0.30} right={100} delay={150} />
      <FloatingIcon emoji="📊" size={42} bottom={height * 0.12} left={80} delay={250} />

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo / Icon */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('../assets/chemlab.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Title */}
        <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>
          ChemLab Mobile
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
          Explore Chemistry Interactively
        </Animated.Text>
      </View>

      {/* Loading indicator */}
      <View style={styles.loadingContainer}>
        <View style={styles.loadingDots}>
          <LoadingDot delay={0} />
          <LoadingDot delay={200} />
          <LoadingDot delay={400} />
        </View>
      </View>
    </LinearGradient>
  );
}

// Animated loading dot
const LoadingDot = ({ delay }: { delay: number }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return <Animated.View style={[styles.dot, { opacity }]} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 150,
    height: 150,
    borderRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
});
