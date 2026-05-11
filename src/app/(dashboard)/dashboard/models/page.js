"use client";

import { useState, useEffect, useMemo } from "react";
import ProviderIcon from "@/shared/components/ProviderIcon";
import { useHeaderSearchStore } from "@/store/headerSearchStore";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";

/* ── Kind config ── */
const KIND_CONFIG = {
  llm:         { label: "Text",          icon: "chat",           color: "#2cb3d8", bg: "rgba(11,124,143,0.12)",   border: "rgba(11,124,143,0.22)"  },
  image:       { label: "Image",         icon: "image",          color: "#a78bfa", bg: "rgba(167,139,250,0.12)",  border: "rgba(167,139,250,0.22)" },
  embedding:   { label: "Embeddings",    icon: "data_array",     color: "#34d399", bg: "rgba(52,211,153,0.12)",   border: "rgba(52,211,153,0.22)"  },
  tts:         { label: "Audio",         icon: "volume_up",      color: "#fbbf24", bg: "rgba(251,191,36,0.12)",   border: "rgba(251,191,36,0.22)"  },
  stt:         { label: "Transcription", icon: "mic",            color: "#f87171", bg: "rgba(248,113,113,0.12)",  border: "rgba(248,113,113,0.22)" },
  imageToText: { label: "Vision",        icon: "visibility",     color: "#fb923c", bg: "rgba(251,146,60,0.12)",   border: "rgba(251,146,60,0.22)"  },
  webSearch:   { label: "Search",        icon: "travel_explore", color: "#60a5fa", bg: "rgba(96,165,250,0.12)",   border: "rgba(96,165,250,0.22)"  },
  webFetch:    { label: "Fetch",         icon: "download",       color: "#818cf8", bg: "rgba(129,140,248,0.12)",  border: "rgba(129,140,248,0.22)" },
  combo:       { label: "Combo",         icon: "layers",         color: "#e879f9", bg: "rgba(232,121,249,0.12)",  border: "rgba(232,121,249,0.22)" },
};

const ALL_KINDS = ["llm", "image", "embedding", "tts", "stt", "imageToText", "webSearch", "webFetch", "combo"];

/* ── Helpers ── */
function fmtTokens(n) {
  if (n == null) return "—";
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9)  return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6)  return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3)  return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}

function fmtPrice(v) {
  if (v == null) return "—";
  if (v === 0) return <span style={{ color: "#34d399" }}>Free</span>;
  return `$${v % 1 === 0 ? v.toFixed(2) : v < 0.01 ? v.toFixed(4) : v.toFixed(2)}`;
}

function fmtContext(n) {
  if (n == null) return "—";
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${Math.round(n / 1000)}K`;
  return String(n);
}

/* ── Copy cell ── */
function CopyCell({ text }) {
  const { copied, copy } = useCopyToClipboard(1500);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); copy(text); }}
      className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center"
      title="Copy model ID"
    >
      <span
        className="material-symbols-outlined"
        style={{
          fontSize: 13,
          color: copied ? "#34d399" : "rgba(255,255,255,0.35)",
          fontVariationSettings: "'FILL' 0, 'wght' 300",
        }}
      >
        {copied ? "check" : "content_copy"}
      </span>
    </button>
  );
}

/* ── Kind pill ── */
function KindPill({ kind }) {
  const cfg = KIND_CONFIG[kind] || KIND_CONFIG.llm;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full font-medium shrink-0"
      style={{
        fontSize: 10,
        paddingLeft: 7, paddingRight: 7,
        paddingTop: 2, paddingBottom: 2,
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: 11, fontVariationSettings: "'FILL' 0, 'wght' 300" }}
      >
        {cfg.icon}
      </span>
      {cfg.label}
    </span>
  );
}

/* ── Sort icon ── */
function SortIcon({ active, dir }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontSize: 12,
        color: active ? "#2cb3d8" : "rgba(255,255,255,0.18)",
        fontVariationSettings: "'FILL' 0, 'wght' 300",
      }}
    >
      {active ? (dir === "asc" ? "arrow_upward" : "arrow_downward") : "unfold_more"}
    </span>
  );
}

/* ── Main page ── */
export default function ModelsPage() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeKind, setActiveKind] = useState("all");
  const [sortCol, setSortCol] = useState("provider");
  const [sortDir, setSortDir] = useState("asc");

  const searchQuery = useHeaderSearchStore((s) => s.query);
  const registerSearch = useHeaderSearchStore((s) => s.register);
  const unregisterSearch = useHeaderSearchStore((s) => s.unregister);

  useEffect(() => {
    registerSearch("Search models...");
    return () => unregisterSearch();
  }, [registerSearch, unregisterSearch]);

  useEffect(() => {
    fetch("/api/dashboard/models-with-stats")
      .then((r) => r.ok ? r.json() : { models: [] })
      .then((d) => setModels(d.models || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* ── Filtered + sorted rows ── */
  const rows = useMemo(() => {
    let list = models;
    if (activeKind !== "all") list = list.filter((m) => m.kind === activeKind);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (m) => m.id.toLowerCase().includes(q) || (m.owned_by || "").toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      let va, vb;
      if (sortCol === "model")        { va = a.id;                    vb = b.id; }
      else if (sortCol === "provider"){ va = a.owned_by || "";        vb = b.owned_by || ""; }
      else if (sortCol === "input")   { va = a.pricing?.input ?? 999; vb = b.pricing?.input ?? 999; }
      else if (sortCol === "output")  { va = a.pricing?.output ?? 999;vb = b.pricing?.output ?? 999; }
      else if (sortCol === "context") { va = a.context ?? 0;          vb = b.context ?? 0; }
      else if (sortCol === "weekly")  { va = a.weeklyTokens ?? -1;    vb = b.weeklyTokens ?? -1; }
      else                            { va = a.id;                    vb = b.id; }
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [models, activeKind, searchQuery, sortCol, sortDir]);

  /* ── Kind counts ── */
  const kindCounts = useMemo(() => {
    const c = { all: models.length };
    for (const m of models) c[m.kind] = (c[m.kind] || 0) + 1;
    return c;
  }, [models]);

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const Th = ({ col, label, align = "left", width }) => (
    <th
      className="py-2.5 cursor-pointer select-none"
      style={{ width, textAlign: align, paddingLeft: 16, paddingRight: 16 }}
      onClick={() => toggleSort(col)}
    >
      <div className={`flex items-center gap-1 ${align === "right" ? "justify-end" : ""}`}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          {label}
        </span>
        <SortIcon active={sortCol === col} dir={sortDir} />
      </div>
    </th>
  );

  return (
    <div className="flex flex-col h-full">

      {/* ── Top bar ── */}
      <div
        className="flex items-center gap-3 px-5 py-3 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <h1 className="font-semibold text-white tracking-tight" style={{ fontSize: 17 }}>
          Models
        </h1>
        {!loading && (
          <span
            className="px-2 py-0.5 rounded-full font-medium"
            style={{
              fontSize: 11,
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.38)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {rows.length.toLocaleString()}
          </span>
        )}
      </div>

      {/* ── Kind filter tabs ── */}
      <div
        className="flex items-center gap-0.5 px-3 py-1.5 overflow-x-auto shrink-0 scroll-thin-x"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <KindTab label="All" count={kindCounts.all || 0} active={activeKind === "all"} onClick={() => setActiveKind("all")} icon="grid_view" color="#2cb3d8" />
        {ALL_KINDS.filter((k) => kindCounts[k] > 0).map((k) => {
          const cfg = KIND_CONFIG[k] || KIND_CONFIG.llm;
          return (
            <KindTab key={k} label={cfg.label} count={kindCounts[k] || 0} active={activeKind === k} onClick={() => setActiveKind(k)} icon={cfg.icon} color={cfg.color} />
          );
        })}
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <LoadingSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState query={searchQuery} kind={activeKind} />
        ) : (
          <table className="w-full border-collapse">
            <thead style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(8,10,14,0.97)", backdropFilter: "blur(12px)" }}>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <th style={{ width: 44 }} />
                <Th col="model"    label="Model Name" />
                <Th col="provider" label="Provider"   width={130} />
                <th className="py-2.5 px-4" style={{ width: 110 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Type</span>
                </th>
                <Th col="weekly"  label="Weekly Tokens" align="right" width={140} />
                <Th col="input"   label="Input / 1M"    align="right" width={120} />
                <Th col="output"  label="Output / 1M"   align="right" width={120} />
                <Th col="context" label="Context"        align="right" width={110} />
                <th style={{ width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {rows.map((model) => (
                <ModelRow key={model.id} model={model} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ── Kind tab ── */
function KindTab({ label, count, active, onClick, icon, color }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] whitespace-nowrap transition-all duration-150"
      style={
        active
          ? { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.9)" }
          : { color: "rgba(255,255,255,0.35)" }
      }
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.65)"; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontSize: 14, color: active ? color : "inherit", fontVariationSettings: "'FILL' 0, 'wght' 300" }}
      >
        {icon}
      </span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
      <span
        className="rounded-full px-1.5 font-semibold"
        style={{
          fontSize: 10, paddingTop: 1, paddingBottom: 1,
          background: active ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
          color: active ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.25)",
        }}
      >
        {count}
      </span>
    </button>
  );
}

/* ── Model row ── */
function ModelRow({ model }) {
  const provider = model.owned_by || "unknown";
  let displayName = model.id;
  if (displayName.startsWith(`${provider}/`)) displayName = displayName.slice(provider.length + 1);

  const hasWeekly = model.weeklyTokens != null && model.weeklyTokens > 0;

  return (
    <tr
      className="group transition-colors duration-100"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.022)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      {/* Provider icon */}
      <td className="pl-4 pr-2 py-2.5">
        <div
          className="size-6 rounded-[6px] flex items-center justify-center overflow-hidden shrink-0"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <ProviderIcon
            src={`/providers/${provider}.png`}
            alt={provider}
            size={22}
            className="object-contain"
            fallbackText={provider.slice(0, 2).toUpperCase()}
          />
        </div>
      </td>

      {/* Model name */}
      <td className="px-4 py-2.5">
        <span className="font-mono text-white" style={{ fontSize: 12.5, letterSpacing: "-0.01em" }}>
          {provider !== "unknown" && provider !== "combo" && (
            <span style={{ color: "rgba(255,255,255,0.25)" }}>
              {provider}<span style={{ color: "rgba(255,255,255,0.12)" }}>/</span>
            </span>
          )}
          {displayName}
        </span>
      </td>

      {/* Provider */}
      <td className="px-4 py-2.5">
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.32)", fontWeight: 500 }}>{provider}</span>
      </td>

      {/* Kind */}
      <td className="px-4 py-2.5">
        <KindPill kind={model.kind} />
      </td>

      {/* Weekly tokens */}
      <td className="px-4 py-2.5 text-right">
        <span
          className="font-mono"
          style={{
            fontSize: 12.5,
            color: hasWeekly ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.2)",
            fontWeight: hasWeekly ? 500 : 400,
          }}
        >
          {fmtTokens(model.weeklyTokens)}
        </span>
      </td>

      {/* Input price */}
      <td className="px-4 py-2.5 text-right">
        <span className="font-mono" style={{ fontSize: 12.5, color: model.pricing ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)" }}>
          {model.pricing ? fmtPrice(model.pricing.input) : "—"}
        </span>
      </td>

      {/* Output price */}
      <td className="px-4 py-2.5 text-right">
        <span className="font-mono" style={{ fontSize: 12.5, color: model.pricing ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)" }}>
          {model.pricing ? fmtPrice(model.pricing.output) : "—"}
        </span>
      </td>

      {/* Context */}
      <td className="px-4 py-2.5 text-right">
        <span className="font-mono" style={{ fontSize: 12.5, color: model.context ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.2)" }}>
          {fmtContext(model.context)}
        </span>
      </td>

      {/* Copy */}
      <td className="pr-4 py-2.5">
        <CopyCell text={model.id} />
      </td>
    </tr>
  );
}

/* ── Loading skeleton ── */
function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-2.5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
        >
          <div className="size-6 rounded-[6px] shrink-0" style={{ background: "rgba(255,255,255,0.06)" }} />
          <div className="h-3 rounded-full flex-1" style={{ background: "rgba(255,255,255,0.05)", maxWidth: `${100 + (i % 6) * 40}px` }} />
          <div className="h-3 w-16 rounded-full ml-auto" style={{ background: "rgba(255,255,255,0.04)" }} />
          <div className="h-5 w-14 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }} />
          <div className="h-3 w-12 rounded-full" style={{ background: "rgba(255,255,255,0.03)" }} />
          <div className="h-3 w-10 rounded-full" style={{ background: "rgba(255,255,255,0.03)" }} />
          <div className="h-3 w-10 rounded-full" style={{ background: "rgba(255,255,255,0.03)" }} />
          <div className="h-3 w-10 rounded-full" style={{ background: "rgba(255,255,255,0.03)" }} />
        </div>
      ))}
    </div>
  );
}

/* ── Empty state ── */
function EmptyState({ query, kind }) {
  const cfg = KIND_CONFIG[kind];
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <span
        className="material-symbols-outlined mb-4"
        style={{ fontSize: 44, color: "rgba(255,255,255,0.1)", fontVariationSettings: "'FILL' 0, 'wght' 200" }}
      >
        {query ? "search_off" : "smart_toy"}
      </span>
      <p className="font-semibold text-white mb-1.5" style={{ fontSize: 15 }}>
        {query ? "No models found" : "No models available"}
      </p>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.28)" }}>
        {query
          ? `No results for "${query}"`
          : kind !== "all"
          ? `No ${cfg?.label || kind} models connected`
          : "Add providers in the Providers page to see models here"}
      </p>
    </div>
  );
}
