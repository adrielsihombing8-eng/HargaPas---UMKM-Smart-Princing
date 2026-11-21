import { supabase } from '../lib/supabase';
import {
  AuthUser,
  BusinessSettings,
  CashFlowEntry,
  Ingredient,
  Product,
  SaleTransaction,
} from '../types/hargapas';
import {
  SEED_CASHFLOW,
  SEED_INGREDIENTS,
  SEED_PRODUCTS,
  SEED_SETTINGS,
  SEED_TRANSACTIONS,
} from '../data/seedData';

export interface WorkspaceSnapshot {
  ingredients: Ingredient[];
  products: Product[];
  transactions: SaleTransaction[];
  cashFlow: CashFlowEntry[];
  settings: BusinessSettings;
}

/**
 * Trigger Google OAuth sign-in via Supabase Auth.
 * User will be redirected to Google's consent screen and returned to `window.location.origin`.
 */
export async function signInWithGoogleOAuth(): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: 'Supabase belum dikonfigurasi.' };

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * Sign in with Email & Password using Supabase Auth.
 */
export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: 'Supabase belum dikonfigurasi.' };

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * Register a new UMKM user with Email, Password, Name & Business Name.
 */
export async function signUpWithEmailPassword(params: {
  name: string;
  email: string;
  password: string;
  businessName: string;
}): Promise<{ ok: boolean; needsEmailConfirmation?: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: 'Supabase belum dikonfigurasi.' };

  const { data, error } = await supabase.auth.signUp({
    email: params.email.trim(),
    password: params.password,
    options: {
      data: {
        full_name: params.name.trim(),
        business_name: params.businessName.trim(),
      },
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return {
    ok: true,
    needsEmailConfirmation: !data.session,
  };
}

export async function signOutSupabase(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/**
 * Fetches or initializes the user's profile from `public.profiles`.
 */
export async function fetchUserProfile(authUserId: string, fallbackEmail: string): Promise<AuthUser> {
  if (!supabase) {
    return {
      id: authUserId,
      name: fallbackEmail.split('@')[0],
      email: fallbackEmail,
      businessName: SEED_SETTINGS.businessName,
      role: 'Owner UMKM',
    };
  }

  const { data } = await supabase
    .from('profiles')
    .select('id, name, email, business_name, role')
    .eq('id', authUserId)
    .maybeSingle();

  if (data) {
    return {
      id: data.id,
      name: data.name,
      email: data.email || fallbackEmail,
      businessName: data.business_name,
      role: data.role === 'Kasir' ? 'Kasir' : 'Owner UMKM',
    };
  }

  return {
    id: authUserId,
    name: fallbackEmail.split('@')[0],
    email: fallbackEmail,
    businessName: SEED_SETTINGS.businessName,
    role: 'Owner UMKM',
  };
}

/**
 * Seeds starter UMKM café data into Supabase for a brand-new user so charts,
 * inventory, and HPP calculator are immediately populated.
 */
export async function seedStarterWorkspaceInDb(
  userId: string,
  businessName?: string
): Promise<WorkspaceSnapshot> {
  if (!supabase) {
    return {
      ingredients: SEED_INGREDIENTS,
      products: SEED_PRODUCTS,
      transactions: SEED_TRANSACTIONS,
      cashFlow: SEED_CASHFLOW,
      settings: {
        ...SEED_SETTINGS,
        businessName: businessName || SEED_SETTINGS.businessName,
      },
    };
  }

  // 1. Upsert business settings
  const targetBizName = businessName || SEED_SETTINGS.businessName;
  await supabase.from('business_settings').upsert({
    user_id: userId,
    business_name: targetBizName,
    category: SEED_SETTINGS.category,
    region: SEED_SETTINGS.region,
    margin_threshold: SEED_SETTINGS.marginThreshold,
    monthly_revenue_target: SEED_SETTINGS.monthlyRevenueTarget,
    monthly_profit_target: SEED_SETTINGS.monthlyProfitTarget,
    monthly_fixed_cost: SEED_SETTINGS.monthlyFixedCost,
    dark_mode: SEED_SETTINGS.darkMode,
  });

  // 2. Insert starter ingredients & map old seed IDs -> new UUIDs
  const ingIdMap = new Map<string, string>();
  for (const ing of SEED_INGREDIENTS) {
    const { data: insertedIng } = await supabase
      .from('ingredients')
      .insert({
        user_id: userId,
        name: ing.name,
        unit: ing.unit,
        price_per_unit: ing.pricePerUnit,
        stock: ing.stock,
        min_stock: ing.minStock,
        supplier: ing.supplier,
      })
      .select('id')
      .single();

    if (insertedIng?.id) {
      ingIdMap.set(ing.id, insertedIng.id);
      if (ing.priceHistory.length > 0) {
        await supabase.from('ingredient_price_history').insert(
          ing.priceHistory.map((ph) => ({
            ingredient_id: insertedIng.id,
            user_id: userId,
            date: ph.date,
            price_per_unit: ph.pricePerUnit,
            note: ph.note,
          }))
        );
      }
    }
  }

  // 3. Insert starter products & BOM items
  const prodIdMap = new Map<string, string>();
  for (const prod of SEED_PRODUCTS) {
    const { data: insertedProd } = await supabase
      .from('products')
      .insert({
        user_id: userId,
        name: prod.name,
        category: prod.category,
        selling_price: prod.sellingPrice,
        labor_cost_per_unit: prod.laborCostPerUnit,
        overhead_cost_per_unit: prod.overheadCostPerUnit,
        is_active: prod.isActive,
      })
      .select('id')
      .single();

    if (insertedProd?.id) {
      prodIdMap.set(prod.id, insertedProd.id);
      const bomRows = prod.bom
        .map((b) => ({
          product_id: insertedProd.id,
          ingredient_id: ingIdMap.get(b.ingredientId),
          user_id: userId,
          qty_per_unit: b.qtyPerUnit,
        }))
        .filter((row): row is { product_id: string; ingredient_id: string; user_id: string; qty_per_unit: number } =>
          Boolean(row.ingredient_id)
        );

      if (bomRows.length > 0) {
        await supabase.from('product_bom_items').insert(bomRows);
      }
    }
  }

  // 4. Insert starter sales & cash flow
  await supabase.from('sale_transactions').insert(
    SEED_TRANSACTIONS.map((tx) => ({
      user_id: userId,
      date: tx.date,
      product_id: prodIdMap.get(tx.productId) ?? null,
      product_name: tx.productName,
      qty: tx.qty,
      unit_price: tx.unitPrice,
      unit_hpp: tx.unitHpp,
      channel: tx.channel,
      total_revenue: tx.totalRevenue,
      total_hpp: tx.totalHpp,
      profit: tx.profit,
    }))
  );

  await supabase.from('cash_flow_entries').insert(
    SEED_CASHFLOW.map((cf) => ({
      user_id: userId,
      date: cf.date,
      type: cf.type,
      category: cf.category,
      description: cf.description,
      amount: cf.amount,
    }))
  );

  return fetchWorkspaceSnapshot(userId);
}

/**
 * Loads all workspace tables for the authenticated user from Supabase.
 * If the user has zero ingredients & products yet, automatically seeds starter data once.
 */
export async function fetchWorkspaceSnapshot(userId: string): Promise<WorkspaceSnapshot> {
  if (!supabase) {
    return {
      ingredients: SEED_INGREDIENTS,
      products: SEED_PRODUCTS,
      transactions: SEED_TRANSACTIONS,
      cashFlow: SEED_CASHFLOW,
      settings: SEED_SETTINGS,
    };
  }

  const [
    { data: settingsRow },
    { data: ingRows },
    { data: historyRows },
    { data: prodRows },
    { data: bomRows },
    { data: saleRows },
    { data: cfRows },
  ] = await Promise.all([
    supabase.from('business_settings').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('ingredients').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('ingredient_price_history').select('*').eq('user_id', userId).order('date'),
    supabase.from('products').select('*').eq('user_id', userId).order('created_at'),
    supabase.from('product_bom_items').select('*').eq('user_id', userId),
    supabase.from('sale_transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
    supabase.from('cash_flow_entries').select('*').eq('user_id', userId).order('date', { ascending: false }),
  ]);

  // New user starts with a clean empty workspace (ingredients, products, sales, cashFlow = [])

  const settings: BusinessSettings = settingsRow
    ? {
        businessName: settingsRow.business_name,
        category: settingsRow.category,
        region: settingsRow.region,
        marginThreshold: Number(settingsRow.margin_threshold),
        monthlyRevenueTarget: Number(settingsRow.monthly_revenue_target),
        monthlyProfitTarget: Number(settingsRow.monthly_profit_target),
        monthlyFixedCost: Number(settingsRow.monthly_fixed_cost),
        darkMode: Boolean(settingsRow.dark_mode),
      }
    : SEED_SETTINGS;

  const ingredients: Ingredient[] = (ingRows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    unit: row.unit,
    pricePerUnit: Number(row.price_per_unit),
    stock: Number(row.stock),
    minStock: Number(row.min_stock),
    supplier: row.supplier ?? '',
    priceHistory: (historyRows ?? [])
      .filter((h) => h.ingredient_id === row.id)
      .map((h) => ({
        id: h.id,
        date: h.date,
        pricePerUnit: Number(h.price_per_unit),
        note: h.note ?? '',
      })),
  }));

  const products: Product[] = (prodRows ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    sellingPrice: Number(row.selling_price),
    laborCostPerUnit: Number(row.labor_cost_per_unit),
    overheadCostPerUnit: Number(row.overhead_cost_per_unit),
    isActive: Boolean(row.is_active),
    bom: (bomRows ?? [])
      .filter((b) => b.product_id === row.id)
      .map((b) => ({
        ingredientId: b.ingredient_id,
        qtyPerUnit: Number(b.qty_per_unit),
      })),
  }));

  const transactions: SaleTransaction[] = (saleRows ?? []).map((row) => ({
    id: row.id,
    date: row.date,
    productId: row.product_id ?? '',
    productName: row.product_name,
    qty: Number(row.qty),
    unitPrice: Number(row.unit_price),
    unitHpp: Number(row.unit_hpp),
    channel: row.channel,
    totalRevenue: Number(row.total_revenue),
    totalHpp: Number(row.total_hpp),
    profit: Number(row.profit),
  }));

  const cashFlow: CashFlowEntry[] = (cfRows ?? []).map((row) => ({
    id: row.id,
    date: row.date,
    type: row.type,
    category: row.category,
    description: row.description ?? '',
    amount: Number(row.amount),
  }));

  return { ingredients, products, transactions, cashFlow, settings };
}

export async function syncSettingsToDb(userId: string, settings: BusinessSettings) {
  if (!supabase) return;
  await supabase.from('business_settings').upsert({
    user_id: userId,
    business_name: settings.businessName,
    category: settings.category,
    region: settings.region,
    margin_threshold: settings.marginThreshold,
    monthly_revenue_target: settings.monthlyRevenueTarget,
    monthly_profit_target: settings.monthlyProfitTarget,
    monthly_fixed_cost: settings.monthlyFixedCost,
    dark_mode: settings.darkMode,
    updated_at: new Date().toISOString(),
  });
}

export async function addIngredientToDb(
  userId: string,
  ing: Omit<Ingredient, 'id' | 'priceHistory'>
): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from('ingredients')
    .insert({
      user_id: userId,
      name: ing.name,
      unit: ing.unit,
      price_per_unit: ing.pricePerUnit,
      stock: ing.stock,
      min_stock: ing.minStock,
      supplier: ing.supplier,
    })
    .select('id')
    .single();

  if (data?.id) {
    await supabase.from('ingredient_price_history').insert({
      ingredient_id: data.id,
      user_id: userId,
      date: new Date().toISOString().slice(0, 10),
      price_per_unit: ing.pricePerUnit,
      note: 'Harga awal input',
    });
    return data.id;
  }
  return null;
}

export async function updateIngredientPriceInDb(
  userId: string,
  ingredientId: string,
  newPrice: number,
  note: string
) {
  if (!supabase) return;
  await supabase
    .from('ingredients')
    .update({ price_per_unit: newPrice, updated_at: new Date().toISOString() })
    .eq('id', ingredientId)
    .eq('user_id', userId);

  await supabase.from('ingredient_price_history').insert({
    ingredient_id: ingredientId,
    user_id: userId,
    date: new Date().toISOString().slice(0, 10),
    price_per_unit: newPrice,
    note,
  });
}

export async function updateIngredientStockInDb(
  userId: string,
  ingredientId: string,
  newStock: number
) {
  if (!supabase) return;
  await supabase
    .from('ingredients')
    .update({ stock: newStock, updated_at: new Date().toISOString() })
    .eq('id', ingredientId)
    .eq('user_id', userId);
}

export async function addProductToDb(
  userId: string,
  prod: Omit<Product, 'id'>
): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from('products')
    .insert({
      user_id: userId,
      name: prod.name,
      category: prod.category,
      selling_price: prod.sellingPrice,
      labor_cost_per_unit: prod.laborCostPerUnit,
      overhead_cost_per_unit: prod.overheadCostPerUnit,
      is_active: prod.isActive,
    })
    .select('id')
    .single();

  if (data?.id && prod.bom.length > 0) {
    await supabase.from('product_bom_items').insert(
      prod.bom.map((b) => ({
        product_id: data.id,
        ingredient_id: b.ingredientId,
        user_id: userId,
        qty_per_unit: b.qtyPerUnit,
      }))
    );
  }
  return data?.id ?? null;
}

export async function updateProductInDb(userId: string, prod: Product) {
  if (!supabase) return;
  await supabase
    .from('products')
    .update({
      name: prod.name,
      category: prod.category,
      selling_price: prod.sellingPrice,
      labor_cost_per_unit: prod.laborCostPerUnit,
      overhead_cost_per_unit: prod.overheadCostPerUnit,
      is_active: prod.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', prod.id)
    .eq('user_id', userId);

  await supabase
    .from('product_bom_items')
    .delete()
    .eq('product_id', prod.id)
    .eq('user_id', userId);

  if (prod.bom.length > 0) {
    await supabase.from('product_bom_items').insert(
      prod.bom.map((b) => ({
        product_id: prod.id,
        ingredient_id: b.ingredientId,
        user_id: userId,
        qty_per_unit: b.qtyPerUnit,
      }))
    );
  }
}

export async function deleteProductInDb(userId: string, productId: string) {
  if (!supabase) return;
  await supabase.from('products').delete().eq('id', productId).eq('user_id', userId);
}

export async function insertSaleInDb(userId: string, tx: Omit<SaleTransaction, 'id'>) {
  if (!supabase) return;
  await supabase.from('sale_transactions').insert({
    user_id: userId,
    date: tx.date,
    product_id: tx.productId || null,
    product_name: tx.productName,
    qty: tx.qty,
    unit_price: tx.unitPrice,
    unit_hpp: tx.unitHpp,
    channel: tx.channel,
    total_revenue: tx.totalRevenue,
    total_hpp: tx.totalHpp,
    profit: tx.profit,
  });
}

export async function insertCashFlowInDb(userId: string, entry: Omit<CashFlowEntry, 'id'>) {
  if (!supabase) return;
  await supabase.from('cash_flow_entries').insert({
    user_id: userId,
    date: entry.date,
    type: entry.type,
    category: entry.category,
    description: entry.description,
    amount: entry.amount,
  });
}

export async function resetUserWorkspaceInDb(userId: string): Promise<WorkspaceSnapshot> {
  if (!supabase) {
    return {
      ingredients: SEED_INGREDIENTS,
      products: SEED_PRODUCTS,
      transactions: SEED_TRANSACTIONS,
      cashFlow: SEED_CASHFLOW,
      settings: SEED_SETTINGS,
    };
  }

  await Promise.all([
    supabase.from('sale_transactions').delete().eq('user_id', userId),
    supabase.from('cash_flow_entries').delete().eq('user_id', userId),
    supabase.from('products').delete().eq('user_id', userId),
    supabase.from('ingredients').delete().eq('user_id', userId),
  ]);

  return seedStarterWorkspaceInDb(userId);
}
