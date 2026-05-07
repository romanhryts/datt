import { useRef } from 'react';

export function useDropZone() {
  const ref = useRef<HTMLDivElement>(null);
  return { ref };
}
