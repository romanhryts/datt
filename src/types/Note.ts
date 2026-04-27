export interface Note {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
  zIndex: number;
  createdAt: number;
  updatedAt: number;
}

export type NoteCreate = Pick<Note, 'x' | 'y' | 'width' | 'height' | 'color'>;
export type NoteUpdate = Partial<Omit<Note, 'id' | 'createdAt'>> & { id: string };
