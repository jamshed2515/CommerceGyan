import React, { useState, useEffect } from "react";
import { X, Plus, Download, Clock, Edit2 } from "lucide-react";
import { btnPrimary, btnGhost } from "../../AdminUI";

export default function StudentLedgerModal({ ledger, onClose, onPrintReceipt, onRecordPayment, onAddMonthlyBill, onEditLedger }) {
  if (!ledger) return null;

  const {
    student,
    course,
    totalFees,
    discount,
    paidAmount,
    payments,
    monthlyBills,
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

  const formatDateTime = (dateStr) => {
    if (!dateStr) return { date: "—", time: "" };
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const strHours = String(hours).padStart(2, "0");
    return { date: `${day} ${month} ${year}`, time: `${strHours}:${minutes} ${ampm}` };
  };

  const formatDateSimple = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

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
        const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        const mIdx = monthNames.indexOf(parts[0]);
        let year = parseInt(parts[1], 10);
        if (mIdx !== -1) {
          const nextIdx = (mIdx + 1) % 12;
          if (nextIdx === 0) year += 1;
          const dueDateObj = new Date(year, nextIdx, 10);
          return { month: `${monthNames[nextIdx]} ${year}`, dueDate: dueDateObj.toISOString().split("T")[0] };
        }
      }
    } catch (e) {}
    const nextMonthDate = new Date();
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
    const mName = nextMonthDate.toLocaleString("en-IN", { month: "long" });
    const yName = nextMonthDate.getFullYear();
    return { month: `${mName} ${yName}`, dueDate: new Date(yName, nextMonthDate.getMonth(), 10).toISOString().split("T")[0] };
  };

  const [academicYearFilter, setAcademicYearFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthSearch, setMonthSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedMonth, setExpandedMonth] = useState(null);

  const toggleExpandRow = (month) => {
    setExpandedMonth((prev) => (prev === month ? null : month));
  };

  const getAcademicYearFromMonth = (monthStr) => {
    const parts = monthStr.split(" ");
    if (parts.length === 2) {
      const monthName = parts[0];
      const year = parseInt(parts[1], 10);
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const mIdx = monthNames.indexOf(monthName);
      if (mIdx !== -1) {
        if (mIdx < 3) { // Jan, Feb, Mar
          return `${year - 1}–${String(year).slice(-2)}`;
        } else {
          return `${year}–${String(year + 1).slice(-2)}`;
        }
      }
    }
    return "Other";
  };

  const academicYears = Array.from(
    new Set((monthlyBills || []).map((b) => getAcademicYearFromMonth(b.month)))
  ).sort();

  const parseMonthToDate = (monthStr) => {
    const parts = monthStr.split(" ");
    if (parts.length === 2) {
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const mIdx = monthNames.indexOf(parts[0]);
      const year = parseInt(parts[1], 10);
      if (mIdx !== -1 && !isNaN(year)) return new Date(year, mIdx, 1);
    }
    return new Date(0);
  };

  const monthOptions = Array.from(
    new Set((monthlyBills || []).map((b) => b.month))
  ).sort((a, b) => parseMonthToDate(b) - parseMonthToDate(a));

  const [showBillForm, setShowBillForm] = useState(false);
  const [billForm, setBillForm] = useState({ month: "", standardFee: "", discount: "0", dueDate: "" });
  const [addingBill, setAddingBill] = useState(false);
  const [billError, setBillError] = useState("");

  useEffect(() => {
    if (ledger) {
      const lastBill = monthlyBills && monthlyBills.length > 0 ? monthlyBills[monthlyBills.length - 1] : null;
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
    if (!billForm.month || !billForm.standardFee || !billForm.dueDate) { setBillError("Please fill out all required fields."); return; }
    setAddingBill(true); setBillError("");
    try {
      await onAddMonthlyBill({ month: billForm.month, standardFee: Number(billForm.standardFee), discount: Number(billForm.discount || 0), dueDate: billForm.dueDate });
      setShowBillForm(false);
    } catch (err) { setBillError(err.message || "Failed to add bill"); }
    finally { setAddingBill(false); }
  };

  // Calculations
  const sumCollected = (monthlyBills || []).reduce((s, b) => s + (b.paidAmount || 0), 0);
  const sumPending = (monthlyBills || []).reduce((s, b) => s + (b.pendingAmount || 0), 0);
  const paidMonthsCount = (monthlyBills || []).filter((b) => b.pendingAmount === 0).length;
  const paymentsCount = (payments || []).length;
  const monthsDueCount = (monthlyBills || []).filter((b) => b.pendingAmount > 0).length;
  const feePerMonth = netMonthlyFee || monthlyFee || totalFees || 0;

  const getLastUpdatedText = () => {
    if (payments && payments.length > 0) {
      const sorted = [...payments].sort((a, b) => new Date(b.date) - new Date(a.date));
      const dt = formatDateTime(sorted[0].date);
      return `${dt.date}, ${dt.time}`;
    }
    const dt = formatDateTime(ledger.updatedAt || ledger.createdAt || new Date());
    return `${dt.date}, ${dt.time}`;
  };

  // Sort monthly bills: newest first
  const sortedBills = [...(monthlyBills || [])].sort(
    (a, b) => parseMonthToDate(b.month) - parseMonthToDate(a.month)
  );

  // Filter bills
  const filteredBills = sortedBills.filter((b) => {
    // Academic Year filter
    if (academicYearFilter && getAcademicYearFromMonth(b.month) !== academicYearFilter) {
      return false;
    }
    // Status filter
    if (statusFilter) {
      const isPaid = b.pendingAmount === 0;
      const isPartial = b.paidAmount > 0 && b.pendingAmount > 0;
      const isUnpaid = b.paidAmount === 0 && b.pendingAmount > 0;
      const isOverdue = b.status === "Overdue" || (b.pendingAmount > 0 && b.dueDate && new Date(b.dueDate) < new Date());

      if (statusFilter === "Paid" && !isPaid) return false;
      if (statusFilter === "Partial" && !isPartial) return false;
      if (statusFilter === "Unpaid" && !isUnpaid) return false;
      if (statusFilter === "Overdue" && !isOverdue) return false;
    }
    // Month filter (exact match)
    if (monthSearch && b.month !== monthSearch) {
      return false;
    }
    return true;
  });

  // Pagination
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(filteredBills.length / ITEMS_PER_PAGE);
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hideCollectBtn = sumPending === 0 && (filteredBills || []).every(b => b.pendingAmount === 0);

  // Styles mirroring the HTML reference exactly
  const S = {
    modal: {
      background: "#fff",
      borderRadius: "14px",
      width: "90vw",
      maxWidth: "1150px",
      height: "85vh",
      maxHeight: "85vh",
      display: "flex",
      flexDirection: "column",
      border: "1px solid #e8eaee",
      overflow: "hidden",
      fontSize: "13px",
      color: "#374151",
      boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
    },
    // Header
    mh: { padding: "20px 24px", display: "flex", alignItems: "center", gap: "14px" },
    av: { width: "44px", height: "44px", borderRadius: "50%", background: "#e8f0fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 600, color: "#1a56db", flexShrink: 0 },
    sname: { fontSize: "15px", fontWeight: 600, color: "#111827" },
    smeta: { fontSize: "12px", color: "#9ca3af", marginTop: "3px", display: "flex", alignItems: "center", gap: "5px" },
    activeDot: { width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" },
    sep: { color: "#d1d5db" },
    hright: { marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" },
    collectBtn: { display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 600, padding: "8px 16px", borderRadius: "8px", border: "none", background: "#1a56db", color: "#fff", cursor: "pointer", whiteSpace: "nowrap" },
    xbtn: { width: "34px", height: "34px", borderRadius: "8px", border: "1px solid #e8eaee", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontSize: "16px", flexShrink: 0 },
    // Stats row
    stats: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: "1px solid #f0f2f5", borderBottom: "1px solid #f0f2f5" },
    stat: { padding: "16px 20px", position: "relative" },
    statBorder: { padding: "16px 20px", borderLeft: "1px solid #f0f2f5" },
    slabel: { fontSize: "10px", fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "#b0b7c3", marginBottom: "6px" },
    svalBlue: { fontSize: "22px", fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1, color: "#1a56db" },
    svalGreen: { fontSize: "22px", fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1, color: "#059669" },
    svalRed: { fontSize: "22px", fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1, color: "#e53e3e" },
    svalDark: { fontSize: "22px", fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1, color: "#111827" },
    denom: { fontSize: "14px", fontWeight: 500, color: "#b0b7c3" },
    ssub: { fontSize: "11px", color: "#b0b7c3", marginTop: "4px" },
    // Section
    section: { padding: "20px 24px", borderTop: "1px solid #f0f2f5" },
    secHd: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" },
    secTitle: { fontSize: "10px", fontWeight: 700, letterSpacing: ".09em", textTransform: "uppercase", color: "#b0b7c3" },
    editLnk: { fontSize: "12px", fontWeight: 500, color: "#1a56db", background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px", padding: 0 },
    // Course grid
    courseGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", background: "#f7f8fa", borderRadius: "10px", border: "1px solid #f0f2f5", overflow: "hidden" },
    cfield: { padding: "12px 16px" },
    cfieldBorder: { padding: "12px 16px", borderLeft: "1px solid #f0f2f5" },
    cfieldLabel: { fontSize: "10px", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#b0b7c3", display: "block", marginBottom: "5px" },
    cfieldVal: { fontSize: "13px", fontWeight: 600, color: "#1f2937" },
    // Table
    table: { width: "100%", minWidth: "750px", borderCollapse: "collapse", tableLayout: "fixed" },
    th: { position: "sticky", top: 0, zIndex: 10, background: "#fff", borderBottom: "1px solid #f0f2f5", fontSize: "10px", fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "#b0b7c3", padding: "10px 8px 10px 0", textAlign: "left" },
    thRight: { position: "sticky", top: 0, zIndex: 10, background: "#fff", borderBottom: "1px solid #f0f2f5", fontSize: "10px", fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "#b0b7c3", padding: "10px 0 10px 0", textAlign: "right" },
    td: { padding: "12px 8px 12px 0", borderBottom: "1px solid #f7f8fa", verticalAlign: "middle", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "13px" },
    tdNowrapOff: { padding: "12px 8px 12px 0", borderBottom: "1px solid #f7f8fa", verticalAlign: "middle", fontSize: "13px", whiteSpace: "normal" },
    tdRight: { padding: "12px 0 12px 0", borderBottom: "1px solid #f7f8fa", verticalAlign: "middle", textAlign: "right" },
    fw: { fontWeight: 600, color: "#111827", fontSize: "13px" },
    muted: { color: "#c4c9d4", fontSize: "13px" },
    g: { color: "#059669", fontWeight: 600, fontSize: "13px" },
    r: { color: "#e53e3e", fontWeight: 600, fontSize: "13px" },
    bl: { color: "#1a56db", fontWeight: 500, fontSize: "13px" },
    // Badges
    badgePaid: { display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10px", fontWeight: 700, padding: "4px 9px", borderRadius: "20px", letterSpacing: ".04em", whiteSpace: "nowrap", background: "#ecfdf5", color: "#065f46" },
    badgePartial: { display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10px", fontWeight: 700, padding: "4px 9px", borderRadius: "20px", letterSpacing: ".04em", whiteSpace: "nowrap", background: "#fffbeb", color: "#92400e" },
    badgeUnpaid: { display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "10px", fontWeight: 700, padding: "4px 9px", borderRadius: "20px", letterSpacing: ".04em", whiteSpace: "nowrap", background: "#fff5f5", color: "#c53030" },
    bdotPaid: { width: "5px", height: "5px", borderRadius: "50%", flexShrink: 0, background: "#10b981" },
    bdotPartial: { width: "5px", height: "5px", borderRadius: "50%", flexShrink: 0, background: "#f59e0b" },
    bdotUnpaid: { width: "5px", height: "5px", borderRadius: "50%", flexShrink: 0, background: "#e53e3e" },
    // Mode tags
    modeTagCash: { display: "inline-block", fontSize: "11px", background: "#f7f8fa", color: "#6b7280", borderRadius: "6px", padding: "3px 9px", border: "1px solid #eceef1", fontWeight: 500, whiteSpace: "nowrap" },
    modeTagOnline: { display: "inline-block", fontSize: "11px", background: "#e8f0fe", color: "#1a56db", borderRadius: "6px", padding: "3px 9px", border: "1px solid #c7d9fb", fontWeight: 500, whiteSpace: "nowrap" },
    // Buttons
    btnPrimary: { display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 600, background: "#1a56db", color: "#fff", border: "none", padding: "6px 13px", borderRadius: "7px", cursor: "pointer", whiteSpace: "nowrap" },
    btnOutline: { display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: 500, border: "1px solid #e8eaee", background: "#fff", color: "#374151", padding: "6px 13px", borderRadius: "7px", cursor: "pointer", whiteSpace: "nowrap" },
    btnIcon: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: "30px", height: "30px", border: "1px solid #e8eaee", background: "#fff", color: "#6b7280", borderRadius: "7px", cursor: "pointer", fontSize: "14px" },
    // Filter
    fsel: { fontSize: "12px", fontWeight: 500, border: "1px solid #e8eaee", borderRadius: "8px", padding: "6px 10px", background: "#fff", color: "#6b7280", cursor: "pointer", outline: "none" },
    // Ref
    refTxn: { fontSize: "12px", fontWeight: 500, color: "#374151", fontFamily: "monospace", letterSpacing: ".03em" },
    refNone: { fontSize: "16px", color: "#d1d5db", lineHeight: 1 },
    // Footer
    mf: { padding: "14px 24px", borderTop: "1px solid #f0f2f5", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f7f8fa" },
    mfNote: { fontSize: "11px", color: "#b0b7c3", display: "flex", alignItems: "center", gap: "5px" },
  };

  const rawStatus = (student?.status || "Active").toLowerCase();
  let studentStatus = "Active";
  let statusColor = "#10b981";
  if (rawStatus === "inactive") {
    studentStatus = "Inactive";
    statusColor = "#ef4444";
  } else if (rawStatus === "suspended") {
    studentStatus = "Suspended";
    statusColor = "#f97316";
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", overflowY: "auto" }}>
      <div style={S.modal}>

        {/* ── HEADER ── */}
        <div style={{ ...S.mh, flexShrink: 0 }}>
          <div style={S.av}>{initials}</div>
          <div>
            <div style={S.sname}>{student?.name || "Student Fee Details"}</div>
            <div style={S.smeta}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <span style={{ color: statusColor }}>●</span>
                <span>{studentStatus}</span>
              </span>
              <span style={S.sep}>·</span>
              <span>{student?.registrationNumber || "—"}</span>
              <span style={S.sep}>·</span>
              <span>{course?.title || "—"}</span>
            </div>
          </div>
          <div style={S.hright}>
            {!hideCollectBtn && (
              <button style={S.collectBtn} onClick={() => onRecordPayment(ledger)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Collect fee
              </button>
            )}
            <button style={S.xbtn} onClick={onClose} aria-label="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {/* ── STATS ── */}
        <div style={{ ...S.stats, flexShrink: 0 }}>
          <div style={S.stat}>
            <div style={S.slabel}>Monthly fee</div>
            <div style={S.svalBlue}>₹{feePerMonth.toLocaleString("en-IN")}</div>
            <div style={S.ssub}>Per month</div>
          </div>
          <div style={S.statBorder}>
            <div style={S.slabel}>Total collected</div>
            <div style={S.svalGreen}>₹{sumCollected.toLocaleString("en-IN")}</div>
            <div style={S.ssub}>{paymentsCount} payment{paymentsCount !== 1 ? "s" : ""}</div>
          </div>
          <div style={S.statBorder}>
            <div style={S.slabel}>Outstanding</div>
            <div style={S.svalRed}>₹{sumPending.toLocaleString("en-IN")}</div>
            <div style={S.ssub}>{monthsDueCount} month{monthsDueCount !== 1 ? "s" : ""} due</div>
          </div>
          <div style={S.statBorder}>
            <div style={S.slabel}>Months paid</div>
            <div style={S.svalDark}>{paidMonthsCount}<span style={S.denom}> / 12</span></div>
            <div style={S.ssub}>{ledger.academicYear || "2025–26"}</div>
          </div>
        </div>

        {/* ── COURSE DETAILS ── */}
        <div style={{ ...S.section, flexShrink: 0 }}>
          <div style={S.secHd}>
            <div style={S.secTitle}>Course details</div>
          </div>
          <div style={S.courseGrid}>
            <div style={S.cfield}>
              <label style={S.cfieldLabel}>Course</label>
              <span style={S.cfieldVal}>{course?.title || "—"}</span>
            </div>
            <div style={S.cfieldBorder}>
              <label style={S.cfieldLabel}>Monthly fee</label>
              <span style={S.cfieldVal}>₹{feePerMonth.toLocaleString("en-IN")}</span>
            </div>
            <div style={S.cfieldBorder}>
              <label style={S.cfieldLabel}>Academic year</label>
              <span style={S.cfieldVal}>{ledger.academicYear || "2025–26"}</span>
            </div>
          </div>
        </div>

        {/* ── FILTERS ROW ── */}
        <div style={{ padding: "20px 24px 10px 24px", borderTop: "1px solid #f0f2f5", flexShrink: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#b0b7c3", letterSpacing: ".06em" }}>Academic Year</label>
              <select
                value={academicYearFilter}
                onChange={(e) => { setAcademicYearFilter(e.target.value); setCurrentPage(1); }}
                style={{ padding: "8px 12px", border: "1px solid #e8eaee", borderRadius: "8px", fontSize: "12px", color: "#374151", outline: "none", background: "#fff" }}
              >
                <option value="">All Years</option>
                {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#b0b7c3", letterSpacing: ".06em" }}>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                style={{ padding: "8px 12px", border: "1px solid #e8eaee", borderRadius: "8px", fontSize: "12px", color: "#374151", outline: "none", background: "#fff" }}
              >
                <option value="">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "#b0b7c3", letterSpacing: ".06em" }}>Month</label>
              <select
                value={monthSearch}
                onChange={(e) => { setMonthSearch(e.target.value); setCurrentPage(1); }}
                style={{ padding: "8px 12px", border: "1px solid #e8eaee", borderRadius: "8px", fontSize: "12px", color: "#374151", outline: "none", background: "#fff" }}
              >
                <option value="">All Months</option>
                {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── SCROLLABLE LEDGER AREA ── */}
        <div style={{ flex: 1, overflow: "auto", padding: "0 24px 20px 24px", minHeight: 0 }}>
          {filteredBills.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#b0b7c3", textAlign: "center", padding: "24px 0" }}>No matching records found.</p>
          ) : (
            <>
              <table style={S.table}>
                  <colgroup>
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "15%" }} />
                    <col style={{ width: "18%" }} />
                    <col style={{ width: "22%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th style={S.th}>Month</th>
                      <th style={S.th}>Fee</th>
                      <th style={S.th}>Paid</th>
                      <th style={S.th}>Due</th>
                      <th style={{ ...S.th, textAlign: "center", paddingRight: 0 }}>Status</th>
                      <th style={S.th}>Paid On</th>
                      <th style={S.thRight}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBills.map((b, idx) => {
                      const isPaid = b.pendingAmount === 0;
                      const isPartial = b.paidAmount > 0 && b.pendingAmount > 0;
                      const isLast = idx === paginatedBills.length - 1;
                      const tdStyle = { ...S.td, ...(isLast ? { borderBottom: "none" } : {}) };
                      const tdRightStyle = { ...S.tdRight, ...(isLast ? { borderBottom: "none" } : {}) };

                      // Find all statement payments
                      const statementPayments = (payments || []).filter(
                        (p) => p.statement?._id === b._id || p.statement === b._id || (p.remarks && p.remarks.includes(b.month))
                      );

                      // Sort payments by date (newest first)
                      const sortedStatementPayments = [...statementPayments].sort(
                        (a, b) => new Date(b.date) - new Date(a.date)
                      );

                      const latestPayment = sortedStatementPayments[0];
                      const latestPaymentDate = latestPayment
                        ? formatDateSimple(latestPayment.date)
                        : "—";

                      let badge, badgeDot;
                      if (isPaid) {
                        badge = S.badgePaid; badgeDot = S.bdotPaid;
                      } else if (isPartial) {
                        badge = S.badgePartial; badgeDot = S.bdotPartial;
                      } else {
                        badge = S.badgeUnpaid; badgeDot = S.bdotUnpaid;
                      }

                      const isExpanded = expandedMonth === b.month;

                      return (
                        <React.Fragment key={b._id || b.month}>
                          <tr>
                            <td style={tdStyle}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                {statementPayments.length > 0 && (
                                  <button
                                    onClick={() => toggleExpandRow(b.month)}
                                    style={{
                                      background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "2px", color: "#1a56db"
                                    }}
                                    type="button"
                                  >
                                    {isExpanded ? (
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                                    ) : (
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                                    )}
                                  </button>
                                )}
                                <span
                                  style={{ ...S.fw, cursor: statementPayments.length > 0 ? "pointer" : "default" }}
                                  onClick={() => statementPayments.length > 0 && toggleExpandRow(b.month)}
                                >
                                  {b.month}
                                </span>
                                {statementPayments.length > 0 && (
                                  <span style={{ fontSize: "9px", color: "#1a56db", background: "#e8f0fe", padding: "1px 5px", borderRadius: "4px", fontWeight: "bold" }}>
                                    {statementPayments.length} txn
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={tdStyle}><span style={S.muted}>₹{(b.dueAmount || b.amountDue || 0).toLocaleString("en-IN")}</span></td>
                            <td style={tdStyle}><span style={b.paidAmount > 0 ? S.g : S.muted}>₹{(b.paidAmount || 0).toLocaleString("en-IN")}</span></td>
                            <td style={tdStyle}><span style={b.pendingAmount > 0 ? S.r : S.muted}>₹{(b.pendingAmount || 0).toLocaleString("en-IN")}</span></td>
                            <td style={{ ...tdStyle, textAlign: "center", paddingRight: 0 }}>
                              <span style={badge}>
                                <span style={badgeDot}></span>
                                {isPaid ? "Paid" : isPartial ? "Partial" : "Unpaid"}
                              </span>
                            </td>
                            <td style={tdStyle}><span style={S.bl}>{latestPaymentDate}</span></td>
                            <td style={tdRightStyle}>
                              {isPaid ? (
                                latestPayment && (
                                  <button
                                    style={S.btnOutline}
                                    onClick={() => onPrintReceipt(ledger, latestPayment)}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                    Receipt
                                  </button>
                                )
                              ) : (
                                <button
                                  style={S.btnPrimary}
                                  onClick={() => onRecordPayment(ledger, b.month)}
                                >
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                  Collect Fee
                                </button>
                              )}
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr>
                              <td colSpan="7" style={{ padding: "12px 16px", background: "#f8faff", borderRadius: "8px", borderBottom: "1px solid #edf2fb" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#1a56db", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                                    Payment Details
                                  </div>
                                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                                    <thead>
                                      <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                                        <th style={{ textAlign: "left", padding: "6px 4px", color: "#7a8db5", fontWeight: 600 }}>Date & Time</th>
                                        <th style={{ textAlign: "left", padding: "6px 4px", color: "#7a8db5", fontWeight: 600 }}>Amount</th>
                                        <th style={{ textAlign: "left", padding: "6px 4px", color: "#7a8db5", fontWeight: 600 }}>Mode</th>
                                        <th style={{ textAlign: "right", padding: "6px 4px", color: "#7a8db5", fontWeight: 600 }}>Receipt</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {sortedStatementPayments.map((p, pIdx) => {
                                        const dt = formatDateTime(p.date);
                                        const isOnline = p.mode === "Online" || p.mode === "Razorpay";
                                        return (
                                          <tr key={p._id || pIdx} style={{ borderBottom: pIdx < sortedStatementPayments.length - 1 ? "1px solid #e2e8f0" : "none" }}>
                                            <td style={{ padding: "8px 4px", color: "#374151" }}>
                                              <div style={{ fontWeight: 500 }}>{dt.date}</div>
                                              <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "1px" }}>{dt.time}</div>
                                            </td>
                                            <td style={{ padding: "8px 4px", fontWeight: 600, color: "#059669" }}>₹{p.amount.toLocaleString("en-IN")}</td>
                                            <td style={{ padding: "8px 4px" }}>
                                              <span style={isOnline ? S.modeTagOnline : S.modeTagCash}>{isOnline ? "Online" : p.mode}</span>
                                            </td>
                                            <td style={{ padding: "8px 4px", textAlign: "right" }}>
                                              <button
                                                style={S.btnIcon}
                                                onClick={() => onPrintReceipt(ledger, p)}
                                                aria-label="Download receipt"
                                              >
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                              </button>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px", borderTop: "1px solid #f0f2f5", paddingTop: "12px" }}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    style={{ padding: "6px 12px", border: "1px solid #e8eaee", background: "#fff", borderRadius: "6px", fontSize: "12px", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1, fontWeight: 500 }}
                  >
                    Previous
                  </button>
                  <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: 500 }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    style={{ padding: "6px 12px", border: "1px solid #e8eaee", background: "#fff", borderRadius: "6px", fontSize: "12px", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1, fontWeight: 500 }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div style={{ ...S.mf, flexShrink: 0 }}>
          <div style={{ fontSize: "11px", color: "#b0b7c3" }}>
            Managed by Admin
          </div>
          <button style={{ ...S.btnOutline, fontSize: "13px", padding: "7px 18px" }} onClick={onClose}>Close</button>
        </div>

      </div>
    </div>
  );
}
