"use client";
import { useState, useMemo } from "react";
import { Search, Plus, Edit2, Trash2, Award, Calendar, MoreVertical } from "lucide-react";
import {
  inp,
  btnPrimary,
  Field,
  FormModal,
  ConfirmModal,
  EmptyState,
  PageHeader,
  card,
  Avatar,
  Dropdown,
  DropdownItem,
} from "./AdminUI";

const API = "http://localhost:5000";
const BLANK = { name: "", score: "", course: "Commerce", year: new Date().getFullYear().toString(), imageUrl: "", rank: 0, isActive: true };

export default function AchieversTab({ achievers, token, onRefresh, flash }) {
  const H = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return achievers;
    return achievers.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.score?.toLowerCase().includes(q) ||
        a.course?.toLowerCase().includes(q) ||
        a.year?.toLowerCase().includes(q)
    );
  }, [achievers, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(BLANK);
    setShowModal(true);
  };

  const openEdit = (a) => {
    setEditing(a);
    setForm({
      name: a.name,
      score: a.score,
      course: a.course || "Commerce",
      year: a.year || new Date().getFullYear().toString(),
      imageUrl: a.imageUrl || "",
      rank: a.rank !== undefined ? a.rank : 0,
      isActive: a.isActive !== undefined ? a.isActive : true,
    });
    setShowModal(true);
  };

  const save = async () => {
    if (!form.name?.trim() || !form.score?.trim()) {
      return flash("❌ Name and score are required");
    }
    setSaving(true);
    const url = editing ? `${API}/api/achievers/${editing._id}` : `${API}/api/achievers`;
    const body = {
      name: form.name,
      score: form.score,
      course: form.course,
      year: form.year,
      imageUrl: form.imageUrl,
      rank: Number(form.rank),
      isActive: form.isActive,
    };
    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: H,
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      flash(editing ? "✅ Achiever updated successfully" : "✅ Achiever created successfully");
      setShowModal(false);
      setForm(BLANK);
      setEditing(null);
      onRefresh();
    } else {
      const d = await res.json();
      flash("❌ " + (d.message || "Save failed"));
    }
  };

  const valid = form.name?.trim() && form.score?.trim();

  return (
    <div className="space-y-4">
      {confirm && (
        <ConfirmModal
          message={confirm.msg}
          onConfirm={confirm.onOk}
          onCancel={() => setConfirm(null)}
          loading={confirm.loading}
        />
      )}

      <PageHeader
        title={`Top Achievers (${achievers.length})`}
        subtitle="Manage student board percentage records, high scores, and leaderboard displays"
        action={
          <button onClick={openCreate} className={`${btnPrimary} flex items-center gap-1.5`}>
            <Plus className="w-4 h-4" /> Add Achiever
          </button>
        }
      />

      <div className={`${card} p-3 flex items-center gap-2.5`}>
        <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search achievers by name, year, or program..."
          className={`${inp} border-0 !p-0 focus:ring-0`}
        />
      </div>

      {filtered.length === 0 ? (
        <div className={card}>
          <EmptyState
            icon="🏆"
            title="No achiever records found"
            subtitle={search ? "Adjust your search parameters" : "Record your students board results to display on the leaderboard"}
            action={!search && <button onClick={openCreate} className={btnPrimary}>+ Add Achiever</button>}
          />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((a) => (
            <div key={a._id} className={`${card} p-4 hover:shadow-md transition-all flex flex-col justify-between group relative ${!a.isActive ? "opacity-60 bg-slate-50/50" : ""}`}>
              
              {!a.isActive && (
                <span className="absolute top-3 left-3 bg-slate-200 text-slate-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider z-10">
                  Hidden
                </span>
              )}

              <div>
                <div className="flex justify-end mb-2">
                  <Dropdown
                    trigger={
                      <button className="w-8 h-8 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" aria-label="Open menu">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    }
                  >
                    <DropdownItem onClick={() => openEdit(a)}>
                      <Edit2 className="w-3.5 h-3.5" /> Edit details
                    </DropdownItem>
                    <DropdownItem 
                      onClick={() =>
                        setConfirm({
                          msg: `Are you sure you want to delete "${a.name}"?`,
                          onOk: async () => {
                            setConfirm((prev) => ({ ...prev, loading: true }));
                            const res = await fetch(`${API}/api/achievers/${a._id}`, { method: "DELETE", headers: H });
                            if (res.ok) {
                              flash("✅ Achiever deleted successfully");
                              onRefresh();
                            } else {
                              flash("❌ Failed to delete achiever");
                            }
                            setConfirm(null);
                          },
                        })
                      }
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove record
                    </DropdownItem>
                  </Dropdown>
                </div>

                <div className="flex flex-col items-center mb-4 text-center">
                  {a.imageUrl ? (
                    <img 
                      src={a.imageUrl} 
                      alt={a.name} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-blue-500/10 shadow-sm shrink-0 mb-2.5" 
                      onError={(e) => { e.target.src = ""; }} 
                    />
                  ) : (
                    <Avatar name={a.name} size="lg" className="w-16 h-16 text-sm mb-2.5" />
                  )}
                  <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm leading-tight truncate max-w-full px-2">{a.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wide">{a.course || "Commerce"}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100/10 dark:border-slate-800/20 rounded-xl p-2.5 text-center">
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Score</p>
                    <p className="text-sm font-black text-blue-600 dark:text-blue-400 mt-0.5">{a.score}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100/10 dark:border-slate-800/20 rounded-xl p-2.5 text-center">
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Year</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-350 mt-0.5">{a.year}</p>
                  </div>
                </div>

                {a.rank > 0 && (
                  <div className="mb-2 flex justify-between items-center text-xs bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/30 dark:border-amber-900/30 px-3 py-1.5 rounded-xl">
                    <span className="text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wide text-[9px] flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Accomplishment
                    </span>
                    <span className="font-black text-amber-700 dark:text-amber-400">Rank #{a.rank}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <FormModal
          title={editing ? "Edit Achiever Record" : "Add Leaderboard Achiever"}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
            setForm(BLANK);
          }}
          onSubmit={save}
          submitLabel={editing ? "Update details" : "Publish record"}
          loading={saving}
          disabled={!valid}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Student Full Name" required className="sm:col-span-2">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inp} placeholder="e.g. Pariniti Kumari" />
            </Field>

            <Field label="Score / Marks Obtained" required>
              <input value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} className={inp} placeholder="e.g. 96.2% or 10 CGPA" />
            </Field>

            <Field label="Program Course / Class">
              <input value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className={inp} placeholder="e.g. CBSE Commerce Class 12" />
            </Field>

            <Field label="Academic Year">
              <input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className={inp} placeholder="e.g. 2026" />
            </Field>

            <Field label="Accomplishment Rank">
              <input type="number" value={form.rank} onChange={(e) => setForm({ ...form, rank: e.target.value })} className={inp} placeholder="State/District Rank (Optional)" />
            </Field>

            <Field label="Profile Image Photo URL" className="sm:col-span-2">
              <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className={inp} placeholder="Unsplash URL link or custom storage URL" />
            </Field>

            <div className="flex items-center gap-2 py-1 sm:col-span-2">
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded border-slate-300 dark:border-slate-850 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="isActive" className="text-xs font-bold text-slate-700 dark:text-slate-350 cursor-pointer select-none">
                Make visible on website homepage leaderboard carousel
              </label>
            </div>
          </div>
        </FormModal>
      )}
    </div>
  );
}
