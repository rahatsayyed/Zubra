import * as React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { Text } from '@/components/ui/text';

export default function SettingsScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <Text className="font-andada text-2xl text-[#111111]">Coming soon</Text>
    </View>
  );
}
