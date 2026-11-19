import React, { useMemo } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  PackageCheck,
  TrendingUp,
  Wallet,
  Percent,
  Sparkles,
} from 'lucide-react';
import { useHargaPas } from '../store/HargaPasContext';
import {
  calculateMarginPercent,
  calculateProductHpp,
} from '../utils/finance';
import { formatCompactIDR, formatIDR, formatPercent } from '../utils/format';
import { PointerCard } from '../components/ui/PointerCard';
import { PressButton } from '../components/ui/PressButton';
import { DailyChartPoint, SalesProfitChart } from '../components/charts/SalesProfitChart';
import { NavModuleId } from '../types/hargapas';

interface DashboardOverviewProps {
  onNavigate: (id: NavModuleId) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const { products, ingredients, transactions, cashFlow, settings, smartAlerts } = useHargaPas();

  const metrics = useMemo(() => {
    const totalRevenue = transactions.reduce((s, t) => s + t.totalRevenue, 0);
    const totalHpp = transactions.reduce((s, t) => s + t.totalHpp, 0);
    const grossProfit = totalRevenue - totalHpp;

    const opExpenses = cashFlow
      .filter((c) => c.type === 'out' && c.category !== 'Pembelian Bahan Baku')
      .reduce((s, c) => s + c.amount, 0);

    const netProfit = grossProfit - opExpenses;
    const activeProducts = products.filter((p) => p.isActive);
    const avgMargin =
      activeProducts.length > 0
        ? activeProducts.reduce((sum, p) => {
            const hpp = calculateProductHpp(p, ingredients);
            return sum + calculateMarginPercent(p.sellingPrice, hpp);
          }, 0) / activeProducts.length
        : 0;

    // Health score (0 - 100)
    let healthLabel: 'Sehat' | 'Perlu Perhatian' | 'Kritis' = 'Sehat';
    if (netProfit < 0 || avgMargin < settings.marginThreshold - 5) {
      healthLabel = 'Kritis';
    } else if (avgMargin < settings.marginThreshold || smartAlerts.some((a) => a.severity === 'critical')) {
      healthLabel = 'Perlu Perhatian';
    }

    return {
      totalRevenue,
      netProfit,
      avgMargin,
      activeCount: activeProducts.length,
      healthLabel,
      opExpenses,
    };
  }, [transactions, cashFlow, products, ingredients, settings.marginThreshold, smartAlerts]);

  // Aggregate 14-day chart data
  const chartData = useMemo<DailyChartPoint[]>(() => {
    const map = new Map<string, { revenue: number; profit: number }>();
    for (const tx of transactions) {
      const curr = map.get(tx.date) ?? { revenue: 0, profit: 0 };
      curr.revenue += tx.totalRevenue;
      curr.profit += tx.profit;
      map.set(tx.date, curr);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, vals]) => ({
        date,
        revenue: vals.revenue,
        profit: vals.profit,
      }));
  }, [transactions]);

  const healthBadgeClass =
    metrics.healthLabel === 'Sehat'
      ? 'bg-[#7bdc93]/25 text-[#1f4d3d] dark:text-[#7bdc93]'
      : metrics.healthLabel === 'Perlu Perhatian'
      ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
      : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ringkasan Bisnis</h1>
          <p className="text-sm text-[#52605a] dark:text-slate-400 mt-0.5">
            Pantau omzet, margin produk, dan kesehatan finansial {settings.businessName}.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold ${healthBadgeClass}`}
          >
            <BadgeCheck className="w-4 h-4" />
            Kesehatan Finansial: {metrics.healthLabel}
          </span>
          <PressButton variant="primary" size="md" onClick={() => onNavigate('pos')}>
            Catat Penjualan
            <ArrowUpRight className="w-4 h-4" />
          </PressButton>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <PointerCard lift className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#52605a] dark:text-slate-400">
              Omzet Bulan Ini
            </span>
            <div className="w-9 h-9 rounded-2xl bg-[#2c5f4e]/10 dark:bg-[#7bdc93]/15 flex items-center justify-center text-[#2c5f4e] dark:text-[#7bdc93]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold tabular-nums tracking-tight">
            {formatCompactIDR(metrics.totalRevenue)}
          </div>
          <div className="mt-1 text-xs text-[#52605a] dark:text-slate-400 tabular-nums">
            {formatIDR(metrics.totalRevenue)} dari target {formatCompactIDR(settings.monthlyRevenueTarget)}
          </div>
        </PointerCard>

        <PointerCard lift className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#52605a] dark:text-slate-400">
              Total Laba Bersih
            </span>
            <div className="w-9 h-9 rounded-2xl bg-[#7bdc93]/25 flex items-center justify-center text-[#2c5f4e] dark:text-[#7bdc93]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold tabular-nums tracking-tight">
            {formatCompactIDR(metrics.netProfit)}
          </div>
          <div className="mt-1 text-xs text-[#52605a] dark:text-slate-400 tabular-nums">
            Setelah beban operasional {formatCompactIDR(metrics.opExpenses)}
          </div>
        </PointerCard>

        <PointerCard lift className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#52605a] dark:text-slate-400">
              Rata-rata Margin
            </span>
            <div className="w-9 h-9 rounded-2xl bg-[#2c5f4e]/10 dark:bg-[#7bdc93]/15 flex items-center justify-center text-[#2c5f4e] dark:text-[#7bdc93]">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold tabular-nums tracking-tight">
            {formatPercent(metrics.avgMargin)}
          </div>
          <div className="mt-1 text-xs text-[#52605a] dark:text-slate-400">
            Batas aman usaha: {settings.marginThreshold}%
          </div>
        </PointerCard>

        <PointerCard lift className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#52605a] dark:text-slate-400">
              Produk Aktif
            </span>
            <div className="w-9 h-9 rounded-2xl bg-[#2c5f4e]/10 dark:bg-[#7bdc93]/15 flex items-center justify-center text-[#2c5f4e] dark:text-[#7bdc93]">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-bold tabular-nums tracking-tight">
            {metrics.activeCount} Menu
          </div>
          <div className="mt-1 text-xs text-[#52605a] dark:text-slate-400">
            {ingredients.length} bahan baku terhubung BOM
          </div>
        </PointerCard>
      </div>

      {/* Chart + Smart Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <PointerCard className="xl:col-span-2 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold">Penjualan & Laba 14 Hari Terakhir</h2>
              <p className="text-xs text-[#52605a] dark:text-slate-400">
                Arahkan kursor pada grafik untuk melihat rincian harian.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2c5f4e] dark:bg-[#5ec48b]" />
                Omzet
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7bdc93]" />
                Laba Kotor
              </span>
            </div>
          </div>
          <SalesProfitChart data={chartData} />
        </PointerCard>

        <PointerCard className="p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2c5f4e] dark:text-[#7bdc93]" />
              <h2 className="text-base font-bold">Peringatan Cerdas</h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#2c5f4e]/10 dark:bg-[#7bdc93]/15 text-[#2c5f4e] dark:text-[#7bdc93]">
              {smartAlerts.length} aktif
            </span>
          </div>

          {smartAlerts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 text-sm text-[#52605a] dark:text-slate-400">
              <BadgeCheck className="w-8 h-8 text-[#7bdc93] mb-2" />
              Semua margin produk dan stok bahan baku dalam kondisi aman.
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-72 pr-1">
              {smartAlerts.map((alert) => {
                const isCrit = alert.severity === 'critical';
                return (
                  <div
                    key={alert.id}
                    className={`rounded-2xl p-3.5 border text-xs ${
                      isCrit
                        ? 'bg-rose-50/80 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-800/50 dark:text-rose-200'
                        : 'bg-amber-50/80 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800/50 dark:text-amber-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold">{alert.title}</div>
                        <p className="mt-1 opacity-85 leading-relaxed">{alert.message}</p>
                        <button
                          onClick={() =>
                            onNavigate(alert.productId ? 'what-if' : 'inventory')
                          }
                          className="mt-2 font-semibold underline underline-offset-2 cursor-pointer"
                        >
                          {alert.productId ? 'Simulasikan Harga Baru' : 'Cek Inventaris'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </PointerCard>
      </div>
    </div>
  );
};
