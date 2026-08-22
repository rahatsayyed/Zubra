import React, { useEffect, useState } from 'react';
import { View, TextInput, Alert, ScrollView, Pressable } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { createCard, getCardsForDeck, Card } from '@/lib/data/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CreateCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [cards, setCards] = useState<Card[]>([]);

  const loadCards = async () => {
    try {
      setCards(await getCardsForDeck(id));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadCards();
  }, [id]);

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) {
      Alert.alert('Missing fields', 'Fill in both the front and back of the card.');
      return;
    }
    try {
      await createCard({ deck: id, question, answer });
      setQuestion('');
      setAnswer('');
      await loadCards();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View className="flex-1 bg-create-bg">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 110 }}
        keyboardShouldPersistTaps="handled">
        <View className="gap-4 px-4">
          <Pressable
            hitSlop={12}
            className="h-6 w-6 items-center justify-center"
            onPress={() => router.back()}>
            <ChevronLeft size={24} color="#111111" strokeWidth={1.5} />
          </Pressable>
          <Text className="text-[32px] font-bold leading-tight text-[#111111]">New Card</Text>
        </View>

        <View className="gap-3 px-4 pt-8">
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="Front (Question)"
            placeholderTextColor="#7D7D7D"
            className="rounded-full border-[1.5px] border-[#111111] px-6 py-4 text-base text-[#111111]"
            autoFocus
          />
          <TextInput
            value={answer}
            onChangeText={setAnswer}
            placeholder="Back (Answer)"
            placeholderTextColor="#7D7D7D"
            className="rounded-full border-[1.5px] border-[#111111] px-6 py-4 text-base text-[#111111]"
          />
        </View>

        <View className="gap-4 px-4 pt-10">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium tracking-widest text-[#111111]">CARDS</Text>
            <Text className="text-base text-[#111111]">{cards.length} cards</Text>
          </View>
          {cards.length === 0 ? (
            <Text className="text-sm text-[#7D7D7D]">No cards yet. Add your first one above.</Text>
          ) : (
            <View className="gap-2">
              {cards.map((card) => (
                <View key={card.id} className="min-h-[110px] justify-between rounded-xl bg-deck-4 p-4">
                  <Text className="text-2xl text-[#111111]" numberOfLines={2}>
                    {card.question}
                  </Text>
                  <Text className="text-base text-[#111111]" numberOfLines={1}>
                    {card.answer}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Pressable
        onPress={handleSave}
        style={{ bottom: insets.bottom + 24 }}
        className="absolute left-4 right-4 items-center rounded-full border-[1.5px] border-[#111111] bg-brand py-4 active:opacity-80">
        <Text className="text-base font-medium text-[#111111]">Add Card</Text>
      </Pressable>
    </View>
  );
}
