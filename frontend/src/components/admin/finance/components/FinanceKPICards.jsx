import React from "react";
import { CheckCircle2, AlertTriangle, Layers, DollarSign, Clock, Users } from "lucide-react";
import { card } from "../../AdminUI";

export default function FinanceKPICards({ fees }) {
  const totalCollected = (fees || []).reduce((sum, f) => sum + (f.paidAmount || 0), 0);
  const totalPending = (fees || []).reduce((sum, f) => sum + (f.remainingAmount || 0), 0);
  const activeLedgers = (fees || []).length;
  
  const paidAccounts = (fees || []).filter((f) => f.status === "Paid").length;
  const partialAccounts = (fees || []).filter((f) => f.status === "Partial").length;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentMonthStr = now.toLocaleString("en-IN", { month: "long", year: "numeric" }); // e.g. "June 2026"

  // 1. Current Month Collection: Sum of payments in the current calendar month
  const currentMonthCollection = (fees || []).reduce((sum, f) => {
    if (!f.payments) return sum;
    return sum + f.payments.reduce((pSum, p) => {
      if (!p.date) return pSum;
      const pDate = new Date(p.date);
      if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
        return pSum + (p.amount || 0);
      }
      return pSum;
    }, 0);
  }, 0);

  // 2. Current Month Due: Sum of dueAmount for statements of the current calendar month
  const currentMonthDue = (fees || []).reduce((sum, f) => {
    if (f.monthlyBills) {
      const match = f.monthlyBills.find(b => b.month === currentMonthStr);
      if (match) {
        return sum + (match.dueAmount || match.amountDue || 0);
      }
    } else if (f.feeType === "one_time" || !f.feeType) {
      // For one-time fees, if created in current month/year, count its netFee as due
      const fDate = new Date(f.createdAt || Date.now());
      if (fDate.getMonth() === currentMonth && fDate.getFullYear() === currentYear) {
        return sum + (f.netFee || 0);
      }
    }
    return sum;
  }, 0);

  // 3. Overdue Bills: Count of statement records that are overdue
  const overdueBills = (fees || []).reduce((count, f) => {
    if (f.monthlyBills) {
      const overdueList = f.monthlyBills.filter(
        (b) => b.status === "Overdue" || (b.pendingAmount > 0 && new Date(b.dueDate) < now)
      );
      return count + overdueList.length;
    }
    return count;
  }, 0);

  const cardsData = [
    {
      label: "Total Collection",
      val: `₹${totalCollected.toLocaleString("en-IN")}`,
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-450",
      bg: "bg-emerald-50/70 dark:bg-emerald-950/10 border-emerald-100/50 dark:border-emerald-900/20",
    },
    {
      label: "Current Month Collection",
      val: `₹${currentMonthCollection.toLocaleString("en-IN")}`,
      icon: DollarSign,
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-50/70 dark:bg-teal-950/10 border-teal-100/50 dark:border-teal-900/20",
    },
    {
      label: "Current Month Due",
      val: `₹${currentMonthDue.toLocaleString("en-IN")}`,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50/70 dark:bg-amber-950/10 border-amber-100/50 dark:border-amber-900/20",
    },
    {
      label: "Total Pending",
      val: `₹${totalPending.toLocaleString("en-IN")}`,
      icon: AlertTriangle,
      color: "text-red-500 dark:text-red-400",
      bg: "bg-red-50/70 dark:bg-red-950/10 border-red-100/50 dark:border-red-900/20",
    },
    {
      label: "Overdue Bills",
      val: overdueBills,
      icon: AlertTriangle,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50/70 dark:bg-rose-950/10 border-rose-100/50 dark:border-rose-900/20",
    },
    {
      label: "Active Accounts",
      val: activeLedgers,
      icon: Layers,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50/70 dark:bg-blue-950/10 border-blue-100/50 dark:border-blue-900/20",
    },
    {
      label: "Paid Accounts",
      val: paidAccounts,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50/70 dark:bg-green-950/10 border-green-100/50 dark:border-green-900/20",
    },
    {
      label: "Partial Accounts",
      val: partialAccounts,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50/70 dark:bg-amber-950/10 border-amber-100/50 dark:border-amber-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {cardsData.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className={`${card} p-4 flex flex-col justify-between border ${c.bg} shadow-sm transition-all duration-300 hover:shadow-md`}>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                {c.label}
              </span>
              <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-950 flex items-center justify-center border border-slate-100/10 shrink-0">
                <Icon className={`w-4 h-4 ${c.color}`} />
              </div>
            </div>
            <div className="mt-3">
              <p className={`text-base font-black ${c.color} leading-none tracking-tight`}>
                {c.val}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
