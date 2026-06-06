"use client";
import { useState, useMemo } from "react";
import { Search, Plus, Edit2, Trash2, BookOpen, Tag, IndianRupee, MoreVertical, X } from "lucide-react";
import {
  inp,
  btnPrimary,
  btnGhost,
  Field,
  ConfirmModal,
  EmptyState,
  card,
  Dropdown,
  DropdownItem,
} from "./AdminUI";

const API = "http://localhost:5000";

const CATEGORIES = ["School", "Commerce", "Professional", "Language", "Competitive"];

const BLANK = { title: "", category: "School", price: "", description: "" };

export default function CoursesTab({ courses, token, onRefresh, flash }) {
  const H = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.targetAudience?.toLowerCase().includes(q)
    );
  }, [courses, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(BLANK);
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      title: c.title || "",
      category: c.targetAudience || "School",
      price: c.price || "",
      description: c.description || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(BLANK);
  };

  const valid = form.title?.trim() && form.category && form.price !== "";

  const save = async () => {
    if (!valid) return flash("❌ Course name, category, and monthly fee are required");
    setSaving(true);
    const url = editing ? `${API}/api/courses/${editing._id}` : `${API}/api/courses`;
    const body = {
      title: form.title.trim(),
      description: form.description.trim(),
      targetAudience: form.category,
      price: Number(form.price),
    };
    const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: H, body: JSON.stringify(body) });
    setSaving(false);
    if (res.ok) {
      flash(editing ? "✅ Course updated successfully" : "✅ Course created successfully");
      closeModal();
      onRefresh();
    } else {
      const d = await res.json();
      flash("❌ " + (d.message || "Save failed"));
    }
  };

  // Category badge color map
  const categoryColor = (cat) => {
    const map = {
      School: "bg-blue-50 dark:bg-blue-950/25 text-blue-600 dark:text-blue-400 border-blue-100/60 dark:border-blue-900/30",
      Commerce: "bg-emerald-50 dark:bg-emerald-950/25 text-emerald-700 dark:text-emerald-400 border-emerald-100/60 dark:border-emerald-900/30",
      Professional: "bg-violet-50 dark:bg-violet-950/25 text-violet-700 dark:text-violet-400 border-violet-100/60 dark:border-violet-900/30",
      Language: "bg-amber-50 dark:bg-amber-950/25 text-amber-700 dark:text-amber-400 border-amber-100/60 dark:border-amber-900/30",
      Competitive: "bg-rose-50 dark:bg-rose-950/25 text-rose-700 dark:text-rose-400 border-rose-100/60 dark:border-rose-900/30",
    };
    return map[cat] || "bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800/50";
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

      {/* Premium Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_1px_4px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
        <div>
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none tracking-tight">Course Catalog</h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">Program catalog — course categories &amp; monthly fees</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {courses.length} {courses.length === 1 ? "Course" : "Courses"}
          </span>
          <button onClick={openCreate} className={`${btnPrimary} flex items-center gap-1.5`}>
            <Plus className="w-4 h-4" /> Add Course
          </button>
        </div>
      </div>

      {/* Compact Search Bar */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl px-3 py-2 flex items-center gap-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses..."
          className="bg-transparent border-0 outline-none text-xs flex-1 min-w-0 text-slate-700 dark:text-slate-200 focus:ring-0 font-bold placeholder-slate-400"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Course Cards */}
      {filtered.length === 0 ? (
        <div className={card}>
          <EmptyState
            icon="🎓"
            title="No courses found"
            subtitle={search ? "Try a different search term" : "Add your first course to get started"}
            action={!search && <button onClick={openCreate} className={btnPrimary}>+ Add Course</button>}
          />
        </div>
      ) : (
        <div className="bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-4">
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((c) => {
              const catColor = categoryColor(c.targetAudience);
              // Derive the left-strip accent from the category
              const stripColor = {
                School: "bg-blue-400 dark:bg-blue-500",
                Commerce: "bg-emerald-400 dark:bg-emerald-500",
                Professional: "bg-violet-400 dark:bg-violet-500",
                Language: "bg-cyan-400 dark:bg-cyan-500",
                Competitive: "bg-amber-400 dark:bg-amber-500",
              }[c.targetAudience] || "bg-slate-300 dark:bg-slate-600";

              return (
                <div
                  key={c._id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden flex flex-col group relative shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.09)] dark:hover:shadow-[0_10px_36px_rgba(0,0,0,0.35)] hover:-translate-y-1 transition-all duration-200 ease-out"
                >
                  {/* Category-colored top accent strip */}
                  <div className={`h-1 w-full ${stripColor}`} />

                  <div className="p-4 flex flex-col gap-3 flex-1">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-150 leading-tight">
                          {c.title}
                        </h3>
                        <span className={`inline-flex items-center gap-1 mt-2 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border ${catColor}`}>
                          <Tag className="w-2 h-2 shrink-0" />
                          {c.targetAudience || "General"}
                        </span>
                      </div>
                      <Dropdown
                        trigger={
                          <button className="w-6 h-6 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shrink-0" aria-label="Open menu">
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        }
                      >
                        <DropdownItem onClick={() => openEdit(c)}>
                          <Edit2 className="w-3.5 h-3.5" /> Edit course
                        </DropdownItem>
                        <DropdownItem
                          onClick={() =>
                            setConfirm({
                              msg: `Delete course "${c.title}"?`,
                              onOk: async () => {
                                setConfirm((prev) => ({ ...prev, loading: true }));
                                const res = await fetch(`${API}/api/courses/${c._id}`, { method: "DELETE", headers: H });
                                if (res.ok) { flash("✅ Course deleted"); onRefresh(); }
                                else flash("❌ Failed to delete course");
                                setConfirm(null);
                              },
                            })
                          }
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete course
                        </DropdownItem>
                      </Dropdown>
                    </div>

                    {/* Description */}
                    {c.description ? (
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                        {c.description}
                      </p>
                    ) : (
                      <p className="text-[11px] font-medium text-slate-300 dark:text-slate-600 italic min-h-[2.5rem]">
                        No description added
                      </p>
                    )}

                    {/* Monthly Fee — primary element */}
                    <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-end justify-between gap-2">
                      <div>
                        <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Monthly Fee</p>
                        <p className="text-xl font-black text-slate-800 dark:text-slate-100 leading-none">
                          ₹{Number(c.price).toLocaleString()}
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 ml-1">/ month</span>
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center border border-slate-100 dark:border-slate-800/80 shrink-0">
                        <BookOpen className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* Create / Edit Course Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.15)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.5)] border border-slate-200/80 dark:border-slate-800/80 w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm leading-none">
                  {editing ? "Edit Course" : "Add New Course"}
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
                  {editing ? "Update course details" : "Register a new course in the catalog"}
                </p>
              </div>
              <button onClick={closeModal} className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <div className="px-5 py-4 space-y-4">
              <Field label="Course Name" required>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inp}
                  placeholder="e.g. Class 11 Commerce, CA Foundation, English Spoken"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Category" required>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inp}>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Monthly Fee (₹)" required>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 pointer-events-none">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className={`${inp} !pl-7`}
                      placeholder="1500"
                    />
                  </div>
                </Field>
              </div>

              <Field label="Description">
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inp}
                  placeholder="Short summary (optional)"
                />
              </Field>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-100 dark:border-slate-800">
              <button onClick={closeModal} className={btnGhost}>Cancel</button>
              <button onClick={save} disabled={saving || !valid} className={`${btnPrimary} flex items-center gap-2`}>
                {saving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {editing ? "Update" : "Create Course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
