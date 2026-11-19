import React from 'react';
import { Moon, RotateCcw, Sun } from 'lucide-react';
import { useHargaPas } from '../store/HargaPasContext';
import { BusinessCategory, MarketRegion } from '../types/hargapas';
import { PointerCard } from '../components/ui/PointerCard';
import { PressButton } from '../components/ui/PressButton';

const CATEGORIES: BusinessCategory[] = ['Makanan', 'Minuman', 'Jasa'];
const REGIONS: MarketRegion[] = [
  'Jabodetabek',
  'Bandung',
  'Surabaya',
  'Yogyakarta',
  'Medan',
  'Bali',
];

export const BusinessSettings: React.FC = () => {
  const { settings, updateSettings, resetToSeed, showToast } = useHargaPas();

  const inputClass =
    'w-full rounded-2xl border border-[#E5E7EB] dark:border-[#334155] bg-[#F3F4F6] dark:bg-[#0F172A] px-3.5 py-2.5 text-sm';

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan Usaha</h1>
        <p className="text-sm text-[#6B7280] dark:text-[#94A3B8] mt-0.5">
          Sesuaikan profil UMKM, batas aman margin, dan preferensi tampilan aplikasi.
        </p>
      </div>

      <PointerCard className="p-6 space-y-5">
        <h2 className="text-base font-bold">Profil & Parameter Usaha</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#6B7280] dark:text-[#94A3B8] mb-1.5">
              Nama Usaha
            </label>
            <input
              type="text"
              value={settings.businessName}
              onChange={(e) => updateSettings({ businessName: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B7280] dark:text-[#94A3B8] mb-1.5">
              Kategori Bisnis
            </label>
            <select
              value={settings.category}
              onChange={(e) => updateSettings({ category: e.target.value as BusinessCategory })}
              className={inputClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B7280] dark:text-[#94A3B8] mb-1.5">
              Wilayah Usaha (Benchmark Pasar)
            </label>
            <select
              value={settings.region}
              onChange={(e) => updateSettings({ region: e.target.value as MarketRegion })}
              className={inputClass}
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B7280] dark:text-[#94A3B8] mb-1.5">
              Target Omzet Bulanan (Rp)
            </label>
            <input
              type="number"
              step={500000}
              value={settings.monthlyRevenueTarget}
              onChange={(e) =>
                updateSettings({ monthlyRevenueTarget: Math.max(0, Number(e.target.value)) })
              }
              className={`${inputClass} tabular-nums`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B7280] dark:text-[#94A3B8] mb-1.5">
              Target Laba Bersih Bulanan (Rp)
            </label>
            <input
              type="number"
              step={250000}
              value={settings.monthlyProfitTarget}
              onChange={(e) =>
                updateSettings({ monthlyProfitTarget: Math.max(0, Number(e.target.value)) })
              }
              className={`${inputClass} tabular-nums`}
            />
          </div>
        </div>

        <div className="pt-2">
          <div className="flex justify-between text-xs font-medium mb-2">
            <span>Ambang Batas Toleransi Margin Aman (%)</span>
            <span className="font-bold text-[#0D9488] dark:text-[#14B8A6] tabular-nums">
              {settings.marginThreshold}%
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={60}
            value={settings.marginThreshold}
            onChange={(e) => updateSettings({ marginThreshold: Number(e.target.value) })}
            className="w-full mint-slider"
          />
          <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] mt-1.5">
            Produk dengan margin di bawah nilai ini akan memicu Peringatan Cerdas di Dashboard.
          </p>
        </div>

        <div className="pt-2 flex justify-end">
          <PressButton
            variant="primary"
            onClick={() => showToast('Pengaturan usaha tersimpan otomatis di penyimpanan lokal')}
          >
            Simpan Pengaturan
          </PressButton>
        </div>
      </PointerCard>

      <PointerCard className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold">Mode Tampilan & Data Lokal</h3>
          <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] mt-0.5">
            Ganti tema terang/gelap atau kembalikan data dummy ke kondisi awal.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
          <PressButton
            variant="secondary"
            onClick={() => updateSettings({ darkMode: !settings.darkMode })}
          >
            {settings.darkMode ? <Sun className="w-4 h-4 text-[#FDE68A]" /> : <Moon className="w-4 h-4" />}
            {settings.darkMode ? 'Mode Terang' : 'Mode Gelap'}
          </PressButton>
          <PressButton variant="danger" onClick={resetToSeed}>
            <RotateCcw className="w-4 h-4" />
            Reset Data Dummy
          </PressButton>
        </div>
      </PointerCard>
    </div>
  );
};
