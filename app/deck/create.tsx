import React, { useState } from 'react';
import { View, TextInput, Alert, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { createDeck } from '@/lib/data/api';

export default function CreateDeckScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title is required');
      return;
    }
    
    try {
      await createDeck({ title, description });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'New Deck' }} />
      <ScrollView className="flex-1 bg-background p-6" keyboardShouldPersistTaps="handled">
        <View className="gap-6">
          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">Deck Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Spanish Vocabulary"
              placeholderTextColor="#888"
              className="rounded-lg border border-border bg-card p-4 text-base text-foreground"
              autoFocus
            />
          </View>
          
          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">Description (Optional)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="A brief description of this deck"
              placeholderTextColor="#888"
              className="rounded-lg border border-border bg-card p-4 text-base text-foreground"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <Button onPress={handleSave} className="mt-4">
            <Text>Create Deck</Text>
          </Button>
        </View>
      </ScrollView>
    </>
  );
}
