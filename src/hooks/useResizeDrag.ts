import { useRef, useEffect, type RefObject } from 'react';
import type { Note } from '../types/Note';
import { useDrag } from './useDrag';
import { NOTE_MIN_WIDTH, NOTE_MIN_HEIGHT } from '../utils/constants';

interface UseResizeDragOptions {
  note: Note;
  noteRef: RefObject<HTMLDivElement | null>;
  bringToFront: (id: string) => void;
  updateNote: (data: { id: string; width: number; height: number }) => void;
}

export function useResizeDrag({
  note,
  noteRef,
  bringToFront,
  updateNote,
}: UseResizeDragOptions) {
  const dragSize = useRef({ w: note.width, h: note.height });
  const resizeStartSize = useRef({ w: 0, h: 0 });

  // Sync ref when note size changes from outside
  useEffect(() => {
    dragSize.current = { w: note.width, h: note.height };
  }, [note.width, note.height]);

  return useDrag({
    onDragStart: () => {
      resizeStartSize.current = { w: note.width, h: note.height };
      dragSize.current = { w: note.width, h: note.height };
      bringToFront(note.id);
    },
    onDragMove: (dx, dy) => {
      const newW = Math.max(NOTE_MIN_WIDTH, resizeStartSize.current.w + dx);
      const newH = Math.max(NOTE_MIN_HEIGHT, resizeStartSize.current.h + dy);
      dragSize.current = { w: newW, h: newH };
      if (noteRef.current) {
        noteRef.current.style.width = `${newW}px`;
        noteRef.current.style.height = `${newH}px`;
      }
    },
    onDragEnd: () => {
      updateNote({ id: note.id, width: dragSize.current.w, height: dragSize.current.h });
    },
  });
}
