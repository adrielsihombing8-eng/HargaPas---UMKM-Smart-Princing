import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Plus, Trash2, Save, Calculator, MapPin, Pencil } from 'lucide-react';
import { useHargaPas } from '../store/HargaPasContext';
import { MARKET_PRICE_BENCHMARKS } from '../data/seedData';
import {
  calculateMarginPercent,
  calculateMarkupPercent,
  calculateProductHpp,
  calculateSellingPriceFromMargin,
  getMarginStatus,
} from '../utils/finance';
import { formatIDR, formatPercent } from '../utils/format';
import { PointerCard } from '../components/ui/PointerCard';
import { PressButton } from '../components/ui/PressButton';
import { BomItem, Product } from '../types/hargapas';

interface BatchIngredientRow {
  ingredientId: string;
  batchQty: number;
}

interface HppCalculatorProps {
  initialEditProductId?: string | null;
  onClearInitialEdit?: () => void;
}

export const HppCalculator: React.FC<HppCalculatorProps> = ({
  initialEditProductId,
  onClearInitialEdit,
}) => {
  const { ingredients, products, settings, addProduct, updateProduct, deleteProduct, showToast } =
    useHargaPas();

  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productName, setProductName] = useState('Matcha Latte Signature');
  const [category, setCategory] = useState('Minuman Kekinian');
  const [batchSize, setBatchSize] = useState<number>(100);
  const [rows, setRows] = useState<BatchIngredientRow[]>([
    { ingredientId: ingredients[1]?.id ?? '', batchQty: 15 },
    { ingredientId: ingredients[2]?.id ?? '', batchQty: 2.5 },
    { ingredientId: ingredients[3]?.id ?? '', batchQty: 100 },
    { ingredientId: ingredients[5]?.id ?? '', batchQty: 12 },
  ]);

  const [laborBatchCost, setLaborBatchCost] = useState<number>(75_000);
  const [electricityGasCost, setElectricityGasCost] = useState<number>(35_000);
  const [packagingExtraCost, setPackagingExtraCost] = useState<number>(25_000);
  const [rentAllocationCost, setRentAllocationCost] = useState<number>(40_000);
  const [targetMargin, setTargetMargin] = useState<number>(35);
  const [selectedRegion, setSelectedRegion] = useState(settings.region);

  const loadProductIntoForm = useCallback(
    (product: Product) => {
      const defaultBatch = 100;
      const currentHpp = calculateProductHpp(product, ingredients);
      const currentMargin = Math.round(
        calculateMarginPercent(product.sellingPrice, currentHpp)
      );

      setEditingProductId(product.id);
      setProductName(product.name);
      setCategory(product.category);
      setBatchSize(defaultBatch);
      setRows(
        product.bom.map((b) => ({
          ingredientId: b.ingredientId,
          batchQty: Number((b.qtyPerUnit * defaultBatch).toFixed(4)),
        }))
      );
      setLaborBatchCost(Math.round(product.laborCostPerUnit * defaultBatch));
      setElectricityGasCost(Math.round(product.overheadCostPerUnit * defaultBatch));
      setPackagingExtraCost(0);
      setRentAllocationCost(0);
      setTargetMargin(Math.min(75, Math.max(10, currentMargin)));
      setViewMode('form');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [ingredients]
  );

  const openNewCalculator = () => {
    setEditingProductId(null);
    setProductName('Matcha Latte Signature');
    setCategory('Minuman Kekinian');
    setBatchSize(100);
    setRows([
      { ingredientId: ingredients[1]?.id ?? '', batchQty: 15 },
      { ingredientId: ingredients[2]?.id ?? '', batchQty: 2.5 },
      { ingredientId: ingredients[3]?.id ?? '', batchQty: 100 },
      { ingredientId: ingredients[5]?.id ?? '', batchQty: 12 },
    ]);
    setLaborBatchCost(75_000);
    setElectricityGasCost(35_000);
    setPackagingExtraCost(25_000);
    setRentAllocationCost(40_000);
    setTargetMargin(35);
    setViewMode('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const backToList = () => {
    setEditingProductId(null);
    setViewMode('list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!initialEditProductId) return;
    const target = products.find((p) => p.id === initialEditProductId);
    if (target) {
      loadProductIntoForm(target);
    }
    onClearInitialEdit?.();
  }, [initialEditProductId, products, loadProductIntoForm, onClearInitialEdit]);

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
    if (!productName.trim()) {
      showToast('Nama produk wajib diisi terlebih dahulu');
      return;
    }
    const safeBatch = Math.max(1, batchSize);
    const bom: BomItem[] = rows
      .filter((r) => r.ingredientId && r.batchQty > 0)
      .map((r) => ({
        ingredientId: r.ingredientId,
        qtyPerUnit: Number((r.batchQty / safeBatch).toFixed(4)),
      }));

    if (editingProductId) {
      const existing = products.find((p) => p.id === editingProductId);
      updateProduct({
        id: editingProductId,
        name: productName.trim(),
        category: category.trim() || 'Umum',
        sellingPrice: calc.roundedPrice,
        laborCostPerUnit: Math.round(laborBatchCost / safeBatch),
        overheadCostPerUnit: Math.round(calc.totalOverhead / safeBatch),
        isActive: existing?.isActive ?? true,
        bom,
      });
      setEditingProductId(null);
      setViewMode('list');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    addProduct({
      name: productName.trim(),
      category: category.trim() || 'Umum',
      sellingPrice: calc.roundedPrice,
      laborCostPerUnit: Math.round(laborBatchCost / safeBatch),
      overheadCostPerUnit: Math.round(calc.totalOverhead / safeBatch),
      isActive: true,
      bom,
    });
    setViewMode('list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteSaved = (productId: string) => {
    deleteProduct(productId);
    if (editingProductId === productId) {
      setEditingProductId(null);
      setViewMode('list');
    }
  };

  const marketPositionText =
    calc.roundedPrice < regionBenchmark.minPrice
      ? 'Di bawah rata-rata pasar (sangat kompetitif)'
      : calc.roundedPrice <= regionBenchmark.maxPrice
      ? 'Masuk rentang wajar pasar wilayah ini'
      : 'Di atas rata-rata pasar (segmen premium)';

  const inputClass =
    'w-full rounded-2xl border border-[#CCE5DF] dark:border-[#334155] bg-[#E3F3F0] dark:bg-[#0F172A] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9488] dark:focus:ring-[#14B8A6]';

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Kalkulator HPP & Penetapan Harga</h1>
            <p className="text-sm text-[#6B7280] dark:text-[#94A3B8] mt-0.5">
              Kelola produk yang HPP-nya sudah tersimpan atau tambah kalkulator HPP untuk produk baru.
            </p>
          </div>
          <PressButton variant="primary" onClick={openNewCalculator}>
            <Plus className="w-4 h-4" />
            Tambah Kalkulator HPP Baru
          </PressButton>
        </div>

        <PointerCard className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
            <div>
              <h2 className="text-base font-bold">Daftar Produk & HPP Tersimpan</h2>
              <p className="text-xs text-[#6B7280] dark:text-[#94A3B8]">
                Pilih Edit HPP untuk mengubah takaran bahan, tenaga kerja, atau operasional produk yang sudah tersimpan.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#CCFBF1] dark:bg-[#115E59] text-[#0F766E] dark:text-[#99F6E4]">
              {products.length} Produk
            </span>
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl bg-[#E3F3F0] dark:bg-[#0F172A] border border-[#CCE5DF] dark:border-[#334155] p-8 text-center space-y-3">
              <div className="text-sm text-[#6B7280] dark:text-[#94A3B8]">
                Belum ada produk yang dihitung HPP-nya.
              </div>
              <PressButton variant="primary" onClick={openNewCalculator}>
                <Plus className="w-4 h-4" />
                Tambah Kalkulator HPP Baru
              </PressButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.map((prod) => {
                const prodHpp = calculateProductHpp(prod, ingredients);
                const prodMargin = calculateMarginPercent(prod.sellingPrice, prodHpp);
                const status = getMarginStatus(prodMargin, settings.marginThreshold);

                const statusBadge =
                  status === 'aman'
                    ? 'bg-[#DCFCE7] text-[#15803D] dark:bg-[#14532D] dark:text-[#4ADE80]'
                    : status === 'waspada'
                    ? 'bg-[#FEF3C7] text-[#B45309] dark:bg-[#78350F] dark:text-[#FDE68A]'
                    : 'bg-[#FFE4E6] text-[#BE123C] dark:bg-[#7F1D1D] dark:text-[#FDA4AF]';

                return (
                  <div
                    key={prod.id}
                    className="rounded-2xl p-4 border bg-[#E3F3F0] dark:bg-[#0F172A] border-[#CCE5DF] dark:border-[#334155] flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-bold text-sm truncate">{prod.name}</div>
                          <div className="text-[11px] text-[#6B7280] dark:text-[#94A3B8]">
                            {prod.category} • {prod.bom.length} bahan BOM
                          </div>
                        </div>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusBadge}`}
                        >
                          {formatPercent(prodMargin)}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl bg-[#FAF9F6] dark:bg-[#1E293B] px-3 py-2">
                          <div className="text-[10px] text-[#6B7280] dark:text-[#94A3B8]">
                            HPP / porsi
                          </div>
                          <div className="font-bold tabular-nums">{formatIDR(prodHpp)}</div>
                        </div>
                        <div className="rounded-xl bg-[#FAF9F6] dark:bg-[#1E293B] px-3 py-2">
                          <div className="text-[10px] text-[#6B7280] dark:text-[#94A3B8]">
                            Harga Jual
                          </div>
                          <div className="font-bold text-[#0D9488] dark:text-[#5EEAD4] tabular-nums">
                            {formatIDR(prod.sellingPrice)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <PressButton
                        size="sm"
                        variant="primary"
                        className="flex-1"
                        onClick={() => loadProductIntoForm(prod)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit HPP
                      </PressButton>
                      <PressButton
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteSaved(prod.id)}
                        aria-label={`Hapus ${prod.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus
                      </PressButton>
                    </div>
                  </div>
                );
              })}

              {/* Quick Add New Calculator Card */}
              <button
                type="button"
                onClick={openNewCalculator}
                className="btn-press rounded-2xl p-5 border-2 border-dashed border-[#99F6E4] dark:border-[#334155] bg-[#FAF9F6]/60 dark:bg-[#0F172A]/50 hover:bg-[#CCFBF1]/50 dark:hover:bg-[#115E59]/40 flex flex-col items-center justify-center gap-2 text-center cursor-pointer min-h-[168px] transition-colors"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#CCFBF1] dark:bg-[#115E59] text-[#0F766E] dark:text-[#5EEAD4] flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-[#0F766E] dark:text-[#99F6E4]">
                  Tambah Kalkulator HPP Baru
                </div>
                <div className="text-xs text-[#6B7280] dark:text-[#94A3B8]">
                  Hitung HPP & harga jual untuk menu baru
                </div>
              </button>
            </div>
          )}
        </PointerCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {editingProductId ? `Edit HPP: ${productName}` : 'Tambah Kalkulator HPP Baru'}
          </h1>
          <p className="text-sm text-[#6B7280] dark:text-[#94A3B8] mt-0.5">
            Hitung modal per porsi dari batch produksi yang terhubung langsung ke harga inventaris.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <PressButton variant="secondary" onClick={backToList}>
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar
          </PressButton>
          <PressButton variant="primary" onClick={handleSaveToCatalog}>
            <Save className="w-4 h-4" />
            {editingProductId ? 'Perbarui HPP & Produk' : 'Simpan ke Katalog Produk'}
          </PressButton>
        </div>
      </div>

      {editingProductId && (
        <div className="rounded-2xl bg-[#CCFBF1] dark:bg-[#115E59] border border-[#99F6E4] dark:border-[#14B8A6]/40 px-4 py-3 flex items-center justify-between gap-3 text-xs">
          <span className="font-medium text-[#0F766E] dark:text-[#99F6E4]">
            Mode Edit HPP aktif untuk produk: <strong>{productName}</strong> (skala batch 100 porsi).
          </span>
          <button
            onClick={openNewCalculator}
            className="font-semibold underline underline-offset-2 text-[#0F766E] dark:text-[#5EEAD4] cursor-pointer"
          >
            Buat Produk Baru
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <PointerCard className="p-6">
            <h2 className="text-base font-bold mb-4">1. Identitas Produk & Skala Batch</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#6B7280] dark:text-[#94A3B8] mb-1.5">
                  Nama Produk
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] dark:text-[#94A3B8] mb-1.5">
                  Kategori
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] dark:text-[#94A3B8] mb-1.5">
                  Jumlah Batch (Porsi)
                </label>
                <input
                  type="number"
                  min={1}
                  value={batchSize}
                  onChange={(e) => setBatchSize(Math.max(1, Number(e.target.value)))}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
            </div>
          </PointerCard>

          <PointerCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold">2. Biaya Bahan Baku (per {batchSize} porsi)</h2>
                <p className="text-xs text-[#6B7280] dark:text-[#94A3B8]">
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
                    className="grid grid-cols-12 gap-2.5 items-center bg-[#E3F3F0] dark:bg-[#0F172A] border border-[#CCE5DF] dark:border-[#334155] p-3 rounded-2xl"
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
                        className="w-full rounded-xl border border-[#CCE5DF] dark:border-[#334155] bg-[#FAF9F6] dark:bg-[#1E293B] px-3 py-2 text-sm"
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
                        className="w-full rounded-xl border border-[#CCE5DF] dark:border-[#334155] bg-[#FAF9F6] dark:bg-[#1E293B] px-3 py-2 text-sm tabular-nums"
                      />
                      <span className="text-xs text-[#6B7280] dark:text-[#94A3B8] w-10">
                        {ing?.unit ?? ''}
                      </span>
                    </div>
                    <div className="col-span-4 sm:col-span-3 text-right text-sm font-semibold tabular-nums">
                      {formatIDR(subtotal)}
                    </div>
                    <div className="col-span-2 sm:col-span-1 flex justify-end">
                      <button
                        onClick={() => handleRemoveRow(idx)}
                        className="p-2 rounded-xl text-[#DC2626] dark:text-[#F87171] hover:bg-[#FEE2E2] dark:hover:bg-[#7F1D1D]/50 btn-press cursor-pointer"
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
                <label className="block text-xs font-medium text-[#6B7280] dark:text-[#94A3B8] mb-1.5">
                  Tenaga Kerja Produksi (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={laborBatchCost}
                  onChange={(e) => setLaborBatchCost(Math.max(0, Number(e.target.value)))}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] dark:text-[#94A3B8] mb-1.5">
                  Listrik, Gas & Air (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={electricityGasCost}
                  onChange={(e) => setElectricityGasCost(Math.max(0, Number(e.target.value)))}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] dark:text-[#94A3B8] mb-1.5">
                  Kemasan Tambahan / Sedotan / Kantong (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={packagingExtraCost}
                  onChange={(e) => setPackagingExtraCost(Math.max(0, Number(e.target.value)))}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7280] dark:text-[#94A3B8] mb-1.5">
                  Alokasi Sewa Tempat (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={rentAllocationCost}
                  onChange={(e) => setRentAllocationCost(Math.max(0, Number(e.target.value)))}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
            </div>
          </PointerCard>
        </div>

        {/* Right: Summary & Market Comparison */}
        <div className="space-y-6">
          <PointerCard className="p-6 bg-[#CCFBF1] dark:bg-[#115E59] text-[#134E4A] dark:text-[#CBD5E1] border-[#99F6E4] dark:border-[#0D9488]/40">
            <div className="flex items-center gap-2 text-[#0F766E] dark:text-[#99F6E4] text-xs font-semibold">
              <Calculator className="w-4 h-4" />
              HASIL KALKULASI HPP
            </div>
            <div className="mt-3 text-3xl font-extrabold tabular-nums text-[#0F172A] dark:text-[#99F6E4]">
              {formatIDR(calc.hppPerUnit)}
              <span className="text-xs font-normal text-[#0F766E] dark:text-[#CBD5E1]/80 ml-1">/ porsi</span>
            </div>
            <div className="mt-4 space-y-2 text-xs text-[#134E4A] dark:text-[#CBD5E1] border-t border-[#99F6E4] dark:border-[#14B8A6]/30 pt-4">
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
              <div className="flex justify-between text-[#0F766E] dark:text-[#99F6E4] font-semibold pt-1 border-t border-[#99F6E4] dark:border-[#14B8A6]/30">
                <span>Total Biaya Batch ({batchSize} porsi)</span>
                <span className="tabular-nums">{formatIDR(calc.totalBatchCost)}</span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[#99F6E4] dark:border-[#14B8A6]/30">
              <div className="flex items-center justify-between text-xs mb-2">
                <span>Target Margin Laba (%)</span>
                <span className="font-bold text-[#0F766E] dark:text-[#99F6E4] tabular-nums">{targetMargin}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={75}
                value={targetMargin}
                onChange={(e) => setTargetMargin(Number(e.target.value))}
                className="w-full mint-slider"
              />
              <div className="mt-4 rounded-2xl bg-[#99F6E4]/75 dark:bg-[#0F172A]/60 border border-[#5EEAD4]/60 dark:border-[#14B8A6]/30 p-4">
                <div className="text-xs text-[#0F766E] dark:text-[#94A3B8]">Rekomendasi Harga Jual (dibulatkan)</div>
                <div className="text-2xl font-extrabold text-[#0F172A] dark:text-[#5EEAD4] tabular-nums mt-1">
                  {formatIDR(calc.roundedPrice)}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#5EEAD4]/50 dark:border-[#334155] text-xs">
                  <div>
                    <div className="text-[#0F766E] dark:text-[#94A3B8]">Margin Aktual</div>
                    <div className="font-bold tabular-nums">{formatPercent(calc.actualMargin)}</div>
                  </div>
                  <div>
                    <div className="text-[#0F766E] dark:text-[#94A3B8]">Markup dari HPP</div>
                    <div className="font-bold tabular-nums">{formatPercent(calc.actualMarkup)}</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-[#134E4A] dark:text-[#CBD5E1]">
                  Laba bersih per porsi:{' '}
                  <strong className="text-[#0F766E] dark:text-[#99F6E4] tabular-nums">
                    {formatIDR(calc.profitPerUnit)}
                  </strong>
                </div>
              </div>
            </div>
          </PointerCard>

          <PointerCard className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0D9488] dark:text-[#14B8A6]" />
                <h3 className="text-sm font-bold">Benchmark Harga Pasar</h3>
              </div>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value as typeof selectedRegion)}
                className="rounded-xl border border-[#CCE5DF] dark:border-[#334155] bg-[#E3F3F0] dark:bg-[#0F172A] px-2.5 py-1 text-xs"
              >
                {MARKET_PRICE_BENCHMARKS.map((b) => (
                  <option key={b.region} value={b.region}>
                    {b.region}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#6B7280] dark:text-[#94A3B8]">
                <span>Rentang Pasar {regionBenchmark.region}</span>
                <span className="font-semibold text-[#134E4A] dark:text-[#CBD5E1] tabular-nums">
                  {formatIDR(regionBenchmark.minPrice)} – {formatIDR(regionBenchmark.maxPrice)}
                </span>
              </div>
              <div className="flex justify-between text-[#6B7280] dark:text-[#94A3B8]">
                <span>Median Harga</span>
                <span className="font-semibold text-[#134E4A] dark:text-[#CBD5E1] tabular-nums">
                  {formatIDR(regionBenchmark.medianPrice)}
                </span>
              </div>
              <div className="mt-3 rounded-2xl bg-[#CCFBF1] dark:bg-[#115E59] p-3 text-xs font-medium text-[#0F766E] dark:text-[#CBD5E1]">
                {marketPositionText}
              </div>
            </div>
          </PointerCard>
        </div>
      </div>
    </div>
  );
};
