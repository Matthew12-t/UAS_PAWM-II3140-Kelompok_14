import React from "react";
import { View, Platform, StyleSheet, ViewStyle, ScrollView, RefreshControl, RefreshControlProps } from "react-native";

interface WebContentContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  maxWidth?: number;
}

const isWeb = Platform.OS === 'web';

/**
 * A container component that limits the content width on web platforms
 * while keeping full width on mobile devices.
 * Use this inside ScrollView to constrain only the content area (not header/footer).
 */
export function WebContentContainer({ 
  children, 
  style,
  maxWidth = 480 // Default max width similar to mobile screen
}: WebContentContainerProps) {
  if (!isWeb) {
    // On mobile, just return children with optional style
    return (
      <View style={[{ flex: 1 }, style]}>
        {children}
      </View>
    );
  }

  // On web, center the content with max width
  return (
    <View style={[styles.webContentContainer, style]}>
      <View style={[styles.webContentInner, { maxWidth }]}>
        {children}
      </View>
    </View>
  );
}

/**
 * A ScrollView wrapper that constrains content width on web.
 * Header and footer remain full width, only scrollable content is constrained.
 */
interface WebScrollViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  maxWidth?: number;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  showsVerticalScrollIndicator?: boolean;
}

export function WebConstrainedScrollView({
  children,
  style,
  contentContainerStyle,
  maxWidth = 480,
  refreshControl,
  showsVerticalScrollIndicator = false,
}: WebScrollViewProps) {
  if (!isWeb) {
    return (
      <ScrollView
        style={style}
        contentContainerStyle={contentContainerStyle}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={style}
      contentContainerStyle={[
        contentContainerStyle,
        styles.webScrollContent,
      ]}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
    >
      <View style={[styles.webContentInner, { maxWidth }]}>
        {children}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  webContentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  webContentInner: {
    flex: 1,
    width: '100%',
  },
  webScrollContent: {
    alignItems: 'center',
  },
});

export default WebContentContainer;
