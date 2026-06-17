"use client";
import { useState } from "react";
import { Search, Plus, Edit2, Trash2, DollarSign, Clock, AlertTriangle, CheckCircle2, MoreVertical, FileText } from "lucide-react";
import {
  ConfirmModal,
  EmptyState,
  inp,
  btnPrimary,
  btnGhost,
  card,
  PageHeader,
  Dropdown,
  DropdownItem,
  Field,
  FormModal,
} from "./AdminUI";
import API from "@/config/api";

const statusCls = { 
  "GOOD STANDING": "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30",
  "PARTIALLY PAID": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
  "DUE THIS MONTH": "bg-red-50 text-red-655 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30",
  "OVERDUE": "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60 font-black",
  Paid: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30", 
  Partial: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30", 
  Due: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30" 
};

export default function FeeTab({ fees, students, batches, courses, token, onRefresh, flash }) {
  const H = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const [form, setForm] = useState({ student: "", batch: "", course: "", totalFees: "", paidAmount: "0", notes: "" });
  const [editFee, setEditFee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const createFee = async () => {
    if (!form.student || !form.batch || !form.totalFees) return flash("❌ Student, batch, totalFees required");
    setSaving(true);
    const res = await fetch(`${API}/api/fees`, { 
      method: "POST", 
      headers: H, 
      body: JSON.stringify({ ...form, totalFees: +form.totalFees, paidAmount: +form.paidAmount }) 
    });
    setSaving(false);
    if (res.ok) { 
      flash("✅ Fee record created!"); 
      setForm({ student: "", batch: "", course: "", totalFees: "", paidAmount: "0", notes: "" }); 
      setShowModal(false);
      onRefresh(); 
    } else { 
      const d = await res.json(); 
      flash("❌ " + d.message); 
    }
  };

  const updateFee = async (id, paidAmount, notes) => {
    const res = await fetch(`${API}/api/fees/${id}`, { 
      method: "PUT", 
      headers: H, 
      body: JSON.stringify({ paidAmount: +paidAmount, notes }) 
    });
    if (res.ok) { 
      flash("✅ Updated!"); 
      setEditFee(null); 
      onRefresh(); 
    } else {
      flash("❌ Update failed");
    }
  };

  const delFee = (id) => setConfirm({
    msg: "Are you sure you want to delete this fee record?",
    onOk: async () => {
      await fetch(`${API}/api/fees/${id}`, { method: "DELETE", headers: H });
      flash("✅ Fee record deleted");
      setConfirm(null);
      onRefresh();
    },
  });

  const filtered = fees.filter(f => {
    const name = f.student?.name?.toLowerCase() || "";
    return name.includes(search.toLowerCase());
  });

  const totalCollected = fees.reduce((s, f) => s + (f.paidAmount || 0), 0);
  const totalDue = fees.reduce((s, f) => s + (f.remainingAmount || 0), 0);

  return (
    <div className="space-y-4">
      {confirm && <ConfirmModal message={confirm.msg} onConfirm={confirm.onOk} onCancel={() => setConfirm(null)} />}
      
      <PageHeader 
        title="Fee Tracking & Balances" 
        subtitle="Track collections, pending amounts, and installment due sheets" 
        action={
          <button onClick={() => setShowModal(true)} className={`${btnPrimary} flex items-center gap-1.5`}>
            <Plus className="w-4 h-4" /> Create Record
          </button>
        }
      />

      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Collected", val: `₹${totalCollected.toLocaleString()}`, icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50/70 dark:bg-emerald-950/10 border-emerald-100/50 dark:border-emerald-900/20" },
          { label: "Pending Due", val: `₹${totalDue.toLocaleString()}`, icon: AlertTriangle, color: "text-red-555 dark:text-red-400", bg: "bg-red-50/70 dark:bg-red-950/10 border-red-100/50 dark:border-red-900/20" },
          { label: "Active Ledgers", val: fees.length, icon: DollarSign, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50/70 dark:bg-blue-950/10 border-blue-100/50 dark:border-blue-900/20" },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className={`${card} p-5 flex items-center justify-between border ${c.bg}`}>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{c.label}</p>
                <p className={`text-2xl font-black mt-1 ${c.color}`}>{c.val}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-950 flex items-center justify-center shadow-sm shrink-0 border border-slate-100/10">
                <Icon className={`w-5 h-5 ${c.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Search Toolbar */}
      <div className={`${card} p-3 flex items-center gap-2.5`}>
        <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        <input 
          placeholder="Search student ledger by name..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className={`${inp} border-0 !p-0 focus:ring-0`} 
        />
      </div>

      {/* Ledger Table */}
      {filtered.length === 0 ? (
        <div className={card}>
          <EmptyState icon="💰" title="No fee ledgers found" subtitle="Select a student to generate a new billing record" />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] dark:bg-slate-900/60">
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {["Student","Batch","Total Fees","Paid Amount","Outstanding","Status","Actions"].map(h => (
                    <th key={h} className="text-left py-3.5 px-4 font-black text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(f => (
                  <tr key={f._id} className="border-t border-slate-50 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">{f.student?.name || "—"}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">{f.student?.email || "—"}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs font-semibold">{f.batch?.batchName || "—"}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-350">₹{(f.totalFees || 0).toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-450 font-black">₹{(f.paidAmount || 0).toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-red-500 dark:text-red-450 font-black">₹{(f.remainingAmount || 0).toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border ${statusCls[f.status] || "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"}`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Dropdown
                        trigger={
                          <button className="w-8 h-8 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" aria-label="Open menu">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        }
                      >
                        <DropdownItem onClick={() => setEditFee(f)}>
                          <Edit2 className="w-3.5 h-3.5" /> Adjust Payment
                        </DropdownItem>
                        <DropdownItem 
                          onClick={() => delFee(f._id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove ledger
                        </DropdownItem>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showModal && (
        <FormModal
          title="Create Student Fee Ledger"
          onClose={() => setShowModal(false)}
          onSubmit={createFee}
          submitLabel="Create Ledger"
          loading={saving}
          disabled={!form.student || !form.batch || !form.totalFees}
        >
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Select Student" required>
                <select value={form.student} onChange={e => setForm({ ...form, student: e.target.value })} className={inp}>
                  <option value="">Choose Student</option>
                  {students.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name} {s.registrationNumber ? `(${s.registrationNumber})` : ""}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Select Batch" required>
                <select value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })} className={inp}>
                  <option value="">Choose Batch</option>
                  {batches.map(b => <option key={b._id} value={b._id}>{b.batchName}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Catalog Course (Optional)">
              <select value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} className={inp}>
                <option value="">Choose Course</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Total Course Fees (₹)" required>
                <input type="number" placeholder="Price in ₹" value={form.totalFees} onChange={e => setForm({ ...form, totalFees: e.target.value })} className={inp} />
              </Field>

              <Field label="Initial Paid Amount (₹)">
                <input type="number" placeholder="Paid in ₹" value={form.paidAmount} onChange={e => setForm({ ...form, paidAmount: e.target.value })} className={inp} />
              </Field>
            </div>

            <Field label="Memo notes">
              <input placeholder="Installment details, comments..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={inp} />
            </Field>
          </div>
        </FormModal>
      )}

      {/* UPDATE MODAL */}
      {editFee && (
        <FormModal
          title={`Adjust Payment — ${editFee.student?.name}`}
          onClose={() => setEditFee(null)}
          onSubmit={() => {
            const val = document.getElementById("editPaid").value;
            const note = document.getElementById("editNotes").value;
            updateFee(editFee._id, val, note);
          }}
          submitLabel="Save Ledger"
        >
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-500 uppercase tracking-wide">Course Total:</span>
              <span className="font-black text-slate-800 text-sm">₹{editFee.totalFees?.toLocaleString()}</span>
            </div>
            
            <Field label="Total Cumulative Paid Amount (₹)">
              <input type="number" defaultValue={editFee.paidAmount} id="editPaid" className={inp} placeholder="Enter total collected amount" />
            </Field>
            
            <Field label="Memo Notes">
              <input defaultValue={editFee.notes} id="editNotes" className={inp} placeholder="e.g. Paid second installment" />
            </Field>
          </div>
        </FormModal>
      )}
    </div>
  );
}
