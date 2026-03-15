import React, { useState, useEffect } from 'react';
import { View, TextInput, Alert, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { getCard, updateCard, deleteCard } from '@/lib/data/api';

export default function EditCardScreen() {
  const { id, cardId } = useLocalSearchParams<{ id: string, cardId: string }>();
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const card = await getCard(cardId);
        setQuestion(card.question);
        setAnswer(card.answer);
      } catch (e: any) {
        Alert.alert('Error', 'Failed to load card');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cardId]);

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) {
      Alert.alert('Validation Error', 'Both question and answer are required');
      return;
    }
    
    try {
      await updateCard(cardId, { question, answer });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Card', 'Are you sure you want to delete this card?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await deleteCard(cardId);
            router.back();
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        } 
      }
    ]);
  };

  if (loading) return null;

  return (
    <>
      <Stack.Screen options={{ title: 'Edit Card' }} />
      <ScrollView className="flex-1 bg-background p-6" keyboardShouldPersistTaps="handled">
        <View className="gap-6">
          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">Front (Question)</Text>
            <TextInput
              value={question}
              onChangeText={setQuestion}
              placeholder="e.g. What is the powerhouse of the cell?"
              placeholderTextColor="#888"
              className="rounded-lg border border-border bg-card p-4 text-base text-foreground"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">Back (Answer)</Text>
            <TextInput
              value={answer}
              onChangeText={setAnswer}
              placeholder="e.g. Mitochondria"
              placeholderTextColor="#888"
              className="rounded-lg border border-border bg-card p-4 text-base text-foreground"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <Button onPress={handleSave} className="mt-4">
            <Text>Save Changes</Text>
          </Button>

          <Button onPress={handleDelete} variant="destructive" className="mt-2 text-destructive-foreground">
            <Text>Delete Card</Text>
          </Button>
        </View>
      </ScrollView>
    </>
  );
}
