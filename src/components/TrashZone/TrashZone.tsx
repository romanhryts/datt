import { type CSSProperties, forwardRef } from 'react';
import { TRASH_ZONE_HEIGHT } from '../../utils/constants';
import { useDragState } from '../../context/DragStateContext';
import { cn } from '../../utils/cn';

interface TrashZoneProps {
  isHovered: boolean;
}

const containerStyle: CSSProperties = { height: TRASH_ZONE_HEIGHT };

export const TrashZone = forwardRef<HTMLDivElement, TrashZoneProps>(
  function TrashZone({ isHovered }, ref) {
    const { isDraggingAny } = useDragState();

    return (
      <div
        ref={ref}
        style={containerStyle}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-[9999]',
          'flex items-center justify-center gap-2',
          'transition-all duration-200 select-none pointer-events-none',
          isDraggingAny
            ? isHovered
              ? 'bg-red-500/30 backdrop-blur-sm border-t-2 border-red-400'
              : 'bg-black/10 backdrop-blur-sm border-t border-gray-400/40'
            : 'bg-transparent',
        )}
      >
        {isDraggingAny && (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn('transition-colors', isHovered ? 'text-red-600' : 'text-gray-500')}
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            <span
              className={cn('text-sm font-medium transition-colors', isHovered ? 'text-red-600' : 'text-gray-500')}
            >
              {isHovered ? 'Release to delete' : 'Drag here to delete'}
            </span>
          </>
        )}
      </div>
    );
  },
);
