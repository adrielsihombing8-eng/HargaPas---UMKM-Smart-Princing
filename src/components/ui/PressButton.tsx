import React, { useCallback, useRef } from 'react';

interface PressButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'mint' | 'secondary' | 'ghost' | 'danger';
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
      'bg-[#2c5f4e] text-white hover:bg-[#234d3f] shadow-sm shadow-[#2c5f4e]/20',
    mint:
      'bg-[#7bdc93] text-[#030213] font-semibold hover:bg-[#6ad284] shadow-sm shadow-[#7bdc93]/25',
    secondary:
      'bg-white dark:bg-slate-800 text-[#030213] dark:text-slate-100 border border-[#2c5f4e]/15 dark:border-slate-700 hover:bg-[#f1f6f3] dark:hover:bg-slate-700',
    ghost:
      'bg-transparent text-[#2c5f4e] dark:text-[#7bdc93] hover:bg-[#2c5f4e]/8 dark:hover:bg-[#7bdc93]/10',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/20',
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
      className={`btn-press pointer-track inline-flex items-center justify-center gap-2 font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};
