import { createContext } from 'react';
import type { NoteCreate, NoteUpdate, Note } from '../types/Note';

export interface NotesContextValue {
  notes: Note[];
  addNote: (data: NoteCreate) => void;
  updateNote: (data: NoteUpdate) => void;
  removeNote: (id: string) => void;
  bringToFront: (id: string) => void;
}

export const NotesContext = createContext<NotesContextValue | null>(null);
