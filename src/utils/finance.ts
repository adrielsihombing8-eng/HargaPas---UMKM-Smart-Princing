import { Ingredient, Product, SmartAlert } from '../types/hargapas';

export function calculateProductMaterialCost(
  product: Product,
  ingredients: Ingredient[]
): number {
  return product.bom.reduce((sum, item) => {
    const ing = ingredients.find((i) => i.id === item.ingredientId);
    if (!ing) return sum;
    return sum + ing.pricePerUnit * item.qtyPerUnit;
  }, 0);
}

export function calculateProductHpp(
  product: Product,
  ingredients: Ingredient[]
): number {
  const materialCost = calculateProductMaterialCost(product, ingredients);
  return materialCost + product.laborCostPerUnit + product.overheadCostPerUnit;
}

export function calculateMarginPercent(sellingPrice: number, hpp: number): number {
  if (sellingPrice <= 0) return 0;
  return ((sellingPrice - hpp) / sellingPrice) * 100;
}

export function calculateMarkupPercent(sellingPrice: number, hpp: number): number {
  if (hpp <= 0) return 0;
  return ((sellingPrice - hpp) / hpp) * 100;
}

export function calculateSellingPriceFromMargin(hpp: number, targetMarginPercent: number): number {
  const clamped = Math.min(Math.max(targetMarginPercent, 0), 95);
  return hpp / (1 - clamped / 100);
}

export function calculateOnlinePrice(netPrice: number, commissionPercent: number): number {
  const clamped = Math.min(Math.max(commissionPercent, 0), 90);
  return netPrice / (1 - clamped / 100);
}

export function getMarginStatus(
  marginPercent: number,
  threshold: number
): 'aman' | 'waspada' | 'kritis' {
  if (marginPercent < threshold - 5) return 'kritis';
  if (marginPercent < threshold) return 'waspada';
  return 'aman';
}

export function generateSmartAlerts(
  products: Product[],
  ingredients: Ingredient[],
  marginThreshold: number
): SmartAlert[] {
  const alerts: SmartAlert[] = [];

  // 1. Check ingredient price spikes from history
  for (const ing of ingredients) {
    if (ing.priceHistory.length >= 2) {
      const latest = ing.priceHistory[ing.priceHistory.length - 1];
      const prev = ing.priceHistory[ing.priceHistory.length - 2];
      if (latest.pricePerUnit > prev.pricePerUnit) {
        const pct = ((latest.pricePerUnit - prev.pricePerUnit) / prev.pricePerUnit) * 100;
        const affected = products.filter((p) =>
          p.bom.some((b) => b.ingredientId === ing.id)
        );
        if (affected.length > 0 && pct >= 5) {
          alerts.push({
            id: `spike-${ing.id}`,
            severity: pct >= 10 ? 'critical' : 'warning',
            title: `Harga ${ing.name} naik +${pct.toFixed(1)}%`,
            message: `Kenaikan harga ${ing.name} berdampak pada ${affected
              .map((p) => p.name)
              .join(', ')}. Pertimbangkan penyesuaian harga jual atau porsi.`,
            ingredientId: ing.id,
          });
        }
      }
    }

    // 2. Check low stock
    if (ing.stock <= ing.minStock) {
      alerts.push({
        id: `stock-${ing.id}`,
        severity: ing.stock <= ing.minStock * 0.5 ? 'critical' : 'warning',
        title: `Stok ${ing.name} menipis (${ing.stock} ${ing.unit})`,
        message: `Stok di bawah batas minimum (${ing.minStock} ${ing.unit}). Segera lakukan restok dari ${ing.supplier}.`,
        ingredientId: ing.id,
      });
    }
  }

  // 3. Check product margin below threshold
  for (const p of products) {
    if (!p.isActive) continue;
    const hpp = calculateProductHpp(p, ingredients);
    const margin = calculateMarginPercent(p.sellingPrice, hpp);
    if (margin < marginThreshold) {
      alerts.push({
        id: `margin-${p.id}`,
        severity: margin < marginThreshold - 5 ? 'critical' : 'warning',
        title: `Margin ${p.name} di bawah batas (${margin.toFixed(1)}%)`,
        message: `Target aman margin adalah ${marginThreshold}%. Naikkan harga jual atau optimalkan biaya bahan baku.`,
        productId: p.id,
      });
    }
  }

  return alerts;
}
