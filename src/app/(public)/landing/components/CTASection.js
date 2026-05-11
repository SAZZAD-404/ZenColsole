"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

function CTACanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf, t = 0;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize, { passive: true });
    const draw = () => {
      t += 0.008;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < 3; i++) {
        const cx = w * (0.3 + i * 0.2) + Math.sin(t * (0.4 + i * 0.1)) * w * 0.1;
        const cy = h * 0.5 + Math.cos(t * (0.3 + i * 0.15)) * h * 0.2;
        const r = Math.min(w, h) * (0.3 + i * 0.05);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, `rgba(11,124,143,${0.15 - i * 0.03})`);
        g.addColorStop(1, "rgba(11,124,143,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />;
}

export default function CTASection() {
  const router = useRouter();
  return (
    <section className="relative py-28 px-5 sm:px-8 overflow-hidden" style={{ background: "#08080A" }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(11,124,143,0.4), transparent)" }} />
      <CTACanvas />
      <div className="relative max-w-3xl mx-auto text-center">
        <h2 className="font-black text-white leading-[1.04] tracking-[-0.04em] mb-5" style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}>
          Your AI stack.<br />
          <span style={{ color: "rgba(255,255,255,0.3)" }}>Fully under control.</span>
        </h2>
        <p className="mb-10" style={{ fontSize: 17, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: 480, margin: "0 auto 2.5rem" }}>
          The unified API for every LLM. Better prices, better uptime. Route 195+ models through one endpoint in under 2 minutes.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 rounded-full font-semibold text-white transition-all duration-300 active:scale-[0.97]"
            style={{ height: 52, paddingLeft: 32, paddingRight: 32, background: "linear-gradient(135deg, #0B7C8F 0%, #0ea5c9 100%)", boxShadow: "0 0 28px rgba(11,124,143,0.45), inset 0 1px 0 rgba(255,255,255,0.15)", fontSize: 15 }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 40px rgba(11,124,143,0.65), inset 0 1px 0 rgba(255,255,255,0.15)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 28px rgba(11,124,143,0.45), inset 0 1px 0 rgba(255,255,255,0.15)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Open dashboard
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 7.5H13M13 7.5L8.5 3M13 7.5L8.5 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <a
            href="https://github.com/zentixofficial/ZenConsole"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full font-medium transition-all duration-300"
            style={{ height: 52, paddingLeft: 28, paddingRight: 28, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)", fontSize: 15 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" /></svg>
            View on GitHub
          </a>
        </div>
        <p className="mt-8" style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>
        </p>
      </div>
    </section>
  );
}
