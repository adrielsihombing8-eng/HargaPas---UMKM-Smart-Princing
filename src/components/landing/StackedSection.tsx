import React from 'react';

interface StackedSectionProps {
  id?: string;
  index: number;
  label: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Renders a section that sticks and lands cleanly over the previous block
 * like a uniform deck of cards as the user scrolls down.
 */
export const StackedSection: React.FC<StackedSectionProps> = ({
  id,
  index,
  label,
  children,
  className = '',
}) => {
  // Staggered top offset so stacked card rims peek neatly above each other
  const stickyTopPx = 76 + index * 14;

  return (
    <section
      id={id}
      style={{
        top: `${stickyTopPx}px`,
        zIndex: 10 + index,
        contain: 'layout style paint',
        transform: 'translateZ(0)',
      }}
      className={`lg:sticky scroll-mt-24 rounded-[2rem] bg-[#EFF9F7] dark:bg-[#1E293B] border border-[#CCE5DF] dark:border-[#334155] shadow-[0_-8px_24px_-12px_rgba(13,148,136,0.14),0_14px_30px_-14px_rgba(15,118,110,0.1)] dark:shadow-[0_-8px_24px_-10px_rgba(0,0,0,0.4),0_16px_32px_-14px_rgba(0,0,0,0.5)] p-6 sm:p-8 lg:p-9 lg:min-h-[520px] flex flex-col justify-between ${className}`}
    >
      {/* Subtle Card Stack Rim Header */}
      <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-[#CCE5DF]/80 dark:border-[#334155]/80 shrink-0">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-wide text-[#0F766E] dark:text-[#5EEAD4]">
          <span className="w-2 h-2 rounded-full bg-[#0D9488] dark:bg-[#14B8A6]" />
          {label}
        </span>
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#CCFBF1] dark:bg-[#115E59] text-[#0F766E] dark:text-[#99F6E4] tabular-nums">
          0{index + 1}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center">{children}</div>
    </section>
  );
};
