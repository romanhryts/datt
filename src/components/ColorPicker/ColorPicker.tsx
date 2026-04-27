import type { CSSProperties } from 'react';
import { NOTE_COLORS } from '../../utils/constants';

interface ColorPickerProps {
  current: string;
  onChange: (color: string) => void;
}

function getSwatchStyle(color: string, isCurrent: boolean): CSSProperties {
  return {
    backgroundColor: color,
    outline: isCurrent ? '2px solid rgba(0,0,0,0.5)' : 'none',
    outlineOffset: '1px',
  };
}

export function ColorPicker({ current, onChange }: ColorPickerProps) {
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  const handleClick = (color: string) => () => {
    onChange(color);
  };

  return (
    <div className="flex gap-1" onPointerDown={handlePointerDown}>
      {NOTE_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          className="w-4 h-4 rounded-full border border-black/20 hover:scale-125 transition-transform cursor-pointer"
          style={getSwatchStyle(c, c === current)}
          onClick={handleClick(c)}
          aria-label={`Color ${c}`}
        />
      ))}
    </div>
  );
}
