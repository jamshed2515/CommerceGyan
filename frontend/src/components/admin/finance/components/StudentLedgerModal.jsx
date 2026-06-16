import React, { useState, useEffect } from "react";
import { X, Calendar, DollarSign, CreditCard, Printer, User, BookOpen, Plus } from "lucide-react";
import { btnSecondary, btnGhost, Avatar, inp, btnPrimary, Field } from "../../AdminUI";

const statusCls = {
  Paid: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30",
  Partial: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
  Due: "bg-red-50 text-red-650 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30",
  Overdue: "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60 font-black",
  Upcoming: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30",
};

export default function StudentLedgerModal({ ledger, onClose, onPrintReceipt, onRecordPayment, onAddMonthlyBill, onEditLedger }) {
  if (!ledger) return null;

  const currentMonthStr = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    const dateObj = new Date(dateStr);
    const day = dateObj.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    
    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strTime = String(hours).padStart(2, '0') + ':' + minutes + ' ' + ampm;
    
    return `${day} ${month} ${year}, ${strTime}`;
  };

  const {
    student,
    course,
    batch,
    totalFees,
    discount,
    netFee,
    paidAmount,
    remainingAmount,
    status,
    payments,
    feeType,
    monthlyBills,
    billingCycle,
    monthlyFee,
    netMonthlyFee,
  } = ledger;

  const initials = (student?.name || "?")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const dateObj = new Date(dateStr);
    const day = dateObj.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Upgraded helper to dynamically calculate next month and due date
  const getNextMonthDetails = () => {
    let lastMonthStr = "";
    if (monthlyBills && monthlyBills.length > 0) {
      lastMonthStr = monthlyBills[monthlyBills.length - 1].month;
    } else {
      lastMonthStr = new Date().toLocaleString("en-IN", { month: "long", year: "numeric" });
    }

    try {
      const parts = lastMonthStr.split(" ");
      if (parts.length === 2) {
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        const mIdx = monthNames.indexOf(parts[0]);
        let year = parseInt(parts[1], 10);
        if (mIdx !== -1) {
          const nextIdx = (mIdx + 1) % 12;
          if (nextIdx === 0) year += 1;
          const nextMonthName = monthNames[nextIdx];
          
          // Due date is the 10th of that next month
          const dueDateObj = new Date(year, nextIdx, 10);
          const dueDateStr = dueDateObj.toISOString().split("T")[0];
          
          return {
            month: `${nextMonthName} ${year}`,
            dueDate: dueDateStr
          };
        }
      }
    } catch (e) {}
    
    // Fallback
    const nextMonthDate = new Date();
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
    const mName = nextMonthDate.toLocaleString("en-IN", { month: "long" });
    const yName = nextMonthDate.getFullYear();
    const dDate = new Date(yName, nextMonthDate.getMonth(), 10).toISOString().split("T")[0];
    
    return {
      month: `${mName} ${yName}`,
      dueDate: dDate
    };
  };

  // Bill Form state
  const [showBillForm, setShowBillForm] = useState(false);
  const [billForm, setBillForm] = useState({
    month: "",
    standardFee: "",
    discount: "0",
    dueDate: "",
  });
  const [addingBill, setAddingBill] = useState(false);
  const [billError, setBillError] = useState("");
  const [viewingMonthStatement, setViewingMonthStatement] = useState(null);

  useEffect(() => {
    if (ledger) {
      const lastBill = monthlyBills && monthlyBills.length > 0 
        ? monthlyBills[monthlyBills.length - 1] 
        : null;
      const details = getNextMonthDetails();
      setBillForm({
        month: details.month,
        standardFee: lastBill ? String(lastBill.standardFee) : String(monthlyFee || totalFees || ""),
        discount: lastBill ? String(lastBill.discount) : String(discount || "0"),
        dueDate: details.dueDate,
      });
      setBillError("");
    }
  }, [ledger, showBillForm]);

  const handleAddBillSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!billForm.month || !billForm.standardFee || !billForm.dueDate) {
      setBillError("Please fill out all required fields.");
      return;
    }
    setAddingBill(true);
    setBillError("");
    try {
      await onAddMonthlyBill({
        month: billForm.month,
        standardFee: Number(billForm.standardFee),
        discount: Number(billForm.discount || 0),
        dueDate: billForm.dueDate,
      });
      setShowBillForm(false);
    } catch (err) {
      setBillError(err.message || "Failed to add bill");
    } finally {
      setAddingBill(false);
    }
  };

  // Quick auto-generator handler
  const handleAutoGenerateNextMonth = async () => {
    const details = getNextMonthDetails();
    const lastBill = monthlyBills && monthlyBills.length > 0 
      ? monthlyBills[monthlyBills.length - 1] 
      : null;
    const stdFee = lastBill ? lastBill.standardFee : (monthlyFee || totalFees || 0);
    const disc = lastBill ? lastBill.discount : (discount || 0);
    
    setAddingBill(true);
    setBillError("");
    try {
      await onAddMonthlyBill({
        month: details.month,
        standardFee: Number(stdFee),
        discount: Number(disc),
        dueDate: details.dueDate,
      });
    } catch (err) {
      setBillError(err.message || "Failed to generate next month billing");
    } finally {
      setAddingBill(false);
    }
  };

  // Calculations for cards
  const sumTotalBilled = (monthlyBills || []).reduce((sum, b) => sum + (b.dueAmount || 0), 0);
  const sumCollected = (monthlyBills || []).reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const sumPending = (monthlyBills || []).reduce((sum, b) => sum + (b.pendingAmount || 0), 0);
  
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const overdueMonthsCount = (monthlyBills || []).reduce((count, b) => {
    const isOverdue = b.status === "Overdue" || 
      (b.pendingAmount > 0 && new Date(b.dueDate) < todayDate);
    return count + (isOverdue ? 1 : 0);
  }, 0);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 w-full max-w-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center font-black text-base border border-blue-100/30">
              {initials}
            </div>
            <div>
              <h3 className="font-black text-slate-800 dark:text-white text-base leading-tight">
                {student?.name || "Student Fee Details"}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Registration No: {student?.registrationNumber || "—"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Section 1: Academic & Fee Details */}
          <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                Course Details
              </h4>
              <button
                type="button"
                onClick={() => onEditLedger(ledger)}
                className="text-blue-600 hover:text-blue-700 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                ✏️ Edit Fee Settings
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <div>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">
                  Course
                </span>
                <span className="block mt-0.5 font-bold">{course?.title || "—"}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">
                  Monthly Fee
                </span>
                <span className="block mt-0.5 font-bold">
                  ₹{(monthlyFee || totalFees || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
            {batch && (
              <div className="border-t border-slate-100 dark:border-slate-800 pt-2 text-[11px] text-slate-400">
                <strong>Schedule/Batch Info:</strong> {batch.batchName || "—"}
              </div>
            )}
          </div>

          {/* Section 2: Month-wise Fee History */}
          <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider pl-1">
                Month-wise Fee History
              </h4>
            </div>

            {(!monthlyBills || monthlyBills.length === 0) ? (
              <div className="text-center text-slate-400 dark:text-slate-550 text-xs py-4">
                No billing statements found.
              </div>
            ) : (
              <div className="border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F8FAFC] dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      {["Month", "Fee", "Paid", "Due", "Status", "Actions"].map((th) => (
                        <th key={th} className="py-2 px-3 font-black text-slate-450 dark:text-slate-450 uppercase tracking-wider">
                          {th}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {monthlyBills.map((b) => {
                      const monthPayment = payments.find(p => p.statement?._id === b._id || p.statement === b._id || (p.remarks && p.remarks.includes(b.month))) || payments[0];
                      const isCurrentUnpaid = b.month === currentMonthStr && b.status !== "Paid";
                      return (
                        <tr
                          key={b._id || b.month}
                          className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${
                            isCurrentUnpaid
                              ? "bg-amber-50/80 border-l-4 border-l-amber-500 font-semibold"
                              : ""
                          }`}
                        >
                          <td className="py-2 px-3">
                            <button
                              type="button"
                              onClick={() => setViewingMonthStatement(b)}
                              className="font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:underline text-left cursor-pointer transition-colors"
                            >
                              {b.month}
                            </button>
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-655 dark:text-slate-400">
                            ₹{(b.dueAmount || b.amountDue || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-2 px-3 font-semibold text-emerald-600 dark:text-emerald-455">
                            ₹{(b.paidAmount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-2 px-3 font-semibold text-red-500 dark:text-red-455">
                            ₹{(b.pendingAmount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-2 px-3">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border ${statusCls[b.status] || ""}`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              {b.pendingAmount > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => onRecordPayment(ledger, b.month)}
                                  className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                                >
                                  Add Payment
                                </button>
                              ) : (
                                monthPayment && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onPrintReceipt(ledger, monthPayment);
                                      setTimeout(() => {
                                        window.print();
                                      }, 500);
                                    }}
                                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                                  >
                                    Download Receipt
                                  </button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 3: Payment Transaction Log */}
          <div>
            <div className="flex items-center justify-between mb-3 pl-1">
              <h4 className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider">
                Payment History
              </h4>
              {status !== "Paid" && (
                <button
                  onClick={() => onRecordPayment(ledger)}
                  className="text-[9px] font-black text-emerald-600 hover:text-emerald-705 uppercase tracking-wider transition-colors cursor-pointer"
                >
                  + Add Payment
                </button>
              )}
            </div>

            {(!payments || payments.length === 0) ? (
              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-center text-slate-400 dark:text-slate-550 text-xs">
                No manual or online transactions recorded for this student ledger.
              </div>
            ) : (
              <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F8FAFC] dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      {["Date & Time", "Month", "Amount", "Mode", "Reference", "Collected By", "Receipt"].map((th) => (
                        <th key={th} className="py-2.5 px-3 font-black text-slate-455 dark:text-slate-450 uppercase tracking-wider">
                          {th}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {payments.map((p, i) => (
                      <tr key={p._id || i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-655 dark:text-slate-400">
                          {formatDateTime(p.date)}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-blue-600 dark:text-blue-400">
                          {p.statement?.month || (p.remarks && p.remarks.match(/[A-Za-z]+ \d{4}/)?.[0]) || "—"}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-450">
                          ₹{(p.amount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-500 dark:text-slate-400">
                          {p.mode}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px] max-w-[120px] truncate" title={p.reference || p.remarks || "None"}>
                          {p.reference || p.remarks || "—"}
                        </td>
                        <td className="py-2.5 px-3 text-slate-550 dark:text-slate-400 font-medium">
                          {p.collectedBy || "System"}
                        </td>
                        <td className="py-2.5 px-3">
                          <button
                            type="button"
                            onClick={() => {
                              onPrintReceipt(ledger, p);
                              setTimeout(() => {
                                window.print();
                              }, 500);
                            }}
                            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex justify-end gap-2">
          {status !== "Paid" && (
            <button
              onClick={() => {
                onClose();
                onRecordPayment(ledger);
              }}
              className={`${btnSecondary} !py-2 !px-4 text-xs font-bold shadow-sm`}
            >
              Add Payment
            </button>
          )}
          <button
            onClick={onClose}
            className={`${btnGhost} !py-2 !px-4 text-xs font-bold border border-slate-200 dark:border-slate-800`}
          >
            Close
          </button>
        </div>

      </div>

      {/* ── DETAILED MONTHLY STATEMENT MODAL ── */}
      {viewingMonthStatement && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-120 animate-out">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
                Detailed Monthly Fee Details
              </span>
              <button
                onClick={() => setViewingMonthStatement(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Details */}
            <div className="p-5 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl space-y-3">
                <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  Fee Summary ({viewingMonthStatement.month})
                </h4>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                      Course Name
                    </span>
                    <span className="block mt-0.5 font-bold">{course?.title || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">
                      Billing Month
                    </span>
                    <span className="block mt-0.5 font-bold">{viewingMonthStatement.month}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">
                      Due Amount
                    </span>
                    <span className="block mt-0.5 font-bold">₹{viewingMonthStatement.dueAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">
                      Paid Amount
                    </span>
                    <span className="block mt-0.5 font-bold text-emerald-600 dark:text-emerald-400">₹{(viewingMonthStatement.paidAmount || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">
                      Pending Amount
                    </span>
                    <span className="block mt-0.5 font-bold text-red-500">₹{viewingMonthStatement.pendingAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">
                      Due Date
                    </span>
                    <span className="block mt-0.5 font-bold">{formatDate(viewingMonthStatement.dueDate)}</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-slate-150 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Status:</span>
                  <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${statusCls[viewingMonthStatement.status] || ""}`}>
                    {viewingMonthStatement.status}
                  </span>
                </div>
              </div>

              {/* Transactions for this month */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-slate-455 dark:text-slate-500 uppercase tracking-wider pl-1">
                  Transactions in {viewingMonthStatement.month}
                </h4>
                {(() => {
                  const filteredPayments = payments.filter(
                    (p) => p.statement?._id === viewingMonthStatement._id || p.statement === viewingMonthStatement._id || (p.remarks && p.remarks.includes(viewingMonthStatement.month))
                  );
                  if (filteredPayments.length === 0) {
                    return (
                      <p className="text-gray-400 text-xs italic text-center py-4 bg-slate-50 dark:bg-slate-950/20 rounded-xl">
                        No payments recorded for this statement month.
                      </p>
                    );
                  }
                  return (
                    <div className="border border-slate-100 dark:border-slate-800/80 rounded-xl overflow-hidden max-h-[150px] overflow-y-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-[#F8FAFC] dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800">
                          <tr>
                            {["Date & Time", "Amount", "Mode", "Receipt"].map((th) => (
                              <th key={th} className="py-2 px-3 font-black text-slate-455 uppercase tracking-wider">
                                {th}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                          {filteredPayments.map((p, i) => (
                            <tr key={p._id || i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                              <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{formatDateTime(p.date)}</td>
                              <td className="py-2 px-3 font-bold text-emerald-600">₹{p.amount.toLocaleString("en-IN")}</td>
                              <td className="py-2 px-3 text-slate-500">{p.mode}</td>
                              <td className="py-2 px-3">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onPrintReceipt(ledger, p);
                                    setTimeout(() => {
                                      window.print();
                                    }, 500);
                                  }}
                                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                                >
                                  Download Receipt
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex justify-end gap-2">
              {viewingMonthStatement.pendingAmount > 0 && (
                  <button
                    onClick={() => {
                      setViewingMonthStatement(null);
                      onRecordPayment(ledger, viewingMonthStatement.month);
                    }}
                    className={`${btnPrimary} !py-1.5 !px-3 text-xs`}
                  >
                    Add Payment
                  </button>
                )}
              <button
                onClick={() => setViewingMonthStatement(null)}
                className={`${btnGhost} !py-1.5 !px-3 text-xs border border-slate-200 dark:border-slate-800`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
