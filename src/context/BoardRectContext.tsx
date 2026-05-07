import { createContext, useContext, type RefObject } from 'react';

const BoardRectContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

export const BoardRectProvider = BoardRectContext.Provider;

export function useBoardRef(): RefObject<HTMLDivElement | null> {
  const ref = useContext(BoardRectContext);
  if (!ref) throw new Error('useBoardRef must be used within BoardRectProvider');
  return ref;
}
