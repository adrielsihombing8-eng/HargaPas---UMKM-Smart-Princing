import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useHargaPas } from '../../store/HargaPasContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useHargaPas();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-[#EFE3D3] dark:bg-[#2B1B14] text-[#2B1B14] dark:text-[#FAF6F0] px-4 py-3 shadow-xl border border-[#C68B59] dark:border-[#4E372B] animate-[fadeIn_180ms_ease-out]">
      <CheckCircle2 className="w-4 h-4 text-[#A8703F] dark:text-[#C68B59] shrink-0" />
      <span className="text-sm font-medium">{toastMessage}</span>
    </div>
  );
};
