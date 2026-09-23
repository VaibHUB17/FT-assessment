"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RouteData, RouteSeriesPoint, AnomalyRow } from "@/types/freight";
import { TrendingUp, AlertCircle, ArrowUpRight } from "lucide-react";

interface RouteCostChartProps {
  routesData: Record<string, RouteData>;
  anomalies: AnomalyRow[];
  onSelectAnomaly?: (anomaly: AnomalyRow) => void;
}

export function RouteCostChart({ routesData, anomalies, onSelectAnomaly }: RouteCostChartProps) {
  const routeNames = useMemo(() => Object.keys(routesData), [routesData]);
  const [selectedRoute, setSelectedRoute] = useState<string>(routeNames[0] || "Mumbai-Pune");
  const [hoveredPoint, setHoveredPoint] = useState<RouteSeriesPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const currentRouteData = routesData[selectedRoute];
  const series = currentRouteData?.series || [];

  // Filter series down to last 52 weeks or all 104 weeks
  const [timeWindow, setTimeWindow] = useState<"all" | "2025" | "2024">("all");

  const filteredSeries = useMemo(() => {
    if (timeWindow === "2024") {
      return series.filter((p) => p.week_of.startsWith("2024"));
    }
    if (timeWindow === "2025") {
      return series.filter((p) => p.week_of.startsWith("2025"));
    }
    return series;
  }, [series, timeWindow]);

  // Chart dimensions & scaling
  const chartHeight = 300;
  const chartWidth = 900;
  const padding = { top: 25, right: 30, bottom: 40, left: 45 };

  const { minVal, maxVal, points } = useMemo(() => {
    if (!filteredSeries.length) return { minVal: 0, maxVal: 5, points: [] };

    let min = Infinity;
    let max = -Infinity;

    filteredSeries.forEach((p) => {
      if (p.cost_per_tonne_km < min) min = p.cost_per_tonne_km;
      if (p.cost_per_tonne_km > max) max = p.cost_per_tonne_km;
      if (p.own_baseline && p.own_baseline < min) min = p.own_baseline;
      if (p.own_baseline && p.own_baseline > max) max = p.own_baseline;
      if (p.peer_baseline && p.peer_baseline < min) min = p.peer_baseline;
      if (p.peer_baseline && p.peer_baseline > max) max = p.peer_baseline;
    });

    const rangePad = (max - min) * 0.15 || 0.5;
    const effMin = Math.max(0, Math.floor((min - rangePad) * 10) / 10);
    const effMax = Math.ceil((max + rangePad) * 10) / 10;

    const innerW = chartWidth - padding.left - padding.right;
    const innerH = chartHeight - padding.top - padding.bottom;

    const pts = filteredSeries.map((p, idx) => {
      const x = padding.left + (idx / Math.max(1, filteredSeries.length - 1)) * innerW;
      const yCost = padding.top + innerH - ((p.cost_per_tonne_km - effMin) / (effMax - effMin)) * innerH;
      const yOwn = p.own_baseline
        ? padding.top + innerH - ((p.own_baseline - effMin) / (effMax - effMin)) * innerH
        : null;
      const yPeer = p.peer_baseline
        ? padding.top + innerH - ((p.peer_baseline - effMin) / (effMax - effMin)) * innerH
        : null;

      return {
        ...p,
        x,
        yCost,
        yOwn,
        yPeer,
      };
    });

    return { minVal: effMin, maxVal: effMax, points: pts };
  }, [filteredSeries]);

  // Generate SVG path strings
  const costPath = useMemo(() => {
    if (!points.length) return "";
    return points.reduce((acc, curr, i) => `${acc} ${i === 0 ? "M" : "L"} ${curr.x.toFixed(1)} ${curr.yCost.toFixed(1)}`, "");
  }, [points]);

  const ownPath = useMemo(() => {
    const valid = points.filter((p) => p.yOwn !== null);
    if (!valid.length) return "";
    return valid.reduce((acc, curr, i) => `${acc} ${i === 0 ? "M" : "L"} ${curr.x.toFixed(1)} ${curr.yOwn!.toFixed(1)}`, "");
  }, [points]);

  const peerPath = useMemo(() => {
    const valid = points.filter((p) => p.yPeer !== null);
    if (!valid.length) return "";
    return valid.reduce((acc, curr, i) => `${acc} ${i === 0 ? "M" : "L"} ${curr.x.toFixed(1)} ${curr.yPeer!.toFixed(1)}`, "");
  }, [points]);

  // Route anomaly count for badge
  const routeAnomalies = useMemo(() => {
    return anomalies.filter((a) => a.route === selectedRoute);
  }, [anomalies, selectedRoute]);

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 backdrop-blur-xl">
      {/* Route Selector & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-4 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Corridor Cost Trend & Baselines
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-white/[0.06] text-slate-300 border border-white/[0.08]">
              {currentRouteData?.route_type}
            </span>
            {routeAnomalies.length > 0 && (
              <span className="text-[11px] px-2 py-0.5 rounded font-mono font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {routeAnomalies.length} Anomaly Events
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            Weekly weighted unit costs (₹/(tonne·km)) plotted against 8-week trailing rolling averages and peer distance tier baselines.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Filter */}
          <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-white/[0.08] text-xs relative">
            {[
              { id: "all" as const, label: "All Time" },
              { id: "2024" as const, label: "2024" },
              { id: "2025" as const, label: "2025" },
            ].map((win) => {
              const isSelected = timeWindow === win.id;
              return (
                <button
                  key={win.id}
                  onClick={() => setTimeWindow(win.id)}
                  className={`relative px-2.5 py-1 rounded font-medium text-xs transition-colors cursor-pointer select-none ${
                    isSelected ? "text-white font-semibold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="chartTimeWindowPill"
                      className="absolute inset-0 rounded-md bg-white/[0.14] border border-white/[0.18] shadow-sm"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{win.label}</span>
                </button>
              );
            })}
          </div>

          {/* Route selector buttons */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1">
            {routeNames.map((rt) => {
              const count = anomalies.filter((a) => a.route === rt).length;
              const isSelected = selectedRoute === rt;
              return (
                <motion.button
                  key={rt}
                  onClick={() => setSelectedRoute(rt)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                    isSelected
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)] font-semibold"
                      : "bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-white/[0.06] hover:bg-white/[0.08]"
                  }`}
                >
                  <span>{rt}</span>
                  {count > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 mb-3 px-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-400 rounded-full inline-block"></span>
            <span className="text-white font-medium">Actual Unit Cost (₹/t-km)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-purple-400 border-dashed border-t border-purple-400 inline-block"></span>
            <span className="text-purple-300">8-Wk Trailing Rolling Avg</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-sky-400 border-dotted border-t border-sky-400 inline-block"></span>
            <span className="text-sky-300">Peer Route Corridor Avg</span>
          </div>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300">Justified (Note Matched)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-slate-300">Unexplained Surge (Flagged)</span>
          </div>
        </div>
      </div>

      {/* Chart SVG */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto select-none"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          {/* Subtle Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const val = minVal + (maxVal - minVal) * (1 - ratio);
            const y = padding.top + ratio * (chartHeight - padding.top - padding.bottom);
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  ₹{val.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Peer baseline line (Sky blue dotted) */}
          {peerPath && (
            <path
              d={peerPath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              opacity={0.8}
            />
          )}

          {/* Own 8-week baseline line (Purple dashed) */}
          {ownPath && (
            <path
              d={ownPath}
              fill="none"
              stroke="#c084fc"
              strokeWidth="1.75"
              strokeDasharray="6 3"
              opacity={0.85}
            />
          )}

          {/* Actual Cost line (Solid Amber) */}
          {costPath && (
            <path
              d={costPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Anomaly Markers & Interactive Points */}
          {points.map((pt) => {
            const isHovered = hoveredPoint?.week_of === pt.week_of;
            const anomalyMatch = anomalies.find(
              (a) => a.route === selectedRoute && a.week_of === pt.week_of
            );

            return (
              <g key={pt.week_of}>
                {/* Standard point dot on hover */}
                {isHovered && !pt.is_anomaly && (
                  <circle
                    cx={pt.x}
                    cy={pt.yCost}
                    r={3.5}
                    fill="#f59e0b"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                )}

                {/* Anomaly marker */}
                {pt.is_anomaly && (
                  <g
                    className="cursor-pointer"
                    onClick={() => anomalyMatch && onSelectAnomaly?.(anomalyMatch)}
                  >
                    {/* Pulsing ring for unexplained */}
                    {pt.flagged_status === "Yes" && (
                      <circle
                        cx={pt.x}
                        cy={pt.yCost}
                        r={8}
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="1.5"
                        opacity={0.6}
                        className="animate-ping"
                      />
                    )}
                    {/* Solid badge dot */}
                    <circle
                      cx={pt.x}
                      cy={pt.yCost}
                      r={isHovered ? 6 : 4.5}
                      fill={pt.flagged_status === "No (justified)" ? "#10b981" : "#f43f5e"}
                      stroke="#07090e"
                      strokeWidth="2"
                    />
                  </g>
                )}

                {/* Invisible hover trigger column */}
                <rect
                  x={pt.x - (chartWidth / points.length) / 2}
                  y={padding.top}
                  width={chartWidth / points.length}
                  height={chartHeight - padding.top - padding.bottom}
                  fill="transparent"
                  onMouseEnter={() => {
                    setHoveredPoint(pt);
                    setTooltipPos({ x: pt.x, y: pt.yCost });
                  }}
                />
              </g>
            );
          })}

          {/* X Axis Labels */}
          {points
            .filter((_, idx) => idx % Math.ceil(points.length / 8) === 0)
            .map((pt) => (
              <text
                key={pt.week_of}
                x={pt.x}
                y={chartHeight - 12}
                fill="#64748b"
                fontSize="10"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {pt.week_of.slice(5)}
              </text>
            ))}
        </svg>

        {/* Interactive Hover Tooltip */}
        <AnimatePresence>
          {hoveredPoint && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              style={{
                left: `${Math.min(chartWidth - 230, Math.max(20, (tooltipPos.x / chartWidth) * 100))}%`,
                top: `${Math.max(10, Math.min(chartHeight - 145, tooltipPos.y - 125))}px`,
              }}
              className="absolute z-20 pointer-events-none glass-panel p-3 rounded-xl backdrop-blur-xl w-64 text-xs shadow-2xl"
            >
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/[0.08]">
                <span className="font-semibold text-white font-mono">{hoveredPoint.week_of}</span>
                {hoveredPoint.is_anomaly ? (
                  <span
                    className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold ${
                      hoveredPoint.flagged_status === "No (justified)"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {hoveredPoint.flagged_status}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-500">Normal Range</span>
                )}
              </div>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-sans">Unit Cost:</span>
                  <span className="font-semibold text-amber-400">
                    ₹{hoveredPoint.cost_per_tonne_km.toFixed(2)}/t-km
                  </span>
                </div>
                {hoveredPoint.own_baseline && (
                  <div className="flex justify-between items-center">
                    <span className="text-purple-300 font-sans">Own 8-Wk Avg:</span>
                    <span className="text-slate-300">
                      ₹{hoveredPoint.own_baseline.toFixed(2)} (
                      {(
                        ((hoveredPoint.cost_per_tonne_km - hoveredPoint.own_baseline) /
                          hoveredPoint.own_baseline) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </div>
                )}
                {hoveredPoint.peer_baseline && (
                  <div className="flex justify-between items-center">
                    <span className="text-sky-300 font-sans">Peer Corridors:</span>
                    <span className="text-slate-300">
                      ₹{hoveredPoint.peer_baseline.toFixed(2)} (
                      {(
                        ((hoveredPoint.cost_per_tonne_km - hoveredPoint.peer_baseline) /
                          hoveredPoint.peer_baseline) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </div>
                )}
              </div>

              {hoveredPoint.is_anomaly && (
                <div className="mt-2 pt-1.5 border-t border-white/[0.08] text-[10px] text-amber-300 flex items-center justify-between font-sans">
                  <span>Inspect attribution details</span>
                  <ArrowUpRight className="w-3 h-3 text-amber-400" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
