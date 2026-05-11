"use client";

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  CardSkeleton,
  Button,
  Input,
  Modal,
  Select,
  Toggle,
} from "@/shared/components";
import ProviderIcon from "@/shared/components/ProviderIcon";
import { OAUTH_PROVIDERS, APIKEY_PROVIDERS } from "@/shared/constants/config";
import {
  FREE_PROVIDERS,
  FREE_TIER_PROVIDERS,
  WEB_COOKIE_PROVIDERS,
  OPENAI_COMPATIBLE_PREFIX,
  ANTHROPIC_COMPATIBLE_PREFIX,
} from "@/shared/constants/providers";
import Link from "next/link";
import { getErrorCode, getRelativeTime } from "@/shared/utils";
import { useNotificationStore } from "@/store/notificationStore";
import { useHeaderSearchStore } from "@/store/headerSearchStore";
import ModelAvailabilityBadge from "./components/ModelAvailabilityBadge";

function getStatusDisplay(connected, error, errorCode) {
  const parts = [];
  if (connected > 0) {
    parts.push(
      <Badge key="connected" variant="success" size="sm" dot>
        {connected} Connected
      </Badge>,
    );
  }
  if (error > 0) {
    const errText = errorCode
      ? `${error} Error (${errorCode})`
      : `${error} Error`;
    parts.push(
      <Badge key="error" variant="error" size="sm" dot>
        {errText}
      </Badge>,
    );
  }
  if (parts.length === 0) {
    return <span className="text-text-muted">No connections</span>;
  }
  return parts;
}

function getConnectionErrorTag(connection) {
  if (!connection) return null;

  const explicitType = connection.lastErrorType;
  if (explicitType === "runtime_error") return "RUNTIME";
  if (
    explicitType === "upstream_auth_error" ||
    explicitType === "auth_missing" ||
    explicitType === "token_refresh_failed" ||
    explicitType === "token_expired"
  )
    return "AUTH";
  if (explicitType === "upstream_rate_limited") return "429";
  if (explicitType === "upstream_unavailable") return "5XX";
  if (explicitType === "network_error") return "NET";

  const numericCode = Number(connection.errorCode);
  if (Number.isFinite(numericCode) && numericCode >= 400)
    return String(numericCode);

  const fromMessage = getErrorCode(connection.lastError);
  if (fromMessage === "401" || fromMessage === "403") return "AUTH";
  if (fromMessage && fromMessage !== "ERR") return fromMessage;

  const msg = (connection.lastError || "").toLowerCase();
  if (
    msg.includes("runtime") ||
    msg.includes("not runnable") ||
    msg.includes("not installed")
  )
    return "RUNTIME";
  if (
    msg.includes("invalid api key") ||
    msg.includes("token invalid") ||
    msg.includes("revoked") ||
    msg.includes("unauthorized")
  )
    return "AUTH";

  return "ERR";
}

export default function ProvidersPage() {
  const [connections, setConnections] = useState([]);
  const [providerNodes, setProviderNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCompatibleModal, setShowAddCompatibleModal] = useState(false);
  const [showAddAnthropicCompatibleModal, setShowAddAnthropicCompatibleModal] =
    useState(false);
  const [testingMode, setTestingMode] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const notify = useNotificationStore();
  const searchQuery = useHeaderSearchStore((s) => s.query);
  const registerSearch = useHeaderSearchStore((s) => s.register);
  const unregisterSearch = useHeaderSearchStore((s) => s.unregister);

  useEffect(() => {
    registerSearch("Search providers...");
    return () => unregisterSearch();
  }, [registerSearch, unregisterSearch]);

  const matchSearch = (name) =>
    !searchQuery.trim() ||
    name.toLowerCase().includes(searchQuery.trim().toLowerCase());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [connectionsRes, nodesRes] = await Promise.all([
          fetch("/api/providers"),
          fetch("/api/provider-nodes"),
        ]);
        const connectionsData = await connectionsRes.json();
        const nodesData = await nodesRes.json();
        if (connectionsRes.ok)
          setConnections(connectionsData.connections || []);
        if (nodesRes.ok) setProviderNodes(nodesData.nodes || []);
      } catch (error) {
        console.log("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getProviderStats = (providerId, authType) => {
    const providerConnections = connections.filter(
      (c) => c.provider === providerId && c.authType === authType,
    );

    const getEffectiveStatus = (conn) => {
      const isCooldown = Object.entries(conn).some(
        ([k, v]) =>
          k.startsWith("modelLock_") && v && new Date(v).getTime() > Date.now(),
      );
      return conn.testStatus === "unavailable" && !isCooldown
        ? "active"
        : conn.testStatus;
    };

    const connected = providerConnections.filter((c) => {
      const status = getEffectiveStatus(c);
      return status === "active" || status === "success";
    }).length;

    const errorConns = providerConnections.filter((c) => {
      const status = getEffectiveStatus(c);
      return (
        status === "error" || status === "expired" || status === "unavailable"
      );
    });

    const error = errorConns.length;
    const total = providerConnections.length;
    const allDisabled =
      total > 0 && providerConnections.every((c) => c.isActive === false);

    const latestError = errorConns.sort(
      (a, b) => new Date(b.lastErrorAt || 0) - new Date(a.lastErrorAt || 0),
    )[0];
    const errorCode = latestError ? getConnectionErrorTag(latestError) : null;
    const errorTime = latestError?.lastErrorAt
      ? getRelativeTime(latestError.lastErrorAt)
      : null;

    return { connected, error, total, errorCode, errorTime, allDisabled };
  };

  // Toggle all connections for a provider on/off
  const handleToggleProvider = async (providerId, authType, newActive) => {
    const providerConns = connections.filter(
      (c) => c.provider === providerId && c.authType === authType,
    );
    setConnections((prev) =>
      prev.map((c) =>
        c.provider === providerId && c.authType === authType
          ? { ...c, isActive: newActive }
          : c,
      ),
    );
    await Promise.allSettled(
      providerConns.map((c) =>
        fetch(`/api/providers/${c.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: newActive }),
        }),
      ),
    );
  };

  const handleBatchTest = async (mode, providerId = null) => {
    if (testingMode) return;
    setTestingMode(mode === "provider" ? providerId : mode);
    setTestResults(null);
    try {
      const res = await fetch("/api/providers/test-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, providerId }),
      });
      const data = await res.json();
      setTestResults(data);
      if (data.summary) {
        const { passed, failed, total } = data.summary;
        if (failed === 0) notify.success(`All ${total} tests passed`);
        else notify.warning(`${passed}/${total} passed, ${failed} failed`);
      }
    } catch (error) {
      setTestResults({ error: "Test request failed" });
      notify.error("Provider test failed");
    } finally {
      setTestingMode(null);
    }
  };

  const compatibleProviders = providerNodes
    .filter((node) => node.type === "openai-compatible")
    .map((node) => ({
      id: node.id,
      name: node.name || "OpenAI Compatible",
      color: "#10A37F",
      textIcon: "OC",
      apiType: node.apiType,
    }))
    .filter((p) => matchSearch(p.name));

  const anthropicCompatibleProviders = providerNodes
    .filter((node) => node.type === "anthropic-compatible")
    .map((node) => ({
      id: node.id,
      name: node.name || "Anthropic Compatible",
      color: "#D97757",
      textIcon: "AC",
    }))
    .filter((p) => matchSearch(p.name));

  const oauthEntries = Object.entries(OAUTH_PROVIDERS).filter(([, info]) =>
    matchSearch(info.name),
  );
  const freeEntries = Object.entries(FREE_PROVIDERS).filter(([, info]) =>
    matchSearch(info.name),
  );
  const freeTierEntries = Object.entries(FREE_TIER_PROVIDERS).filter(
    ([, info]) => matchSearch(info.name),
  );
  const apikeyEntries = Object.entries(APIKEY_PROVIDERS).filter(
    ([, info]) =>
      (info.serviceKinds ?? ["llm"]).includes("llm") && matchSearch(info.name),
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const hasAnyResult =
    oauthEntries.length > 0 ||
    freeEntries.length > 0 ||
    freeTierEntries.length > 0 ||
    apikeyEntries.length > 0 ||
    compatibleProviders.length > 0 ||
    anthropicCompatibleProviders.length > 0;

  return (
    <div className="flex min-w-0 flex-col gap-8 px-1 sm:px-0">
      {!hasAnyResult && (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl" style={{ border: "1px dashed rgba(255,255,255,0.08)" }}>
          <span className="material-symbols-outlined mb-3" style={{ fontSize: 36, color: "rgba(255,255,255,0.15)" }}>search_off</span>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>No providers match your search</p>
        </div>
      )}

      {/* ── Custom Providers ── */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-[3px] h-8 rounded-full" style={{ background: "linear-gradient(180deg, #2cb3d8 0%, rgba(44,179,216,0.2) 100%)" }} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-bold text-white tracking-tight">Custom Providers</h2>
                {(compatibleProviders.length + anthropicCompatibleProviders.length) > 0 && (
                  <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md tabular-nums" style={{ background: "rgba(44,179,216,0.1)", color: "#2cb3d8", border: "1px solid rgba(44,179,216,0.15)" }}>
                    {compatibleProviders.length + anthropicCompatibleProviders.length}
                  </span>
                )}
              </div>
              <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>OpenAI or Anthropic-compatible endpoints</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" icon="add" onClick={() => setShowAddAnthropicCompatibleModal(true)} variant="secondary">
              Anthropic
            </Button>
            <Button size="sm" icon="add" onClick={() => setShowAddCompatibleModal(true)}>
              OpenAI
            </Button>
          </div>
        </div>
        {compatibleProviders.length === 0 && anthropicCompatibleProviders.length === 0 ? (
          <div className="flex items-center justify-center gap-2.5 py-8 rounded-xl" style={{ border: "1px dashed rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.01)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "rgba(255,255,255,0.2)" }}>add_circle</span>
            <span className="text-[13px]" style={{ color: "rgba(255,255,255,0.3)" }}>Add OpenAI or Anthropic compatible endpoints above</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...compatibleProviders, ...anthropicCompatibleProviders].map((info) => (
              <ApiKeyProviderCard
                key={info.id}
                providerId={info.id}
                provider={info}
                stats={getProviderStats(info.id, "apikey")}
                authType="compatible"
                onToggle={(active) => handleToggleProvider(info.id, "apikey", active)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── OAuth Providers ── */}
      {oauthEntries.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-[3px] h-8 rounded-full" style={{ background: "linear-gradient(180deg, #60a5fa 0%, rgba(96,165,250,0.2) 100%)" }} />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[16px] font-bold text-white tracking-tight">OAuth Providers</h2>
                  <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md tabular-nums" style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.15)" }}>
                    {oauthEntries.length}
                  </span>
                </div>
                <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Login with your existing subscriptions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ModelAvailabilityBadge />
              <button
                onClick={() => handleBatchTest("oauth")}
                disabled={!!testingMode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150"
                style={{
                  background: testingMode === "oauth" ? "rgba(11,124,143,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${testingMode === "oauth" ? "rgba(11,124,143,0.3)" : "rgba(255,255,255,0.08)"}`,
                  color: testingMode === "oauth" ? "#2cb3d8" : "rgba(255,255,255,0.45)",
                }}
              >
                <span className={`material-symbols-outlined${testingMode === "oauth" ? " animate-spin" : ""}`} style={{ fontSize: 14 }}>
                  {testingMode === "oauth" ? "progress_activity" : "play_arrow"}
                </span>
                {testingMode === "oauth" ? "Testing..." : "Test All"}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {oauthEntries.map(([key, info]) => (
              <ProviderCard
                key={key}
                providerId={key}
                provider={info}
                stats={getProviderStats(key, "oauth")}
                authType="oauth"
                onToggle={(active) => handleToggleProvider(key, "oauth", active)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Free Tier Providers ── */}
      {(freeEntries.length > 0 || freeTierEntries.length > 0) && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-[3px] h-8 rounded-full" style={{ background: "linear-gradient(180deg, #34d399 0%, rgba(52,211,153,0.2) 100%)" }} />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[16px] font-bold text-white tracking-tight">Free Tier Providers</h2>
                  <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md tabular-nums" style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.15)" }}>
                    {freeEntries.length + freeTierEntries.length}
                  </span>
                </div>
                <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Free access — no subscription required</p>
              </div>
            </div>
            <button
              onClick={() => handleBatchTest("free")}
              disabled={!!testingMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150"
              style={{
                background: testingMode === "free" ? "rgba(11,124,143,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${testingMode === "free" ? "rgba(11,124,143,0.3)" : "rgba(255,255,255,0.08)"}`,
                color: testingMode === "free" ? "#2cb3d8" : "rgba(255,255,255,0.45)",
              }}
            >
              <span className={`material-symbols-outlined${testingMode === "free" ? " animate-spin" : ""}`} style={{ fontSize: 14 }}>
                {testingMode === "free" ? "progress_activity" : "play_arrow"}
              </span>
              {testingMode === "free" ? "Testing..." : "Test All"}
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {freeEntries.map(([key, info]) => (
              <ProviderCard
                key={key}
                providerId={key}
                provider={info}
                stats={getProviderStats(key, "oauth")}
                authType="free"
                onToggle={(active) => handleToggleProvider(key, "oauth", active)}
              />
            ))}
            {freeTierEntries.map(([key, info]) => (
              <ApiKeyProviderCard
                key={key}
                providerId={key}
                provider={info}
                stats={getProviderStats(key, "apikey")}
                authType="apikey"
                onToggle={(active) => handleToggleProvider(key, "apikey", active)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── API Key Providers ── */}
      {apikeyEntries.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-[3px] h-8 rounded-full" style={{ background: "linear-gradient(180deg, #fbbf24 0%, rgba(251,191,36,0.2) 100%)" }} />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[16px] font-bold text-white tracking-tight">API Key Providers</h2>
                  <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md tabular-nums" style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.15)" }}>
                    {apikeyEntries.length}
                  </span>
                </div>
                <p className="text-[12px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Paste your API key to connect</p>
              </div>
            </div>
            <button
              onClick={() => handleBatchTest("apikey")}
              disabled={!!testingMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150"
              style={{
                background: testingMode === "apikey" ? "rgba(11,124,143,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${testingMode === "apikey" ? "rgba(11,124,143,0.3)" : "rgba(255,255,255,0.08)"}`,
                color: testingMode === "apikey" ? "#2cb3d8" : "rgba(255,255,255,0.45)",
              }}
            >
              <span className={`material-symbols-outlined${testingMode === "apikey" ? " animate-spin" : ""}`} style={{ fontSize: 14 }}>
                {testingMode === "apikey" ? "progress_activity" : "play_arrow"}
              </span>
              {testingMode === "apikey" ? "Testing..." : "Test All"}
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {apikeyEntries.map(([key, info]) => (
              <ApiKeyProviderCard
                key={key}
                providerId={key}
                provider={info}
                stats={getProviderStats(key, "apikey")}
                authType="apikey"
                onToggle={(active) => handleToggleProvider(key, "apikey", active)}
              />
            ))}
          </div>
        </section>
      )}

      <AddOpenAICompatibleModal
        isOpen={showAddCompatibleModal}
        onClose={() => setShowAddCompatibleModal(false)}
        onCreated={(node) => {
          setProviderNodes((prev) => [...prev, node]);
          setShowAddCompatibleModal(false);
        }}
      />
      <AddAnthropicCompatibleModal
        isOpen={showAddAnthropicCompatibleModal}
        onClose={() => setShowAddAnthropicCompatibleModal(false)}
        onCreated={(node) => {
          setProviderNodes((prev) => [...prev, node]);
          setShowAddAnthropicCompatibleModal(false);
        }}
      />

      {/* Test Results Modal */}
      {testResults && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[8vh]"
          onClick={() => setTestResults(null)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-[560px] max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl"
            style={{ background: "rgba(14,16,20,0.98)", border: "1px solid rgba(255,255,255,0.08)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 rounded-t-2xl" style={{ background: "rgba(14,16,20,0.98)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 className="text-[15px] font-semibold text-white/85">Test Results</h3>
              <button
                onClick={() => setTestResults(null)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "rgba(255,255,255,0.4)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>
            <div className="p-5">
              <ProviderTestResultsView results={testResults} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProviderCard({ providerId, provider, stats, authType, onToggle }) {
  const { connected, error, errorCode, errorTime, allDisabled } = stats;
  const isNoAuth = !!provider.noAuth;

  /* Status */
  const statusDot = allDisabled
    ? { color: "rgba(255,255,255,0.2)", pulse: false, label: "Disabled" }
    : isNoAuth || connected > 0
    ? { color: "#34d399", pulse: true,  label: isNoAuth ? "Ready" : `${connected} Connected` }
    : error > 0
    ? { color: "#f87171", pulse: false, label: `${error} Error${errorCode ? ` · ${errorCode}` : ""}` }
    : { color: "rgba(255,255,255,0.2)", pulse: false, label: "Not connected" };

  /* Auth pill */
  const authPill = {
    free:  { bg: "rgba(52,211,153,0.12)",  color: "#34d399", label: "Free"  },
    oauth: { bg: "rgba(96,165,250,0.12)",  color: "#60a5fa", label: "OAuth" },
  }[authType] || { bg: "rgba(96,165,250,0.12)", color: "#60a5fa", label: "OAuth" };

  return (
    <Link href={`/dashboard/providers/${providerId}`} className="group block min-w-0">
      <div
        className="relative flex flex-col p-4 rounded-2xl transition-all duration-200 cursor-pointer h-full overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          opacity: allDisabled ? 0.45 : 1,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "rgba(255,255,255,0.055)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.13)";
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.25)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "rgba(255,255,255,0.03)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {/* Subtle color glow top-right */}
        {provider.color && (
          <div
            className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
            style={{ background: provider.color + "12", filter: "blur(16px)" }}
            aria-hidden="true"
          />
        )}

        {/* Header row: icon + toggle */}
        <div className="flex items-start justify-between gap-2 mb-3">
          {/* Round icon — double-bezel */}
          <div
            className="relative shrink-0"
            style={{
              width: 44, height: 44,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: 3,
            }}
          >
            <div
              className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: provider.color ? provider.color + "20" : "rgba(255,255,255,0.06)",
                boxShadow: provider.color ? `inset 0 1px 0 ${provider.color}30` : "none",
              }}
            >
              <ProviderIcon
                src={`/providers/${provider.id}.png`}
                alt={provider.name}
                size={26}
                className="object-contain max-w-[26px] max-h-[26px]"
                fallbackText={provider.textIcon || provider.id.slice(0, 2).toUpperCase()}
                fallbackColor={provider.color}
              />
            </div>
          </div>

          {/* Toggle — visible on hover */}
          {stats.total > 0 && (
            <div
              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 mt-0.5"
              onClick={e => { e.preventDefault(); e.stopPropagation(); onToggle(!allDisabled); }}
            >
              <Toggle size="sm" checked={!allDisabled} onChange={() => {}} />
            </div>
          )}
        </div>

        {/* Name + auth pill */}
        <div className="mb-2.5">
          <h3 className="text-[14px] font-semibold text-white/90 truncate leading-snug mb-1">{provider.name}</h3>
          <span
            className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
            style={{ background: authPill.bg, color: authPill.color }}
          >
            {authPill.label}
          </span>
        </div>

        {/* Status row */}
        <div className="flex items-center gap-1.5 mt-auto">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{
              background: statusDot.color,
              boxShadow: statusDot.pulse ? `0 0 5px ${statusDot.color}` : "none",
              animation: statusDot.pulse ? "statusPulse 2s infinite" : "none",
            }}
          />
          <span className="text-[11px] truncate" style={{ color: statusDot.color === "#34d399" ? "#34d399" : statusDot.color === "#f87171" ? "#f87171" : "rgba(255,255,255,0.3)" }}>
            {statusDot.label}
          </span>
          {errorTime && (
            <span className="text-[10px] ml-auto shrink-0" style={{ color: "rgba(255,255,255,0.18)" }}>{errorTime}</span>
          )}
        </div>

        {/* Hover arrow */}
        <div className="absolute bottom-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: "rgba(255,255,255,0.25)" }}>arrow_forward</span>
        </div>

        <style>{`@keyframes statusPulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      </div>
    </Link>
  );
}

ProviderCard.propTypes = {
  providerId: PropTypes.string.isRequired,
  provider: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    color: PropTypes.string,
    textIcon: PropTypes.string,
  }).isRequired,
  stats: PropTypes.shape({
    connected: PropTypes.number,
    error: PropTypes.number,
    errorCode: PropTypes.string,
    errorTime: PropTypes.string,
  }).isRequired,
  authType: PropTypes.string,
  onToggle: PropTypes.func,
};

function ApiKeyProviderCard({ providerId, provider, stats, authType, onToggle }) {
  const { connected, error, errorCode, errorTime, allDisabled } = stats;
  const isCompatible = providerId.startsWith(OPENAI_COMPATIBLE_PREFIX);
  const isAnthropicCompatible = providerId.startsWith(ANTHROPIC_COMPATIBLE_PREFIX);

  const statusDot = allDisabled
    ? { color: "rgba(255,255,255,0.2)", pulse: false, label: "Disabled" }
    : connected > 0
    ? { color: "#34d399", pulse: true,  label: `${connected} Connected` }
    : error > 0
    ? { color: "#f87171", pulse: false, label: `${error} Error${errorCode ? ` · ${errorCode}` : ""}` }
    : { color: "rgba(255,255,255,0.2)", pulse: false, label: "Not connected" };

  const authPill = {
    apikey:     { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24", label: "API Key"    },
    compatible: { bg: "rgba(249,115,22,0.12)",  color: "#fb923c", label: "Compatible" },
    free:       { bg: "rgba(52,211,153,0.12)",  color: "#34d399", label: "Free"       },
  }[authType] || { bg: "rgba(251,191,36,0.12)", color: "#fbbf24", label: "API Key" };

  const getIconPath = () => {
    if (isCompatible) return provider.apiType === "responses" ? "/providers/oai-r.png" : "/providers/oai-cc.png";
    if (isAnthropicCompatible) return "/providers/anthropic-m.png";
    return `/providers/${provider.id}.png`;
  };

  const apiTypeBadge = isCompatible
    ? (provider.apiType === "responses" ? "Responses" : "Chat")
    : isAnthropicCompatible ? "Messages" : null;

  return (
    <Link href={`/dashboard/providers/${providerId}`} className="group block min-w-0">
      <div
        className="relative flex flex-col p-4 rounded-2xl transition-all duration-200 cursor-pointer h-full overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          opacity: allDisabled ? 0.45 : 1,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "rgba(255,255,255,0.055)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.13)";
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.25)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "rgba(255,255,255,0.03)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {/* Color glow */}
        {provider.color && (
          <div
            className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
            style={{ background: provider.color + "12", filter: "blur(16px)" }}
            aria-hidden="true"
          />
        )}

        {/* Header: round icon + toggle */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div
            className="relative shrink-0"
            style={{
              width: 44, height: 44,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: 3,
            }}
          >
            <div
              className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: provider.color ? provider.color + "20" : "rgba(255,255,255,0.06)",
                boxShadow: provider.color ? `inset 0 1px 0 ${provider.color}30` : "none",
              }}
            >
              <ProviderIcon
                src={getIconPath()}
                alt={provider.name}
                size={26}
                className="object-contain max-w-[26px] max-h-[26px]"
                fallbackText={provider.textIcon || provider.id.slice(0, 2).toUpperCase()}
                fallbackColor={provider.color}
              />
            </div>
          </div>

          {stats.total > 0 && (
            <div
              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 mt-0.5"
              onClick={e => { e.preventDefault(); e.stopPropagation(); onToggle(!allDisabled); }}
            >
              <Toggle size="sm" checked={!allDisabled} onChange={() => {}} />
            </div>
          )}
        </div>

        {/* Name + pills */}
        <div className="mb-2.5">
          <h3 className="text-[14px] font-semibold text-white/90 truncate leading-snug mb-1">{provider.name}</h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
              style={{ background: authPill.bg, color: authPill.color }}
            >
              {authPill.label}
            </span>
            {apiTypeBadge && (
              <span
                className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}
              >
                {apiTypeBadge}
              </span>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-1.5 mt-auto">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{
              background: statusDot.color,
              boxShadow: statusDot.pulse ? `0 0 5px ${statusDot.color}` : "none",
              animation: statusDot.pulse ? "statusPulse 2s infinite" : "none",
            }}
          />
          <span className="text-[11px] truncate" style={{ color: statusDot.color === "#34d399" ? "#34d399" : statusDot.color === "#f87171" ? "#f87171" : "rgba(255,255,255,0.3)" }}>
            {statusDot.label}
          </span>
          {errorTime && (
            <span className="text-[10px] ml-auto shrink-0" style={{ color: "rgba(255,255,255,0.18)" }}>{errorTime}</span>
          )}
        </div>

        <div className="absolute bottom-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <span className="material-symbols-outlined" style={{ fontSize: 14, color: "rgba(255,255,255,0.25)" }}>arrow_forward</span>
        </div>
      </div>
    </Link>
  );
}

ApiKeyProviderCard.propTypes = {
  providerId: PropTypes.string.isRequired,
  provider: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    color: PropTypes.string,
    textIcon: PropTypes.string,
    apiType: PropTypes.string,
  }).isRequired,
  stats: PropTypes.shape({
    connected: PropTypes.number,
    error: PropTypes.number,
    errorCode: PropTypes.string,
    errorTime: PropTypes.string,
  }).isRequired,
  authType: PropTypes.string,
  onToggle: PropTypes.func,
};

function AddOpenAICompatibleModal({ isOpen, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    prefix: "",
    apiType: "chat",
    baseUrl: "https://api.openai.com/v1",
  });
  const [submitting, setSubmitting] = useState(false);
  const [checkKey, setCheckKey] = useState("");
  const [checkModelId, setCheckModelId] = useState("");
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const apiTypeOptions = [
    { value: "chat", label: "Chat Completions" },
    { value: "responses", label: "Responses API" },
  ];

  useEffect(() => {
    const defaultBaseUrl = "https://api.openai.com/v1";
    setFormData((prev) => ({ ...prev, baseUrl: defaultBaseUrl }));
  }, [formData.apiType]);

  const handleSubmit = async () => {
    if (
      !formData.name.trim() ||
      !formData.prefix.trim() ||
      !formData.baseUrl.trim()
    )
      return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/provider-nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          prefix: formData.prefix,
          apiType: formData.apiType,
          baseUrl: formData.baseUrl,
          type: "openai-compatible",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onCreated(data.node);
        setFormData({
          name: "",
          prefix: "",
          apiType: "chat",
          baseUrl: "https://api.openai.com/v1",
        });
        setCheckKey("");
        setValidationResult(null);
      }
    } catch (error) {
      console.log("Error creating OpenAI Compatible node:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidate = async () => {
    setValidating(true);
    try {
      const res = await fetch("/api/provider-nodes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUrl: formData.baseUrl,
          apiKey: checkKey,
          type: "openai-compatible",
          modelId: checkModelId.trim() || undefined,
        }),
      });
      const data = await res.json();
      setValidationResult(data);
    } catch {
      setValidationResult({ valid: false, error: "Network error" });
    } finally {
      setValidating(false);
    }
  };

  // Helper to render validation result
  const renderValidationResult = () => {
    if (!validationResult) return null;
    const { valid, error, method } = validationResult;

    if (valid) {
      return (
        <>
          <Badge variant="success">Valid</Badge>
          {method === "chat" && (
            <span className="text-sm text-text-muted">
              (via inference test)
            </span>
          )}
        </>
      );
    }
    return (
      <div className="flex flex-col gap-1">
        <Badge variant="error">Invalid</Badge>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} title="Add OpenAI Compatible" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="OpenAI Compatible (Prod)"
          hint="Required. A friendly label for this node."
        />
        <Input
          label="Prefix"
          value={formData.prefix}
          onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
          placeholder="oc-prod"
          hint="Required. Used as the provider prefix for model IDs."
        />
        <Select
          label="API Type"
          options={apiTypeOptions}
          value={formData.apiType}
          onChange={(e) =>
            setFormData({ ...formData, apiType: e.target.value })
          }
        />
        <Input
          label="Base URL"
          value={formData.baseUrl}
          onChange={(e) =>
            setFormData({ ...formData, baseUrl: e.target.value })
          }
          placeholder="https://api.openai.com/v1"
          hint="Use the base URL (ending in /v1) for your OpenAI-compatible API."
        />
        <Input
          label="API Key (for Check)"
          type="password"
          value={checkKey}
          onChange={(e) => setCheckKey(e.target.value)}
        />
        <Input
          label="Model ID (optional)"
          value={checkModelId}
          onChange={(e) => setCheckModelId(e.target.value)}
          placeholder="e.g. gpt-4, claude-3-opus"
          hint="If provider lacks /models endpoint, enter a model ID to validate via chat/completions instead."
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            onClick={handleValidate}
            disabled={!checkKey || validating || !formData.baseUrl.trim()}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            {validating ? "Checking..." : "Check"}
          </Button>
          {renderValidationResult()}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={handleSubmit}
            fullWidth
            disabled={
              !formData.name.trim() ||
              !formData.prefix.trim() ||
              !formData.baseUrl.trim() ||
              submitting
            }
          >
            {submitting ? "Creating..." : "Create"}
          </Button>
          <Button onClick={onClose} variant="ghost" fullWidth>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

AddOpenAICompatibleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreated: PropTypes.func.isRequired,
};

function AddAnthropicCompatibleModal({ isOpen, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    prefix: "",
    baseUrl: "https://api.anthropic.com/v1",
  });
  const [submitting, setSubmitting] = useState(false);
  const [checkKey, setCheckKey] = useState("");
  const [checkModelId, setCheckModelId] = useState("");
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null); // { valid, error, method }

  useEffect(() => {
    if (isOpen) {
      setValidationResult(null);
      setCheckKey("");
      setCheckModelId("");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (
      !formData.name.trim() ||
      !formData.prefix.trim() ||
      !formData.baseUrl.trim()
    )
      return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/provider-nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          prefix: formData.prefix,
          baseUrl: formData.baseUrl,
          type: "anthropic-compatible",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onCreated(data.node);
        setFormData({
          name: "",
          prefix: "",
          baseUrl: "https://api.anthropic.com/v1",
        });
        setCheckKey("");
        setValidationResult(null);
      }
    } catch (error) {
      console.log("Error creating Anthropic Compatible node:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleValidate = async () => {
    setValidating(true);
    try {
      const res = await fetch("/api/provider-nodes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUrl: formData.baseUrl,
          apiKey: checkKey,
          type: "anthropic-compatible",
          modelId: checkModelId.trim() || undefined,
        }),
      });
      const data = await res.json();
      setValidationResult(data);
    } catch {
      setValidationResult({ valid: false, error: "Network error" });
    } finally {
      setValidating(false);
    }
  };

  // Helper to render validation result
  const renderValidationResult = () => {
    if (!validationResult) return null;
    const { valid, error, method } = validationResult;

    if (valid) {
      return (
        <>
          <Badge variant="success">Valid</Badge>
          {method === "chat" && (
            <span className="text-sm text-text-muted">
              (via inference test)
            </span>
          )}
        </>
      );
    }
    return (
      <div className="flex flex-col gap-1">
        <Badge variant="error">Invalid</Badge>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} title="Add Anthropic Compatible" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Anthropic Compatible (Prod)"
          hint="Required. A friendly label for this node."
        />
        <Input
          label="Prefix"
          value={formData.prefix}
          onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
          placeholder="ac-prod"
          hint="Required. Used as the provider prefix for model IDs."
        />
        <Input
          label="Base URL"
          value={formData.baseUrl}
          onChange={(e) =>
            setFormData({ ...formData, baseUrl: e.target.value })
          }
          placeholder="https://api.anthropic.com/v1"
          hint="Use the base URL (ending in /v1) for your Anthropic-compatible API. The system will append /messages."
        />
        <Input
          label="API Key (for Check)"
          type="password"
          value={checkKey}
          onChange={(e) => setCheckKey(e.target.value)}
        />
        <Input
          label="Model ID (optional)"
          value={checkModelId}
          onChange={(e) => setCheckModelId(e.target.value)}
          placeholder="e.g. claude-3-opus"
          hint="If provider lacks /models endpoint, enter a model ID to validate via chat/completions instead."
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            onClick={handleValidate}
            disabled={!checkKey || validating || !formData.baseUrl.trim()}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            {validating ? "Checking..." : "Check"}
          </Button>
          {renderValidationResult()}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={handleSubmit}
            fullWidth
            disabled={
              !formData.name.trim() ||
              !formData.prefix.trim() ||
              !formData.baseUrl.trim() ||
              submitting
            }
          >
            {submitting ? "Creating..." : "Create"}
          </Button>
          <Button onClick={onClose} variant="ghost" fullWidth>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

AddAnthropicCompatibleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreated: PropTypes.func.isRequired,
};

function ProviderTestResultsView({ results }) {
  if (results.error && !results.results) {
    return (
      <div className="text-center py-6">
        <span className="material-symbols-outlined text-red-500 text-[32px] mb-2 block">
          error
        </span>
        <p className="text-sm text-red-400">{results.error}</p>
      </div>
    );
  }

  const { summary, mode } = results;
  const items = results.results || [];
  const modeLabel =
    {
      oauth: "OAuth",
      free: "Free",
      apikey: "API Key",
      provider: "Provider",
      all: "All",
    }[mode] || mode;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {summary && (
        <div className="flex flex-wrap items-center gap-2 text-xs mb-1 sm:gap-3">
          <span className="text-text-muted">{modeLabel} Test</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium">
            {summary.passed} passed
          </span>
          {summary.failed > 0 && (
            <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-400 font-medium">
              {summary.failed} failed
            </span>
          )}
          <span className="text-text-muted sm:ml-auto">
            {summary.total} tested
          </span>
        </div>
      )}
      {items.map((r, i) => (
        <div
          key={r.connectionId || i}
          className="flex min-w-0 flex-wrap items-center gap-2 rounded-lg bg-black/[0.03] px-3 py-2 text-xs dark:bg-white/[0.03] sm:flex-nowrap"
        >
          <span
            className={`material-symbols-outlined text-[16px] ${r.valid ? "text-emerald-500" : "text-red-500"}`}
          >
            {r.valid ? "check_circle" : "error"}
          </span>
          <div className="min-w-0 flex-[1_1_160px]">
            <span className="block truncate font-medium sm:inline">
              {r.connectionName}
            </span>
            <span className="block truncate text-text-muted sm:ml-1.5 sm:inline">
              ({r.provider})
            </span>
          </div>
          {r.latencyMs !== undefined && (
            <span className="shrink-0 text-text-muted font-mono tabular-nums">
              {r.latencyMs}ms
            </span>
          )}
          <span
            className={`shrink-0 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
              r.valid
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-red-500/15 text-red-400"
            }`}
          >
            {r.valid ? "OK" : r.diagnosis?.type || "ERROR"}
          </span>
        </div>
      ))}
      {items.length === 0 && (
        <div className="text-center py-4 text-text-muted text-sm">
          No active connections found for this group.
        </div>
      )}
    </div>
  );
}

ProviderTestResultsView.propTypes = {
  results: PropTypes.shape({
    mode: PropTypes.string,
    results: PropTypes.array,
    summary: PropTypes.shape({
      total: PropTypes.number,
      passed: PropTypes.number,
      failed: PropTypes.number,
    }),
    error: PropTypes.string,
  }).isRequired,
};
