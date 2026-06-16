import React from "react";
import { X, Printer, ShieldCheck } from "lucide-react";
import { btnPrimary, btnGhost } from "../../AdminUI";

export default function ReceiptGenerator({ ledger, payment, onClose }) {
  if (!ledger) return null;

  const { student, course, remainingAmount } = ledger;

  const handlePrint = () => {
    window.print();
  };

  const receiptNo = payment
    ? `CG-REC-${new Date(payment.date).getFullYear()}-${payment._id?.slice(-6).toUpperCase()}`
    : `CG-STMT-${new Date().getFullYear()}-${ledger._id?.slice(-6).toUpperCase()}`;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const dateObj = new Date(dateStr);
    const day = dateObj.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    const dateObj = new Date(dateStr);
    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  };

  // Helper to extract the fee month name from the payment remarks (e.g. "Payment applied for June 2026")
  const getFeeMonth = () => {
    if (!payment) return "Statement";
    if (payment.remarks) {
      // Find matches like "June 2026" or "July 2026"
      const match = payment.remarks.match(/[A-Za-z]+ \d{4}/);
      if (match) return match[0];
    }
    return "Monthly statement";
  };

  return (
    <div id="receipt-modal-overlay" className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Printable styles injected directly for local window printing scoped strictly to the template */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Hide everything except the receipt overlay container */
          body > *:not(#receipt-modal-overlay) {
            display: none !important;
          }
          /* Hide internal modal control actions */
          #screen-actions {
            display: none !important;
          }
          /* Reset overlay to cover page content without layout shifts */
          #receipt-modal-overlay {
            position: absolute !important;
            background: white !important;
            inset: 0 !important;
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            z-index: 9999 !important;
          }
          #screen-overlay {
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #print-receipt-content {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}} />

      <div
        id="screen-overlay"
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800/60 w-full max-w-lg overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Controls */}
        <div id="screen-actions" className="p-4 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wide">
            Receipt Preview
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm active:scale-98 transition-all"
            >
              ⬇ Download Receipt
            </button>
            <button
              onClick={onClose}
              className={`${btnGhost} !py-1.5 !px-3 text-xs border border-slate-200 dark:border-slate-800`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Receipt Layout */}
        <div id="print-receipt-content" className="p-8 bg-white text-slate-800 border-t-4 border-blue-600">
          {/* Header */}
          <div className="text-center pb-6 border-b-2 border-dashed border-slate-100">
            <h2 className="text-2xl font-black tracking-tight text-blue-900">COMMERCE GYAN</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
              Premium Coaching Center for School & Professional Commerce
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Katrasgarh, Dhanbad, Jharkhand | Mob: +91 82713 65450
            </p>
          </div>

          {/* Receipt Info */}
          <div className="grid grid-cols-2 gap-4 py-5 text-xs">
            <div>
              <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Receipt No:</p>
              <p className="font-mono font-bold text-slate-800 mt-0.5">{receiptNo}</p>
            </div>
            <div className="text-right space-y-1">
              <div>
                <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Payment Date:</p>
                <p className="font-semibold text-slate-850">{formatDate(payment ? payment.date : new Date())}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wide">Payment Time:</p>
                <p className="font-semibold text-slate-850">{formatTime(payment ? payment.date : new Date())}</p>
              </div>
            </div>
          </div>

          {/* Student & Course details */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2.5 text-xs mb-5">
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Student Name:</span>
              <span className="font-bold text-slate-800">{student?.name || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Registration No:</span>
              <span className="font-mono font-bold text-slate-800">{student?.registrationNumber || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Class / Stream:</span>
              <span className="font-semibold text-slate-800">{student?.className || "—"} Commerce ({student?.stream || "General"})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-medium">Enrolled Course:</span>
              <span className="font-semibold text-slate-800">{course?.title || "—"}</span>
            </div>
            {payment && (
              <div className="flex justify-between border-t border-slate-150 pt-2">
                <span className="text-slate-400 font-medium">Fee Month:</span>
                <span className="font-bold text-blue-900">{getFeeMonth()}</span>
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="py-4 border-b border-slate-150 mb-5 text-xs">
            {payment ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                  <div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wide">
                      Amount Paid
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">Mode: {payment.mode}</span>
                  </div>
                  <span className="text-xl font-black text-emerald-600">
                    ₹{(payment.amount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                {payment.reference && (
                  <div className="flex justify-between text-slate-500">
                    <span>Reference No:</span>
                    <span className="font-mono">{payment.reference}</span>
                  </div>
                )}
                {payment.remarks && (
                  <div className="flex justify-between text-slate-500">
                    <span>Remarks:</span>
                    <span>{payment.remarks}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-2 text-slate-400 font-bold text-xs italic">
                Statement generated with no current transaction logic.
              </div>
            )}
          </div>

          {/* Balance Dues */}
          <div className="flex justify-between items-center text-xs mb-8">
            <span className="text-slate-500 font-bold uppercase tracking-wider">Remaining Balance:</span>
            <span className="text-base font-black text-red-500">
              ₹{(remainingAmount || 0).toLocaleString("en-IN")}
            </span>
          </div>

          {/* Signature Footer */}
          <div className="flex justify-between items-end pt-4">
            <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verifiable Digital Receipt</span>
            </div>
            <div className="text-center w-36 border-t border-slate-300 pt-1 text-[10px] text-slate-400 font-bold uppercase tracking-wide">
              Authorized Seal
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
