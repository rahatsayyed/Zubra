import React, { useState } from 'react';
import { View, TextInput, Alert, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { createDeck } from '@/lib/data/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CreateDeckScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Enter a name for the deck.');
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
    <View className="flex-1 bg-create-bg">
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1">
        <View className="flex-1 gap-8 px-4" style={{ paddingTop: insets.top + 24 }}>
          <Pressable
            hitSlop={12}
            className="h-6 w-6 items-center justify-center"
            onPress={() => router.back()}>
            <ChevronLeft size={24} color="#111111" strokeWidth={1.5} />
          </Pressable>

          <View className="flex-row items-stretch gap-3">
            <View className="w-[1.5px] bg-[#111111]" />
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Name of the deck"
              placeholderTextColor="#CCB4D1"
              className="flex-1 font-andada-bold text-[32px] leading-tight text-[#111111]"
              autoFocus
            />
          </View>

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
      </KeyboardAvoidingView>

      <Pressable
        onPress={handleSave}
        style={{ bottom: insets.bottom + 24 }}
        className="absolute left-4 right-4 items-center rounded-full border-[1.5px] border-[#111111] bg-brand py-4 active:opacity-80">
        <Text className="text-base font-medium text-[#111111]">Create Deck</Text>
      </Pressable>
    </View>
  );
}
