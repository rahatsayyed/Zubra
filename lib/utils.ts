import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Full literal class names so NativeWind can find them at build time.
const DECK_COLOR_CLASSES = ['bg-deck-1', 'bg-deck-2', 'bg-deck-3', 'bg-deck-4'] as const;

// Picks a stable color for a deck id, so the same deck always shows the same color.
export function getDeckColorClass(deckId: string): string {
  let hash = 0;
  for (let i = 0; i < deckId.length; i++) {
    hash = (hash * 31 + deckId.charCodeAt(i)) >>> 0;
  }
  return DECK_COLOR_CLASSES[hash % DECK_COLOR_CLASSES.length];
}
