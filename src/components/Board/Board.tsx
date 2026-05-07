import { type CSSProperties, useRef, useState } from 'react';
import { useNotes } from '../../hooks/useNotes';
import { useDropZone } from '../../hooks/useDropZone';
import { BoardRectProvider } from '../../context/BoardRectContext';
import { StickyNote } from '../StickyNote/StickyNote';
import { TrashZone } from '../TrashZone/TrashZone';
import { NOTE_DEFAULT_WIDTH, NOTE_DEFAULT_HEIGHT, DEFAULT_COLOR, TRASH_ZONE_HEIGHT } from '../../utils/constants';

const boardStyle: CSSProperties = {
  backgroundColor: '#f5f5f4',
  backgroundImage: 'radial-gradient(circle, #d4d4d4 1px, transparent 1px)',
  backgroundSize: '24px 24px',
};

export function Board() {
  const { notes, addNote } = useNotes();
  const { ref: trashRef } = useDropZone();
  const [trashHovered, setTrashHovered] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (e.target !== boardRef.current) return;
    const boardRect = boardRef.current!.getBoundingClientRect();
    const x = e.clientX - boardRect.left - NOTE_DEFAULT_WIDTH / 2;
    const y = e.clientY - boardRect.top - NOTE_DEFAULT_HEIGHT / 2;
    const maxX = boardRect.width - NOTE_DEFAULT_WIDTH;
    const maxY = boardRect.height - TRASH_ZONE_HEIGHT - NOTE_DEFAULT_HEIGHT;
    addNote({
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY)),
      width: NOTE_DEFAULT_WIDTH,
      height: NOTE_DEFAULT_HEIGHT,
      color: DEFAULT_COLOR,
    });
  };

  return (
    <BoardRectProvider value={boardRef}>
      <div
        ref={boardRef}
        className="relative w-full h-full font-sans overflow-hidden"
        style={boardStyle}
        onDoubleClick={handleDoubleClick}
      >
        {notes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <p className="text-gray-400 text-lg font-sans">Double-click to create a note</p>
          </div>
        )}
        {notes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            trashZoneRef={trashRef}
            onTrashHover={setTrashHovered}
          />
        ))}
        <TrashZone ref={trashRef} isHovered={trashHovered} />
      </div>
    </BoardRectProvider>
  );
}
