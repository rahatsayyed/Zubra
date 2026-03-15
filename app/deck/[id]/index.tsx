import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { Settings, Play, List, Plus } from 'lucide-react-native';
import { getDeck, getDeckMastery, Deck } from '@/lib/data/api';

export default function DeckDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [mastery, setMastery] = useState(0);

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

  if (!deck) return null;

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: deck.title,
          headerRight: () => (
            <Button 
               variant="ghost" 
               size="icon" 
               onPress={() => router.push(`/deck/${id}/edit`)}
            >
               <Icon as={Settings} className="size-5 text-foreground" />
            </Button>
          )
        }} 
      />
      <ScrollView className="flex-1 bg-background p-4" contentContainerClassName="gap-6">
        
        <View className="items-center py-6">
           <Text className="text-3xl font-bold text-foreground text-center">{deck.title}</Text>
           {deck.description ? (
             <Text className="text-base text-muted-foreground text-center mt-2">{deck.description}</Text>
           ) : null}
        </View>

        <Card>
          <CardContent className="p-4 gap-4">
            <View className="flex-row justify-between items-end">
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
          <Button 
            className="w-full flex-row gap-2 py-6" 
            onPress={() => router.push(`/deck/${id}/study`)} // Assuming study route exists or will exist
          >
             <Icon as={Play} className="size-5 text-white" />
             <Text className="text-lg">Study Now</Text>
          </Button>

          <View className="flex-row gap-3">
             <Button 
               variant="outline" 
               className="flex-1 flex-row gap-2"
               onPress={() => router.push(`/deck/${id}/cards`)}
             >
                <Icon as={List} className="size-5 text-foreground" />
                <Text>Manage Cards</Text>
             </Button>

             <Button 
               variant="outline" 
               className="flex-1 flex-row gap-2"
               onPress={() => router.push(`/deck/${id}/cards/create`)}
             >
                <Icon as={Plus} className="size-5 text-foreground" />
                <Text>Add Card</Text>
             </Button>
          </View>
        </View>

      </ScrollView>
    </>
  );
}
