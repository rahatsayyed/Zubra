import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface FlipCardIconProps {
  size?: number;
  color?: string;
}

export function FlipCardIcon({ size = 16, color = '#111111' }: FlipCardIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8.00065 12.6667C4.31865 12.6667 1.33398 11.1743 1.33398 9.33333C1.33398 8.85933 1.53198 8.40833 1.88865 8M6.66732 14L8.00065 12.6667L6.66732 11.3333M10.6673 12.3893C13.022 11.875 14.6673 10.7 14.6673 9.33333C14.6673 8.85933 14.4693 8.40833 14.1126 8"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.6665 8.33333V3C4.6665 2.44772 5.11422 2 5.6665 2H10.3332C10.8855 2 11.3332 2.44772 11.3332 3V8.33333C11.3332 8.88562 10.8855 9.33333 10.3332 9.33333H5.6665C5.11422 9.33333 4.6665 8.88562 4.6665 8.33333Z"
        stroke={color}
      />
    </Svg>
  );
}
