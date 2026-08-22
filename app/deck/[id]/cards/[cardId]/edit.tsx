import React, { useState, useEffect } from 'react';
import { View, TextInput, Alert, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { X } from 'lucide-react-native';
import { getCard, updateCard } from '@/lib/data/api';

export default function EditCardScreen() {
  const { cardId } = useLocalSearchParams<{ id: string; cardId: string }>();
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const card = await getCard(cardId);
        setQuestion(card.question);
        setAnswer(card.answer);
      } catch (e: any) {
        Alert.alert('Error', 'Failed to load card');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cardId]);

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) {
      Alert.alert('Missing fields', 'Fill in both the front and back of the card.');
      return;
    }
    try {
      await updateCard(cardId, { question, answer });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  if (loading) return null;

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
      <Pressable className="flex-1" onPress={() => router.back()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="gap-8 rounded-t-3xl bg-white px-4 pb-10 pt-6">
          <View className="flex-row items-center justify-center">
            <Pressable
              hitSlop={12}
              className="absolute left-0 h-6 w-6 items-center justify-center"
              onPress={() => router.back()}>
              <X size={20} color="#111111" strokeWidth={1.5} />
            </Pressable>
            <Text className="text-lg text-[#111111]">Edit Card</Text>
          </View>

          <View className="gap-3">
            <TextInput
              value={question}
              onChangeText={setQuestion}
              placeholder="Front (Question)"
              placeholderTextColor="#7D7D7D"
              className="rounded-full border-[1.5px] border-[#111111] px-6 py-4 text-base text-[#111111]"
            />
            <TextInput
              value={answer}
              onChangeText={setAnswer}
              placeholder="Back (Answer)"
              placeholderTextColor="#7D7D7D"
              className="rounded-full border-[1.5px] border-[#111111] px-6 py-4 text-base text-[#111111]"
            />
          </View>

          <Pressable
            className="items-center rounded-full border-[1.5px] border-[#111111] bg-brand py-4 active:opacity-80"
            onPress={handleSave}>
            <Text className="text-base font-medium text-[#111111]">Save Changes</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
