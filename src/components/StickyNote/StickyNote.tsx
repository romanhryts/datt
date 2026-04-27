import { type CSSProperties, useState, useRef, useEffect } from 'react';
import type { Note } from '../../types/Note';
import { useNotes } from '../../hooks/useNotes';
import { useDrag } from '../../hooks/useDrag';
import { ColorPicker } from '../ColorPicker/ColorPicker';
import { clamp } from '../../utils/clamp';
import { NOTE_MIN_WIDTH, NOTE_MIN_HEIGHT, TRASH_ZONE_HEIGHT } from '../../utils/constants';

const textareaStyle: CSSProperties = { color: 'rgba(0,0,0,0.8)' };

interface StickyNoteProps {
  note: Note;
  trashZoneRef: React.RefObject<HTMLDivElement | null>;
  onTrashHover: (hovering: boolean) => void;
}

export function StickyNote({ note, trashZoneRef, onTrashHover }: StickyNoteProps) {
  const { updateNote, removeNote, bringToFront, setDraggingAny } = useNotes();
  const [isEditing, setIsEditing] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);

  // Transient drag state kept in refs for performance
  const dragPos = useRef({ x: note.x, y: note.y });
  const dragSize = useRef({ w: note.width, h: note.height });

  // Sync refs when note changes from outside
  useEffect(() => {
    dragPos.current = { x: note.x, y: note.y };
    dragSize.current = { w: note.width, h: note.height };
  }, [note.x, note.y, note.width, note.height]);

  const checkTrashOverlap = () => {
    const el = noteRef.current;
    const zone = trashZoneRef.current;
    if (!el || !zone) return false;
    const nr = el.getBoundingClientRect();
    const zr = zone.getBoundingClientRect();
    return nr.bottom >= zr.top && nr.right > zr.left && nr.left < zr.right;
  };

  // Move drag 
  const moveStartPos = useRef({ x: 0, y: 0 });

  const moveDrag = useDrag({
    onDragStart: () => {
      moveStartPos.current = { x: note.x, y: note.y };
      dragPos.current = { x: note.x, y: note.y };
      bringToFront(note.id);
      setDraggingAny(true);
    },
    onDragMove: (dx, dy) => {
      const boardW = window.innerWidth;
      const boardH = window.innerHeight - TRASH_ZONE_HEIGHT;
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

  // Resize drag
  const resizeStartSize = useRef({ w: 0, h: 0 });

  const resizeDrag = useDrag({
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

  const handleBodyClick = () => {
    if (!isEditing) {
      setIsEditing(true);
      bringToFront(note.id);
      requestAnimationFrame(() => textRef.current?.focus());
    }
  };

  const handleTextBlur = () => {
    setIsEditing(false);
    const value = textRef.current?.value ?? '';
    if (value !== note.text) {
      updateNote({ id: note.id, text: value });
    }
  };

  const handleColorChange = (color: string) => {
    updateNote({ id: note.id, color });
    setShowColors(false);
  };

  const handleMouseDown = () => {
    bringToFront(note.id);
  };

  // Stable random rotation seeded from note id
  let hash = 0;
  for (let i = 0; i < note.id.length; i++) {
    hash = (hash * 31 + note.id.charCodeAt(i)) | 0;
  }
  const rotation = (hash % 600) / 200; // range approx -3..+3

  const noteStyle: CSSProperties = {
    left: note.x,
    top: note.y,
    width: note.width,
    height: note.height,
    zIndex: note.zIndex,
    backgroundColor: note.color,
    transform: `rotate(${rotation}deg)`,
  };

  const handleColorToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowColors((v) => !v);
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.currentTarget.blur();
    }
  };

  return (
    <div
      ref={noteRef}
      className="note-enter absolute flex flex-col rounded-md shadow-lg select-none"
      style={noteStyle}
      onMouseDown={handleMouseDown}
    >
      <div
        className="flex items-center justify-between px-2 py-1 cursor-grab active:cursor-grabbing border-b border-black/10"
        onPointerDown={moveDrag.handlePointerDown}
        onPointerMove={moveDrag.handlePointerMove}
        onPointerUp={moveDrag.handlePointerUp}
      >
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors text-xs cursor-pointer"
            onClick={handleColorToggle}
            aria-label="Change color"
          >
            🎨
          </button>
          {showColors && (
            <ColorPicker current={note.color} onChange={handleColorChange} />
          )}
        </div>
        <div className="flex-1" />
      </div>

      <div className="flex-1 p-2 overflow-auto cursor-text" onClick={handleBodyClick}>
        {isEditing ? (
          <textarea
            ref={textRef}
            defaultValue={note.text}
            onBlur={handleTextBlur}
            onKeyDown={handleTextareaKeyDown}
            className="w-full h-full resize-none bg-transparent outline-none font-hand text-base leading-snug"
            style={textareaStyle}
          />
        ) : (
          <p className="font-hand text-base leading-snug whitespace-pre-wrap break-words text-black/80">
            {note.text || 'Double-click board to create notes. Click here to edit.'}
          </p>
        )}
      </div>

      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
        onPointerDown={resizeDrag.handlePointerDown}
        onPointerMove={resizeDrag.handlePointerMove}
        onPointerUp={resizeDrag.handlePointerUp}
      >
        <svg
          viewBox="0 0 16 16"
          className="w-full h-full text-black/20"
          fill="currentColor"
        >
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="8" cy="12" r="1.5" />
          <circle cx="12" cy="8" r="1.5" />
        </svg>
      </div>
    </div>
  );
}
