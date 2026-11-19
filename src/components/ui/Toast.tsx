import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useHargaPas } from '../../store/HargaPasContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useHargaPas();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-[#2c5f4e] text-white px-4 py-3 shadow-xl border border-[#7bdc93]/30 animate-[fadeIn_180ms_ease-out]">
      <CheckCircle2 className="w-4 h-4 text-[#7bdc93] shrink-0" />
      <span className="text-sm font-medium">{toastMessage}</span>
    </div>
  );
};
