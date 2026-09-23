"use client";

import React from "react";
import { motion } from "motion/react";
import { Package, Route, Calendar, AlertTriangle, CheckCircle2, ShieldAlert, ArrowUpRight } from "lucide-react";
import { FreightDataPayload } from "@/types/freight";

interface MetricCardsProps {
  summary: FreightDataPayload["summary"];
  onSelectFilter?: (filter: "all" | "justified" | "flagged") => void;
}

export function MetricCards({ summary, onSelectFilter }: MetricCardsProps) {
  const cards = [
    {
      title: "Total Shipments",
      value: summary.total_shipments.toLocaleString(),
      subtitle: `${summary.date_range.start} → ${summary.date_range.end}`,
      icon: Package,
      iconColor: "text-sky-400",
      accentGlow: "rgba(56, 189, 248, 0.08)",
    },
    {
      title: "Corridors Monitored",
      value: summary.total_routes.toString(),
      subtitle: "Short, Medium & Long tiers",
      icon: Route,
      iconColor: "text-amber-400",
      accentGlow: "rgba(245, 158, 11, 0.08)",
    },
    {
      title: "Route-Weeks Evaluated",
      value: summary.total_route_weeks.toLocaleString(),
      subtitle: "Weekly weighted baselines",
      icon: Calendar,
      iconColor: "text-purple-400",
      accentGlow: "rgba(192, 132, 252, 0.08)",
    },
    {
      title: "Cost Anomalies Detected",
      value: summary.total_anomalies.toString(),
      subtitle: "≥ +20.0% vs past or peers",
      icon: AlertTriangle,
      iconColor: "text-amber-400",
      accentGlow: "rgba(245, 158, 11, 0.12)",
      clickable: true,
      onClick: () => onSelectFilter?.("all"),
      filterLabel: "View all",
    },
    {
      title: "Justified by Notes",
      value: summary.justified_count.toString(),
      subtitle: "Attributed to real disruptions",
      icon: CheckCircle2,
      iconColor: "text-emerald-400",
      accentGlow: "rgba(16, 185, 129, 0.12)",
      clickable: true,
      onClick: () => onSelectFilter?.("justified"),
      filterLabel: "Filter",
    },
    {
      title: "Unexplained Surges",
      value: summary.unexplained_count.toString(),
      subtitle: "Flagged for freight audit",
      icon: ShieldAlert,
      iconColor: "text-rose-400",
      accentGlow: "rgba(244, 63, 94, 0.12)",
      clickable: true,
      onClick: () => onSelectFilter?.("flagged"),
      filterLabel: "Filter",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 24,
              delay: idx * 0.04,
            }}
            whileHover={
              card.clickable
                ? {
                    y: -3,
                    scale: 1.015,
                    transition: { type: "spring", stiffness: 400, damping: 22 },
                  }
                : undefined
            }
            whileTap={card.clickable ? { scale: 0.98 } : undefined}
            onClick={card.onClick}
            style={{
              background: `radial-gradient(circle at 80% 20%, ${card.accentGlow} 0%, rgba(13, 19, 31, 0.72) 75%)`,
            }}
            className={`p-3.5 rounded-xl border backdrop-blur-xl relative overflow-hidden transition-all duration-200 group ${
              card.clickable
                ? "border-white/[0.1] hover:border-white/[0.24] cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
                : "border-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.25)]"
            }`}
          >
            {/* Top hairline border */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 group-hover:via-white/40 to-transparent transition-opacity" />

            {/* Top row */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-300 uppercase tracking-wider transition-colors">
                {card.title}
              </span>
              <Icon className={`w-3.5 h-3.5 ${card.iconColor} group-hover:scale-110 transition-transform`} />
            </div>

            {/* Metric Value */}
            <div className="text-2xl font-bold font-mono tabular-nums tracking-tight text-white mb-1 group-hover:text-amber-100/90 transition-colors">
              {card.value}
            </div>

            {/* Subtitle & Action pill */}
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate pr-1">{card.subtitle}</span>
              {card.clickable && (
                <span className="shrink-0 text-[10px] font-mono text-amber-400/90 flex items-center gap-0.5 group-hover:text-amber-300 group-hover:translate-x-0.5 transition-all">
                  {card.filterLabel}
                  <ArrowUpRight className="w-2.5 h-2.5" />
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
