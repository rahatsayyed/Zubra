import React, { useState, useEffect } from 'react';
import { View, TextInput, Alert, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Iconify } from 'react-native-iconify';
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
      Alert.alert('Missing title', 'Enter a name for the deck.');
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
    Alert.alert(
      'Delete Deck',
      'Are you sure you want to delete this deck? All cards and progress will be lost.',
      [
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
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 justify-end bg-black/60">
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'transparentModal',
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'fade',
        }}
      />
      {loading ? null : (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end">
        <Pressable className="flex-1" onPress={() => router.back()} />
        <View className="gap-8 rounded-t-3xl bg-white px-4 pb-10 pt-6">
          <View className="flex-row items-center justify-center">
            <Pressable
              hitSlop={12}
              className="absolute left-0 h-6 w-6 items-center justify-center"
              onPress={() => router.back()}>
              <Iconify icon="fluent:dismiss-20-filled" size={20} color="#111111" />
            </Pressable>
            <Text className="text-lg text-[#111111]">Edit deck</Text>
          </View>

          <View className="gap-6">
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Name of the deck"
              placeholderTextColor="#CCB4D1"
              className="font-andada text-[32px] leading-tight text-[#111111]"
            />
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Description (Optional)"
              placeholderTextColor="#7D7D7D"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="h-[100px] rounded-xl border-[1.5px] border-[#111111] px-4 py-3 font-instrument-sans text-base text-[#111111]"
            />
          </View>

          <View className="gap-3">
            <Pressable
              className="items-center rounded-full border-[1.5px] border-[#111111] bg-brand py-4 active:opacity-80"
              onPress={handleSave}>
              <Text className="text-base font-medium text-[#111111]">Save Changes</Text>
            </Pressable>
            <Pressable
              className="items-center rounded-full border-[1.5px] border-[#111111] bg-error-bg py-4 active:opacity-80"
              onPress={handleDelete}>
              <Text className="text-base font-medium text-[#111111]">Delete Deck</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
      )}
    </View>
  );
}
