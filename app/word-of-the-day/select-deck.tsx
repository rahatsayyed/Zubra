import React, { useEffect, useState } from 'react';
import { View, Pressable, TextInput, Alert, ScrollView } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Iconify } from 'react-native-iconify';
import { getDecks, createCard, Deck } from '@/lib/data/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SelectDeckScreen() {
  const { arabic, translation } = useLocalSearchParams<{ arabic: string; translation: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    getDecks().then(setDecks).catch(console.error);
  }, []);

  const filtered = decks.filter((deck) => deck.title.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = async (deck: Deck) => {
    try {
      await createCard({ deck: deck.id, question: arabic ?? '', answer: translation ?? '' });
      Alert.alert('Added', `Added to ${deck.title}`);
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      <View
        className="flex-row items-center gap-3 px-4"
        style={{ paddingTop: insets.top + 24 }}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Iconify icon="mynaui:chevron-left" size={24} color="#111111" />
        </Pressable>
        <View className="flex-1 flex-row items-center gap-2 rounded-full border-[1.5px] border-[#111111] px-4 py-2.5">
          <Iconify icon="proicons:search" size={16} color="#555" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search decks…"
            placeholderTextColor="#888"
            className="flex-1 font-instrument-sans text-sm text-[#111111]"
            autoFocus
          />
        </View>
      </View>

      <Text className="px-4 pb-4 pt-6 text-lg text-[#111111]">Add to deck</Text>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ gap: 8 }}>
        {filtered.map((deck) => (
          <Pressable
            key={deck.id}
            className="flex-row items-center justify-between rounded-xl bg-[#F5F5F5] px-5 py-4 active:opacity-70"
            onPress={() => handleSelect(deck)}>
            <Text className="text-base text-[#111111]">{deck.title}</Text>
            <Text className="text-sm text-[#888888]">{deck.cards} cards</Text>
          </Pressable>
        ))}
        {filtered.length === 0 && (
          <Text className="px-1 py-4 text-sm text-[#888888]">No decks found.</Text>
        )}
      </ScrollView>
    </View>
  );
}
