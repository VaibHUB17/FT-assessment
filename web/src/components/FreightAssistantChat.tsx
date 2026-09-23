"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, User, Terminal, HelpCircle, CheckCircle2 } from "lucide-react";
import { FreightDataPayload } from "@/types/freight";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  citedNote?: string;
  citedRoutes?: string[];
  timestamp: string;
}

interface FreightAssistantChatProps {
  data: FreightDataPayload;
}

export function FreightAssistantChat({ data }: FreightAssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "FreightWatch query console active. You can query route unit costs, trailing 8-week baselines, peer group comparisons, and context note causality across all 7 monitored corridors.",
      timestamp: "Ready",
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Why was Chennai-Bangalore higher in March 2025?",
    "Why did Ahmedabad-Mumbai surge on Jan 20, 2025?",
    "Why was Mumbai-Pune flagged repeatedly in late 2025?",
    "Did the May 2025 diesel price rise trigger any corridor anomaly?",
    "Which corridors have unexplained cost surges requiring audit?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSend = async (questionText?: string) => {
    const q = (questionText || input).trim();
    if (!q) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput("");
    setIsThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const resData = await res.json();
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: resData.answer || "No response generated.",
        citedNote: resData.citedNote,
        citedRoutes: resData.citedRoutes,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: `Error connecting to query engine: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden backdrop-blur-xl flex flex-col h-[650px]">
      {/* Console Header */}
      <div className="p-4 border-b border-white/[0.08] bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/25 flex items-center justify-center">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              Corridor Intelligence Console
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                LIVE GROQ LPU
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Natural language corridor analytics grounded in shipment baselines & context notes</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-500">
          <span>Model: openai/gpt-oss-120b</span>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${m.sender === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-mono ${
                m.sender === "user"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold"
                  : "bg-white/[0.06] text-sky-400 border border-white/[0.08]"
              }`}
            >
              {m.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Terminal className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[82%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                m.sender === "user"
                  ? "bg-amber-500/15 text-amber-100 border border-amber-500/30 rounded-tr-none"
                  : "bg-slate-900/70 text-slate-200 border border-white/[0.08] backdrop-blur-md rounded-tl-none"
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>

              {/* Citations pill */}
              {(m.citedNote || m.citedRoutes) && (
                <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex flex-wrap items-center gap-2 text-[10px]">
                  {m.citedNote && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-mono font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Cited Note: {m.citedNote}
                    </span>
                  )}
                  {m.citedRoutes?.map((r) => (
                    <span
                      key={r}
                      className="px-2 py-0.5 rounded bg-white/[0.06] text-slate-300 border border-white/[0.08] font-mono"
                    >
                      Corridor: {r}
                    </span>
                  ))}
                </div>
              )}

              <div
                className={`text-[10px] mt-1.5 text-right font-mono ${
                  m.sender === "user" ? "text-amber-300/70" : "text-slate-500"
                }`}
              >
                {m.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/[0.06] text-sky-400 border border-white/[0.08] flex items-center justify-center shrink-0">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <div className="bg-slate-900/70 border border-white/[0.08] backdrop-blur-md rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse delay-100"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse delay-200"></span>
              <span className="text-[11px] text-slate-400 ml-1 font-mono">Evaluating vector similarity & baseline indexes...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts chips */}
      <div className="px-4 py-2 border-t border-white/[0.06] bg-slate-950/30">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-slate-400">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="shrink-0 font-medium text-slate-400 font-mono text-[10px]">Shortcuts:</span>
          {suggestedQuestions.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSend(sq)}
              className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] whitespace-nowrap transition-colors font-mono text-[11px]"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Query Input */}
      <div className="p-3 bg-slate-950/60 border-t border-white/[0.08]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Query corridor cost trends, historical baseline deltas, or disruption events..."
            className="flex-1 bg-slate-900/60 border border-white/[0.08] text-xs rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/60 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isThinking}
            className="w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 flex items-center justify-center transition-all shrink-0 cursor-pointer font-bold shadow-[0_0_12px_rgba(245,158,11,0.25)]"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
