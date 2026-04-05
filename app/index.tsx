import { Text } from '@/components/ui/text';
import { getDecks, Deck } from '@/lib/data/api';
import { importAnkiDeck } from '@/lib/data/ankiImport';
import { cn } from '@/lib/utils';
import { Stack, useRouter } from 'expo-router';
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
import Svg, { Circle, Path, Rect } from 'react-native-svg';

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

// ─── Characters illustration (inline SVG, viewBox 767 × 469) ─────────────────
function Illustration({ width = 300 }: { width?: number }) {
  const height = Math.round(width * (469 / 767));
  return (
    <Svg width={width} height={height} viewBox="0 0 767 469" fill="none">
      <Path d="M62.2155 356.983V468.111H59.212H72.5131" stroke="#111111" strokeWidth="1.7913" />
      <Path d="M109.413 356.983V468.111H106.409H119.711" stroke="#111111" strokeWidth="1.7913" />
      <Path d="M257.011 245.427V468.113H254.008H267.309" stroke="#111111" strokeWidth="1.7913" />
      <Path d="M461.248 245.427V468.113H458.244H471.545" stroke="#111111" strokeWidth="1.7913" />
      <Path d="M607.988 245.427V468.113H604.985H618.286" stroke="#111111" strokeWidth="1.7913" />
      <Path d="M304.209 245.427V468.113H301.205H314.506" stroke="#111111" strokeWidth="1.7913" />
      <Path d="M508.445 245.427V468.113H505.442H518.743" stroke="#111111" strokeWidth="1.7913" />
      <Path d="M655.186 245.427V468.113H652.182H665.483" stroke="#111111" strokeWidth="1.7913" />
      <Path
        d="M627.915 143.269C630.287 137.185 638.895 137.185 641.267 143.269L642.82 147.254C644.873 152.518 651.926 153.447 655.271 148.893L657.803 145.446C661.668 140.184 669.983 142.412 670.7 148.902L671.169 153.153C671.789 158.769 678.362 161.492 682.771 157.959L686.109 155.284C691.205 151.202 698.66 155.506 697.672 161.96L697.025 166.188C696.17 171.773 701.814 176.104 706.988 173.833L710.904 172.114C716.883 169.489 722.97 175.576 720.345 181.555L718.626 185.471C716.355 190.645 720.686 196.289 726.271 195.434L730.499 194.787C736.953 193.799 741.257 201.254 737.175 206.35L734.5 209.688C730.967 214.098 733.69 220.67 739.306 221.29L743.558 221.759C750.048 222.476 752.276 230.791 747.013 234.656L743.566 237.188C739.012 240.533 739.941 247.587 745.205 249.639L749.19 251.193C755.274 253.564 755.274 262.173 749.19 264.544L745.205 266.098C739.941 268.15 739.012 275.204 743.566 278.548L747.013 281.08C752.276 284.946 750.048 293.261 743.558 293.977L739.306 294.446C733.69 295.066 730.967 301.639 734.5 306.049L737.175 309.387C741.257 314.482 736.953 321.937 730.499 320.949L726.271 320.302C720.686 319.447 716.355 325.092 718.626 330.265L720.345 334.182C722.97 340.161 716.883 346.248 710.904 343.623L706.988 341.903C701.814 339.632 696.17 343.963 697.025 349.548L697.672 353.776C698.66 360.231 691.205 364.535 686.109 360.452L682.771 357.778C678.362 354.245 671.789 356.967 671.169 362.584L670.7 366.835C669.983 373.325 661.668 375.553 657.803 370.291L655.271 366.843C651.926 362.29 644.873 363.218 642.82 368.483L641.267 372.468C638.895 378.551 630.287 378.551 627.915 372.468L626.361 368.483C624.309 363.218 617.256 362.29 613.911 366.843L611.379 370.291C607.513 375.553 599.198 373.325 598.482 366.835L598.013 362.584C597.393 356.967 590.82 354.245 586.411 357.778L583.073 360.452C577.977 364.535 570.522 360.231 571.51 353.776L572.157 349.548C573.012 343.963 567.367 339.632 562.194 341.903L558.277 343.623C552.299 346.248 546.212 340.161 548.836 334.182L550.556 330.265C552.827 325.092 548.496 319.447 542.911 320.302L538.683 320.949C532.228 321.937 527.924 314.482 532.007 309.387L534.681 306.049C538.214 301.639 535.492 295.066 529.876 294.446L525.624 293.977C519.134 293.261 516.906 284.946 522.169 281.08L525.616 278.548C530.17 275.204 529.241 268.15 523.977 266.098L519.991 264.544C513.908 262.173 513.908 253.564 519.991 251.193L523.977 249.639C529.241 247.587 530.17 240.533 525.616 237.188L522.169 234.656C516.906 230.791 519.134 222.476 525.624 221.759L529.876 221.29C535.492 220.67 538.214 214.098 534.681 209.688L532.007 206.35C527.924 201.254 532.228 193.799 538.683 194.787L542.911 195.434C548.496 196.289 552.827 190.645 550.556 185.471L548.836 181.555C546.212 175.576 552.299 169.489 558.277 172.114L562.194 173.833C567.368 176.104 573.012 171.773 572.157 166.188L571.51 161.96C570.522 155.506 577.977 151.202 583.073 155.284L586.411 157.959C590.82 161.492 597.393 158.769 598.013 153.153L598.482 148.902C599.198 142.412 607.513 140.184 611.379 145.446L613.911 148.893C617.256 153.447 624.309 152.518 626.361 147.254L627.915 143.269Z"
        fill="#BDB1FE"
      />
      <Path
        d="M488.278 169.909L598.12 279.75L488.278 389.592L378.437 279.75L488.278 169.909Z"
        fill="#4D7BF3"
      />
      <Path
        d="M284.043 0L308.694 127.068L409.256 45.5737L346.461 158.759L475.88 160.971L355.023 207.312L452.742 292.195L330.372 250.009L350.667 377.846L284.043 266.871L217.419 377.846L237.714 250.009L115.344 292.195L213.063 207.312L92.2057 160.971L221.624 158.759L158.83 45.5737L259.392 127.068L284.043 0Z"
        fill="#FF642B"
      />
      <Circle cx="89.246" cy="300.345" r="89.246" fill="#C2D6BD" />
      <Rect x="63.5017" y="272.887" width="3.5826" height="3.43254" rx="1.71627" fill="#111111" />
      <Rect x="111.407" y="272.887" width="3.5826" height="3.43254" rx="1.71627" fill="#111111" />
      <Rect x="609.276" y="214.53" width="3.5826" height="3.43254" rx="1.71627" fill="#111111" />
      <Rect x="657.181" y="214.53" width="3.5826" height="3.43254" rx="1.71627" fill="#111111" />
      <Rect x="258.299" y="166.476" width="3.5826" height="6.86508" rx="1.7913" fill="#111111" />
      <Rect x="306.204" y="166.476" width="3.5826" height="6.86508" rx="1.7913" fill="#111111" />
      <Rect x="462.535" y="241.994" width="3.5826" height="6.86508" rx="1.7913" fill="#111111" />
      <Rect x="510.44" y="241.994" width="3.5826" height="6.86508" rx="1.7913" fill="#111111" />
    </Svg>
  );
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

  React.useEffect(() => {
    loadData();
  }, []);

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
