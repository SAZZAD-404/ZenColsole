"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ─────────────────────────────────────────────────────────────
   Skill: high-end-visual-design §4A — Double-Bezel Logo Mark
   Outer shell + inner core with concentric radii
───────────────────────────────────────────────────────────── */
function LogoMark() {
  return (
    /* Outer shell */
    <div
      className="relative flex-shrink-0"
      style={{
        width: 38, height: 38,
        borderRadius: 11,
        background: "rgba(124,58,237,0.15)",
        border: "1px solid rgba(124,58,237,0.35)",
        padding: 4,
      }}
    >
      {/* Inner core — skill §4A: mathematically smaller radius */}
      <div
        className="w-full h-full flex items-center justify-center relative overflow-hidden"
        style={{
          borderRadius: 7,
          background: "linear-gradient(145deg, #7C3AED 0%, #4F46E5 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22)",
        }}
      >
        {/* Inner radial highlight */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.28) 0%, transparent 65%)",
          }}
          aria-hidden="true"
        />
        <svg width="15" height="15" viewBox="0 0 12 12" fill="none" className="relative z-10">
          <path
            d="M6 1L10.5 3.5V8.5L6 11L1.5 8.5V3.5L6 1Z"
            stroke="rgba(255,255,255,0.95)"
            strokeWidth="1.1"
            strokeLinejoin="round"
            fill="rgba(255,255,255,0.08)"
          />
          <circle cx="6" cy="6" r="1.6" fill="white" />
        </svg>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Skill: high-end-visual-design §4B — Button-in-Button CTA
   Trailing icon nested in its own circular wrapper
───────────────────────────────────────────────────────────── */
function PrimaryButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2.5 pl-5 pr-2 py-2 rounded-full font-semibold text-white text-[14px] transition-all active:scale-[0.97]"
      style={{
        background: "#7C3AED",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 3px rgba(0,0,0,0.4)",
        letterSpacing: "-0.01em",
        transition: "background 0.22s cubic-bezier(0.32,0.72,0,1), box-shadow 0.22s cubic-bezier(0.32,0.72,0,1), transform 0.22s cubic-bezier(0.32,0.72,0,1)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "#6D28D9";
        e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.18), 0 6px 20px rgba(124,58,237,0.45)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "#7C3AED";
        e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 3px rgba(0,0,0,0.4)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {children}
      {/* Nested icon circle — skill §4B */}
      <span
        className="flex items-center justify-center rounded-full transition-all duration-300"
        style={{
          width: 26, height: 26,
          background: "rgba(255,255,255,0.15)",
          transition: "transform 0.3s cubic-bezier(0.32,0.72,0,1), background 0.2s ease",
        }}
        aria-hidden="true"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1.5 5h7M5.5 2l3 3-3 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   Nav links with sliding active indicator
───────────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#models",   label: "Models"   },
  { href: "#pricing",  label: "Pricing"  },
  { href: "#docs",     label: "Docs"     },
];

function NavLinks({ activeSection }) {
  const containerRef = useRef(null);
  const linkRefs     = useRef({});
  const [pill, setPill] = useState({ left: 0, width: 0, show: false });

  useEffect(() => {
    const el  = linkRefs.current[`#${activeSection}`];
    const box = containerRef.current;
    if (!el || !box) { setPill(p => ({ ...p, show: false })); return; }
    const bRect = box.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    setPill({ left: eRect.left - bRect.left, width: eRect.width, show: true });
  }, [activeSection]);

  return (
    <div ref={containerRef} className="hidden md:flex items-center relative" style={{ gap: 2 }}>
      {/* Sliding pill — skill §5A fluid island */}
      <span
        aria-hidden="true"
        className="absolute top-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          left:       pill.left,
          width:      pill.width,
          height:     34,
          background: "rgba(255,255,255,0.08)",
          opacity:    pill.show ? 1 : 0,
          transition: "left 0.25s cubic-bezier(0.32,0.72,0,1), width 0.25s cubic-bezier(0.32,0.72,0,1), opacity 0.18s ease",
        }}
      />
      {NAV_LINKS.map(link => {
        const isActive = activeSection === link.href.slice(1);
        return (
          <a
            key={link.href}
            href={link.href}
            ref={el => { linkRefs.current[link.href] = el; }}
            className="relative z-10 px-4 py-2 text-[14px] font-medium rounded-full"
            style={{
              color: isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.42)",
              transition: "color 0.18s ease",
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.72)"; }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "rgba(255,255,255,0.42)"; }}
          >
            {link.label}
          </a>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Navigation
   Skill: high-end-visual-design §5A — Floating Glass Pill
   Detached from top: mt-4, mx-auto, w-max, rounded-full
───────────────────────────────────────────────────────────── */
export default function Navigation() {
  const router = useRouter();
  const [scrolled,      setScrolled]      = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [mobileOpen,    setMobileOpen]    = useState(false);

  /* Scroll + active section */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      let current = "";
      for (const { href } of NAV_LINKS) {
        const el = document.getElementById(href.slice(1));
        if (el && el.getBoundingClientRect().top <= 90) current = href.slice(1);
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Body scroll lock */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          Skill §5A: Floating Glass Pill — detached from top
          Transitions from transparent pill → frosted glass pill
      ══════════════════════════════════════════════════════ */}
      <header
        role="banner"
        className="fixed top-0 inset-x-0 z-50 flex justify-center pointer-events-none"
            style={{ paddingTop: scrolled ? 12 : 20, transition: "padding-top 0.4s cubic-bezier(0.32,0.72,0,1)" }}
      >
        <nav
          className="pointer-events-auto flex items-center justify-between"
          style={{
            borderRadius: 999,
            height: 66,
            paddingLeft: 12,
            paddingRight: 12,
            gap: 8,

            /* Skill §5A: glass effect */
            background: scrolled
              ? "rgba(12,12,16,0.78)"
              : "rgba(12,12,16,0.45)",
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",

            /* Skill §4A: double-bezel outer ring */
            border: scrolled
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid rgba(255,255,255,0.07)",
            boxShadow: scrolled
              ? "0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)"
              : "0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",

            width: "calc(100% - 48px)",
            maxWidth: 1290,

            transition: [
              "background 0.4s cubic-bezier(0.32,0.72,0,1)",
              "border-color 0.4s cubic-bezier(0.32,0.72,0,1)",
              "box-shadow 0.4s cubic-bezier(0.32,0.72,0,1)",
            ].join(", "),
          }}
          aria-label="Main navigation"
        >
          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-3 pl-2 flex-shrink-0">
            <LogoMark />
            <span
              className="font-semibold text-white tracking-tight hidden sm:block"
              style={{ fontSize: 16, letterSpacing: "-0.025em" }}
            >
              ZenConsole
            </span>
          </Link>

          {/* ── Center links ── */}
          <NavLinks activeSection={activeSection} />

          {/* ── Right actions ── */}
          <div className="hidden md:flex items-center gap-1.5 pr-2">
            {/* Sign in */}
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 rounded-full text-[14px] font-medium"
              style={{ color: "rgba(255,255,255,0.48)", transition: "color 0.18s ease, background 0.18s ease" }}
              onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.82)"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.48)"; e.currentTarget.style.background = "transparent"; }}
            >
              Sign in
            </button>

            {/* Skill §4B: Button-in-Button CTA */}
            <PrimaryButton onClick={() => router.push("/dashboard")}>
              Get API Key
            </PrimaryButton>
          </div>

          {/* ── Mobile hamburger ── */}
          {/* Skill §5A: Hamburger Morph */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden flex flex-col items-center justify-center mr-1 rounded-full transition-colors duration-200"
            style={{
              width: 36, height: 36,
              background: mobileOpen ? "rgba(255,255,255,0.1)" : "transparent",
              gap: 5,
            }}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="block rounded-full"
                style={{
                  width: 16,
                  height: 1.5,
                  background: "rgba(255,255,255,0.7)",
                  transformOrigin: "center",
                  transition: `transform 0.28s cubic-bezier(0.32,0.72,0,1), opacity 0.2s ease`,
                  transform: mobileOpen
                    ? i === 0 ? "rotate(45deg) translate(0, 6.5px)"
                    : i === 1 ? "scaleX(0)"
                    : "rotate(-45deg) translate(0, -6.5px)"
                    : "none",
                  opacity: mobileOpen && i === 1 ? 0 : 1,
                }}
              />
            ))}
          </button>
        </nav>
      </header>

      {/* ══════════════════════════════════════════════════════
          Skill §5A: Modal Expansion — full-screen glass overlay
          Staggered mask reveal on nav links
      ══════════════════════════════════════════════════════ */}
      <div
        aria-hidden={!mobileOpen}
        className="fixed inset-0 z-40 md:hidden flex flex-col"
        style={{
          /* Skill §5A: heavy glass overlay */
          background: "rgba(8,8,12,0.94)",
          backdropFilter: "blur(28px) saturate(160%)",
          WebkitBackdropFilter: "blur(28px) saturate(160%)",
          paddingTop: 80,
          opacity:       mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? "all" : "none",
          transform:     mobileOpen ? "translateY(0)" : "translateY(-10px)",
          transition:    "opacity 0.28s cubic-bezier(0.32,0.72,0,1), transform 0.28s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        {/* Skill §5A: Staggered mask reveal */}
        <nav className="flex flex-col px-5 gap-1" aria-label="Mobile navigation">
          {NAV_LINKS.map((link, i) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-4 py-3.5 rounded-2xl text-[16px] font-medium"
                style={{
                  color:      isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.48)",
                  background: isActive ? "rgba(124,58,237,0.12)"  : "transparent",
                  opacity:   mobileOpen ? 1 : 0,
                  transform: mobileOpen ? "translateY(0)" : "translateY(12px)",
                  transition: [
                    `opacity 0.32s cubic-bezier(0.32,0.72,0,1) ${80 + i * 45}ms`,
                    `transform 0.32s cubic-bezier(0.32,0.72,0,1) ${80 + i * 45}ms`,
                    "color 0.15s ease",
                    "background 0.15s ease",
                  ].join(", "),
                }}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#A78BFA", boxShadow: "0 0 6px rgba(167,139,250,0.6)" }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Divider */}
        <div
          className="mx-5 my-4"
          style={{
            height: 1,
            background: "rgba(255,255,255,0.07)",
            opacity:   mobileOpen ? 1 : 0,
            transition: `opacity 0.3s ease ${80 + (NAV_LINKS.length + 1) * 45}ms`,
          }}
          aria-hidden="true"
        />

        {/* CTA buttons */}
        <div
          className="flex flex-col gap-2.5 px-5"
          style={{
            opacity:   mobileOpen ? 1 : 0,
            transform: mobileOpen ? "translateY(0)" : "translateY(10px)",
            transition: `opacity 0.32s ease ${80 + (NAV_LINKS.length + 2) * 45}ms, transform 0.32s ease ${80 + (NAV_LINKS.length + 2) * 45}ms`,
          }}
        >
          <button
            onClick={() => { setMobileOpen(false); router.push("/login"); }}
            className="w-full py-3.5 rounded-2xl text-[14px] font-medium active:scale-[0.98]"
            style={{
              color:      "rgba(255,255,255,0.6)",
              background: "rgba(255,255,255,0.06)",
              border:     "1px solid rgba(255,255,255,0.09)",
              transition: "transform 0.18s cubic-bezier(0.32,0.72,0,1)",
            }}
          >
            Sign in
          </button>
          <button
            onClick={() => { setMobileOpen(false); router.push("/dashboard"); }}
            className="w-full py-3.5 rounded-2xl text-[14px] font-semibold text-white active:scale-[0.98]"
            style={{
              background: "#7C3AED",
              boxShadow:  "inset 0 1px 0 rgba(255,255,255,0.18), 0 4px 16px rgba(124,58,237,0.35)",
              transition: "transform 0.18s cubic-bezier(0.32,0.72,0,1)",
            }}
          >
            Get API Key
          </button>
        </div>

        {/* Status indicator — bottom */}
        <div
          className="mt-auto px-9 pb-10"
          style={{
            opacity:   mobileOpen ? 1 : 0,
            transition: `opacity 0.3s ease ${80 + (NAV_LINKS.length + 3) * 45}ms`,
          }}
        />
      </div>

      <style>{`
        @keyframes statusPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(52,211,153,0.4); }
          50%       { opacity: 0.6; box-shadow: 0 0 0 4px rgba(52,211,153,0); }
        }
      `}</style>
    </>
  );
}
