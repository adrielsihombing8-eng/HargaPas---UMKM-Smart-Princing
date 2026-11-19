import React, { useMemo, useState } from 'react';
import { RotateCcw, TrendingDown, TrendingUp } from 'lucide-react';
import { useHargaPas } from '../store/HargaPasContext';
import {
  calculateMarginPercent,
  calculateProductHpp,
  calculateProductMaterialCost,
} from '../utils/finance';
import { formatIDR, formatPercent } from '../utils/format';
import { PointerCard } from '../components/ui/PointerCard';
import { PressButton } from '../components/ui/PressButton';
import { SensitivityChart, SensitivityPoint } from '../components/charts/SensitivityChart';

export const WhatIfSimulator: React.FC = () => {
  const { products, ingredients } = useHargaPas();
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id ?? '');
  const [monthlyBaseVolume, setMonthlyBaseVolume] = useState<number>(600);

  const [materialDeltaPct, setMaterialDeltaPct] = useState<number>(0);
  const [volumeDeltaPct, setVolumeDeltaPct] = useState<number>(0);
  const [promoDiscountPct, setPromoDiscountPct] = useState<number>(0);

  const product = products.find((p) => p.id === selectedProductId) ?? products[0];

  const sim = useMemo(() => {
    if (!product) return null;

    const baseMaterial = calculateProductMaterialCost(product, ingredients);
    const baseHpp = calculateProductHpp(product, ingredients);
    const basePrice = product.sellingPrice;
    const baseProfit = (basePrice - baseHpp) * monthlyBaseVolume;
    const baseMargin = calculateMarginPercent(basePrice, baseHpp);

    const newMaterial = baseMaterial * (1 + materialDeltaPct / 100);
    const newHpp = newMaterial + product.laborCostPerUnit + product.overheadCostPerUnit;
    const newPrice = basePrice * (1 - promoDiscountPct / 100);
    const newVolume = Math.max(0, Math.round(monthlyBaseVolume * (1 + volumeDeltaPct / 100)));
    const newProfit = (newPrice - newHpp) * newVolume;
    const newMargin = calculateMarginPercent(newPrice, newHpp);

    const deltaProfit = newProfit - baseProfit;
    const deltaProfitPct = baseProfit !== 0 ? (deltaProfit / Math.abs(baseProfit)) * 100 : 0;

    const steps = [-20, -10, -5, 0, 5, 10, 20];
    const sensitivityPoints: SensitivityPoint[] = steps.map((pct) => {
      const testPrice = newPrice * (1 + pct / 100);
      return {
        deltaPercent: pct,
        label: `${pct > 0 ? '+' : ''}${pct}%`,
        projectedProfit: (testPrice - newHpp) * newVolume,
      };
    });

    return {
      baseHpp,
      baseProfit,
      baseMargin,
      newHpp,
      newPrice,
      newVolume,
      newProfit,
      newMargin,
      deltaProfit,
      deltaProfitPct,
      sensitivityPoints,
    };
  }, [product, ingredients, monthlyBaseVolume, materialDeltaPct, volumeDeltaPct, promoDiscountPct]);

  const handleReset = () => {
    setMaterialDeltaPct(0);
    setVolumeDeltaPct(0);
    setPromoDiscountPct(0);
  };

  if (!product || !sim) {
    return (
      <PointerCard className="p-8 text-center text-sm text-[#6B7280] dark:text-[#94A3B8]">
        Tambahkan minimal 1 produk di Katalog Produk untuk menjalankan simulasi What-If.
      </PointerCard>
    );
  }

  const isPositiveDelta = sim.deltaProfit >= 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Simulasi Laba & What-If Analysis</h1>
          <p className="text-sm text-[#6B7280] dark:text-[#94A3B8] mt-0.5">
            Uji skenario kenaikan harga bahan baku, promo diskon, dan perubahan volume penjualan.
          </p>
        </div>
        <PressButton variant="secondary" onClick={handleReset}>
          <RotateCcw className="w-4 h-4" />
          Reset Skenario
        </PressButton>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <PointerCard className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-medium text-[#6B7280] dark:text-[#94A3B8] mb-1.5">
              Pilih Produk
            </label>
            <select
              value={product.id}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-2xl border border-[#E5E7EB] dark:border-[#334155] bg-[#F3F4F6] dark:bg-[#0F172A] px-3.5 py-2.5 text-sm font-medium"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({formatIDR(p.sellingPrice)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B7280] dark:text-[#94A3B8] mb-1.5">
              Volume Penjualan Dasar (porsi/bulan)
            </label>
            <input
              type="number"
              min={10}
              step={50}
              value={monthlyBaseVolume}
              onChange={(e) => setMonthlyBaseVolume(Math.max(1, Number(e.target.value)))}
              className="w-full rounded-2xl border border-[#E5E7EB] dark:border-[#334155] bg-[#F3F4F6] dark:bg-[#0F172A] px-3.5 py-2.5 text-sm tabular-nums"
            />
          </div>

          <div className="pt-2 border-t border-[#E5E7EB] dark:border-[#334155] space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span>Kenaikan/Penurunan Bahan Baku</span>
                <span
                  className={`font-bold tabular-nums ${
                    materialDeltaPct > 0
                      ? 'text-[#DC2626] dark:text-[#F87171]'
                      : materialDeltaPct < 0
                      ? 'text-[#16A34A] dark:text-[#22C55E]'
                      : ''
                  }`}
                >
                  {materialDeltaPct > 0 ? '+' : ''}
                  {materialDeltaPct}%
                </span>
              </div>
              <input
                type="range"
                min={-30}
                max={50}
                value={materialDeltaPct}
                onChange={(e) => setMaterialDeltaPct(Number(e.target.value))}
                className="w-full mint-slider"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span>Perubahan Volume Penjualan</span>
                <span className="font-bold tabular-nums text-[#0D9488] dark:text-[#14B8A6]">
                  {volumeDeltaPct > 0 ? '+' : ''}
                  {volumeDeltaPct}% ({sim.newVolume} porsi)
                </span>
              </div>
              <input
                type="range"
                min={-50}
                max={100}
                value={volumeDeltaPct}
                onChange={(e) => setVolumeDeltaPct(Number(e.target.value))}
                className="w-full mint-slider"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span>Diskon Promo</span>
                <span className="font-bold tabular-nums text-[#0F766E] dark:text-[#5EEAD4]">
                  {promoDiscountPct}% ({formatIDR(sim.newPrice)})
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={promoDiscountPct}
                onChange={(e) => setPromoDiscountPct(Number(e.target.value))}
                className="w-full mint-slider"
              />
            </div>
          </div>
        </PointerCard>

        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PointerCard lift className="p-5">
              <div className="text-xs text-[#6B7280] dark:text-[#94A3B8]">Proyeksi Laba Baru</div>
              <div className="mt-2 text-2xl font-bold tabular-nums">
                {formatIDR(sim.newProfit)}
              </div>
              <div className="mt-1 text-xs text-[#6B7280] dark:text-[#94A3B8] tabular-nums">
                Dasar: {formatIDR(sim.baseProfit)}
              </div>
            </PointerCard>

            <PointerCard lift className="p-5">
              <div className="text-xs text-[#6B7280] dark:text-[#94A3B8]">Delta Laba</div>
              <div
                className={`mt-2 text-2xl font-bold tabular-nums flex items-center gap-1.5 ${
                  isPositiveDelta
                    ? 'text-[#16A34A] dark:text-[#22C55E]'
                    : 'text-[#DC2626] dark:text-[#F87171]'
                }`}
              >
                {isPositiveDelta ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                {isPositiveDelta ? '+' : ''}
                {formatIDR(sim.deltaProfit)}
              </div>
              <div className="mt-1 text-xs text-[#6B7280] dark:text-[#94A3B8] tabular-nums">
                {isPositiveDelta ? '+' : ''}
                {formatPercent(sim.deltaProfitPct)} vs kondisi dasar
              </div>
            </PointerCard>

            <PointerCard lift className="p-5">
              <div className="text-xs text-[#6B7280] dark:text-[#94A3B8]">Margin Baru</div>
              <div className="mt-2 text-2xl font-bold tabular-nums">
                {formatPercent(sim.newMargin)}
              </div>
              <div className="mt-1 text-xs text-[#6B7280] dark:text-[#94A3B8] tabular-nums">
                HPP baru: {formatIDR(sim.newHpp)}/porsi
              </div>
            </PointerCard>
          </div>

          <PointerCard className="p-6">
            <div className="mb-3">
              <h2 className="text-base font-bold">Grafik Sensitivitas Harga Jual</h2>
              <p className="text-xs text-[#6B7280] dark:text-[#94A3B8]">
                Dampak penyesuaian harga jual (-20% s/d +20%) terhadap total laba bulanan pada skenario saat ini.
              </p>
            </div>
            <SensitivityChart
              points={sim.sensitivityPoints}
              baselineProfit={sim.baseProfit}
            />
          </PointerCard>
        </div>
      </div>
    </div>
  );
};
