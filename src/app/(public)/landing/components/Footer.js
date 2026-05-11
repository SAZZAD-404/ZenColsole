"use client";
import Link from "next/link";

const LINKS = {
  Product:    [{ label: "Models", href: "#models" }, { label: "Pricing", href: "#pricing" }, { label: "Enterprise", href: "#" }, { label: "Changelog", href: "#" }],
  Developers: [{ label: "Documentation", href: "#" }, { label: "API Reference", href: "#" }, { label: "Quickstart", href: "#" }, { label: "SDKs", href: "#" }],
  Company:    [{ label: "About", href: "#" }, { label: "Blog", href: "#" }, { label: "Privacy", href: "#" }, { label: "Terms", href: "#" }],
};

export default function Footer() {
  return (
    <footer className="px-4 sm:px-6 lg:px-8 pt-12 sm:pt-14 pb-8" style={{ background: "#0A0A0C", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)" }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1L10.5 3.5V8.5L6 11L1.5 8.5V3.5L6 1Z" stroke="white" strokeWidth="1.2" strokeLinejoin="round" fill="rgba(255,255,255,0.15)" />
                </svg>
              </div>
              <span className="font-semibold text-white text-[15px]">ZenConsole</span>
            </Link>
            <p className="text-[13px] leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.3)", maxWidth: 200 }}>
              The unified API for every LLM. Better prices, better uptime.
            </p>
            {/* Social */}
            <div className="flex items-center gap-2">
              <a
                href="https://github.com/zentixofficial/ZenConsole"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.07)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
                aria-label="GitHub"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <div className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.2)" }}>{section}</div>
              <ul className="flex flex-col gap-3">
                {items.map(item => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-[14px] transition-colors duration-150"
                      style={{ color: "rgba(255,255,255,0.38)" }}
                      onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.38)"; }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-center gap-3 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>© 2026 ZenConsole, Inc. All rights reserved.</p>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </footer>
  );
}
