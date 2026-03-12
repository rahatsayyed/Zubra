import { cn } from '@/lib/utils';
import { TextClassContext } from '@/components/ui/text';
import * as React from 'react';
import { View } from 'react-native';

function Card({ className, ...props }: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn('rounded-xl border border-border bg-card shadow-sm shadow-black/5', className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<typeof View>) {
  return <View className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />;
}

function CardTitle({ className, ...props }: React.ComponentProps<typeof View>) {
  return (
    <TextClassContext.Provider
      value={cn(
        'text-xl font-semibold leading-none tracking-tight text-card-foreground',
        className
      )}>
      <View {...props} />
    </TextClassContext.Provider>
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<typeof View>) {
  return (
    <TextClassContext.Provider value={cn('text-sm text-muted-foreground', className)}>
      <View {...props} />
    </TextClassContext.Provider>
  );
}

function CardContent({ className, ...props }: React.ComponentProps<typeof View>) {
  return <View className={cn('p-6 pt-0', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<typeof View>) {
  return <View className={cn('flex flex-row items-center p-6 pt-0', className)} {...props} />;
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
