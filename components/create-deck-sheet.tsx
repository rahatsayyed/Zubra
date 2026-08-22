import * as React from 'react';
import { Alert, Animated, Modal, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/text';
import { Iconify } from 'react-native-iconify';
import { WithAiIcon, ManuallyIcon, ImportIcon } from '@/components/create-deck-icons';
import { importAnkiDeck } from '@/lib/data/ankiImport';

interface CreateDeckSheetProps {
  visible: boolean;
  onClose: () => void;
  // Called after a successful import, so the Home screen (which may not
  // regain focus, since this sheet lives above it) can refresh its list.
  onImported: () => void;
}

// The "Create a deck" bottom sheet (With AI / Manually / Import), shared by
// the (tabs) layout so it can be opened from the Navbar's "+" button
// regardless of which tab is active.
export function CreateDeckSheet({ visible, onClose, onImported }: CreateDeckSheetProps) {
  const router = useRouter();
  const sheetY = React.useRef(new Animated.Value(600)).current;
  const overlayOpacity = React.useRef(new Animated.Value(0)).current;
  const [isImporting, setIsImporting] = React.useState(false);

  React.useEffect(() => {
    if (visible) {
      sheetY.setValue(600);
      overlayOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(sheetY, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, sheetY, overlayOpacity]);

  const close = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(sheetY, { toValue: 600, duration: 220, useNativeDriver: true }),
    ]).start(onClose);
  };

  const handleImport = async () => {
    close();
    setIsImporting(true);
    try {
      const res = await importAnkiDeck();
      if (res?.success) {
        onImported();
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
    <>
      {isImporting && (
        <View className="absolute left-5 right-5 top-14 z-50 flex-row items-center gap-3 rounded-2xl bg-[#111111] px-5 py-3">
          <View className="h-4 w-4 rounded-full border-2 border-white opacity-80" />
          <Text className="text-sm font-medium text-white">Importing deck…</Text>
        </View>
      )}

      <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
        <View className="flex-1">
          <Animated.View
            className="absolute inset-0 bg-black/40"
            style={{ opacity: overlayOpacity }}
            pointerEvents="none"
          />
          <Pressable className="flex-1" onPress={close} />

          <Animated.View
            className="absolute bottom-0 left-0 right-0"
            style={{ transform: [{ translateY: sheetY }] }}>
            <View className="rounded-t-3xl bg-white px-6 pb-12 pt-6">
              <View className="mb-8 flex-row items-center">
                <Pressable hitSlop={12} className="h-8 w-8 items-center justify-center" onPress={close}>
                  <Iconify icon="fluent:dismiss-20-filled" size={20} color="#111111" />
                </Pressable>
                <Text className="-ml-8 flex-1 text-center text-lg font-semibold text-[#111111]">
                  Create a deck
                </Text>
              </View>

              <View className="flex-row justify-around pb-4">
                <Pressable
                  className="items-center gap-3 active:opacity-70"
                  onPress={() => {
                    close();
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
                    close();
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
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}
