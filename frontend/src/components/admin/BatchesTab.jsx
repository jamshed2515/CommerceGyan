"use client";
import { useState, useMemo } from "react";
import { Search, Filter, BookOpen, Clock, Users, User, Plus, X, MoreVertical, Edit2, Trash2 } from "lucide-react";
import {
  inp,
  btnPrimary,
  btnGhost,
  btnDanger,
  Field,
  ConfirmModal,
  EmptyState,
  PageHeader,
  card,
  Dropdown,
  DropdownItem,
} from "./AdminUI";
import API from "@/lib/api";
const BLANK = { batchName: "", course: "", teacher: "", timing: "", description: "" };

export default function BatchesTab({ batches, teachers, courses, students, token, onRefresh, flash }) {
  const H = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [assignBatch, setAssignBatch] = useState(null);
  const [assignStudent, setAssignStudent] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterTeacher, setFilterTeacher] = useState("");

  const valid = form.batchName?.trim() && form.course && form.teacher && form.timing?.trim();

  const filtered = useMemo(() => {
    let list = [...batches];
    if (filterCourse) list = list.filter((b) => (b.course?._id || b.course) === filterCourse);
    if (filterTeacher) list = list.filter((b) => (b.teacher?._id || b.teacher) === filterTeacher);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.batchName?.toLowerCase().includes(q) ||
          b.teacher?.name?.toLowerCase().includes(q) ||
          b.course?.title?.toLowerCase().includes(q) ||
          b.timing?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [batches, search, filterCourse, filterTeacher]);

  const save = async () => {
    if (!valid) return flash("❌ Batch name, course, faculty, and time slot are required");
    setSaving(true);
    const url = editing ? `${API}/api/batches/${editing._id}` : `${API}/api/batches`;
    const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: H, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) {
      flash(editing ? "✅ Batch updated successfully" : "✅ Batch created successfully");
      reset();
      onRefresh();
    } else {
      const d = await res.json();
      flash("❌ " + (d.message || "Save failed"));
    }
  };

  const reset = () => {
    setForm(BLANK);
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (b) => {
    setEditing(b);
    setForm({
      batchName: b.batchName,
      course: b.course?._id || "",
      teacher: b.teacher?._id || "",
      timing: b.timing || "",
      description: b.description || "",
    });
    setShowForm(true);
  };

  const assignStudentToBatch = async () => {
    if (!assignStudent) return;
    const res = await fetch(`${API}/api/batches/${assignBatch}/students`, {
      method: "POST",
      headers: H,
      body: JSON.stringify({ studentId: assignStudent }),
    });
    if (res.ok) {
      flash("✅ Student assigned!");
      setAssignStudent("");
      onRefresh();
    } else {
      const d = await res.json();
      flash("❌ " + d.message);
    }
  };

  const removeStudent = async (batchId, studentId) => {
    await fetch(`${API}/api/batches/${batchId}/students/${studentId}`, { method: "DELETE", headers: H });
    flash("✅ Student removed");
    onRefresh();
  };

  // Derived: which batch's roster modal is currently open
  const rosterBatch = batches.find((b) => b._id === assignBatch) || null;

  return (
    <div className="space-y-5">
      {confirm && (
        <ConfirmModal message={confirm.msg} onConfirm={confirm.onOk} onCancel={() => setConfirm(null)} loading={confirm.loading} />
      )}

      {/* Premium Batches Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_1px_4px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
        <div>
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none tracking-tight">Batch Management</h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">Teaching groups — schedules, faculty assignments &amp; enrollment</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            {batches.length} {batches.length === 1 ? "Batch" : "Batches"}
          </span>
          <button
            onClick={() => { reset(); setShowForm(true); }}
            className={`${btnPrimary} flex items-center gap-1.5`}
          >
            <Plus className="w-4 h-4" /> Create Batch
          </button>
        </div>
      </div>

      {/* Compact Single-Row Search + Filter Toolbar */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl px-3 py-2 flex items-center gap-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search batches..."
          className="bg-transparent border-0 outline-none text-xs flex-1 min-w-0 text-slate-700 dark:text-slate-200 focus:ring-0 font-bold placeholder-slate-400"
        />
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 shrink-0" />
        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="bg-transparent border-0 outline-none text-[11px] font-semibold text-slate-500 dark:text-slate-400 focus:ring-0 cursor-pointer shrink-0 py-0"
        >
          <option value="">All Courses</option>
          {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 shrink-0" />
        <select
          value={filterTeacher}
          onChange={(e) => setFilterTeacher(e.target.value)}
          className="bg-transparent border-0 outline-none text-[11px] font-semibold text-slate-500 dark:text-slate-400 focus:ring-0 cursor-pointer shrink-0 py-0"
        >
          <option value="">All Teachers</option>
          {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
        {(search || filterCourse || filterTeacher) && (
          <>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 shrink-0" />
            <button
              onClick={() => { setSearch(""); setFilterCourse(""); setFilterTeacher(""); }}
              className="text-[11px] text-red-500 font-bold hover:text-red-600 shrink-0 transition-colors"
            >
              Clear
            </button>
          </>
        )}
      </div>

      {/* Create / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm" onClick={reset} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.15)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.5)] border border-slate-200/80 dark:border-slate-800/80 w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm leading-none">
                {editing ? "Edit Batch" : "New Batch"}
              </h3>
              <button onClick={reset} className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Form Body */}
            <div className="px-5 py-4 space-y-4">
              <Field label="Batch Name" required>
                <input value={form.batchName} onChange={(e) => setForm({ ...form, batchName: e.target.value })} className={inp} placeholder="e.g. Class 12 Commerce - A" />
              </Field>
              <Field label="Course" required>
                <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className={inp}>
                  <option value="">Select course...</option>
                  {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </Field>
              <Field label="Time Slot" required>
                <input value={form.timing} onChange={(e) => setForm({ ...form, timing: e.target.value })} className={inp} placeholder="e.g. 5:00 PM - 6:30 PM" />
              </Field>
              <Field label="Faculty In-Charge" required>
                <select value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} className={inp}>
                  <option value="">Assign teacher...</option>
                  {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </Field>
              <Field label="Notes">
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inp} placeholder="Optional notes about this batch" />
              </Field>
            </div>
            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-100 dark:border-slate-800">
              <button onClick={reset} className={btnGhost}>Cancel</button>
              <button onClick={save} disabled={saving || !valid} className={`${btnPrimary} flex items-center gap-2`}>
                {saving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {editing ? "Update" : "Create batch"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Cards Grid */}
      {filtered.length === 0 ? (
        <div className={card}>
          <EmptyState icon="🎯" title="No active batches found" subtitle="Register a batch program or refine your active filter categories" />
        </div>
      ) : (
        <div className="bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl p-4">
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((b) => {
            const maxCapacity = 30;
            const allocatedCount = b.students?.length || 0;
            const capacityPercent = Math.min((allocatedCount / maxCapacity) * 100, 100);
            const hasTeacher = !!b.teacher?.name;

            // Status-based accent logic
            const teacherAccent = hasTeacher
              ? "bg-blue-50/70 dark:bg-blue-950/20 border-blue-100/60 dark:border-blue-900/30 text-blue-700 dark:text-blue-400"
              : "bg-amber-50/70 dark:bg-amber-950/20 border-amber-100/60 dark:border-amber-900/30 text-amber-700 dark:text-amber-400";

            const teacherIcon = hasTeacher
              ? <User className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
              : <User className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />;

            const enrollAccent = allocatedCount === 0
              ? "bg-slate-50/80 dark:bg-slate-800/40 border-slate-100/60 dark:border-slate-800/40 text-slate-500 dark:text-slate-400"
              : capacityPercent >= 75
              ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-100/60 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400"
              : "bg-blue-50/60 dark:bg-blue-950/15 border-blue-100/40 dark:border-blue-900/20 text-blue-600 dark:text-blue-400";

            const progressColor = capacityPercent >= 75
              ? "bg-emerald-500"
              : capacityPercent >= 25
              ? "bg-blue-500"
              : "bg-slate-400";

            return (
              <div
                key={b._id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3 group relative shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.07)] dark:hover:shadow-[0_8px_28px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-200 ease-out"
              >
                {/* Card Header — status dot gives immediate visual signal */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-150 leading-tight flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 mt-px ${hasTeacher ? 'bg-blue-500' : 'bg-amber-400'}`} />
                      <span className="truncate">{b.batchName}</span>
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3 shrink-0" />
                      {b.course?.title || "General Course"}
                    </p>
                  </div>
                  <Dropdown
                    trigger={
                      <button className="w-6 h-6 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shrink-0" aria-label="Open menu">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    }
                  >
                    <DropdownItem onClick={() => startEdit(b)}>
                      <Edit2 className="w-3.5 h-3.5" /> Edit batch
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => setConfirm({
                        msg: `Delete batch "${b.batchName}"?`,
                        onOk: async () => {
                          setConfirm((c) => ({ ...c, loading: true }));
                          await fetch(`${API}/api/batches/${b._id}`, { method: "DELETE", headers: H });
                          flash("✅ Batch deleted");
                          setConfirm(null);
                          onRefresh();
                        },
                      })}
                      className="text-red-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove batch
                    </DropdownItem>
                  </Dropdown>
                </div>

                {/* Info Blocks — stacked label + value, premium readability */}
                <div className="bg-slate-50/70 dark:bg-slate-800/30 rounded-xl border border-slate-100/80 dark:border-slate-800/50 divide-y divide-slate-100/80 dark:divide-slate-800/50">
                  {/* Faculty */}
                  <div className={`px-3 py-2 ${hasTeacher ? 'text-blue-700 dark:text-blue-400' : 'text-amber-700 dark:text-amber-400'}`}>
                    <p className="text-[9px] font-extrabold uppercase tracking-widest opacity-50 mb-0.5 flex items-center gap-1">
                      <User className="w-2.5 h-2.5" /> Faculty
                    </p>
                    <p className="text-[12px] font-bold truncate leading-snug">{b.teacher?.name || "Unassigned"}</p>
                  </div>
                  {/* Time Slot */}
                  <div className="px-3 py-2 text-slate-600 dark:text-slate-400">
                    <p className="text-[9px] font-extrabold uppercase tracking-widest opacity-50 mb-0.5 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> Time Slot
                    </p>
                    <p className="text-[12px] font-bold text-slate-700 dark:text-slate-300 truncate leading-snug">{b.timing || "No schedule set"}</p>
                  </div>
                  {/* Enrollment */}
                  <div className={`px-3 py-2 ${enrollAccent}`}>
                    <p className="text-[9px] font-extrabold uppercase tracking-widest opacity-50 mb-0.5 flex items-center gap-1">
                      <Users className="w-2.5 h-2.5" /> Enrollment
                    </p>
                    <p className="text-[12px] font-bold leading-snug">
                      {allocatedCount} enrolled
                      <span className="text-[10px] font-semibold opacity-60 ml-1.5">· {maxCapacity - allocatedCount} remaining</span>
                    </p>
                  </div>
                </div>

                {/* Capacity Bar — seats label + inline percentage */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{allocatedCount} / {maxCapacity} seats</span>
                    <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 tabular-nums shrink-0">{Math.round(capacityPercent)}%</span>
                  </div>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                </div>

                {/* Roster Button — opens modal, card height stays fixed */}
                <button
                  onClick={() => setAssignBatch(b._id)}
                  className="w-full py-1.5 text-xs font-bold rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100/70 dark:hover:bg-blue-950/35 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30"
                >
                  <Users className="w-3.5 h-3.5" /> Manage Roster
                </button>
              </div>
            );
          })}
        </div>
        </div>
      )}

      {/* Roster Modal */}
      {rosterBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm"
            onClick={() => { setAssignBatch(null); setAssignStudent(""); }}
          />
          {/* Dialog */}
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.15)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.5)] border border-slate-200/80 dark:border-slate-800/80 w-full max-w-md flex flex-col max-h-[80vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm leading-none">{rosterBatch.batchName}</h3>
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1">Student Roster — {rosterBatch.students?.length || 0} assigned</p>
              </div>
              <button
                onClick={() => { setAssignBatch(null); setAssignStudent(""); }}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Assign Row */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex gap-2">
              <select
                value={assignStudent}
                onChange={(e) => setAssignStudent(e.target.value)}
                className={`${inp} flex-1 text-xs !py-2`}
              >
                <option value="">Select student to assign...</option>
                {students
                  .filter((s) => !rosterBatch.students?.find((bs) => (bs._id || bs) === s._id))
                  .map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <button
                onClick={assignStudentToBatch}
                disabled={!assignStudent}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold px-4 rounded-xl transition-all"
              >
                Assign
              </button>
            </div>
            {/* Student List */}
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1.5">
              {rosterBatch.students?.length > 0 ? rosterBatch.students.map((s) => (
                <div key={s._id || s} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl px-3 py-2.5 text-xs transition-colors border border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-[9px] font-black text-blue-600 dark:text-blue-400">
                      {(s.name || "?")[0].toUpperCase()}
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{s.name || s}</span>
                  </div>
                  <button
                    onClick={() => removeStudent(rosterBatch._id, s._id || s)}
                    className="text-slate-350 hover:text-red-500 transition-colors"
                    aria-label="Remove student"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                    <Users className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500">No students assigned yet</p>
                  <p className="text-[10px] text-slate-350 dark:text-slate-550 mt-0.5">Use the dropdown above to add students</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}