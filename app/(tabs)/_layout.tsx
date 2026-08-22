import * as React from 'react';
import { View } from 'react-native';
import { Slot } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavbarScrollProvider } from '@/lib/navbar-context';
import { Navbar } from '@/components/navbar';

// Hosts the floating Navbar once, above a Slot that swaps between Home and
// Settings — so it never remounts when switching tabs.
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const navBottom = Math.max(insets.bottom - 8, 4);

  return (
    <NavbarScrollProvider>
      <View className="flex-1">
        <Slot />
        <Navbar bottom={navBottom} />
      </View>
    </NavbarScrollProvider>
  );
}
