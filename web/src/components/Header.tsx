"use client";

import React from "react";
import { motion } from "motion/react";
import { ShieldCheck, Download, Truck, Activity, Cpu, Terminal } from "lucide-react";

interface HeaderProps {
  activeTab: "overview" | "anomalies" | "assistant" | "eval";
  setActiveTab: (tab: "overview" | "anomalies" | "assistant" | "eval") => void;
  anomalyCount: number;
}

export function Header({ activeTab, setActiveTab, anomalyCount }: HeaderProps) {
  const navTabs = [
    { id: "overview" as const, label: "Corridor Trends", icon: Activity, iconColor: "text-amber-400" },
    { id: "anomalies" as const, label: "Anomaly Audit", icon: ShieldCheck, iconColor: "text-emerald-400", badge: anomalyCount },
    { id: "assistant" as const, label: "Query Console", icon: Terminal, iconColor: "text-sky-400" },
    { id: "eval" as const, label: "Verification & Telemetry", icon: Cpu, iconColor: "text-purple-400" },
  ];

  return (
    <header className="glass-header sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3.5">
            <motion.div
              whileHover={{ scale: 1.05, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="w-9 h-9 rounded-lg bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.35)] text-slate-950 font-black cursor-pointer"
            >
              <Truck className="w-5 h-5 stroke-[2.5]" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold tracking-tight text-white">FreightWatch</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/25">
                  AUDIT ENGINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">
                Cost Anomaly Detection & Note Attribution
              </p>
            </div>
          </div>

          {/* Navigation Tabs with Spring Animated Indicator */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-950/70 border border-white/[0.08] backdrop-blur-md shadow-inner">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer select-none ${
                    isActive ? "text-white font-semibold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 rounded-lg bg-white/[0.12] border border-white/[0.16] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.3)]"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${tab.iconColor}`} />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold transition-colors ${
                          isActive
                            ? "bg-amber-400/20 text-amber-300 border border-amber-400/35"
                            : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Action buttons and System Status */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/25 px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              <span>100% Deterministic</span>
            </div>
            <motion.a
              href="/output.csv"
              download="output.csv"
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 hover:text-white text-xs font-medium border border-white/[0.12] shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export CSV</span>
            </motion.a>
          </div>
        </div>
      </div>
    </header>
  );
}
