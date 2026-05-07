import { useRef, useCallback } from 'react';

interface UseDragOptions {
  onDragStart?: () => void;
  onDragMove: (dx: number, dy: number) => void;
  onDragEnd?: (dx: number, dy: number) => void;
}

export function useDrag(options: UseDragOptions) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const origin = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    origin.current = { x: e.clientX, y: e.clientY };
    isDragging.current = true;
    optionsRef.current.onDragStart?.();
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !origin.current) return;
    const dx = e.clientX - origin.current.x;
    const dy = e.clientY - origin.current.y;
    optionsRef.current.onDragMove(dx, dy);
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current || !origin.current) return;
    isDragging.current = false;
    const dx = e.clientX - origin.current.x;
    const dy = e.clientY - origin.current.y;
    origin.current = null;
    optionsRef.current.onDragEnd?.(dx, dy);
  }, []);

  const handlePointerCancel = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    origin.current = null;
  }, []);

  return { handlePointerDown, handlePointerMove, handlePointerUp, handlePointerCancel };
}
