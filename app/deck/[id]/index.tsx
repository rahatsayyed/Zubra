import React, { useState } from 'react';
import { View, ScrollView, Modal, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { Settings, Play, List, Plus, X } from 'lucide-react-native';
import { getDeck, getDeckMastery, Deck, DifficultyBand } from '@/lib/data/api';

export default function DeckDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [mastery, setMastery] = useState(0);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Custom Study State
  const [customLimit, setCustomLimit] = useState<number>(20);
  const [customLimitText, setCustomLimitText] = useState<string>('');
  const [customBand, setCustomBand] = useState<DifficultyBand>('Any');

  useFocusEffect(
    React.useCallback(() => {
      const load = async () => {
        try {
          const d = await getDeck(id);
          const m = await getDeckMastery(id);
          setDeck(d);
          setMastery(m);
        } catch (e) {
          console.error(e);
        }
      };
      load();
    }, [id])
  );

  const startScheduledSession = () => {
    router.push(`/deck/${id}/study?mode=scheduled`);
  };

  const startCustomSession = () => {
    setShowCustomModal(false);
    router.push(`/deck/${id}/study?mode=custom&band=${customBand}&limit=${customLimit}`);
  };

  if (!deck) return null;

  return (
    <>
      <Stack.Screen
        options={{
          title: deck.title,
          headerRight: () => (
            <Button variant="ghost" size="icon" onPress={() => router.push(`/deck/${id}/edit`)}>
              <Icon as={Settings} className="size-5 text-foreground" />
            </Button>
          ),
        }}
      />
      <ScrollView className="flex-1 bg-background p-4" contentContainerClassName="gap-6">
        <View className="items-center py-6">
          <Text className="text-center text-3xl font-bold text-foreground">{deck.title}</Text>
          {deck.description ? (
            <Text className="mt-2 text-center text-base text-muted-foreground">
              {deck.description}
            </Text>
          ) : null}
        </View>

        <Card>
          <CardContent className="gap-4 p-4">
            <View className="flex-row items-end justify-between">
              <View>
                <Text className="text-sm font-semibold text-foreground">Mastery</Text>
                <Text className="text-xs text-muted-foreground">{mastery}% mastered</Text>
              </View>
              <Text className="text-xs text-muted-foreground">{deck.cards} total cards</Text>
            </View>
            <Progress value={mastery} className="h-2" />
          </CardContent>
        </Card>

        <View className="gap-3">
          <Button className="w-full flex-row gap-2 bg-primary" onPress={startScheduledSession}>
            <Icon as={Play} className="size-5 text-primary-foreground" />
            <Text className="font-semibold text-primary-foreground">Review Due Cards</Text>
          </Button>
          <Button
            variant="outline"
            className="flex-1 flex-row gap-2"
            onPress={() => setShowCustomModal(true)}>
            <Text>Custom Study</Text>
          </Button>

          <View className="mt-4 flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1 flex-row gap-2"
              onPress={() => router.push(`/deck/${id}/cards`)}>
              <Icon as={List} className="size-5 text-foreground" />
              <Text>Manage Cards</Text>
            </Button>

            <Button
              variant="outline"
              className="flex-1 flex-row gap-2"
              onPress={() => router.push(`/deck/${id}/cards/create`)}>
              <Icon as={Plus} className="size-5 text-foreground" />
              <Text>Add Card</Text>
            </Button>
          </View>
        </View>
      </ScrollView>

      {/* Custom Study Modal */}
      <Modal
        visible={showCustomModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomModal(false)}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="min-h-[50%] rounded-t-3xl bg-background p-6">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-2xl font-bold text-foreground">Custom Study</Text>
              <Button variant="ghost" size="icon" onPress={() => setShowCustomModal(false)}>
                <Icon as={X} className="size-6 text-foreground" />
              </Button>
            </View>

            <Text className="mb-3 text-sm font-semibold text-muted-foreground">
              SELECT CARD DIFFICULTY
            </Text>
            <View className="mb-6 flex-row flex-wrap gap-2">
              {['Any', 'Again', 'Hard', 'Good', 'Easy'].map((band) => (
                <TouchableOpacity
                  key={band}
                  onPress={() => setCustomBand(band as DifficultyBand)}
                  className={`rounded-full border px-4 py-2 ${customBand === band ? 'border-primary bg-primary' : 'border-border'}`}>
                  <Text
                    className={
                      customBand === band ? 'font-bold text-primary-foreground' : 'text-foreground'
                    }>
                    {band}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="mb-3 text-sm font-semibold text-muted-foreground">MAXIMUM CARDS</Text>
            <View className="mb-8 flex-row flex-wrap items-center gap-2">
              {[10, 20, 50, 100].map((limit) => (
                <TouchableOpacity
                  key={limit}
                  onPress={() => {
                    setCustomLimit(limit);
                    setCustomLimitText('');
                  }}
                  className={`rounded-full border px-4 py-2 ${customLimit === limit && customLimitText === '' ? 'border-primary bg-primary' : 'border-border'}`}>
                  <Text
                    className={
                      customLimit === limit && customLimitText === ''
                        ? 'font-bold text-primary-foreground'
                        : 'text-foreground'
                    }>
                    {limit}
                  </Text>
                </TouchableOpacity>
              ))}
              <TextInput
                className={`min-w-[80px] rounded-full border px-4 py-2 text-center ${customLimitText !== '' ? 'border-primary bg-primary font-bold text-primary-foreground' : 'border-border text-foreground'}`}
                placeholder="Custom"
                placeholderTextColor="#888"
                keyboardType="number-pad"
                value={customLimitText}
                onChangeText={(text) => {
                  setCustomLimitText(text);
                  const parsed = parseInt(text, 10);
                  if (!isNaN(parsed)) {
                    setCustomLimit(parsed);
                  }
                }}
              />
            </View>

            <Button className="mt-auto w-full shadow-sm" onPress={startCustomSession}>
              <Text className="font-semibold text-primary-foreground">Start Session</Text>
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
}
