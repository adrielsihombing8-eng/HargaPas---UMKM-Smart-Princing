import React, { useState } from 'react';
import { AlertCircle, History, PackagePlus, TrendingUp } from 'lucide-react';
import { useHargaPas } from '../store/HargaPasContext';
import { formatIDR, formatShortDate } from '../utils/format';
import { PointerCard } from '../components/ui/PointerCard';
import { PressButton } from '../components/ui/PressButton';
import { Ingredient } from '../types/hargapas';

export const IngredientInventory: React.FC = () => {
  const { ingredients, updateIngredientPrice, restockIngredient, addIngredient } = useHargaPas();

  const [historyTarget, setHistoryTarget] = useState<Ingredient | null>(null);
  const [priceEditId, setPriceEditId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newIngName, setNewIngName] = useState('');
  const [newIngUnit, setNewIngUnit] = useState<Ingredient['unit']>('kg');
  const [newIngPrice, setNewIngPrice] = useState(25000);
  const [newIngStock, setNewIngStock] = useState(5);
  const [newIngMin, setNewIngMin] = useState(2);
  const [newIngSupplier, setNewIngSupplier] = useState('Supplier Lokal');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngName.trim()) return;
    addIngredient({
      name: newIngName.trim(),
      unit: newIngUnit,
      pricePerUnit: newIngPrice,
      stock: newIngStock,
      minStock: newIngMin,
      supplier: newIngSupplier.trim() || 'Supplier Umum',
    });
    setNewIngName('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventaris Bahan Baku</h1>
          <p className="text-sm text-[#6B7280] dark:text-[#94A3B8] mt-0.5">
            Kelola stok, batas minimum (reorder point), dan riwayat pergerakan harga beli.
          </p>
        </div>
        <PressButton variant="primary" onClick={() => setShowAddForm((v) => !v)}>
          <PackagePlus className="w-4 h-4" />
          {showAddForm ? 'Tutup Form' : 'Tambah Bahan Baku'}
        </PressButton>
      </div>

      {showAddForm && (
        <PointerCard className="p-6">
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1">Nama Bahan</label>
              <input
                type="text"
                required
                value={newIngName}
                onChange={(e) => setNewIngName(e.target.value)}
                placeholder="mis. Sirup Pandan"
                className="w-full rounded-2xl border border-[#E5E7EB] dark:border-[#334155] bg-[#F3F4F6] dark:bg-[#0F172A] px-3.5 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Satuan</label>
              <select
                value={newIngUnit}
                onChange={(e) => setNewIngUnit(e.target.value as Ingredient['unit'])}
                className="w-full rounded-2xl border border-[#E5E7EB] dark:border-[#334155] bg-[#F3F4F6] dark:bg-[#0F172A] px-3 py-2 text-sm"
              >
                <option value="kg">kg</option>
                <option value="liter">liter</option>
                <option value="pcs">pcs</option>
                <option value="gram">gram</option>
                <option value="ml">ml</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Harga / Satuan</label>
              <input
                type="number"
                min={1}
                value={newIngPrice}
                onChange={(e) => setNewIngPrice(Number(e.target.value))}
                className="w-full rounded-2xl border border-[#E5E7EB] dark:border-[#334155] bg-[#F3F4F6] dark:bg-[#0F172A] px-3 py-2 text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Stok Awal / Min</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={newIngStock}
                  onChange={(e) => setNewIngStock(Number(e.target.value))}
                  className="w-1/2 rounded-2xl border border-[#E5E7EB] dark:border-[#334155] bg-[#F3F4F6] dark:bg-[#0F172A] px-2.5 py-2 text-sm tabular-nums"
                />
                <input
                  type="number"
                  step="0.1"
                  value={newIngMin}
                  onChange={(e) => setNewIngMin(Number(e.target.value))}
                  className="w-1/2 rounded-2xl border border-[#E5E7EB] dark:border-[#334155] bg-[#F3F4F6] dark:bg-[#0F172A] px-2.5 py-2 text-sm tabular-nums"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Supplier</label>
              <input
                type="text"
                value={newIngSupplier}
                onChange={(e) => setNewIngSupplier(e.target.value)}
                placeholder="Supplier Lokal"
                className="w-full rounded-2xl border border-[#E5E7EB] dark:border-[#334155] bg-[#F3F4F6] dark:bg-[#0F172A] px-3.5 py-2 text-sm"
              />
            </div>
            <div>
              <PressButton type="submit" variant="accent" className="w-full">
                Simpan Bahan
              </PressButton>
            </div>
          </form>
        </PointerCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ingredients.map((ing) => {
          const isOut = ing.stock <= 0;
          const isLow = ing.stock > 0 && ing.stock <= ing.minStock;
          const prevPrice =
            ing.priceHistory.length >= 2
              ? ing.priceHistory[ing.priceHistory.length - 2].pricePerUnit
              : ing.pricePerUnit;
          const priceDiffPct =
            prevPrice > 0 ? ((ing.pricePerUnit - prevPrice) / prevPrice) * 100 : 0;

          return (
            <PointerCard key={ing.id} lift className="p-5 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-bold text-base">{ing.name}</h2>
                    <div className="text-xs text-[#6B7280] dark:text-[#94A3B8]">
                      {ing.supplier}
                    </div>
                  </div>
                  {isOut ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEE2E2] text-[#DC2626] dark:bg-[#7F1D1D] dark:text-[#F87171]">
                      <AlertCircle className="w-3 h-3" />
                      Stok Habis
                    </span>
                  ) : isLow ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEF3C7] text-[#D97706] dark:bg-[#78350F] dark:text-[#FBBF24]">
                      <AlertCircle className="w-3 h-3" />
                      Stok Menipis
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#DCFCE7] text-[#16A34A] dark:bg-[#14532D] dark:text-[#22C55E]">
                      Stok Aman
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-[#F3F4F6] dark:bg-[#0F172A] border border-transparent dark:border-[#334155] p-3.5">
                  <div>
                    <div className="text-[11px] text-[#6B7280] dark:text-[#94A3B8]">Stok Saat Ini</div>
                    <div className="text-lg font-bold tabular-nums">
                      {ing.stock} <span className="text-xs font-normal">{ing.unit}</span>
                    </div>
                    <div className="text-[11px] text-[#6B7280] dark:text-[#94A3B8]">
                      Min: {ing.minStock} {ing.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#6B7280] dark:text-[#94A3B8]">Harga Beli</div>
                    <div className="text-lg font-bold tabular-nums">
                      {formatIDR(ing.pricePerUnit)}
                    </div>
                    {priceDiffPct !== 0 && (
                      <div
                        className={`text-[11px] font-semibold flex items-center gap-1 ${
                          priceDiffPct > 0
                            ? 'text-[#D97706] dark:text-[#FBBF24]'
                            : 'text-[#16A34A] dark:text-[#22C55E]'
                        }`}
                      >
                        <TrendingUp className="w-3 h-3" />
                        {priceDiffPct > 0 ? '+' : ''}
                        {priceDiffPct.toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {priceEditId === ing.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step={500}
                    value={newPrice}
                    onChange={(e) => setNewPrice(Math.max(0, Number(e.target.value)))}
                    className="flex-1 rounded-xl border border-[#CCE5DF] dark:border-[#334155] px-3 py-1.5 text-sm tabular-nums bg-[#FAF9F6] dark:bg-[#0F172A]"
                  />
                  <PressButton
                    size="sm"
                    variant="accent"
                    onClick={() => {
                      updateIngredientPrice(ing.id, newPrice);
                      setPriceEditId(null);
                    }}
                  >
                    Simpan
                  </PressButton>
                  <PressButton size="sm" variant="ghost" onClick={() => setPriceEditId(null)}>
                    Batal
                  </PressButton>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <PressButton
                    size="sm"
                    variant={isLow || isOut ? 'accent' : 'primary'}
                    onClick={() => restockIngredient(ing.id, ing.unit === 'pcs' ? 100 : 5)}
                  >
                    + Restok ({ing.unit === 'pcs' ? '100' : '5'} {ing.unit})
                  </PressButton>
                  <PressButton
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setPriceEditId(ing.id);
                      setNewPrice(ing.pricePerUnit);
                    }}
                  >
                    Update Harga
                  </PressButton>
                  <PressButton
                    size="sm"
                    variant="ghost"
                    onClick={() => setHistoryTarget(ing)}
                  >
                    <History className="w-3.5 h-3.5" />
                    Riwayat
                  </PressButton>
                </div>
              )}
            </PointerCard>
          );
        })}
      </div>

      {/* Price History Modal */}
      {historyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <PointerCard className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base">Riwayat Harga: {historyTarget.name}</h3>
                <p className="text-xs text-[#6B7280] dark:text-[#94A3B8]">
                  Satuan per {historyTarget.unit}
                </p>
              </div>
              <PressButton size="sm" variant="ghost" onClick={() => setHistoryTarget(null)}>
                Tutup
              </PressButton>
            </div>
            <div className="space-y-2.5 max-h-64 overflow-y-auto">
              {[...historyTarget.priceHistory].reverse().map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between rounded-2xl bg-[#F3F4F6] dark:bg-[#0F172A] border border-transparent dark:border-[#334155] px-3.5 py-2.5 text-xs"
                >
                  <div>
                    <div className="font-semibold">{formatShortDate(h.date)}</div>
                    <div className="text-[#6B7280] dark:text-[#94A3B8]">{h.note}</div>
                  </div>
                  <div className="font-bold tabular-nums text-sm">
                    {formatIDR(h.pricePerUnit)}
                  </div>
                </div>
              ))}
            </div>
          </PointerCard>
        </div>
      )}
    </div>
  );
};
