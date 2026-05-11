"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* ─── Live 3D Particle Field (WebGL-style via Canvas) ─── */
function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Nodes
    const NODE_COUNT = 80;
    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
      vx: (Math.random() - 0.5) * 0.0003,
      vy: (Math.random() - 0.5) * 0.0003,
      vz: (Math.random() - 0.5) * 0.0002,
      r: Math.random() * 1.5 + 0.5,
    }));

    const draw = () => {
      t += 0.005;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);

      // Slow drift
      nodes.forEach((n) => {
        n.x += n.vx + Math.sin(t * 0.3 + n.z * 10) * 0.00008;
        n.y += n.vy + Math.cos(t * 0.2 + n.z * 8) * 0.00008;
        n.z += n.vz;
        if (n.x < 0) n.x = 1;
        if (n.x > 1) n.x = 0;
        if (n.y < 0) n.y = 1;
        if (n.y > 1) n.y = 0;
        if (n.z < 0) n.z = 1;
        if (n.z > 1) n.z = 0;
      });

      // Draw connections
      for (let i = 0; i < NODE_COUNT; i++) {
        for (let j = i + 1; j < NODE_COUNT; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = (a.x - b.x) * W;
          const dy = (a.y - b.y) * H;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.18 * (0.5 + a.z * 0.5);
            ctx.beginPath();
            ctx.moveTo(a.x * W, a.y * H);
            ctx.lineTo(b.x * W, b.y * H);
            ctx.strokeStyle = `rgba(11,180,210,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((n) => {
        const px = n.x * W;
        const py = n.y * H;
        const size = n.r * (0.6 + n.z * 0.8);
        const alpha = 0.3 + n.z * 0.5;
        const grad = ctx.createRadialGradient(px, py, 0, px, py, size * 3);
        grad.addColorStop(0, `rgba(11,180,210,${alpha})`);
        grad.addColorStop(1, "rgba(11,180,210,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, size * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(180,240,255,${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(px, py, size * 0.7, 0, Math.PI * 2);
        ctx.fill();
      });

      // Animated teal orbs
      const orbs = [
        { cx: 0.25 + Math.sin(t * 0.4) * 0.06, cy: 0.35 + Math.cos(t * 0.3) * 0.05, r: 0.28, color: "rgba(11,124,143," },
        { cx: 0.75 + Math.cos(t * 0.35) * 0.05, cy: 0.55 + Math.sin(t * 0.45) * 0.06, r: 0.22, color: "rgba(14,165,201," },
        { cx: 0.5 + Math.sin(t * 0.25) * 0.04, cy: 0.7 + Math.cos(t * 0.5) * 0.04, r: 0.18, color: "rgba(11,124,143," },
      ];
      orbs.forEach(({ cx, cy, r, color }) => {
        const px = cx * W, py = cy * H, pr = r * Math.min(W, H);
        const g = ctx.createRadialGradient(px, py, 0, px, py, pr);
        g.addColorStop(0, color + "0.22)");
        g.addColorStop(0.5, color + "0.10)");
        g.addColorStop(1, color + "0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      aria-hidden="true"
    />
  );
}

/* ─── Animated provider logos strip ─── */
const PROVIDERS = [
  { name: "Claude", color: "#D97706" },
  { name: "GPT-5", color: "#10B981" },
  { name: "Gemini", color: "#3B82F6" },
  { name: "DeepSeek", color: "#8B5CF6" },
  { name: "Kiro", color: "#0B7C8F" },
  { name: "Groq", color: "#F59E0B" },
  { name: "Mistral", color: "#EF4444" },
  { name: "Llama", color: "#6366F1" },
  { name: "Grok", color: "#EC4899" },
  { name: "MiniMax", color: "#14B8A6" },
  { name: "GLM", color: "#F97316" },
  { name: "Kimi", color: "#06B6D4" },
];

function ProviderStrip() {
  const doubled = [...PROVIDERS, ...PROVIDERS];
  return (
    <div className="relative w-full overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}>
      <div
        className="flex gap-3 w-max"
        style={{ animation: "marquee 28s linear infinite" }}
      >
        {doubled.map((p, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full flex-shrink-0"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: p.color, boxShadow: `0 0 6px ${p.color}80` }}
            />
            <span className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
              {p.name}
            </span>
          </div>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}

/* ─── Live request counter animation ─── */
function LiveCounter() {
  const [count, setCount] = useState(2847391);
  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => c + Math.floor(Math.random() * 4 + 1));
    }, 800);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono tabular-nums" style={{ color: "#0BB4D2" }}>
      {count.toLocaleString()}
    </span>
  );
}

/* ─── Main Hero ─── */
export default function HeroSection() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fadeUp = (delay = 0) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
  });

  return (
    <section
      className="relative overflow-hidden"
      style={{ minHeight: "100dvh", background: "#08080A" }}
    >
      {/* 3D particle field */}
      <ParticleField />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 20%, #08080A 80%)",
        }}
        aria-hidden="true"
      />

      {/* Grid lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        className="relative flex flex-col items-center justify-center text-center px-5 sm:px-8"
        style={{ minHeight: "100dvh", paddingTop: 80, paddingBottom: 80 }}
      >
        {/* Headline */}
        <div style={fadeUp(0.08)}>
          <h1
            className="font-black text-white leading-[1.02] tracking-[-0.04em] mb-6"
            style={{ fontSize: "clamp(2.8rem, 6.5vw, 5rem)", maxWidth: 820, margin: "0 auto 1.5rem" }}
          >
            The AI gateway
            <br />
            <span
              style={{
                background: "linear-gradient(90deg, #0BB4D2 0%, #0B7C8F 50%, #0BB4D2 100%)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "shimmer 4s linear infinite",
              }}
            >
              built for developers.
            </span>
          </h1>
        </div>

        {/* Subheadline */}
        <div style={fadeUp(0.16)}>
          <p
            style={{
              fontSize: "clamp(15px, 1.8vw, 18px)",
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.75,
              maxWidth: 540,
              margin: "0 auto 2.5rem",
            }}
          >
            One endpoint. 195+ models. Smart routing, auto-failover, RTK token compression, and real-time usage analytics — all self-hosted.
          </p>
        </div>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
          style={fadeUp(0.24)}
        >
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 rounded-full font-semibold text-white transition-all duration-300 active:scale-[0.97]"
            style={{
              height: 48,
              paddingLeft: 28,
              paddingRight: 28,
              background: "linear-gradient(135deg, #0B7C8F 0%, #0ea5c9 100%)",
              boxShadow: "0 0 24px rgba(11,124,143,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
              fontSize: 14,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 36px rgba(11,124,143,0.6), inset 0 1px 0 rgba(255,255,255,0.15)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 24px rgba(11,124,143,0.4), inset 0 1px 0 rgba(255,255,255,0.15)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Start for free
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7H12M12 7L8 3M12 7L8 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-full font-medium transition-all duration-300"
            style={{
              height: 48,
              paddingLeft: 26,
              paddingRight: 26,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.55)",
              fontSize: 14,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
          >
            See how it works
          </a>
        </div>

        {/* Live stat */}
        <div style={fadeUp(0.32)}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginBottom: 28 }}>
            <LiveCounter /> requests routed · OpenAI-compatible · Free to start
          </p>
        </div>

        {/* Provider strip */}
        <div className="w-full max-w-3xl" style={fadeUp(0.38)}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginBottom: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Works with 40+ providers
          </p>
          <ProviderStrip />
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes shimmer { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
      `}</style>
    </section>
  );
}
