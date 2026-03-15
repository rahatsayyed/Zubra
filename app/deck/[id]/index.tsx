import React, { useState } from 'react';
import { View, ScrollView, Modal, TouchableOpacity, Alert } from 'react-native';
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
            className="w-full flex-row gap-2 py-6 bg-primary" 
            onPress={startScheduledSession}
          >
             <Icon as={Play} className="size-5 text-white" />
             <Text className="text-lg text-white font-bold">Study Scheduled</Text>
          </Button>
          
          <Button 
            variant="outline"
            className="w-full flex-row gap-2 py-6" 
            onPress={() => setShowCustomModal(true)}
          >
             <Text className="text-lg font-bold">Custom Study</Text>
          </Button>

          <View className="flex-row gap-3 mt-4">
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

      {/* Custom Study Modal */}
      <Modal
        visible={showCustomModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl p-6 min-h-[50%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-foreground">Custom Study</Text>
              <Button variant="ghost" size="icon" onPress={() => setShowCustomModal(false)}>
                <Icon as={X} className="size-6 text-foreground" />
              </Button>
            </View>

            <Text className="text-sm font-semibold text-muted-foreground mb-3">SELECT CARD DIFFICULTY</Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {['Any', 'Again', 'Hard', 'Good', 'Easy'].map((band) => (
                <TouchableOpacity
                  key={band}
                  onPress={() => setCustomBand(band as DifficultyBand)}
                  className={`px-4 py-2 rounded-full border ${customBand === band ? 'bg-primary border-primary' : 'border-border'}`}
                >
                  <Text className={customBand === band ? 'text-primary-foreground font-bold' : 'text-foreground'}>{band}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-sm font-semibold text-muted-foreground mb-3">MAXIMUM CARDS</Text>
            <View className="flex-row flex-wrap gap-2 mb-8">
               {[10, 20, 50, 100].map((limit) => (
                 <TouchableOpacity
                   key={limit}
                   onPress={() => setCustomLimit(limit)}
                   className={`px-4 py-2 rounded-full border ${customLimit === limit ? 'bg-primary border-primary' : 'border-border'}`}
                 >
                   <Text className={customLimit === limit ? 'text-primary-foreground font-bold' : 'text-foreground'}>{limit}</Text>
                 </TouchableOpacity>
               ))}
            </View>

            <Button className="w-full py-6 mt-auto shadow-sm" onPress={startCustomSession}>
               <Text className="text-lg font-bold">Start Session</Text>
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
}
