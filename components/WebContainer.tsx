import React from "react";
import { View, Platform, StyleSheet, ViewStyle, ScrollView, RefreshControl, RefreshControlProps } from "react-native";

interface WebContentContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  maxWidth?: number;
}

const isWeb = Platform.OS === 'web';

export function WebContentContainer({ 
  children, 
  style,
  maxWidth = 480 
}: WebContentContainerProps) {
  if (!isWeb) {
    return (
      <View style={[{ flex: 1 }, style]}>
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.webContentContainer, style]}>
      <View style={[styles.webContentInner, { maxWidth }]}>
        {children}
      </View>
    </View>
  );
}

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
