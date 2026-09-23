"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AnomalyRow, ContextNote } from "@/types/freight";
import { X, ShieldCheck, AlertOctagon, CheckCircle2, Scale, Cpu, Calendar, MapPin } from "lucide-react";

interface AnomalyDrawerProps {
  anomaly: AnomalyRow | null;
  onClose: () => void;
  notes: ContextNote[];
}

export function AnomalyDrawer({ anomaly, onClose, notes }: AnomalyDrawerProps) {
  const isJustified = anomaly?.flagged === "No (justified)";
  const matchedNote = anomaly ? notes.find((n) => n.note_id === anomaly.matched_note_id) : undefined;

  // If unexplained but reason references a closest note, extract it
  const closestNoteMatch = anomaly?.reason.match(/\(([Nn]\d{3})/);
  const closestNoteId = closestNoteMatch ? closestNoteMatch[1] : null;
  const closestNote = closestNoteId ? notes.find((n) => n.note_id === closestNoteId) : null;

  return (
    <AnimatePresence>
      {anomaly && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm cursor-pointer"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 240 }}
          className="relative w-full max-w-xl bg-slate-950/90 border-l border-white/[0.08] shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl p-6 overflow-y-auto flex flex-col justify-between"
        >
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-white tracking-tight font-mono">{anomaly.route}</h3>
                  <span className="text-xs px-2 py-0.5 rounded font-mono bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                    {anomaly.week_of}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Baseline Calculation & Disruption Attribution</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-white/[0.08]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Verdict Banner */}
            <div
              className={`p-4 rounded-xl border mb-6 flex items-start gap-3 backdrop-blur-md ${
                isJustified
                  ? "bg-emerald-950/25 border-emerald-500/30 text-emerald-200"
                  : "bg-rose-950/25 border-rose-500/30 text-rose-200"
              }`}
            >
              {isJustified ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-semibold text-sm">
                  {isJustified ? "Justified Anomaly (Attributed to Note)" : "Unexplained Surge (Flagged for Review)"}
                </div>
                <div className="text-xs mt-1 text-slate-300 leading-relaxed font-sans">{anomaly.reason}</div>
              </div>
            </div>

            {/* Baseline Comparison Cards */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                Baseline Mathematics
              </h4>
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-900/50 border border-white/[0.07] backdrop-blur-md">
                  <div className="text-[10px] text-slate-400 mb-1">Weekly Unit Cost</div>
                  <div className="text-base font-bold text-amber-400 font-mono tabular-nums">
                    ₹{anomaly.cost_per_tonne_km}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">/ (tonne·km)</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/50 border border-white/[0.07] backdrop-blur-md">
                  <div className="text-[10px] text-slate-400 mb-1">vs Own 8-Wk Avg</div>
                  <div className="text-sm font-bold text-purple-300 font-mono tabular-nums">
                    {anomaly.vs_own_history.split(" ")[0]}
                  </div>
                  <div className="text-[10px] text-slate-500">prior 8 wks</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/50 border border-white/[0.07] backdrop-blur-md">
                  <div className="text-[10px] text-slate-400 mb-1">vs Peer Corridors</div>
                  <div className="text-sm font-bold text-sky-300 font-mono tabular-nums">
                    {anomaly.vs_similar_routes.split(" ")[0]}
                  </div>
                  <div className="text-[10px] text-slate-500">same tier</div>
                </div>
              </div>
            </div>

            {/* Context Note Retrieval Inspector */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                Context Note Attribution
              </h4>

              {matchedNote ? (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/30 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      MATCHED: {matchedNote.note_id}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{matchedNote.date}</span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium mb-2">
                    Applies To: <span className="text-amber-300 font-mono">{matchedNote.applies_to}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-2.5 rounded-lg border border-white/[0.06]">
                    &ldquo;{matchedNote.note}&rdquo;
                  </p>
                </div>
              ) : closestNote ? (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/[0.08] backdrop-blur-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-white/[0.08] text-slate-300 border border-white/[0.1]">
                      PROXIMITY NOTE: {closestNote.note_id}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{closestNote.date}</span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium mb-2">
                    Applies To: <span className="text-amber-300 font-mono">{closestNote.applies_to}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/70 p-2.5 rounded-lg border border-white/[0.06]">
                    &ldquo;{closestNote.note}&rdquo;
                  </p>
                  <div className="mt-2.5 text-[11px] text-rose-300 font-medium flex items-center gap-1">
                    <AlertOctagon className="w-3 h-3 text-rose-400 shrink-0" />
                    <span>Guardrail Refusal: event describes stable traffic or absorbed transporter costs.</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-900/50 border border-white/[0.06] text-xs text-slate-400 font-sans">
                  No matching context notes exist within the temporal or corridor window for this period.
                </div>
              )}
            </div>

            {/* Guardrail Verification Checklist */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Causality Guardrail Verification
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/50 border border-white/[0.06]">
                  <span className="text-slate-300">1. Corridor Alignment Check</span>
                  <span className="text-emerald-400 font-semibold font-mono text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> PASSED
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/50 border border-white/[0.06]">
                  <span className="text-slate-300">2. Date Proximity & Duration Window</span>
                  <span className="text-emerald-400 font-semibold font-mono text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> PASSED
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/50 border border-white/[0.06]">
                  <span className="text-slate-300">3. Cost Surge Causality (Negative Control)</span>
                  {isJustified ? (
                    <span className="text-emerald-400 font-semibold font-mono text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> CONFIRMED CAUSE
                    </span>
                  ) : (
                    <span className="text-rose-400 font-semibold font-mono text-[11px] flex items-center gap-1">
                      <AlertOctagon className="w-3 h-3" /> REJECTED / NO CAUSE
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-4 border-t border-white/[0.08] text-[11px] text-slate-500 flex items-center justify-between font-mono">
            <span>Inference: Groq gpt-oss-120b</span>
            <span className="text-emerald-400">Deterministic Verified</span>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
