import { useRef, useEffect, type RefObject } from 'react';
import type { Note } from '../types/Note';
import { useDrag } from './useDrag';
import { useDragState } from '../context/DragStateContext';
import { useBoardRef } from '../context/BoardRectContext';
import { clamp } from '../utils/clamp';
import { TRASH_ZONE_HEIGHT } from '../utils/constants';

interface UseMoveDragOptions {
  note: Note;
  noteRef: RefObject<HTMLDivElement | null>;
  trashZoneRef: RefObject<HTMLDivElement | null>;
  onTrashHover: (hovering: boolean) => void;
  bringToFront: (id: string) => void;
  updateNote: (data: { id: string; x: number; y: number }) => void;
  removeNote: (id: string) => void;
}

export function useMoveDrag({
  note,
  noteRef,
  trashZoneRef,
  onTrashHover,
  bringToFront,
  updateNote,
  removeNote,
}: UseMoveDragOptions) {
  const { setDraggingAny } = useDragState();
  const boardRef = useBoardRef();

  const dragPos = useRef({ x: note.x, y: note.y });
  const moveStartPos = useRef({ x: 0, y: 0 });

  // Sync ref when note position changes from outside
  useEffect(() => {
    dragPos.current = { x: note.x, y: note.y };
  }, [note.x, note.y]);

  const checkTrashOverlap = () => {
    const el = noteRef.current;
    const zone = trashZoneRef.current;
    if (!el || !zone) return false;
    const nr = el.getBoundingClientRect();
    const zr = zone.getBoundingClientRect();
    return nr.bottom >= zr.top && nr.right > zr.left && nr.left < zr.right;
  };

  return useDrag({
    onDragStart: () => {
      moveStartPos.current = { x: note.x, y: note.y };
      dragPos.current = { x: note.x, y: note.y };
      bringToFront(note.id);
      setDraggingAny(true);
    },
    onDragMove: (dx, dy) => {
      const rect = boardRef.current?.getBoundingClientRect();
      const boardW = rect?.width ?? window.innerWidth;
      const boardH = (rect?.height ?? window.innerHeight) - TRASH_ZONE_HEIGHT;
      const newX = clamp(moveStartPos.current.x + dx, 0, boardW - note.width);
      const newY = clamp(moveStartPos.current.y + dy, 0, boardH - note.height);
      dragPos.current = { x: newX, y: newY };
      if (noteRef.current) {
        noteRef.current.style.left = `${newX}px`;
        noteRef.current.style.top = `${newY}px`;
      }
      onTrashHover(checkTrashOverlap());
    },
    onDragEnd: () => {
      setDraggingAny(false);
      onTrashHover(false);
      if (checkTrashOverlap()) {
        removeNote(note.id);
      } else {
        updateNote({ id: note.id, x: dragPos.current.x, y: dragPos.current.y });
      }
    },
  });
}
