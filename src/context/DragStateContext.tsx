import { createContext, useState, useContext, useCallback, type ReactNode } from 'react';

interface DragStateContextValue {
  isDraggingAny: boolean;
  setDraggingAny: (v: boolean) => void;
}

const DragStateContext = createContext<DragStateContextValue | null>(null);

export function DragStateProvider({ children }: { children: ReactNode }) {
  const [isDraggingAny, setIsDragging] = useState(false);
  const setDraggingAny = useCallback((v: boolean) => setIsDragging(v), []);

  return (
    <DragStateContext.Provider value={{ isDraggingAny, setDraggingAny }}>
      {children}
    </DragStateContext.Provider>
  );
}

export function useDragState(): DragStateContextValue {
  const ctx = useContext(DragStateContext);
  if (!ctx) throw new Error('useDragState must be used within DragStateProvider');
  return ctx;
}
