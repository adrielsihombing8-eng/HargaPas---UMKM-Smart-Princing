import React, { Suspense, lazy, useMemo, useState } from 'react';
import {
  ArrowRight,
  BellRing,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  LogIn,
  Moon,
  Package,
  ShoppingCart,
  SlidersHorizontal,
  Store,
  Sun,
  Target,
  Warehouse,
} from 'lucide-react';
import { useHargaPas } from '../store/HargaPasContext';
import {
  calculateMarginPercent,
  calculateOnlinePrice,
  calculateProductHpp,
  calculateSellingPriceFromMargin,
} from '../utils/finance';
import { formatIDR, formatPercent } from '../utils/format';
import { PointerCard } from '../components/ui/PointerCard';
import { PressButton } from '../components/ui/PressButton';
import { RiverAurora } from '../components/landing/RiverAurora';
import { StackedSection } from '../components/landing/StackedSection';
import { NavModuleId } from '../types/hargapas';

const CoffeeMarket3D = lazy(() =>
  import('../components/landing/CoffeeMarket3D').then((m) => ({
    default: m.CoffeeMarket3D,
  }))
);

interface LandingPageProps {
  onEnterApp: (initialModule?: NavModuleId) => void;
}

const FEATURE_CARDS: Array<{
  id: NavModuleId;
  title: string;
  desc: string;
  tag: string;
  icon: React.FC<{ className?: string }>;
}> = [
  {
    id: 'hpp-calculator',
    title: 'Kalkulator HPP & Harga Jual',
    desc: 'Hitung modal per porsi dari batch produksi, tenaga kerja, overhead, hingga benchmark harga pasar wilayah.',
    tag: 'Inti Sistem',
    icon: Calculator,
  },
  {
    id: 'what-if',
    title: 'Simulasi What-If & Sensitivitas',
    desc: 'Uji skenario kenaikan harga bahan baku, promo diskon, dan perubahan volume penjualan secara real-time.',
    tag: 'Analisis',
    icon: SlidersHorizontal,
  },
  {
    id: 'marketplace',
    title: 'Kalkulator Marketplace',
    desc: 'Markup harga otomatis agar margin bersih tetap utuh setelah potongan GoFood, GrabFood, ShopeeFood, & TikTok Shop.',
    tag: 'Multi-Kanal',
    icon: Store,
  },
  {
    id: 'products',
    title: 'Katalog Produk & Resep BOM',
    desc: 'Pantau status margin aman/waspada/kritis beserta takaran bahan baku per porsi setiap menu.',
    tag: 'Resep',
    icon: Package,
  },
  {
    id: 'inventory',
    title: 'Inventaris & Peringatan Stok',
    desc: 'Lacak stok menipis, reorder point, dan riwayat kenaikan harga beli bahan yang langsung memperbarui HPP.',
    tag: 'Stok',
    icon: Warehouse,
  },
  {
    id: 'pos',
    title: 'Kas & POS Potong Stok Otomatis',
    desc: 'Catat penjualan cepat harian dan kurangi stok bahan baku secara otomatis sesuai resep BOM.',
    tag: 'Kasir',
    icon: ShoppingCart,
  },
  {
    id: 'bep',
    title: 'Analisis BEP & Target Bulanan',
    desc: 'Ketahui berapa porsi dan omzet minimal untuk balik modal serta pantau progress target laba bulanan.',
    tag: 'Target',
    icon: Target,
  },
  {
    id: 'profit-loss',
    title: 'Laporan Laba / Rugi Sederhana',
    desc: 'Rekap omzet, HPP terpakai, laba kotor, beban operasional, hingga kontribusi laba tiap produk.',
    tag: 'Laporan',
    icon: FileSpreadsheet,
  },
  {
    id: 'dashboard',
    title: 'Dashboard & Peringatan Cerdas',
    desc: 'Grafik performa 14 hari terakhir dan notifikasi otomatis saat margin produk mulai tergerus.',
    tag: 'Ringkasan',
    icon: BellRing,
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const { currentUser, products, ingredients, settings, updateSettings } = useHargaPas();

  const [demoProdIdx, setDemoProdIdx] = useState(0);
  const [demoMargin, setDemoMargin] = useState(35);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const visibleFeatures = showAllFeatures ? FEATURE_CARDS : FEATURE_CARDS.slice(0, 6);

  const demoProduct = products[demoProdIdx] ?? products[0];

  const demoCalc = useMemo(() => {
    const baseHpp = demoProduct
      ? calculateProductHpp(demoProduct, ingredients)
      : 8950;
    const rawPrice = calculateSellingPriceFromMargin(baseHpp, demoMargin);
    const sellingPrice = Math.ceil(rawPrice / 500) * 500;
    const actualMargin = calculateMarginPercent(sellingPrice, baseHpp);
    const profitPerUnit = sellingPrice - baseHpp;
    const gofoodPrice = Math.ceil(calculateOnlinePrice(sellingPrice, 20) / 500) * 500;

    return {
      baseHpp,
      sellingPrice,
      actualMargin,
      profitPerUnit,
      gofoodPrice,
    };
  }, [demoProduct, ingredients, demoMargin]);

  return (
    <div className="relative min-h-screen bg-[#FAF6F0] dark:bg-[#1B120D] text-[#2B1B14] dark:text-[#FAF6F0]">
      {/* Organic River-Flowing Aurora Following Scroll (Caffe Klasik Palette) */}
      <RiverAurora darkMode={settings.darkMode} />

      {/* Sticky Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#FAF6F0]/88 dark:bg-[#1B120D]/88 backdrop-blur-md border-b border-[#E2D3C1] dark:border-[#4E372B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EFE3D3] border border-[#C68B59]/45 flex items-center justify-center shadow-sm overflow-hidden p-1 shrink-0">
              <img
                src="/logo-kopi.jpg"
                alt="Logo HargaPas UMKM"
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-[#2B1B14] dark:text-[#FAF6F0]">
                HargaPas UMKM
              </div>
              <div className="text-[11px] text-[#A8703F] dark:text-[#C68B59] font-medium">
                Smart Pricing & Simulasi Usaha
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#5A4636] dark:text-[#D5C3B3]">
            <a href="#simulasi" className="hover:text-[#A8703F] dark:hover:text-[#C68B59] transition-colors">
              Simulasi Mini
            </a>
            <a href="#masalah" className="hover:text-[#A8703F] dark:hover:text-[#C68B59] transition-colors">
              Mengapa HargaPas
            </a>
            <a href="#fitur" className="hover:text-[#A8703F] dark:hover:text-[#C68B59] transition-colors">
              9+ Modul Utama
            </a>
            <a href="#alur" className="hover:text-[#A8703F] dark:hover:text-[#C68B59] transition-colors">
              Cara Kerja
            </a>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => updateSettings({ darkMode: !settings.darkMode })}
              className="p-2 rounded-2xl bg-[#FFFDF9] dark:bg-[#2B1B14] border border-[#E2D3C1] dark:border-[#4E372B] text-[#A8703F] dark:text-[#C68B59] btn-press cursor-pointer"
              aria-label="Ganti mode warna"
              title={settings.darkMode ? 'Mode Terang' : 'Mode Gelap'}
            >
              {settings.darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {currentUser ? (
              <PressButton variant="primary" size="md" onClick={() => onEnterApp('dashboard')}>
                Buka Workspace ({currentUser.name.split(' ')[0]})
                <ArrowRight className="w-4 h-4" />
              </PressButton>
            ) : (
              <PressButton variant="primary" size="md" onClick={() => onEnterApp('dashboard')}>
                <LogIn className="w-4 h-4" />
                Masuk / Daftar
              </PressButton>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section Band — Latar Section Cappuccino (#EFE3D3) */}
      <section className="relative bg-[#EFE3D3] dark:bg-[#2B1B14] border-b border-[#E2D3C1] dark:border-[#4E372B]">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12 pb-14 lg:pb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-6">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.12] text-[#2B1B14] dark:text-[#FAF6F0]">
              Hitung HPP, jaga margin, dan tentukan harga jual UMKM tanpa tebak-tebakan.
            </h1>

            <p className="text-sm sm:text-base text-[#5A4636] dark:text-[#D5C3B3] leading-relaxed max-w-xl">
              HargaPas UMKM menggabungkan kalkulator modal produksi (BOM), simulasi skenario
              laba, perhitungan harga marketplace, hingga kasir POS yang otomatis memotong stok
              bahan baku dalam satu dashboard yang ramah pemula.
            </p>

            <div className="flex items-center gap-3 flex-wrap pt-1">
              <PressButton variant="primary" size="lg" onClick={() => onEnterApp('dashboard')}>
                Buka Dashboard Aplikasi
                <ArrowRight className="w-4 h-4" />
              </PressButton>
              <PressButton variant="secondary" size="lg" onClick={() => onEnterApp('hpp-calculator')}>
                <Calculator className="w-4 h-4" />
                Coba Kalkulator HPP
              </PressButton>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#D8C5B0] dark:border-[#4E372B]">
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#A8703F] dark:text-[#C68B59] tabular-nums">
                  10 Modul
                </div>
                <div className="text-xs text-[#5A4636] dark:text-[#D5C3B3]">
                  Alur bisnis terintegrasi
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#A8703F] dark:text-[#C68B59] tabular-nums">
                  Auto-BOM
                </div>
                <div className="text-xs text-[#5A4636] dark:text-[#D5C3B3]">
                  Stok & HPP saling terhubung
                </div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#A8703F] dark:text-[#C68B59] tabular-nums">
                  4 Kanal
                </div>
                <div className="text-xs text-[#5A4636] dark:text-[#D5C3B3]">
                  Simulasi komisi online
                </div>
              </div>
            </div>
          </div>

          {/* Interactive 3D UMKM Culinary & Beverage Objects */}
          <div className="lg:col-span-6">
            <Suspense
              fallback={
                <div className="w-full h-[500px] sm:h-[580px] flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-4 border-[#EFE3D3] border-t-[#C68B59] animate-spin" />
                </div>
              }
            >
              <CoffeeMarket3D />
            </Suspense>
          </div>
        </div>
      </section>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-12 sm:pt-16 pb-28">
        {/* Stacked Card Deck Sections (Latar Card Foam #FFFDF9) */}
        <div className="space-y-12 lg:space-y-20">
          {/* Card 01: Interactive Mini Price Simulator */}
          <StackedSection id="simulasi" index={0}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 space-y-3">
                <div className="font-card-title text-4xl sm:text-5xl leading-none font-bold text-[#A8703F] dark:text-[#C68B59]">
                  Simulasi Mini Langsung
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2B1B14] dark:text-[#FAF6F0]">
                  Uji Penetapan Harga Jual Secara Real-Time
                </h2>
                <p className="text-sm text-[#5A4636] dark:text-[#D5C3B3] leading-relaxed">
                  Pilih contoh menu UMKM, geser target margin laba, dan lihat langsung rekomendasi
                  harga offline, laba bersih per porsi, serta harga jual GoFood (+20%) tanpa
                  menggerus keuntungan.
                </p>
                <div className="pt-2">
                  <PressButton variant="accent" onClick={() => onEnterApp('hpp-calculator')}>
                    Buka Kalkulator HPP Lengkap
                    <ArrowRight className="w-4 h-4" />
                  </PressButton>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#EFE3D3] dark:bg-[#1B120D] border border-[#E2D3C1] dark:border-[#4E372B]">
                  {products.slice(0, 2).map((prod, idx) => {
                    const active = demoProdIdx === idx;
                    return (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => setDemoProdIdx(idx)}
                        className={`btn-press py-2.5 px-3 rounded-xl text-xs font-semibold truncate cursor-pointer ${
                          active
                            ? 'bg-[#C68B59] text-[#FFFDF9] shadow-xs'
                            : 'text-[#5A4636] dark:text-[#D5C3B3] hover:text-[#2B1B14] dark:hover:text-[#FAF6F0]'
                        }`}
                      >
                        {prod.name}
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-2xl bg-[#FAF6F0] dark:bg-[#1B120D] border border-[#E2D3C1] dark:border-[#4E372B] p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-medium text-[#5A4636] dark:text-[#D5C3B3]">
                    <span>Target Margin Laba (%)</span>
                    <span className="font-bold text-[#A8703F] dark:text-[#C68B59] tabular-nums text-sm">
                      {demoMargin}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={65}
                    value={demoMargin}
                    onChange={(e) => setDemoMargin(Number(e.target.value))}
                    className="w-full mint-slider"
                  />
                  <div className="flex justify-between text-[11px] text-[#5A4636] dark:text-[#D5C3B3]">
                    <span>HPP Modal / porsi: {formatIDR(demoCalc.baseHpp)}</span>
                    <span>Margin Aktual: {formatPercent(demoCalc.actualMargin)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-[#EFE3D3] dark:bg-[#3E2A20] border border-[#C68B59]/40 p-3.5">
                    <div className="text-[11px] text-[#5A4636] dark:text-[#EFE3D3] font-medium">
                      Harga Jual Offline
                    </div>
                    <div className="text-lg font-extrabold text-[#2B1B14] dark:text-[#FAF6F0] tabular-nums mt-1">
                      {formatIDR(demoCalc.sellingPrice)}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#FAF6F0] dark:bg-[#1B120D] border border-[#E2D3C1] dark:border-[#4E372B] p-3.5">
                    <div className="text-[11px] text-[#5A4636] dark:text-[#D5C3B3] font-medium">
                      Laba / Porsi
                    </div>
                    <div className="text-lg font-extrabold text-[#15803D] dark:text-[#4ADE80] tabular-nums mt-1">
                      +{formatIDR(demoCalc.profitPerUnit)}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#EF7A5A]/15 dark:bg-[#EF7A5A]/20 border border-[#EF7A5A]/40 p-3.5">
                    <div className="text-[11px] text-[#A8703F] dark:text-[#EF7A5A] font-medium">
                      Harga GoFood (+20%)
                    </div>
                    <div className="text-lg font-extrabold text-[#2B1B14] dark:text-[#FAF6F0] tabular-nums mt-1">
                      {formatIDR(demoCalc.gofoodPrice)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </StackedSection>

          {/* Card 02: Pain Points */}
          <StackedSection id="masalah" index={1}>
            <div className="space-y-6">
              <div className="max-w-2xl space-y-2">
                <div className="font-card-title text-4xl sm:text-5xl leading-none font-bold text-[#A8703F] dark:text-[#C68B59]">
                  Mengapa HargaPas
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2B1B14] dark:text-[#FAF6F0]">
                  Masalah Klasik UMKM yang Diselesaikan HargaPas
                </h2>
                <p className="text-sm text-[#5A4636] dark:text-[#D5C3B3]">
                  Banyak usaha ramai pembeli, tetapi kas menipis karena harga jual belum memperhitungkan komponen biaya tersembunyi.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-3xl bg-[#FAF6F0] dark:bg-[#1B120D] border border-[#E2D3C1] dark:border-[#4E372B] p-6 space-y-2.5">
                  <div className="font-card-title w-10 h-10 rounded-2xl bg-[#EF7A5A]/20 text-[#EF7A5A] flex items-center justify-center font-bold text-2xl leading-none">
                    01
                  </div>
                  <h3 className="font-bold text-base text-[#2B1B14] dark:text-[#FAF6F0]">
                    Harga Bahan Naik Diam-Diam
                  </h3>
                  <p className="text-xs text-[#5A4636] dark:text-[#D5C3B3] leading-relaxed">
                    Saat harga kopi bubuk atau susu naik, HPP ikut naik. HargaPas otomatis mendeteksi penurunan margin dan memicu Peringatan Cerdas.
                  </p>
                </div>

                <div className="rounded-3xl bg-[#FAF6F0] dark:bg-[#1B120D] border border-[#E2D3C1] dark:border-[#4E372B] p-6 space-y-2.5">
                  <div className="font-card-title w-10 h-10 rounded-2xl bg-[#F4B9C8]/35 text-[#2B1B14] dark:text-[#F4B9C8] flex items-center justify-center font-bold text-2xl leading-none">
                    02
                  </div>
                  <h3 className="font-bold text-base text-[#2B1B14] dark:text-[#FAF6F0]">
                    Komisi Aplikasi Online 20%
                  </h3>
                  <p className="text-xs text-[#5A4636] dark:text-[#D5C3B3] leading-relaxed">
                    Menyamakan harga offline dan online sering membuat rugi. Kalkulator Marketplace menghitung harga markup tepat agar net diterima tetap aman.
                  </p>
                </div>

                <div className="rounded-3xl bg-[#FAF6F0] dark:bg-[#1B120D] border border-[#E2D3C1] dark:border-[#4E372B] p-6 space-y-2.5">
                  <div className="font-card-title w-10 h-10 rounded-2xl bg-[#EFE3D3] dark:bg-[#3E2A20] text-[#A8703F] dark:text-[#C68B59] flex items-center justify-center font-bold text-2xl leading-none">
                    03
                  </div>
                  <h3 className="font-bold text-base text-[#2B1B14] dark:text-[#FAF6F0]">
                    Tidak Tahu Target Balik Modal
                  </h3>
                  <p className="text-xs text-[#5A4636] dark:text-[#D5C3B3] leading-relaxed">
                    Modul BEP menghitung persis berapa porsi per hari yang harus terjual untuk menutup sewa, listrik, gaji, serta memantau target laba bulanan.
                  </p>
                </div>
              </div>
            </div>
          </StackedSection>

          {/* Card 03: Feature Bento Grid */}
          <StackedSection id="fitur" index={2}>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="font-card-title text-4xl sm:text-5xl leading-none font-bold text-[#A8703F] dark:text-[#C68B59]">
                    Eksplorasi Modul Sistem
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#2B1B14] dark:text-[#FAF6F0]">
                    9+ Modul Finansial Terintegrasi
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5A4636] dark:text-[#D5C3B3]">
                    Klik kartu mana saja untuk langsung mencoba modul terkait di dalam aplikasi.
                  </p>
                </div>
                <PressButton variant="accent" size="sm" onClick={() => onEnterApp('dashboard')}>
                  Masuk ke Workspace
                  <ArrowRight className="w-3.5 h-3.5" />
                </PressButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {visibleFeatures.map((feat) => {
                  const Icon = feat.icon;
                  return (
                    <PointerCard
                      key={feat.id}
                      lift
                      onClick={() => onEnterApp(feat.id)}
                      className="p-3.5 bg-[#FAF6F0] dark:bg-[#1B120D] flex flex-col justify-between gap-2 cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="w-8 h-8 rounded-xl bg-[#EFE3D3] dark:bg-[#3E2A20] text-[#A8703F] dark:text-[#C68B59] flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFFDF9] dark:bg-[#2B1B14] border border-[#E2D3C1] dark:border-[#4E372B] text-[#A8703F] dark:text-[#EFE3D3]">
                            {feat.tag}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm mt-2.5 leading-snug text-[#2B1B14] dark:text-[#FAF6F0]">
                          {feat.title}
                        </h3>
                        <p className="text-[11px] text-[#5A4636] dark:text-[#D5C3B3] mt-1 leading-relaxed line-clamp-2">
                          {feat.desc}
                        </p>
                      </div>
                    </PointerCard>
                  );
                })}
              </div>

              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowAllFeatures((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#EFE3D3] dark:bg-[#3E2A20] hover:bg-[#C68B59] hover:text-[#FFFDF9] dark:hover:bg-[#C68B59] border border-[#C68B59]/40 text-xs font-bold text-[#2B1B14] dark:text-[#FAF6F0] btn-press cursor-pointer transition-colors"
                >
                  {showAllFeatures ? (
                    <>
                      Tampilkan Lebih Sedikit
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Lihat Selengkapnya (+{FEATURE_CARDS.length - 6} Modul Lainnya)
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </StackedSection>

          {/* Card 04: How It Works */}
          <StackedSection id="alur" index={3}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="space-y-2.5">
                <div className="font-card-title text-4xl sm:text-5xl leading-none font-bold text-[#A8703F] dark:text-[#C68B59]">
                  Alur Penggunaan
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2B1B14] dark:text-[#FAF6F0]">
                  3 Langkah Mulai Mengelola Harga Usaha
                </h2>
                <p className="text-xs sm:text-sm text-[#5A4636] dark:text-[#D5C3B3] leading-relaxed">
                  Semua data awal sudah terisi otomatis dengan contoh kedai minuman sehingga Anda bisa langsung mencoba setiap fitur.
                </p>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-[#EFE3D3]/75 dark:bg-[#1B120D] border border-[#E2D3C1] dark:border-[#4E372B] p-5 space-y-1.5">
                  <div className="text-xs font-bold text-[#A8703F] dark:text-[#C68B59]">Langkah 1</div>
                  <div className="font-bold text-sm text-[#2B1B14] dark:text-[#FAF6F0]">Input Bahan & Stok</div>
                  <p className="text-xs text-[#5A4636] dark:text-[#D5C3B3]">
                    Catat bahan baku beserta harga beli dan batas minimum stok di Inventaris.
                  </p>
                </div>
                <div className="rounded-2xl bg-[#EFE3D3]/75 dark:bg-[#1B120D] border border-[#E2D3C1] dark:border-[#4E372B] p-5 space-y-1.5">
                  <div className="text-xs font-bold text-[#A8703F] dark:text-[#C68B59]">Langkah 2</div>
                  <div className="font-bold text-sm text-[#2B1B14] dark:text-[#FAF6F0]">Set HPP & Harga Jual</div>
                  <p className="text-xs text-[#5A4636] dark:text-[#D5C3B3]">
                    Susun resep batch produksi di Kalkulator HPP lalu simpan ke Katalog.
                  </p>
                </div>
                <div className="rounded-2xl bg-[#EFE3D3]/75 dark:bg-[#1B120D] border border-[#E2D3C1] dark:border-[#4E372B] p-5 space-y-1.5">
                  <div className="text-xs font-bold text-[#A8703F] dark:text-[#C68B59]">Langkah 3</div>
                  <div className="font-bold text-sm text-[#2B1B14] dark:text-[#FAF6F0]">Catat Penjualan & Pantau</div>
                  <p className="text-xs text-[#5A4636] dark:text-[#D5C3B3]">
                    Gunakan Kas & POS untuk potong stok otomatis dan pantau Laba/Rugi.
                  </p>
                </div>
              </div>
            </div>
          </StackedSection>

          {/* Card 05: Final CTA */}
          <StackedSection index={4}>
            <div className="py-4 text-center space-y-4">
              <div className="flex flex-col items-center gap-2.5">
                <div className="font-card-title text-4xl sm:text-5xl leading-none font-bold text-[#A8703F] dark:text-[#C68B59]">
                  Mulai Sekarang
                </div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#2B1B14] dark:text-[#FAF6F0] bg-[#F4B9C8]/40 dark:bg-[#3E2A20] border border-[#F4B9C8] dark:border-[#C68B59]/40 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#A8703F] dark:text-[#C68B59]" />
                  Siap Dicoba Langsung di Browser (LocalStorage)
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#2B1B14] dark:text-[#FAF6F0]">
                Siap Menentukan Harga yang Pas untuk Bisnis Anda?
              </h2>
              <p className="text-sm text-[#5A4636] dark:text-[#D5C3B3] max-w-xl mx-auto">
                Masuk ke workspace HargaPas UMKM sekarang untuk melihat ringkasan keuangan, menguji simulasi What-If, atau mengatur HPP produk Anda sendiri.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                <PressButton variant="primary" size="lg" onClick={() => onEnterApp('dashboard')}>
                  Mulai Sekarang
                  <ArrowRight className="w-4 h-4" />
                </PressButton>
                <PressButton variant="secondary" size="lg" onClick={() => onEnterApp('what-if')}>
                  Simulasi What-If
                </PressButton>
              </div>
            </div>
          </StackedSection>
        </div>
      </main>

      <footer className="relative z-10 border-t border-[#E2D3C1] dark:border-[#4E372B] bg-[#FAF6F0]/90 dark:bg-[#1B120D]/90 backdrop-blur-md py-6 px-4 sm:px-8 text-center text-xs text-[#5A4636] dark:text-[#D5C3B3]">
        HargaPas UMKM • Prototipe Aplikasi Web Manajemen Harga & Finansial UMKM (Mode Data Dummy Lokal)
      </footer>
    </div>
  );
};
