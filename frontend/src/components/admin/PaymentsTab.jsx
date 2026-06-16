"use client";
import { useState, useMemo } from "react";
import { Search, DollarSign, Calendar, RefreshCw, CreditCard } from "lucide-react";
import {
  inp,
  EmptyState,
  PageHeader,
  card,
} from "./AdminUI";

export default function PaymentsTab({ token, payments = [], loading = false, onRefresh, flash }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const stats = useMemo(() => {
    let paidCount = 0;
    let paidSum = 0;
    let pendingCount = 0;
    let pendingSum = 0;

    payments.forEach(p => {
      if (p.status === "paid") {
        paidCount++;
        paidSum += (p.amount || 0);
      } else {
        pendingCount++;
        pendingSum += (p.amount || 0);
      }
    });

    return { paidCount, paidSum, pendingCount, pendingSum, totalCount: payments.length };
  }, [payments]);

  const filtered = useMemo(() => {
    return payments.filter(p => {
      const matchSearch = 
        p.studentName?.toLowerCase().includes(search.toLowerCase()) ||
        p.studentId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.studentId?.email?.toLowerCase().includes(search.toLowerCase()) ||
        p.razorpayOrderId?.toLowerCase().includes(search.toLowerCase()) ||
        p.razorpayPaymentId?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = 
        statusFilter === "all" || 
        p.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [payments, search, statusFilter]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Razorpay Receipts Log"
        subtitle="View and verify instant online fee payments routed through Razorpay checkout"
        action={
          <button onClick={() => onRefresh && onRefresh()} className="bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200/20 active:scale-98">
            <RefreshCw className="w-3.5 h-3.5" /> Reload logs
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`${card} p-5 flex items-center justify-between bg-gradient-to-br from-green-50/50 to-emerald-50/30 dark:from-emerald-950/10 dark:to-green-950/5 border-green-100 dark:border-green-900/30`}>
          <div>
            <p className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-wide">Dynamic Net Revenue</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">₹{stats.paidSum.toLocaleString()}</p>
            <p className="text-[10px] text-green-600 dark:text-green-500 font-bold uppercase tracking-wider mt-1">{stats.paidCount} Cleared payments</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-950 flex items-center justify-center shadow-sm shrink-0 border border-slate-100/10">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
        </div>

        <div className={`${card} p-5 flex items-center justify-between bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/10 dark:to-orange-950/5 border-amber-100 dark:border-amber-900/30`}>
          <div>
            <p className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wide">Pending Orders Checkouts</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">₹{stats.pendingSum.toLocaleString()}</p>
            <p className="text-[10px] text-amber-600 dark:text-amber-555 font-bold uppercase tracking-wider mt-1">{stats.pendingCount} Active sessions</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-950 flex items-center justify-center shadow-sm shrink-0 border border-slate-100/10">
            <Calendar className="w-5 h-5 text-amber-600" />
          </div>
        </div>

        <div className={`${card} p-5 flex items-center justify-between bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-blue-950/10 dark:to-indigo-950/5 border-blue-100 dark:border-blue-900/30`}>
          <div>
            <p className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-wide">Payments volume</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{stats.totalCount}</p>
            <p className="text-[10px] text-blue-600 dark:text-blue-550 font-bold uppercase tracking-wider mt-1">Checkout attempts</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-950 flex items-center justify-center shadow-sm shrink-0 border border-slate-100/10">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className={`${card} p-4 flex flex-col sm:flex-row gap-3 items-center justify-between`}>
        <div className="w-full sm:w-1/2 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, email, or order reference ID..."
            className={`${inp} border-0 !p-0 focus:ring-0`}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${inp} !w-40 !py-1.5 !px-3 text-xs font-semibold text-slate-600`}
          >
            <option value="all">All Checkouts</option>
            <option value="paid">Paid (Successful)</option>
            <option value="created">Created (Pending)</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2.5" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Syncing payments logs...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={card}>
          <EmptyState
            icon="💳"
            title="No transactions found"
            subtitle={search || statusFilter !== "all" ? "Refine your filters or search keywords" : "No Razorpay checkout attempts recorded yet"}
          />
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] dark:bg-slate-900/60">
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {["Student payer", "Amount Value", "Checkout Status", "Razorpay References", "Receipt ID", "Timestamp"].map((h) => (
                    <th key={h} className="text-left py-3.5 px-4 font-black text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id} className="border-t border-slate-50 dark:border-slate-800/60 hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-100 text-xs leading-snug">{p.studentId?.name || p.studentName}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">{p.studentId?.email || "—"}</div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-800 dark:text-slate-100 text-sm">
                      ₹{(p.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                        p.status === "paid" 
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30" 
                          : p.status === "created" 
                          ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30" 
                          : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-slate-700 dark:text-slate-350 font-semibold font-mono">
                        <span className="text-slate-400 dark:text-slate-500 font-sans font-bold text-[10px] mr-1 uppercase">Order:</span>
                        {p.razorpayOrderId || "—"}
                      </div>
                      {p.razorpayPaymentId && (
                        <div className="text-xs text-green-600 dark:text-green-400 font-bold font-mono mt-0.5">
                          <span className="text-slate-400 dark:text-slate-500 font-sans font-bold text-[10px] mr-1 uppercase">Pymt:</span>
                          {p.razorpayPaymentId}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {p.receipt || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">
                      {p.createdAt ? new Date(p.createdAt).toLocaleString("en-IN") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
