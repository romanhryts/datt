import type { Note, NoteUpdate } from '../types/Note';
import { STORAGE_KEY, API_LATENCY_MS } from '../utils/constants';

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), API_LATENCY_MS));
}

function readStore(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Note[]) : [];
  } catch {
    return [];
  }
}

function writeStore(notes: Note[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export async function fetchNotes(): Promise<Note[]> {
  return delay(readStore());
}

export async function createNote(note: Note): Promise<Note> {
  const notes = readStore();
  notes.push(note);
  writeStore(notes);
  return delay(note);
}

export async function updateNote(data: NoteUpdate): Promise<Note> {
  const notes = readStore();
  const idx = notes.findIndex((n) => n.id === data.id);
  if (idx === -1) throw new Error(`Note ${data.id} not found`);
  const updated: Note = { ...notes[idx], ...data, updatedAt: Date.now() };
  notes[idx] = updated;
  writeStore(notes);
  return delay(updated);
}

export async function deleteNote(id: string): Promise<void> {
  const notes = readStore().filter((n) => n.id !== id);
  writeStore(notes);
  return delay(undefined);
}
