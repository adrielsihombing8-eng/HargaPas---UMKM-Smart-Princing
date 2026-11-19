import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  BusinessSettings,
  CashFlowEntry,
  Ingredient,
  Product,
  SaleTransaction,
  SmartAlert,
} from '../types/hargapas';
import {
  SEED_CASHFLOW,
  SEED_INGREDIENTS,
  SEED_PRODUCTS,
  SEED_SETTINGS,
  SEED_TRANSACTIONS,
} from '../data/seedData';
import { calculateProductHpp, generateSmartAlerts } from '../utils/finance';

interface HargaPasState {
  ingredients: Ingredient[];
  products: Product[];
  transactions: SaleTransaction[];
  cashFlow: CashFlowEntry[];
  settings: BusinessSettings;
}

interface HargaPasContextValue extends HargaPasState {
  smartAlerts: SmartAlert[];
  toastMessage: string | null;
  showToast: (msg: string) => void;
  updateSettings: (partial: Partial<BusinessSettings>) => void;
  updateIngredientPrice: (ingredientId: string, newPrice: number, note?: string) => void;
  restockIngredient: (ingredientId: string, addedQty: number) => void;
  addIngredient: (ing: Omit<Ingredient, 'id' | 'priceHistory'>) => void;
  addProduct: (prod: Omit<Product, 'id'>) => void;
  updateProduct: (prod: Product) => void;
  deleteProduct: (productId: string) => void;
  recordSale: (params: {
    productId: string;
    qty: number;
    channel: SaleTransaction['channel'];
    customPrice?: number;
  }) => void;
  addCashFlow: (entry: Omit<CashFlowEntry, 'id'>) => void;
  resetToSeed: () => void;
}

const STORAGE_KEY = 'hargapas_umkm_v1';

const defaultState: HargaPasState = {
  ingredients: SEED_INGREDIENTS,
  products: SEED_PRODUCTS,
  transactions: SEED_TRANSACTIONS,
  cashFlow: SEED_CASHFLOW,
  settings: SEED_SETTINGS,
};

function loadInitialState(): HargaPasState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<HargaPasState>;
    return {
      ingredients: parsed.ingredients ?? SEED_INGREDIENTS,
      products: parsed.products ?? SEED_PRODUCTS,
      transactions: parsed.transactions ?? SEED_TRANSACTIONS,
      cashFlow: parsed.cashFlow ?? SEED_CASHFLOW,
      settings: { ...SEED_SETTINGS, ...(parsed.settings ?? {}) },
    };
  } catch {
    return defaultState;
  }
}

const HargaPasContext = createContext<HargaPasContextValue | null>(null);

export const HargaPasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<HargaPasState>(loadInitialState);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    if (state.settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [state.settings.darkMode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const smartAlerts = useMemo(
    () => generateSmartAlerts(state.products, state.ingredients, state.settings.marginThreshold),
    [state.products, state.ingredients, state.settings.marginThreshold]
  );

  const updateSettings = (partial: Partial<BusinessSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...partial },
    }));
  };

  const updateIngredientPrice = (ingredientId: string, newPrice: number, note = 'Update harga pasar') => {
    const today = new Date().toISOString().slice(0, 10);
    setState((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing) =>
        ing.id === ingredientId
          ? {
              ...ing,
              pricePerUnit: newPrice,
              priceHistory: [
                ...ing.priceHistory,
                { id: `ph-${Date.now()}`, date: today, pricePerUnit: newPrice, note },
              ],
            }
          : ing
      ),
    }));
    showToast('Harga bahan baku diperbarui & HPP otomatis dihitung ulang');
  };

  const restockIngredient = (ingredientId: string, addedQty: number) => {
    setState((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing) =>
        ing.id === ingredientId
          ? { ...ing, stock: Number((ing.stock + addedQty).toFixed(3)) }
          : ing
      ),
    }));
    showToast('Stok bahan baku berhasil ditambahkan');
  };

  const addIngredient = (ing: Omit<Ingredient, 'id' | 'priceHistory'>) => {
    const today = new Date().toISOString().slice(0, 10);
    const newIng: Ingredient = {
      ...ing,
      id: `ing-${Date.now()}`,
      priceHistory: [
        { id: `ph-${Date.now()}`, date: today, pricePerUnit: ing.pricePerUnit, note: 'Stok awal' },
      ],
    };
    setState((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, newIng],
    }));
    showToast(`${ing.name} ditambahkan ke inventaris`);
  };

  const addProduct = (prod: Omit<Product, 'id'>) => {
    const newProd: Product = { ...prod, id: `prod-${Date.now()}` };
    setState((prev) => ({
      ...prev,
      products: [...prev.products, newProd],
    }));
    showToast(`Produk "${prod.name}" disimpan ke katalog`);
  };

  const updateProduct = (prod: Product) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === prod.id ? prod : p)),
    }));
    showToast(`Produk "${prod.name}" diperbarui`);
  };

  const deleteProduct = (productId: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== productId),
    }));
    showToast('Produk dihapus dari katalog');
  };

  const recordSale: HargaPasContextValue['recordSale'] = ({
    productId,
    qty,
    channel,
    customPrice,
  }) => {
    const product = state.products.find((p) => p.id === productId);
    if (!product || qty <= 0) return;

    const unitHpp = calculateProductHpp(product, state.ingredients);
    const unitPrice = customPrice ?? product.sellingPrice;
    const totalRevenue = unitPrice * qty;
    const totalHpp = unitHpp * qty;
    const profit = totalRevenue - totalHpp;
    const today = new Date().toISOString().slice(0, 10);

    const newTx: SaleTransaction = {
      id: `tx-${Date.now()}`,
      date: today,
      productId: product.id,
      productName: product.name,
      qty,
      unitPrice,
      unitHpp,
      channel,
      totalRevenue,
      totalHpp,
      profit,
    };

    const newCash: CashFlowEntry = {
      id: `cf-${Date.now()}`,
      date: today,
      type: 'in',
      category: `Penjualan (${channel})`,
      description: `${qty}x ${product.name}`,
      amount: totalRevenue,
    };

    // Auto-deduct ingredient stock based on product BOM
    const updatedIngredients = state.ingredients.map((ing) => {
      const bomItem = product.bom.find((b) => b.ingredientId === ing.id);
      if (!bomItem) return ing;
      const deducted = bomItem.qtyPerUnit * qty;
      return {
        ...ing,
        stock: Math.max(0, Number((ing.stock - deducted).toFixed(3))),
      };
    });

    setState((prev) => ({
      ...prev,
      ingredients: updatedIngredients,
      transactions: [...prev.transactions, newTx],
      cashFlow: [newCash, ...prev.cashFlow],
    }));

    showToast(`Penjualan ${qty}x ${product.name} tercatat & stok bahan berkurang otomatis`);
  };

  const addCashFlow = (entry: Omit<CashFlowEntry, 'id'>) => {
    setState((prev) => ({
      ...prev,
      cashFlow: [{ ...entry, id: `cf-${Date.now()}` }, ...prev.cashFlow],
    }));
    showToast('Transaksi kas berhasil dicatat');
  };

  const resetToSeed = () => {
    setState(defaultState);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Data dummy berhasil direset ke kondisi awal');
  };

  return (
    <HargaPasContext.Provider
      value={{
        ...state,
        smartAlerts,
        toastMessage,
        showToast,
        updateSettings,
        updateIngredientPrice,
        restockIngredient,
        addIngredient,
        addProduct,
        updateProduct,
        deleteProduct,
        recordSale,
        addCashFlow,
        resetToSeed,
      }}
    >
      {children}
    </HargaPasContext.Provider>
  );
};

export function useHargaPas(): HargaPasContextValue {
  const ctx = useContext(HargaPasContext);
  if (!ctx) throw new Error('useHargaPas must be used within HargaPasProvider');
  return ctx;
}
