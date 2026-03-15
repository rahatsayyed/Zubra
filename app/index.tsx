import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { Stack } from 'expo-router';
import {
  BookOpenIcon,
  FlameIcon,
  LayersIcon,
  MoonStarIcon,
  PlusIcon,
  SparklesIcon,
  SunIcon,
  TrophyIcon,
  ZapIcon,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { useFocusEffect, useRouter, Link } from 'expo-router';
import { importAnkiDeck } from '@/lib/data/ankiImport';
import { 
  getDecks, 
  Deck, 
  getTotalCardsCount, 
  getMasteredCardsCount, 
  getDeckDueCount,
  getDeckMastery,
  getUserStreak
} from '@/lib/data/api';

// ─── Theme Toggle ────────────────────────────────────────────────
const THEME_ICONS = { light: SunIcon, dark: MoonStarIcon };

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  return (
    <Button onPressIn={toggleColorScheme} size="icon" variant="ghost" className="rounded-full">
      <Icon as={THEME_ICONS[colorScheme ?? 'light']} className="size-5" />
    </Button>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card className="flex-1">
      <CardContent className="items-center gap-2 p-4">
        <View className={`rounded-xl p-2.5 ${color}`}>
          <Icon as={icon} className="size-5 text-white" />
        </View>
        <Text className="text-2xl font-bold text-foreground">{value}</Text>
        <Text className="text-xs text-muted-foreground">{label}</Text>
      </CardContent>
    </Card>
  );
}

// ─── Feature Card (for quick actions) ────────────────────────────
function FeatureCard({
  icon,
  title,
  description,
  accentColor,
  onPress,
}: {
  icon: any;
  title: string;
  description: string;
  accentColor: string;
  onPress?: () => void;
}) {
  return (
    <Button
      variant="ghost"
      onPress={onPress}
      className="h-auto w-full flex-row items-center justify-start gap-4 rounded-xl px-4 py-3.5">
      <View className={`rounded-xl p-2.5 ${accentColor}`}>
        <Icon as={icon} className="size-5 text-white" />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-base font-semibold text-foreground">{title}</Text>
        <Text className="text-sm text-muted-foreground">{description}</Text>
      </View>
    </Button>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────
const SCREEN_OPTIONS = {
  title: 'Zubra',
  headerRight: () => <ThemeToggle />,
};

export default function HomeScreen() {
  const router = useRouter();
  const [decks, setDecks] = React.useState<Deck[]>([]);
  const [totalCards, setTotalCards] = React.useState(0);
  const [masteredCards, setMasteredCards] = React.useState(0);
  const [dueToday, setDueToday] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [deckMasteries, setDeckMasteries] = React.useState<Record<string, number>>({});

  const loadData = async () => {
    try {
      const allDecks = await getDecks();
      setDecks(allDecks);
      
      const tc = await getTotalCardsCount();
      const mc = await getMasteredCardsCount();
      const dt = await getDeckDueCount(); // no deckId = all decks
      const currentStreak = await getUserStreak();
      
      const masteries: Record<string, number> = {};
      for (const d of allDecks) {
        masteries[d.id] = await getDeckMastery(d.id);
      }
      
      setTotalCards(tc);
      setMasteredCards(mc);
      setDueToday(dt);
      setStreak(currentStreak);
      setDeckMasteries(masteries);
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="pb-12"
        showsVerticalScrollIndicator={false}>
        {/* ── Hero Section ──────────────────────────────────── */}
        <View className="gap-2 px-6 pb-2 pt-4">
          <Text className="text-3xl font-bold tracking-tight text-foreground">Welcome back 👋</Text>
          <Text className="text-base text-muted-foreground">Ready to boost your memory today?</Text>
        </View>

        {/* ── Daily Streak Card ─────────────────────────────── */}
        <View className="px-6 pt-4">
          <Card className="overflow-hidden border-primary/20 bg-primary/5">
            <CardContent className="gap-4 p-5">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <View className="rounded-full bg-orange-500/15 p-2">
                    <Icon as={FlameIcon} className="size-6 text-orange-500" />
                  </View>
                  <View>
                    <Text className="text-lg font-bold text-foreground">{streak} Day Streak!</Text>
                    <Text className="text-sm text-muted-foreground">{streak > 0 ? "Keep it going 🔥" : "Start your streak today!"}</Text>
                  </View>
                </View>
                <View className="items-center rounded-full bg-orange-500 px-3.5 py-1.5">
                  <Text className="text-sm font-bold text-white">{streak}</Text>
                </View>
              </View>
              <View className="gap-1.5">
                <View className="flex-row justify-between">
                  <Text className="text-xs text-muted-foreground">Daily progress</Text>
                  <Text className="text-xs font-medium text-foreground">15/20 cards</Text>
                </View>
                <Progress value={75} indicatorClassName="bg-orange-500" />
              </View>
            </CardContent>
          </Card>
        </View>

        {/* ── Stats Row ────────────────────────────────────── */}
        <View className="flex-row gap-3 px-6 pt-5">
          <StatCard icon={LayersIcon} label="Total Cards" value={String(totalCards)} color="bg-blue-500" />
          <StatCard icon={TrophyIcon} label="Mastered" value={String(masteredCards)} color="bg-emerald-500" />
          <StatCard icon={ZapIcon} label="Due Today" value={String(dueToday)} color="bg-violet-500" />
        </View>

        {/* ── Quick Actions ────────────────────────────────── */}
        <View className="gap-1 px-6 pt-6">
          <Text className="mb-2 text-lg font-semibold text-foreground">Quick Actions</Text>
          <Card>
            <CardContent className="gap-0 p-0">
              <FeatureCard
                icon={SparklesIcon}
                title="Start Review"
                description={`${dueToday} cards due for review`}
                accentColor="bg-violet-500"
              />
              <Separator className="mx-4" />
              <FeatureCard
                icon={PlusIcon}
                title="Create Deck"
                description="Build a new flashcard deck"
                accentColor="bg-blue-500"
                onPress={() => router.push('/deck/create')}
              />
              <Separator className="mx-4" />
              <FeatureCard
                icon={BookOpenIcon}
                title="Import Anki Deck"
                description="Import .apkg flashcards"
                accentColor="bg-emerald-500"
                onPress={async () => {
                  try {
                    const res = await importAnkiDeck();
                    if (res?.success) {
                      Alert.alert('Success', `Imported ${res.count} cards`);
                      loadData();
                    } else {
                      if (res?.message !== 'Import cancelled') {
                        Alert.alert('Error', res?.message || 'Failed to import');
                      }
                    }
                  } catch (e: any) {
                    Alert.alert('Error', e.message);
                  }
                }}
              />
            </CardContent>
          </Card>
        </View>

        {/* ── Recent Decks ─────────────────────────────────── */}
        <View className="gap-3 px-6 pt-6">
          <Text className="text-lg font-semibold text-foreground">Your Decks</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3">
            {decks.length === 0 && (
              <Text className="text-sm text-muted-foreground ml-2 mt-2">No decks yet. Import one to get started!</Text>
            )}
            {decks.map((deck) => {
              const progress = deckMasteries[deck.id] || 0;
              return (
              <Link href={`/deck/${deck.id}`} asChild key={deck.id}>
                <Button variant="ghost" className="p-0 h-auto">
                  <Card className="w-44 text-left">
                    <CardHeader className="gap-2 p-4 pb-2 items-start">
                      <View className="rounded-lg p-2 bg-blue-500">
                        <Icon as={LayersIcon} className="size-4 text-white" />
                      </View>
                      <CardTitle>
                        <Text className="text-sm font-semibold text-card-foreground" numberOfLines={1}>{deck.title}</Text>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 pt-0 items-start">
                      <CardDescription>
                        <Text className="text-xs text-muted-foreground">{deck.cards} cards</Text>
                      </CardDescription>
                      <View className="mt-2.5 gap-1 w-full">
                        <Progress value={progress} className="h-1.5" />
                        <Text className="text-[10px] text-muted-foreground">
                          {progress}% mastered
                        </Text>
                      </View>
                    </CardContent>
                  </Card>
                </Button>
              </Link>
            )})}
          </ScrollView>
        </View>
      </ScrollView>
    </>
  );
}


