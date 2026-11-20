import React, { useState } from 'react';
import { Store } from 'lucide-react';
import { useHargaPas } from '../store/HargaPasContext';
import {
  calculateMarginPercent,
  calculateOnlinePrice,
  calculateProductHpp,
} from '../utils/finance';
import { formatIDR, formatPercent } from '../utils/format';
import { PointerCard } from '../components/ui/PointerCard';

interface ChannelPreset {
  name: string;
  commission: number;
  badgeColor: string;
}

const CHANNELS: ChannelPreset[] = [
  { name: 'GoFood', commission: 20, badgeColor: 'bg-[#EFE3D3] text-[#A8703F] dark:bg-[#3E2A20] dark:text-[#C68B59]' },
  { name: 'GrabFood', commission: 20, badgeColor: 'bg-[#DCFCE7] text-[#16A34A] dark:bg-[#14532D] dark:text-[#4ADE80]' },
  { name: 'ShopeeFood', commission: 20, badgeColor: 'bg-[#FEF3C7] text-[#B45309] dark:bg-[#78350F] dark:text-[#FDE68A]' },
  { name: 'TikTok Shop', commission: 10, badgeColor: 'bg-[#EFE3D3] text-[#2B1B14] dark:bg-[#4E372B] dark:text-[#FAF6F0]' },
];

export const MarketplaceCalculator: React.FC = () => {
  const { products, ingredients } = useHargaPas();
  const [selectedId, setSelectedId] = useState<string>(products[0]?.id ?? '');
  const [extraPromoPct, setExtraPromoPct] = useState<number>(0);

  const product = products.find((p) => p.id === selectedId) ?? products[0];
  const hpp = product ? calculateProductHpp(product, ingredients) : 0;
  const netTarget = product ? product.sellingPrice : 15000;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kalkulator Marketplace & Multi-Kanal</h1>
        <p className="text-sm text-[#5A4636] dark:text-[#D5C3B3] mt-0.5">
          Hitung harga jual online agar laba bersih Anda tidak tergerus komisi platform.
        </p>
      </div>

      <PointerCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-[#5A4636] dark:text-[#D5C3B3] mb-1.5">
              Pilih Produk
            </label>
            <select
              value={product?.id ?? ''}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full rounded-2xl border border-[#E5E7EB] dark:border-[#4E372B] bg-[#F3F4F6] dark:bg-[#2B1B14] px-3.5 py-2.5 text-sm font-medium"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Offline: {formatIDR(p.sellingPrice)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5A4636] dark:text-[#D5C3B3] mb-1.5">
              Target Harga Bersih Diterima (Offline)
            </label>
            <div className="rounded-2xl bg-[#F3F4F6] dark:bg-[#2B1B14] border border-transparent dark:border-[#4E372B] px-4 py-2.5 text-sm font-bold tabular-nums">
              {formatIDR(netTarget)}{' '}
              <span className="text-xs font-normal text-[#5A4636] dark:text-[#D5C3B3]">
                (HPP: {formatIDR(hpp)})
              </span>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-medium mb-1.5">
              <span>Tambahan Subsidi Promo/Voucher</span>
              <span className="font-bold text-[#C68B59] dark:text-[#C68B59] tabular-nums">
                {extraPromoPct}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={15}
              value={extraPromoPct}
              onChange={(e) => setExtraPromoPct(Number(e.target.value))}
              className="w-full mint-slider"
            />
          </div>
        </div>
      </PointerCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {CHANNELS.map((ch) => {
          const totalFeePct = ch.commission + extraPromoPct;
          const rawOnlinePrice = calculateOnlinePrice(netTarget, totalFeePct);
          const roundedOnlinePrice = Math.ceil(rawOnlinePrice / 500) * 500;
          const feeAmount = roundedOnlinePrice * (totalFeePct / 100);
          const netReceived = roundedOnlinePrice - feeAmount;
          const netMargin = calculateMarginPercent(netReceived, hpp);

          return (
            <PointerCard key={ch.name} lift className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ch.badgeColor}`}>
                    {ch.name}
                  </span>
                  <Store className="w-4 h-4 text-[#5A4636] dark:text-[#D5C3B3]" />
                </div>
                <div className="mt-4">
                  <div className="text-xs text-[#5A4636] dark:text-[#D5C3B3]">
                    Rekomendasi Harga di Aplikasi
                  </div>
                  <div className="text-2xl font-extrabold text-[#C68B59] dark:text-[#C68B59] tabular-nums mt-1">
                    {formatIDR(roundedOnlinePrice)}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E5E7EB] dark:border-[#4E372B] space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#5A4636] dark:text-[#D5C3B3]">
                    Potongan ({totalFeePct}%)
                  </span>
                  <span className="text-[#DC2626] dark:text-[#F87171] font-semibold tabular-nums">
                    -{formatIDR(feeAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A4636] dark:text-[#D5C3B3]">Net Diterima</span>
                  <span className="font-bold tabular-nums">{formatIDR(netReceived)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5A4636] dark:text-[#D5C3B3]">Margin Bersih</span>
                  <span className="font-bold text-[#16A34A] dark:text-[#22C55E] tabular-nums">
                    {formatPercent(netMargin)}
                  </span>
                </div>
              </div>
            </PointerCard>
          );
        })}
      </div>
    </div>
  );
};
