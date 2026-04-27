import { useRef, useCallback } from 'react';

export function useDropZone() {
  const ref = useRef<HTMLDivElement>(null);

  const isOver = useCallback((noteRect: DOMRect): boolean => {
    const el = ref.current;
    if (!el) return false;
    const zone = el.getBoundingClientRect();
    const noteCenterX = noteRect.left + noteRect.width / 2;
    const noteCenterY = noteRect.top + noteRect.height / 2;
    return (
      noteCenterX >= zone.left &&
      noteCenterX <= zone.right &&
      noteCenterY >= zone.top &&
      noteCenterY <= zone.bottom
    );
  }, []);

  return { ref, isOver };
}
