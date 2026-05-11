"use client";
import { useEffect, useRef, useState } from "react";

/* ─── Spotlight border card ─── */
function SpotlightCard({ children, className = "", style = {} }) {
  const cardRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0, show: false });

  const onMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top, show: true });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseLeave={() => setPos((p) => ({ ...p, show: false }))}
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        ...style,
      }}
    >
      {pos.show && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(300px circle at ${pos.x}px ${pos.y}px, rgba(11,124,143,0.12), transparent 70%)`,
          }}
        />
      )}
      {children}
    </div>
  );
}

/* ─── Animated routing diagram ─── */
function RoutingDiagram() {
  const [active, setActive] = useState(0);
  const tiers = [
    { label: "Subscription", models: ["Claude Opus", "GPT-5.4", "Codex"], color: "#0BB4D2" },
    { label: "Cheap", models: ["GLM-5.1", "MiniMax M2.7", "Kimi K2.5"], color: "#F59E0B" },
    { label: "Free", models: ["Kiro AI", "OpenCode", "Vertex"], color: "#10B981" },
  ];

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % 3), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="p-6 h-full flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-[#0BB4D2]" style={{ animation: "pulse 2s infinite" }} />
        <span className="text-[11px] font-medium text-white/40 uppercase tracking-widest">Smart Routing</span>
      </div>
      {/* Request */}
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "rgba(11,124,143,0.1)", border: "1px solid rgba(11,124,143,0.2)" }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7h12M7 1l6 6-6 6" stroke="#0BB4D2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span className="text-[12px] text-white/70 font-mono">POST /v1/chat/completions</span>
      </div>
      {/* Tiers */}
      <div className="flex flex-col gap-2 flex-1">
        {tiers.map((tier, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-500"
            style={{
              background: active === i ? `rgba(${tier.color === "#0BB4D2" ? "11,180,210" : tier.color === "#F59E0B" ? "245,158,11" : "16,185,129"},0.1)` : "rgba(255,255,255,0.02)",
              border: `1px solid ${active === i ? tier.color + "40" : "rgba(255,255,255,0.05)"}`,
              transform: active === i ? "translateX(4px)" : "translateX(0)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: tier.color, opacity: active === i ? 1 : 0.3 }} />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold" style={{ color: active === i ? tier.color : "rgba(255,255,255,0.3)" }}>{tier.label}</div>
              <div className="text-[10px] text-white/30 truncate">{tier.models.join(" · ")}</div>
            </div>
            {active === i && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: tier.color + "20", color: tier.color }}>Active</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── RTK token compression animation ─── */
function TokenSaver() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let p = 0;
    const id = setInterval(() => {
      p += 1.2;
      if (p > 100) p = 0;
      setProgress(p);
    }, 60);
    return () => clearInterval(id);
  }, []);

  const saved = Math.round(progress * 0.38);
  const original = 47;
  const compressed = Math.max(original - saved, original * 0.62);

  return (
    <div className="p-6 h-full flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-[#10B981]" style={{ animation: "pulse 2s infinite" }} />
        <span className="text-[11px] font-medium text-white/40 uppercase tracking-widest">RTK Token Saver</span>
      </div>
      <div className="flex items-end gap-4 flex-1">
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="w-full rounded-lg overflow-hidden" style={{ height: 80, background: "rgba(255,255,255,0.04)" }}>
            <div className="w-full rounded-lg transition-all duration-100" style={{ height: `${(original / 50) * 100}%`, background: "rgba(239,68,68,0.4)", marginTop: `${100 - (original / 50) * 100}%` }} />
          </div>
          <span className="text-[11px] text-white/40">Before</span>
          <span className="text-[13px] font-mono font-bold text-white/60">{original}K</span>
        </div>
        <div className="flex flex-col items-center gap-1 pb-8">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M12 6l4 4-4 4" stroke="#0BB4D2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="w-full rounded-lg overflow-hidden" style={{ height: 80, background: "rgba(255,255,255,0.04)" }}>
            <div className="w-full rounded-lg transition-all duration-100" style={{ height: `${(compressed / 50) * 100}%`, background: "rgba(16,185,129,0.5)", marginTop: `${100 - (compressed / 50) * 100}%` }} />
          </div>
          <span className="text-[11px] text-white/40">After RTK</span>
          <span className="text-[13px] font-mono font-bold" style={{ color: "#10B981" }}>{compressed.toFixed(0)}K</span>
        </div>
      </div>
      <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
        <span className="text-[12px] text-white/50">Tokens saved</span>
        <span className="text-[13px] font-bold" style={{ color: "#10B981" }}>~{Math.round(progress * 0.38)}% reduction</span>
      </div>
    </div>
  );
}

/* ─── Live usage counter ─── */
function UsageCounter() {
  const [stats, setStats] = useState({ req: 1247, tokens: 4823901, cost: 0 });
  useEffect(() => {
    const id = setInterval(() => {
      setStats((s) => ({
        req: s.req + Math.floor(Math.random() * 3),
        tokens: s.tokens + Math.floor(Math.random() * 800 + 200),
        cost: s.cost,
      }));
    }, 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="p-6 h-full flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-[#F59E0B]" style={{ animation: "pulse 2s infinite" }} />
        <span className="text-[11px] font-medium text-white/40 uppercase tracking-widest">Live Analytics</span>
      </div>
      <div className="grid grid-cols-2 gap-3 flex-1">
        {[
          { label: "Requests", value: stats.req.toLocaleString(), unit: "today", color: "#0BB4D2" },
          { label: "Tokens", value: (stats.tokens / 1000000).toFixed(2) + "M", unit: "total", color: "#10B981" },
          { label: "Providers", value: "12", unit: "active", color: "#F59E0B" },
          { label: "Saved", value: "$0.00", unit: "vs paid APIs", color: "#8B5CF6" },
        ].map((s, i) => (
          <div key={i} className="flex flex-col gap-1 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span className="text-[10px] text-white/35 uppercase tracking-wider">{s.label}</span>
            <span className="text-[18px] font-black font-mono tabular-nums" style={{ color: s.color }}>{s.value}</span>
            <span className="text-[10px] text-white/25">{s.unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Format translation visual ─── */
function FormatTranslation() {
  const [step, setStep] = useState(0);
  const steps = ["OpenAI", "→ ZenConsole", "→ Claude"];
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % 3), 1400);
    return () => clearInterval(id);
  }, []);

  const formats = [
    { from: "OpenAI", to: "Claude", color: "#D97706" },
    { from: "Claude", to: "Gemini", color: "#3B82F6" },
    { from: "Gemini", to: "OpenAI", color: "#10B981" },
    { from: "Cursor", to: "Kiro", color: "#8B5CF6" },
  ];

  return (
    <div className="p-6 h-full flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" style={{ animation: "pulse 2s infinite" }} />
        <span className="text-[11px] font-medium text-white/40 uppercase tracking-widest">Format Translation</span>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {formats.map((f, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[12px] font-medium w-16 text-right" style={{ color: "rgba(255,255,255,0.5)" }}>{f.from}</span>
            <div className="flex-1 h-[1px] relative overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div
                className="absolute top-0 left-0 h-full"
                style={{
                  width: "40%",
                  background: `linear-gradient(90deg, transparent, ${f.color}, transparent)`,
                  animation: `slide-${i} 2s linear infinite`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            </div>
            <span className="text-[12px] font-medium w-16" style={{ color: f.color }}>{f.to}</span>
          </div>
        ))}
      </div>
      <div className="text-[11px] text-white/30 text-center">Any format → Any provider</div>
      <style>{`
        @keyframes slide-0{0%{left:-40%}100%{left:140%}}
        @keyframes slide-1{0%{left:-40%}100%{left:140%}}
        @keyframes slide-2{0%{left:-40%}100%{left:140%}}
        @keyframes slide-3{0%{left:-40%}100%{left:140%}}
      `}</style>
    </div>
  );
}

/* ─── Main Features Section ─── */
export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 px-5 sm:px-8" style={{ background: "#08080A" }}>
      {/* Subtle separator */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(11,124,143,0.3), transparent)" }} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5" style={{ background: "rgba(11,124,143,0.1)", border: "1px solid rgba(11,124,143,0.2)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#0BB4D2]" />
            <span className="text-[11px] font-medium text-[#0BB4D2] uppercase tracking-widest">Features</span>
          </div>
          <h2 className="font-black text-white leading-[1.05] tracking-[-0.03em] mb-4" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
            Everything you need.<br />
            <span style={{ color: "rgba(255,255,255,0.35)" }}>Nothing you don't.</span>
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
            Built for developers who want full control over their AI infrastructure without the complexity.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Large card — routing */}
          <SpotlightCard className="lg:col-span-2" style={{ minHeight: 280 }}>
            <RoutingDiagram />
          </SpotlightCard>

          {/* Token saver */}
          <SpotlightCard style={{ minHeight: 280 }}>
            <TokenSaver />
          </SpotlightCard>

          {/* Usage analytics */}
          <SpotlightCard style={{ minHeight: 260 }}>
            <UsageCounter />
          </SpotlightCard>

          {/* Format translation */}
          <SpotlightCard style={{ minHeight: 260 }}>
            <FormatTranslation />
          </SpotlightCard>

          {/* Multi-account */}
          <SpotlightCard style={{ minHeight: 260 }}>
            <div className="p-6 h-full flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#6366F1]" style={{ animation: "pulse 2s infinite" }} />
                <span className="text-[11px] font-medium text-white/40 uppercase tracking-widest">Multi-Account</span>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                {[
                  { name: "claude-pro-1", provider: "Claude Code", status: "active", usage: 72 },
                  { name: "claude-pro-2", provider: "Claude Code", status: "standby", usage: 0 },
                  { name: "codex-plus", provider: "OpenAI Codex", status: "active", usage: 45 },
                  { name: "github-copilot", provider: "GitHub", status: "active", usage: 28 },
                ].map((acc, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: acc.status === "active" ? "#10B981" : "rgba(255,255,255,0.2)" }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium text-white/70 truncate">{acc.name}</div>
                      <div className="text-[10px] text-white/30">{acc.provider}</div>
                    </div>
                    {acc.status === "active" && (
                      <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-full rounded-full" style={{ width: `${acc.usage}%`, background: "#6366F1" }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-white/30 text-center">Round-robin · Priority · Sticky</div>
            </div>
          </SpotlightCard>
        </div>

        {/* Bottom feature list */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {[
            { icon: "🔐", label: "OAuth Auto-Refresh", desc: "Tokens refresh silently" },
            { icon: "☁️", label: "Cloud Sync", desc: "Config across devices" },
            { icon: "🌐", label: "Tunnel Support", desc: "Cloudflare & Tailscale" },
            { icon: "📝", label: "Request Logging", desc: "Full debug visibility" },
          ].map((f, i) => (
            <SpotlightCard key={i} className="p-5">
              <div className="text-xl mb-3">{f.icon}</div>
              <div className="text-[13px] font-semibold text-white/80 mb-1">{f.label}</div>
              <div className="text-[12px] text-white/35">{f.desc}</div>
            </SpotlightCard>
          ))}
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </section>
  );
}
