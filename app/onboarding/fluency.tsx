import React, { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ChevronLeft } from 'lucide-react-native';
import { completeOnboarding } from '@/lib/data/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FLUENCY_LEVELS = ['Beginners', 'Intermediate', 'Advanced'];

export default function OnboardingFluencyScreen() {
  const { language } = useLocalSearchParams<{ language: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string | null>(null);

  const handleFinish = async () => {
    if (!selected) return;
    try {
      await completeOnboarding(language ?? '', selected);
      router.replace('/');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View className="flex-1 bg-deck-2">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center justify-between px-4" style={{ paddingTop: insets.top + 24 }}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#111111" strokeWidth={1.5} />
        </Pressable>
        <Text className="text-sm text-[#111111]">2/2</Text>
      </View>

      <View className="px-4 pb-6 pt-4">
        <Text className="text-[36px] font-bold leading-tight text-[#111111]">
          What's your {language} proficiency?
        </Text>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ gap: 2, paddingBottom: 120 }}>
        {FLUENCY_LEVELS.map((level) => {
          const isSelected = selected === level;
          return (
            <Pressable
              key={level}
              className="flex-row items-center justify-between rounded-xl bg-white px-6 py-6 active:opacity-80"
              onPress={() => setSelected(level)}>
              <Text className="text-base text-[#111111]">{level}</Text>
              <View
                className={`h-8 w-8 items-center justify-center rounded-full ${isSelected ? 'bg-[#111111]' : 'bg-[#EFEFEF]'}`}>
                {isSelected && <View className="h-3 w-3 rounded-full bg-brand" />}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {selected && (
        <View
          className="absolute bottom-0 left-0 right-0 px-4 pt-6"
          style={{ paddingBottom: insets.bottom + 24 }}>
          <Pressable
            className="items-center rounded-full border-[1.5px] border-[#111111] bg-brand py-4 active:opacity-80"
            onPress={handleFinish}>
            <Text className="text-base font-medium text-[#111111]">Finish</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
