import { cn } from '@/lib/utils';
import * as React from 'react';
import { View } from 'react-native';

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: React.ComponentProps<typeof View> & {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}) {
  return (
    <View
      role={decorative ? 'none' : 'separator'}
      aria-orientation={!decorative ? orientation : undefined}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className
      )}
      {...props}
    />
  );
}

export { Separator };
