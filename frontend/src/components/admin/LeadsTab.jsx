"use client";
import { useState, useMemo } from "react";
import { Search, RefreshCw, Users, ShieldCheck, UserX, UserCheck, Eye, Sparkles, Clock } from "lucide-react";
import {
  inp,
  EmptyState,
  PageHeader,
  card,
  FormModal,
  Field,
  btnPrimary,
  btnGhost,
} from "./AdminUI";
import API from "@/config/api";

const STREAMS = {
  "School": ["Class 7", "Class 8", "Class 9", "Class 10"],
  "Commerce": ["Class 11 (Commerce)", "Class 12 (Commerce)"],
  "Professional Courses": ["B.Com", "CA Foundation", "CMA Foundation", "CS Foundation"],
};

export default function LeadsTab({ token, leads = [], loading = false, onRefresh, flash }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [streamFilter, setStreamFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  // Lead Details Modal state
  const [selectedLead, setSelectedLead] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const H = { Authorization: `Bearer ${token}` };
  const JH = { ...H, "Content-Type": "application/json" };

  const stats = useMemo(() => {
    let total = leads.length;
    let pending = leads.filter((l) => l.status === "Pending").length;
    let verified = leads.filter((l) => l.status === "Verified").length;
    let converted = leads.filter((l) => l.status === "Converted").length;
    let rejected = leads.filter((l) => l.status === "Rejected").length;
    return { total, pending, verified, converted, rejected };
  }, [leads]);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        l.name?.toLowerCase().includes(search.toLowerCase()) ||
        l.email?.toLowerCase().includes(search.toLowerCase()) ||
        l.phone?.toLowerCase().includes(search.toLowerCase()) ||
        l.leadId?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      const matchStream = streamFilter === "all" || l.stream === streamFilter;
      const matchClass = classFilter === "all" || l.className === classFilter;

      return matchSearch && matchStatus && matchStream && matchClass;
    });
  }, [leads, search, statusFilter, streamFilter, classFilter]);

  const openLeadDetails = (lead) => {
    setSelectedLead(lead);
    setEditForm({
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      className: lead.className || "",
      stream: lead.stream || "",
      interestedCourse: lead.interestedCourse || "",
    });
  };

  const closeLeadDetails = () => {
    setSelectedLead(null);
    setEditForm(null);
  };

  const handleVerifyLead = async () => {
    if (!selectedLead || !editForm) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/leads/${selectedLead._id}/verify`, {
        method: "PUT",
        headers: JH,
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) {
        flash("✅ Lead verified successfully!");
        closeLeadDetails();
        if (onRefresh) onRefresh();
      } else {
        flash(`❌ ${data.message || "Failed to verify lead"}`);
      }
    } catch (err) {
      flash("❌ Connection error. Please try again.");
    }
    setActionLoading(false);
  };

  const handleRejectLead = async () => {
    if (!selectedLead) return;
    if (!confirm("Are you sure you want to REJECT this lead application?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/leads/${selectedLead._id}/reject`, {
        method: "PUT",
        headers: H,
      });
      const data = await res.json();
      if (res.ok) {
        flash("⚠️ Lead rejected");
        closeLeadDetails();
        if (onRefresh) onRefresh();
      } else {
        flash(`❌ ${data.message || "Failed to reject lead"}`);
      }
    } catch (err) {
      flash("❌ Connection error. Please try again.");
    }
    setActionLoading(false);
  };

  const handleApproveLead = async () => {
    if (!selectedLead) return;
    if (!confirm("Approve this admission application? This will create a Student Record and generate a unique CGA Registration Number.")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/leads/${selectedLead._id}/approve`, {
        method: "POST",
        headers: H,
      });
      const data = await res.json();
      if (res.ok) {
        flash(`🎉 Approved! Student Reg No: ${data.student.registrationNumber}`);
        closeLeadDetails();
        if (onRefresh) onRefresh();
      } else {
        flash(`❌ ${data.message || "Failed to approve lead"}`);
      }
    } catch (err) {
      flash("❌ Connection error. Please try again.");
    }
    setActionLoading(false);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Admissions & Lead Management"
        subtitle="Manage website registration leads, verify details, and approve admissions to generate Student directories"
        action={
          <button
            onClick={() => onRefresh && onRefresh()}
            className="bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200/20 active:scale-98"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-hover-spin" /> Sync Leads
          </button>
        }
      />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Total leads", val: stats.total, color: "blue", icon: Users },
          { label: "Pending", val: stats.pending, color: "amber", icon: Clock },
          { label: "Verified", val: stats.verified, color: "cyan", icon: ShieldCheck },
          { label: "Converted", val: stats.converted, color: "emerald", icon: UserCheck },
          { label: "Rejected", val: stats.rejected, color: "rose", icon: UserX },
        ].map((c) => {
          const colorClasses = {
            blue: "from-blue-50/50 to-indigo-50/30 border-blue-100 dark:from-blue-950/10 dark:border-blue-900/30 text-blue-700 dark:text-blue-400",
            amber: "from-amber-50/50 to-orange-50/30 border-amber-100 dark:from-amber-950/10 dark:border-amber-900/30 text-amber-700 dark:text-amber-400",
            cyan: "from-cyan-50/50 to-teal-50/30 border-cyan-100 dark:from-cyan-950/10 dark:border-cyan-900/30 text-cyan-700 dark:text-cyan-400",
            emerald: "from-emerald-50/50 to-green-50/30 border-emerald-100 dark:from-emerald-950/10 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400",
            rose: "from-rose-50/50 to-pink-50/30 border-rose-100 dark:from-rose-950/10 dark:border-rose-900/30 text-rose-700 dark:text-rose-455",
          }[c.color];
          const Icon = c.icon;
          return (
            <div key={c.label} className={`${card} p-4 flex items-center justify-between bg-gradient-to-br ${colorClasses}`}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider opacity-80">{c.label}</p>
                <p className="text-2xl font-black mt-1 text-slate-800 dark:text-slate-100">{c.val}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-950 flex items-center justify-center shadow-sm shrink-0">
                <Icon className="w-4.5 h-4.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filter workspace */}
      <div className={`${card} p-4 flex flex-col md:flex-row gap-3 items-center justify-between`}>
        <div className="w-full md:flex-1 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by candidate name, lead ID, email, phone number..."
            className={`${inp} border-0 !p-0 focus:ring-0`}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto shrink-0 flex-wrap justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${inp} !w-32 !py-1.5 !px-3 text-xs font-semibold text-slate-600`}
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
            <option value="Converted">Converted</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select
            value={streamFilter}
            onChange={(e) => setStreamFilter(e.target.value)}
            className={`${inp} !w-36 !py-1.5 !px-3 text-xs font-semibold text-slate-600`}
          >
            <option value="all">All Streams</option>
            <option value="School">School</option>
            <option value="Commerce">Commerce</option>
            <option value="Professional Courses">Professional</option>
          </select>
        </div>
      </div>

      {/* Grid List View */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2.5" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Syncing lead registry...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={card}>
          <EmptyState
            icon="👥"
            title="No leads match selected filters"
            subtitle={search || statusFilter !== "all" || streamFilter !== "all" ? "Adjust search keywords or status dropdown options" : "No website registrations leads recorded in database yet"}
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] dark:bg-slate-900/60">
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {["Lead ID", "Candidate Name", "Class & Stream", "Email / Mobile", "Apply Date", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left py-3.5 px-4 font-black text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l._id} className="border-t border-slate-50 dark:border-slate-800/60 hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400 text-xs font-mono">{l.leadId}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100 text-xs">{l.name}</td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-350">{l.className || "—"}</div>
                      <div className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase">{l.stream || "—"}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-slate-700 dark:text-slate-300 font-medium">{l.email}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">{l.phone || "—"}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-405 dark:text-slate-500 font-semibold">
                      {new Date(l.registrationDate || l.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                        l.status === "Pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400"
                          : l.status === "Verified"
                          ? "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/20 dark:text-cyan-400"
                          : l.status === "Converted"
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400"
                          : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400"
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => openLeadDetails(l)}
                        className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-extrabold cursor-pointer select-none"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lead Review Drawer / Modal */}
      {selectedLead && editForm && (
        <FormModal
          title={`Review Lead Application: ${selectedLead.leadId}`}
          onClose={closeLeadDetails}
          onSubmit={handleVerifyLead}
          submitLabel={actionLoading ? "Processing..." : "Save & Verify Details"}
          disabled={actionLoading}
        >
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-200/40 dark:border-blue-900/30 text-xs flex items-center justify-between mb-2">
              <div>
                <span className="text-slate-400 font-bold block">Current Lead Status</span>
                <strong className="text-blue-600 dark:text-blue-450 font-black text-sm uppercase mt-0.5 inline-block">{selectedLead.status}</strong>
              </div>
              <div className="flex gap-2">
                {selectedLead.status !== "Converted" && (
                  <>
                    {selectedLead.status !== "Rejected" && (
                      <button
                        type="button"
                        onClick={handleRejectLead}
                        className="bg-red-50 text-red-650 hover:bg-red-100 font-black px-3 py-1.5 rounded-lg text-[10px] uppercase border border-red-200/20 transition-all"
                      >
                        Reject Lead
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleApproveLead}
                      className="bg-green-600 hover:bg-green-700 text-white font-black px-3 py-1.5 rounded-lg text-[10px] uppercase flex items-center gap-1 shadow-sm transition-all"
                    >
                      <Sparkles className="w-3 h-3" /> Approve Admission
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Candidate Name" required>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className={inp}
                />
              </Field>
              <Field label="Mobile Phone" required>
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className={inp}
                />
              </Field>
            </div>

            <Field label="Email Address" required>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className={inp}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Interested Course / Class">
                <input
                  value={editForm.interestedCourse}
                  onChange={(e) => setEditForm({ ...editForm, interestedCourse: e.target.value })}
                  className={inp}
                  placeholder="e.g. CA Foundation"
                />
              </Field>
              <Field label="Academic Stream">
                <select
                  value={editForm.stream}
                  onChange={(e) => setEditForm({ ...editForm, stream: e.target.value, className: "" })}
                  className={`${inp} py-2`}
                >
                  <option value="">Choose Stream</option>
                  {Object.keys(STREAMS).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Assigned Class Grade">
              <select
                value={editForm.className}
                onChange={(e) => setEditForm({ ...editForm, className: e.target.value })}
                className={`${inp} py-2`}
                disabled={!editForm.stream}
              >
                <option value="">Choose Class</option>
                {editForm.stream &&
                  STREAMS[editForm.stream].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
              </select>
            </Field>
          </div>
        </FormModal>
      )}
    </div>
  );
}
