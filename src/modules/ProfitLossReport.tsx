import React, { useMemo } from 'react';
import { FileSpreadsheet, Printer } from 'lucide-react';
import { useHargaPas } from '../store/HargaPasContext';
import { formatIDR, formatPercent } from '../utils/format';
import { PointerCard } from '../components/ui/PointerCard';
import { PressButton } from '../components/ui/PressButton';

export const ProfitLossReport: React.FC = () => {
  const { transactions, cashFlow, settings } = useHargaPas();

  const report = useMemo(() => {
    const omzet = transactions.reduce((s, t) => s + t.totalRevenue, 0);
    const hppTerpakai = transactions.reduce((s, t) => s + t.totalHpp, 0);
    const labaKotor = omzet - hppTerpakai;

    const bebanOperasional = cashFlow
      .filter((c) => c.type === 'out' && c.category !== 'Pembelian Bahan Baku')
      .reduce((s, c) => s + c.amount, 0);

    const labaBersih = labaKotor - bebanOperasional;
    const netMarginPct = omzet > 0 ? (labaBersih / omzet) * 100 : 0;

    const byProduct = new Map<
      string,
      { name: string; qty: number; revenue: number; hpp: number; profit: number }
    >();
    for (const tx of transactions) {
      const curr = byProduct.get(tx.productId) ?? {
        name: tx.productName,
        qty: 0,
        revenue: 0,
        hpp: 0,
        profit: 0,
      };
      curr.qty += tx.qty;
      curr.revenue += tx.totalRevenue;
      curr.hpp += tx.totalHpp;
      curr.profit += tx.profit;
      byProduct.set(tx.productId, curr);
    }

    return {
      omzet,
      hppTerpakai,
      labaKotor,
      bebanOperasional,
      labaBersih,
      netMarginPct,
      productRows: Array.from(byProduct.values()),
    };
  }, [transactions, cashFlow]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Laporan Laba / Rugi Sederhana</h1>
          <p className="text-sm text-[#6B7280] dark:text-[#94A3B8] mt-0.5">
            Rekapitulasi performa keuangan {settings.businessName} periode berjalan.
          </p>
        </div>
        <PressButton variant="secondary" onClick={() => window.print()}>
          <Printer className="w-4 h-4" />
          Cetak Laporan
        </PressButton>
      </div>

      <PointerCard className="p-6 max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#0D9488] dark:text-[#14B8A6] mb-4">
          <FileSpreadsheet className="w-4 h-4" />
          IKHTISAR LABA / RUGI
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2">
            <span className="font-medium">Pendapatan Penjualan (Omzet)</span>
            <span className="font-bold tabular-nums">{formatIDR(report.omzet)}</span>
          </div>
          <div className="flex justify-between py-2 text-[#DC2626] dark:text-[#F87171]">
            <span>Harga Pokok Penjualan (HPP Terpakai)</span>
            <span className="font-semibold tabular-nums">-{formatIDR(report.hppTerpakai)}</span>
          </div>
          <div className="flex justify-between py-3 border-t border-b border-[#CCE5DF] dark:border-[#334155] font-bold">
            <span>Laba Kotor (Gross Profit)</span>
            <span className="tabular-nums text-[#0D9488] dark:text-[#14B8A6]">
              {formatIDR(report.labaKotor)}
            </span>
          </div>
          <div className="flex justify-between py-2 text-[#DC2626] dark:text-[#F87171]">
            <span>Beban Operasional & Sewa</span>
            <span className="font-semibold tabular-nums">
              -{formatIDR(report.bebanOperasional)}
            </span>
          </div>
          <div className="flex justify-between p-4 rounded-2xl bg-[#CCFBF1] dark:bg-[#115E59] text-[#0F766E] dark:text-[#99F6E4] border border-[#99F6E4] dark:border-[#0D9488]/40 font-bold text-base mt-2">
            <span>Laba Bersih (Net Profit)</span>
            <span className="text-[#0F172A] dark:text-[#5EEAD4] tabular-nums">
              {formatIDR(report.labaBersih)} ({formatPercent(report.netMarginPct)})
            </span>
          </div>
        </div>
      </PointerCard>

      <PointerCard className="p-6">
        <h2 className="text-base font-bold mb-4">Kontribusi Laba per Produk</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[#6B7280] dark:text-[#94A3B8] border-b border-[#E5E7EB] dark:border-[#334155]">
                <th className="pb-3 font-medium">Produk</th>
                <th className="pb-3 font-medium text-right">Terjual</th>
                <th className="pb-3 font-medium text-right">Omzet</th>
                <th className="pb-3 font-medium text-right">HPP Terpakai</th>
                <th className="pb-3 font-medium text-right">Laba Kotor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#334155]">
              {report.productRows.map((row) => (
                <tr key={row.name}>
                  <td className="py-3 font-semibold">{row.name}</td>
                  <td className="py-3 text-right tabular-nums">{row.qty} porsi</td>
                  <td className="py-3 text-right tabular-nums">{formatIDR(row.revenue)}</td>
                  <td className="py-3 text-right tabular-nums text-[#6B7280] dark:text-[#94A3B8]">
                    {formatIDR(row.hpp)}
                  </td>
                  <td className="py-3 text-right font-bold tabular-nums text-[#16A34A] dark:text-[#22C55E]">
                    {formatIDR(row.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PointerCard>
    </div>
  );
};
