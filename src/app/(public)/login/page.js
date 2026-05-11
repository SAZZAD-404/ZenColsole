"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { APP_CONFIG } from "@/shared/constants/config";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasPassword, setHasPassword] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    async function checkAuth() {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      try {
        const res = await fetch("/api/settings", { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data.requireLogin === false) {
            router.push("/dashboard");
            router.refresh();
            return;
          }
          setHasPassword(!!data.hasPassword);
        } else {
          setHasPassword(true);
        }
      } catch {
        clearTimeout(timeoutId);
        setHasPassword(true);
      }
    }
    checkAuth();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        console.log("Login successful:", data.user);
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Invalid email/username or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (hasPassword === null) {
    return (
      <div
        className="min-h-[100dvh] flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #0A0C10 0%, #0F1419 100%)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-[#2cb3d8] text-[40px] animate-spin">
            progress_activity
          </span>
          <p className="text-white/40 text-[13px] tracking-wide">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center p-4 relative overflow-hidden"
      style={{ 
        background: "linear-gradient(135deg, #0A0C10 0%, #0F1419 100%)",
        fontFamily: "var(--font-sans, system-ui)" 
      }}
    >
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Animated Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(to right, #2cb3d8 1px, transparent 1px), linear-gradient(to bottom, #2cb3d8 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
            animation: "gridPulse 8s ease-in-out infinite",
          }}
        />
        
        {/* Gradient Orbs with Animation */}
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-[120px] opacity-20"
          style={{
            background: "radial-gradient(circle, #0B7C8F 0%, transparent 70%)",
            animation: "float 20s ease-in-out infinite",
          }}
        />
        <div 
          className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] opacity-15 translate-x-1/4 translate-y-1/4"
          style={{
            background: "radial-gradient(circle, #2cb3d8 0%, transparent 70%)",
            animation: "float 15s ease-in-out infinite reverse",
          }}
        />
        <div 
          className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full blur-[90px] opacity-10 -translate-x-1/4"
          style={{
            background: "radial-gradient(circle, #5dd9e8 0%, transparent 70%)",
            animation: "float 18s ease-in-out infinite",
          }}
        />
      </div>

      {/* Main Content */}
      <div 
        className="relative z-10 w-full max-w-[420px]"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="size-20 rounded-[18px] flex items-center justify-center mb-6 relative group"
            style={{
              background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)",
              transition: "all 0.3s ease",
            }}
          >
            {/* Glow effect on hover */}
            <div 
              className="absolute inset-0 rounded-[18px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: "linear-gradient(135deg, rgba(11,124,143,0.3) 0%, rgba(44,179,216,0.2) 100%)",
                filter: "blur(20px)",
              }}
            />
            <span 
              className="font-bold text-white text-[28px] relative z-10" 
              style={{ letterSpacing: "-0.03em" }}
            >
              ZC
            </span>
          </div>
          
          <h1 
            className="text-[28px] font-bold text-white tracking-[-0.03em] mb-2"
            style={{
              textShadow: "0 2px 20px rgba(44,179,216,0.3)",
            }}
          >
            {APP_CONFIG.name}
          </h1>
          <p 
            className="text-[13px] text-white/50 tracking-wider font-medium" 
            style={{ letterSpacing: "0.12em" }}
          >
            ENTERPRISE AI PLATFORM
          </p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-[24px] border border-white/10 p-8 relative overflow-hidden"
          style={{
            background: "rgba(20, 24, 32, 0.85)",
            backdropFilter: "blur(32px)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(44,179,216,0.05)",
          }}
        >
          {/* Subtle gradient overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              background: "radial-gradient(circle at top right, #2cb3d8, transparent 60%)",
            }}
          />

          <form onSubmit={handleLogin} className="flex flex-col gap-5 relative z-10">
            {/* Email/Username Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-white/60 tracking-[0.08em] uppercase pl-1">
                Email or Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your email or username"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  autoFocus
                  required
                  className="w-full h-12 px-4 pl-11 rounded-[12px] text-[15px] text-white placeholder-white/25 outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: error ? "1px solid rgba(248,113,113,0.6)" : "1px solid rgba(255,255,255,0.1)",
                    boxShadow: error ? "0 0 0 4px rgba(248,113,113,0.12)" : "none",
                  }}
                  onFocus={(e) => {
                    if (!error) {
                      e.target.style.border = "1px solid rgba(44,179,216,0.5)";
                      e.target.style.boxShadow = "0 0 0 4px rgba(44,179,216,0.15), 0 4px 12px rgba(44,179,216,0.1)";
                      e.target.style.background = "rgba(255,255,255,0.08)";
                    }
                  }}
                  onBlur={(e) => {
                    if (!error) {
                      e.target.style.border = "1px solid rgba(255,255,255,0.1)";
                      e.target.style.boxShadow = "none";
                      e.target.style.background = "rgba(255,255,255,0.06)";
                    }
                  }}
                />
                <span 
                  className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-[20px]"
                >
                  person
                </span>
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-white/60 tracking-[0.08em] uppercase pl-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  required
                  className="w-full h-12 px-4 pl-11 pr-12 rounded-[12px] text-[15px] text-white placeholder-white/25 outline-none transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: error ? "1px solid rgba(248,113,113,0.6)" : "1px solid rgba(255,255,255,0.1)",
                    boxShadow: error ? "0 0 0 4px rgba(248,113,113,0.12)" : "none",
                  }}
                  onFocus={(e) => {
                    if (!error) {
                      e.target.style.border = "1px solid rgba(44,179,216,0.5)";
                      e.target.style.boxShadow = "0 0 0 4px rgba(44,179,216,0.15), 0 4px 12px rgba(44,179,216,0.1)";
                      e.target.style.background = "rgba(255,255,255,0.08)";
                    }
                  }}
                  onBlur={(e) => {
                    if (!error) {
                      e.target.style.border = "1px solid rgba(255,255,255,0.1)";
                      e.target.style.boxShadow = "none";
                      e.target.style.background = "rgba(255,255,255,0.06)";
                    }
                  }}
                />
                <span 
                  className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-[20px]"
                >
                  lock
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-all duration-200 p-1 rounded-lg hover:bg-white/5"
                  tabIndex={-1}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              
              {/* Error Message */}
              {error && (
                <div 
                  className="flex items-center gap-2 mt-1 px-3 py-2 rounded-lg"
                  style={{
                    background: "rgba(248,113,113,0.1)",
                    border: "1px solid rgba(248,113,113,0.2)",
                    animation: "shake 0.4s ease-in-out",
                  }}
                >
                  <span className="material-symbols-outlined text-[16px] text-red-400">error</span>
                  <p className="text-[13px] text-red-400 font-medium">{error}</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="h-12 rounded-[12px] text-white text-[15px] font-semibold transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2 relative overflow-hidden group"
              style={{
                background: loading || !email || !password 
                  ? "rgba(44,179,216,0.3)" 
                  : "linear-gradient(135deg, #0B7C8F 0%, #2cb3d8 100%)",
                boxShadow: loading || !email || !password 
                  ? "none" 
                  : "0 4px 24px rgba(44,179,216,0.4), 0 0 0 1px rgba(44,179,216,0.2)",
              }}
              onMouseEnter={(e) => {
                if (!loading && email && password) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 6px 32px rgba(44,179,216,0.5), 0 0 0 1px rgba(44,179,216,0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && email && password) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 24px rgba(44,179,216,0.4), 0 0 0 1px rgba(44,179,216,0.2)";
                }
              }}
            >
              {/* Shimmer effect */}
              {!loading && email && password && (
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                    animation: "shimmer 2s infinite",
                  }}
                />
              )}
              
              <span className="relative z-10 flex items-center gap-2.5">
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-0.5">
                      arrow_forward
                    </span>
                  </>
                )}
              </span>
            </button>
          </form>
        </div>

        {/* Back to Landing Link */}
        <div className="mt-6 text-center">
          <a
            href="/landing"
            className="text-[13px] text-white/30 hover:text-white/60 transition-all duration-200 inline-flex items-center gap-1.5 group"
          >
            <span className="material-symbols-outlined text-[16px] transition-transform group-hover:-translate-x-0.5">
              arrow_back
            </span>
            Back to home
          </a>
        </div>

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-white/20 text-[11px]">
          <span className="material-symbols-outlined text-[14px]">shield</span>
          <span>Secured with enterprise-grade encryption</span>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        
        @keyframes gridPulse {
          0%, 100% { opacity: 0.04; }
          50% { opacity: 0.06; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
