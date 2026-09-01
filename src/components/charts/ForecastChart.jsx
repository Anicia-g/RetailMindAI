'use client';

import React, { useState } from 'react';

export function ForecastChart({
  series = [
    { label: 'Day -14', actual: 4.8, forecast: 4.6, lower: 4.0, upper: 5.2 },
    { label: 'Day -10', actual: 5.2, forecast: 5.0, lower: 4.4, upper: 5.6 },
    { label: 'Day -7', actual: 5.8, forecast: 5.7, lower: 5.0, upper: 6.4 },
    { label: 'Day -3', actual: 6.2, forecast: 6.1, lower: 5.3, upper: 6.9 },
    { label: 'Today', actual: 6.4, forecast: 6.4, lower: 5.6, upper: 7.2 },
    { label: '+3d', actual: null, forecast: 7.2, lower: 6.0, upper: 8.4 },
    { label: '+7d', actual: null, forecast: 7.8, lower: 6.5, upper: 9.1 },
    { label: '+14d', actual: null, forecast: 8.5, lower: 7.0, upper: 10.0 },
    { label: '+30d', actual: null, forecast: 9.2, lower: 7.5, upper: 10.9 },
  ],
  unit = 'units/day',
  height = 240,
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const maxVal = Math.max(...series.map((s) => Math.max(s.upper || 0, s.actual || 0, s.forecast || 0))) * 1.15;
  const minVal = 0;

  const getY = (val) => {
    if (val === null || val === undefined) return 0;
    return height - ((val - minVal) / (maxVal - minVal)) * (height - 40) - 20;
  };

  const getX = (idx) => {
    return (idx / (series.length - 1)) * 90 + 5; // percentage width
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-800 dark:bg-slate-200" />
            <span>Historical Actuals</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span>AI ML Forecast</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded-sm bg-indigo-500/15 border border-indigo-400/30" />
            <span>95% Confidence Band</span>
          </div>
        </div>

        {hoveredPoint !== null && (
          <div className="font-semibold text-indigo-600 dark:text-indigo-400 animate-fade-in">
            {series[hoveredPoint].label}: {series[hoveredPoint].actual !== null ? `Actual: ${series[hoveredPoint].actual} ` : ''}
            Forecast: {series[hoveredPoint].forecast} {unit}
          </div>
        )}
      </div>

      <div className="relative w-full border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50/40 dark:bg-slate-900/40" style={{ height: `${height}px` }}>
        {/* SVG Visualization */}
        <svg className="w-full h-full overflow-visible">
          {/* Confidence interval area (polygon) */}
          <polygon
            points={series
              .map((pt, i) => `${getX(i)}%,${getY(pt.upper)}`)
              .concat(series.slice().reverse().map((pt, i) => `${getX(series.length - 1 - i)}%,${getY(pt.lower)}`))
              .join(' ')}
            className="fill-indigo-500/15 dark:fill-indigo-500/20"
          />

          {/* Historical line */}
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-slate-700 dark:text-slate-200"
            points={series
              .filter((pt) => pt.actual !== null)
              .map((pt, i) => `${getX(i)}%,${getY(pt.actual)}`)
              .join(' ')}
          />

          {/* Forecast line (dashed) */}
          <polyline
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeDasharray="4 4"
            points={series
              .map((pt, i) => `${getX(i)}%,${getY(pt.forecast)}`)
              .join(' ')}
          />

          {/* Data Points */}
          {series.map((pt, idx) => {
            const isForecastOnly = pt.actual === null;
            const y = getY(isForecastOnly ? pt.forecast : pt.actual);
            const x = getX(idx);

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredPoint(idx)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={`${x}%`}
                  cy={y}
                  r={hoveredPoint === idx ? 6 : 4}
                  className={isForecastOnly ? 'fill-indigo-500 stroke-white dark:stroke-slate-900 stroke-2' : 'fill-slate-800 dark:fill-slate-100 stroke-white dark:stroke-slate-900 stroke-2'}
                />
              </g>
            );
          })}
        </svg>

        {/* X Axis Labels */}
        <div className="absolute bottom-1 left-0 right-0 flex justify-between px-3 text-[10px] font-semibold text-slate-400 dark:text-slate-500 pointer-events-none">
          {series.map((pt, idx) => (
            <span key={idx} style={{ left: `${getX(idx)}%` }} className="truncate max-w-[50px] text-center">
              {pt.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
