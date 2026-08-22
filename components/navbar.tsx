import * as React from 'react';
import { Animated, Pressable, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { Iconify } from 'react-native-iconify';
import { useNavbarScroll } from '@/lib/navbar-context';

interface NavbarProps {
  bottom: number;
  onCreatePress: () => void;
}

// Floating pill nav, rendered once at the (tabs) layout level so it never
// remounts when switching between Home and Settings.
export function Navbar({ bottom, onCreatePress }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { navTranslateY } = useNavbarScroll();

  const isHome = pathname === '/';
  const isSettings = pathname === '/settings';

  return (
    <Animated.View
      style={{ transform: [{ translateY: navTranslateY }], bottom }}
      className="absolute left-12 right-12 items-center justify-center">
      <View className="w-2/3 flex-row items-center justify-around rounded-full bg-[#111111] px-4 py-4">
        <Pressable
          className="items-center justify-center active:opacity-70"
          onPress={() => router.push('/')}>
          <Iconify
            icon={isHome ?"material-symbols-light:home-rounded" : "material-symbols-light:home-outline-rounded"}
            size={28}
            color={isHome ? '#D7F005' : 'white'}
          />
        </Pressable>
        <Pressable className="items-center justify-center active:opacity-70" onPress={onCreatePress}>
          <Iconify icon="iconoir:plus" size={28} color="white" />
        </Pressable>
        <Pressable
          className="items-center justify-center active:opacity-70"
          onPress={() => router.push('/settings')}>
          <Iconify
            icon={isSettings? "material-symbols-light:settings-rounded" : "material-symbols-light:settings-outline-rounded"}
            size={28}
            color={isSettings ? '#D7F005' : 'white'}
          />
        </Pressable>
      </View>
    </Animated.View>
  );
}
