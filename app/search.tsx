import * as React from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Iconify } from 'react-native-iconify';
import { DeckCard, DECK_COLOR_CLASSES } from '@/components/deck-card';
import { getDecks, createCard, Deck } from '@/lib/data/api';
import { fuzzyScore } from '@/lib/search';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// A single, shared deck search screen. Opened from Home to browse & jump to a
// deck, or from Word of the Day (with `arabic`/`translation` params) to add
// the current word to a chosen deck instead.
export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { arabic, translation } = useLocalSearchParams<{ arabic?: string; translation?: string }>();
  const isAddMode = !!arabic;

  const [decks, setDecks] = React.useState<Deck[]>([]);
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef<TextInput>(null);

  React.useEffect(() => {
    getDecks().then(setDecks).catch(console.error);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const filteredDecks = React.useMemo(() => {
    if (!query.trim()) return decks;
    return decks
      .map((deck) => ({ deck, score: fuzzyScore(query, deck.title) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ deck }) => deck);
  }, [decks, query]);

  const handleSelect = async (deck: Deck) => {
    if (isAddMode) {
      try {
        await createCard({ deck: deck.id, question: arabic ?? '', answer: translation ?? '' });
        Alert.alert('Added', `Added to ${deck.title}`);
        router.back();
      } catch (e: any) {
        Alert.alert('Error', e.message);
      }
      return;
    }
    router.push(`/deck/${deck.id}`);
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center gap-3 px-4" style={{ paddingTop: insets.top + 24 }}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Iconify icon="mynaui:chevron-left" size={24} color="#111111" />
        </Pressable>
        <View className="flex-1 flex-row items-center gap-2 rounded-full border-[1.5px] border-[#111111] px-4 py-1.5">
          <Iconify icon="proicons:search" size={16} color="#555" />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search decks…"
            placeholderTextColor="#888"
            className="flex-1 font-instrument-sans text-sm text-[#111111]"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')}>
              <Iconify icon="fluent:dismiss-20-filled" size={14} color="#888" />
            </Pressable>
          )}
        </View>
      </View>

      <Text className="px-5 pb-4 pt-6 text-[11px] font-medium tracking-widest text-neutral-400">
        {isAddMode ? 'ADD TO DECK' : `${filteredDecks.length} DECK${filteredDecks.length !== 1 ? 'S' : ''}`}
      </Text>

      {isAddMode ? (
        <ScrollView className="flex-1 px-4" contentContainerStyle={{ gap: 8 }}>
          {filteredDecks.map((deck) => (
            <Pressable
              key={deck.id}
              className="flex-row items-center justify-between rounded-xl bg-[#F5F5F5] px-5 py-4 active:opacity-70"
              onPress={() => handleSelect(deck)}>
              <Text className="text-base text-[#111111]">{deck.title}</Text>
              <Text className="text-sm text-[#888888]">{deck.cards} cards</Text>
            </Pressable>
          ))}
          {filteredDecks.length === 0 && (
            <Text className="px-1 py-4 text-sm text-neutral-400">No decks found.</Text>
          )}
        </ScrollView>
      ) : (
        <ScrollView className="flex-1 px-2" contentContainerStyle={{ gap: 4 }}>
          {filteredDecks.map((deck, i) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              colorClass={DECK_COLOR_CLASSES[i % DECK_COLOR_CLASSES.length]}
              onPress={() => handleSelect(deck)}
            />
          ))}
          {filteredDecks.length === 0 && (
            <Text className="px-3 py-4 text-sm text-neutral-400">No decks match "{query}"</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}
