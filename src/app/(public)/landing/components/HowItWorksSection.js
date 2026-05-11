"use client";
import { useState } from "react";

const STEPS = [
  { n: "01", title: "Create an account",  desc: "Sign up with Google, GitHub, or email. No credit card required.",       detail: "Your account gives you access to the dashboard, API key management, usage analytics, and billing." },
  { n: "02", title: "Buy credits",        desc: "Add credits to your account. Credits work across every model.",          detail: "Credits never expire. Start with $5 and scale as needed. Volume discounts available for high-usage teams." },
  { n: "03", title: "Get your API key",   desc: "Generate a key from the dashboard. Use it like an OpenAI API key.",      detail: "Set per-key spending limits, rate limits, and data policies. Rotate keys without downtime." },
  { n: "04", title: "Start building",     desc: "Point your existing code at api.zenconsole.dev/v1. That's it.",          detail: "Works with every OpenAI-compatible SDK and framework. No code changes needed beyond the base URL." },
];

export default function HowItWorksSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8" style={{ background: "#0A0A0C" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md mb-4" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
              <span className="text-[11px] font-semibold text-violet-400 uppercase tracking-widest">Get started</span>
            </div>
            <h2 className="font-black text-white tracking-tight leading-[1.05] mb-3" style={{ fontSize: "clamp(1.7rem, 3.5vw, 2.6rem)" }}>
              Up in 3 minutes.
            </h2>
            <p className="mb-8" style={{ fontSize: "clamp(14px, 1.5vw, 15px)", color: "rgba(255,255,255,0.4)" }}>
              No infrastructure to manage. No subscriptions to juggle. Just an API key and credits.
            </p>

            <div className="flex flex-col gap-2">
              {STEPS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className="flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200"
                  style={{
                    background: active === i ? "rgba(124,58,237,0.08)" : "transparent",
                    border: `1px solid ${active === i ? "rgba(124,58,237,0.2)" : "transparent"}`,
                    minHeight: 64,
                  }}
                >
                  <span className="text-[11px] font-black font-mono w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: active === i ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)", color: active === i ? "#A78BFA" : "rgba(255,255,255,0.25)", border: `1px solid ${active === i ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.07)"}` }}>
                    {s.n}
                  </span>
                  <div>
                    <div className="text-[14px] font-semibold mb-0.5" style={{ color: active === i ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)" }}>{s.title}</div>
                    <div className="text-[13px]" style={{ color: "rgba(255,255,255,0.35)" }}>{s.desc}</div>
                    {active === i && <div className="mt-2 text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{s.detail}</div>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right — dashboard mockup */}
          <div className="flex flex-col gap-4">
            {/* Credit balance */}
            <div className="rounded-xl p-4 sm:p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-white/30 uppercase tracking-widest">Account balance</span>
                <span className="text-[11px] text-white/30">Updated just now</span>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="font-black text-white font-mono" style={{ fontSize: "clamp(1.6rem, 4vw, 2rem)" }}>$47.83</span>
                <span className="text-[13px] text-white/30">remaining</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full" style={{ width: "47.83%", background: "linear-gradient(90deg, #7C3AED, #A78BFA)" }} />
              </div>
              <div className="flex items-center justify-between text-[12px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                <span>$47.83 of $100.00 used</span>
                <button className="text-violet-400 font-medium" style={{ minHeight: 32 }}>Add credits →</button>
              </div>
            </div>

            {/* API key */}
            <div className="rounded-xl p-4 sm:p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="text-[11px] text-white/30 uppercase tracking-widest mb-3">API Key</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2.5 rounded-lg font-mono text-[12px] min-w-0 truncate" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}>
                  zc-••••••••••••••••••••••••••••••••
                </div>
                <button className="flex-shrink-0 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors duration-150" style={{ background: "rgba(124,58,237,0.15)", color: "#A78BFA", border: "1px solid rgba(124,58,237,0.2)", minHeight: 44 }}>
                  Copy
                </button>
              </div>
            </div>

            {/* Usage chart */}
            <div className="rounded-xl p-4 sm:p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-white/30 uppercase tracking-widest">Usage today</span>
                <span className="text-[13px] font-mono font-bold text-white/70">2.4M tokens</span>
              </div>
              <div className="flex items-end gap-1 h-10">
                {[40, 55, 35, 70, 60, 80, 45, 90, 75, 85, 65, 95].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i === 11 ? "#7C3AED" : "rgba(124,58,237,0.25)" }} />
                ))}
              </div>
              <div className="flex items-center justify-between mt-2 text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                <span>12 hours ago</span>
                <span>Now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
