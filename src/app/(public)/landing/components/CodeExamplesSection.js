"use client";
import { useState } from "react";

const TABS = [
  {
    label: "Python",
    code: `from openai import OpenAI

client = OpenAI(
    base_url="https://api.zenconsole.dev/v1",
    api_key="zc-your-key",
)

response = client.chat.completions.create(
    model="anthropic/claude-opus-4.7",
    messages=[
        {"role": "user", "content": "Hello!"}
    ],
)
print(response.choices[0].message.content)`,
  },
  {
    label: "Node.js",
    code: `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.zenconsole.dev/v1",
  apiKey: "zc-your-key",
});

const response = await client.chat.completions.create({
  model: "openai/gpt-5.5",
  messages: [{ role: "user", content: "Hello!" }],
});

console.log(response.choices[0].message.content);`,
  },
  {
    label: "cURL",
    code: `curl https://api.zenconsole.dev/v1/chat/completions \\
  -H "Authorization: Bearer zc-your-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "google/gemini-3.1-pro-preview",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'`,
  },
  {
    label: "Combo",
    code: `# Create a combo in the dashboard.
# ZenConsole auto-routes through the chain.

response = client.chat.completions.create(
    model="my-production-stack",
    # Resolves to:
    #  1. anthropic/claude-opus-4.7  (primary)
    #  2. openai/gpt-5.5             (fallback)
    #  3. google/gemini-3.1-pro      (last resort)
    messages=[{"role": "user", "content": "Hello!"}],
)`,
  },
];

const SDKS = ["OpenAI SDK", "LangChain", "LlamaIndex", "Vercel AI SDK", "Any HTTP client"];

export default function CodeExamplesSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8" style={{ background: "#0A0A0C" }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md mb-4" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <span className="text-[11px] font-semibold text-violet-400 uppercase tracking-widest">Integration</span>
          </div>
          <h2 className="font-black text-white tracking-tight leading-[1.05] mb-3" style={{ fontSize: "clamp(1.7rem, 3.5vw, 2.6rem)" }}>
            Drop-in replacement.
          </h2>
          <p style={{ fontSize: "clamp(14px, 1.5vw, 15px)", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: 480 }}>
            Change two lines. Keep everything else. Works with every OpenAI-compatible SDK.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-start">
          {/* Left — SDK list (hidden on mobile, shown lg+) */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="text-[12px] font-semibold text-white/30 uppercase tracking-widest mb-3">Compatible with</div>
            <div className="flex flex-col gap-2">
              {SDKS.map(sdk => (
                <div key={sdk} className="flex items-center gap-2.5 text-[14px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7l3 3 6-6" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {sdk}
                </div>
              ))}
            </div>
          </div>

          {/* Right — code block */}
          <div className="lg:col-span-3 rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {/* Tabs — horizontal scroll on mobile */}
            <div className="flex overflow-x-auto" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", scrollbarWidth: "none" }}>
              {TABS.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className="flex-shrink-0 px-4 py-3 text-[13px] font-medium transition-all duration-150"
                  style={{
                    color:        active === i ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.35)",
                    background:   active === i ? "rgba(255,255,255,0.06)" : "transparent",
                    borderBottom: active === i ? "2px solid #7C3AED" : "2px solid transparent",
                    minHeight:    44,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {/* Code */}
            <div className="overflow-x-auto">
              <pre className="p-4 sm:p-5 text-[12px] sm:text-[13px] leading-relaxed min-w-0" style={{ fontFamily: "var(--font-geist-mono), monospace", color: "rgba(255,255,255,0.6)" }}>
                <code>{TABS[active].code}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* SDK chips on mobile */}
        <div className="flex flex-wrap gap-2 mt-5 lg:hidden">
          {SDKS.map(sdk => (
            <span key={sdk} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.45)" }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2 2 4-4" stroke="#A78BFA" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {sdk}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
