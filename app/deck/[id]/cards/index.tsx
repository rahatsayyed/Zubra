import React, { useCallback, useRef, useState } from 'react';
import { Alert, Animated, PanResponder, Pressable, ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Text } from '@/components/ui/text';
import { ChevronLeft, Plus, Pencil, Trash2 } from 'lucide-react-native';
import { getCardsForDeck, deleteCard, Card as Flashcard } from '@/lib/data/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const REVEAL_WIDTH = 80;

function SwipeableCardRow({
  card,
  onEdit,
  onDelete,
}: {
  card: Flashcard;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const lastValue = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderMove: (_, gesture) => {
        translateX.setValue(lastValue.current + gesture.dx);
      },
      onPanResponderRelease: (_, gesture) => {
        let next = 0;
        if (gesture.dx < -30) next = -REVEAL_WIDTH; // swipe left -> reveal delete on right
        else if (gesture.dx > 30) next = REVEAL_WIDTH; // swipe right -> reveal edit on left
        lastValue.current = next;
        Animated.spring(translateX, { toValue: next, useNativeDriver: true }).start();
      },
    })
  ).current;

  const reset = () => {
    lastValue.current = 0;
    Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
  };

  return (
    <View className="relative">
      {/* Edit action, revealed on the left */}
      <Pressable
        className="absolute left-2 top-1/2 h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] border-[#111111] bg-brand"
        onPress={() => {
          reset();
          onEdit();
        }}>
        <Pencil size={20} color="#111111" strokeWidth={1.5} />
      </Pressable>
      {/* Delete action, revealed on the right */}
      <Pressable
        className="absolute right-2 top-1/2 h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] border-[#111111] bg-error-bg"
        onPress={() => {
          reset();
          onDelete();
        }}>
        <Trash2 size={20} color="#111111" strokeWidth={1.5} />
      </Pressable>

      <Animated.View
        {...panResponder.panHandlers}
        style={{ transform: [{ translateX }] }}
        className="min-h-[110px] justify-between rounded-xl bg-deck-4 p-4">
        <Text className="font-amiri text-2xl text-[#111111]" numberOfLines={2}>
          {card.question}
        </Text>
        <Text className="text-base text-[#111111]" numberOfLines={1}>
          {card.answer}
        </Text>
      </Animated.View>
    </View>
  );
}

export default function CardListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [cards, setCards] = useState<Flashcard[]>([]);

  const loadCards = useCallback(async () => {
    try {
      setCards(await getCardsForDeck(id));
    } catch (e) {
      console.error(e);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [loadCards])
  );

  const handleDelete = (card: Flashcard) => {
    Alert.alert('Delete Card', 'Are you sure you want to delete this card?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCard(card.id);
            await loadCards();
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-create-bg">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}>
        <View className="gap-4 px-4">
          <View className="flex-row items-start justify-between">
            <Pressable hitSlop={12} onPress={() => router.back()}>
              <ChevronLeft size={24} color="#111111" strokeWidth={1.5} />
            </Pressable>
            <Pressable
              className="h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-[#111111] bg-white"
              onPress={() => router.push(`/deck/${id}/cards/create`)}>
              <Plus size={16} color="#111111" strokeWidth={1.5} />
            </Pressable>
          </View>
          <View className="flex-row items-end justify-between">
            <Text className="font-andada-bold text-[32px] leading-tight text-[#111111]">Cards</Text>
            <Text className="text-base text-[#111111]">{cards.length} cards</Text>
          </View>
        </View>

        <View className="gap-2 px-4 pt-6">
          {cards.length === 0 ? (
            <Text className="text-sm text-[#7D7D7D]">No cards yet. Tap + to add one.</Text>
          ) : (
            cards.map((card) => (
              <SwipeableCardRow
                key={card.id}
                card={card}
                onEdit={() => router.push(`/deck/${id}/cards/${card.id}/edit`)}
                onDelete={() => handleDelete(card)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
