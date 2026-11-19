import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useHargaPas } from '../../store/HargaPasContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useHargaPas();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-[#CCFBF1] dark:bg-[#1E293B] text-[#0F766E] dark:text-[#99F6E4] px-4 py-3 shadow-xl border border-[#99F6E4] dark:border-[#334155] animate-[fadeIn_180ms_ease-out]">
      <CheckCircle2 className="w-4 h-4 text-[#0D9488] dark:text-[#5EEAD4] shrink-0" />
      <span className="text-sm font-medium">{toastMessage}</span>
    </div>
  );
};
