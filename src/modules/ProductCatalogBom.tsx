import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import { useHargaPas } from '../store/HargaPasContext';
import {
  calculateMarginPercent,
  calculateProductHpp,
  calculateProductMaterialCost,
  getMarginStatus,
} from '../utils/finance';
import { formatIDR, formatPercent } from '../utils/format';
import { PointerCard } from '../components/ui/PointerCard';
import { PressButton } from '../components/ui/PressButton';

export const ProductCatalogBom: React.FC = () => {
  const { products, ingredients, settings, updateProduct, deleteProduct } = useHargaPas();
  const [expandedId, setExpandedId] = useState<string | null>(products[0]?.id ?? null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Katalog Produk & Resep (BOM)</h1>
        <p className="text-sm text-[#52605a] dark:text-slate-400 mt-0.5">
          Pantau status margin setiap menu dan rincian takaran bahan baku per porsi.
        </p>
      </div>

      <div className="space-y-4">
        {products.map((product) => {
          const materialCost = calculateProductMaterialCost(product, ingredients);
          const hpp = calculateProductHpp(product, ingredients);
          const margin = calculateMarginPercent(product.sellingPrice, hpp);
          const status = getMarginStatus(margin, settings.marginThreshold);
          const isExpanded = expandedId === product.id;

          const statusStyle =
            status === 'aman'
              ? 'bg-[#7bdc93]/25 text-[#1f4d3d] dark:text-[#7bdc93]'
              : status === 'waspada'
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
              : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300';

          const statusLabel =
            status === 'aman' ? 'Margin Aman' : status === 'waspada' ? 'Margin Waspada' : 'Margin Kritis';

          return (
            <PointerCard key={product.id} className="p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-base font-bold">{product.name}</h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#2c5f4e]/10 dark:bg-slate-800 text-[#2c5f4e] dark:text-slate-300 font-medium">
                      {product.category}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${statusStyle}`}>
                      {statusLabel} ({formatPercent(margin)})
                    </span>
                  </div>
                  <div className="text-xs text-[#52605a] dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      HPP: <strong className="text-[#030213] dark:text-white tabular-nums">{formatIDR(hpp)}</strong>
                    </span>
                    <span>
                      Harga Jual:{' '}
                      <strong className="text-[#2c5f4e] dark:text-[#7bdc93] tabular-nums">
                        {formatIDR(product.sellingPrice)}
                      </strong>
                    </span>
                    <span>
                      Laba/porsi:{' '}
                      <strong className="tabular-nums">{formatIDR(product.sellingPrice - hpp)}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {editingId === product.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step={500}
                        value={editPrice}
                        onChange={(e) => setEditPrice(Math.max(0, Number(e.target.value)))}
                        className="w-28 rounded-xl border border-[#2c5f4e]/25 px-3 py-1.5 text-sm tabular-nums bg-white dark:bg-slate-800"
                      />
                      <PressButton
                        size="sm"
                        variant="mint"
                        onClick={() => {
                          updateProduct({ ...product, sellingPrice: editPrice });
                          setEditingId(null);
                        }}
                      >
                        Simpan
                      </PressButton>
                      <PressButton
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                      >
                        Batal
                      </PressButton>
                    </div>
                  ) : (
                    <PressButton
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditingId(product.id);
                        setEditPrice(product.sellingPrice);
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Ubah Harga
                    </PressButton>
                  )}

                  <PressButton
                    size="sm"
                    variant="ghost"
                    onClick={() => setExpandedId(isExpanded ? null : product.id)}
                  >
                    Resep BOM ({product.bom.length})
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </PressButton>

                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 btn-press cursor-pointer"
                    aria-label="Hapus produk"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-5 pt-4 border-t border-[#2c5f4e]/10 dark:border-slate-800">
                  <div className="text-xs font-semibold text-[#52605a] dark:text-slate-400 mb-3">
                    Komposisi Bill of Materials (BOM) per 1 Porsi
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-[#52605a] dark:text-slate-400 border-b border-[#2c5f4e]/10 dark:border-slate-800">
                          <th className="pb-2 font-medium">Bahan Baku</th>
                          <th className="pb-2 font-medium">Takaran</th>
                          <th className="pb-2 font-medium">Harga Satuan</th>
                          <th className="pb-2 font-medium text-right">Biaya / Porsi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2c5f4e]/5 dark:divide-slate-800/60">
                        {product.bom.map((item) => {
                          const ing = ingredients.find((i) => i.id === item.ingredientId);
                          if (!ing) return null;
                          const cost = ing.pricePerUnit * item.qtyPerUnit;
                          return (
                            <tr key={item.ingredientId}>
                              <td className="py-2.5 font-medium">{ing.name}</td>
                              <td className="py-2.5 tabular-nums">
                                {item.qtyPerUnit} {ing.unit}
                              </td>
                              <td className="py-2.5 tabular-nums">
                                {formatIDR(ing.pricePerUnit)}/{ing.unit}
                              </td>
                              <td className="py-2.5 text-right font-semibold tabular-nums">
                                {formatIDR(cost)}
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-[#f8faf9] dark:bg-slate-800/40">
                          <td className="py-2 font-medium" colSpan={3}>
                            Subtotal Bahan Baku
                          </td>
                          <td className="py-2 text-right font-semibold tabular-nums">
                            {formatIDR(materialCost)}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 text-[#52605a] dark:text-slate-400" colSpan={3}>
                            Tenaga Kerja + Operasional per Porsi
                          </td>
                          <td className="py-2 text-right tabular-nums">
                            {formatIDR(product.laborCostPerUnit + product.overheadCostPerUnit)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </PointerCard>
          );
        })}
      </div>
    </div>
  );
};
