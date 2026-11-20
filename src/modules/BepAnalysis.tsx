import React, { useMemo, useState } from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import { useHargaPas } from '../store/HargaPasContext';
import { calculateProductHpp } from '../utils/finance';
import { formatIDR, formatPercent } from '../utils/format';
import { PointerCard } from '../components/ui/PointerCard';

export const BepAnalysis: React.FC = () => {
  const { products, ingredients, transactions, cashFlow, settings } = useHargaPas();
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id ?? '');
  const [fixedCost, setFixedCost] = useState<number>(settings.monthlyFixedCost);

  const product = products.find((p) => p.id === selectedProductId) ?? products[0];

  const bep = useMemo(() => {
    if (!product) return null;
    const hpp = calculateProductHpp(product, ingredients);
    const contributionMargin = Math.max(1, product.sellingPrice - hpp);
    const bepUnits = Math.ceil(fixedCost / contributionMargin);
    const bepRupiah = bepUnits * product.sellingPrice;

    const currentRevenue = transactions.reduce((s, t) => s + t.totalRevenue, 0);
    const currentHpp = transactions.reduce((s, t) => s + t.totalHpp, 0);
    const opEx = cashFlow
      .filter((c) => c.type === 'out' && c.category !== 'Pembelian Bahan Baku')
      .reduce((s, c) => s + c.amount, 0);
    const currentNetProfit = currentRevenue - currentHpp - opEx;

    const revProgress = Math.min(
      100,
      (currentRevenue / Math.max(1, settings.monthlyRevenueTarget)) * 100
    );
    const profitProgress = Math.min(
      100,
      Math.max(0, (currentNetProfit / Math.max(1, settings.monthlyProfitTarget)) * 100)
    );

    return {
      hpp,
      contributionMargin,
      bepUnits,
      bepRupiah,
      currentRevenue,
      currentNetProfit,
      revProgress,
      profitProgress,
    };
  }, [product, ingredients, fixedCost, transactions, cashFlow, settings]);

  if (!product || !bep) {
    return (
      <PointerCard className="p-8 text-center text-sm text-[#5A4636] dark:text-[#D5C3B3]">
        Belum ada produk untuk dianalisis BEP-nya.
      </PointerCard>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analisis BEP & Target Finansial</h1>
        <p className="text-sm text-[#5A4636] dark:text-[#D5C3B3] mt-0.5">
          Hitung titik impas (Break-Even Point) dan pantau pencapaian target omzet serta laba bulanan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PointerCard className="p-6 space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2">
            <Target className="w-4 h-4 text-[#C68B59] dark:text-[#C68B59]" />
            Parameter Titik Impas
          </h2>
          <div>
            <label className="block text-xs font-medium text-[#5A4636] dark:text-[#D5C3B3] mb-1.5">
              Pilih Produk Acuan
            </label>
            <select
              value={product.id}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full rounded-2xl border border-[#E2D3C1] dark:border-[#4E372B] bg-[#EFE3D3] dark:bg-[#2B1B14] px-3.5 py-2.5 text-sm"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5A4636] dark:text-[#D5C3B3] mb-1.5">
              Biaya Tetap Bulanan (Sewa, Gaji Tetap, Internet)
            </label>
            <input
              type="number"
              min={0}
              step={100000}
              value={fixedCost}
              onChange={(e) => setFixedCost(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-2xl border border-[#E2D3C1] dark:border-[#4E372B] bg-[#EFE3D3] dark:bg-[#2B1B14] px-3.5 py-2.5 text-sm tabular-nums"
            />
          </div>

          <div className="rounded-2xl bg-[#EFE3D3] dark:bg-[#2B1B14] border border-[#E2D3C1] dark:border-[#4E372B] p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#5A4636] dark:text-[#D5C3B3]">Harga Jual / unit</span>
              <span className="font-semibold tabular-nums">{formatIDR(product.sellingPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5A4636] dark:text-[#D5C3B3]">HPP Variabel / unit</span>
              <span className="font-semibold tabular-nums">{formatIDR(bep.hpp)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#E2D3C1] dark:border-[#4E372B]">
              <span className="font-medium">Margin Kontribusi / unit</span>
              <span className="font-bold text-[#C68B59] dark:text-[#C68B59] tabular-nums">
                {formatIDR(bep.contributionMargin)}
              </span>
            </div>
          </div>
        </PointerCard>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PointerCard lift className="p-6 bg-[#EFE3D3] dark:bg-[#3E2A20] text-[#2B1B14] dark:text-[#FAF6F0] border-[#C68B59] dark:border-[#C68B59]/40">
              <div className="text-xs text-[#A8703F] dark:text-[#C68B59] font-semibold">
                BEP UNIT (BALIK MODAL)
              </div>
              <div className="mt-2 text-3xl font-extrabold tabular-nums text-[#2B1B14] dark:text-[#C68B59]">
                {bep.bepUnits.toLocaleString('id-ID')} Porsi
              </div>
              <p className="mt-2 text-xs text-[#2B1B14]/90 dark:text-[#FAF6F0]">
                Setara sekitar <strong>{Math.ceil(bep.bepUnits / 30)} porsi/hari</strong> untuk menutup
                biaya tetap bulanan.
              </p>
            </PointerCard>

            <PointerCard lift className="p-6">
              <div className="text-xs text-[#5A4636] dark:text-[#D5C3B3] font-semibold">
                BEP RUPIAH (OMZET IMPAS)
              </div>
              <div className="mt-2 text-3xl font-extrabold tabular-nums text-[#C68B59] dark:text-[#C68B59]">
                {formatIDR(bep.bepRupiah)}
              </div>
              <p className="mt-2 text-xs text-[#5A4636] dark:text-[#D5C3B3]">
                Omzet minimum bulanan agar usaha tidak mengalami kerugian.
              </p>
            </PointerCard>
          </div>

          <PointerCard className="p-6 space-y-5">
            <h2 className="text-base font-bold">Progress Target Bulanan</h2>

            <div>
              <div className="flex justify-between text-xs font-medium mb-2">
                <span>Target Omzet Bulanan</span>
                <span className="tabular-nums font-bold">
                  {formatIDR(bep.currentRevenue)} / {formatIDR(settings.monthlyRevenueTarget)} (
                  {formatPercent(bep.revProgress)})
                </span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-[#EFE3D3] dark:bg-[#2B1B14] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#C68B59] dark:bg-[#C68B59] transition-all duration-500"
                  style={{ width: `${bep.revProgress}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-2">
                <span>Target Laba Bersih Bulanan</span>
                <span className="tabular-nums font-bold">
                  {formatIDR(bep.currentNetProfit)} / {formatIDR(settings.monthlyProfitTarget)} (
                  {formatPercent(bep.profitProgress)})
                </span>
              </div>
              <div className="w-full h-3.5 rounded-full bg-[#EFE3D3] dark:bg-[#2B1B14] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#C68B59] dark:bg-[#C68B59] transition-all duration-500"
                  style={{ width: `${bep.profitProgress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#16A34A] dark:text-[#22C55E] pt-1">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                {bep.currentRevenue >= bep.bepRupiah
                  ? 'Selamat! Omzet bulan ini sudah melewati titik impas (BEP).'
                  : `Butuh ${formatIDR(bep.bepRupiah - bep.currentRevenue)} lagi untuk mencapai BEP.`}
              </span>
            </div>
          </PointerCard>
        </div>
      </div>
    </div>
  );
};
