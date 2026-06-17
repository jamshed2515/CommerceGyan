import React, { useState, useEffect } from "react";

export default function RecordPaymentModal({
  ledger,
  form,
  setForm,
  onSubmit,
  onClose,
  loading,
}) {
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Inject Tabler icons if not present
    if (!document.getElementById("tabler-icons-link")) {
      const link = document.createElement("link");
      link.id = "tabler-icons-link";
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.x/dist/tabler-icons.min.css";
      document.head.appendChild(link);
    }
  }, []);

  if (!ledger) return null;

  const { student, remainingAmount } = ledger;
  const hasMonthlyBills = ledger.monthlyBills && ledger.monthlyBills.length > 0;

  // Auto-select unpaid month if not selected
  useEffect(() => {
    if (ledger && hasMonthlyBills && !form.month) {
      const unpaid = (ledger.monthlyBills || []).find((b) => b.status !== "Paid");
      if (unpaid) {
        setForm((f) => ({ ...f, month: unpaid.month }));
      }
    }
  }, [ledger, form.month, setForm, hasMonthlyBills]);

  const selectedBill = hasMonthlyBills && form.month
    ? ledger.monthlyBills.find((b) => b.month === form.month)
    : null;

  const maxPaymentAllowed = selectedBill
    ? selectedBill.pendingAmount
    : remainingAmount;

  const initials = (student?.name || "?")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

  const handleModeChange = (mode) => {
    setForm((f) => {
      const reference = mode === "Cash" ? "" : f.reference;
      return { ...f, mode, reference };
    });
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const isMonthInvalid = hasMonthlyBills && !form.month;
    const isAmountInvalid = !form.amount || Number(form.amount) <= 0 || Number(form.amount) > maxPaymentAllowed;

    if (isMonthInvalid || isAmountInvalid) {
      setShowError(true);
      return;
    }
    setShowError(false);
    onSubmit();
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15,23,42,0.45)",
      backdropFilter: "blur(4px)",
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      overflowY: "auto"
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .custom-payment-modal {
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 24px 60px rgba(0, 0, 30, 0.18), 0 4px 12px rgba(0, 0, 30, 0.08);
          overflow: hidden;
          width: 100%;
          max-width: 540px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          z-index: 110;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: scale(0.96);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .custom-payment-modal * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        .custom-payment-modal .modal-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #eef0f5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fff;
        }
        
        .custom-payment-modal .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .custom-payment-modal .avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #dbeafe;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          color: #1d4ed8;
          letter-spacing: 0.02em;
          flex-shrink: 0;
        }
        
        .custom-payment-modal .student-name {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
          line-height: 1.3;
          text-align: left;
        }
        
        .custom-payment-modal .student-reg {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
          text-align: left;
        }
        
        .custom-payment-modal .outstanding-box {
          text-align: right;
        }
        
        .custom-payment-modal .outstanding-label {
          font-size: 10px;
          font-weight: 600;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }
        
        .custom-payment-modal .outstanding-amount {
          font-size: 22px;
          font-weight: 700;
          color: #16a34a;
          line-height: 1.2;
          margin-top: 1px;
        }
        
        .custom-payment-modal .outstanding-amount.has-due {
          color: #dc2626;
        }
        
        .custom-payment-modal .btn-close {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid #e5e7eb;
          background: #f9fafb;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          margin-left: 12px;
          transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
        }
        .custom-payment-modal .btn-close:hover {
          background: #fee2e2;
          color: #dc2626;
          border-color: #fca5a5;
        }
        
        .custom-payment-modal .modal-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .custom-payment-modal .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        
        .custom-payment-modal .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .custom-payment-modal .form-group.full {
          grid-column: 1 / -1;
        }
        
        .custom-payment-modal label {
          font-size: 10.5px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          text-align: left;
        }
        
        .custom-payment-modal label .req {
          color: #ef4444;
          margin-left: 2px;
        }
        
        .custom-payment-modal input[type="text"],
        .custom-payment-modal input[type="number"],
        .custom-payment-modal input[type="date"],
        .custom-payment-modal select,
        .custom-payment-modal textarea {
          width: 100%;
          padding: 9px 12px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          color: #111827;
          background: #fff;
          font-family: inherit;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          box-sizing: border-box;
        }
        
        .custom-payment-modal select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          padding-right: 32px;
        }
        
        .custom-payment-modal input:focus, .custom-payment-modal select:focus, .custom-payment-modal textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
        }
        
        .custom-payment-modal input:disabled, .custom-payment-modal select:disabled, .custom-payment-modal textarea:disabled {
          background: #f9fafb;
          color: #9ca3af;
          cursor: not-allowed;
          border-color: #e5e7eb;
        }
        
        .custom-payment-modal textarea {
          resize: none;
          line-height: 1.5;
        }
        
        .custom-payment-modal .input-prefix-wrap {
          position: relative;
        }
        
        .custom-payment-modal .input-prefix-wrap .prefix {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
          pointer-events: none;
        }
        
        .custom-payment-modal .input-prefix-wrap input {
          padding-left: 24px;
        }
        
        .custom-payment-modal .mode-toggle {
          display: flex;
          gap: 6px;
        }
        
        .custom-payment-modal .mode-btn {
          flex: 1;
          padding: 8px 4px;
          border-radius: 10px;
          border: 1.5px solid #e5e7eb;
          background: #f9fafb;
          color: #6b7280;
          font-size: 12.5px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          transition: all 0.15s;
        }
        
        .custom-payment-modal .mode-btn i {
          font-size: 15px;
        }
        
        .custom-payment-modal .mode-btn:hover {
          border-color: #93c5fd;
          background: #eff6ff;
          color: #2563eb;
        }
        
        .custom-payment-modal .mode-btn.active {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #1d4ed8;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .custom-payment-modal .mode-btn.active-cash {
          background: #f0fdf4;
          border-color: #22c55e;
          color: #15803d;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
        }
        
        .custom-payment-modal .field-hint {
          font-size: 11px;
          color: #9ca3af;
          margin-top: -3px;
          text-align: left;
        }
        
        .custom-payment-modal .divider {
          height: 1px;
          background: #f3f4f6;
          margin: 4px 0;
        }
        
        .custom-payment-modal .modal-footer {
          display: flex;
          gap: 10px;
          padding: 0 1.5rem 1.5rem;
        }
        
        .custom-payment-modal .btn-cancel {
          flex: 1;
          padding: 11px;
          border-radius: 10px;
          border: 1.5px solid #e5e7eb;
          background: #fff;
          color: #374151;
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        
        .custom-payment-modal .btn-cancel:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }
        
        .custom-payment-modal .btn-submit {
          flex: 2.2;
          padding: 11px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          transition: opacity 0.15s, transform 0.1s;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
        }
        
        .custom-payment-modal .btn-submit:hover {
          opacity: 0.92;
        }
        
        .custom-payment-modal .btn-submit:active {
          transform: scale(0.98);
        }
        
        .custom-payment-modal .btn-submit i {
          font-size: 17px;
        }
        
        .custom-payment-modal .error-msg {
          font-size: 11px;
          color: #dc2626;
          margin-top: -3px;
          display: none;
          text-align: left;
        }
        
        .custom-payment-modal .form-group.has-error input,
        .custom-payment-modal .form-group.has-error select {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
        
        .custom-payment-modal .form-group.has-error .error-msg {
          display: block;
        }
        
        @media (max-width: 480px) {
          .custom-payment-modal .form-row {
            grid-template-columns: 1fr;
          }
          .custom-payment-modal .outstanding-amount {
            font-size: 18px;
          }
        }
      ` }} />

      <div className="custom-payment-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="header-left">
            <div className="avatar">{initials}</div>
            <div>
              <div className="student-name">{student?.name || "Student"}</div>
              <div className="student-reg">Reg: {student?.registrationNumber || "—"}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div className="outstanding-box">
              <div className="outstanding-label">
                {selectedBill ? `${form.month} Pending` : "Outstanding"}
              </div>
              <div className={`outstanding-amount ${maxPaymentAllowed > 0 ? "has-due" : ""}`}>
                ₹{(maxPaymentAllowed || 0).toLocaleString("en-IN")}
              </div>
            </div>
            <button className="btn-close" onClick={onClose} aria-label="Close" type="button">
              <i className="ti ti-x"></i>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Row 1: Month + Date */}
          <div className="form-row" style={{ gridTemplateColumns: hasMonthlyBills ? "1fr 1fr" : "1fr" }}>
            {hasMonthlyBills && (
              <div className={`form-group ${showError && !form.month ? "has-error" : ""}`}>
                <label>Apply to month <span className="req">*</span></label>
                <select
                  value={form.month || ""}
                  onChange={(e) => setForm({ ...form, month: e.target.value })}
                >
                  <option value="">Choose month</option>
                  {(ledger.monthlyBills || []).map((bill) => (
                    <option key={bill._id || bill.month} value={bill.month}>
                      {bill.month}
                    </option>
                  ))}
                </select>
                <span className="error-msg">Please select a month</span>
              </div>
            )}
            <div className="form-group">
              <label>Payment date <span className="req">*</span></label>
              <input
                type="date"
                value={form.date || ""}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>

          {/* Row 2: Amount + Mode */}
          <div className="form-row">
            <div className={`form-group ${showError && (!form.amount || Number(form.amount) <= 0 || Number(form.amount) > maxPaymentAllowed) ? "has-error" : ""}`}>
              <label>Amount (₹) <span className="req">*</span></label>
              <div className="input-prefix-wrap">
                <span className="prefix">₹</span>
                <input
                  type="number"
                  placeholder={`e.g. Max ${maxPaymentAllowed || 0}`}
                  value={form.amount || ""}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  min="1"
                  max={maxPaymentAllowed}
                />
              </div>
              <span className="error-msg">
                {!form.amount || Number(form.amount) <= 0
                  ? "Enter a valid amount"
                  : `Amount exceeds pending balance (₹${maxPaymentAllowed})`}
              </span>
            </div>
            <div className="form-group">
              <label>Payment mode <span className="req">*</span></label>
              <div className="mode-toggle">
                <button
                  className={`mode-btn ${form.mode === "Cash" ? "active-cash" : ""}`}
                  onClick={() => handleModeChange("Cash")}
                  type="button"
                >
                  <i className="ti ti-cash"></i> Cash
                </button>
                <button
                  className={`mode-btn ${form.mode === "UPI" ? "active" : ""}`}
                  onClick={() => handleModeChange("UPI")}
                  type="button"
                >
                  <i className="ti ti-qrcode"></i> UPI
                </button>
                <button
                  className={`mode-btn ${form.mode === "Bank Transfer" ? "active" : ""}`}
                  onClick={() => handleModeChange("Bank Transfer")}
                  type="button"
                >
                  <i className="ti ti-building-bank"></i> Bank
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: Collected by + Ref No */}
          <div className="form-row">
            <div className="form-group">
              <label>Collected by <span className="req">*</span></label>
              <select
                value={form.collectedBy || "Admin"}
                onChange={(e) => setForm({ ...form, collectedBy: e.target.value })}
              >
                <option value="Admin">Admin</option>
                <option value="Super Admin">Super Admin</option>
                <option value="Online Payment Gateway">Online Payment Gateway</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ color: form.mode === "Cash" ? "#c4c9d4" : "#6b7280" }}>
                Reference no.
              </label>
              <input
                type="text"
                placeholder={form.mode === "Cash" ? "N/A for cash" : form.mode === "UPI" ? "e.g. TXN982348234" : "Cheque / NEFT ref no."}
                value={form.mode === "Cash" ? "" : form.reference || ""}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                disabled={form.mode === "Cash"}
              />
              {form.mode === "Cash" && (
                <span className="field-hint">Not required for cash payments</span>
              )}
            </div>
          </div>

          <div className="divider"></div>

          {/* Row 4: Remarks full width */}
          <div className="form-group full">
            <label>Remarks / memo</label>
            <textarea
              rows="2"
              placeholder="e.g. Paid second installment in cash"
              value={form.remarks || ""}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="btn-submit" onClick={handleSubmit} disabled={loading} type="button">
            {loading ? (
              <>
                <i className="ti ti-loader-2" style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}></i> Saving…
              </>
            ) : (
              <>
                <i className="ti ti-circle-check"></i> Add payment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
