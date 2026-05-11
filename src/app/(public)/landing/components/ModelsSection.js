"use client";
import { useState } from "react";

const PROVIDERS = [
  { name: "Anthropic", models: 6,  badge: "Popular",  color: "#D97706" },
  { name: "OpenAI",    models: 18, badge: "Popular",  color: "#10B981" },
  { name: "Google",    models: 12, badge: null,       color: "#3B82F6" },
  { name: "Meta",      models: 8,  badge: null,       color: "#6366F1" },
  { name: "DeepSeek",  models: 5,  badge: "Trending", color: "#8B5CF6" },
  { name: "Mistral",   models: 7,  badge: null,       color: "#F59E0B" },
  { name: "xAI",       models: 4,  badge: "New",      color: "#EC4899" },
  { name: "Groq",      models: 6,  badge: "Fast",     color: "#84CC16" },
];

const TOP_MODELS = [
  { id: "anthropic/claude-opus-4.7",      ctx: "200K", input: "$15.00", output: "$75.00", badge: "Top"      },
  { id: "openai/gpt-5.5",                 ctx: "128K", input: "$10.00", output: "$30.00", badge: null       },
  { id: "google/gemini-3.1-pro-preview",  ctx: "1M",   input: "$3.50",  output: "$10.50", badge: "Long ctx" },
  { id: "deepseek/deepseek-v4-pro",       ctx: "64K",  input: "$0.27",  output: "$1.10",  badge: "Cheap"    },
  { id: "meta-llama/llama-4-maverick",    ctx: "128K", input: "$0.18",  output: "$0.59",  badge: "Free tier"},
  { id: "mistralai/codestral-latest",     ctx: "256K", input: "$0.30",  output: "$0.90",  badge: "Code"     },
];

export default function ModelsSection() {
  const [search, setSearch] = useState("");
  const filtered = TOP_MODELS.filter(m => m.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <section id="models" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8" style={{ background: "#0A0A0C" }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md mb-3" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
              <span className="text-[11px] font-semibold text-violet-400 uppercase tracking-widest">Models</span>
            </div>
            <h2 className="font-black text-white tracking-tight leading-[1.05]" style={{ fontSize: "clamp(1.7rem, 3.5vw, 2.6rem)" }}>
              400+ models. One key.
            </h2>
          </div>
          {/* Search — full width on mobile */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg flex-1 sm:flex-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
                <circle cx="6" cy="6" r="4.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" />
                <path d="M9.5 9.5L12 12" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search models..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent outline-none text-[14px] text-white/70 placeholder-white/25 w-full sm:w-36"
              />
            </div>
            <a href="#" className="flex-shrink-0 px-3 py-2.5 rounded-lg text-[13px] font-medium whitespace-nowrap" style={{ color: "#A78BFA", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", minHeight: 44 }}>
              View all →
            </a>
          </div>
        </div>

        {/* Provider chips — horizontal scroll on mobile */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap" style={{ scrollbarWidth: "none" }}>
          {PROVIDERS.map(p => (
            <div
              key={p.name}
              className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", minHeight: 40 }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.08)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
              <span className="text-[13px] font-medium text-white/60">{p.name}</span>
              <span className="text-[11px] text-white/25 font-mono">{p.models}</span>
              {p.badge && <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ background: p.color + "18", color: p.color }}>{p.badge}</span>}
            </div>
          ))}
        </div>

        {/* Model table — horizontal scroll on mobile */}
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="overflow-x-auto">
            {/* Table header */}
            <div className="grid px-4 py-3 min-w-[520px]" style={{ gridTemplateColumns: "1fr 70px 90px 90px 40px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Model", "Context", "Input /1M", "Output /1M", ""].map((h, i) => (
                <div key={i} className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)", textAlign: i > 0 ? "right" : "left" }}>{h}</div>
              ))}
            </div>

            {/* Rows */}
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              {filtered.map(m => {
                const [provider, ...rest] = m.id.split("/");
                const modelName = rest.join("/");
                return (
                  <div
                    key={m.id}
                    className="grid px-4 py-3 transition-colors duration-100 cursor-pointer min-w-[520px]"
                    style={{ gridTemplateColumns: "1fr 70px 90px 90px 40px" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.05)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded flex items-center justify-center text-[8px] font-black flex-shrink-0" style={{ background: "rgba(124,58,237,0.15)", color: "#A78BFA" }}>
                        {provider.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-mono text-white/50 block">{provider}/</span>
                        <span className="text-[13px] font-mono font-medium text-white/85 truncate block">{modelName}</span>
                      </div>
                      {m.badge && <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: "rgba(124,58,237,0.15)", color: "#A78BFA" }}>{m.badge}</span>}
                    </div>
                    <div className="text-[12px] font-mono text-right self-center" style={{ color: "rgba(255,255,255,0.4)" }}>{m.ctx}</div>
                    <div className="text-[12px] font-mono text-right self-center" style={{ color: "rgba(255,255,255,0.6)" }}>{m.input}</div>
                    <div className="text-[12px] font-mono text-right self-center" style={{ color: "rgba(255,255,255,0.6)" }}>{m.output}</div>
                    <div className="flex justify-end items-center">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "rgba(255,255,255,0.2)" }}>
                        <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <p className="text-center mt-5 text-[13px]" style={{ color: "rgba(255,255,255,0.3)" }}>
          Showing {filtered.length} of 400+ models · <a href="#" style={{ color: "#A78BFA" }}>Browse full catalog →</a>
        </p>
      </div>
    </section>
  );
}
