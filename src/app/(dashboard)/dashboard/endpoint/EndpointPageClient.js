"use client";

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Card, Button, Input, Modal, CardSkeleton, Toggle } from "@/shared/components";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";

const CAVEMAN_LEVELS = [
  { id: "lite",  label: "Lite",  desc: "Drop filler, keep grammar"       },
  { id: "full",  label: "Full",  desc: "Drop articles, fragments OK"      },
  { id: "ultra", label: "Ultra", desc: "Telegraphic, max compression"     },
];

/* ─────────────────────────────────────────
   Reusable: copy-able endpoint row
───────────────────────────────────────── */
function EndpointRow({ label, url, copyId, copied, onCopy }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="text-xs font-mono px-2 py-1 rounded shrink-0 min-w-[72px] text-center font-medium"
        style={{ background: "rgba(11,124,143,0.1)", color: "#2cb3d8", border: "1px solid rgba(11,124,143,0.15)" }}
      >
        {label}
      </span>
      <Input value={url} readOnly className="flex-1 font-mono text-sm" />
      <button
        onClick={() => onCopy(url, copyId)}
        className="p-2 rounded transition-colors shrink-0"
        style={{ color: copied === copyId ? "#2cb3d8" : "rgba(255,255,255,0.3)" }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        title="Copy"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          {copied === copyId ? "check" : "content_copy"}
        </span>
      </button>
    </div>
  );
}

EndpointRow.propTypes = {
  label: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  copyId: PropTypes.string.isRequired,
  copied: PropTypes.any,
  onCopy: PropTypes.func.isRequired,
};

/* ─────────────────────────────────────────
   Reusable: setting row with toggle
───────────────────────────────────────── */
function SettingRow({ icon, title, desc, checked, onChange, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <span className="material-symbols-outlined shrink-0 mt-0.5" style={{ fontSize: 18, color: "rgba(255,255,255,0.35)" }}>
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-white/80">{title}</p>
          {desc && <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{desc}</p>}
          {children && <div className="mt-2">{children}</div>}
        </div>
      </div>
      {onChange !== undefined && (
        <Toggle checked={checked} onChange={onChange} />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Main page
───────────────────────────────────────── */
export default function EndpointPageClient({ machineId }) {
  const [keys, setKeys]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [newKeyName, setNewKeyName]   = useState("");
  const [createdKey, setCreatedKey]   = useState(null);
  const [visibleKeys, setVisibleKeys] = useState(new Set());
  
  // Form fields for create/edit
  const [formName, setFormName] = useState("");
  const [formUsageLimit, setFormUsageLimit] = useState("");
  const [formUnlimitedUsage, setFormUnlimitedUsage] = useState(true);
  const [formRateLimitRpm, setFormRateLimitRpm] = useState("");
  const [formRateLimitRph, setFormRateLimitRph] = useState("");
  const [formRateLimitRpd, setFormRateLimitRpd] = useState("");
  const [formNoRateLimit, setFormNoRateLimit] = useState(true);
  const [formExpiryOption, setFormExpiryOption] = useState("never");
  const [formCustomExpiry, setFormCustomExpiry] = useState("");

  const [requireApiKey, setRequireApiKey]   = useState(false);
  const [requireLogin, setRequireLogin]     = useState(true);
  const [rtkEnabled, setRtkEnabledState]    = useState(true);
  const [cavemanEnabled, setCavemanEnabled] = useState(false);
  const [cavemanLevel, setCavemanLevel]     = useState("full");

  const [baseUrl, setBaseUrl] = useState("/v1");
  const { copied, copy } = useCopyToClipboard();

  /* ── Hydration-safe base URL ── */
  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(`${window.location.origin}/v1`);
    }
  }, []);

  /* ── Load data ── */
  useEffect(() => {
    Promise.all([
      fetch("/api/keys").then(r => r.ok ? r.json() : { keys: [] }),
      fetch("/api/settings").then(r => r.ok ? r.json() : {}),
    ]).then(([keysData, settings]) => {
      setKeys(keysData.keys || []);
      setRequireApiKey(settings.requireApiKey || false);
      setRequireLogin(settings.requireLogin !== false);
      setRtkEnabledState(settings.rtkEnabled !== false);
      setCavemanEnabled(!!settings.cavemanEnabled);
      setCavemanLevel(settings.cavemanLevel || "full");
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  /* ── Settings helpers ── */
  const patchSetting = async (patch) => {
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    } catch { /* ignore */ }
  };

  const handleRequireApiKey = async (v) => { setRequireApiKey(v); await patchSetting({ requireApiKey: v }); };
  const handleRequireLogin  = async (v) => { setRequireLogin(v);  await patchSetting({ requireLogin: v });  };
  const handleRtkEnabled    = async (v) => { setRtkEnabledState(v); await patchSetting({ rtkEnabled: v }); };
  const handleCavemanEnabled = (v) => { setCavemanEnabled(v); patchSetting({ cavemanEnabled: v }); };
  const handleCavemanLevel   = (l) => { setCavemanLevel(l);   patchSetting({ cavemanLevel: l });   };

  /* ── API key helpers ── */
  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    try {
      const res  = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreatedKey(data.key);
        const keysRes  = await fetch("/api/keys");
        const keysData = await keysRes.json();
        setKeys(keysData.keys || []);
        setNewKeyName("");
        setShowAddModal(false);
      }
    } catch { /* ignore */ }
  };

  const handleDeleteKey = async (id) => {
    if (!confirm("Delete this API key?")) return;
    try {
      const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
      if (res.ok) {
        setKeys(prev => prev.filter(k => k.id !== id));
        setVisibleKeys(prev => { const n = new Set(prev); n.delete(id); return n; });
      }
    } catch { /* ignore */ }
  };

  const handleToggleKey = async (id, isActive) => {
    try {
      const res = await fetch(`/api/keys/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (res.ok) setKeys(prev => prev.map(k => k.id === id ? { ...k, isActive } : k));
    } catch { /* ignore */ }
  };

  const maskKey = (k) => k?.length > 8 ? k.slice(0, 8) + "•••••••••••••••••" : k;
  const toggleKeyVisibility = (id) => {
    setVisibleKeys(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* ══ 1. API Endpoint ══════════════════════════════════════════ */}
      <Card>
        <div className="flex items-center gap-2.5 mb-5">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>api</span>
          <h2 className="text-base font-semibold text-white tracking-tight">API Endpoint</h2>
        </div>

        <div className="flex flex-col gap-3">
          <EndpointRow
            label="Base URL"
            url={baseUrl}
            copyId="base_url"
            copied={copied}
            onCopy={copy}
          />
          <EndpointRow
            label="Chat"
            url={`${baseUrl}/chat/completions`}
            copyId="chat_url"
            copied={copied}
            onCopy={copy}
          />
          <EndpointRow
            label="Models"
            url={`${baseUrl}/models`}
            copyId="models_url"
            copied={copied}
            onCopy={copy}
          />
        </div>

        {/* Quick-start snippet */}
        <div
          className="mt-5 rounded-xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>Quick start</span>
            <button
              onClick={() => copy(`from openai import OpenAI\n\nclient = OpenAI(\n    base_url="${baseUrl}",\n    api_key="your-api-key",\n)\n\nresponse = client.chat.completions.create(\n    model="anthropic/claude-opus-4.7",\n    messages=[{"role": "user", "content": "Hello!"}],\n)`, "snippet")}
              className="flex items-center gap-1 text-xs transition-colors"
              style={{ color: copied === "snippet" ? "#2cb3d8" : "rgba(255,255,255,0.3)" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                {copied === "snippet" ? "check" : "content_copy"}
              </span>
              {copied === "snippet" ? "Copied" : "Copy"}
            </button>
          </div>
          <pre
            className="px-4 py-4 text-xs leading-relaxed overflow-x-auto"
            style={{ fontFamily: "var(--font-geist-mono), monospace", color: "rgba(255,255,255,0.55)" }}
          >
{`from openai import OpenAI

client = OpenAI(
    base_url="${baseUrl}",
    api_key="your-api-key",
)

response = client.chat.completions.create(
    model="anthropic/claude-opus-4.7",
    messages=[{"role": "user", "content": "Hello!"}],
)`}
          </pre>
        </div>
      </Card>

      {/* ══ 2. API Keys ══════════════════════════════════════════════ */}
      <Card id="api-keys">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>vpn_key</span>
            <h2 className="text-base font-semibold text-white tracking-tight">API Keys</h2>
          </div>
          <Button icon="add" size="sm" onClick={() => setShowAddModal(true)}>
            Create Key
          </Button>
        </div>

        {/* Require API key toggle */}
        <div
          className="flex items-center justify-between px-4 py-3 rounded-xl mb-4"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div>
            <p className="text-sm font-medium text-white/80">Require API key</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
              Reject requests that don't include a valid key
            </p>
          </div>
          <Toggle checked={requireApiKey} onChange={handleRequireApiKey} />
        </div>

        {/* Key list */}
        {keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-full"
              style={{ background: "rgba(11,124,143,0.1)" }}
            >
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 24 }}>vpn_key</span>
            </div>
            <p className="text-sm font-medium text-white/60">No API keys yet</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Create a key to authenticate requests</p>
            <Button icon="add" size="sm" onClick={() => setShowAddModal(true)}>Create Key</Button>
          </div>
        ) : (
          <div className="flex flex-col divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {keys.map(key => (
              <div
                key={key.id}
                className="group flex items-center justify-between py-3.5 gap-3"
                style={{ opacity: key.isActive === false ? 0.55 : 1 }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-white/80">{key.name}</p>
                    {key.isActive === false && (
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}
                      >
                        Paused
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <code className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {visibleKeys.has(key.id) ? key.key : maskKey(key.key)}
                    </code>
                    <button
                      onClick={() => toggleKeyVisibility(key.id)}
                      className="p-0.5 rounded opacity-0 group-hover:opacity-100 transition-all"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                      title={visibleKeys.has(key.id) ? "Hide" : "Show"}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                        {visibleKeys.has(key.id) ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                    <button
                      onClick={() => copy(key.key, key.id)}
                      className="p-0.5 rounded opacity-0 group-hover:opacity-100 transition-all"
                      style={{ color: copied === key.id ? "#2cb3d8" : "rgba(255,255,255,0.3)" }}
                      title="Copy"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                        {copied === key.id ? "check" : "content_copy"}
                      </span>
                    </button>
                  </div>
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>
                    Created {new Date(key.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Toggle
                    size="sm"
                    checked={key.isActive ?? true}
                    onChange={(checked) => {
                      if ((key.isActive ?? true) && !checked) {
                        if (confirm(`Pause "${key.name}"? It can be resumed later.`)) handleToggleKey(key.id, checked);
                      } else {
                        handleToggleKey(key.id, checked);
                      }
                    }}
                    title={key.isActive ? "Pause" : "Resume"}
                  />
                  <button
                    onClick={() => handleDeleteKey(key.id)}
                    className="p-1.5 rounded opacity-0 group-hover:opacity-100 transition-all"
                    style={{ color: "#f87171" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(248,113,113,0.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ══ 3. Token Savers ══════════════════════════════════════════ */}
      <Card>
        <div className="flex items-center gap-2.5 mb-1">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>compress</span>
          <h2 className="text-base font-semibold text-white tracking-tight">Token Savers</h2>
        </div>
        <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
          Reduce token usage before requests reach the model.
        </p>

        <div className="flex flex-col">
          {/* RTK */}
          <SettingRow
            icon="build"
            title="RTK — Compress tool output"
            desc="Compresses git diff, grep, ls, tree, and log outputs before sending to the model. Saves 20–40% input tokens per request."
            checked={rtkEnabled}
            onChange={handleRtkEnabled}
          />

          {/* Caveman */}
          <SettingRow
            icon="chat_bubble"
            title="Caveman — Compress LLM output"
            desc="Injects a terse-style system prompt so the model replies in compressed, substance-preserving language. Saves up to 65% output tokens."
            checked={cavemanEnabled}
            onChange={handleCavemanEnabled}
          >
            {cavemanEnabled && (
              <div className="flex items-center gap-1.5 mt-2">
                {CAVEMAN_LEVELS.map(lvl => (
                  <button
                    key={lvl.id}
                    onClick={() => handleCavemanLevel(lvl.id)}
                    title={lvl.desc}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                    style={
                      cavemanLevel === lvl.id
                        ? { background: "rgba(11,124,143,0.15)", color: "#2cb3d8", borderColor: "rgba(11,124,143,0.3)" }
                        : { background: "transparent", color: "rgba(255,255,255,0.35)", borderColor: "rgba(255,255,255,0.08)" }
                    }
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            )}
          </SettingRow>
        </div>
      </Card>

      {/* ══ 4. Security ══════════════════════════════════════════════ */}
      <Card>
        <div className="flex items-center gap-2.5 mb-1">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>security</span>
          <h2 className="text-base font-semibold text-white tracking-tight">Security</h2>
        </div>
        <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
          Control access to the dashboard and API.
        </p>

        <div className="flex flex-col">
          <SettingRow
            icon="lock"
            title="Require dashboard login"
            desc="Protect the dashboard with a password. Disable only on trusted private networks."
            checked={requireLogin}
            onChange={handleRequireLogin}
          />
          <div style={{ borderBottom: "none" }}>
            <SettingRow
              icon="key"
              title="Require API key for all requests"
              desc="Every API request must include a valid key in the Authorization header."
              checked={requireApiKey}
              onChange={handleRequireApiKey}
            />
          </div>
        </div>
      </Card>

      {/* ══ Create Key Modal ══════════════════════════════════════════ */}
      <Modal
        isOpen={showAddModal}
        title="Create API Key"
        onClose={() => { setShowAddModal(false); setNewKeyName(""); }}
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Key name"
            value={newKeyName}
            onChange={e => setNewKeyName(e.target.value)}
            placeholder="e.g. Production"
            onKeyDown={e => { if (e.key === "Enter") handleCreateKey(); }}
            autoFocus
          />
          <div className="flex gap-2">
            <Button onClick={handleCreateKey} fullWidth disabled={!newKeyName.trim()}>
              Create
            </Button>
            <Button onClick={() => { setShowAddModal(false); setNewKeyName(""); }} variant="ghost" fullWidth>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* ══ Created Key Modal ════════════════════════════════════════ */}
      <Modal
        isOpen={!!createdKey}
        title="API Key Created"
        onClose={() => setCreatedKey(null)}
      >
        <div className="flex flex-col gap-4">
          <div
            className="px-3 py-2.5 rounded-xl"
            style={{ background: "rgba(11,124,143,0.07)", border: "1px solid rgba(11,124,143,0.15)" }}
          >
            <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
              Copy this key now — it won't be shown again.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono break-all" style={{ color: "#2cb3d8" }}>
                {createdKey}
              </code>
              <button
                onClick={() => copy(createdKey, "new_key")}
                className="p-1.5 rounded shrink-0 transition-colors"
                style={{ color: copied === "new_key" ? "#2cb3d8" : "rgba(255,255,255,0.4)" }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  {copied === "new_key" ? "check" : "content_copy"}
                </span>
              </button>
            </div>
          </div>
          <Button onClick={() => setCreatedKey(null)} fullWidth>Done</Button>
        </div>
      </Modal>

    </div>
  );
}

EndpointPageClient.propTypes = {
  machineId: PropTypes.string,
};
