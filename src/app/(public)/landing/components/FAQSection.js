"use client";
import { useState } from "react";

const FAQS = [
  { q: "How is ZenConsole different from calling providers directly?",  a: "ZenConsole gives you a single API key that works across 400+ models from 60+ providers. You get automatic failover, best-price routing, unified billing, and usage analytics — without managing multiple accounts and API keys." },
  { q: "Do my credits expire?",                                         a: "No. Credits never expire. Buy them once and use them whenever you need them." },
  { q: "Is it really OpenAI-compatible?",                               a: "Yes. Change your base URL to api.zenconsole.dev/v1 and your API key to your ZenConsole key. Every OpenAI-compatible SDK, framework, and tool works without any other code changes." },
  { q: "How does provider failover work?",                              a: "When a provider returns an error or goes down, ZenConsole automatically retries the request with the next available provider in your fallback chain. This happens transparently — your application sees a successful response." },
  { q: "Can I control which providers receive my data?",                a: "Yes. You can set data policies per API key or per model. For example, you can ensure that requests containing certain patterns only go to providers with specific data agreements." },
  { q: "Do you log my prompts?",                                        a: "No. We don't log prompt content by default. We only log metadata (model, tokens, latency, cost) for billing and analytics. You can optionally enable request logging for debugging." },
];

export default function FAQSection() {
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8" style={{ background: "#0A0A0C" }}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md mb-4" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <span className="text-[11px] font-semibold text-violet-400 uppercase tracking-widest">FAQ</span>
          </div>
          <h2 className="font-black text-white tracking-tight leading-[1.05]" style={{ fontSize: "clamp(1.7rem, 3.5vw, 2.6rem)" }}>
            Common questions.
          </h2>
        </div>

        <div className="flex flex-col gap-2">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden transition-all duration-200"
              style={{ background: open === i ? "rgba(124,58,237,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${open === i ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.06)"}` }}
            >
              {/* Touch-friendly tap target */}
              <button
                className="w-full flex items-center justify-between gap-4 px-4 sm:px-5 text-left"
                style={{ minHeight: 60, paddingTop: 16, paddingBottom: 16 }}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-[14px] font-medium leading-snug" style={{ color: open === i ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)" }}>
                  {faq.q}
                </span>
                <svg
                  width="16" height="16" viewBox="0 0 16 16" fill="none"
                  className="flex-shrink-0 transition-transform duration-200"
                  style={{ transform: open === i ? "rotate(45deg)" : "rotate(0deg)", color: open === i ? "#A78BFA" : "rgba(255,255,255,0.25)" }}
                >
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              {open === i && (
                <div className="px-4 sm:px-5 pb-4">
                  <p className="text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
