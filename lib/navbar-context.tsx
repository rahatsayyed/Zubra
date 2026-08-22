import * as React from 'react';
import { Animated } from 'react-native';

interface NavbarScrollContextValue {
  navTranslateY: Animated.Value;
  handleScroll: (e: { nativeEvent: { contentOffset: { y: number } } }) => void;
}

const NavbarScrollContext = React.createContext<NavbarScrollContextValue | null>(null);

// Shares one hide-on-scroll animated value between the floating Navbar (rendered
// once at the (tabs) layout level) and whichever tab screen owns the ScrollView.
export function NavbarScrollProvider({ children }: { children: React.ReactNode }) {
  const navTranslateY = React.useRef(new Animated.Value(0)).current;
  const lastScrollY = React.useRef(0);

  const handleScroll = React.useCallback(
    (e: { nativeEvent: { contentOffset: { y: number } } }) => {
      const y = e.nativeEvent.contentOffset.y;
      const diff = y - lastScrollY.current;
      lastScrollY.current = y;

      if (diff > 6 && y > 40) {
        Animated.spring(navTranslateY, {
          toValue: 160,
          useNativeDriver: true,
          tension: 60,
          friction: 12,
        }).start();
      } else if (diff < -6) {
        Animated.spring(navTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 60,
          friction: 12,
        }).start();
      }
    },
    [navTranslateY]
  );

  const value = React.useMemo(() => ({ navTranslateY, handleScroll }), [navTranslateY, handleScroll]);

  return <NavbarScrollContext.Provider value={value}>{children}</NavbarScrollContext.Provider>;
}

export function useNavbarScroll() {
  const ctx = React.useContext(NavbarScrollContext);
  if (!ctx) throw new Error('useNavbarScroll must be used within a NavbarScrollProvider');
  return ctx;
}
