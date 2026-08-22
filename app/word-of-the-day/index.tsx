import React, { useRef, useState } from 'react';
import { View, Pressable, Share, PanResponder, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Iconify } from 'react-native-iconify';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Sample vocabulary — a placeholder until "word of the day" has a real content source.
const WORDS = [
  { arabic: 'قط', transliteration: 'Qiṭṭ', translation: 'Cat' },
  { arabic: 'كتاب', transliteration: 'Kitāb', translation: 'Book' },
  { arabic: 'شمس', transliteration: 'Shams', translation: 'Sun' },
  { arabic: 'بيت', transliteration: 'Bayt', translation: 'House' },
  { arabic: 'ماء', transliteration: 'Māʾ', translation: 'Water' },
];

const SWIPE_THRESHOLD = 50;
const TAP_SLOP = 10;

export default function WordOfTheDayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const [savedIndexes, setSavedIndexes] = useState<Set<number>>(new Set());

  const word = WORDS[index];
  const isSaved = savedIndexes.has(index);

  const goNext = () => setIndex((i) => Math.min(i + 1, WORDS.length - 1));
  const goPrev = () => setIndex((i) => Math.max(i - 1, 0));

  const toggleSaved = () => {
    setSavedIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleShare = () => {
    Share.share({ message: `${word.arabic} (${word.transliteration}) — ${word.translation}` });
  };

  const handleAdd = () => {
    router.push({
      pathname: '/search',
      params: { arabic: word.arabic, translation: word.translation },
    });
  };

  // A single big region (from below the header to the bottom of the screen) that
  // reacts to both a swipe (left = next, right = previous) and a plain tap
  // (tapping the left half goes back, the right half advances).
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > TAP_SLOP && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderRelease: (evt, gesture) => {
        if (gesture.dx <= -SWIPE_THRESHOLD) {
          goNext();
        } else if (gesture.dx >= SWIPE_THRESHOLD) {
          goPrev();
        } else if (Math.abs(gesture.dx) < TAP_SLOP && Math.abs(gesture.dy) < TAP_SLOP) {
          const screenWidth = Dimensions.get('window').width;
          if (evt.nativeEvent.pageX < screenWidth / 2) goPrev();
          else goNext();
        }
      },
    })
  ).current;

  return (
    <View className="flex-1 bg-hero">
      <Stack.Screen options={{ headerShown: false }} />

      <View
        className="flex-row items-center justify-between px-4"
        style={{ paddingTop: insets.top + 24 }}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Iconify icon="mynaui:chevron-left" size={24} color="#111111" />
        </Pressable>
        <Text className="text-base text-[#111111]">
          {index + 1}/{WORDS.length}
        </Text>
      </View>

      <View className="flex-1">
        {/* Big swipe/tap region — covers everything below, icons sit on top of it */}
        <View className="absolute inset-0" {...panResponder.panHandlers} />

        <View className="flex-1 items-center mt-[70%] gap-0" pointerEvents="none">
          <Text className="font-amiri text-[66px] leading-tight text-[#111111]">
            {word.arabic}
          </Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-2xl text-[#111111]">{word.transliteration}</Text>
            <View className="h-1 w-1 rounded-full bg-[#111111]" />
            <Text className="text-2xl text-[#111111]">{word.translation}</Text>
          </View>
        </View>

        <View
          className="absolute bottom-20 left-0 right-0 flex-row items-center justify-center gap-6"
          style={{ paddingBottom: insets.bottom + 24 }}>
          <Pressable hitSlop={12} onPress={handleShare}>
            <Iconify icon="famicons:share-outline" size={24} color="#111111" />
          </Pressable>
          <Pressable hitSlop={12} onPress={toggleSaved}>
            <Iconify
              icon={isSaved ? 'mage:bookmark-fill' : 'mage:bookmark'}
              size={24}
              color="#111111"
            />
          </Pressable>
          <Pressable hitSlop={12} onPress={handleAdd}>
            <Iconify icon="solar:add-square-linear" size={24} color="#111111" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
