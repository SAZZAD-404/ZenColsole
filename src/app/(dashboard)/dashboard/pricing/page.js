"use client";

import { useState, useEffect, useRef } from "react";
import { Button, Badge, ConfirmModal } from "@/shared/components";
import { useNotificationStore } from "@/store/notificationStore";

/* ══════════════════════════════════════════
   Helpers
══════════════════════════════════════════ */
const fmtNum = (n) => {
  if (!n || n === 0) return "Unlimited";
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return String(n);
};

const ACCENT_COLORS = [
  { value: "#2cb3d8", label: "Cyan"   },
  { value: "#a78bfa", label: "Purple" },
  { value: "#34d399", label: "Green"  },
  { value: "#f59e0b", label: "Amber"  },
  { value: "#f87171", label: "Red"    },
  { value: "#fb923c", label: "Orange" },
];

/* ══════════════════════════════════════════
   Inline Editable Text
══════════════════════════════════════════ */
function EditableText({ value, onChange, placeholder, className = "", multiline = false, inputClassName = "" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => { onChange(draft); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  if (editing) {
    return multiline ? (
      <textarea
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === "Escape") cancel(); }}
        rows={2}
        className={`w-full px-2 py-1 bg-white/5 border border-primary/40 rounded-lg text-sm text-white focus:outline-none resize-none ${inputClassName}`}
      />
    ) : (
      <input
        autoFocus
        type="text"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }}
        className={`w-full px-2 py-1 bg-white/5 border border-primary/40 rounded-lg text-sm text-white focus:outline-none ${inputClassName}`}
      />
    );
  }

  return (
    <span
      onClick={() => { setDraft(value); setEditing(true); }}
      className={`cursor-text group-hover:underline decoration-dashed decoration-white/20 underline-offset-2 transition-colors ${className}`}
      title="Click to edit"
    >
      {value || <span className="opacity-30 italic">{placeholder}</span>}
    </span>
  );
}

/* ══════════════════════════════════════════
   Feature List Editor
══════════════════════════════════════════ */
function FeatureEditor({ features, onChange, accent }) {
  const [newVal, setNewVal] = useState("");
  const inputRef = useRef(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // index to delete

  const update = (i, val) => { const n = [...features]; n[i] = val; onChange(n); };
  const remove = (i) => { onChange(features.filter((_, idx) => idx !== i)); setConfirmDelete(null); };
  const add = () => {
    if (!newVal.trim()) return;
    onChange([...features, newVal.trim()]);
    setNewVal("");
    inputRef.current?.focus();
  };

  return (
    <>
      <div className="flex flex-col gap-1.5">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-2 group/feat">
            <span className="material-symbols-outlined shrink-0" style={{ fontSize: 13, color: accent || "#2cb3d8" }}>check_circle</span>
            <input
              type="text"
              value={f}
              onChange={e => update(i, e.target.value)}
              className="flex-1 min-w-0 px-2 py-1 bg-white/5 border border-white/8 rounded text-xs text-white/80 focus:outline-none focus:border-primary/50 focus:bg-white/8 transition-colors"
            />
            <button
              onClick={() => setConfirmDelete(i)}
              className="shrink-0 opacity-0 group-hover/feat:opacity-100 p-0.5 rounded text-white/30 hover:text-red-400 transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>close</span>
            </button>
          </div>
        ))}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="material-symbols-outlined shrink-0 text-white/20" style={{ fontSize: 13 }}>add</span>
          <input
            ref={inputRef}
            type="text"
            value={newVal}
            onChange={e => setNewVal(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") add(); }}
            placeholder="Add feature… (Enter)"
            className="flex-1 min-w-0 px-2 py-1 bg-transparent border border-dashed border-white/10 rounded text-xs text-white/30 placeholder:text-white/20 focus:outline-none focus:border-primary/40 focus:text-white/70 transition-colors"
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => remove(confirmDelete)}
        title="Remove Feature"
        message={confirmDelete !== null ? `Remove "${features[confirmDelete]}" from this plan?` : ""}
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}

/* ══════════════════════════════════════════
   Rate Limit Editor
══════════════════════════════════════════ */
function RateLimitEditor({ rateLimit, onChange }) {
  const r = rateLimit || {};
  const set = (key, val) => onChange({ ...r, [key]: val === "" ? 0 : Number(val) });

  const fields = [
    { key: "rpm", label: "Req / min",  icon: "speed"      },
    { key: "rpd", label: "Req / day",  icon: "today"      },
    { key: "tpm", label: "Tok / min",  icon: "bolt"       },
    { key: "tpd", label: "Tok / day",  icon: "data_usage" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {fields.map(({ key, label, icon }) => (
        <div key={key} className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-white/25" style={{ fontSize: 11 }}>{icon}</span>
            <label className="text-[10px] font-semibold text-white/35 uppercase tracking-wider">{label}</label>
          </div>
          <input
            type="number"
            min={0}
            value={r[key] ?? ""}
            onChange={e => set(key, e.target.value)}
            placeholder="0 = ∞"
            className="px-2 py-1.5 bg-white/5 border border-white/8 rounded-lg text-xs text-white/80 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   Plan Card Editor
══════════════════════════════════════════ */
function PlanCard({ plan, onUpdate, onDelete, canDelete, index }) {
  const [showRL, setShowRL] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = (key, val) => onUpdate({ ...plan, [key]: val });
  const accent = plan.accent || "#2cb3d8";

  const hasLimits = plan.rateLimit && (
    plan.rateLimit.rpm > 0 || plan.rateLimit.rpd > 0 ||
    plan.rateLimit.tpm > 0 || plan.rateLimit.tpd > 0
  );

  return (
    <div
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: plan.highlight
          ? "linear-gradient(135deg, rgba(11,124,143,0.10) 0%, rgba(11,124,143,0.04) 100%)"
          : "rgba(255,255,255,0.025)",
        border: plan.highlight
          ? "1px solid rgba(11,124,143,0.30)"
          : "1px solid rgba(255,255,255,0.07)",
        boxShadow: plan.highlight ? "0 0 40px rgba(11,124,143,0.08)" : "none",
      }}
    >
      {/* Popular badge */}
      {plan.highlight && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
        />
      )}

      {/* Card body */}
      <div className="flex flex-col gap-5 p-5 flex-1">

        {/* Top row: name + actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {plan.highlight && (
                <span
                  className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest"
                  style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}44` }}
                >
                  Popular
                </span>
              )}
            </div>
            <EditableText
              value={plan.name}
              onChange={v => set("name", v)}
              placeholder="Plan name"
              className="block font-bold text-white text-lg leading-tight"
            />
            <EditableText
              value={plan.desc}
              onChange={v => set("desc", v)}
              placeholder="Short description"
              className="block text-xs text-white/40 mt-1.5 leading-relaxed"
              multiline
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => set("highlight", !plan.highlight)}
              title={plan.highlight ? "Remove popular" : "Mark as popular"}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/8"
              style={{ color: plan.highlight ? accent : "rgba(255,255,255,0.3)" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 15, fontVariationSettings: plan.highlight ? "'FILL' 1" : "'FILL' 0" }}>star</span>
            </button>
            {canDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Delete plan"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Price */}
        <div
          className="flex items-end justify-between gap-3 px-4 py-3 rounded-xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-baseline gap-1">
            <span className="text-white/30 text-sm font-medium">$</span>
            <EditableText
              value={plan.price}
              onChange={v => set("price", v)}
              placeholder="0"
              className="font-black text-white tracking-tight"
              inputClassName="text-2xl font-black"
              style={{ fontSize: "clamp(1.4rem, 2vw, 1.75rem)" }}
            />
            <span className="text-white/25 text-xs ml-0.5">
              / <EditableText value={plan.period} onChange={v => set("period", v)} placeholder="month" className="text-white/25 text-xs" />
            </span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[9px] text-white/20 uppercase tracking-wider">CTA</span>
            <EditableText
              value={plan.cta}
              onChange={v => set("cta", v)}
              placeholder="Get started"
              className="text-xs font-semibold"
              style={{ color: accent }}
            />
          </div>
        </div>

        {/* Accent color picker */}
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] text-white/25 uppercase tracking-wider shrink-0">Color</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {ACCENT_COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => set("accent", c.value)}
                title={c.label}
                className="size-4 rounded-full transition-all duration-150 hover:scale-125"
                style={{
                  background: c.value,
                  boxShadow: plan.accent === c.value ? `0 0 0 2px rgba(0,0,0,0.5), 0 0 0 3.5px ${c.value}` : "none",
                  transform: plan.accent === c.value ? "scale(1.15)" : undefined,
                }}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />

        {/* Features */}
        <div className="flex flex-col gap-2 flex-1">
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-wider">Features</p>
          <FeatureEditor
            features={plan.features || []}
            onChange={v => set("features", v)}
            accent={accent}
          />
        </div>

        {/* Rate limits */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <button
            onClick={() => setShowRL(v => !v)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors hover:bg-white/3"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-white/30" style={{ fontSize: 13 }}>speed</span>
              <span className="text-xs font-medium text-white/50">Rate Limits</span>
              <div className="flex items-center gap-1 flex-wrap">
                {hasLimits ? (
                  <>
                    {plan.rateLimit?.rpm > 0 && <Badge variant="default" size="sm">{plan.rateLimit.rpm}/min</Badge>}
                    {plan.rateLimit?.rpd > 0 && <Badge variant="default" size="sm">{fmtNum(plan.rateLimit.rpd)}/day</Badge>}
                    {plan.rateLimit?.tpd > 0 && <Badge variant="default" size="sm">{fmtNum(plan.rateLimit.tpd)} tok</Badge>}
                  </>
                ) : (
                  <Badge variant="success" size="sm">Unlimited</Badge>
                )}
              </div>
            </div>
            <span
              className="material-symbols-outlined text-white/25 transition-transform duration-200"
              style={{ fontSize: 14, transform: showRL ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              expand_more
            </span>
          </button>

          {showRL && (
            <div className="px-3 pb-3 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <RateLimitEditor
                rateLimit={plan.rateLimit}
                onChange={v => set("rateLimit", v)}
              />
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => { onDelete(); setConfirmDelete(false); }}
        title="Delete Plan"
        message={`Delete the "${plan.name}" plan? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

/* ══════════════════════════════════════════
   Skeleton
══════════════════════════════════════════ */
function Skeleton() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-40 rounded-lg bg-white/5 animate-pulse" />
          <div className="h-4 w-64 rounded bg-white/4 animate-pulse" />
        </div>
        <div className="flex gap-2">
          {[80, 96, 120].map(w => (
            <div key={w} className="h-9 rounded-lg bg-white/5 animate-pulse" style={{ width: w }} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-[480px] rounded-2xl bg-white/4 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Main Page
══════════════════════════════════════════ */
export default function PricingPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  const notify = useNotificationStore();

  useEffect(() => {
    fetch("/api/pricing")
      .then(r => r.ok ? r.json() : {})
      .then(d => { setPlans(d.plans || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updatePlan = (i, updated) => {
    const next = [...plans];
    next[i] = updated;
    setPlans(next);
    setUnsaved(true);
  };

  const deletePlan = (i) => {
    setPlans(plans.filter((_, idx) => idx !== i));
    setUnsaved(true);
  };

  const addPlan = () => {
    setPlans([...plans, {
      id: `plan-${Date.now()}`,
      name: "New Plan",
      price: "0",
      period: "per month",
      desc: "Plan description",
      highlight: false,
      cta: "Get started",
      accent: "#2cb3d8",
      features: ["Feature 1", "Feature 2"],
      rateLimit: { rpm: 0, rpd: 0, tpd: 0, tpm: 0 },
    }]);
    setUnsaved(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/pricing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plans }),
      });
      if (res.ok) {
        notify.success("Saved — landing page updated");
        setUnsaved(false);
      } else {
        notify.error("Failed to save");
      }
    } catch {
      notify.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefault = async () => {
    if (!confirm("Reset all plans to default?")) return;
    await fetch("/api/pricing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plans: null }),
    });
    const d = await fetch("/api/pricing").then(r => r.json());
    setPlans(d.plans || []);
    setUnsaved(false);
    notify.success("Reset to default");
  };

  if (loading) return <Skeleton />;

  return (
    <div className="flex flex-col gap-6 w-full min-h-full">

      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-semibold text-white sm:text-2xl tracking-tight">Pricing Plans</h1>
            {unsaved && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                style={{ background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}
              >
                Unsaved
              </span>
            )}
          </div>
          <p className="text-sm text-white/40 mt-1">
            Edit plans shown on your landing page. Click any text to edit inline.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <Button size="md" variant="secondary" onClick={resetToDefault} className="whitespace-nowrap">
            Reset Default
          </Button>
          <Button size="md" variant="secondary" icon="add" onClick={addPlan} className="whitespace-nowrap">
            Add Plan
          </Button>
          <Button
            size="md"
            icon="save"
            onClick={save}
            loading={saving}
            className="whitespace-nowrap"
            style={unsaved ? { background: "#0B7C8F" } : undefined}
          >
            Save & Publish
          </Button>
        </div>
      </div>

      {/* ── Info banner ── */}
      <div
        className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-xs"
        style={{ background: "rgba(11,124,143,0.07)", border: "1px solid rgba(11,124,143,0.18)" }}
      >
        <span className="material-symbols-outlined text-primary shrink-0 mt-0.5" style={{ fontSize: 14 }}>info</span>
        <span className="text-white/45 leading-relaxed">
          Click any <span className="text-white/70 font-medium">name, price, description, or feature</span> to edit inline.
          Use the <span className="text-white/70 font-medium">Rate Limits</span> section per plan to set RPM / RPD / token limits.
          Press <span className="text-white/70 font-medium">Save & Publish</span> to update the landing page.
        </span>
      </div>

      {/* ── Plan grid ── */}
      {plans.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-4 rounded-2xl py-20"
          style={{ border: "1px dashed rgba(255,255,255,0.1)" }}
        >
          <span className="material-symbols-outlined text-white/15" style={{ fontSize: 48 }}>payments</span>
          <p className="text-white/30 text-sm">No plans yet</p>
          <Button icon="add" onClick={addPlan}>Add First Plan</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
          {plans.map((plan, i) => (
            <PlanCard
              key={plan.id || i}
              plan={plan}
              index={i}
              onUpdate={updated => updatePlan(i, updated)}
              onDelete={() => deletePlan(i)}
              canDelete={plans.length > 1}
            />
          ))}

          {/* Add plan ghost card */}
          <button
            onClick={addPlan}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl py-16 transition-all duration-200 hover:bg-white/3"
            style={{ border: "1px dashed rgba(255,255,255,0.08)", minHeight: 200 }}
          >
            <span
              className="flex items-center justify-center size-10 rounded-full"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span className="material-symbols-outlined text-white/30" style={{ fontSize: 20 }}>add</span>
            </span>
            <span className="text-xs text-white/25 font-medium">Add Plan</span>
          </button>
        </div>
      )}

      {/* ── Bottom save bar (sticky on mobile) ── */}
      {unsaved && (
        <div
          className="sticky bottom-4 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl sm:hidden"
          style={{
            background: "rgba(8,10,14,0.95)",
            border: "1px solid rgba(11,124,143,0.3)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <span className="text-xs text-white/50">You have unsaved changes</span>
          <Button size="sm" icon="save" onClick={save} loading={saving}>Save</Button>
        </div>
      )}

      {/* ── Desktop bottom save ── */}
      {plans.length > 0 && (
        <div className="hidden sm:flex justify-end pt-2">
          <Button size="md" icon="save" onClick={save} loading={saving}>
            Save & Publish
          </Button>
        </div>
      )}
    </div>
  );
}
