import { cn } from '@/lib/utils';
import * as React from 'react';
import { View } from 'react-native';

function Progress({
  className,
  value = 0,
  indicatorClassName,
  ...props
}: React.ComponentProps<typeof View> & {
  value?: number;
  indicatorClassName?: string;
}) {
  return (
    <View
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className={cn('relative h-3 w-full overflow-hidden rounded-full bg-secondary', className)}
      {...props}>
      <View
        className={cn('h-full rounded-full bg-primary', indicatorClassName)}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </View>
  );
}

export { Progress };
