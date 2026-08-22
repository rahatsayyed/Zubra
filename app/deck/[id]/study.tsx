import React, { useState, useEffect } from 'react';
import { View, Pressable } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Illustration } from '@/components/illustration';
import { ChevronLeft, RefreshCw, CheckCircle2 } from 'lucide-react-native';
import {
  getDueCards,
  getCardsByDifficultyBand,
  updateCardAfterReview,
  DifficultyBand,
  Card,
} from '@/lib/data/api';
import { Rating } from 'ts-fsrs';
import { getDeckColorClass } from '@/lib/utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Full literal class names so NativeWind can find them at build time.
const RATING_OPTIONS = [
  { rating: Rating.Again, label: 'AGAIN', time: '< 1 min', bg: 'bg-rating-again' },
  { rating: Rating.Hard, label: 'HARD', time: '< 5 min', bg: 'bg-rating-hard' },
  { rating: Rating.Good, label: 'GOOD', time: '< 10 min', bg: 'bg-rating-good' },
  { rating: Rating.Easy, label: 'EASY', time: '4 d', bg: 'bg-rating-easy' },
] as const;

export default function StudyScreen() {
  const { id, mode, band, limit } = useLocalSearchParams<{
    id: string;
    mode: string;
    band?: DifficultyBand;
    limit?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bgClass = getDeckColorClass(id);

  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    hard: 0,
    good: 0,
    easy: 0,
    again: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        let queue: Card[] = [];
        if (mode === 'custom' && band && limit) {
          queue = (await getCardsByDifficultyBand(id, band, parseInt(limit, 10))) as any;
        } else {
          queue = (await getDueCards(id)) as any;
        }
        setCards(queue);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, [id, mode, band, limit]);

  const handleRate = async (rating: Rating) => {
    const currentCard = cards[currentIndex];
    try {
      await updateCardAfterReview(currentCard.id, id, rating);

      setSessionStats((prev) => ({
        ...prev,
        reviewed: prev.reviewed + 1,
        again: rating === Rating.Again ? prev.again + 1 : prev.again,
        hard: rating === Rating.Hard ? prev.hard + 1 : prev.hard,
        good: rating === Rating.Good ? prev.good + 1 : prev.good,
        easy: rating === Rating.Easy ? prev.easy + 1 : prev.easy,
      }));

      if (currentIndex + 1 < cards.length) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        setIsFinished(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? (currentIndex / cards.length) * 100 : 0;

  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      <View className={`flex-1 ${bgClass}`} style={{ paddingTop: insets.top + 24 }}>
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-[#111111]">Preparing your session…</Text>
          </View>
        ) : cards.length === 0 ? (
          <View className="flex-1 items-center justify-center gap-6 p-6">
            <CheckCircle2 size={72} color="#111111" strokeWidth={1.2} />
            <Text className="font-andada-bold text-center text-3xl text-[#111111]">
              You're all caught up!
            </Text>
            <Pressable
              className="mt-8 w-full items-center rounded-full border-[1.5px] border-[#111111] bg-brand py-4 active:opacity-80"
              onPress={() => router.back()}>
              <Text className="text-base font-medium text-[#111111]">Return to Deck</Text>
            </Pressable>
          </View>
        ) : isFinished ? (
          <View className="flex-1 bg-hero px-6 pb-8">
            <Text className="pt-4 text-center font-andada-bold text-[32px] leading-tight text-[#111111]">
              Session Complete
            </Text>
            <View className="flex-1 items-center justify-center">
              <Illustration width={280} circleColor="#FFE0FE" />
            </View>
            <View className="items-center gap-3 pb-8">
              <Text className="font-andada-bold text-[80px] leading-none text-[#111111]">
                {sessionStats.reviewed}
              </Text>
              <Text className="text-sm font-medium tracking-[3px] text-[#111111]">
                CARDS REVIEWED TODAY
              </Text>
            </View>
            <Pressable
              className="w-full items-center rounded-full border-[1.5px] border-[#111111] bg-brand py-4 active:opacity-80"
              onPress={() => router.back()}>
              <Text className="text-base font-medium text-[#111111]">Return to Deck</Text>
            </Pressable>
          </View>
        ) : (
          <View className="flex-1 px-4 pb-6">
            {/* Header */}
            <View className="gap-4">
              <View className="flex-row items-center justify-between">
                <Pressable hitSlop={12} onPress={() => router.back()}>
                  <ChevronLeft size={24} color="#111111" strokeWidth={1.5} />
                </Pressable>
                <Pressable
                  hitSlop={8}
                  className="h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-[#111111] bg-white/70"
                  onPress={() => setShowAnswer((v) => !v)}>
                  <RefreshCw size={16} color="#111111" strokeWidth={1.5} />
                </Pressable>
              </View>
              <View className="gap-3">
                <View className="flex-row items-end justify-between">
                  <Text className="font-andada-bold text-[28px] leading-tight text-[#111111]">
                    Card {currentIndex + 1}
                  </Text>
                  <Text className="text-sm text-[#717171]">
                    {currentIndex + 1}/{cards.length} cards
                  </Text>
                </View>
                <View className="h-[10px] w-full rounded-full border-[1.5px] border-[#111111] bg-white p-[1px]">
                  <View
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${Math.max(progress, 4)}%` }}
                  />
                </View>
              </View>
            </View>

            {/* Card stack — two shorter, narrower cards peeking out behind the front card */}
            <View className="flex-1 items-center justify-center">
              <View className="relative w-full max-w-[350px] self-center" style={{ height: 560 }}>
                <View
                  className="absolute rounded-xl"
                  style={{ top: 26, left: 32, right: 32, height: 560, backgroundColor: '#F3F3F3' }}
                />
                <View
                  className="absolute rounded-xl"
                  style={{ top: 13, left: 16, right: 16, height: 560, backgroundColor: '#F8F8F8' }}
                />
                <View className="absolute inset-0 overflow-hidden rounded-xl bg-white">
                  <View
                    className="flex-1 items-center justify-center gap-6 p-6"
                    style={{ paddingBottom: showAnswer ? 110 : 60 }}>
                    <Text className="font-amiri text-center text-4xl text-[#111111]">
                      {currentCard?.question}
                    </Text>
                    {showAnswer && (
                      <>
                        <View className="h-px w-12 bg-[#111111]/30" />
                        <Text className="text-center text-2xl text-[#111111]">
                          {currentCard?.answer}
                        </Text>
                      </>
                    )}
                  </View>

                  {!showAnswer && (
                    // Tapping the bottom ~20% of the card reveals the answer,
                    // not just the "Show Answer" label itself.
                    <Pressable
                      className="absolute bottom-0 left-0 right-0 items-center justify-center active:opacity-70"
                      style={{ height: '20%' }}
                      onPress={() => setShowAnswer(true)}>
                      <Text className="text-base text-[#9B9B9B]">Show Answer</Text>
                    </Pressable>
                  )}

                  {showAnswer && (
                    <View className="absolute bottom-4 left-4 right-4 flex-row gap-2">
                      {RATING_OPTIONS.map((opt) => (
                        <Pressable
                          key={opt.label}
                          className={`flex-1 items-center justify-center gap-0.5 rounded-xl py-4 active:opacity-70 ${opt.bg}`}
                          onPress={() => handleRate(opt.rating)}>
                          <Text className="text-xs font-medium tracking-widest text-[#111111]">
                            {opt.label}
                          </Text>
                          <Text className="text-[10px] text-[#111111]/70">{opt.time}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </>
  );
}
