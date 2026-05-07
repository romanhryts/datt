import {
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { Note, NoteCreate, NoteUpdate } from '../types/Note';
import * as api from '../api/notesApi';
import { Z_INDEX_BASE, DEFAULT_COLOR, NOTE_DEFAULT_WIDTH, NOTE_DEFAULT_HEIGHT } from '../utils/constants';
import { NotesContext } from './notesContextValue';


type Action =
  | { type: 'SET_ALL'; payload: Note[] }
  | { type: 'ADD'; payload: Note }
  | { type: 'UPDATE'; payload: NoteUpdate }
  | { type: 'REMOVE'; payload: string }
  | { type: 'BRING_TO_FRONT'; payload: string };

function notesReducer(state: Note[], action: Action): Note[] {
  switch (action.type) {
    case 'SET_ALL':
      return action.payload;
    case 'ADD':
      return [...state, action.payload];
    case 'UPDATE':
      return state.map((n) =>
        n.id === action.payload.id ? { ...n, ...action.payload, updatedAt: Date.now() } : n,
      );
    case 'REMOVE':
      return state.filter((n) => n.id !== action.payload);
    case 'BRING_TO_FRONT': {
      const target = state.find((n) => n.id === action.payload);
      if (!target) return state;
      const maxZ = state.reduce((m, n) => Math.max(m, n.zIndex), Z_INDEX_BASE);
      // Already on top — no-op (preserve referential identity)
      if (target.zIndex === maxZ) return state;
      // Normalize: reassign sequential z-indices to prevent unbounded growth
      const sorted = [...state].sort((a, b) => a.zIndex - b.zIndex);
      return sorted.map((n, i) => ({
        ...n,
        zIndex: Z_INDEX_BASE + i + (n.id === action.payload ? state.length : 0),
      }));
    }
    default:
      return state;
  }
}

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, dispatch] = useReducer(notesReducer, []);

  useEffect(() => {
    api.fetchNotes().then((loaded) => dispatch({ type: 'SET_ALL', payload: loaded }));
  }, []);

  const addNote = useCallback(
    (data: NoteCreate) => {
      const maxZ = notes.reduce((m, n) => Math.max(m, n.zIndex), Z_INDEX_BASE);
      const now = Date.now();
      const note: Note = {
        id: crypto.randomUUID(),
        x: data.x,
        y: data.y,
        width: data.width ?? NOTE_DEFAULT_WIDTH,
        height: data.height ?? NOTE_DEFAULT_HEIGHT,
        text: '',
        color: data.color ?? DEFAULT_COLOR,
        zIndex: maxZ + 1,
        createdAt: now,
        updatedAt: now,
      };
      dispatch({ type: 'ADD', payload: note });
      api.createNote(note);
    },
    [notes],
  );

  const updateNote = useCallback((data: NoteUpdate) => {
    dispatch({ type: 'UPDATE', payload: data });
    api.updateNote(data);
  }, []);

  const removeNote = useCallback((id: string) => {
    dispatch({ type: 'REMOVE', payload: id });
    api.deleteNote(id);
  }, []);

  const bringToFront = useCallback((id: string) => {
    const target = notes.find((n) => n.id === id);
    if (!target) return;
    const maxZ = notes.reduce((m, n) => Math.max(m, n.zIndex), Z_INDEX_BASE);
    if (target.zIndex === maxZ) return; // already on top
    dispatch({ type: 'BRING_TO_FRONT', payload: id });
    // Persist normalized z-indices for all notes
    const sorted = [...notes].sort((a, b) => a.zIndex - b.zIndex);
    sorted.forEach((n, i) => {
      const newZ = Z_INDEX_BASE + i + (n.id === id ? notes.length : 0);
      if (n.zIndex !== newZ) api.updateNote({ id: n.id, zIndex: newZ });
    });
  }, [notes]);

  return (
    <NotesContext.Provider
      value={{
        notes,
        addNote,
        updateNote,
        removeNote,
        bringToFront,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

