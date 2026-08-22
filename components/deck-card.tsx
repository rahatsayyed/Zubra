import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Iconify } from 'react-native-iconify';
import { cn } from '@/lib/utils';
import type { Deck } from '@/lib/data/api';

// Full literal class names so NativeWind can find them at build time.
export const DECK_COLOR_CLASSES = ['bg-deck-1', 'bg-deck-2', 'bg-deck-3', 'bg-deck-4'] as const;

export function DeckCard({
  deck,
  colorClass,
  onPress,
}: {
  deck: Deck;
  colorClass: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'min-h-[130px] justify-between rounded-2xl px-5 pb-7 pt-5 active:opacity-80',
        colorClass
      )}>
      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-neutral-500">{deck.cards} cards</Text>
        <Iconify icon="material-symbols-light:arrow-outward" size={18} color="#111111" />
      </View>
      <Text className="font-andada text-[30px] tracking-tighter text-[#111111]" numberOfLines={1}>
        {deck.title}
      </Text>
    </Pressable>
  );
}
