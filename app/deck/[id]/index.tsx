import React, { useState } from 'react';
import { View, Modal, Pressable, TextInput } from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Text } from '@/components/ui/text';
import { OptionSheet } from '@/components/option-sheet';
import { ChevronLeft, MoreHorizontal, ListChecks, Pencil, Plus, X } from 'lucide-react-native';
import { getDeck, getDeckMastery, Deck, DifficultyBand } from '@/lib/data/api';
import { getDeckColorClass } from '@/lib/utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DIFFICULTY_OPTIONS: DifficultyBand[] = ['Any', 'Very Hard', 'Hard', 'Medium', 'Easy'];
const LIMIT_OPTIONS = [10, 20, 50, 100];

export default function DeckDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bgClass = getDeckColorClass(id);

  const [deck, setDeck] = useState<Deck | null>(null);
  const [mastery, setMastery] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

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
    <View className={`flex-1 ${bgClass}`} style={{ paddingTop: insets.top + 24 }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="gap-4 px-4">
        <View className="flex-row items-start justify-between">
          <Pressable hitSlop={12} onPress={() => router.back()}>
            <ChevronLeft size={24} color="#111111" strokeWidth={1.5} />
          </Pressable>
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-[#111111] bg-white/70"
            onPress={() => setShowMenu(true)}>
            <MoreHorizontal size={16} color="#111111" strokeWidth={1.5} />
          </Pressable>
        </View>
        <Text className="font-andada-bold text-[32px] leading-tight text-[#111111]">{deck.title}</Text>
      </View>

      <View className="gap-8 rounded-xl bg-black/5 p-4 mx-4 mt-8">
        <View className="gap-3">
          <Text className="text-2xl text-[#111111]">Mastery</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-base text-[#767676]">{mastery}% mastered</Text>
            <Text className="text-base text-[#767676]">{deck.cards} total cards</Text>
          </View>
        </View>
        <View className="h-[10px] w-full rounded-full border-[1.5px] border-[#111111] bg-white p-[1px]">
          <View className="h-full rounded-full bg-brand" style={{ width: `${Math.min(Math.max(mastery, 0), 100)}%` }} />
        </View>
      </View>

      <View className="flex-1" />

      <View className="gap-3 px-4" style={{ paddingBottom: insets.bottom + 24 }}>
        <Pressable
          className="items-center rounded-full border-[1.5px] border-[#111111] bg-brand py-4 active:opacity-80"
          onPress={startScheduledSession}>
          <Text className="text-base font-medium text-[#111111]">Review Due Cards</Text>
        </Pressable>
        <Pressable
          className="items-center rounded-full border-[1.5px] border-[#111111] py-4 active:opacity-80"
          onPress={() => setShowCustomModal(true)}>
          <Text className="text-base font-medium text-[#111111]">Custom Study</Text>
        </Pressable>
      </View>

      <OptionSheet
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        options={[
          {
            label: 'Edit Deck',
            icon: Pencil,
            onPress: () => router.push(`/deck/${id}/edit`),
          },
          {
            label: 'Add Cards',
            icon: Plus,
            onPress: () => router.push(`/deck/${id}/cards/create`),
          },
          {
            label: 'Manage Cards',
            icon: ListChecks,
            onPress: () => router.push(`/deck/${id}/cards`),
          },
        ]}
      />

      {/* Custom Study bottom sheet */}
      <Modal
        visible={showCustomModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomModal(false)}>
        <View className="flex-1 justify-end bg-black/60">
          <View className="gap-8 rounded-t-3xl bg-white px-4 pb-10 pt-6">
            <View className="flex-row items-center justify-center">
              <Pressable
                hitSlop={12}
                className="absolute left-0 h-6 w-6 items-center justify-center"
                onPress={() => setShowCustomModal(false)}>
                <X size={20} color="#111111" strokeWidth={1.5} />
              </Pressable>
              <Text className="text-lg text-[#111111]">Custom Study</Text>
            </View>

            <View className="gap-4">
              <Text className="text-sm font-medium tracking-widest text-[#111111]">
                SELECT CARD DIFFICULTY
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {DIFFICULTY_OPTIONS.map((band) => (
                  <Pressable
                    key={band}
                    onPress={() => setCustomBand(band)}
                    className={`rounded-full border-[1.5px] border-[#111111] px-5 py-3 ${customBand === band ? 'bg-brand' : ''}`}>
                    <Text className="text-base text-[#111111]">{band}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="gap-4">
              <Text className="text-sm font-medium tracking-widest text-[#111111]">
                MAXIMUM CARDS
              </Text>
              <View className="flex-row flex-wrap items-center gap-2">
                {LIMIT_OPTIONS.map((limit) => (
                  <Pressable
                    key={limit}
                    onPress={() => {
                      setCustomLimit(limit);
                      setCustomLimitText('');
                    }}
                    className={`rounded-full border-[1.5px] border-[#111111] px-5 py-3 ${customLimit === limit && customLimitText === '' ? 'bg-brand' : ''}`}>
                    <Text className="text-base text-[#111111]">{limit}</Text>
                  </Pressable>
                ))}
                <TextInput
                  className={`min-w-[90px] rounded-full border-[1.5px] border-[#111111] px-5 py-3 text-center font-instrument-sans text-base text-[#111111] ${customLimitText !== '' ? 'bg-brand' : ''}`}
                  placeholder="Custom"
                  placeholderTextColor="#7D7D7D"
                  keyboardType="number-pad"
                  value={customLimitText}
                  onChangeText={(text) => {
                    setCustomLimitText(text);
                    const parsed = parseInt(text, 10);
                    if (!isNaN(parsed)) setCustomLimit(parsed);
                  }}
                />
              </View>
            </View>

            <Pressable
              className="items-center rounded-full border-[1.5px] border-[#111111] bg-brand py-4 active:opacity-80"
              onPress={startCustomSession}>
              <Text className="text-base font-medium text-[#111111]">Start Session</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
