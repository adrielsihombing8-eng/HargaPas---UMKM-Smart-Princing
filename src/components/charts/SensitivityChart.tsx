import React, { useState } from 'react';
import { formatCompactIDR, formatIDR } from '../../utils/format';

export interface SensitivityPoint {
  deltaPercent: number;
  label: string;
  projectedProfit: number;
}

interface SensitivityChartProps {
  points: SensitivityPoint[];
  baselineProfit: number;
}

export const SensitivityChart: React.FC<SensitivityChartProps> = ({
  points,
  baselineProfit,
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const width = 560;
  const height = 210;
  const padLeft = 58;
  const padRight = 18;
  const padTop = 18;
  const padBottom = 30;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const allVals = [...points.map((p) => p.projectedProfit), baselineProfit, 0];
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals, 100_000) * 1.1;
  const range = Math.max(maxVal - minVal, 1);

  const getX = (idx: number) =>
    padLeft + (points.length <= 1 ? plotW / 2 : (idx / (points.length - 1)) * plotW);
  const getY = (val: number) => padTop + plotH - ((val - minVal) / range) * plotH;

  const linePts = points.map((p, i) => `${getX(i)},${getY(p.projectedProfit)}`).join(' ');
  const active = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
        onMouseLeave={() => setHoverIdx(null)}
      >
        {minVal < 0 && maxVal > 0 && (
          <line
            x1={padLeft}
            y1={getY(0)}
            x2={width - padRight}
            y2={getY(0)}
            stroke="#FDA4AF"
            strokeDasharray="4 4"
            strokeWidth={1.2}
          />
        )}

        <line
          x1={padLeft}
          y1={getY(baselineProfit)}
          x2={width - padRight}
          y2={getY(baselineProfit)}
          stroke="#0D9488"
          strokeOpacity={0.35}
          strokeDasharray="4 4"
          strokeWidth={1.2}
        />

        {[minVal, (minVal + maxVal) / 2, maxVal].map((val, i) => (
          <text
            key={i}
            x={padLeft - 8}
            y={getY(val) + 4}
            textAnchor="end"
            className="fill-[#6B7280] dark:fill-[#94A3B8] text-[10px] font-medium"
          >
            {formatCompactIDR(val).replace('Rp ', '')}
          </text>
        ))}

        <polyline
          fill="none"
          stroke="#0D9488"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={linePts}
          className="dark:stroke-[#14B8A6]"
        />

        {points.map((p, i) => (
          <g key={p.label}>
            <circle
              cx={getX(i)}
              cy={getY(p.projectedProfit)}
              r={hoverIdx === i ? 6 : 4.5}
              fill={p.projectedProfit >= baselineProfit ? '#5EEAD4' : '#FDE68A'}
              stroke="#0F766E"
              strokeWidth={1.8}
              className="transition-all duration-150"
            />
            <text
              x={getX(i)}
              y={height - 8}
              textAnchor="middle"
              className="fill-[#6B7280] dark:fill-[#94A3B8] text-[10px] font-medium"
            >
              {p.label}
            </text>
            <rect
              x={getX(i) - plotW / points.length / 2}
              y={padTop}
              width={plotW / points.length}
              height={plotH}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoverIdx(i)}
            />
          </g>
        ))}
      </svg>

      {active && (
        <div className="pointer-events-none absolute top-2 right-2 rounded-2xl bg-[#CCFBF1]/95 dark:bg-[#0F172A]/95 text-[#134E4A] dark:text-[#CBD5E1] px-3 py-2 text-xs shadow-lg border border-[#99F6E4] dark:border-[#334155]">
          <div className="text-[#0F766E] dark:text-[#5EEAD4] font-semibold">
            Perubahan Harga Jual {active.label}
          </div>
          <div className="mt-0.5 tabular-nums">Proyeksi Laba: {formatIDR(active.projectedProfit)}</div>
        </div>
      )}
    </div>
  );
};
