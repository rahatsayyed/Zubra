import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Iconify } from 'react-native-iconify';

// The deck detail "…" menu — a routed transparentModal + router.back(), the
// same reliable pattern as Edit Card, so the scrim covers the whole screen
// (including behind the status bar), which a plain RN <Modal> did not.
export default function DeckMenuScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const options = [
    {
      label: 'Edit Deck',
      icon: 'material-symbols-light:edit-outline',
      onPress: () => router.push(`/deck/${id}/edit`),
    },
    {
      label: 'Add Cards',
      icon: 'si:add-duotone',
      onPress: () => router.push(`/deck/${id}/cards/create`),
    },
    {
      label: 'Manage Cards',
      icon: 'material-symbols-light:dashboard-2-edit-outline',
      onPress: () => router.push(`/deck/${id}/cards`),
    },
  ];

  return (
    <View className="flex-1 justify-end bg-black/40">
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'transparentModal',
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'fade',
        }}
      />
      <Pressable className="flex-1" onPress={() => router.back()} />
      <View className="gap-1 rounded-t-3xl bg-white p-3 pb-8">
        {options.map((opt) => (
          <Pressable
            key={opt.label}
            className="flex-row items-center gap-3 rounded-2xl px-4 py-4 active:bg-black/5"
            onPress={() => {
              router.back();
              opt.onPress();
            }}>
            <Iconify icon={opt.icon} size={20} color="#111111" />
            <Text className="text-base text-[#111111]">{opt.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
