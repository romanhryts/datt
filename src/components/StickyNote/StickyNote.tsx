import { type CSSProperties, useState, useRef, memo } from 'react';
import type { Note } from '../../types/Note';
import { useNotes } from '../../hooks/useNotes';
import { useMoveDrag } from '../../hooks/useMoveDrag';
import { useResizeDrag } from '../../hooks/useResizeDrag';
import { ColorPicker } from '../ColorPicker/ColorPicker';

const textareaStyle: CSSProperties = { color: 'rgba(0,0,0,0.8)' };

function computeRotation(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return (h % 600) / 200; // range approx -3..+3
}

interface StickyNoteProps {
  note: Note;
  trashZoneRef: React.RefObject<HTMLDivElement | null>;
  onTrashHover: (hovering: boolean) => void;
}

export const StickyNote = memo(function StickyNote({ note, trashZoneRef, onTrashHover }: StickyNoteProps) {
  const { updateNote, removeNote, bringToFront } = useNotes();
  const [isEditing, setIsEditing] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);

  const moveDrag = useMoveDrag({
    note,
    noteRef,
    trashZoneRef,
    onTrashHover,
    bringToFront,
    updateNote,
    removeNote,
  });

  const resizeDrag = useResizeDrag({
    note,
    noteRef,
    bringToFront,
    updateNote,
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


  // Stable random rotation seeded from note id — computed once on mount
  const rotation = useRef(computeRotation(note.id)).current;

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
    >
      <div
        className="flex items-center justify-between px-2 py-1 cursor-grab active:cursor-grabbing border-b border-black/10"
        onPointerDown={moveDrag.handlePointerDown}
        onPointerMove={moveDrag.handlePointerMove}
        onPointerUp={moveDrag.handlePointerUp}
        onPointerCancel={moveDrag.handlePointerCancel}
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
        onPointerCancel={resizeDrag.handlePointerCancel}
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
});
