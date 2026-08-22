import * as React from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Iconify } from 'react-native-iconify';
import { WithAiIcon, ManuallyIcon, ImportIcon } from '@/components/create-deck-icons';
import { importAnkiDeck } from '@/lib/data/ankiImport';

// A real pushed screen (transparentModal + router.back()), the same reliable
// pattern Add Card / Edit Card / Edit Deck use — unlike a hand-rolled RN
// <Modal>, closing here is driven by navigation, not an animation callback.
export default function CreateDeckScreen() {
  const router = useRouter();
  const [isImporting, setIsImporting] = React.useState(false);

  const handleImport = async () => {
    router.back();
    setIsImporting(true);
    try {
      const res = await importAnkiDeck();
      if (res?.success) {
        Alert.alert('Success', `Imported ${res.count} cards`);
      } else if (res?.message !== 'Import cancelled') {
        Alert.alert('Error', res?.message || 'Failed to import');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setIsImporting(false);
    }
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

      {isImporting && (
        <View className="absolute left-5 right-5 top-14 z-50 flex-row items-center gap-3 rounded-2xl bg-[#111111] px-5 py-3">
          <View className="h-4 w-4 rounded-full border-2 border-white opacity-80" />
          <Text className="text-sm font-medium text-white">Importing deck…</Text>
        </View>
      )}

      <Pressable className="flex-1" onPress={() => router.back()} />

      <View className="rounded-t-3xl bg-white px-6 pb-12 pt-6">
        <View className="mb-8 flex-row items-center justify-center">
          <Pressable
            hitSlop={12}
            className="absolute left-0 h-6 w-6 items-center justify-center"
            onPress={() => router.back()}>
            <Iconify icon="fluent:dismiss-20-filled" size={20} color="#111111" />
          </Pressable>
          <Text className="text-lg font-semibold text-[#111111]">Create a deck</Text>
        </View>

        <View className="flex-row justify-around pb-4">
          <Pressable
            className="items-center gap-3 active:opacity-70"
            onPress={() => {
              router.back();
              Alert.alert('With AI', 'Coming soon!');
            }}>
            <View className="h-20 w-20 items-center justify-center rounded-full bg-brand">
              <WithAiIcon size={26} color="#111111" />
            </View>
            <Text className="text-sm font-medium text-[#111111]">With AI</Text>
          </Pressable>

          <Pressable
            className="items-center gap-3 active:opacity-70"
            onPress={() => {
              router.back();
              router.push('/deck/create');
            }}>
            <View className="h-20 w-20 items-center justify-center rounded-full bg-brand">
              <ManuallyIcon size={26} color="#111111" />
            </View>
            <Text className="text-sm font-medium text-[#111111]">Manually</Text>
          </Pressable>

          <Pressable className="items-center gap-3 active:opacity-70" onPress={handleImport}>
            <View className="h-20 w-20 items-center justify-center rounded-full bg-brand">
              <ImportIcon size={26} color="#111111" />
            </View>
            <Text className="text-sm font-medium text-[#111111]">Import</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
