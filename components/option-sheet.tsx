import * as React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Iconify } from 'react-native-iconify';

export interface OptionSheetItem {
  label: string;
  icon: string;
  onPress: () => void;
  destructive?: boolean;
}

interface OptionSheetProps {
  visible: boolean;
  onClose: () => void;
  options: OptionSheetItem[];
}

// A small bottom-sheet menu, used for the "…" action menu on the deck screen.
export function OptionSheet({ visible, onClose, options }: OptionSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <View
          className="gap-1 rounded-t-3xl bg-white p-3 pb-8"
          onStartShouldSetResponder={() => true}>
          {options.map((opt) => (
            <Pressable
              key={opt.label}
              className="flex-row items-center gap-3 rounded-2xl px-4 py-4 active:bg-black/5"
              onPress={() => {
                onClose();
                opt.onPress();
              }}>
              <Iconify icon={opt.icon} size={20} color={opt.destructive ? '#C0392B' : '#111111'} />
              <Text className={opt.destructive ? 'text-base text-[#C0392B]' : 'text-base text-[#111111]'}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}
