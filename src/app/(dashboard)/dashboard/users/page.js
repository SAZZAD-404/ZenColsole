"use client";

import { useState, useEffect, useCallback } from "react";
import { useNotificationStore } from "@/store/notificationStore";
import Button from "@/shared/components/Button";
import Modal, { ConfirmModal } from "@/shared/components/Modal";
import Input from "@/shared/components/Input";

function timeAgo(ts) {
  if (!ts) return "Never";
  const s = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [userSettings, setUserSettings] = useState({ allowedModels: [], registrationEnabled: true });
  const [allModels, setAllModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, modelsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/v1/models"),
      ]);
      const usersData = await usersRes.json();
      const modelsData = await modelsRes.json();
      setUsers(usersData.users || []);
      setUserSettings(usersData.userSettings || { allowedModels: [], registrationEnabled: true });
      setAllModels(modelsData.data || []);
    } catch {
      addNotification({ type: "error", title: "Error", message: "Failed to load users" });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${deleteUser.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      addNotification({ type: "success", title: "Deleted", message: `${deleteUser.username} removed` });
      setDeleteUser(null);
      load();
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: err.message });
    } finally {
      setDeleting(false);
    }
  };

  const toggleActive = async (user) => {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update");
      addNotification({ type: "success", title: "Updated", message: `${user.username} ${!user.isActive ? "activated" : "deactivated"}` });
      load();
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: err.message });
    }
  };

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-semibold text-white tracking-tight" style={{ fontSize: 22, letterSpacing: "-0.03em" }}>Users</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>
            {loading ? "Loading..." : `${users.length} registered user${users.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon="tune" onClick={() => setShowSettings(true)}>
            User Settings
          </Button>
          <Button variant="primary" size="sm" icon="person_add" onClick={() => setShowCreate(true)}>
            Add User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat label="Total" value={users.length} icon="group" />
        <MiniStat label="Active" value={users.filter((u) => u.isActive).length} icon="check_circle" color="#34d399" />
        <MiniStat label="Inactive" value={users.filter((u) => !u.isActive).length} icon="block" color="#f87171" />
        <MiniStat label="Admins" value={users.filter((u) => u.role === "admin").length} icon="admin_panel_settings" color="#fbbf24" />
      </div>

      {/* User Settings summary */}
      <div className="flex items-center gap-4 px-4 py-3 rounded-[12px]" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: "rgba(255,255,255,0.3)" }}>settings</span>
        <div className="flex items-center gap-6 flex-1 flex-wrap">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Registration:</span>
            <span className="px-2 py-0.5 rounded-full font-semibold" style={{ fontSize: 11, background: userSettings.registrationEnabled ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)", color: userSettings.registrationEnabled ? "#34d399" : "#f87171", border: `1px solid ${userSettings.registrationEnabled ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}` }}>
              {userSettings.registrationEnabled ? "Open" : "Closed"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Model access:</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
              {userSettings.allowedModels.length === 0 ? "All models" : `${userSettings.allowedModels.length} model${userSettings.allowedModels.length !== 1 ? "s" : ""} whitelisted`}
            </span>
          </div>
        </div>
        <button onClick={() => setShowSettings(true)} style={{ fontSize: 12, color: "#2cb3d8" }}
          className="hover:opacity-70 transition-opacity">Edit →</button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined" style={{ fontSize: 16, color: "rgba(255,255,255,0.25)" }}>search</span>
        <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-4 rounded-[9px] text-white text-[13px] outline-none"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          onFocus={(e) => { e.target.style.border = "1px solid rgba(11,124,143,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(11,124,143,0.1)"; }}
          onBlur={(e) => { e.target.style.border = "1px solid rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }} />
      </div>

      {/* Table */}
      <div className="rounded-[16px] overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="grid grid-cols-[1fr_1fr_80px_100px_100px_80px] gap-4 px-5 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
          {["User", "Email", "Role", "Status", "Last Login", "Actions"].map((h) => (
            <span key={h} className="font-semibold uppercase tracking-wide" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="space-y-0">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse mx-5 my-3 rounded-[8px]" style={{ background: "rgba(255,255,255,0.03)" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="material-symbols-outlined mb-3" style={{ fontSize: 36, color: "rgba(255,255,255,0.12)" }}>group</span>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>{search ? "No users match your search" : "No users yet"}</p>
          </div>
        ) : (
          filtered.map((u, i) => (
            <div key={u.id}
              className="grid grid-cols-[1fr_1fr_80px_100px_100px_80px] gap-4 items-center px-5 py-3.5 transition-colors"
              style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center size-8 rounded-full font-semibold text-white shrink-0"
                  style={{ background: "linear-gradient(135deg, #0B7C8F, #2cb3d8)", fontSize: 13 }}>
                  {u.username[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-white truncate" style={{ fontSize: 13 }}>{u.username}</p>
                  <p className="truncate" style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                    Joined {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="truncate" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{u.email}</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full w-fit"
                style={{ fontSize: 11, fontWeight: 600, background: u.role === "admin" ? "rgba(251,191,36,0.1)" : "rgba(255,255,255,0.06)", color: u.role === "admin" ? "#fbbf24" : "rgba(255,255,255,0.4)", border: `1px solid ${u.role === "admin" ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.08)"}` }}>
                {u.role}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full w-fit"
                style={{ fontSize: 11, fontWeight: 600, background: u.isActive ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)", color: u.isActive ? "#34d399" : "#f87171", border: `1px solid ${u.isActive ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)"}` }}>
                <span className="size-1.5 rounded-full" style={{ background: u.isActive ? "#34d399" : "#f87171" }} />
                {u.isActive ? "Active" : "Inactive"}
              </span>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{timeAgo(u.lastLoginAt)}</p>
              <div className="flex items-center gap-1">
                <ActionBtn icon="edit" title="Edit" onClick={() => setEditUser(u)} />
                <ActionBtn icon={u.isActive ? "block" : "check_circle"} title={u.isActive ? "Deactivate" : "Activate"} onClick={() => toggleActive(u)} color={u.isActive ? "#f87171" : "#34d399"} />
                <ActionBtn icon="delete" title="Delete" onClick={() => setDeleteUser(u)} color="#f87171" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <CreateUserModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreated={load} />
      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSaved={load} />}
      <UserSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        userSettings={userSettings}
        allModels={allModels}
        onSaved={(s) => { setUserSettings(s); load(); }}
      />
      <ConfirmModal
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteUser?.username}"? This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}

function MiniStat({ label, value, icon, color }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-[12px]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <span className="material-symbols-outlined" style={{ fontSize: 18, color: color || "rgba(255,255,255,0.3)", fontVariationSettings: "'FILL' 0, 'wght' 300" }}>{icon}</span>
      <div>
        <p className="font-bold text-white" style={{ fontSize: 20, letterSpacing: "-0.03em" }}>{value}</p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{label}</p>
      </div>
    </div>
  );
}

function ActionBtn({ icon, title, onClick, color }) {
  return (
    <button onClick={onClick} title={title}
      className="flex items-center justify-center size-7 rounded-[7px] transition-all duration-150 cursor-pointer"
      style={{ color: "rgba(255,255,255,0.25)" }}
      onMouseEnter={(e) => { e.currentTarget.style.color = color || "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.25)"; e.currentTarget.style.background = "transparent"; }}>
      <span className="material-symbols-outlined" style={{ fontSize: 15, fontVariationSettings: "'FILL' 0, 'wght' 300" }}>{icon}</span>
    </button>
  );
}

function CreateUserModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "user" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const set = (field) => (val) => {
    setForm((p) => ({ ...p, [field]: typeof val === "string" ? val : val.target.value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleCreate = async () => {
    const errs = {};
    if (!form.username || form.username.length < 3) errs.username = "At least 3 characters";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Valid email required";
    if (!form.password || form.password.length < 6) errs.password = "At least 6 characters";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      addNotification({ type: "success", title: "Created", message: `${form.username} added successfully` });
      setForm({ username: "", email: "", password: "", role: "user" });
      onCreated();
      onClose();
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add User" size="sm"
      footer={<><Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>Cancel</Button><Button variant="primary" size="sm" onClick={handleCreate} loading={loading}>Create User</Button></>}>
      <div className="space-y-4">
        <Input label="Username" value={form.username} onChange={set("username")} placeholder="johndoe" error={errors.username} required />
        <Input label="Email" type="email" value={form.email} onChange={set("email")} placeholder="john@example.com" error={errors.email} required />
        <Input label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Min 6 characters" error={errors.password} required />
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.4)" }}>Role</label>
          <select value={form.role} onChange={set("role")} className="w-full h-10 px-3 rounded-[10px] text-white text-[13px] outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <option value="user" style={{ background: "#141820" }}>User</option>
            <option value="admin" style={{ background: "#141820" }}>Admin</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}

function EditUserModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState({ username: user.username, email: user.email, role: user.role, password: "" });
  const [loading, setLoading] = useState(false);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = { username: form.username, email: form.email, role: form.role };
      if (form.password) payload.password = form.password;
      const res = await fetch(`/api/users/${user.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      addNotification({ type: "success", title: "Saved", message: `${form.username} updated` });
      onSaved();
      onClose();
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Edit — ${user.username}`} size="sm"
      footer={<><Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>Cancel</Button><Button variant="primary" size="sm" onClick={handleSave} loading={loading}>Save</Button></>}>
      <div className="space-y-4">
        <Input label="Username" value={form.username} onChange={set("username")} required />
        <Input label="Email" type="email" value={form.email} onChange={set("email")} required />
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.4)" }}>Role</label>
          <select value={form.role} onChange={set("role")} className="w-full h-10 px-3 rounded-[10px] text-white text-[13px] outline-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <option value="user" style={{ background: "#141820" }}>User</option>
            <option value="admin" style={{ background: "#141820" }}>Admin</option>
          </select>
        </div>
        <Input label="New Password (optional)" type="password" value={form.password} onChange={set("password")} placeholder="Leave blank to keep current" hint="Only fill if you want to change the password" />
      </div>
    </Modal>
  );
}

function UserSettingsModal({ isOpen, onClose, userSettings, allModels, onSaved }) {
  const [regEnabled, setRegEnabled] = useState(userSettings.registrationEnabled);
  const [allowed, setAllowed] = useState(userSettings.allowedModels || []);
  const [modelSearch, setModelSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    setRegEnabled(userSettings.registrationEnabled);
    setAllowed(userSettings.allowedModels || []);
  }, [userSettings]);

  const toggleModel = (modelId) => {
    setAllowed((prev) =>
      prev.includes(modelId) ? prev.filter((m) => m !== modelId) : [...prev, modelId]
    );
  };

  const filteredModels = allModels.filter((m) =>
    m.id.toLowerCase().includes(modelSearch.toLowerCase())
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationEnabled: regEnabled, allowedModels: allowed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      addNotification({ type: "success", title: "Saved", message: "User settings updated" });
      onSaved(data.userSettings);
      onClose();
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Settings" size="lg"
      footer={<><Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>Cancel</Button><Button variant="primary" size="sm" onClick={handleSave} loading={saving}>Save Settings</Button></>}>
      <div className="space-y-5">
        {/* Registration toggle */}
        <div className="flex items-center justify-between p-4 rounded-[12px]" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <p className="font-semibold text-white" style={{ fontSize: 13 }}>Open Registration</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Allow new users to sign up at /user/signup</p>
          </div>
          <button onClick={() => setRegEnabled(!regEnabled)}
            className="relative w-10 h-5.5 rounded-full transition-all duration-200 shrink-0"
            style={{ background: regEnabled ? "#0B7C8F" : "rgba(255,255,255,0.1)", width: 40, height: 22 }}>
            <span className="absolute top-0.5 rounded-full transition-all duration-200 bg-white"
              style={{ width: 18, height: 18, left: regEnabled ? 20 : 2 }} />
          </button>
        </div>

        {/* Model whitelist */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold text-white" style={{ fontSize: 13 }}>Model Whitelist</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                {allowed.length === 0 ? "All models visible to users (no restriction)" : `${allowed.length} model${allowed.length !== 1 ? "s" : ""} selected`}
              </p>
            </div>
            {allowed.length > 0 && (
              <button onClick={() => setAllowed([])} style={{ fontSize: 12, color: "#f87171" }} className="hover:opacity-70 transition-opacity">
                Clear all
              </button>
            )}
          </div>

          <div className="relative mb-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined" style={{ fontSize: 15, color: "rgba(255,255,255,0.25)" }}>search</span>
            <input type="text" placeholder="Search models..." value={modelSearch} onChange={(e) => setModelSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-[8px] text-white text-[12px] outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} />
          </div>

          <div className="rounded-[10px] overflow-hidden max-h-64 overflow-y-auto custom-scrollbar" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            {filteredModels.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>No models found</p>
              </div>
            ) : (
              filteredModels.map((m) => {
                const checked = allowed.includes(m.id);
                return (
                  <label key={m.id} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleModel(m.id)}
                      className="rounded" style={{ accentColor: "#0B7C8F", width: 14, height: 14 }} />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-white truncate" style={{ fontSize: 12 }}>{m.id}</p>
                    </div>
                    <span className="shrink-0 px-1.5 py-0.5 rounded" style={{ fontSize: 10, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.3)" }}>
                      {m.owned_by}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
