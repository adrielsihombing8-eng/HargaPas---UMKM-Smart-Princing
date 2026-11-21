import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, ShoppingBag } from 'lucide-react';
import { useHargaPas } from '../store/HargaPasContext';
import { calculateProductHpp } from '../utils/finance';
import { formatIDR, formatShortDate } from '../utils/format';
import { PointerCard } from '../components/ui/PointerCard';
import { PressButton } from '../components/ui/PressButton';
import { SaleTransaction } from '../types/hargapas';

export const PosCashier: React.FC = () => {
  const { products, ingredients, cashFlow, recordSale, addCashFlow } = useHargaPas();

  const [selectedProdId, setSelectedProdId] = useState<string>(products[0]?.id ?? '');
  const [qty, setQty] = useState<number>(1);
  const [channel, setChannel] = useState<SaleTransaction['channel']>('Offline');

  const [cfType, setCfType] = useState<'in' | 'out'>('out');
  const [cfCategory, setCfCategory] = useState('Operasional');
  const [cfDesc, setCfDesc] = useState('');
  const [cfAmount, setCfAmount] = useState<number>(50_000);

  const selectedProd = products.find((p) => p.id === selectedProdId) ?? products[0];
  const unitHpp = selectedProd ? calculateProductHpp(selectedProd, ingredients) : 0;

  const handleRecordSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProd) return;
    recordSale({
      productId: selectedProd.id,
      qty: Math.max(1, qty),
      channel,
    });
    setQty(1);
  };

  const handleRecordCash = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cfDesc.trim() || cfAmount <= 0) return;
    addCashFlow({
      date: new Date().toISOString().slice(0, 10),
      type: cfType,
      category: cfCategory,
      description: cfDesc.trim(),
      amount: cfAmount,
    });
    setCfDesc('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kas & POS Sederhana</h1>
        <p className="text-sm text-[#5A4636] dark:text-[#D5C3B3] mt-0.5">
          Catat penjualan cepat dengan pengurangan stok bahan baku otomatis berdasarkan resep BOM.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PointerCard className="p-6">
          <h2 className="text-base font-bold flex items-center gap-2 mb-4">
            <ShoppingBag className="w-4 h-4 text-[#C68B59] dark:text-[#C68B59]" />
            Catat Penjualan Produk
          </h2>
          {products.length === 0 ? (
            <div className="rounded-2xl bg-[#EFE3D3]/60 dark:bg-[#1B120D] border border-[#E2D3C1] dark:border-[#4E372B] p-6 text-center space-y-1.5">
              <div className="text-sm font-bold text-[#2B1B14] dark:text-[#FAF6F0]">
                Belum Ada Menu Produk
              </div>
              <p className="text-xs text-[#5A4636] dark:text-[#D5C3B3]">
                Tambahkan produk terlebih dahulu di Kalkulator HPP agar dapat mencatat penjualan dan memotong stok bahan otomatis.
              </p>
            </div>
          ) : (
          <form onSubmit={handleRecordSale} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#5A4636] dark:text-[#D5C3B3] mb-1.5">
                Pilih Menu
              </label>
              <select
                value={selectedProd?.id ?? ''}
                onChange={(e) => setSelectedProdId(e.target.value)}
                className="w-full rounded-2xl border border-[#E5E7EB] dark:border-[#4E372B] bg-[#F3F4F6] dark:bg-[#2B1B14] px-3.5 py-2.5 text-sm font-medium"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatIDR(p.sellingPrice)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#5A4636] dark:text-[#D5C3B3] mb-1.5">
                  Jumlah (Porsi)
                </label>
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-2xl border border-[#E5E7EB] dark:border-[#4E372B] bg-[#F3F4F6] dark:bg-[#2B1B14] px-3.5 py-2.5 text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5A4636] dark:text-[#D5C3B3] mb-1.5">
                  Kanal Penjualan
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as SaleTransaction['channel'])}
                  className="w-full rounded-2xl border border-[#E5E7EB] dark:border-[#4E372B] bg-[#F3F4F6] dark:bg-[#2B1B14] px-3.5 py-2.5 text-sm"
                >
                  <option value="Offline">Offline / Kasir</option>
                  <option value="GoFood">GoFood</option>
                  <option value="GrabFood">GrabFood</option>
                  <option value="ShopeeFood">ShopeeFood</option>
                  <option value="TikTok Shop">TikTok Shop</option>
                </select>
              </div>
            </div>

            {selectedProd && (
              <div className="rounded-2xl bg-[#F3F4F6] dark:bg-[#2B1B14] border border-transparent dark:border-[#4E372B] p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[#5A4636] dark:text-[#D5C3B3]">Total Tagihan</div>
                  <div className="text-xl font-extrabold text-[#C68B59] dark:text-[#C68B59] tabular-nums mt-0.5">
                    {formatIDR(selectedProd.sellingPrice * qty)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[#5A4636] dark:text-[#D5C3B3]">Estimasi Laba Kotor</div>
                  <div className="font-bold text-[#16A34A] dark:text-[#22C55E] tabular-nums mt-0.5">
                    {formatIDR((selectedProd.sellingPrice - unitHpp) * qty)}
                  </div>
                </div>
              </div>
            )}

            <PressButton type="submit" variant="primary" size="lg" className="w-full">
              Catat Penjualan & Potong Stok
            </PressButton>
          </form>
          )}
        </PointerCard>

        <PointerCard className="p-6">
          <h2 className="text-base font-bold mb-4">Catat Kas Masuk / Keluar</h2>
          <form onSubmit={handleRecordCash} className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#EFE3D3] dark:bg-[#2B1B14] border border-[#E2D3C1] dark:border-[#4E372B]">
              <button
                type="button"
                onClick={() => setCfType('out')}
                className={`py-2 rounded-xl text-xs font-semibold cursor-pointer btn-press ${
                  cfType === 'out'
                    ? 'bg-[#FFE4E6] dark:bg-[#7F1D1D] text-[#BE123C] dark:text-[#FDA4AF] shadow-sm'
                    : 'text-[#5A4636] dark:text-[#D5C3B3]'
                }`}
              >
                Kas Keluar (Beban)
              </button>
              <button
                type="button"
                onClick={() => setCfType('in')}
                className={`py-2 rounded-xl text-xs font-semibold cursor-pointer btn-press ${
                  cfType === 'in'
                    ? 'bg-[#C68B59] dark:bg-[#C68B59] text-[#A8703F] dark:text-[#2B1B14] shadow-sm'
                    : 'text-[#5A4636] dark:text-[#D5C3B3]'
                }`}
              >
                Kas Masuk (Lainnya)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#5A4636] dark:text-[#D5C3B3] mb-1.5">
                  Kategori
                </label>
                <select
                  value={cfCategory}
                  onChange={(e) => setCfCategory(e.target.value)}
                  className="w-full rounded-2xl border border-[#E5E7EB] dark:border-[#4E372B] bg-[#F3F4F6] dark:bg-[#2B1B14] px-3.5 py-2.5 text-sm"
                >
                  <option value="Operasional">Operasional (Listrik/Gas)</option>
                  <option value="Pembelian Bahan Baku">Pembelian Bahan Baku</option>
                  <option value="Sewa & Tempat">Sewa & Tempat</option>
                  <option value="Promosi & Iklan">Promosi & Iklan</option>
                  <option value="Modal Tambahan">Modal Tambahan</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5A4636] dark:text-[#D5C3B3] mb-1.5">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  min={1000}
                  step={5000}
                  value={cfAmount}
                  onChange={(e) => setCfAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-2xl border border-[#E5E7EB] dark:border-[#4E372B] bg-[#F3F4F6] dark:bg-[#2B1B14] px-3.5 py-2.5 text-sm tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5A4636] dark:text-[#D5C3B3] mb-1.5">
                Keterangan Transaksi
              </label>
              <input
                type="text"
                required
                value={cfDesc}
                onChange={(e) => setCfDesc(e.target.value)}
                placeholder="mis. Beli gas LPG 3kg & sedotan"
                className="w-full rounded-2xl border border-[#E5E7EB] dark:border-[#4E372B] bg-[#F3F4F6] dark:bg-[#2B1B14] px-3.5 py-2.5 text-sm"
              />
            </div>

            <PressButton type="submit" variant="accent" size="lg" className="w-full">
              Simpan Catatan Kas
            </PressButton>
          </form>
        </PointerCard>
      </div>

      <PointerCard className="p-6">
        <h2 className="text-base font-bold mb-4">Riwayat Arus Kas Terbaru</h2>
        <div className="divide-y divide-[#E5E7EB] dark:divide-[#4E372B]">
          {cashFlow.slice(0, 10).map((entry) => (
            <div key={entry.id} className="py-3 flex items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                    entry.type === 'in'
                      ? 'bg-[#DCFCE7] text-[#16A34A] dark:bg-[#14532D] dark:text-[#22C55E]'
                      : 'bg-[#FEE2E2] text-[#DC2626] dark:bg-[#7F1D1D] dark:text-[#F87171]'
                  }`}
                >
                  {entry.type === 'in' ? (
                    <ArrowDownLeft className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="font-semibold">{entry.description}</div>
                  <div className="text-xs text-[#5A4636] dark:text-[#D5C3B3]">
                    {formatShortDate(entry.date)} • {entry.category}
                  </div>
                </div>
              </div>
              <div
                className={`font-bold tabular-nums ${
                  entry.type === 'in'
                    ? 'text-[#16A34A] dark:text-[#22C55E]'
                    : 'text-[#DC2626] dark:text-[#F87171]'
                }`}
              >
                {entry.type === 'in' ? '+' : '-'}
                {formatIDR(entry.amount)}
              </div>
            </div>
          ))}
        </div>
      </PointerCard>
    </div>
  );
};
