import React, { useState, useCallback } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Plus, List as ListIcon } from 'lucide-react-native';
import { getCardsForDeck, Card as Flashcard } from '@/lib/data/api';

export default function CardListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [cards, setCards] = useState<Flashcard[]>([]);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        try {
          const fetched = await getCardsForDeck(id);
          setCards(fetched);
        } catch (e) {
          console.error(e);
        }
      };
      load();
    }, [id])
  );

  const renderItem = ({ item }: { item: Flashcard }) => (
    <TouchableOpacity onPress={() => router.push(`/deck/${id}/cards/${item.id}/edit`)}>
       <Card className="mb-3">
         <CardContent className="p-4 gap-2">
            <View>
              <Text className="text-xs font-semibold text-muted-foreground mb-1">FRONT</Text>
              <Text className="text-sm font-medium text-foreground" numberOfLines={2}>{item.question}</Text>
            </View>
            <View className="h-px bg-border my-2" />
            <View>
              <Text className="text-xs font-semibold text-muted-foreground mb-1">BACK</Text>
              <Text className="text-sm text-muted-foreground" numberOfLines={2}>{item.answer}</Text>
            </View>
         </CardContent>
       </Card>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Cards',
          headerRight: () => (
             <Button variant="ghost" size="icon" onPress={() => router.push(`/deck/${id}/cards/create`)}>
                <Icon as={Plus} className="size-5 text-foreground" />
             </Button>
          )
        }} 
      />
      
      <View className="flex-1 bg-background">
        <FlatList
           data={cards}
           keyExtractor={(item) => item.id}
           renderItem={renderItem}
           contentContainerClassName="p-4 pb-20"
           ListEmptyComponent={() => (
             <View className="flex-1 items-center justify-center py-20 opacity-50">
                <Icon as={ListIcon} className="size-16 text-muted-foreground mb-4" />
                <Text className="text-lg font-medium text-foreground text-center">No cards yet</Text>
                <Text className="text-sm text-muted-foreground text-center px-8 mt-2">
                   Add your first card to start building this deck.
                </Text>
             </View>
           )}
        />
      </View>
    </>
  );
}
