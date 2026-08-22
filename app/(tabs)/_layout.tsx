import * as React from 'react';
import { View } from 'react-native';
import { Slot } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavbarScrollProvider } from '@/lib/navbar-context';
import { DecksRefreshProvider, useDecksRefreshNotify } from '@/lib/decks-refresh-context';
import { Navbar } from '@/components/navbar';
import { CreateDeckSheet } from '@/components/create-deck-sheet';

// Hosts the floating Navbar and the Create Deck sheet once, above a Slot that
// swaps between Home and Settings — so neither remounts when switching tabs.
function TabsLayoutInner() {
  const insets = useSafeAreaInsets();
  const [showCreateSheet, setShowCreateSheet] = React.useState(false);
  const notify = useDecksRefreshNotify();
  const navBottom = insets.bottom + 12;

  return (
    <NavbarScrollProvider>
      <View className="flex-1">
        <Slot />
        <Navbar bottom={navBottom} onCreatePress={() => setShowCreateSheet(true)} />
        <CreateDeckSheet
          visible={showCreateSheet}
          onClose={() => setShowCreateSheet(false)}
          onImported={notify}
        />
      </View>
    </NavbarScrollProvider>
  );
}

export default function TabsLayout() {
  return (
    <DecksRefreshProvider>
      <TabsLayoutInner />
    </DecksRefreshProvider>
  );
}
