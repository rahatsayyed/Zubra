import * as React from 'react';
import { Animated, Keyboard, Platform } from 'react-native';

// KeyboardAvoidingView doesn't reliably resize screens presented as a native
// `transparentModal` (react-native-screens hosts them in a separate native
// modal, and iOS never reports the right content frame to it). Driving the
// sheet's own bottom margin off the real keyboard show/hide events sidesteps
// that entirely and works the same on both platforms.
export function useKeyboardOffset() {
  const offset = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(offset, {
        toValue: e.endCoordinates.height,
        duration: e.duration || 250,
        useNativeDriver: false,
      }).start();
    });
    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(offset, {
        toValue: 0,
        duration: e?.duration || 200,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [offset]);

  return offset;
}
