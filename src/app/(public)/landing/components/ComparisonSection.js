"use client";

const ROWS = [
  { feature: "Access to 400+ models",          zen: true,  direct: false, other: false },
  { feature: "No subscriptions required",       zen: true,  direct: false, other: true  },
  { feature: "Automatic provider failover",     zen: true,  direct: false, other: false },
  { feature: "Best-price routing",              zen: true,  direct: false, other: false },
  { feature: "OpenAI-compatible API",           zen: true,  direct: true,  other: true  },
  { feature: "Usage analytics dashboard",       zen: true,  direct: false, other: true  },
  { feature: "Custom data policies",            zen: true,  direct: false, other: false },
  { feature: "Credits never expire",            zen: true,  direct: false, other: false },
  { feature: "Single invoice for all providers",zen: true,  direct: false, other: false },
];

function Tick({ v }) {
  if (v) return (
    <div className="flex justify-center">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="8" fill="rgba(124,58,237,0.15)" stroke="rgba(124,58,237,0.3)" strokeWidth="1" />
        <path d="M5.5 9l2.5 2.5L12.5 6" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
  return (
    <div className="flex justify-center">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        <path d="M6.5 11.5l5-5M6.5 6.5l5 5" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function ComparisonSection() {
  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8" style={{ background: "#0A0A0C" }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md mb-4" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <span className="text-[11px] font-semibold text-violet-400 uppercase tracking-widest">Why ZenConsole</span>
          </div>
          <h2 className="font-black text-white tracking-tight leading-[1.05]" style={{ fontSize: "clamp(1.7rem, 3.5vw, 2.6rem)" }}>
            One API beats many.
          </h2>
        </div>

        {/* Horizontal scroll on mobile */}
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="overflow-x-auto">
            {/* Header */}
            <div className="grid px-4 py-3 min-w-[420px]" style={{ gridTemplateColumns: "1fr 100px 100px 100px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div />
              {["ZenConsole", "Direct APIs", "Competitors"].map((h, i) => (
                <div key={i} className="text-center text-[12px] font-semibold" style={{ color: i === 0 ? "#A78BFA" : "rgba(255,255,255,0.3)" }}>{h}</div>
              ))}
            </div>

            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
              {ROWS.map((row, i) => (
                <div
                  key={i}
                  className="grid px-4 py-3 transition-colors duration-100 min-w-[420px]"
                  style={{ gridTemplateColumns: "1fr 100px 100px 100px" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.04)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div className="text-[13px] self-center" style={{ color: "rgba(255,255,255,0.6)" }}>{row.feature}</div>
                  <Tick v={row.zen} />
                  <Tick v={row.direct} />
                  <Tick v={row.other} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
