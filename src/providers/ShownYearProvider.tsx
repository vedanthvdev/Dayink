import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ShownYearByWordId } from '../domain/shownYear';

type ShownYearContextValue = {
  shownYearByWordId: ShownYearByWordId;
  setShownYearByWordId: (next: ShownYearByWordId) => void;
};

const ShownYearContext = createContext<ShownYearContextValue | null>(null);

export function ShownYearProvider({ children }: { children: ReactNode }) {
  const [shownYearByWordId, setShownYearByWordId] = useState<ShownYearByWordId>(
    {},
  );
  const value = useMemo(
    () => ({ shownYearByWordId, setShownYearByWordId }),
    [shownYearByWordId],
  );
  return (
    <ShownYearContext.Provider value={value}>{children}</ShownYearContext.Provider>
  );
}

export function useShownYear(): ShownYearContextValue {
  const ctx = useContext(ShownYearContext);
  if (!ctx) {
    throw new Error('useShownYear must be used within ShownYearProvider');
  }
  return ctx;
}
