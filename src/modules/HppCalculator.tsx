import React, { useMemo, useState } from 'react';
import { Plus, Trash2, Save, Calculator, MapPin } from 'lucide-react';
import { useHargaPas } from '../store/HargaPasContext';
import { MARKET_PRICE_BENCHMARKS } from '../data/seedData';
import {
  calculateMarginPercent,
  calculateMarkupPercent,
  calculateSellingPriceFromMargin,
} from '../utils/finance';
import { formatIDR, formatPercent } from '../utils/format';
import { PointerCard } from '../components/ui/PointerCard';
import { PressButton } from '../components/ui/PressButton';
import { BomItem } from '../types/hargapas';

interface BatchIngredientRow {
  ingredientId: string;
  batchQty: number;
}

export const HppCalculator: React.FC = () => {
  const { ingredients, settings, addProduct } = useHargaPas();

  const [productName, setProductName] = useState('Matcha Latte Signature');
  const [category, setCategory] = useState('Minuman Kekinian');
  const [batchSize, setBatchSize] = useState<number>(100);
  const [rows, setRows] = useState<BatchIngredientRow[]>([
    { ingredientId: ingredients[1]?.id ?? '', batchQty: 15 }, // 15 liter Susu UHT untuk 100 porsi
    { ingredientId: ingredients[2]?.id ?? '', batchQty: 2.5 }, // 2.5 kg Gula Pasir
    { ingredientId: ingredients[3]?.id ?? '', batchQty: 100 }, // 100 pcs Gelas Plastik
    { ingredientId: ingredients[5]?.id ?? '', batchQty: 12 }, // 12 kg Es Batu
  ]);

  const [laborBatchCost, setLaborBatchCost] = useState<number>(75_000);
  const [electricityGasCost, setElectricityGasCost] = useState<number>(35_000);
  const [packagingExtraCost, setPackagingExtraCost] = useState<number>(25_000);
  const [rentAllocationCost, setRentAllocationCost] = useState<number>(40_000);
  const [targetMargin, setTargetMargin] = useState<number>(35);
  const [selectedRegion, setSelectedRegion] = useState(settings.region);

  const calc = useMemo(() => {
    const safeBatch = Math.max(1, batchSize);
    const totalMaterialCost = rows.reduce((sum, r) => {
      const ing = ingredients.find((i) => i.id === r.ingredientId);
      if (!ing) return sum;
      return sum + ing.pricePerUnit * r.batchQty;
    }, 0);

    const totalOverhead = electricityGasCost + packagingExtraCost + rentAllocationCost;
    const totalBatchCost = totalMaterialCost + laborBatchCost + totalOverhead;
    const hppPerUnit = totalBatchCost / safeBatch;

    const recommendedPrice = calculateSellingPriceFromMargin(hppPerUnit, targetMargin);
    const roundedPrice = Math.ceil(recommendedPrice / 500) * 500;
    const actualMargin = calculateMarginPercent(roundedPrice, hppPerUnit);
    const actualMarkup = calculateMarkupPercent(roundedPrice, hppPerUnit);
    const profitPerUnit = roundedPrice - hppPerUnit;

    return {
      totalMaterialCost,
      totalOverhead,
      totalBatchCost,
      hppPerUnit,
      recommendedPrice,
      roundedPrice,
      actualMargin,
      actualMarkup,
      profitPerUnit,
    };
  }, [
    batchSize,
    rows,
    ingredients,
    laborBatchCost,
    electricityGasCost,
    packagingExtraCost,
    rentAllocationCost,
    targetMargin,
  ]);

  const regionBenchmark =
    MARKET_PRICE_BENCHMARKS.find((b) => b.region === selectedRegion) ??
    MARKET_PRICE_BENCHMARKS[0];

  const handleAddRow = () => {
    if (ingredients.length === 0) return;
    setRows((prev) => [...prev, { ingredientId: ingredients[0].id, batchQty: 1 }]);
  };

  const handleRemoveRow = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveToCatalog = () => {
    if (!productName.trim()) return;
    const safeBatch = Math.max(1, batchSize);
    const bom: BomItem[] = rows
      .filter((r) => r.ingredientId && r.batchQty > 0)
      .map((r) => ({
        ingredientId: r.ingredientId,
        qtyPerUnit: Number((r.batchQty / safeBatch).toFixed(4)),
      }));

    addProduct({
      name: productName.trim(),
      category: category.trim() || 'Umum',
      sellingPrice: calc.roundedPrice,
      laborCostPerUnit: Math.round(laborBatchCost / safeBatch),
      overheadCostPerUnit: Math.round(calc.totalOverhead / safeBatch),
      isActive: true,
      bom,
    });
  };

  const marketPositionText =
    calc.roundedPrice < regionBenchmark.minPrice
      ? 'Di bawah rata-rata pasar (sangat kompetitif)'
      : calc.roundedPrice <= regionBenchmark.maxPrice
      ? 'Masuk rentang wajar pasar wilayah ini'
      : 'Di atas rata-rata pasar (segmen premium)';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kalkulator HPP & Penetapan Harga</h1>
          <p className="text-sm text-[#52605a] dark:text-slate-400 mt-0.5">
            Hitung modal per porsi dari batch produksi yang terhubung langsung ke harga inventaris.
          </p>
        </div>
        <PressButton variant="primary" onClick={handleSaveToCatalog}>
          <Save className="w-4 h-4" />
          Simpan ke Katalog Produk
        </PressButton>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Form Inputs */}
        <div className="xl:col-span-2 space-y-6">
          <PointerCard className="p-6">
            <h2 className="text-base font-bold mb-4">1. Identitas Produk & Skala Batch</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#52605a] dark:text-slate-400 mb-1.5">
                  Nama Produk
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full rounded-2xl border border-[#2c5f4e]/15 dark:border-slate-700 bg-[#f8faf9] dark:bg-slate-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7bdc93]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#52605a] dark:text-slate-400 mb-1.5">
                  Kategori
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-[#2c5f4e]/15 dark:border-slate-700 bg-[#f8faf9] dark:bg-slate-800 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7bdc93]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#52605a] dark:text-slate-400 mb-1.5">
                  Jumlah Batch (Porsi)
                </label>
                <input
                  type="number"
                  min={1}
                  value={batchSize}
                  onChange={(e) => setBatchSize(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-2xl border border-[#2c5f4e]/15 dark:border-slate-700 bg-[#f8faf9] dark:bg-slate-800 px-3.5 py-2.5 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-[#7bdc93]"
                />
              </div>
            </div>
          </PointerCard>

          <PointerCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold">2. Biaya Bahan Baku (per {batchSize} porsi)</h2>
                <p className="text-xs text-[#52605a] dark:text-slate-400">
                  Harga satuan diambil otomatis dari Inventaris Bahan Baku.
                </p>
              </div>
              <PressButton variant="secondary" size="sm" onClick={handleAddRow}>
                <Plus className="w-3.5 h-3.5" />
                Tambah Bahan
              </PressButton>
            </div>

            <div className="space-y-3">
              {rows.map((row, idx) => {
                const ing = ingredients.find((i) => i.id === row.ingredientId);
                const subtotal = ing ? ing.pricePerUnit * row.batchQty : 0;
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2.5 items-center bg-[#f8faf9] dark:bg-slate-800/70 p-3 rounded-2xl"
                  >
                    <div className="col-span-12 sm:col-span-5">
                      <select
                        value={row.ingredientId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRows((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, ingredientId: val } : r))
                          );
                        }}
                        className="w-full rounded-xl border border-[#2c5f4e]/15 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                      >
                        {ingredients.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({formatIDR(item.pricePerUnit)}/{item.unit})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-6 sm:col-span-3 flex items-center gap-1.5">
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={row.batchQty}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value));
                          setRows((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, batchQty: val } : r))
                          );
                        }}
                        className="w-full rounded-xl border border-[#2c5f4e]/15 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm tabular-nums"
                      />
                      <span className="text-xs text-[#52605a] dark:text-slate-400 w-10">
                        {ing?.unit ?? ''}
                      </span>
                    </div>
                    <div className="col-span-4 sm:col-span-3 text-right text-sm font-semibold tabular-nums">
                      {formatIDR(subtotal)}
                    </div>
                    <div className="col-span-2 sm:col-span-1 flex justify-end">
                      <button
                        onClick={() => handleRemoveRow(idx)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 btn-press cursor-pointer"
                        aria-label="Hapus baris"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </PointerCard>

          <PointerCard className="p-6">
            <h2 className="text-base font-bold mb-4">
              3. Tenaga Kerja & Biaya Operasional (per Batch)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#52605a] dark:text-slate-400 mb-1.5">
                  Tenaga Kerja Produksi (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={laborBatchCost}
                  onChange={(e) => setLaborBatchCost(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-2xl border border-[#2c5f4e]/15 dark:border-slate-700 bg-[#f8faf9] dark:bg-slate-800 px-3.5 py-2.5 text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#52605a] dark:text-slate-400 mb-1.5">
                  Listrik, Gas & Air (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={electricityGasCost}
                  onChange={(e) => setElectricityGasCost(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-2xl border border-[#2c5f4e]/15 dark:border-slate-700 bg-[#f8faf9] dark:bg-slate-800 px-3.5 py-2.5 text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#52605a] dark:text-slate-400 mb-1.5">
                  Kemasan Tambahan / Sedotan / Kantong (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={packagingExtraCost}
                  onChange={(e) => setPackagingExtraCost(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-2xl border border-[#2c5f4e]/15 dark:border-slate-700 bg-[#f8faf9] dark:bg-slate-800 px-3.5 py-2.5 text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#52605a] dark:text-slate-400 mb-1.5">
                  Alokasi Sewa Tempat (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={rentAllocationCost}
                  onChange={(e) => setRentAllocationCost(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-2xl border border-[#2c5f4e]/15 dark:border-slate-700 bg-[#f8faf9] dark:bg-slate-800 px-3.5 py-2.5 text-sm tabular-nums"
                />
              </div>
            </div>
          </PointerCard>
        </div>

        {/* Right: Summary & Market Comparison */}
        <div className="space-y-6">
          <PointerCard className="p-6 bg-[#2c5f4e] text-white border-none">
            <div className="flex items-center gap-2 text-[#7bdc93] text-xs font-semibold">
              <Calculator className="w-4 h-4" />
              HASIL KALKULASI HPP
            </div>
            <div className="mt-3 text-3xl font-extrabold tabular-nums">
              {formatIDR(calc.hppPerUnit)}
              <span className="text-xs font-normal text-white/75 ml-1">/ porsi</span>
            </div>
            <div className="mt-4 space-y-2 text-xs text-white/85 border-t border-white/15 pt-4">
              <div className="flex justify-between">
                <span>Total Bahan Baku</span>
                <span className="font-semibold tabular-nums">{formatIDR(calc.totalMaterialCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tenaga Kerja + Operasional</span>
                <span className="font-semibold tabular-nums">
                  {formatIDR(laborBatchCost + calc.totalOverhead)}
                </span>
              </div>
              <div className="flex justify-between text-[#7bdc93] font-semibold pt-1 border-t border-white/10">
                <span>Total Biaya Batch ({batchSize} porsi)</span>
                <span className="tabular-nums">{formatIDR(calc.totalBatchCost)}</span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-white/15">
              <div className="flex items-center justify-between text-xs mb-2">
                <span>Target Margin Laba (%)</span>
                <span className="font-bold text-[#7bdc93] tabular-nums">{targetMargin}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={75}
                value={targetMargin}
                onChange={(e) => setTargetMargin(Number(e.target.value))}
                className="w-full mint-slider"
              />
              <div className="mt-4 rounded-2xl bg-[#3a6b5a] p-4">
                <div className="text-xs text-white/75">Rekomendasi Harga Jual (dibulatkan)</div>
                <div className="text-2xl font-extrabold text-[#7bdc93] tabular-nums mt-1">
                  {formatIDR(calc.roundedPrice)}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10 text-xs">
                  <div>
                    <div className="text-white/65">Margin Aktual</div>
                    <div className="font-bold tabular-nums">{formatPercent(calc.actualMargin)}</div>
                  </div>
                  <div>
                    <div className="text-white/65">Markup dari HPP</div>
                    <div className="font-bold tabular-nums">{formatPercent(calc.actualMarkup)}</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-white/80">
                  Laba bersih per porsi:{' '}
                  <strong className="text-[#7bdc93] tabular-nums">
                    {formatIDR(calc.profitPerUnit)}
                  </strong>
                </div>
              </div>
            </div>
          </PointerCard>

          <PointerCard className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2c5f4e] dark:text-[#7bdc93]" />
                <h3 className="text-sm font-bold">Benchmark Harga Pasar</h3>
              </div>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value as typeof selectedRegion)}
                className="rounded-xl border border-[#2c5f4e]/15 dark:border-slate-700 bg-[#f8faf9] dark:bg-slate-800 px-2.5 py-1 text-xs"
              >
                {MARKET_PRICE_BENCHMARKS.map((b) => (
                  <option key={b.region} value={b.region}>
                    {b.region}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#52605a] dark:text-slate-400">
                <span>Rentang Pasar {regionBenchmark.region}</span>
                <span className="font-semibold text-[#030213] dark:text-white tabular-nums">
                  {formatIDR(regionBenchmark.minPrice)} – {formatIDR(regionBenchmark.maxPrice)}
                </span>
              </div>
              <div className="flex justify-between text-[#52605a] dark:text-slate-400">
                <span>Median Harga</span>
                <span className="font-semibold text-[#030213] dark:text-white tabular-nums">
                  {formatIDR(regionBenchmark.medianPrice)}
                </span>
              </div>
              <div className="mt-3 rounded-2xl bg-[#f8faf9] dark:bg-slate-800 p-3 text-xs font-medium text-[#2c5f4e] dark:text-[#7bdc93]">
                {marketPositionText}
              </div>
            </div>
          </PointerCard>
        </div>
      </div>
    </div>
  );
};
