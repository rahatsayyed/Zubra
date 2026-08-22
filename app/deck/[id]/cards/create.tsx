import React, { useState } from 'react';
import { View, TextInput, Alert, Pressable, Animated } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Iconify } from 'react-native-iconify';
import { createCard } from '@/lib/data/api';
import { useKeyboardOffset } from '@/lib/use-keyboard-offset';

export default function CreateCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const keyboardOffset = useKeyboardOffset();

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) {
      Alert.alert('Missing fields', 'Fill in both the front and back of the card.');
      return;
    }
    try {
      await createCard({ deck: id, question, answer });
      setQuestion('');
      setAnswer('');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View className="flex-1 justify-end bg-black/60">
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'transparentModal',
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'fade',
        }}
      />
      <View className="flex-1 justify-end">
        <Pressable className="flex-1" onPress={() => router.back()} />
        <Animated.View
          style={{ marginBottom: keyboardOffset }}
          className="gap-8 rounded-t-3xl bg-white px-4 pb-10 pt-6">
          <View className="flex-row items-center justify-center">
            <Pressable
              hitSlop={12}
              className="absolute left-0 h-6 w-6 items-center justify-center"
              onPress={() => router.back()}>
              <Iconify icon="fluent:dismiss-20-filled" size={20} color="#111111" />
            </Pressable>
            <Text className="text-lg text-[#111111]">Add Card</Text>
          </View>

          <View className="gap-3">
            <TextInput
              value={question}
              onChangeText={setQuestion}
              placeholder="Front (Question)"
              placeholderTextColor="#7D7D7D"
              className="rounded-full border-[1.5px] border-[#111111] px-6 py-4 font-instrument-sans text-base text-[#111111]"
              autoFocus
            />
            <TextInput
              value={answer}
              onChangeText={setAnswer}
              placeholder="Back (Answer)"
              placeholderTextColor="#7D7D7D"
              className="rounded-full border-[1.5px] border-[#111111] px-6 py-4 font-instrument-sans text-base text-[#111111]"
            />
          </View>

          <Pressable
            className="items-center rounded-full border-[1.5px] border-[#111111] bg-brand py-4 active:opacity-80"
            onPress={handleSave}>
            <Text className="text-base font-medium text-[#111111]">Add Card</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}
