import React from "react";
import { Eye, Edit2, Trash2, DollarSign, Printer, MoreVertical } from "lucide-react";
import { Dropdown, DropdownItem } from "../../AdminUI";

const statusCls = {
  Paid: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30",
  Partial: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
  Due: "bg-red-50 text-red-650 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30",
  Overdue: "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60 font-black",
  Upcoming: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30",
};

export default function FeeLedgerTable({
  fees,
  onViewLedger,
  onRecordPayment,
  onEditLedger,
  onGenerateReceipt,
  onDeleteLedger,
}) {
  const now = new Date();
  const currentMonthStr = now.toLocaleString("en-IN", { month: "long", year: "numeric" }); // e.g. "June 2026"
  const currentMonthShortStr = now.toLocaleString("en-US", { month: "short", year: "numeric" }); // e.g. "Jun 2026"

  const getLedgerCurrentMonthDue = (ledger) => {
    if (ledger.monthlyBills && ledger.monthlyBills.length > 0) {
      const match = ledger.monthlyBills.find((b) => b.month === currentMonthStr);
      if (match) return match.dueAmount;
      return 0; // if current month is not billed yet
    }
    return ledger.netMonthlyFee || ledger.netFee || 0;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-sm overflow-hidden w-full max-w-full">
      <div className="overflow-x-auto w-full max-w-full">
        <table className="w-full min-w-max text-sm table-auto border-collapse">
          <thead className="bg-[#F8FAFC] dark:bg-slate-900/60">
            <tr className="border-b border-slate-100 dark:border-slate-800">
              {[
                "Registration No",
                "Student Name",
                "Course",
                "Monthly Fee",
                "Current Month",
                "Paid Amount",
                "Due Amount",
                "Status",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left py-3.5 px-4 font-black text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
              <th className="sticky right-0 bg-[#F8FAFC] dark:bg-slate-900 text-right py-3.5 px-4 font-black text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide whitespace-nowrap z-10 shadow-[-8px_0_8px_-6px_rgba(0,0,0,0.06)] border-b border-slate-100 dark:border-slate-800">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {fees.map((f) => (
              <tr
                key={f._id}
                className="group border-t border-slate-50 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-600 dark:text-slate-400">
                  {f.student?.registrationNumber || "—"}
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {f.student?.name || "—"}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-555 font-bold uppercase tracking-wider mt-0.5">
                    {f.student?.email || "—"}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-350 text-xs font-semibold whitespace-nowrap">
                  {f.course?.title || "—"}
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400">
                  ₹{(f.monthlyFee || f.totalFees || 0).toLocaleString("en-IN")}
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400">
                  {currentMonthShortStr}
                </td>
                <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-450 font-black">
                  ₹{(f.paidAmount || 0).toLocaleString("en-IN")}
                </td>
                <td className="py-3.5 px-4 text-red-500 dark:text-red-455 font-black">
                  ₹{(f.remainingAmount || 0).toLocaleString("en-IN")}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                      statusCls[f.status] ||
                      "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {f.status}
                  </span>
                </td>
                <td className="sticky right-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/40 py-3.5 px-4 text-right z-10 shadow-[-8px_0_8px_-6px_rgba(0,0,0,0.06)] transition-colors">
                  <div className="inline-block text-left">
                    <Dropdown
                      menuClassName="w-56 min-w-[220px] md:min-w-[240px] right-2 mt-2 shadow-2xl z-[50]"
                      trigger={
                        <button
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                          aria-label="Open actions menu"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      }
                    >
                      <DropdownItem onClick={() => onViewLedger(f)}>
                        <Eye className="w-3.5 h-3.5 text-blue-500" /> Manage Fees
                      </DropdownItem>
                      <DropdownItem onClick={() => onRecordPayment(f)}>
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Add Payment
                      </DropdownItem>
                      {f.payments && f.payments.length > 0 && (
                        <DropdownItem
                          onClick={() => {
                            onGenerateReceipt(f, f.payments[f.payments.length - 1]);
                            setTimeout(() => {
                              window.print();
                            }, 500);
                          }}
                        >
                          <Printer className="w-3.5 h-3.5 text-blue-500" /> Download Receipt
                        </DropdownItem>
                      )}
                      <DropdownItem
                        onClick={() => onDeleteLedger(f._id)}
                        className="text-red-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" /> Remove Fee Account
                      </DropdownItem>
                    </Dropdown>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
