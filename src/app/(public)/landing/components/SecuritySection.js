"use client";

const ITEMS = [
  { title: "SOC 2 Type II compliant",         desc: "Annual third-party audits. Your data is handled with enterprise-grade security controls.", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L4 5v5c0 4 2.5 6.5 6 7.5 3.5-1 6-3.5 6-7.5V5L10 2Z" stroke="#A78BFA" strokeWidth="1.3" strokeLinejoin="round" /><path d="M7 10l2.5 2.5L13 7" stroke="#A78BFA" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { title: "Encrypted in transit and at rest", desc: "TLS 1.3 for all connections. API keys and credentials encrypted at rest with AES-256.",   icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="9" width="12" height="9" rx="1.5" stroke="#A78BFA" strokeWidth="1.3" /><path d="M7 9V6.5a3 3 0 0 1 6 0V9" stroke="#A78BFA" strokeWidth="1.3" strokeLinecap="round" /><circle cx="10" cy="13.5" r="1.5" fill="#A78BFA" /></svg> },
  { title: "No prompt logging by default",     desc: "We don't log your prompts or responses. Enable logging explicitly if you need it.",        icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 3l14 14M8 4.5A6 6 0 0 1 16 10c0 1-.25 2-.7 2.8M5 6.5A6 6 0 0 0 4 10c0 3.3 2.7 6 6 6 1.1 0 2.1-.3 3-.8" stroke="#A78BFA" strokeWidth="1.3" strokeLinecap="round" /></svg> },
  { title: "Fine-grained data policies",       desc: "Control which providers receive which prompts. Block sensitive data from untrusted providers.", icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 6h14M3 10h9M3 14h6" stroke="#A78BFA" strokeWidth="1.3" strokeLinecap="round" /><circle cx="15" cy="13.5" r="3" stroke="#A78BFA" strokeWidth="1.3" /><path d="M15 12.5v1.5l1 1" stroke="#A78BFA" strokeWidth="1.1" strokeLinecap="round" /></svg> },
];

export default function SecuritySection() {
  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8" style={{ background: "#0A0A0C" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md mb-4" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
              <span className="text-[11px] font-semibold text-violet-400 uppercase tracking-widest">Security</span>
            </div>
            <h2 className="font-black text-white tracking-tight leading-[1.05] mb-3" style={{ fontSize: "clamp(1.7rem, 3.5vw, 2.6rem)" }}>
              Enterprise-ready<br />
              <span style={{ color: "rgba(255,255,255,0.3)" }}>from day one.</span>
            </h2>
            <p style={{ fontSize: "clamp(14px, 1.5vw, 15px)", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: 420 }}>
              Security isn't an add-on. Every request is encrypted, every credential is protected, and you control exactly where your data goes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ITEMS.map((item, i) => (
              <div
                key={i}
                className="p-4 sm:p-5 rounded-xl transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.06)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.18)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
              >
                <div className="mb-3 w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}>
                  {item.icon}
                </div>
                <div className="text-[14px] font-semibold text-white/80 mb-1.5">{item.title}</div>
                <div className="text-[13px] leading-relaxed text-white/35">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
