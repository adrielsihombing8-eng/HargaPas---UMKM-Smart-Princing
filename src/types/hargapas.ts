export type NavModuleId =
  | 'dashboard'
  | 'hpp-calculator'
  | 'what-if'
  | 'bep'
  | 'products'
  | 'inventory'
  | 'marketplace'
  | 'pos'
  | 'profit-loss'
  | 'settings';

export type BusinessCategory = 'Makanan' | 'Minuman' | 'Jasa';

export type MarketRegion =
  | 'Jabodetabek'
  | 'Bandung'
  | 'Surabaya'
  | 'Yogyakarta'
  | 'Medan'
  | 'Bali';

export interface PriceHistoryEntry {
  id: string;
  date: string;
  pricePerUnit: number;
  note: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: 'kg' | 'liter' | 'pcs' | 'gram' | 'ml';
  pricePerUnit: number;
  stock: number;
  minStock: number;
  supplier: string;
  priceHistory: PriceHistoryEntry[];
}

export interface BomItem {
  ingredientId: string;
  qtyPerUnit: number; // in ingredient's unit (e.g., 0.02 kg = 20g)
}

export interface Product {
  id: string;
  name: string;
  category: string;
  sellingPrice: number;
  laborCostPerUnit: number;
  overheadCostPerUnit: number;
  isActive: boolean;
  bom: BomItem[];
}

export interface SaleTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  unitHpp: number;
  channel: 'Offline' | 'GoFood' | 'GrabFood' | 'ShopeeFood' | 'TikTok Shop';
  totalRevenue: number;
  totalHpp: number;
  profit: number;
}

export interface CashFlowEntry {
  id: string;
  date: string;
  type: 'in' | 'out';
  category: string;
  description: string;
  amount: number;
}

export interface BusinessSettings {
  businessName: string;
  category: BusinessCategory;
  region: MarketRegion;
  marginThreshold: number; // e.g., 25%
  monthlyRevenueTarget: number;
  monthlyProfitTarget: number;
  monthlyFixedCost: number;
  darkMode: boolean;
}

export interface SmartAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  productId?: string;
  ingredientId?: string;
}

export interface MarketPriceRange {
  region: MarketRegion;
  minPrice: number;
  medianPrice: number;
  maxPrice: number;
}
