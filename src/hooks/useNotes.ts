import { useContext } from 'react';
import { NotesContext, type NotesContextValue } from '../context/notesContextValue';

export function useNotes(): NotesContextValue {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used within NotesProvider');
  return ctx;
}
