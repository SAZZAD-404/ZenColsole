"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useNotificationStore } from "@/store/notificationStore";
import { APP_CONFIG } from "@/shared/constants/config";

// ── User Auth Context ──────────────────────────────────────────────────────
const UserAuthContext = createContext(null);
export function useUserAuth() { return useContext(UserAuthContext); }

const TOAST_STYLES = {
  success: { border: "rgba(52,211,153,0.18)", bg: "rgba(10,14,10,0.95)", accent: "#34d399", icon: "check_circle" },
  error:   { border: "rgba(248,113,113,0.18)", bg: "rgba(14,10,10,0.95)", accent: "#f87171", icon: "error" },
  warning: { border: "rgba(251,191,36,0.18)",  bg: "rgba(14,13,10,0.95)", accent: "#fbbf24", icon: "warning" },
  info:    { border: "rgba(96,165,250,0.18)",  bg: "rgba(10,12,16,0.95)", accent: "#60a5fa", icon: "info" },
};

const NAV_ITEMS = [
  { href: "/user/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/user/models",    label: "Models",    icon: "smart_toy"  },
  { href: "/user/chat",      label: "Chat",      icon: "chat"       },
  { href: "/user/profile",   label: "Profile",   icon: "person"     },
];

export default function UserLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const notifications = useNotificationStore((s) => s.notifications);
  const removeNotification = useNotificationStore((s) => s.removeNotification);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
  }, []);

  useEffect(() => {
    // Don't check auth on login/signup pages
    if (pathname === "/user/login" || pathname === "/user/signup") {
      setLoading(false);
      return;
    }
    fetch("/api/user/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUser(d.user);
        else router.push("/user/login");
      })
      .catch(() => router.push("/user/login"))
      .finally(() => setLoading(false));
  }, [router, pathname]);

  const handleLogout = async () => {
    await fetch("/api/user/auth/logout", { method: "POST" });
    router.push("/user/login");
  };

  if (loading) {
    return (
      <div className="dark min-h-screen flex items-center justify-center" style={{ background: "#080A0E" }}>
        <span className="material-symbols-outlined text-[#0B7C8F] text-[32px] animate-spin">progress_activity</span>
      </div>
    );
  }

  // Auth pages render without the sidebar layout
  if (pathname === "/user/login" || pathname === "/user/signup") {
    return <>{children}</>;
  }

  return (
    <UserAuthContext.Provider value={{ user, setUser }}>
      <div className="dark flex h-screen w-full overflow-hidden" style={{ background: "#080A0E" }}>

        {/* ── Toast Notifications ── */}
        <div className="fixed top-4 right-4 z-[80] flex w-[min(92vw,340px)] flex-col gap-2 pointer-events-none">
          {notifications.map((n) => {
            const s = TOAST_STYLES[n.type] || TOAST_STYLES.info;
            return (
              <div key={n.id} className="rounded-[12px] px-3.5 py-3 pointer-events-auto"
                style={{ background: s.bg, border: `1px solid ${s.border}`, backdropFilter: "blur(24px)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
                <div className="flex items-start gap-2.5">
                  <div className="shrink-0 w-[3px] self-stretch rounded-full mt-0.5" style={{ background: s.accent, minHeight: 16 }} />
                  <span className="material-symbols-outlined shrink-0 mt-0.5" style={{ fontSize: 14, color: s.accent, fontVariationSettings: "'FILL' 1, 'wght' 300" }}>{s.icon}</span>
                  <div className="min-w-0 flex-1">
                    {n.title && <p className="font-semibold mb-0.5" style={{ fontSize: 12, color: s.accent }}>{n.title}</p>}
                    <p className="leading-relaxed" style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{n.message}</p>
                  </div>
                  {n.dismissible && (
                    <button type="button" onClick={() => removeNotification(n.id)} style={{ color: "rgba(255,255,255,0.2)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.2)"; }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>close</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Mobile overlay ── */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
            onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Sidebar desktop ── */}
        <div className="hidden lg:flex shrink-0">
          <UserSidebar user={user} pathname={pathname} onLogout={handleLogout} />
        </div>

        {/* ── Sidebar mobile ── */}
        <div className="fixed inset-y-0 left-0 z-50 lg:hidden"
          style={{ transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.22s cubic-bezier(0.22,1,0.36,1)" }}>
          <UserSidebar user={user} pathname={pathname} onLogout={handleLogout} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* ── Main ── */}
        <main className="flex flex-col flex-1 h-full min-w-0 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.018) 1px, transparent 1px)", backgroundSize: "28px 28px", zIndex: 0 }} aria-hidden="true" />
          <div className="absolute pointer-events-none" style={{ top: "-120px", left: "-80px", width: "500px", height: "400px", background: "radial-gradient(ellipse at center, rgba(11,124,143,0.06) 0%, transparent 70%)", zIndex: 0 }} aria-hidden="true" />

          {/* Top bar (mobile) */}
          <div className="lg:hidden flex items-center gap-3 px-4 py-3 relative z-10" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <button onClick={() => setSidebarOpen(true)} className="flex items-center justify-center size-9 rounded-[9px]" style={{ color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>menu</span>
            </button>
            <span className="font-semibold text-white" style={{ fontSize: 15 }}>{APP_CONFIG.name}</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar relative" style={{ padding: "22px 24px" }}>
            <div className="w-full" style={{ position: "relative", zIndex: 1 }}>
              {children}
            </div>
          </div>
        </main>
      </div>
    </UserAuthContext.Provider>
  );
}

// ── User Sidebar ───────────────────────────────────────────────────────────
function UserSidebar({ user, pathname, onLogout, onClose }) {
  const isActive = (href) => pathname.startsWith(href);

  return (
    <aside className="flex flex-col w-[240px] min-h-full" style={{ background: "rgba(8,10,14,0.98)", borderRight: "1px solid rgba(255,255,255,0.04)" }}>
      {/* Logo */}
      <div className="px-6 pt-7 pb-5">
        <Link href="/user/dashboard" className="flex items-center gap-3.5 group w-fit">
          <div className="relative flex items-center justify-center size-[30px] rounded-[8px] shrink-0 overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0d8fa5 0%, #0B7C8F 60%, #065f70 100%)", boxShadow: "0 2px 10px rgba(11,124,143,0.4), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
            <span className="material-symbols-outlined text-white" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1, 'wght' 300" }}>hub</span>
          </div>
          <div className="flex flex-col leading-none gap-1.5">
            <span className="font-semibold text-white" style={{ fontSize: 17.5, letterSpacing: "-0.03em" }}>{APP_CONFIG.name}</span>
            <span className="font-medium tracking-wide" style={{ fontSize: 10.5, color: "rgba(44,179,216,0.55)", letterSpacing: "0.08em" }}>USER PANEL</span>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-6 mb-2" style={{ height: "1px", background: "rgba(255,255,255,0.04)" }} />

      {/* Nav */}
      <nav className="flex-1 px-3.5 py-2 space-y-0.5 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map((item) => (
          <UserNavItem key={item.href} item={item} active={isActive(item.href)} onClose={onClose} />
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-3.5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] mb-2" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="flex items-center justify-center size-8 rounded-full font-semibold text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #0B7C8F, #2cb3d8)", fontSize: 13 }}>
              {user.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-white truncate" style={{ fontSize: 13 }}>{user.username}</p>
              <p className="truncate" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{user.email}</p>
            </div>
          </div>
        )}
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all duration-150 cursor-pointer"
          style={{ color: "rgba(255,255,255,0.3)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(248,113,113,0.07)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "transparent"; }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
          <span className="font-medium" style={{ fontSize: 14 }}>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

function UserNavItem({ item, active, onClose }) {
  return (
    <Link href={item.href} onClick={onClose}
      className="flex items-center gap-3.5 px-3.5 py-3 rounded-[10px] transition-all duration-150 relative"
      style={active ? { background: "rgba(11,124,143,0.1)", color: "#2cb3d8" } : { color: "rgba(255,255,255,0.32)" }}
      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; e.currentTarget.style.background = "rgba(255,255,255,0.035)"; } }}
      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.color = "rgba(255,255,255,0.32)"; e.currentTarget.style.background = "transparent"; } }}>
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
          style={{ height: "55%", background: "#2cb3d8", boxShadow: "0 0 8px rgba(44,179,216,0.5)" }} />
      )}
      <span className="material-symbols-outlined shrink-0"
        style={{ fontSize: 20, fontVariationSettings: active ? "'FILL' 1, 'wght' 300" : "'FILL' 0, 'wght' 300" }}>
        {item.icon}
      </span>
      <span className="font-medium" style={{ fontSize: 15 }}>{item.label}</span>
    </Link>
  );
}
