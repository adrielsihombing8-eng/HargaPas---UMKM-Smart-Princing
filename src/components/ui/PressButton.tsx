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
      'bg-[#5EEAD4] dark:bg-[#14B8A6] text-[#0F172A] font-semibold hover:bg-[#2DD4BF] dark:hover:bg-[#2DD4BF] shadow-sm shadow-[#0D9488]/15',
    accent:
      'bg-[#CCFBF1] dark:bg-[#5EEAD4] text-[#0F766E] dark:text-[#0F172A] font-semibold hover:bg-[#99F6E4] dark:hover:bg-[#99F6E4] shadow-sm shadow-[#0D9488]/10',
    mint:
      'bg-[#CCFBF1] dark:bg-[#5EEAD4] text-[#0F766E] dark:text-[#0F172A] font-semibold hover:bg-[#99F6E4] dark:hover:bg-[#99F6E4] shadow-sm shadow-[#0D9488]/10',
    secondary:
      'bg-[#E3F3F0] dark:bg-[#1E293B] text-[#134E4A] dark:text-[#CBD5E1] border border-[#CCE5DF] dark:border-[#334155] hover:bg-[#CCFBF1] dark:hover:bg-[#334155]',
    ghost:
      'bg-transparent text-[#0D9488] dark:text-[#5EEAD4] hover:bg-[#CCFBF1]/70 dark:hover:bg-[#115E59]/70',
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
