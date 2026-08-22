import { Text } from '@/components/ui/text';
import { Illustration } from '@/components/illustration';
import { getDecks, Deck } from '@/lib/data/api';
import { importAnkiDeck } from '@/lib/data/ankiImport';
import { cn } from '@/lib/utils';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import {
  ArrowUpRightIcon,
  ChevronDownIcon,
  DownloadIcon,
  HomeIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  SparklesIcon,
  XIcon,
  LayersPlusIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { Alert, Animated, Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Deck card colour classes (full strings so NativeWind can detect them) ────
const DECK_COLOR_CLASSES = ['bg-deck-1', 'bg-deck-2', 'bg-deck-3', 'bg-deck-4'] as const;

// ─── Fuzzy search ─────────────────────────────────────────────────────────────
// Returns a score > 0 if all query chars appear in order in target, else 0.
// Higher score = tighter match (fewer gaps between matched chars).
function fuzzyScore(query: string, target: string): number {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase();
  if (!q) return 1;
  let qi = 0;
  let score = 0;
  let consecutive = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      qi++;
      consecutive++;
      score += consecutive; // reward consecutive matches
    } else {
      consecutive = 0;
    }
  }
  return qi === q.length ? score : 0;
}

// ─── Deck card ────────────────────────────────────────────────────────────────
function DeckCard({
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
        <ArrowUpRightIcon size={18} color="#111111" />
      </View>
      <Text className="text-[30px] font-bold -tracking-wide text-[#111111]" numberOfLines={1}>
        {deck.title}
      </Text>
    </Pressable>
  );
}

// ─── Home screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [decks, setDecks] = React.useState<Deck[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isImporting, setIsImporting] = React.useState(false);
  const [showCreateSheet, setShowCreateSheet] = React.useState(false);
  const searchInputRef = React.useRef<TextInput>(null);

  // ── Nav bar hide/show on scroll ──────────────────────────────────────────────
  const navTranslateY = React.useRef(new Animated.Value(0)).current;
  const lastScrollY = React.useRef(0);

  // ── Create sheet animations ───────────────────────────────────────────────────
  const sheetY = React.useRef(new Animated.Value(600)).current;
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;

  // Animate in whenever showCreateSheet flips to true
  React.useEffect(() => {
    if (showCreateSheet) {
      sheetY.setValue(600);
      overlayOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(sheetY, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      ]).start();
    }
  }, [showCreateSheet]);

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(sheetY, { toValue: 600, duration: 220, useNativeDriver: true }),
    ]).start(() => setShowCreateSheet(false));
  };

  const handleScroll = (e: { nativeEvent: { contentOffset: { y: number } } }) => {
    const y = e.nativeEvent.contentOffset.y;
    const diff = y - lastScrollY.current;
    lastScrollY.current = y;

    if (diff > 6 && y > 40) {
      Animated.spring(navTranslateY, {
        toValue: 160,
        useNativeDriver: true,
        tension: 60,
        friction: 12,
      }).start();
    } else if (diff < -6) {
      Animated.spring(navTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 12,
      }).start();
    }
  };

  // ── Data ─────────────────────────────────────────────────────────────────────
  const loadData = async () => {
    try {
      setDecks(await getDecks());
    } catch (e) {
      console.error(e);
    }
  };

  // Reload every time the screen gains focus, so a deck created (or edited)
  // on another screen shows up here without needing a manual refresh.
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  React.useEffect(() => {
    if (isSearching) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [isSearching]);

  const openSearch = () => {
    setSearchQuery('');
    setIsSearching(true);
  };
  const closeSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  const filteredDecks = React.useMemo(() => {
    if (!searchQuery.trim()) return decks;
    return decks
      .map((deck) => ({ deck, score: fuzzyScore(searchQuery, deck.title) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ deck }) => deck);
  }, [decks, searchQuery]);

  const featuredDeck = decks[0] ?? null;

  const handleImport = async () => {
    setShowCreateSheet(false);
    setIsImporting(true);
    try {
      const res = await importAnkiDeck();
      if (res?.success) {
        await loadData();
        Alert.alert('Success', `Imported ${res.count} cards`);
      } else if (res?.message !== 'Import cancelled') {
        Alert.alert('Error', res?.message || 'Failed to import');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setIsImporting(false);
    }
  };

  // Nav bar bottom offset accounts for safe area
  const navBottom = insets.bottom + 12;

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Import toast ────────────────────────────────────── */}
      {isImporting && (
        <View className="absolute left-5 right-5 top-14 z-50 flex-row items-center gap-3 rounded-2xl bg-[#111111] px-5 py-3">
          <View className="h-4 w-4 rounded-full border-2 border-white opacity-80" />
          <Text className="text-sm font-medium text-white">Importing deck…</Text>
        </View>
      )}

      {/* ── Scroll content ──────────────────────────────────── */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: navBottom + 80 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        {/* Hero / Search */}
        <View className="gap-6 bg-hero px-6 pb-8 pt-14">
          {isSearching ? (
            <View className="flex-row items-center gap-3">
              <View className="flex-1 flex-row items-center gap-2 rounded-full bg-white/60 px-4 py-2.5">
                <SearchIcon size={16} color="#555" />
                <TextInput
                  ref={searchInputRef}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search decks…"
                  placeholderTextColor="#888"
                  className="flex-1 text-sm text-[#111111]"
                  returnKeyType="search"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')}>
                    <XIcon size={14} color="#888" />
                  </Pressable>
                )}
              </View>
              <Pressable onPress={closeSearch}>
                <Text className="text-sm font-medium text-[#111111]">Cancel</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View className="flex-row items-center justify-between">
                <Pressable className="flex-row items-center gap-1.5 rounded-full border-[1.5px] border-[#111111] px-4 py-2">
                  <Text className="text-sm font-medium text-[#111111]">Arabic</Text>
                  <ChevronDownIcon size={14} color="#111111" />
                </Pressable>
                <Pressable
                  className="h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-[#111111]"
                  onPress={openSearch}>
                  <SearchIcon size={18} color="#111111" />
                </Pressable>
              </View>
              <Text className="text-5xl font-bold leading-tight -tracking-wide text-[#111111]">
                {'Words of\nthe day'}
              </Text>
              <View className="flex-row items-end justify-between">
                <Text className="text-sm leading-5 text-[#333333]">{'5 words\nper day'}</Text>
                <Pressable>
                  <ArrowUpRightIcon size={20} color="#111111" />
                </Pressable>
              </View>
            </>
          )}
        </View>

        {isSearching ? (
          /* Search results */
          <View className="gap-3 pt-6">
            <Text className="px-5 text-[11px] font-semibold tracking-widest text-neutral-400">
              {filteredDecks.length === 0 && searchQuery
                ? 'NO RESULTS'
                : `${filteredDecks.length} DECK${filteredDecks.length !== 1 ? 'S' : ''}`}
            </Text>
            {filteredDecks.length === 0 && searchQuery ? (
              <Text className="px-5 py-2 text-sm text-neutral-400">
                No decks match "{searchQuery}"
              </Text>
            ) : (
              <View className="gap-[3px]">
                {filteredDecks.map((deck, i) => (
                  <DeckCard
                    key={deck.id}
                    deck={deck}
                    colorClass={DECK_COLOR_CLASSES[i % DECK_COLOR_CLASSES.length]}
                    onPress={() => {
                      closeSearch();
                      router.push(`/deck/${deck.id}`);
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          /* Normal content */
          <>
            <View className="px-5 pt-5">
              <View className="gap-4 rounded-2xl bg-starter-card p-5">
                <View className="flex-row items-baseline justify-between">
                  <Text className="text-xl font-bold text-[#111111]">
                    {featuredDeck ? featuredDeck.title : 'Starter Deck'}
                  </Text>
                  <Text className="text-sm text-neutral-500">
                    {featuredDeck ? `${featuredDeck.cards} cards` : '—'}
                  </Text>
                </View>
                <View className="items-center">
                  <Illustration width={280} />
                </View>
                <Pressable
                  className="items-center rounded-full bg-brand py-4 active:opacity-80"
                  onPress={() =>
                    featuredDeck ? router.push(`/deck/${featuredDeck.id}`) : undefined
                  }>
                  <Text className="text-base font-semibold text-[#111111]">Start Practising</Text>
                </Pressable>
              </View>
            </View>

            <View className="gap-3 pt-6">
              <Text className="px-5 text-[11px] font-semibold tracking-widest text-neutral-400">
                YOUR DECKS
              </Text>
              {decks.length === 0 && (
                <Text className="px-5 py-2 text-sm text-neutral-400">
                  No decks yet — tap + to get started.
                </Text>
              )}
              <View className="gap-[3px]">
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
          </>
        )}
      </ScrollView>

      {/* ── Floating nav bar ────────────────────────────────── */}
      <Animated.View
        style={{ transform: [{ translateY: navTranslateY }], bottom: navBottom }}
        className="absolute left-12 right-12 items-center justify-center">
        <View className="w-2/3 flex-row items-center justify-around rounded-full bg-[#111111] px-4 py-4">
          <Pressable className="items-center justify-center active:opacity-70">
            <HomeIcon size={22} color="#D7F005" strokeWidth={1.5} />
          </Pressable>
          <Pressable
            className="items-center justify-center active:opacity-70"
            onPress={() => setShowCreateSheet(true)}>
            <PlusIcon size={22} color="white" strokeWidth={1.5} />
          </Pressable>
          <Pressable
            className="items-center justify-center active:opacity-70"
            onPress={() => Alert.alert('Settings', 'Coming soon')}>
            <SettingsIcon size={22} color="white" strokeWidth={1.5} />
          </Pressable>
        </View>
      </Animated.View>

      {/* ── Create deck bottom sheet ─────────────────────────── */}
      <Modal visible={showCreateSheet} transparent animationType="none" onRequestClose={closeSheet}>
        <View className="flex-1">
          {/* Backdrop: fades in (visual only, pointerEvents="none") */}
          <Animated.View
            className="absolute inset-0 bg-black/40"
            style={{ opacity: overlayOpacity }}
            pointerEvents="none"
          />
          {/* Backdrop tap target: sits behind the sheet in z-order */}
          <Pressable className="flex-1" onPress={closeSheet} />

          {/* Sheet: rendered after the backdrop so it sits on top and captures touches */}
          <Animated.View
            className="absolute bottom-0 left-0 right-0"
            style={{ transform: [{ translateY: sheetY }] }}>
            {/* Inner View with onStartShouldSetResponder so touches don't reach the backdrop */}
            <View
              className="rounded-t-3xl bg-white px-6 pb-12 pt-6"
              // eslint-disable-next-line react-native/no-inline-styles
              onStartShouldSetResponder={() => true}>
              {/* Header */}
              <View className="mb-8 flex-row items-center">
                <Pressable
                  hitSlop={12}
                  className="h-8 w-8 items-center justify-center"
                  onPress={closeSheet}>
                  <XIcon size={20} color="#111111" strokeWidth={1.5} />
                </Pressable>
                <Text className="-ml-8 flex-1 text-center text-lg font-semibold text-[#111111]">
                  Create a deck
                </Text>
              </View>

              {/* Options */}
              <View className="flex-row justify-around pb-4">
                <Pressable
                  className="items-center gap-3 active:opacity-70"
                  onPress={() => {
                    setShowCreateSheet(false);
                    Alert.alert('With AI', 'Coming soon!');
                  }}>
                  <View className="h-20 w-20 items-center justify-center rounded-full bg-brand">
                    <SparklesIcon size={30} color="#111111" strokeWidth={1.3} />
                  </View>
                  <Text className="text-sm font-medium text-[#111111]">With AI</Text>
                </Pressable>

                <Pressable
                  className="items-center gap-3 active:opacity-70"
                  onPress={() => {
                    setShowCreateSheet(false);
                    router.push('/deck/create');
                  }}>
                  <View className="h-20 w-20 items-center justify-center rounded-full bg-brand">
                    <LayersPlusIcon size={30} color="#111111" strokeWidth={1.3} />
                  </View>
                  <Text className="text-sm font-medium text-[#111111]">Manually</Text>
                </Pressable>

                <Pressable className="items-center gap-3 active:opacity-70" onPress={handleImport}>
                  <View className="h-20 w-20 items-center justify-center rounded-full bg-brand">
                    <DownloadIcon size={30} color="#111111" strokeWidth={1.3} />
                  </View>
                  <Text className="text-sm font-medium text-[#111111]">Import</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
