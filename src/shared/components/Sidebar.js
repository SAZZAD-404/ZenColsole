"use client";

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils/cn";
import { APP_CONFIG, UPDATER_CONFIG } from "@/shared/constants/config";
import { MEDIA_PROVIDER_KINDS } from "@/shared/constants/providers";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";
import Button from "./Button";
import { ConfirmModal } from "./Modal";

const VISIBLE_MEDIA_KINDS = ["embedding", "image", "tts", "stt"];
const COMBINED_WEB_ITEM = {
  id: "web",
  label: "Web Fetch & Search",
  icon: "travel_explore",
  href: "/dashboard/media-providers/web",
};

const NAV_ITEMS = [
  { href: "/dashboard/overview",  label: "Dashboard", icon: "dashboard" },
  { href: "/dashboard/endpoint",  label: "Endpoint",  icon: "api" },
  { href: "/dashboard/providers", label: "Providers", icon: "dns" },
  { href: "/dashboard/combos",    label: "Combos",    icon: "layers" },
  { href: "/dashboard/models",    label: "Models",    icon: "smart_toy" },
  { href: "/dashboard/usage",     label: "Usage",     icon: "bar_chart" },
  { href: "/dashboard/quota",     label: "Quota",     icon: "data_usage" },
];

const SYSTEM_ITEMS = [
  { href: "/dashboard/proxy-pools", label: "Proxy Pools", icon: "lan" },
];

const DEBUG_ITEMS = [
  { href: "/dashboard/console-log", label: "Console Log", icon: "monitor" },
  { href: "/dashboard/translator",  label: "Translator",  icon: "translate" },
];

export default function Sidebar({ onClose }) {
  const pathname = usePathname();
  const [mediaOpen, setMediaOpen] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [enableTranslator, setEnableTranslator] = useState(false);
  const { copied, copy } = useCopyToClipboard(2000);

  const INSTALL_CMD = UPDATER_CONFIG.installCmd;
  const STATUS_URL = `http://localhost:${UPDATER_CONFIG.statusPort}/update/status`;

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => { if (d.enableTranslator) setEnableTranslator(true); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/version")
      .then((r) => r.json())
      .then((d) => { if (d.hasUpdate) setUpdateInfo(d); })
      .catch(() => {});
  }, []);

  const isActive = (href) => {
    if (href === "/dashboard/overview")
      return pathname === "/dashboard" || pathname.startsWith("/dashboard/overview");
    if (href === "/dashboard/endpoint")
      return pathname.startsWith("/dashboard/endpoint");
    return pathname.startsWith(href);
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    setShowUpdateModal(false);
    try {
      const res = await fetch("/api/version/update", { method: "POST" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d.message || "Update failed. Please run the install command manually.");
        setIsUpdating(false);
        return;
      }
      setIsDisconnected(true);
    } catch {
      setIsDisconnected(true);
    }
  };

  useEffect(() => {
    if (!isUpdating || !isDisconnected) return;
    let stopped = false;
    const tick = async () => {
      try {
        const res = await fetch(STATUS_URL, { cache: "no-store" });
        if (res.ok) {
          const d = await res.json();
          if (!stopped) setUpdateStatus(d);
        }
      } catch { /* ignore */ }
    };
    tick();
    const id = setInterval(tick, UPDATER_CONFIG.statusPollIntervalMs);
    return () => { stopped = true; clearInterval(id); };
  }, [isUpdating, isDisconnected, STATUS_URL]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even if API fails
      window.location.href = "/login";
    }
  };

  return (
    <>
      <aside
        className="flex flex-col w-[240px] min-h-full"
        style={{
          background: "rgba(8,10,14,0.98)",
          borderRight: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {/* ── Logo ── */}
        <div className="px-6 pt-7 pb-5">
          <Link href="/dashboard" className="flex items-center gap-3.5 group w-fit">
            {/* Icon mark - Professional Logo */}
            <div
              className="relative flex items-center justify-center size-[32px] rounded-[10px] shrink-0 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              <span
                className="font-bold text-white"
                style={{ fontSize: 16, letterSpacing: "-0.02em" }}
              >
                ZC
              </span>
            </div>
            {/* Wordmark */}
            <div className="flex flex-col leading-none gap-1">
              <span
                className="font-bold text-white"
                style={{ fontSize: 18, letterSpacing: "-0.02em" }}
              >
                {APP_CONFIG.name}
              </span>
              <span
                className="font-medium tracking-wider"
                style={{ fontSize: 9.5, color: "rgba(148,163,184,0.7)", letterSpacing: "0.12em" }}
              >
                ENTERPRISE AI PLATFORM
              </span>
            </div>
          </Link>

          {/* Update banner */}
          {updateInfo && (
            <div
              className="mt-5 px-4 py-3.5 rounded-[12px]"
              style={{
                background: "rgba(11,124,143,0.07)",
                border: "1px solid rgba(11,124,143,0.15)",
              }}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <span
                  className="size-2 rounded-full animate-pulse"
                  style={{ background: "#2cb3d8" }}
                />
                <p className="font-semibold" style={{ fontSize: 13, color: "#2cb3d8" }}>
                  v{updateInfo.latestVersion} available
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowUpdateModal(true)}
                  className="px-3 py-1.5 rounded-[8px] text-white font-semibold transition-all hover:opacity-90 cursor-pointer"
                  style={{ fontSize: 12, background: "#0B7C8F" }}
                >
                  Update
                </button>
                <button
                  onClick={() => copy(INSTALL_CMD)}
                  className="flex-1 text-left hover:opacity-70 transition-opacity cursor-pointer min-w-0"
                >
                  <code
                    className="block font-mono truncate"
                    style={{ fontSize: 11.5, color: "rgba(44,179,216,0.5)" }}
                  >
                    {copied ? "✓ copied" : INSTALL_CMD}
                  </code>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div
          className="mx-6 mb-2"
          style={{ height: "1px", background: "rgba(255,255,255,0.04)" }}
        />

        {/* ── Nav ── */}
        <nav className="flex-1 px-3.5 py-2 space-y-0.5 overflow-y-auto custom-scrollbar">
          {/* Primary nav */}
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              active={isActive(item.href)}
              onClose={onClose}
            />
          ))}

          {/* System group */}
          <div className="pt-7">
            <p
              className="px-3.5 mb-2 font-semibold uppercase tracking-[0.1em]"
              style={{ fontSize: 11, color: "rgba(255,255,255,0.18)" }}
            >
              System
            </p>

            {/* Media Providers accordion */}
            <button
              onClick={() => setMediaOpen((v) => !v)}
              className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-[10px] text-left transition-all duration-150"
              style={
                pathname.startsWith("/dashboard/media-providers")
                  ? { background: "rgba(11,124,143,0.1)", color: "#2cb3d8" }
                  : { color: "rgba(255,255,255,0.32)" }
              }
              onMouseEnter={(e) => {
                if (!pathname.startsWith("/dashboard/media-providers")) {
                  e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.035)";
                }
              }}
              onMouseLeave={(e) => {
                if (!pathname.startsWith("/dashboard/media-providers")) {
                  e.currentTarget.style.color = "rgba(255,255,255,0.32)";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span className="material-symbols-outlined shrink-0" style={{ fontSize: 20 }}>
                perm_media
              </span>
              <span className="flex-1 font-medium" style={{ fontSize: 15 }}>
                Media Providers
              </span>
              <span
                className="material-symbols-outlined transition-transform duration-200"
                style={{
                  fontSize: 16,
                  transform: mediaOpen ? "rotate(180deg)" : "rotate(0deg)",
                  color: "rgba(255,255,255,0.2)",
                }}
              >
                expand_more
              </span>
            </button>

            {mediaOpen && (
              <div className="pl-5 mt-1 space-y-0.5">
                {MEDIA_PROVIDER_KINDS.filter((k) =>
                  VISIBLE_MEDIA_KINDS.includes(k.id)
                ).map((kind) => (
                  <NavItem
                    key={kind.id}
                    item={{
                      href: `/dashboard/media-providers/${kind.id}`,
                      label: kind.label,
                      icon: kind.icon,
                    }}
                    active={pathname.startsWith(
                      `/dashboard/media-providers/${kind.id}`
                    )}
                    onClose={onClose}
                    small
                  />
                ))}
                <NavItem
                  item={COMBINED_WEB_ITEM}
                  active={pathname.startsWith(COMBINED_WEB_ITEM.href)}
                  onClose={onClose}
                  small
                />
              </div>
            )}

            {SYSTEM_ITEMS.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                active={isActive(item.href)}
                onClose={onClose}
              />
            ))}

            {DEBUG_ITEMS.map((item) => {
              const show =
                item.href !== "/dashboard/translator" || enableTranslator;
              return show ? (
                <NavItem
                  key={item.href}
                  item={item}
                  active={isActive(item.href)}
                  onClose={onClose}
                />
              ) : null;
            })}
          </div>
        </nav>

        {/* ── Footer ── */}
        <div
          className="px-3.5 py-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          <div className="flex items-center justify-end">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] transition-all duration-150 cursor-pointer"
              style={{ color: "rgba(255,255,255,0.32)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#f87171";
                e.currentTarget.style.background = "rgba(248,113,113,0.07)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.32)";
                e.currentTarget.style.background = "transparent";
              }}
              title="Logout"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                logout
              </span>
              <span className="font-medium" style={{ fontSize: 14 }}>
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>

      <ConfirmModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onConfirm={handleUpdate}
        title="Update ZenConsole"
        message={`This will close ZenConsole and install v${updateInfo?.latestVersion || ""} in a separate window. Continue?`}
        confirmText="Update"
        cancelText="Cancel"
        variant="primary"
        loading={isUpdating}
      />

      {isDisconnected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          {isUpdating ? (
            <UpdateProgress
              status={updateStatus}
              latestVersion={updateInfo?.latestVersion}
              installCmd={INSTALL_CMD}
              copied={copied}
              onCopy={() => copy(INSTALL_CMD)}
            />
          ) : (
            <div className="text-center p-8">
              <div
                className="flex items-center justify-center size-14 rounded-full mx-auto mb-4"
                style={{ background: "rgba(248,113,113,0.1)", color: "#f87171" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                  power_off
                </span>
              </div>
              <h2 className="text-lg font-semibold text-white mb-2 tracking-tight">
                Server Disconnected
              </h2>
              <p className="mb-6 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                The proxy server has been stopped.
              </p>
              <Button
                variant="secondary"
                onClick={() => globalThis.location.reload()}
              >
                Reload Page
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

Sidebar.propTypes = { onClose: PropTypes.func };

/* ── Nav Item ── */
function NavItem({ item, active, onClose, small }) {
  return (
    <Link
      href={item.href}
      onClick={onClose}
      className="flex items-center gap-3.5 px-3.5 py-3 rounded-[10px] transition-all duration-150 group relative"
      style={
        active
          ? { background: "rgba(11,124,143,0.1)", color: "#2cb3d8" }
          : { color: "rgba(255,255,255,0.32)" }
      }
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.color = "rgba(255,255,255,0.8)";
          e.currentTarget.style.background = "rgba(255,255,255,0.035)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.color = "rgba(255,255,255,0.32)";
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      {/* Active indicator bar */}
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
          style={{
            height: "55%",
            background: "#2cb3d8",
            boxShadow: "0 0 8px rgba(44,179,216,0.5)",
          }}
        />
      )}
      <span
        className="material-symbols-outlined shrink-0"
        style={{
          fontSize: small ? 18 : 20,
          fontVariationSettings: active
            ? "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24"
            : "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24",
        }}
      >
        {item.icon}
      </span>
      <span
        className="font-medium tracking-[-0.01em]"
        style={{ fontSize: small ? 14 : 15 }}
      >
        {item.label}
      </span>
    </Link>
  );
}

NavItem.propTypes = {
  item: PropTypes.shape({
    href: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
  }).isRequired,
  active: PropTypes.bool,
  onClose: PropTypes.func,
  small: PropTypes.bool,
};

/* ── Update Progress Overlay ── */
function UpdateProgress({ status, latestVersion, installCmd, copied, onCopy }) {
  const phase = status?.phase || "connecting";
  const done = status?.done === true;
  const success = status?.success === true;
  const attempt = status?.attempt || 0;
  const maxRetries = status?.maxRetries || 0;
  const logTail = status?.logTail || [];
  const errorMsg = status?.error;

  const steps = [
    { key: "stopped",    label: "Stopped ZenConsole server",        state: "done" },
    { key: "launched",   label: "Launched background installer",     state: status ? "done" : "active" },
    { key: "waiting",    label: "Waiting for app processes to exit", state: phase === "waitingForExit" ? "active" : (status && phase !== "starting" ? "done" : "pending") },
    { key: "installing", label: attempt > 1 ? `Installing v${latestVersion || "latest"} (attempt ${attempt}/${maxRetries})` : `Installing v${latestVersion || "latest"}`, state: done ? (success ? "done" : "error") : (phase === "installing" ? "active" : "pending") },
    { key: "finished",   label: done && success ? "Installed — ready to restart" : "Waiting to finish", state: done && success ? "done" : (done && !success ? "error" : "pending") },
  ];

  return (
    <div
      className="w-full max-w-lg rounded-2xl p-6 text-white"
      style={{
        background: "rgba(10,12,16,0.98)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.7)",
      }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className={cn(
            "flex items-center justify-center size-11 rounded-full",
            done && success ? "bg-green-500/15 text-green-400" :
            done && !success ? "bg-red-500/15 text-red-400" :
            "text-[#2cb3d8]"
          )}
          style={
            !done
              ? { background: "rgba(11,124,143,0.12)" }
              : {}
          }
        >
          <span
            className={cn("material-symbols-outlined", !done && "animate-spin")}
            style={{ fontSize: 22 }}
          >
            {done && success ? "check_circle" : done && !success ? "error" : "progress_activity"}
          </span>
        </div>
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            {done && success ? "Update Completed" : done && !success ? "Update Failed" : "Updating ZenConsole"}
          </h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.38)" }}>
            {done && success ? `Installed v${latestVersion || "latest"} successfully` :
             done && !success ? (errorMsg || "Installation failed") :
             `Installing v${latestVersion || "latest"} from npm...`}
          </p>
        </div>
      </div>

      <ul className="space-y-2 mb-4">
        {steps.map((s) => (
          <li key={s.key} className="flex items-center gap-3">
            <span
              className={cn(
                "material-symbols-outlined shrink-0",
                s.state === "done"    && "text-green-400",
                s.state === "active"  && "text-[#2cb3d8] animate-pulse",
                s.state === "error"   && "text-red-400",
                s.state === "pending" && "text-white/15"
              )}
              style={{ fontSize: 17 }}
            >
              {s.state === "done" ? "check_circle" : s.state === "error" ? "cancel" : s.state === "active" ? "radio_button_checked" : "radio_button_unchecked"}
            </span>
            <span
              className="text-sm"
              style={{ color: s.state === "pending" ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.75)" }}
            >
              {s.label}
            </span>
          </li>
        ))}
      </ul>

      {logTail.length > 0 && (
        <div
          className="rounded-xl p-3 mb-4 max-h-40 overflow-auto"
          style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <pre className="font-mono whitespace-pre-wrap break-all" style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
            {logTail.join("\n")}
          </pre>
        </div>
      )}

      {done && success ? (
        <div className="space-y-2">
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
            Run{" "}
            <code
              className="px-1.5 py-0.5 rounded text-green-400"
              style={{ background: "rgba(255,255,255,0.06)", fontSize: 12 }}
            >
              9router
            </code>{" "}
            in your terminal to start the new version.
          </p>
          <Button variant="secondary" fullWidth onClick={() => globalThis.location.reload()}>
            Reload Page
          </Button>
        </div>
      ) : done && !success ? (
        <div className="space-y-2">
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
            Run the install command manually:
          </p>
          <button
            onClick={onCopy}
            className="w-full text-left px-3 py-2 rounded-xl transition-colors"
            style={{ background: "rgba(255,255,255,0.04)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
          >
            <code className="font-mono text-amber-400" style={{ fontSize: 12 }}>
              {copied ? "✓ copied!" : installCmd}
            </code>
          </button>
        </div>
      ) : (
        <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.28)" }}>
          This may take 30–60 seconds. Please don&apos;t close this window.
        </p>
      )}
    </div>
  );
}

UpdateProgress.propTypes = {
  status: PropTypes.object,
  latestVersion: PropTypes.string,
  installCmd: PropTypes.string.isRequired,
  copied: PropTypes.bool,
  onCopy: PropTypes.func.isRequired,
};
