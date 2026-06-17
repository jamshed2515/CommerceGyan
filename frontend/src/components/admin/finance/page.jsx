"use client";
import React, { useState, useEffect } from "react";
import { Search, Plus, CreditCard } from "lucide-react";
import { ConfirmModal, EmptyState, inp, btnPrimary, card, PageHeader, Field, FormModal } from "../AdminUI";

// Modular finance imports
import useFeeLedger from "./hooks/useFeeLedger";
import FinanceKPICards from "./components/FinanceKPICards";
import FeeLedgerTable from "./components/FeeLedgerTable";
import StudentLedgerModal from "./components/StudentLedgerModal";
import RecordPaymentModal from "./components/RecordPaymentModal";
import ReceiptGenerator from "./components/ReceiptGenerator";
import { financeService } from "./services/financeService";

export default function FeeTab({ fees, students, batches, courses, token, onRefresh, flash }) {
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    saving,
    filteredFees,

    // Modals
    showCreateModal,
    setShowCreateModal,
    editingLedger,
    setEditingLedger,
    recordingPaymentLedger,
    setRecordingPaymentLedger,
    viewingLedger,
    setViewingLedger,
    printingReceipt,
    setPrintingReceipt,

    // Form states
    createForm,
    setCreateForm,
    paymentForm,
    setPaymentForm,

    // Handlers
    handleCreateLedger,
    handleUpdateLedger,
    handleAddMonthlyBill,
    handleStartRecordPayment,
    handleCloseRecordPayment,
    handleRecordPayment,
    handleDeleteLedger,
  } = useFeeLedger({ fees, token, onRefresh, flash });

  // Selected Student computed state
  const selectedStudent = createForm.student
    ? students.find((s) => s._id === createForm.student)
    : null;

  // State to hold student's enrolled courses fetched dynamically from the database
  const [selectableCourses, setSelectableCourses] = useState([]);

  useEffect(() => {
    if (!createForm.student) {
      setSelectableCourses([]);
      return;
    }
    financeService.fetchStudentEnrollments(token, createForm.student)
      .then((data) => {
        let coursesList = data.map(d => d.course).filter(Boolean);
        
        // Fallback: If no enrollments exist in the collection, parse student batch courses
        if (coursesList.length === 0 && selectedStudent) {
          const legacyBatches = [
            ...(selectedStudent.assignedBatches || []),
            ...(selectedStudent.batch ? [selectedStudent.batch] : [])
          ];
          legacyBatches.forEach(bId => {
            const fullBatch = batches.find(b => b._id === (bId._id || bId));
            if (fullBatch && fullBatch.course) {
              const fullCourse = courses.find(c => c._id === (fullBatch.course._id || fullBatch.course));
              if (fullCourse && !coursesList.some(cl => cl._id === fullCourse._id)) {
                coursesList.push(fullCourse);
              }
            }
          });
        }

        const studentLedgers = fees.filter(
          (f) => String(f.student?._id || f.student) === String(createForm.student)
        );
        const filtered = coursesList.filter(c => {
          const courseIdStr = String(c._id);
          return !studentLedgers.some(fl => String(fl.course?._id || fl.course) === courseIdStr);
        });
        setSelectableCourses(filtered);
      })
      .catch((err) => {
        console.error(err);
        setSelectableCourses([]);
      });
  }, [createForm.student, selectedStudent, fees, batches, courses, token]);

  // Handlers for student / course changes to auto-populate
  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setCreateForm({
      student: studentId,
      course: "",
      feeType: "one_time",
      totalFees: "",
      discount: "0",
      paidAmount: "0",
      initialPaymentMode: "Cash",
      notes: "",
      month: new Date().toLocaleString("en-IN", { month: "long", year: "numeric" }),
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString().split("T")[0],
    });
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    if (!courseId) {
      setCreateForm({
        ...createForm,
        course: "",
        feeType: "one_time",
        totalFees: "",
        discount: "0",
        paidAmount: "0"
      });
      return;
    }
    const match = selectableCourses.find((c) => c._id === courseId);
    if (match) {
      const standardFee = match.feeType === "monthly" ? (match.monthlyFee || match.price || 0) : (match.courseFee || match.price || 0);
      setCreateForm({
        ...createForm,
        course: courseId,
        feeType: match.feeType || "one_time",
        totalFees: String(standardFee),
        discount: "0",
        paidAmount: "0"
      });
    }
  };

  const selectedBatchName = selectedStudent
    ? (selectedStudent.assignedBatches || []).map(b => {
        const fullBatch = batches.find(x => x._id === (b._id || b));
        return fullBatch?.batchName;
      }).filter(Boolean).join(", ") || "No batches assigned"
    : "Select a student to load batches";

  const finalFee = Number(createForm.totalFees || 0) - Number(createForm.discount || 0);
  const showPaidWarning = Number(createForm.paidAmount || 0) > finalFee;

  // Handle local state for confirm modal
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Edit ledger form values sync
  const [editForm, setEditForm] = useState({ totalFees: "", discount: "", notes: "" });
  useEffect(() => {
    if (editingLedger) {
      setEditForm({
        totalFees: editingLedger.totalFees || "0",
        discount: editingLedger.discount || "0",
        notes: editingLedger.notes || "",
      });
    }
  }, [editingLedger]);

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title="Fee Tracking & Balances"
        subtitle="Manage student fee accounts, record manual payments, track discount sheets, and generate digital receipts"
        action={
          <button
            onClick={() => setShowCreateModal(true)}
            className={`${btnPrimary} flex items-center gap-1.5`}
          >
            <Plus className="w-4 h-4" /> Create Record
          </button>
        }
      />

      {/* KPI Overviews */}
      <FinanceKPICards fees={fees} />

      {/* Search and Filters Toolbar */}
      <div className={`${card} p-3 flex flex-col sm:flex-row items-center gap-3`}>
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1">
          <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <input
            placeholder="Search student ledger by name or reg no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inp} border-0 !p-0 focus:ring-0 w-full`}
          />
        </div>
        <div className="w-full sm:w-auto flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide shrink-0">
            Filter status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${inp} !py-1 !px-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800`}
          >
            <option value="">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Due">Due</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      {filteredFees.length === 0 ? (
        <div className={card}>
          <EmptyState
            icon="💰"
            title="No fee ledgers found"
            subtitle="Reset your filter terms or select a student to generate a new ledger"
          />
        </div>
      ) : (
        <FeeLedgerTable
          fees={filteredFees}
          onViewLedger={setViewingLedger}
          onRecordPayment={handleStartRecordPayment}
          onEditLedger={setEditingLedger}
          onGenerateReceipt={(ledgerRecord, pRecord) => {
            setPrintingReceipt({ ledger: ledgerRecord, payment: pRecord });
          }}
          onDeleteLedger={setConfirmDeleteId}
        />
      )}

      {/* ── CREATE LEDGER MODAL ── */}
      {showCreateModal && (
        <FormModal
          title="Create Student Fee Account"
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateLedger}
          submitLabel="Create Account"
          loading={saving}
          disabled={
            !createForm.student ||
            !createForm.course ||
            !createForm.totalFees ||
            showPaidWarning ||
            Number(createForm.discount || 0) > Number(createForm.totalFees || 0)
          }
        >
          <div className="space-y-5">
            {/* SECTION 1: Student Information */}
            <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-2xl space-y-4">
              <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest pl-1">
                Student Information
              </h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Select Student Name *" required>
                  <select
                    value={createForm.student}
                    onChange={handleStudentChange}
                    className={inp}
                  >
                    <option value="">Choose Student</option>
                    {students.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} {s.registrationNumber ? `(${s.registrationNumber})` : ""}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Registration Number">
                  <input
                    type="text"
                    value={selectedStudent?.registrationNumber || "—"}
                    disabled
                    className={`${inp} bg-slate-50 dark:bg-slate-900 cursor-not-allowed`}
                  />
                </Field>
              </div>

              {createForm.student && (
                <Field label="Assigned Batch">
                  <input
                    type="text"
                    value={selectedBatchName}
                    disabled
                    className={`${inp} bg-slate-50 dark:bg-slate-900 cursor-not-allowed`}
                  />
                </Field>
              )}
            </div>

            {/* SECTION 2: Course Information */}
            {createForm.student && (
              <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-2xl space-y-4">
                <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest pl-1">
                  Course & Scholarship Pricing
                </h4>
                
                <Field label="Select Enrolled Course *" required>
                  {selectableCourses.length === 0 ? (
                    <select disabled className={`${inp} bg-slate-50 cursor-not-allowed text-slate-400`}>
                      <option value="">No pending course enrollments found</option>
                    </select>
                  ) : (
                    <select
                      value={createForm.course}
                      onChange={handleCourseChange}
                      className={inp}
                    >
                      <option value="">Choose Enrolled Course</option>
                      {selectableCourses.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>

                {createForm.course && (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-3 gap-4">
                      <Field label={createForm.feeType === "monthly" ? "Standard Monthly Fee (₹)" : "Standard Fee (₹)"}>
                        <input
                          type="number"
                          value={createForm.totalFees}
                          disabled
                          className={`${inp} bg-slate-50 dark:bg-slate-900 cursor-not-allowed`}
                        />
                      </Field>

                      <Field label="Scholarship Discount (₹)">
                        <input
                          type="number"
                          value={createForm.discount}
                          onChange={(e) => setCreateForm({ ...createForm, discount: e.target.value })}
                          className={inp}
                          placeholder="Discount in ₹"
                          min="0"
                          max={createForm.totalFees}
                        />
                      </Field>

                      <Field label={createForm.feeType === "monthly" ? "Net Monthly Fee (₹)" : "Calculated Net Fee (₹)"}>
                        <input
                          type="text"
                          value={`₹${finalFee.toLocaleString("en-IN")}`}
                          disabled
                          className={`${inp} bg-slate-100 dark:bg-slate-950 font-black text-emerald-600 cursor-not-allowed`}
                        />
                      </Field>
                    </div>

                    {createForm.feeType === "monthly" && (
                      <div className="grid sm:grid-cols-2 gap-4 border-t border-slate-150 dark:border-slate-800/60 pt-4">
                        <Field label="Initial Billing Month *" required>
                          <input
                            type="text"
                            placeholder="e.g. June 2026"
                            value={createForm.month}
                            onChange={(e) => setCreateForm({ ...createForm, month: e.target.value })}
                            className={inp}
                          />
                        </Field>

                        <Field label="First Month Due Date *" required>
                          <input
                            type="date"
                            value={createForm.dueDate}
                            onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                            className={inp}
                          />
                        </Field>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 3: Payment Information */}
            {createForm.course && (
              <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-2xl space-y-4">
                <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest pl-1">
                  Initial Payment Logging
                </h4>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Initial Paid Amount (₹)">
                    <input
                      type="number"
                      value={createForm.paidAmount}
                      onChange={(e) => setCreateForm({ ...createForm, paidAmount: e.target.value })}
                      className={inp}
                      placeholder="Paid in ₹"
                      min="0"
                    />
                    {showPaidWarning && (
                      <p className="text-[10px] text-red-500 font-bold mt-1 uppercase tracking-wide">
                        ⚠️ Cannot exceed final net fee (₹{finalFee})
                      </p>
                    )}
                  </Field>

                  <Field label="Payment Mode">
                    <select
                      value={createForm.initialPaymentMode}
                      onChange={(e) => setCreateForm({ ...createForm, initialPaymentMode: e.target.value })}
                      className={inp}
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </Field>
                </div>
              </div>
            )}

            {/* SECTION 4: Additional Notes */}
            {createForm.course && (
              <div className="border border-slate-100 dark:border-slate-800 p-4 rounded-2xl space-y-4">
                <h4 className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest pl-1">
                  Additional Notes
                </h4>
                <Field label="Remarks">
                  <input
                    placeholder="Installment breakdowns, payment remarks, etc."
                    value={createForm.notes}
                    onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                    className={inp}
                  />
                </Field>
              </div>
            )}
          </div>
        </FormModal>
      )}

      {/* ── EDIT LEDGER MODAL ── */}
      {editingLedger && (
        <FormModal
          title={`Edit Fee Account — ${editingLedger.student?.name}`}
          onClose={() => setEditingLedger(null)}
          onSubmit={() =>
            handleUpdateLedger(editingLedger._id, {
              totalFees: Number(editForm.totalFees),
              discount: Number(editForm.discount),
              notes: editForm.notes,
            })
          }
          submitLabel="Save Changes"
          loading={saving}
        >
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex items-center justify-between text-xs dark:bg-slate-950 dark:border-slate-800">
              <span className="font-bold text-slate-500 uppercase tracking-wide">Paid Cumulative:</span>
              <span className="font-black text-emerald-600 text-sm">
                ₹{(editingLedger.paidAmount || 0).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Total Course Fee (₹)" required>
                <input
                  type="number"
                  value={editForm.totalFees}
                  onChange={(e) => setEditForm({ ...editForm, totalFees: e.target.value })}
                  className={inp}
                />
              </Field>

              <Field label="Scholarship Discount (₹)">
                <input
                  type="number"
                  value={editForm.discount}
                  onChange={(e) => setEditForm({ ...editForm, discount: e.target.value })}
                  className={inp}
                />
              </Field>
            </div>

            <Field label="Memo Notes">
              <input
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className={inp}
                placeholder="Adjustments, comments..."
              />
            </Field>
          </div>
        </FormModal>
      )}

      {/* ── RECORD PAYMENT MODAL ── */}
      {recordingPaymentLedger && (
        <RecordPaymentModal
          ledger={recordingPaymentLedger}
          form={paymentForm}
          setForm={setPaymentForm}
          onSubmit={() => handleRecordPayment(recordingPaymentLedger._id)}
          onClose={handleCloseRecordPayment}
          loading={saving}
        />
      )}

      {/* ── STUDENT DETAILED PROFILE MODAL ── */}
      {viewingLedger && (
        <StudentLedgerModal
          ledger={viewingLedger}
          onClose={() => setViewingLedger(null)}
          onPrintReceipt={(ledgerRecord, pRecord) => {
            setPrintingReceipt({ ledger: ledgerRecord, payment: pRecord });
          }}
          onRecordPayment={handleStartRecordPayment}
          onAddMonthlyBill={(data) => handleAddMonthlyBill(viewingLedger._id, data)}
          onEditLedger={setEditingLedger}
        />
      )}

      {/* ── RECEIPT PRINTER MODAL ── */}
      {printingReceipt && (
        <ReceiptGenerator
          ledger={printingReceipt.ledger}
          payment={printingReceipt.payment}
          token={token}
          onClose={() => setPrintingReceipt(null)}
        />
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {confirmDeleteId && (
        <ConfirmModal
          message="Are you sure you want to delete this fee account? This will erase all billing info and payment histories."
          onConfirm={() => {
            handleDeleteLedger(confirmDeleteId);
            setConfirmDeleteId(null);
          }}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}
