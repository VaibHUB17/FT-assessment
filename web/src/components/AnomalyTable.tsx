"use client";

import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { AnomalyRow } from "@/types/freight";
import { Search, ChevronRight, CheckCircle2, AlertOctagon } from "lucide-react";

interface AnomalyTableProps {
  anomalies: AnomalyRow[];
  onSelectAnomaly: (anomaly: AnomalyRow) => void;
  selectedFilter?: "all" | "justified" | "flagged";
}

export function AnomalyTable({ anomalies, onSelectAnomaly, selectedFilter = "all" }: AnomalyTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "justified" | "flagged">(selectedFilter);
  const [routeFilter, setRouteFilter] = useState<string>("all");

  const routes = useMemo(() => {
    return Array.from(new Set(anomalies.map((a) => a.route))).sort();
  }, [anomalies]);

  const filtered = useMemo(() => {
    return anomalies.filter((a) => {
      // Search text match
      const searchMatch =
        a.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.matched_note_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.week_of.includes(searchTerm);

      if (!searchMatch) return false;

      // Status filter
      if (statusFilter === "justified" && a.flagged !== "No (justified)") return false;
      if (statusFilter === "flagged" && a.flagged !== "Yes") return false;

      // Route filter
      if (routeFilter !== "all" && a.route !== routeFilter) return false;

      return true;
    });
  }, [anomalies, searchTerm, statusFilter, routeFilter]);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden backdrop-blur-xl">
      {/* Table Header and Filters */}
      <div className="p-4 sm:p-5 border-b border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white tracking-tight">Cost Surge Audit Log</h3>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-white/[0.06] text-slate-300 border border-white/[0.08]">
              {filtered.length} / {anomalies.length} events
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict output schema. Select any record to review baseline deltas and context note attribution.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search route, note, reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950/60 border border-white/[0.08] text-xs rounded-lg pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400/60 w-44 sm:w-52 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-white/[0.08] text-xs relative">
            {[
              { id: "all" as const, label: `All (${anomalies.length})` },
              { id: "justified" as const, label: "Justified (4)", activeColor: "text-emerald-300" },
              { id: "flagged" as const, label: "Unexplained (16)", activeColor: "text-rose-300" },
            ].map((opt) => {
              const isSelected = statusFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setStatusFilter(opt.id)}
                  className={`relative px-3 py-1 rounded-md font-medium text-xs transition-colors cursor-pointer select-none ${
                    isSelected ? (opt.activeColor || "text-white") + " font-semibold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="tableStatusFilterPill"
                      className="absolute inset-0 rounded-md bg-white/[0.14] border border-white/[0.18] shadow-sm"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Route dropdown */}
          <select
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            className="bg-slate-950/60 border border-white/[0.08] text-xs rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-amber-400/60 font-mono transition-colors"
          >
            <option value="all">All Corridors</option>
            {routes.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/40 border-b border-white/[0.06] text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
            <tr>
              <th className="py-3 px-4 font-mono">Route</th>
              <th className="py-3 px-3 font-mono">Week Of</th>
              <th className="py-3 px-3 font-mono">Unit Cost</th>
              <th className="py-3 px-3 font-mono">vs Own History</th>
              <th className="py-3 px-3 font-mono">vs Peer Routes</th>
              <th className="py-3 px-3">Verdict</th>
              <th className="py-3 px-3 font-mono">Note ID</th>
              <th className="py-3 px-4 min-w-[280px]">Reason & Citation</th>
              <th className="py-3 px-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500 font-mono">
                  No records match filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((item, idx) => {
                const isJustified = item.flagged === "No (justified)";
                return (
                  <motion.tr
                    key={`${item.route}-${item.week_of}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15, delay: idx * 0.015 }}
                    onClick={() => onSelectAnomaly(item)}
                    className="hover:bg-white/[0.025] cursor-pointer transition-colors group"
                  >
                    {/* Route */}
                    <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        <span className="font-mono text-xs">{item.route}</span>
                      </div>
                    </td>

                    {/* Week of */}
                    <td className="py-3 px-3 font-mono text-slate-300 whitespace-nowrap">
                      {item.week_of}
                    </td>

                    {/* Unit Cost */}
                    <td className="py-3 px-3 font-mono font-bold tabular-nums text-amber-400 whitespace-nowrap">
                      ₹{item.cost_per_tonne_km}
                    </td>

                    {/* vs Own History */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono tabular-nums">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        item.vs_own_history.startsWith("+2") || item.vs_own_history.startsWith("+3")
                          ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                          : "bg-white/[0.06] text-slate-300"
                      }`}>
                        {item.vs_own_history}
                      </span>
                    </td>

                    {/* vs Similar Routes */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono tabular-nums">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        item.vs_similar_routes.startsWith("+2") || item.vs_similar_routes.startsWith("+3")
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          : "bg-white/[0.06] text-slate-300"
                      }`}>
                        {item.vs_similar_routes}
                      </span>
                    </td>

                    {/* Verdict */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono">
                      {isJustified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          No (justified)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          <AlertOctagon className="w-3 h-3" />
                          Yes (Flagged)
                        </span>
                      )}
                    </td>

                    {/* Matched Note ID */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono">
                      {item.matched_note_id ? (
                        <span className="px-2 py-0.5 rounded font-bold text-xs bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                          {item.matched_note_id}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-mono text-[11px]">none</span>
                      )}
                    </td>

                    {/* Reason */}
                    <td className="py-3 px-4 text-slate-300 text-[11px] leading-relaxed">
                      {item.reason}
                    </td>

                    {/* Inspect Arrow */}
                    <td className="py-3 px-3 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all inline" />
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
