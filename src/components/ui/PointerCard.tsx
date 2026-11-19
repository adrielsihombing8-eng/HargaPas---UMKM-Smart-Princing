import React, { useCallback, useRef } from 'react';

interface PointerCardProps extends React.HTMLAttributes<HTMLDivElement> {
  lift?: boolean;
  trackPointer?: boolean;
}

export const PointerCard: React.FC<PointerCardProps> = ({
  children,
  className = '',
  lift = false,
  trackPointer = true,
  onPointerMove,
  ...rest
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (trackPointer && ref.current) {
        const rect = ref.current.getBoundingClientRect();
        ref.current.style.setProperty('--px', `${e.clientX - rect.left}px`);
        ref.current.style.setProperty('--py', `${e.clientY - rect.top}px`);
      }
      onPointerMove?.(e);
    },
    [trackPointer, onPointerMove]
  );

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      className={`card-surface ${lift ? 'card-lift' : ''} ${
        trackPointer ? 'pointer-track' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};
