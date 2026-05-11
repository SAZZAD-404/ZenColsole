"use client";

import { useState, useEffect, useRef } from "react";
import ProviderIcon from "@/shared/components/ProviderIcon";
import { AI_PROVIDERS, FREE_PROVIDERS } from "@/shared/constants/providers";
import UsageChart from "../usage/components/UsageChart";

/* ── Formatters ── */
const fmt    = (n) => new Intl.NumberFormat().format(n || 0);
const fmtK   = (n) => { if (!n) return "0"; if (n >= 1e9) return `${(n/1e9).toFixed(1)}B`; if (n >= 1e6) return `${(n/1e6).toFixed(1)}M`; if (n >= 1e3) return `${(n/1e3).toFixed(1)}K`; return String(n); };
const fmtCost = (n) => `$${(n || 0).toFixed(2)}`;

function timeAgo(ts) {
  const s = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

/* ── Live clock for timeAgo ── */
function TimeAgo({ timestamp }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick(t => t + 1), 5000);
    return () => clearInterval(id);
  }, []);
  return <>{timeAgo(timestamp)}</>;
}

/* ── Stat card ── */
function StatCard({ label, value, sub, icon, accent = false, live = false, color = "#2cb3d8" }) {
  return (
    <div
      className="flex flex-col gap-3 p-5 rounded-[14px]"
      style={{
        background: accent ? `rgba(11,124,143,0.07)` : "rgba(14,17,24,0.9)",
        border: `1px solid ${accent ? "rgba(11,124,143,0.18)" : "rgba(255,255,255,0.055)"}`,
        boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="font-semibold uppercase tracking-widest"
          style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}
        >
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          {live && (
            <span className="flex items-center gap-1" style={{ fontSize: 10, color: "#34d399" }}>
              <span className="size-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              LIVE
            </span>
          )}
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 15, color: "rgba(255,255,255,0.18)", fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            {icon}
          </span>
        </div>
      </div>
      <div>
        <span
          className="font-semibold tracking-tight text-white"
          style={{ fontSize: 28, letterSpacing: "-0.04em" }}
        >
          {value}
        </span>
        {sub && (
          <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{sub}</p>
        )}
      </div>
    </div>
  );
}

/* ── Active request row ── */
function ActiveRow({ req }) {
  const provider = req.provider || "unknown";
  const cfg = AI_PROVIDERS[provider] || FREE_PROVIDERS[provider] || {};
  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 transition-colors"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
    >
      <span className="size-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
      <div
        className="size-6 rounded-[6px] flex items-center justify-center shrink-0 overflow-hidden"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <ProviderIcon src={`/providers/${provider}.png`} alt={provider} size={22} className="object-contain" fallbackText={provider.slice(0,2).toUpperCase()} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-mono text-white truncate" style={{ fontSize: 12 }}>{req.model || "—"}</p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{cfg.name || provider}</p>
      </div>
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>active</span>
    </div>
  );
}

/* ── Recent request row ── */
function RecentRow({ req }) {
  const ok = !req.status || req.status === "ok" || req.status === "success";
  const provider = req.provider || "unknown";
  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 transition-colors group"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <span
        className="size-1.5 rounded-full shrink-0"
        style={{ background: ok ? "#34d399" : "#f87171" }}
      />
      <div
        className="size-6 rounded-[6px] flex items-center justify-center shrink-0 overflow-hidden"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <ProviderIcon src={`/providers/${provider}.png`} alt={provider} size={22} className="object-contain" fallbackText={provider.slice(0,2).toUpperCase()} />
      </div>
      <span className="font-mono text-white truncate flex-1" style={{ fontSize: 12 }}>{req.model || "—"}</span>
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-mono" style={{ fontSize: 11, color: "#2cb3d8" }}>
          {fmtK(req.promptTokens)}↑
        </span>
        <span className="font-mono" style={{ fontSize: 11, color: "#34d399" }}>
          {fmtK(req.completionTokens)}↓
        </span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", minWidth: 52, textAlign: "right" }}>
          <TimeAgo timestamp={req.timestamp} />
        </span>
      </div>
    </div>
  );
}

/* ── Panel wrapper ── */
function Panel({ title, icon, children, action, badge, height }) {
  return (
    <div
      className="flex flex-col rounded-[14px] overflow-hidden"
      style={{
        background: "rgba(14,17,24,0.9)",
        border: "1px solid rgba(255,255,255,0.055)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
        height: height ? height : undefined,
      }}
    >
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 15, color: "rgba(255,255,255,0.3)", fontVariationSettings: "'FILL' 0, 'wght' 300" }}
          >
            {icon}
          </span>
          <span className="font-semibold text-white tracking-tight" style={{ fontSize: 13 }}>{title}</span>
          {badge != null && (
            <span
              className="px-1.5 py-0.5 rounded-full font-semibold"
              style={{ fontSize: 10, background: "rgba(11,124,143,0.15)", color: "#2cb3d8", border: "1px solid rgba(11,124,143,0.2)" }}
            >
              {badge}
            </span>
          )}
        </div>
        {action}
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">{children}</div>
    </div>
  );
}

/* ── Provider status card ── */
function ProviderCard({ conn }) {
  const provider = conn.provider || "unknown";
  const cfg = AI_PROVIDERS[provider] || FREE_PROVIDERS[provider] || {};
  const isActive = conn.testStatus === "active" || conn.testStatus === "success" || !conn.testStatus;
  const isError  = conn.testStatus === "error" || conn.testStatus === "expired";

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 transition-colors"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <div
        className="size-7 rounded-[7px] flex items-center justify-center shrink-0 overflow-hidden"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <ProviderIcon src={`/providers/${provider}.png`} alt={provider} size={24} className="object-contain" fallbackText={provider.slice(0,2).toUpperCase()} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate" style={{ fontSize: 13 }}>{cfg.name || provider}</p>
        <p className="truncate" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
          {conn.accountName || conn.email || "Connected"}
        </p>
      </div>
      <span
        className="size-2 rounded-full shrink-0"
        style={{ background: isError ? "#f87171" : isActive ? "#34d399" : "#fbbf24" }}
      />
    </div>
  );
}

/* ── Main Dashboard ── */
export default function DashboardOverviewPage() {
  const [stats, setStats] = useState(null);
  const [liveStats, setLiveStats] = useState(null); // SSE live data (always latest)
  const [connections, setConnections] = useState([]);
  const [period, setPeriod] = useState("7d");
  const [chartKey, setChartKey] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);
  const chartRefTimer = useRef(null);

  /* Fetch stats for selected period */
  useEffect(() => {
    setStatsLoading(true);
    fetch(`/api/usage/stats?period=${period}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats(d); })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, [period]);

  /* SSE — live active/recent requests only */
  useEffect(() => {
    const es = new EventSource("/api/usage/stream");
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setLiveStats(data);
        if (!chartRefTimer.current) {
          chartRefTimer.current = setTimeout(() => {
            setChartKey(k => k + 1);
            chartRefTimer.current = null;
          }, 60000);
        }
      } catch {}
    };
    return () => {
      es.close();
      if (chartRefTimer.current) clearTimeout(chartRefTimer.current);
    };
  }, []);

  /* Providers — refresh every 30s */
  useEffect(() => {
    const load = () =>
      fetch("/api/providers")
        .then(r => r.ok ? r.json() : { connections: [] })
        .then(d => setConnections(d.connections || []))
        .catch(() => {});
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  const activeReqs  = liveStats?.activeRequests || stats?.activeRequests || [];
  const recentReqs  = (liveStats?.recentRequests || stats?.recentRequests || []).filter(r => r.model);
  const activeCount = activeReqs.length;

  const periodLabel = { "24h": "Last 24 hours", "7d": "Last 7 days", "30d": "Last 30 days", "60d": "Last 60 days" }[period] || "Last 7 days";

  return (
    <div className="flex flex-col gap-5">

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Requests"
          value={activeCount}
          sub={activeCount > 0 ? `${activeCount} in-flight` : "No active requests"}
          icon="bolt"
          accent={activeCount > 0}
          live
        />
        <StatCard
          label="Total Requests"
          value={statsLoading ? "…" : fmt(stats?.totalRequests)}
          sub={periodLabel}
          icon="swap_horiz"
        />
        <StatCard
          label="Tokens Used"
          value={statsLoading ? "…" : fmtK((stats?.totalPromptTokens || 0) + (stats?.totalCompletionTokens || 0))}
          sub={statsLoading ? "" : `↑ ${fmtK(stats?.totalPromptTokens)} in  ↓ ${fmtK(stats?.totalCompletionTokens)} out`}
          icon="data_usage"
        />
        <StatCard
          label="Est. Cost"
          value={statsLoading ? "…" : fmtCost(stats?.totalCost)}
          sub={periodLabel}
          icon="payments"
        />
      </div>

      {/* ── Middle row: Active + Recent + Providers ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Active requests */}
        <Panel
          title="Active Requests"
          icon="bolt"
          badge={activeCount || null}
          height={280}
        >
          {activeCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: "rgba(255,255,255,0.1)" }}>bolt</span>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.22)" }}>No active requests</p>
            </div>
          ) : (
            activeReqs.map((r, i) => <ActiveRow key={i} req={r} />)
          )}
        </Panel>

        {/* Recent requests */}
        <Panel title="Recent Requests" icon="history" badge={recentReqs.length || null} height={280}>
          {recentReqs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: "rgba(255,255,255,0.1)" }}>history</span>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.22)" }}>No requests yet</p>
            </div>
          ) : (
            recentReqs.slice(0, 20).map((r, i) => <RecentRow key={i} req={r} />)
          )}
        </Panel>

        {/* Connected providers */}
        <Panel title="Connected Providers" icon="dns" badge={connections.length || null} height={280}>
          {connections.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: "rgba(255,255,255,0.1)" }}>dns</span>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.22)" }}>No providers connected</p>
            </div>
          ) : (
            connections.map((c) => <ProviderCard key={c.id} conn={c} />)
          )}
        </Panel>
      </div>

      {/* ── Chart ── */}
      <div
        className="rounded-[14px] overflow-hidden"
        style={{
          background: "rgba(14,17,24,0.9)",
          border: "1px solid rgba(255,255,255,0.055)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
        }}
      >
        {/* Chart header with period selector */}
        <div
          className="flex items-center justify-between gap-4 px-5 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 15, color: "rgba(255,255,255,0.3)", fontVariationSettings: "'FILL' 0, 'wght' 300" }}
            >
              show_chart
            </span>
            <span className="font-semibold text-white tracking-tight" style={{ fontSize: 13 }}>
              Usage Chart
            </span>
          </div>

          {/* Period pills */}
          <div
            className="flex items-center gap-1 p-1 rounded-[9px]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {[
              { value: "24h", label: "24H" },
              { value: "7d",  label: "7D"  },
              { value: "30d", label: "30D" },
              { value: "60d", label: "60D" },
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => { setPeriod(p.value); setChartKey(k => k + 1); }}
                className="px-3 py-1 rounded-[7px] font-semibold transition-all duration-150"
                style={
                  period === p.value
                    ? { background: "rgba(11,124,143,0.2)", color: "#2cb3d8", fontSize: 12, border: "1px solid rgba(11,124,143,0.3)" }
                    : { background: "transparent", color: "rgba(255,255,255,0.35)", fontSize: 12, border: "1px solid transparent" }
                }
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart body — remove internal padding from UsageChart */}
        <div className="p-4">
          <UsageChart key={chartKey} period={period} />
        </div>
      </div>

      {/* ── Bottom row: by model + by provider ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top models */}
        <Panel title="Top Models" icon="smart_toy" height={320}>
          {!stats?.byModel || Object.keys(stats.byModel).length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.25)" }}>No model data yet</p>
            </div>
          ) : (
            Object.entries(stats.byModel)
              .sort((a, b) => (b[1].requests || 0) - (a[1].requests || 0))
              .slice(0, 10)
              .map(([key, data]) => {
                const total = (data.promptTokens || 0) + (data.completionTokens || 0);
                const maxTotal = Math.max(...Object.values(stats.byModel).map(d => (d.promptTokens||0)+(d.completionTokens||0)));
                const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 px-4 py-2.5"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-white truncate" style={{ fontSize: 12 }}>
                          {data.rawModel || key}
                        </span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginLeft: 8 }}>
                          {fmt(data.requests)} req
                        </span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: "linear-gradient(90deg, #0B7C8F, #2cb3d8)" }}
                        />
                      </div>
                    </div>
                    <span className="font-mono shrink-0" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", minWidth: 40, textAlign: "right" }}>
                      {fmtK(total)}
                    </span>
                  </div>
                );
              })
          )}
        </Panel>

        {/* Top providers */}
        <Panel title="Top Providers" icon="dns" height={320}>
          {!stats?.byProvider || Object.keys(stats.byProvider).length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.25)" }}>No provider data yet</p>
            </div>
          ) : (
            Object.entries(stats.byProvider)
              .sort((a, b) => (b[1].requests || 0) - (a[1].requests || 0))
              .slice(0, 10)
              .map(([provider, data]) => {
                const cfg = AI_PROVIDERS[provider] || FREE_PROVIDERS[provider] || {};
                const total = (data.promptTokens || 0) + (data.completionTokens || 0);
                const maxTotal = Math.max(...Object.values(stats.byProvider).map(d => (d.promptTokens||0)+(d.completionTokens||0)));
                const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
                return (
                  <div
                    key={provider}
                    className="flex items-center gap-3 px-4 py-2.5"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <div
                      className="size-6 rounded-[6px] flex items-center justify-center shrink-0 overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      <ProviderIcon src={`/providers/${provider}.png`} alt={provider} size={22} className="object-contain" fallbackText={provider.slice(0,2).toUpperCase()} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white truncate" style={{ fontSize: 12.5 }}>
                          {cfg.name || provider}
                        </span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginLeft: 8 }}>
                          {fmt(data.requests)} req
                        </span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: "linear-gradient(90deg, #0B7C8F, #2cb3d8)" }}
                        />
                      </div>
                    </div>
                    <span className="font-mono shrink-0" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", minWidth: 40, textAlign: "right" }}>
                      {fmtK(total)}
                    </span>
                  </div>
                );
              })
          )}
        </Panel>
      </div>
    </div>
  );
}
