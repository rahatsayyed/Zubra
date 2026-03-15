import React, { useState } from 'react';
import { View, TextInput, Alert, ScrollView } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { createCard } from '@/lib/data/api';

export default function CreateCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) {
      Alert.alert('Validation Error', 'Both question and answer are required');
      return;
    }
    
    try {
      await createCard({ deck: id, question, answer });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'New Card' }} />
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
              autoFocus
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
            <Text>Add Card</Text>
          </Button>
        </View>
      </ScrollView>
    </>
  );
}
