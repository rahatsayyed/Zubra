import React, { useState, useEffect } from 'react';
import { View, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card as CardContainer, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { X, Trophy, CheckCircle2 } from 'lucide-react-native';
import { getDueCards, getCardsByDifficultyBand, updateCardAfterReview, DifficultyBand, Card } from '@/lib/data/api';
import { Rating } from 'ts-fsrs';

export default function StudyScreen() {
  const { id, mode, band, limit } = useLocalSearchParams<{ id: string, mode: string, band?: DifficultyBand, limit?: string }>();
  const router = useRouter();
  
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, hard: 0, good: 0, easy: 0, again: 0 });
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        let queue: Card[] = [];
        if (mode === 'custom' && band && limit) {
          queue = await getCardsByDifficultyBand(id, band, parseInt(limit, 10)) as any;
        } else {
          queue = await getDueCards(id) as any;
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
      
      // Update session metrics
      setSessionStats(prev => ({
        ...prev,
        reviewed: prev.reviewed + 1,
        again: rating === Rating.Again ? prev.again + 1 : prev.again,
        hard: rating === Rating.Hard ? prev.hard + 1 : prev.hard,
        good: rating === Rating.Good ? prev.good + 1 : prev.good,
        easy: rating === Rating.Easy ? prev.easy + 1 : prev.easy,
      }));

      // Move to next card or finish
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
  
  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false, 
          presentation: 'fullScreenModal' 
        }} 
      />
      
      <View className="flex-1 bg-background pt-14">
        {/* Session Header */}
        <View className="px-6 flex-row justify-between items-center pb-4 border-b border-border">
          <View>
            <Text className="text-sm text-muted-foreground font-semibold">
              {mode === 'custom' ? 'CUSTOM SESSION' : 'DUE TODAY'}
            </Text>
            {!isFinished && !loading && (
              <Text className="text-xl font-bold text-foreground">
                {cards.length - currentIndex} <Text className="text-lg text-muted-foreground font-medium">cards left</Text>
              </Text>
            )}
          </View>
          <Button variant="ghost" size="icon" onPress={() => setIsFinished(true)} className="rounded-full bg-secondary/50">
             <Icon as={X} className="size-6 text-foreground" />
          </Button>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
             <Text className="text-muted-foreground">Preparing your session...</Text>
          </View>
        ) : isFinished || cards.length === 0 ? (
          <View className="flex-1 p-6 items-center justify-center gap-6">
             <Icon as={cards.length === 0 ? CheckCircle2 : Trophy} className="size-24 text-primary" />
             <Text className="text-3xl font-bold text-foreground text-center">
               {cards.length === 0 ? "You're all caught up!" : "Session Complete"}
             </Text>
             
             <CardContainer className="w-full bg-secondary/30 mt-4">
                <CardContent className="p-6 gap-4 items-center">
                  <Text className="text-4xl font-black text-foreground">{sessionStats.reviewed}</Text>
                  <Text className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Cards Reviewed Today</Text>
                </CardContent>
             </CardContainer>
             
             <Button className="w-full py-6 mt-8 shadow-sm" onPress={() => router.back()}>
                <Text className="text-lg font-bold">Return to Deck</Text>
             </Button>
          </View>
        ) : (
          <View className="flex-1 p-6 pb-12 gap-6 justify-between">
            {/* Flashcard Area */}
            <ScrollView className="flex-1" contentContainerClassName="flex-grow justify-center py-8">
              <Text className="text-3xl font-bold text-center text-foreground leading-tight px-4">
                {currentCard?.question}
              </Text>

              {showAnswer && (
                 <View className="mt-8 pt-8 border-t border-border/50 items-center animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <Text className="text-2xl text-center text-foreground/90 font-medium px-4">
                      {currentCard?.answer}
                    </Text>
                 </View>
              )}
            </ScrollView>

            {/* Interaction Area */}
            <View>
              {!showAnswer ? (
                <Button 
                   className="w-full py-6 shadow-sm active:scale-[98%] transition-transform" 
                   onPress={() => setShowAnswer(true)}
                >
                   <Text className="text-lg font-bold">Show Answer</Text>
                </Button>
              ) : (
                <View className="flex-row gap-2 h-20">
                   <Button 
                      variant="outline" 
                      className="flex-1 border-destructive/30 bg-destructive/10 active:bg-destructive/20" 
                      onPress={() => handleRate(Rating.Again)}
                   >
                     <View className="items-center">
                        <Text className="text-destructive font-bold mb-1">Again</Text>
                        <Text className="text-[10px] text-destructive/70 font-medium tracking-wider">&lt; 1m</Text>
                     </View>
                   </Button>
                   <Button 
                      variant="outline" 
                      className="flex-1 active:bg-secondary" 
                      onPress={() => handleRate(Rating.Hard)}
                   >
                     <View className="items-center">
                        <Text className="font-bold mb-1">Hard</Text>
                        <Text className="text-[10px] text-muted-foreground font-medium tracking-wider">&lt; 5m</Text>
                     </View>
                   </Button>
                   <Button 
                      className="flex-1 bg-green-500 hover:bg-green-600 active:bg-green-700" 
                      onPress={() => handleRate(Rating.Good)}
                   >
                     <View className="items-center">
                        <Text className="text-white font-bold mb-1">Good</Text>
                        <Text className="text-[10px] text-green-100 font-medium tracking-wider">&lt; 10m</Text>
                     </View>
                   </Button>
                   <Button 
                      className="flex-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-700" 
                      onPress={() => handleRate(Rating.Easy)}
                   >
                     <View className="items-center">
                        <Text className="text-white font-bold mb-1">Easy</Text>
                        <Text className="text-[10px] text-blue-100 font-medium tracking-wider">4d</Text>
                     </View>
                   </Button>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    </>
  );
}
