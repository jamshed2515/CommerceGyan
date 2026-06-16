import React from "react";
import { FormModal, Field, inp } from "../../AdminUI";

export default function RecordPaymentModal({
  ledger,
  form,
  setForm,
  onSubmit,
  onClose,
  loading,
}) {
  if (!ledger) return null;

  const { student, remainingAmount } = ledger;

  const hasMonthlyBills = ledger.monthlyBills && ledger.monthlyBills.length > 0;

  const selectedBill = hasMonthlyBills && form.month
    ? ledger.monthlyBills.find((b) => b.month === form.month)
    : null;

  const maxPaymentAllowed = selectedBill
    ? selectedBill.pendingAmount
    : remainingAmount;

  React.useEffect(() => {
    if (ledger && hasMonthlyBills && !form.month) {
      const unpaid = (ledger.monthlyBills || []).find((b) => b.status !== "Paid");
      if (unpaid) {
        setForm((f) => ({ ...f, month: unpaid.month }));
      }
    }
  }, [ledger, form.month, setForm, hasMonthlyBills]);

  const handleAmountChange = (e) => {
    setForm({ ...form, amount: e.target.value });
  };

  return (
    <FormModal
      title={`Add Payment — ${student?.name || "Student"}`}
      onClose={onClose}
      onSubmit={onSubmit}
      submitLabel="Add Payment"
      loading={loading}
      disabled={
        !form.amount ||
        Number(form.amount) <= 0 ||
        !form.mode ||
        Number(form.amount) > maxPaymentAllowed ||
        (hasMonthlyBills && !form.month)
      }
    >
      <div className="space-y-4">
        {/* Helper info banner */}
        <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-xl p-3 flex justify-between text-xs">
          <div>
            <span className="text-slate-400 font-bold block uppercase tracking-wide text-[9px]">
              Registration Number
            </span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300 mt-0.5 block">
              {student?.registrationNumber || "—"}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 font-bold block uppercase tracking-wide text-[9px]">
              {selectedBill ? `${form.month} Pending` : "Outstanding Due"}
            </span>
            <span className="font-bold text-red-500 dark:text-red-400 mt-0.5 block">
              ₹{(maxPaymentAllowed || 0).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Month selector for Monthly fee ledgers */}
        {hasMonthlyBills && (
          <Field label="Apply Payment To" required>
            <select
              value={form.month || ""}
              onChange={(e) => setForm({ ...form, month: e.target.value })}
              className={inp}
            >
              <option value="">Choose Billed Month</option>
              {(ledger.monthlyBills || []).map((bill) => (
                <option key={bill._id || bill.month} value={bill.month}>
                  {bill.month} (Pending: ₹{bill.pendingAmount} | Status: {bill.status})
                </option>
              ))}
            </select>
          </Field>
        )}

        {/* Input: Amount */}
        <Field label="Payment Amount (₹)" required>
          <input
            type="number"
            placeholder={`e.g. Max ${maxPaymentAllowed || 0}`}
            value={form.amount}
            onChange={handleAmountChange}
            className={inp}
            min="1"
            max={maxPaymentAllowed}
          />
          {form.amount && Number(form.amount) > maxPaymentAllowed && (
            <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-wide">
              ⚠️ Warning: Amount exceeds pending balance (₹{maxPaymentAllowed})
            </p>
          )}
        </Field>

        {/* Input: Mode */}
        <Field label="Payment Mode" required>
          <select
            value={form.mode}
            onChange={(e) => setForm({ ...form, mode: e.target.value })}
            className={inp}
          >
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cheque">Cheque</option>
            <option value="Razorpay">Razorpay</option>
          </select>
        </Field>

        {/* Input: Date */}
        <Field label="Payment Date">
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className={inp}
          />
        </Field>

        {/* Input: Reference Number */}
        <Field label="Reference Number (Transaction ID, Check No, etc.)">
          <input
            type="text"
            placeholder="e.g. TXN982348234"
            value={form.reference}
            onChange={(e) => setForm({ ...form, reference: e.target.value })}
            className={inp}
          />
        </Field>

        {/* Input: Remarks */}
        <Field label="Remarks / Memo Notes">
          <input
            type="text"
            placeholder="e.g. Paid part of second installment"
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            className={inp}
          />
        </Field>
      </div>
    </FormModal>
  );
}
