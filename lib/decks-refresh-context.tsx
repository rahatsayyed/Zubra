import * as React from 'react';

interface DecksRefreshContextValue {
  notify: () => void;
  subscribe: (fn: () => void) => () => void;
}

const DecksRefreshContext = React.createContext<DecksRefreshContextValue | null>(null);

// Lets a layout-level action (e.g. importing a deck from the shared Create Deck
// sheet) tell the Home screen to reload its deck list, even when Home never
// loses focus (so its own useFocusEffect wouldn't otherwise re-run).
export function DecksRefreshProvider({ children }: { children: React.ReactNode }) {
  const listeners = React.useRef(new Set<() => void>()).current;

  const notify = React.useCallback(() => {
    listeners.forEach((fn) => fn());
  }, [listeners]);

  const subscribe = React.useCallback(
    (fn: () => void) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    [listeners]
  );

  const value = React.useMemo(() => ({ notify, subscribe }), [notify, subscribe]);

  return <DecksRefreshContext.Provider value={value}>{children}</DecksRefreshContext.Provider>;
}

export function useDecksRefreshNotify() {
  const ctx = React.useContext(DecksRefreshContext);
  if (!ctx) throw new Error('useDecksRefreshNotify must be used within a DecksRefreshProvider');
  return ctx.notify;
}

export function useDecksRefreshSubscription(callback: () => void) {
  const ctx = React.useContext(DecksRefreshContext);
  React.useEffect(() => {
    if (!ctx) return;
    return ctx.subscribe(callback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx]);
}
