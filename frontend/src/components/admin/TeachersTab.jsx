"use client";
import { useState, useMemo } from "react";
import { Search, Mail, Phone, BookOpen, Calendar, Edit2, Trash2, MoreVertical, Plus, User, KeyRound, ShieldAlert } from "lucide-react";
import {
  inp,
  btnPrimary,
  btnGhost,
  Field,
  FormModal,
  ConfirmModal,
  EmptyState,
  Avatar,
  PageHeader,
  card,
  Dropdown,
  DropdownItem,
} from "./AdminUI";
import API from "@/config/api";
const BLANK = { name: "", email: "", password: "", phone: "", subject: "" };

export default function TeachersTab({ teachers, batches = [], schedules = [], token, onRefresh, flash }) {
  const H = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [resetPw, setResetPw] = useState(null); // { teacher } or null
  const [tempPw, setTempPw] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const teacherStats = useMemo(() => {
    const map = {};
    teachers.forEach((t) => {
      const id = t._id;
      map[id] = {
        batches: batches.filter((b) => (b.teacher?._id || b.teacher) === id),
        classCount: schedules.filter((s) => (s.teacher?._id || s.teacher) === id).length,
      };
    });
    return map;
  }, [teachers, batches, schedules]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return teachers;
    return teachers.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q)
    );
  }, [teachers, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(BLANK);
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({ name: t.name, email: t.email, password: "", phone: t.phone || "", subject: t.subject || "" });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.name?.trim() || (!editing && !form.email?.trim())) return flash("❌ Name and email are required");
    setSaving(true);
    const url = editing ? `${API}/api/admin/teachers/${editing._id}` : `${API}/api/admin/teachers`;
    const body = editing
      ? { name: form.name, phone: form.phone, subject: form.subject }
      : {
          name: form.name,
          email: form.email,
          password: form.password || "Teacher@123",
          phone: form.phone,
          subject: form.subject,
        };
    const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: H, body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) {
      flash(editing ? "✅ Teacher updated successfully" : "✅ Teacher created successfully");
      setShowModal(false);
      setForm(BLANK);
      setEditing(null);
      onRefresh();
    } else {
      const d = await res.json();
      flash("❌ " + (d.message || "Save failed"));
    }
  };

  const valid = form.name?.trim() && (editing || form.email?.trim());

  const handleResetPassword = async () => {
    if (!tempPw.trim() || tempPw.trim().length < 6) {
      flash("❌ Temporary password must be at least 6 characters");
      return;
    }
    setResetLoading(true);
    const res = await fetch(`${API}/api/admin/teachers/${resetPw.teacher._id}/reset-password`, {
      method: "PUT",
      headers: H,
      body: JSON.stringify({ tempPassword: tempPw.trim() }),
    });
    setResetLoading(false);
    if (res.ok) {
      flash(`✅ Password reset for ${resetPw.teacher.name}. They must set a new password on next login.`);
      setResetPw(null);
      setTempPw("");
      onRefresh();
    } else {
      const d = await res.json();
      flash("❌ " + (d.message || "Reset failed"));
    }
  };

  return (
    <div className="space-y-5">
      {confirm && (
        <ConfirmModal
          message={confirm.msg}
          onConfirm={confirm.onOk}
          onCancel={() => setConfirm(null)}
          loading={confirm.loading}
        />
      )}

      {/* Premium Faculty Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_1px_4px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
        <div>
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none tracking-tight">Faculty Directory</h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">Institute lecturers — subjects, contact &amp; batch assignments</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            {teachers.length} {teachers.length === 1 ? "Faculty" : "Faculty Members"}
          </span>
          <button onClick={openCreate} className={`${btnPrimary} flex items-center gap-1.5`}>
            <Plus className="w-4 h-4" /> Add Teacher
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or subject..."
          className="bg-transparent border-0 outline-none text-xs w-full text-slate-700 dark:text-slate-200 focus:ring-0 font-bold placeholder-slate-400 dark:placeholder-slate-550"
        />
      </div>

      {filtered.length === 0 ? (
        <div className={card}>
          <EmptyState
            icon="👨‍🏫"
            title="No faculty members found"
            subtitle={search ? "Try searching for another name or keyword" : "Add your first teacher to assign batches"}
            action={!search && <button onClick={openCreate} className={btnPrimary}>+ Add Teacher</button>}
          />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((t) => {
            const stats = teacherStats[t._id] || { batches: [], classCount: 0 };
            return (
              <div
                key={t._id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 flex flex-col gap-4 group relative shadow-[0_2px_8px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.07)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-200 ease-out"
              >
                {/* Card Header: Avatar + Name + Subject + Menu */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar name={t.name} size="md" className="w-10 h-10 text-xs shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-150 truncate">
                        {t.name}
                      </h3>
                      <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 truncate mt-0.5">
                        <Mail className="w-3 h-3 shrink-0" /> {t.email}
                      </p>
                    </div>
                  </div>
                  <Dropdown
                    trigger={
                      <button className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shrink-0" aria-label="Open menu">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    }
                  >
                    <DropdownItem onClick={() => openEdit(t)}>
                      <Edit2 className="w-3.5 h-3.5" /> Edit details
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => { setResetPw({ teacher: t }); setTempPw(""); }}
                    >
                      <KeyRound className="w-3.5 h-3.5" /> Reset password
                    </DropdownItem>
                    <DropdownItem
                      onClick={() =>
                        setConfirm({
                          msg: `Are you sure you want to delete ${t.name}?`,
                          onOk: async () => {
                            setConfirm((c) => ({ ...c, loading: true }));
                            await fetch(`${API}/api/admin/teachers/${t._id}`, { method: "DELETE", headers: H });
                            flash("✅ Teacher deleted");
                            setConfirm(null);
                            onRefresh();
                          },
                        })
                      }
                      className="text-red-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove teacher
                    </DropdownItem>
                  </Dropdown>
                </div>
                {/* isFirstLogin badge */}
                {t.isFirstLogin && (
                  <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg px-2.5 py-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wide">Password Setup Pending</span>
                  </div>
                )}

                {/* Subject Badge */}
                {t.subject && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3 h-3 text-slate-350 dark:text-slate-500 shrink-0" />
                    <span className="inline-flex items-center whitespace-nowrap text-[9px] font-extrabold bg-indigo-50 dark:bg-indigo-950/25 text-indigo-600 dark:text-indigo-400 border border-indigo-100/60 dark:border-indigo-900/40 px-2.5 py-1 rounded-full uppercase tracking-widest">
                      {t.subject}
                    </span>
                  </div>
                )}

                {/* Info Panels: Phone + Workload */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-xl px-3 py-2.5 border border-slate-100/60 dark:border-slate-800/50">
                    <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Phone</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-[11px] truncate">
                      <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                      {t.phone || "—"}
                    </p>
                  </div>
                  <div className="bg-blue-50/60 dark:bg-blue-950/20 rounded-xl px-3 py-2.5 border border-blue-100/50 dark:border-blue-900/30">
                    <p className="text-[9px] font-extrabold text-blue-400 dark:text-blue-500 uppercase tracking-widest mb-1">Workload</p>
                    <p className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 text-[11px]">
                      <Calendar className="w-3 h-3 text-blue-500/80 shrink-0" />
                      {stats.classCount} sessions/wk
                    </p>
                  </div>
                </div>

                {/* Batch Assignment Section */}
                {stats.batches.length > 0 && (
                  <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
                    <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Assigned Batches</p>
                    <div className="flex flex-wrap gap-1.5">
                      {stats.batches.map((b) => (
                        <span
                          key={b._id}
                          className="inline-flex items-center text-[9px] font-bold bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 text-slate-600 dark:text-slate-350 px-2.5 py-1 rounded-lg tracking-wide"
                        >
                          {b.batchName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <FormModal
          title={editing ? "Edit Teacher details" : "Add New Faculty Member"}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
            setForm(BLANK);
          }}
          onSubmit={save}
          submitLabel={editing ? "Update details" : "Register teacher"}
          loading={saving}
          disabled={!valid}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Full Name" required className="sm:col-span-2">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inp} placeholder="e.g. Tabarak Sir" />
            </Field>
            <Field label="Email Address" required={!editing}>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inp} placeholder="faculty@commercegyan.com" disabled={!!editing} />
            </Field>
            {!editing && (
              <Field label="Temporary Password" required>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inp} placeholder="Min. 6 chars — teacher will change this" />
              </Field>
            )}
            <Field label="Phone Contact">
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inp} placeholder="10-digit number" />
            </Field>
            <Field label="Department Subject">
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inp} placeholder="e.g. Commerce, Accounts, Economics" />
            </Field>
          </div>
          {!editing && (
            <p className="text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-1 flex items-start gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Teacher will be required to set their own password on first login.
            </p>
          )}
        </FormModal>
      )}

      {/* Reset Password Modal */}
      {resetPw && (
        <FormModal
          title="Reset Teacher Password"
          onClose={() => { setResetPw(null); setTempPw(""); }}
          onSubmit={handleResetPassword}
          submitLabel="Reset Password"
          loading={resetLoading}
          disabled={!tempPw.trim() || tempPw.trim().length < 6}
        >
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-black text-amber-700">Reset password for {resetPw.teacher.name}</p>
                <p className="text-[11px] font-semibold text-amber-600 mt-0.5">The teacher will be required to set a new personal password on their next login.</p>
              </div>
            </div>
            <Field label="New Temporary Password" required>
              <input
                type="text"
                value={tempPw}
                onChange={(e) => setTempPw(e.target.value)}
                className={inp}
                placeholder="Min. 6 characters — share with teacher"
                autoFocus
              />
            </Field>
          </div>
        </FormModal>
      )}
    </div>
  );
}