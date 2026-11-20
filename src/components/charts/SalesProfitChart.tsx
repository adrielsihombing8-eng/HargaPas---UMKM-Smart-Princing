import React, { useState } from 'react';
import { formatCompactIDR, formatIDR, formatShortDate } from '../../utils/format';

export interface DailyChartPoint {
  date: string;
  revenue: number;
  profit: number;
}

interface SalesProfitChartProps {
  data: DailyChartPoint[];
}

export const SalesProfitChart: React.FC<SalesProfitChartProps> = ({ data }) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-[#5A4636] dark:text-[#D5C3B3]">
        Belum ada data transaksi 14 hari terakhir.
      </div>
    );
  }

  const width = 720;
  const height = 250;
  const padLeft = 58;
  const padRight = 18;
  const padTop = 20;
  const padBottom = 34;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const maxVal = Math.max(...data.map((d) => d.revenue), 100_000) * 1.15;

  const getX = (idx: number) =>
    padLeft + (data.length === 1 ? plotW / 2 : (idx / (data.length - 1)) * plotW);
  const getY = (val: number) => padTop + plotH - (val / maxVal) * plotH;

  const revenuePoints = data.map((d, i) => `${getX(i)},${getY(d.revenue)}`).join(' ');
  const profitPoints = data.map((d, i) => `${getX(i)},${getY(d.profit)}`).join(' ');

  const revenueArea = `${padLeft},${padTop + plotH} ${revenuePoints} ${getX(
    data.length - 1
  )},${padTop + plotH}`;
  const profitArea = `${padLeft},${padTop + plotH} ${profitPoints} ${getX(
    data.length - 1
  )},${padTop + plotH}`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => maxVal * t);
  const activePoint = hoverIdx !== null ? data[hoverIdx] : null;

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C68B59" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#C68B59" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C68B59" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#C68B59" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {yTicks.map((val, i) => {
          const y = getY(val);
          return (
            <g key={i}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="currentColor"
                className="text-[#E2D3C1] dark:text-[#4E372B]"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-[#5A4636] dark:fill-[#D5C3B3] text-[10px] font-medium"
              >
                {formatCompactIDR(val).replace('Rp ', '')}
              </text>
            </g>
          );
        })}

        <polygon points={revenueArea} fill="url(#revGrad)" />
        <polygon points={profitArea} fill="url(#profGrad)" />

        <polyline
          fill="none"
          stroke="#C68B59"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={revenuePoints}
          className="dark:stroke-[#C68B59]"
        />
        <polyline
          fill="none"
          stroke="#C68B59"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={profitPoints}
          className="dark:stroke-[#C68B59]"
        />

        {data.map((d, i) => {
          if (i % 2 !== 0 && i !== data.length - 1) return null;
          return (
            <text
              key={d.date}
              x={getX(i)}
              y={height - 8}
              textAnchor="middle"
              className="fill-[#5A4636] dark:fill-[#D5C3B3] text-[10px] font-medium"
            >
              {formatShortDate(d.date)}
            </text>
          );
        })}

        {hoverIdx !== null && activePoint && (
          <g>
            <line
              x1={getX(hoverIdx)}
              y1={padTop}
              x2={getX(hoverIdx)}
              y2={padTop + plotH}
              stroke="#C68B59"
              strokeOpacity={0.35}
              strokeDasharray="3 3"
              strokeWidth={1.5}
            />
            <circle
              cx={getX(hoverIdx)}
              cy={getY(activePoint.revenue)}
              r={5}
              fill="#C68B59"
              stroke="#ffffff"
              strokeWidth={2}
            />
            <circle
              cx={getX(hoverIdx)}
              cy={getY(activePoint.profit)}
              r={5}
              fill="#C68B59"
              stroke="#A8703F"
              strokeWidth={2}
            />
          </g>
        )}

        {data.map((d, i) => {
          const colW = plotW / data.length;
          return (
            <rect
              key={d.date}
              x={getX(i) - colW / 2}
              y={padTop}
              width={colW}
              height={plotH}
              fill="transparent"
              className="cursor-crosshair"
              onMouseEnter={() => setHoverIdx(i)}
            />
          );
        })}
      </svg>

      {hoverIdx !== null && activePoint && (
        <div className="pointer-events-none absolute top-2 right-3 rounded-2xl bg-[#EFE3D3]/95 dark:bg-[#2B1B14]/95 text-[#2B1B14] dark:text-[#FAF6F0] px-3.5 py-2.5 text-xs shadow-lg border border-[#C68B59] dark:border-[#4E372B]">
          <div className="font-semibold text-[#A8703F] dark:text-[#C68B59] mb-1">
            {formatShortDate(activePoint.date)}
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#5A4636] dark:text-[#D5C3B3]">Omzet:</span>
            <span className="font-semibold tabular-nums">{formatIDR(activePoint.revenue)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#5A4636] dark:text-[#D5C3B3]">Laba Kotor:</span>
            <span className="font-semibold text-[#C68B59] dark:text-[#C68B59] tabular-nums">
              {formatIDR(activePoint.profit)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
