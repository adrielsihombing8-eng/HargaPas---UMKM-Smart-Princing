import React, { useCallback, useRef } from 'react';

interface PressButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'mint' | 'accent' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const PressButton: React.FC<PressButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onPointerMove,
  ...rest
}) => {
  const ref = useRef<HTMLButtonElement>(null);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        ref.current.style.setProperty('--px', `${e.clientX - rect.left}px`);
        ref.current.style.setProperty('--py', `${e.clientY - rect.top}px`);
      }
      onPointerMove?.(e);
    },
    [onPointerMove]
  );

  const variantClasses: Record<NonNullable<PressButtonProps['variant']>, string> = {
    primary:
      'bg-[#C68B59] dark:bg-[#C68B59] text-[#FFFDF9] font-semibold hover:bg-[#A8703F] dark:hover:bg-[#A8703F] shadow-sm shadow-[#3E2A20]/15',
    accent:
      'bg-[#EFE3D3] dark:bg-[#3E2A20] text-[#2B1B14] dark:text-[#FAF6F0] font-semibold hover:bg-[#E2D0B8] dark:hover:bg-[#4E372B] shadow-sm shadow-[#3E2A20]/10',
    mint:
      'bg-[#EFE3D3] dark:bg-[#3E2A20] text-[#2B1B14] dark:text-[#FAF6F0] font-semibold hover:bg-[#E2D0B8] dark:hover:bg-[#4E372B] shadow-sm shadow-[#3E2A20]/10',
    secondary:
      'bg-[#FFFDF9] dark:bg-[#2B1B14] text-[#2B1B14] dark:text-[#FAF6F0] border border-[#E2D3C1] dark:border-[#4E372B] hover:bg-[#EFE3D3] dark:hover:bg-[#3E2A20]',
    ghost:
      'bg-transparent text-[#A8703F] dark:text-[#C68B59] hover:bg-[#EFE3D3]/70 dark:hover:bg-[#3E2A20]/70',
    danger:
      'bg-[#FFE4E6] dark:bg-[#7F1D1D] text-[#BE123C] dark:text-[#FDA4AF] font-semibold hover:bg-[#FECDD3] dark:hover:bg-[#991B1B]',
  };

  const sizeClasses: Record<NonNullable<PressButtonProps['size']>, string> = {
    sm: 'px-3 py-1.5 text-xs rounded-xl',
    md: 'px-4 py-2.5 text-sm rounded-2xl',
    lg: 'px-5 py-3 text-sm rounded-2xl',
  };

  return (
    <button
      ref={ref}
      onPointerMove={handlePointerMove}
      className={`btn-press pointer-track inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};
