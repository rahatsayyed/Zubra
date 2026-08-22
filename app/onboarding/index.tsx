import React from 'react';
import { View, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Illustration } from '@/components/illustration';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OnboardingIntroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-deck-4">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-1 px-4" style={{ paddingTop: insets.top + 40 }}>
        <Text className="font-andada text-[44px] leading-none text-[#111111]">
          Build your language, one card at a time.
        </Text>
      </View>

      <View className="items-center justify-end" style={{ marginBottom: -40 }}>
        <Illustration width={420} />
      </View>

      <View className="px-4" style={{ paddingBottom: insets.bottom + 24, paddingTop: 24 }}>
        <Pressable
          className="items-center rounded-full border-[1.5px] border-[#111111] bg-brand py-4 active:opacity-80"
          onPress={() => router.push('/onboarding/language')}>
          <Text className="text-base font-medium text-[#111111]">Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}
