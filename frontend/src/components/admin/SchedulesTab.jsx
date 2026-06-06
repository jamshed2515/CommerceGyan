"use client";
import { useState, useMemo } from "react";
import { Search, Calendar, Table, Grid, Plus, Edit2, Trash2, Clock, User, AlertCircle, MoreVertical } from "lucide-react";
import {
  ConfirmModal,
  EmptyState,
  Avatar,
  inp,
  card,
  btnPrimary,
  btnGhost,
  Field,
  Dropdown,
  DropdownItem,
  PageHeader,
} from "./AdminUI";
import API from "@/lib/api";

const SUBJECT_COLORS = {
  maths: { bg: "bg-indigo-50/70 border-indigo-100/50", text: "text-indigo-700 dark:text-indigo-400", dot: "bg-indigo-500" },
  science: { bg: "bg-emerald-50/70 border-emerald-100/50", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  commerce: { bg: "bg-violet-50/70 border-violet-100/50", text: "text-violet-700 dark:text-violet-400", dot: "bg-violet-500" },
  english: { bg: "bg-amber-50/70 border-amber-100/50", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  accounts: { bg: "bg-rose-50/70 border-rose-100/50", text: "text-rose-700 dark:text-rose-400", dot: "bg-rose-500" },
  "soft skills": { bg: "bg-slate-50 border-slate-100", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400" },
  default: { bg: "bg-slate-50 border-slate-100", text: "text-slate-600 dark:text-slate-400", dot: "bg-slate-400" },
};

function subjectColor(subject = "") {
  const s = subject.toLowerCase();
  for (const key of Object.keys(SUBJECT_COLORS)) {
    if (key !== "default" && s.includes(key)) return SUBJECT_COLORS[key];
  }
  return SUBJECT_COLORS.default;
}

function fmtTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_COLORS = {
  Monday: { bg: "bg-blue-50/30", text: "text-blue-700", border: "border-blue-100" },
  Tuesday: { bg: "bg-indigo-50/30", text: "text-indigo-700", border: "border-indigo-100" },
  Wednesday: { bg: "bg-emerald-50/30", text: "text-emerald-700", border: "border-emerald-100" },
  Thursday: { bg: "bg-amber-50/30", text: "text-amber-700", border: "border-amber-100" },
  Friday: { bg: "bg-rose-50/30", text: "text-rose-700", border: "border-rose-100" },
  Saturday: { bg: "bg-cyan-50/30", text: "text-cyan-700", border: "border-cyan-100" },
  Sunday: { bg: "bg-orange-50/30", text: "text-orange-700", border: "border-orange-100" },
};

const BLANK = { batch: "", subject: "", teacher: "", dayOfWeek: "Monday", startTime: "09:00", endTime: "11:00", note: "" };

export default function SchedulesTab({ schedules, batches, teachers, token, onRefresh, flash }) {
  const H = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState("table");
  const [filterBatch, setFB] = useState("");
  const [filterTeacher, setFT] = useState("");
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [conflictMsg, setConflict] = useState("");

  function detectConflict(f) {
    if (!f.teacher || !f.dayOfWeek || !f.startTime || !f.endTime) return "";
    const toMin = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    const sMin = toMin(f.startTime);
    const eMin = toMin(f.endTime);
    if (sMin >= eMin) return "End time must be after start time.";
    const clash = schedules.find((s) => {
      if (editing && s._id === editing._id) return false;
      const sameTeacher = (s.teacher?._id || s.teacher) === f.teacher;
      const sameDay = s.dayOfWeek === f.dayOfWeek;
      if (!sameTeacher || !sameDay) return false;
      const ssMin = toMin(s.startTime);
      const seMin = toMin(s.endTime);
      return sMin < seMin && eMin > ssMin;
    });
    if (clash)
      return `Teacher already assigned during this time slot (${fmtTime(clash.startTime)}–${fmtTime(clash.endTime)}, ${clash.subject})`;
    return "";
  }

  const onFormChange = (patch) => {
    let updated = { ...form, ...patch };
    if (patch.batch && !patch.teacher) {
      const batch = batches.find((b) => b._id === patch.batch);
      if (batch?.teacher?._id) updated = { ...updated, teacher: batch.teacher._id };
    }
    setForm(updated);
    setConflict(detectConflict(updated));
  };

  const save = async () => {
    if (!form.batch || !form.subject || !form.dayOfWeek) return flash("❌ Batch, subject, day are required");
    const err = detectConflict(form);
    if (err) return flash("❌ " + err);
    setSaving(true);
    const url = editing ? `${API}/api/schedules/${editing._id}` : `${API}/api/schedules`;
    const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: H, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) {
      flash(editing ? "✅ Schedule updated successfully" : "✅ Schedule created successfully");
      reset();
      onRefresh();
    } else {
      const d = await res.json();
      const errMsg = d.message || "Save failed";
      if (res.status === 409) setConflict(errMsg);
      flash("❌ " + errMsg);
    }
  };

  const del = (id) =>
    setConfirm({
      msg: "Are you sure you want to delete this schedule?",
      onOk: async () => {
        await fetch(`${API}/api/schedules/${id}`, { method: "DELETE", headers: H });
        flash("✅ Schedule deleted");
        setConfirm(null);
        onRefresh();
      },
    });

  const reset = () => {
    setForm(BLANK);
    setEditing(null);
    setShowForm(false);
    setConflict("");
  };

  const startEdit = (s) => {
    setEditing(s);
    setForm({
      batch: s.batch?._id || s.batch,
      subject: s.subject,
      teacher: s.teacher?._id || s.teacher || "",
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      note: s.note || "",
    });
    setShowForm(true);
    setConflict("");
  };

  const filtered = useMemo(() => {
    let s = [...schedules];
    if (filterBatch) s = s.filter((x) => (x.batch?._id || x.batch) === filterBatch);
    if (filterTeacher) s = s.filter((x) => (x.teacher?._id || x.teacher) === filterTeacher);
    if (search) {
      const q = search.toLowerCase();
      s = s.filter(
        (x) =>
          x.subject?.toLowerCase().includes(q) ||
          x.batch?.batchName?.toLowerCase().includes(q) ||
          x.teacher?.name?.toLowerCase().includes(q)
      );
    }
    return s;
  }, [schedules, filterBatch, filterTeacher, search]);

  const grouped = useMemo(() => {
    const g = {};
    DAYS.forEach((d) => {
      g[d] = filtered.filter((s) => s.dayOfWeek === d).sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return g;
  }, [filtered]);

  const todayName = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  const timeSlots = useMemo(() => {
    const times = new Set();
    filtered.forEach((s) => {
      if (s.startTime) times.add(s.startTime);
    });
    return Array.from(times).sort();
  }, [filtered]);

  return (
    <div className="space-y-4">
      {confirm && <ConfirmModal message={confirm.msg} onConfirm={confirm.onOk} onCancel={() => setConfirm(null)} />}

      {/* Premium Schedule Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_1px_4px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
        <div>
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none tracking-tight">Class Timetables</h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">Weekly schedule — subjects, faculty &amp; batch timings</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {schedules.length} Active {schedules.length === 1 ? "Slot" : "Slots"}
          </span>
          {/* View toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-0.5 border border-slate-200/50 dark:border-slate-700/50">
            {[
              ["table", "List", Table],
              ["cards", "Grid", Grid],
              ["timetable", "Weekly", Calendar],
            ].map(([v, label, Icon]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${view === v ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => { if (showForm && !editing) reset(); else { reset(); setShowForm(true); } }}
            className={`${btnPrimary} flex items-center gap-1.5`}
          >
            {showForm && !editing ? "✕ Close" : <><Plus className="w-4 h-4" /> Add Slot</>}
          </button>
        </div>
      </div>

      {/* Compact Single-Row Search + Filter Toolbar */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl px-3 py-2 flex items-center gap-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search subject, batch or teacher..."
          className="bg-transparent border-0 outline-none text-xs flex-1 min-w-0 text-slate-700 dark:text-slate-200 focus:ring-0 font-bold placeholder-slate-400"
        />
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 shrink-0" />
        <select
          value={filterBatch}
          onChange={(e) => setFB(e.target.value)}
          className="bg-transparent border-0 outline-none text-[11px] font-semibold text-slate-500 dark:text-slate-400 focus:ring-0 cursor-pointer shrink-0 py-0"
        >
          <option value="">All Batches</option>
          {batches.map((b) => <option key={b._id} value={b._id}>{b.batchName}</option>)}
        </select>
        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 shrink-0" />
        <select
          value={filterTeacher}
          onChange={(e) => setFT(e.target.value)}
          className="bg-transparent border-0 outline-none text-[11px] font-semibold text-slate-500 dark:text-slate-400 focus:ring-0 cursor-pointer shrink-0 py-0"
        >
          <option value="">All Teachers</option>
          {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
        {(filterBatch || filterTeacher || search) && (
          <>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 shrink-0" />
            <button
              onClick={() => { setFB(""); setFT(""); setSearch(""); }}
              className="text-[11px] text-red-500 font-bold hover:text-red-600 shrink-0 transition-colors"
            >
              Clear
            </button>
          </>
        )}
      </div>

      {showForm && (
        <div className={`${card} p-5 border border-blue-500/10`}>
          <h3 className="font-black text-slate-800 mb-4 text-sm">{editing ? "Edit Time Slot" : "New Time Slot"}</h3>
          {conflictMsg && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs font-bold px-3.5 py-3 rounded-xl mb-4 flex items-start gap-2.5 animate-slide-down">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 text-red-500 dark:text-red-400 mt-0.5" />
              <span>{conflictMsg}</span>
            </div>
          )}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <Field label="Batch Assignment" required>
              <select value={form.batch} onChange={(e) => onFormChange({ batch: e.target.value })} className={inp}>
                <option value="">Select Batch</option>
                {batches.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.batchName}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Subject Name" required>
              <input value={form.subject} onChange={(e) => onFormChange({ subject: e.target.value })} className={inp} placeholder="Commerce, Maths..." />
            </Field>
            <Field label="Faculty Member">
              <select value={form.teacher} onChange={(e) => onFormChange({ teacher: e.target.value })} className={inp}>
                <option value="">Select Teacher</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Weekday" required>
              <select value={form.dayOfWeek} onChange={(e) => onFormChange({ dayOfWeek: e.target.value })} className={inp}>
                {DAYS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </Field>
            <Field label="Start Time" required>
              <input type="time" value={form.startTime} onChange={(e) => onFormChange({ startTime: e.target.value })} className={inp} />
            </Field>
            <Field label="End Time" required>
              <input type="time" value={form.endTime} onChange={(e) => onFormChange({ endTime: e.target.value })} className={inp} />
            </Field>
            <Field label="Custom Notes / Location" className="sm:col-span-2 md:col-span-3">
              <input value={form.note} onChange={(e) => onFormChange({ note: e.target.value })} className={inp} placeholder="Optional room numbers or boards syllabus notes" />
            </Field>
          </div>
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving || !!conflictMsg}
              className={`${btnPrimary} flex items-center gap-2`}
            >
              {saving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {editing ? "Update Slot" : "Create Slot"}
            </button>
            <button onClick={reset} className={btnGhost}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* TABLE VIEW */}
      {view === "table" && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden">
              <EmptyState icon="📅" title="No schedules configured" subtitle="Adjust filters or add a new time slot" />
            </div>
          ) : (
            DAYS.filter((day) => grouped[day]?.length > 0).map((day) => {
              const dc = DAY_COLORS[day] || DAY_COLORS.Monday;
              const daySlots = grouped[day];
              return (
                <div key={day} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
                  {/* Day Section Header */}
                  <div className={`flex items-center gap-3 px-5 py-3 border-b border-slate-100 dark:border-slate-800/60 ${dc.bg}`}>
                    <span className={`text-[11px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest border ${dc.text} bg-white/70 dark:bg-slate-900/50 ${dc.border}`}>
                      {day}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                      {daySlots.length} {daySlots.length === 1 ? "class" : "classes"}
                    </span>
                  </div>

                  {/* Day Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50/80 dark:bg-slate-800/30 border-b border-slate-100/80 dark:border-slate-800/60">
                          {["Time", "Batch", "Subject", "Teacher", "Actions"].map((h) => (
                            <th key={h} className="text-left py-2.5 px-4 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/60 dark:divide-slate-800/50">
                        {daySlots.map((s) => {
                          const sc = subjectColor(s.subject);
                          const hasTeacher = !!s.teacher?.name;
                          return (
                            <tr key={s._id} className="hover:bg-blue-50/40 dark:hover:bg-blue-950/10 transition-colors duration-100">
                              {/* Time — primary */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="text-[13px] font-black text-slate-800 dark:text-slate-100 tabular-nums">
                                    {fmtTime(s.startTime)}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-semibold">– {fmtTime(s.endTime)}</span>
                                </div>
                              </td>
                              {/* Batch */}
                              <td className="py-3.5 px-4">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                  {s.batch?.batchName || <span className="text-slate-400 font-semibold italic">No batch</span>}
                                </span>
                              </td>
                              {/* Subject */}
                              <td className="py-3.5 px-4">
                                <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.text}`}>
                                  {s.subject}
                                </span>
                              </td>
                              {/* Teacher */}
                              <td className="py-3.5 px-4">
                                {hasTeacher ? (
                                  <div className="flex items-center gap-2">
                                    <Avatar name={s.teacher.name} size="sm" />
                                    <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{s.teacher.name}</span>
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 px-2 py-0.5 rounded-full">
                                    <AlertCircle className="w-2.5 h-2.5" /> Teacher Required
                                  </span>
                                )}
                              </td>
                              {/* Actions */}
                              <td className="py-3.5 px-4">
                                <Dropdown
                                  trigger={
                                    <button className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors" aria-label="Open menu">
                                      <MoreVertical className="w-3.5 h-3.5" />
                                    </button>
                                  }
                                >
                                  <DropdownItem onClick={() => startEdit(s)}>
                                    <Edit2 className="w-3.5 h-3.5" /> Edit slot
                                  </DropdownItem>
                                  <DropdownItem
                                    onClick={() => del(s._id)}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete slot
                                  </DropdownItem>
                                </Dropdown>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}


      {/* GRID VIEW */}
      {view === "cards" && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full">
              <EmptyState icon="📅" title="No schedules found" />
            </div>
          ) : (
            filtered.map((s) => {
              const dc = DAY_COLORS[s.dayOfWeek] || DAY_COLORS.Monday;
              const sc = subjectColor(s.subject);
              return (
                <div key={s._id} className={`${card} border ${dc.border} overflow-hidden hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all flex flex-col justify-between`}>
                  <div>
                    <div className={`${dc.bg} px-4 py-2.5 flex justify-between items-center text-[11px] font-black uppercase tracking-wider ${dc.text} border-b ${dc.border.replace('border-', 'border-/10')}`}>
                      <div className="flex items-center gap-2">
                        <span>{s.dayOfWeek}</span>
                        <span className="opacity-40">•</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {fmtTime(s.startTime)} – {fmtTime(s.endTime)}</span>
                      </div>
                      <Dropdown
                        trigger={
                          <button className="w-6 h-6 rounded-md hover:bg-black/5 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors" aria-label="Open menu">
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        }
                      >
                        <DropdownItem onClick={() => startEdit(s)}>
                          <Edit2 className="w-3.5 h-3.5" /> Edit slot
                        </DropdownItem>
                        <DropdownItem 
                          onClick={() => del(s._id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete slot
                        </DropdownItem>
                      </Dropdown>
                    </div>
                    <div className="p-4">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-800 ${sc.bg} ${sc.text}`}>{s.subject}</span>
                      <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm mt-2">{s.batch?.batchName || "—"}</h3>
                      
                      <div className="flex items-center gap-2 mt-3 mb-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-2.5 border border-slate-100 dark:border-slate-800">
                        <Avatar name={s.teacher?.name} size="sm" />
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase leading-none">Teacher</p>
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-bold mt-0.5">{s.teacher?.name || "Not assigned"}</p>
                        </div>
                      </div>
                      
                      {s.note && <p className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/20 rounded-lg px-2.5 py-1.5 border border-slate-100/30 dark:border-slate-800/30 truncate mt-2">{s.note}</p>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* WEEK TIMETABLE CALENDAR VIEW */}
      {view === "timetable" && (
        <div className={`${card} overflow-hidden border border-slate-100`}>
          {filtered.length === 0 ? (
            <EmptyState icon="📅" title="No schedules configured" subtitle="Create your first schedule to build the timetable" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[760px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left py-3.5 px-4 text-slate-500 font-black uppercase tracking-wider w-24 bg-slate-50 sticky left-0 z-10">Time Slot</th>
                    {DAYS.map((day) => {
                      const isToday = day === todayName;
                      return (
                        <th key={day} className={`text-left py-3 px-3 ${isToday ? "bg-blue-50/20" : ""}`}>
                          <span className="text-slate-600 text-[10px] uppercase font-black tracking-wider">{day.slice(0, 3)}</span>
                          {isToday && <span className="block text-[8px] bg-blue-500 text-white font-black px-1.5 py-0.5 rounded-full w-fit mt-0.5">TODAY</span>}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time) => (
                    <tr key={time} className="border-t border-slate-50 hover:bg-slate-50/10 transition-colors">
                      <td className="py-3 px-4 font-black text-slate-700 bg-slate-50/70 sticky left-0 z-10 text-[11px] whitespace-nowrap border-r border-slate-100">
                        {fmtTime(time)}
                      </td>
                      {DAYS.map((day) => {
                        const cell = grouped[day]?.filter((s) => s.startTime === time) || [];
                        const dc = DAY_COLORS[day];
                        return (
                          <td key={day} className={`p-1.5 align-top border-r border-slate-100/50 ${day === todayName ? "bg-blue-50/10" : ""} hover:border-slate-350 dark:hover:border-slate-700 transition-colors`}>
                            {cell.map((s) => {
                              const sc = subjectColor(s.subject);
                              return (
                                <div
                                  key={s._id}
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => startEdit(s)}
                                  className={`mb-2 last:mb-0 rounded-xl border ${sc.bg} ${sc.text} ${sc.bg.replace('bg-', 'border-')} p-3 hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 flex flex-col justify-between h-28`}
                                >
                                  <div>
                                    <span className="inline-flex items-center gap-1.5 text-[9px] font-black bg-white/70 border border-slate-100/30 px-1.5 py-0.5 rounded-full uppercase">
                                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                      {s.subject}
                                    </span>
                                    <h4 className="font-black text-slate-800 text-[11px] mt-1.5 truncate">{s.batch?.batchName}</h4>
                                  </div>
                                  
                                  <div className="mt-2 pt-2 border-t border-slate-100/20">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                      <Avatar name={s.teacher?.name} size="sm" className="!w-4 !h-4 text-[7px]" />
                                      <span className="text-[9px] text-slate-500 font-bold truncate">{s.teacher?.name || "—"}</span>
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5 shrink-0" />
                                      {fmtTime(s.startTime)} – {fmtTime(s.endTime)}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}