import React, { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Iconify } from 'react-native-iconify';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LANGUAGES = ['Arabic', 'Korean', 'Japanese', 'Hindi', 'Urdu', 'Türkçe', 'Other'];

export default function OnboardingLanguageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View className="flex-1 bg-deck-1">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center justify-between px-4" style={{ paddingTop: insets.top + 24 }}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Iconify icon="mynaui:chevron-left" size={24} color="#111111" />
        </Pressable>
        <Text className="text-sm text-[#111111]">1/2</Text>
      </View>

      <View className="px-4 pb-6 pt-4">
        <Text className="font-andada text-[36px] leading-tight text-[#111111]">
          Let's start with choosing your language?
        </Text>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ gap: 2, paddingBottom: 120 }}>
        {LANGUAGES.map((language) => {
          const isSelected = selected === language;
          return (
            <Pressable
              key={language}
              className="flex-row items-center justify-between rounded-xl bg-white px-6 py-6 active:opacity-80"
              onPress={() => setSelected(language)}>
              <Text className="text-base text-[#111111]">{language}</Text>
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
            onPress={() => router.push(`/onboarding/fluency?language=${encodeURIComponent(selected)}`)}>
            <Text className="text-base font-medium text-[#111111]">Next</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
