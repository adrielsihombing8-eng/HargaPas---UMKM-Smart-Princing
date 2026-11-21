import React from 'react';

interface StackedSectionProps {
  id?: string;
  index: number;
  label?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Renders a section that sticks and lands cleanly over the previous block
 * like a uniform deck of cards as the user scrolls down (Caffe Klasik Foam Card theme).
 */
export const StackedSection: React.FC<StackedSectionProps> = ({
  id,
  index,
  children,
  className = '',
}) => {
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
      className={`lg:sticky scroll-mt-24 rounded-[2rem] bg-[#FFFDF9] dark:bg-[#2B1B14] border border-[#E2D3C1] dark:border-[#4E372B] shadow-[0_-8px_24px_-12px_rgba(62,42,32,0.12),0_14px_30px_-14px_rgba(43,27,20,0.1)] dark:shadow-[0_-8px_24px_-10px_rgba(0,0,0,0.45),0_16px_32px_-14px_rgba(0,0,0,0.55)] p-6 sm:p-8 lg:p-10 lg:min-h-[500px] flex flex-col justify-center ${className}`}
    >
      <div className="flex-1 flex flex-col justify-center">{children}</div>
    </section>
  );
};
