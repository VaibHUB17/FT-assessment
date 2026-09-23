"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import freightPayload from "@/data/freight_data.json";
import { FreightDataPayload, AnomalyRow } from "@/types/freight";
import { Header } from "@/components/Header";
import { MetricCards } from "@/components/MetricCards";
import { RouteCostChart } from "@/components/RouteCostChart";
import { AnomalyTable } from "@/components/AnomalyTable";
import { AnomalyDrawer } from "@/components/AnomalyDrawer";
import { FreightAssistantChat } from "@/components/FreightAssistantChat";
import { ReproducibilityView } from "@/components/ReproducibilityView";
import { ArrowRight, ShieldCheck, Terminal, AlertTriangle } from "lucide-react";

export default function FreightWatchDashboard() {
  const data = freightPayload as unknown as FreightDataPayload;

  const [activeTab, setActiveTab] = useState<"overview" | "anomalies" | "assistant" | "eval">("overview");
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyRow | null>(null);
  const [selectedTableFilter, setSelectedTableFilter] = useState<"all" | "justified" | "flagged">("all");

  const handleCardFilterSelect = (filter: "all" | "justified" | "flagged") => {
    setSelectedTableFilter(filter);
    setActiveTab("anomalies");
  };

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200"
    >
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        anomalyCount={data.summary.total_anomalies}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Metric Summary Cards */}
        <MetricCards
          summary={data.summary}
          onSelectFilter={handleCardFilterSelect}
        />

        {/* Dynamic Tab Switching with Smooth Motion Transitions */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              {/* Interactive SVG Chart */}
              <RouteCostChart
                routesData={data.routes_data}
                anomalies={data.anomalies}
                onSelectAnomaly={(anom) => setSelectedAnomaly(anom)}
              />

              {/* Quick Actions & Recent Flags */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Section 1: Grounded Justifications */}
                <motion.div
                  whileHover={{ y: -3, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 350, damping: 22 }}
                  className="glass-panel p-5 rounded-2xl relative overflow-hidden group border-white/[0.09] hover:border-emerald-500/30 transition-colors"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
                  <div className="flex items-center gap-2 mb-2 text-emerald-400 font-semibold text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    Corridor Disruption Attribution (4 Events)
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Verified context notes explain temporary surges on Chennai-Bangalore (Note N001: highway flooding) and Ahmedabad-Mumbai (Note N002: festival surcharge).
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setSelectedTableFilter("justified");
                      setActiveTab("anomalies");
                    }}
                    className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 flex items-center gap-1.5 transition-colors cursor-pointer group-hover:translate-x-0.5"
                  >
                    <span>Review Justified Corridors</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </motion.div>

                {/* Section 2: Unexplained Review Flags */}
                <motion.div
                  whileHover={{ y: -3, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 350, damping: 22 }}
                  className="glass-panel p-5 rounded-2xl relative overflow-hidden group border-white/[0.09] hover:border-rose-500/30 transition-colors"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/30 to-transparent" />
                  <div className="flex items-center gap-2 mb-2 text-rose-400 font-semibold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Unexplained Rate Surges (16 Events)
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Corridors exhibiting sustained rate spikes (+20% to +38.9% above peers) with no valid external justification. Flagged for contract and invoice audit.
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setSelectedTableFilter("flagged");
                      setActiveTab("anomalies");
                    }}
                    className="text-xs font-semibold text-rose-300 hover:text-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer group-hover:translate-x-0.5"
                  >
                    <span>Audit Unexplained Corridors</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </motion.div>

                {/* Section 3: Query Console Callout */}
                <motion.div
                  whileHover={{ y: -3, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 350, damping: 22 }}
                  className="glass-panel p-5 rounded-2xl relative overflow-hidden group border-white/[0.09] hover:border-amber-500/30 transition-colors"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />
                  <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-sm">
                    <Terminal className="w-4 h-4" />
                    Corridor Intelligence Console
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Query the system about why specific corridors escalated, how peer baselines were calculated, and which context notes were retrieved or rejected.
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab("assistant")}
                    className="text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 transition-colors cursor-pointer group-hover:translate-x-0.5"
                  >
                    <span>Open Query Console</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </motion.div>
              </div>

              {/* Quick Preview Table */}
              <AnomalyTable
                anomalies={data.anomalies}
                onSelectAnomaly={(anom) => setSelectedAnomaly(anom)}
                selectedFilter={selectedTableFilter}
              />
            </motion.div>
          )}

          {/* Tab 2: Full Anomaly Audit Log */}
          {activeTab === "anomalies" && (
            <motion.div
              key="anomalies"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <AnomalyTable
                anomalies={data.anomalies}
                onSelectAnomaly={(anom) => setSelectedAnomaly(anom)}
                selectedFilter={selectedTableFilter}
              />
            </motion.div>
          )}

          {/* Tab 3: Conversational Query Console */}
          {activeTab === "assistant" && (
            <motion.div
              key="assistant"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <FreightAssistantChat data={data} />
            </motion.div>
          )}

          {/* Tab 4: Evaluation and Reproducibility Station */}
          {activeTab === "eval" && (
            <motion.div
              key="eval"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <ReproducibilityView
                reproducibility={data.reproducibility}
                guardrails={data.guardrail_eval}
                telemetry={data.telemetry}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Slide-over Inspection Drawer */}
      <AnomalyDrawer
        anomaly={selectedAnomaly}
        onClose={() => setSelectedAnomaly(null)}
        notes={data.notes}
      />

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-slate-950/70 backdrop-blur-xl py-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Freight Cost Anomaly Detection & Attribution System</span>
          <span className="font-mono text-slate-400 text-[11px]">
            Next.js 16 • Tailwind CSS • LlamaIndex RAG • 100% Deterministic Reproducibility
          </span>
        </div>
      </footer>
    </div>
  );
}
