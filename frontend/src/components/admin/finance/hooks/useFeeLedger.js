import { useState, useMemo } from "react";
import { financeService } from "../services/financeService";

export default function useFeeLedger({ fees, token, onRefresh, flash }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [saving, setSaving] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLedger, setEditingLedger] = useState(null);
  const [recordingPaymentLedger, setRecordingPaymentLedger] = useState(null);
  const [viewingLedger, setViewingLedger] = useState(null);
  const [printingReceipt, setPrintingReceipt] = useState(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    student: "",
    batch: "",
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

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    mode: "Cash",
    date: new Date().toISOString().split("T")[0],
    reference: "",
    remarks: "",
    month: "",
  });

  // Derived filtered fees
  const filteredFees = useMemo(() => {
    return (fees || []).filter((f) => {
      if (!f) return false;
      const nameMatch = f.student?.name?.toLowerCase().includes(search.toLowerCase()) || 
                         f.student?.registrationNumber?.toLowerCase().includes(search.toLowerCase());
      const statusMatch = !statusFilter || f.status === statusFilter;
      return nameMatch && statusMatch;
    });
  }, [fees, search, statusFilter]);

  // Actions
  const handleCreateLedger = async () => {
    if (!createForm.student || !createForm.totalFees) {
      flash("❌ Student and Total Fees are required");
      return;
    }
    const netFee = Number(createForm.totalFees) - Number(createForm.discount || 0);
    if (Number(createForm.paidAmount || 0) > netFee) {
      flash("❌ Initial paid amount cannot exceed the final net fee");
      return;
    }
    setSaving(true);
    try {
      await financeService.createFee(token, {
        student: createForm.student,
        course: createForm.course || undefined,
        feeType: createForm.feeType,
        totalFees: Number(createForm.totalFees),
        discount: Number(createForm.discount || 0),
        paidAmount: Number(createForm.paidAmount || 0),
        initialPaymentMode: createForm.initialPaymentMode,
        notes: createForm.notes,
        month: createForm.feeType === "monthly" ? createForm.month : undefined,
        dueDate: createForm.feeType === "monthly" ? createForm.dueDate : undefined,
      });
      flash("✅ Fee account created successfully!");
      setCreateForm({
        student: "",
        batch: "",
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
      setShowCreateModal(false);
      onRefresh();
    } catch (err) {
      flash(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLedger = async (id, updatedData) => {
    setSaving(true);
    try {
      await financeService.updateFee(token, id, updatedData);
      flash("✅ Fee account updated successfully!");
      setEditingLedger(null);
      onRefresh();
    } catch (err) {
      flash(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddMonthlyBill = async (id, data) => {
    setSaving(true);
    try {
      const res = await financeService.addMonthlyBill(token, id, data);
      flash("✅ Billing month added successfully!");
      if (viewingLedger && viewingLedger._id === id) {
        setViewingLedger(res.fee);
      }
      onRefresh();
    } catch (err) {
      flash(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRecordPayment = async (id) => {
    if (!paymentForm.amount || !paymentForm.mode) {
      flash("❌ Payment Amount and Mode are required");
      return;
    }
    setSaving(true);
    try {
      const res = await financeService.recordPayment(token, id, {
        amount: Number(paymentForm.amount),
        mode: paymentForm.mode,
        date: paymentForm.date,
        reference: paymentForm.reference,
        remarks: paymentForm.remarks,
        month: paymentForm.month || undefined,
      });
      flash("✅ Payment recorded successfully!");
      setRecordingPaymentLedger(null);
      
      // If we are currently viewing the ledger, update the viewing state to reflect the new payment history!
      if (viewingLedger && viewingLedger._id === id) {
        setViewingLedger(res.fee);
      }
      
      setPaymentForm({
        amount: "",
        mode: "Cash",
        date: new Date().toISOString().split("T")[0],
        reference: "",
        remarks: "",
        month: "",
      });
      onRefresh();
    } catch (err) {
      flash(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLedger = async (id) => {
    try {
      await financeService.deleteFee(token, id);
      flash("✅ Fee account deleted successfully");
      onRefresh();
    } catch (err) {
      flash(`❌ ${err.message}`);
    }
  };

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    saving,
    filteredFees,
    
    // Modal states
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
 
    // Form states & setters
    createForm,
    setCreateForm,
    paymentForm,
    setPaymentForm,
 
    // Operations
    handleCreateLedger,
    handleUpdateLedger,
    handleAddMonthlyBill,
    handleRecordPayment,
    handleDeleteLedger,
  };
}
