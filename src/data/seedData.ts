import {
  BusinessSettings,
  CashFlowEntry,
  Ingredient,
  MarketPriceRange,
  Product,
  SaleTransaction,
} from '../types/hargapas';

export const SEED_SETTINGS: BusinessSettings = {
  businessName: 'Kedai Kopi & Teh Nusantara',
  category: 'Minuman',
  region: 'Jabodetabek',
  marginThreshold: 32, // Kopi Susu (31.2%) akan memicu Smart Alert agar user langsung melihat fitur peringatan cerdas
  monthlyRevenueTarget: 18_000_000,
  monthlyProfitTarget: 6_000_000,
  monthlyFixedCost: 2_800_000, // Sewa tempat, listrik tetap, internet, gaji tetap
  darkMode: false,
};

export const SEED_INGREDIENTS: Ingredient[] = [
  {
    id: 'ing-kopi',
    name: 'Kopi Bubuk',
    unit: 'kg',
    pricePerUnit: 135_000,
    stock: 4.5,
    minStock: 3,
    supplier: 'Roastery Mandiri Jaya',
    priceHistory: [
      { id: 'ph-1', date: '2026-10-20', pricePerUnit: 118_000, note: 'Harga beli awal bulan' },
      { id: 'ph-2', date: '2026-11-05', pricePerUnit: 122_000, note: 'Penyesuaian panen' },
      { id: 'ph-3', date: '2026-11-16', pricePerUnit: 135_000, note: 'Kenaikan harga biji arabika' },
    ],
  },
  {
    id: 'ing-susu',
    name: 'Susu UHT',
    unit: 'liter',
    pricePerUnit: 19_500,
    stock: 18,
    minStock: 12,
    supplier: 'Distributor Susu Segar',
    priceHistory: [
      { id: 'ph-4', date: '2026-10-22', pricePerUnit: 18_800, note: 'Pembelian karton' },
      { id: 'ph-5', date: '2026-11-12', pricePerUnit: 19_500, note: 'Kenaikan ongkir distributor' },
    ],
  },
  {
    id: 'ing-gula',
    name: 'Gula Pasir',
    unit: 'kg',
    pricePerUnit: 18_000,
    stock: 9.2,
    minStock: 10, // sengaja di bawah minStock untuk demo peringatan stok menipis
    supplier: 'Toko Sembako Berkah',
    priceHistory: [
      { id: 'ph-6', date: '2026-10-25', pricePerUnit: 17_500, note: 'Stok reguler' },
      { id: 'ph-7', date: '2026-11-10', pricePerUnit: 18_000, note: 'Harga pasar naik tipis' },
    ],
  },
  {
    id: 'ing-gelas',
    name: 'Gelas Plastik',
    unit: 'pcs',
    pricePerUnit: 550,
    stock: 420,
    minStock: 200,
    supplier: 'Kemasan Kita Packaging',
    priceHistory: [
      { id: 'ph-8', date: '2026-10-15', pricePerUnit: 550, note: 'Order 1000 pcs + tutup' },
    ],
  },
  {
    id: 'ing-teh',
    name: 'Teh Melati',
    unit: 'kg',
    pricePerUnit: 65_000,
    stock: 3.4,
    minStock: 2,
    supplier: 'Perkebunan Teh Solo',
    priceHistory: [
      { id: 'ph-9', date: '2026-10-18', pricePerUnit: 65_000, note: 'Kualitas grade A' },
    ],
  },
  {
    id: 'ing-es',
    name: 'Es Batu',
    unit: 'kg',
    pricePerUnit: 3_000,
    stock: 25,
    minStock: 15,
    supplier: 'Pabrik Es Kristal',
    priceHistory: [
      { id: 'ph-10', date: '2026-11-01', pricePerUnit: 3_000, note: 'Pengiriman harian' },
    ],
  },
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-kopi-susu',
    name: 'Kopi Susu Gula Aren',
    category: 'Kopi Signature',
    sellingPrice: 13_000,
    laborCostPerUnit: 700,
    overheadCostPerUnit: 500,
    isActive: true,
    bom: [
      { ingredientId: 'ing-kopi', qtyPerUnit: 0.025 },
      { ingredientId: 'ing-susu', qtyPerUnit: 0.15 },
      { ingredientId: 'ing-gula', qtyPerUnit: 0.03 },
      { ingredientId: 'ing-gelas', qtyPerUnit: 1 },
      { ingredientId: 'ing-es', qtyPerUnit: 0.12 },
    ],
  },
  {
    id: 'prod-es-teh',
    name: 'Es Teh Manis Melati',
    category: 'Teh Segar',
    sellingPrice: 5_000,
    laborCostPerUnit: 200,
    overheadCostPerUnit: 120,
    isActive: true,
    bom: [
      { ingredientId: 'ing-teh', qtyPerUnit: 0.015 },
      { ingredientId: 'ing-gula', qtyPerUnit: 0.035 },
      { ingredientId: 'ing-gelas', qtyPerUnit: 1 },
      { ingredientId: 'ing-es', qtyPerUnit: 0.15 },
    ],
  },
];

// Generate 14 days of realistic sales ending today (2026-11-19)
const DAILY_PATTERN: Array<{ kopiQty: number; tehQty: number; offsetDays: number }> = [
  { offsetDays: 13, kopiQty: 26, tehQty: 38 },
  { offsetDays: 12, kopiQty: 29, tehQty: 41 },
  { offsetDays: 11, kopiQty: 34, tehQty: 45 },
  { offsetDays: 10, kopiQty: 24, tehQty: 35 },
  { offsetDays: 9, kopiQty: 31, tehQty: 48 },
  { offsetDays: 8, kopiQty: 38, tehQty: 52 },
  { offsetDays: 7, kopiQty: 42, tehQty: 56 },
  { offsetDays: 6, kopiQty: 30, tehQty: 40 },
  { offsetDays: 5, kopiQty: 33, tehQty: 44 },
  { offsetDays: 4, kopiQty: 36, tehQty: 49 },
  { offsetDays: 3, kopiQty: 41, tehQty: 54 },
  { offsetDays: 2, kopiQty: 45, tehQty: 60 },
  { offsetDays: 1, kopiQty: 39, tehQty: 51 },
  { offsetDays: 0, kopiQty: 44, tehQty: 58 },
];

function getIsoDateDaysAgo(daysAgo: number): string {
  const base = new Date('2026-11-19T12:00:00');
  base.setDate(base.getDate() - daysAgo);
  return base.toISOString().slice(0, 10);
}

export const SEED_TRANSACTIONS: SaleTransaction[] = DAILY_PATTERN.flatMap((d, idx) => {
  const date = getIsoDateDaysAgo(d.offsetDays);
  return [
    {
      id: `tx-kopi-${idx}`,
      date,
      productId: 'prod-kopi-susu',
      productName: 'Kopi Susu Gula Aren',
      qty: d.kopiQty,
      unitPrice: 13_000,
      unitHpp: 8_950,
      channel: idx % 3 === 0 ? 'GoFood' : 'Offline',
      totalRevenue: d.kopiQty * 13_000,
      totalHpp: d.kopiQty * 8_950,
      profit: d.kopiQty * (13_000 - 8_950),
    },
    {
      id: `tx-teh-${idx}`,
      date,
      productId: 'prod-es-teh',
      productName: 'Es Teh Manis Melati',
      qty: d.tehQty,
      unitPrice: 5_000,
      unitHpp: 2_925,
      channel: idx % 4 === 0 ? 'GrabFood' : 'Offline',
      totalRevenue: d.tehQty * 5_000,
      totalHpp: d.tehQty * 2_925,
      profit: d.tehQty * (5_000 - 2_925),
    },
  ];
});

export const SEED_CASHFLOW: CashFlowEntry[] = [
  {
    id: 'cf-1',
    date: '2026-11-19',
    type: 'in',
    category: 'Penjualan Harian',
    description: 'Rekap penjualan kedai & online hari ini',
    amount: 862_000,
  },
  {
    id: 'cf-2',
    date: '2026-11-18',
    type: 'out',
    category: 'Pembelian Bahan Baku',
    description: 'Restok Kopi Bubuk 3 kg & Susu UHT 12 liter',
    amount: 639_000,
  },
  {
    id: 'cf-3',
    date: '2026-11-15',
    type: 'out',
    category: 'Operasional',
    description: 'Tagihan listrik & gas LPG 12 kg',
    amount: 420_000,
  },
  {
    id: 'cf-4',
    date: '2026-11-10',
    type: 'out',
    category: 'Sewa & Tempat',
    description: 'Cicilan sewa kios bulan November',
    amount: 1_500_000,
  },
];

export const MARKET_PRICE_BENCHMARKS: MarketPriceRange[] = [
  { region: 'Jabodetabek', minPrice: 12_000, medianPrice: 16_000, maxPrice: 22_000 },
  { region: 'Bandung', minPrice: 11_000, medianPrice: 15_000, maxPrice: 20_000 },
  { region: 'Surabaya', minPrice: 10_500, medianPrice: 14_500, maxPrice: 19_000 },
  { region: 'Yogyakarta', minPrice: 9_000, medianPrice: 13_000, maxPrice: 17_000 },
  { region: 'Medan', minPrice: 11_000, medianPrice: 15_000, maxPrice: 19_500 },
  { region: 'Bali', minPrice: 14_000, medianPrice: 19_000, maxPrice: 26_000 },
];
