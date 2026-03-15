import React, { useState, useEffect } from 'react';
import { View, TextInput, Alert, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { getDeck, updateDeck, deleteDeck } from '@/lib/data/api';

export default function EditDeckScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const deck = await getDeck(id);
        setTitle(deck.title);
        setDescription(deck.description);
      } catch (e: any) {
        Alert.alert('Error', 'Failed to load deck');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title is required');
      return;
    }
    
    try {
      await updateDeck(id, { title, description });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Deck', 'Are you sure you want to delete this deck? All cards and progress will be lost.', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await deleteDeck(id);
            router.replace('/');
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
      <Stack.Screen options={{ title: 'Edit Deck' }} />
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
            <Text>Save Changes</Text>
          </Button>
          
          <Button onPress={handleDelete} variant="destructive" className="mt-2 text-destructive-foreground">
            <Text>Delete Deck</Text>
          </Button>
        </View>
      </ScrollView>
    </>
  );
}
