"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useNotificationStore } from "@/store/notificationStore";
import Sidebar from "../Sidebar";
import Header from "../Header";
const TOAST_STYLES = {
  success: {
    border: "rgba(52,211,153,0.18)",
    bg: "rgba(10,14,10,0.95)",
    accent: "#34d399",
    icon: "check_circle",
  },
  error: {
    border: "rgba(248,113,113,0.18)",
    bg: "rgba(14,10,10,0.95)",
    accent: "#f87171",
    icon: "error",
  },
  warning: {
    border: "rgba(251,191,36,0.18)",
    bg: "rgba(14,13,10,0.95)",
    accent: "#fbbf24",
    icon: "warning",
  },
  info: {
    border: "rgba(96,165,250,0.18)",
    bg: "rgba(10,12,16,0.95)",
    accent: "#60a5fa",
    icon: "info",
  },
};

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const notifications = useNotificationStore((s) => s.notifications);
  const removeNotification = useNotificationStore((s) => s.removeNotification);
  const isChat = pathname === "/dashboard/basic-chat";
  const isFullPage = pathname === "/dashboard/models" || pathname === "/dashboard/basic-chat";

  // Dashboard is always dark — force .dark class on mount
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    return () => {
      // Don't remove on unmount — let ThemeProvider handle it when leaving dashboard
    };
  }, []);

  return (
    <div
      className="dark flex h-screen w-full overflow-hidden"
      style={{ background: "#080A0E" }}
    >
      {/* ── Toast Notifications ── */}
      <div className="fixed top-4 right-4 z-[80] flex w-[min(92vw,340px)] flex-col gap-2 pointer-events-none">
        {notifications.map((n) => {
          const s = TOAST_STYLES[n.type] || TOAST_STYLES.info;
          return (
            <div
              key={n.id}
              className="rounded-[12px] px-3.5 py-3 pointer-events-auto"
              style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                backdropFilter: "blur(24px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              <div className="flex items-start gap-2.5">
                {/* Accent bar */}
                <div
                  className="shrink-0 w-[3px] self-stretch rounded-full mt-0.5"
                  style={{ background: s.accent, minHeight: 16 }}
                />
                <span
                  className="material-symbols-outlined shrink-0 mt-0.5"
                  style={{
                    fontSize: 14,
                    color: s.accent,
                    fontVariationSettings: "'FILL' 1, 'wght' 300",
                  }}
                >
                  {s.icon}
                </span>
                <div className="min-w-0 flex-1">
                  {n.title && (
                    <p
                      className="font-semibold mb-0.5 tracking-[-0.01em]"
                      style={{ fontSize: 12, color: s.accent }}
                    >
                      {n.title}
                    </p>
                  )}
                  <p
                    className="leading-relaxed whitespace-pre-wrap break-words"
                    style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}
                  >
                    {n.message}
                  </p>
                </div>
                {n.dismissible && (
                  <button
                    type="button"
                    onClick={() => removeNotification(n.id)}
                    className="shrink-0 transition-colors mt-0.5"
                    style={{ color: "rgba(255,255,255,0.2)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.2)"; }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>close</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar — desktop ── */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>

      {/* ── Sidebar — mobile ── */}
      <div
        className="fixed inset-y-0 left-0 z-50 lg:hidden"
        style={{
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.22s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* ── Main content ── */}
      <main className="flex flex-col flex-1 h-full min-w-0 relative overflow-hidden">
        {/* Subtle dot grid — fixed, never scrolls */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.018) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            zIndex: 0,
          }}
          aria-hidden="true"
        />

        {/* Ambient glow — top-left */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-120px",
            left: "-80px",
            width: "500px",
            height: "400px",
            background:
              "radial-gradient(ellipse at center, rgba(11,124,143,0.06) 0%, transparent 70%)",
            zIndex: 0,
          }}
          aria-hidden="true"
        />

        <Header key={pathname} onMenuClick={() => setSidebarOpen(true)} />

        <div
          className="flex-1 overflow-y-auto custom-scrollbar relative"
          style={isFullPage ? {} : { padding: "22px 24px" }}
        >
          <div
            className={isFullPage ? "flex-1 w-full h-full flex flex-col" : "w-full"}
            style={{ position: "relative", zIndex: 1 }}
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
