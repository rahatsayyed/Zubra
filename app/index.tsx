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
import { ScrollView, View } from 'react-native';

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
}: {
  icon: any;
  title: string;
  description: string;
  accentColor: string;
}) {
  return (
    <Button
      variant="ghost"
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
                    <Text className="text-lg font-bold text-foreground">7 Day Streak!</Text>
                    <Text className="text-sm text-muted-foreground">Keep it going 🔥</Text>
                  </View>
                </View>
                <View className="items-center rounded-full bg-orange-500 px-3.5 py-1.5">
                  <Text className="text-sm font-bold text-white">7</Text>
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
          <StatCard icon={LayersIcon} label="Total Cards" value="248" color="bg-blue-500" />
          <StatCard icon={TrophyIcon} label="Mastered" value="86" color="bg-emerald-500" />
          <StatCard icon={ZapIcon} label="Due Today" value="15" color="bg-violet-500" />
        </View>

        {/* ── Quick Actions ────────────────────────────────── */}
        <View className="gap-1 px-6 pt-6">
          <Text className="mb-2 text-lg font-semibold text-foreground">Quick Actions</Text>
          <Card>
            <CardContent className="gap-0 p-0">
              <FeatureCard
                icon={SparklesIcon}
                title="Start Review"
                description="15 cards due for review"
                accentColor="bg-violet-500"
              />
              <Separator className="mx-4" />
              <FeatureCard
                icon={PlusIcon}
                title="Create Deck"
                description="Build a new flashcard deck"
                accentColor="bg-blue-500"
              />
              <Separator className="mx-4" />
              <FeatureCard
                icon={BookOpenIcon}
                title="Browse Decks"
                description="Explore your 12 decks"
                accentColor="bg-emerald-500"
              />
            </CardContent>
          </Card>
        </View>

        {/* ── Recent Decks ─────────────────────────────────── */}
        <View className="gap-3 px-6 pt-6">
          <Text className="text-lg font-semibold text-foreground">Recent Decks</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3">
            {RECENT_DECKS.map((deck) => (
              <Card key={deck.title} className="w-44">
                <CardHeader className="gap-2 p-4 pb-2">
                  <View className={`self-start rounded-lg p-2 ${deck.color}`}>
                    <Icon as={deck.icon} className="size-4 text-white" />
                  </View>
                  <CardTitle>
                    <Text className="text-sm font-semibold text-card-foreground">{deck.title}</Text>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  <CardDescription>
                    <Text className="text-xs text-muted-foreground">{deck.cardCount} cards</Text>
                  </CardDescription>
                  <View className="mt-2.5 gap-1">
                    <Progress value={deck.progress} className="h-1.5" />
                    <Text className="text-[10px] text-muted-foreground">
                      {deck.progress}% mastered
                    </Text>
                  </View>
                </CardContent>
              </Card>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </>
  );
}

// ─── Sample Data ─────────────────────────────────────────────────
const RECENT_DECKS = [
  {
    title: 'JavaScript',
    cardCount: 52,
    progress: 78,
    icon: ZapIcon,
    color: 'bg-yellow-500',
  },
  {
    title: 'React Native',
    cardCount: 38,
    progress: 45,
    icon: SparklesIcon,
    color: 'bg-blue-500',
  },
  {
    title: 'TypeScript',
    cardCount: 44,
    progress: 62,
    icon: LayersIcon,
    color: 'bg-indigo-500',
  },
  {
    title: 'System Design',
    cardCount: 30,
    progress: 25,
    icon: BookOpenIcon,
    color: 'bg-rose-500',
  },
];
