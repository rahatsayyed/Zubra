import { Text } from '@/components/ui/text';
import { HomeIllustration } from '@/components/home-illustration';
import { Flowers } from '@/components/flowers';
import { DeckCard, DECK_COLOR_CLASSES } from '@/components/deck-card';
import { getDecks, Deck, isOnboardingComplete } from '@/lib/data/api';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { Iconify } from 'react-native-iconify';
import { useNavbarScroll } from '@/lib/navbar-context';
import * as React from 'react';
import { Dimensions, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { handleScroll } = useNavbarScroll();

  const [decks, setDecks] = React.useState<Deck[]>([]);
  const [onboardingChecked, setOnboardingChecked] = React.useState(false);

  // Send first-time users through onboarding, once, before showing Home.
  React.useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const done = await isOnboardingComplete();
        if (!done) {
          router.replace('/onboarding');
          return;
        }
      } catch (e) {
        console.error(e);
      }
      setOnboardingChecked(true);
    };
    checkOnboarding();
  }, []);

  // ── Data ─────────────────────────────────────────────────────────────────────
  const loadData = React.useCallback(async () => {
    try {
      setDecks(await getDecks());
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Reload every time the screen gains focus, so a deck created (or edited)
  // on another screen shows up here without needing a manual refresh.
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [loadData])
  );

  const featuredDeck = decks[0] ?? null;

  // Nav bar bottom offset accounts for safe area
  const navBottom = insets.bottom + 12;

  if (!onboardingChecked) return null;

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Scroll content ──────────────────────────────────── */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: navBottom + 80 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        {/* Hero */}
        <View className="relative gap-6 overflow-hidden bg-hero px-6 pb-8 pt-14">
          <View className="absolute left-0 right-0 top-0" pointerEvents="none">
            <Flowers width={Dimensions.get('window').width} />
          </View>
          <View className="h-96 flex-col justify-between">
            <View className="flex-row items-center justify-between">
              <Pressable className="flex-row items-center gap-1.5 rounded-full border-[1.5px] border-[#111111] px-4 py-2">
                <Text className="text-sm font-medium text-[#111111]">Arabic</Text>
                <Iconify icon="mynaui:chevron-down" size={14} color="#111111" />
              </Pressable>
              <Pressable
                className="h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-[#111111]"
                onPress={() => router.push('/search')}>
                <Iconify icon="proicons:search" size={18} color="#111111" />
              </Pressable>
            </View>
            <View className="flex-col gap-10">
              <Text className="font-andada text-5xl -tracking-wide text-[#111111]">
                {'Words of\nthe day'}
              </Text>
              <View className="w-full">
                <Pressable
                  onPress={() => router.push('/word-of-the-day')}
                  className="flex-row items-end justify-between">
                  <Text className="text-sm leading-5 text-[#333333]">{'5 words\nper day'}</Text>
                  <Iconify icon="material-symbols-light:arrow-outward" size={20} color="#111111" />
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* Starter deck + your decks */}
        <View className="px-2 pt-2">
          <View className="gap-4 rounded-2xl bg-starter-card p-5">
            <View className="flex-row items-baseline justify-between">
              <Text className="font-andada text-xl text-[#111111] w-5/6">
                {featuredDeck ? featuredDeck.title : 'Starter Deck'}
              </Text>
              <Text className="text-sm text-neutral-500">
                {featuredDeck ? `${featuredDeck.cards} cards` : '—'}
              </Text>
            </View>
            <View>
              <HomeIllustration width={Dimensions.get('window').width - 48} />
            </View>
            <Pressable
              className="items-center rounded-full bg-brand py-4 active:opacity-80"
              onPress={() => (featuredDeck ? router.push(`/deck/${featuredDeck.id}`) : undefined)}>
              <Text className="text-base text-[#111111]">Start Practising</Text>
            </Pressable>
          </View>
        </View>

        <View className="gap-3 pt-6">
          <Text className="px-5 text-[11px] font-medium tracking-widest text-neutral-400">
            YOUR DECKS
          </Text>
          {decks.length === 0 && (
            <Text className="px-5 py-2 text-sm text-neutral-400">
              No decks yet — tap + to get started.
            </Text>
          )}
          <View className="gap-[4px] px-2">
            {decks.map((deck, i) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                colorClass={DECK_COLOR_CLASSES[i % DECK_COLOR_CLASSES.length]}
                onPress={() => router.push(`/deck/${deck.id}`)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
