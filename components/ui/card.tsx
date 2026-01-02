import { View } from 'react-native';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <View className={`rounded-lg border border-gray-200 bg-white text-card-foreground shadow-sm ${className}`}>
      {children}
    </View>
  );
}