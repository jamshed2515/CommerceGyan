"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API from "@/config/api";
import { validateSession, clearSession, getStoredToken } from "@/lib/auth";
import ReceiptGenerator from "@/components/admin/finance/components/ReceiptGenerator";

const statusCls = {
  "GOOD STANDING": "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30",
  "PARTIALLY PAID": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
  "DUE THIS MONTH": "bg-red-50 text-red-655 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30",
  "OVERDUE": "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60 font-black",
  Paid: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30",
  Partial: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
  Due: "bg-red-50 text-red-655 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30",
  Upcoming: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30",
};

const NAV = [
  { id: "overview", icon: "🏠", label: "Dashboard" },
  { id: "courses", icon: "📚", label: "My Courses" },
  { id: "schedule", icon: "📅", label: "Schedule" },
  { id: "announcements", icon: "📢", label: "Announcements" },
  { id: "faculty", icon: "👨‍🏫", label: "Faculty" },
  { id: "fees", icon: "💰", label: "Fee Status" },
  { id: "profile", icon: "👤", label: "Profile" },
];

export default function StudentDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [batch, setBatch] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [fees, setFees] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", address: "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [toast, setToast] = useState("");
  const [printingReceipt, setPrintingReceipt] = useState(null);

  const token = typeof window !== "undefined" ? getStoredToken() : null;
  const H = { Authorization: `Bearer ${token}` };

  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    // Server-side token validation — catches expired/invalid JWTs
    validateSession("student").then(({ valid, user: freshUser }) => {
      if (!valid) {
        clearSession();
        router.push("/login");
        return;
      }
      const token = getStoredToken();
      const H = { Authorization: `Bearer ${token}` };
      Promise.all([
        Promise.resolve(freshUser), // already validated above
        fetch(`${API}/api/announcements`).then(r => r.json()),
        fetch(`${API}/api/fees/my`, { headers: H }).then(r => r.json()),
        fetch(`${API}/api/notes`, { headers: H }).then(r => r.json()),
      ]).then(([u, a, f, n]) => {
        setUser(u);
        setProfileForm({
          name: u.name || "",
          phone: u.phone || "",
          address: u.address || "",
          parentName: u.parentName || "",
          parentPhone: u.parentPhone || "",
        });
        setAnnouncements(Array.isArray(a) ? a : []);
        setFees(Array.isArray(f) ? f : []);
        setNotes(Array.isArray(n) ? n : []);

        const batches = u.assignedBatches || [];
        if (batches.length > 0) {
          const batchIds = batches.map(b => b._id || b).join(",");
          fetch(`${API}/api/schedules?batch=${batchIds}`, { headers: H }).then(r => r.json()).then(s => {
            setSchedules(Array.isArray(s) ? s : []);
          });
          // Set primary batch for compatibility
          setBatch(batches[0]);
        } else if (u.batch?._id || u.batch) {
          const bId = u.batch?._id || u.batch;
          fetch(`${API}/api/schedules?batch=${bId}`, { headers: H }).then(r => r.json()).then(s => {
            setSchedules(Array.isArray(s) ? s : []);
          });
          fetch(`${API}/api/batches/${bId}`, { headers: H }).then(r => r.json()).then(b => setBatch(b));
        }
        setLoading(false);
      }).catch(() => { clearSession(); router.push("/login"); });
    });
  }, []);

  const handleLogout = () => { localStorage.clear(); router.push("/login"); };

  const handleProfileSave = async () => {
    const res = await fetch(`${API}/api/auth/profile`, { method: "PUT", headers: { ...H, "Content-Type": "application/json" }, body: JSON.stringify(profileForm) });
    if (res.ok) flash("✅ Profile updated!");
    else flash("❌ Update failed");
  };

  const handlePwChange = async () => {
    const res = await fetch(`${API}/api/auth/change-password`, { method: "PUT", headers: { ...H, "Content-Type": "application/json" }, body: JSON.stringify(pwForm) });
    const d = await res.json();
    flash(res.ok ? "✅ Password changed!" : "❌ " + d.message);
    if (res.ok) setPwForm({ currentPassword: "", newPassword: "" });
  };

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

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    return `${formatDate(dateStr)}, ${formatTime(dateStr)}`;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayOnline = async (ledger, statement) => {
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        flash("❌ Razorpay SDK failed to load. Are you online?");
        return;
      }

      const token = getStoredToken();
      const res = await fetch(`${API}/api/payments/create-order`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: statement.pendingAmount,
          ledgerId: ledger._id,
          month: statement.month,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to create order");
      }

      const orderData = await res.json();

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Commerce Gyan",
        description: `Fee Payment for ${statement.month}`,
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API}/api/payments/verify`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentDocId: orderData.paymentDocId,
              }),
            });

            if (verifyRes.ok) {
              flash("🎉 Payment successful & verified!");
              const updatedFeesRes = await fetch(`${API}/api/fees/my`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (updatedFeesRes.ok) {
                const updatedFees = await updatedFeesRes.json();
                setFees(Array.isArray(updatedFees) ? updatedFees : []);
              }
            } else {
              const errData = await verifyRes.json();
              flash(`❌ Verification failed: ${errData.message || "Unknown error"}`);
            }
          } catch (verifyErr) {
            flash("❌ Verification process failed");
            console.error(verifyErr);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#1A3B70",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      flash(`❌ Order failed: ${err.message}`);
      console.error(err);
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const todaySchedule = schedules.filter(s => s.dayOfWeek === today);
  const feeRec = fees[0];

  const getNotificationAlerts = () => {
    const alerts = [];
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    fees.forEach(ledger => {
      const courseTitle = ledger.course?.title || "Enrolled Course";
      (ledger.monthlyBills || []).forEach(stmt => {
        if (stmt.status === "Paid" || stmt.pendingAmount <= 0) return;
        
        const due = new Date(stmt.dueDate);
        const dueStart = new Date(due.getFullYear(), due.getMonth(), due.getDate());
        
        const diffTime = dueStart.getTime() - todayStart.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0 || stmt.status === "Overdue") {
          alerts.push({
            type: "danger",
            message: `⚠️ Fee statement for ${courseTitle} (${stmt.month}) is OVERDUE! Pending: ₹${stmt.pendingAmount.toLocaleString("en-IN")}. Please clear it immediately.`,
            id: `overdue-${stmt._id}`
          });
        } else if (diffDays === 0) {
          alerts.push({
            type: "warning",
            message: `⏰ Fee statement of ₹${stmt.pendingAmount.toLocaleString("en-IN")} for ${courseTitle} (${stmt.month}) is due TODAY!`,
            id: `today-${stmt._id}`
          });
        } else if (diffDays > 0 && diffDays <= 5) {
          alerts.push({
            type: "info",
            message: `ℹ️ Fee statement of ₹${stmt.pendingAmount.toLocaleString("en-IN")} for ${courseTitle} (${stmt.month}) is due in ${diffDays} day${diffDays > 1 ? "s" : ""}.`,
            id: `upcoming-${stmt._id}`
          });
        }
      });
    });
    return alerts;
  };

  const inp = "w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-[#00AEEF] outline-none text-sm bg-gray-50 focus:bg-white transition-all";
  const card = "bg-white rounded-2xl border border-gray-100 shadow-sm p-5";

  if (loading) return (
    <div className="min-h-screen bg-[#F4F9FF] flex items-center justify-center">
      <div className="text-center"><div className="w-12 h-12 border-4 border-[#1A3B70] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div><p className="text-[#1A3B70] font-bold">Loading dashboard...</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F9FF] font-[family-name:var(--font-mulish)] flex">
      {toast && <div className="fixed top-4 right-4 z-50 bg-[#1A3B70] text-white px-5 py-3 rounded-xl shadow-xl font-bold text-sm">{toast}</div>}

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 shadow-sm flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-5 border-b border-gray-100">
          <Link href="/" className="text-[#1A3B70] font-black text-lg">Commerce<span className="text-[#00AEEF]">Gyan</span></Link>
          <div className="mt-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A3B70] text-white rounded-full flex items-center justify-center font-black text-sm">{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <p className="font-bold text-[#1A3B70] text-sm leading-tight">{user?.name}</p>
              <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">STUDENT</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(n => (
            <button key={n.id} onClick={() => { setTab(n.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${tab === n.id ? "bg-[#1A3B70] text-white" : "text-gray-600 hover:bg-gray-50"}`}>
              <span>{n.icon}</span><span>{n.label}</span>
              {n.id === "announcements" && announcements.filter(a => a.isImportant).length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{announcements.filter(a => a.isImportant).length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="font-black text-[#1A3B70] text-lg">{NAV.find(n => n.id === tab)?.label}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden md:block">Hi, <strong className="text-[#1A3B70]">{user?.name?.split(" ")[0]}</strong></span>
            <Link href="/" className="text-xs font-bold text-[#00AEEF] hover:underline">View Site</Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto pb-20 lg:pb-6">
          {/* Alerts Banner */}
          {(() => {
            const alerts = getNotificationAlerts();
            if (alerts.length === 0) return null;
            return (
              <div className="mb-6 space-y-3">
                {alerts.map(alert => (
                  <div key={alert.id} className={`p-4 rounded-xl border flex items-center justify-between shadow-sm transition-all duration-150 ${
                    alert.type === "danger" ? "bg-red-50 border-red-200 text-red-800" :
                    alert.type === "warning" ? "bg-amber-50 border-amber-200 text-amber-800" :
                    "bg-blue-50 border-blue-200 text-blue-800"
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {alert.type === "danger" ? "🚨" : alert.type === "warning" ? "⏰" : "ℹ️"}
                      </span>
                      <p className="text-sm font-bold">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Enrolled Courses", val: user?.assignedBatches?.map(b => b.course?.title).filter(Boolean).join(", ") || batch?.course?.title || (user?.stream || "—"), color: "text-[#1A3B70]", bg: "bg-blue-50", icon: "📚" },
                  { label: "Batch Timings", val: user?.assignedBatches?.map(b => b.timing).filter(Boolean).join(" | ") || batch?.timing || user?.batch?.timing || "Not assigned", color: "text-[#00AEEF]", bg: "bg-cyan-50", icon: "⏰" },
                  { label: "Today's Classes", val: todaySchedule.length, color: "text-green-600", bg: "bg-green-50", icon: "📅" },
                  { label: "Announcements", val: announcements.length, color: "text-orange-500", bg: "bg-orange-50", icon: "📢" },
                ].map((c, i) => (
                  <div key={i} className={`${card} flex items-center gap-4`}>
                    <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center text-2xl`}>{c.icon}</div>
                    <div className="min-w-0">
                      <p className={`font-black text-lg ${c.color} truncate`}>{c.val}</p>
                      <p className="text-xs text-gray-500 font-semibold">{c.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Today's schedule */}
              <div className={card}>
                <h3 className="font-black text-[#1A3B70] mb-4">📅 Today's Schedule ({today})</h3>
                {todaySchedule.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No classes today 🎉</p>
                ) : (
                  <div className="space-y-3">
                    {todaySchedule.map(s => {
                      const fmtT = (t) => { if (!t) return "—"; const [h,m]=t.split(":"); const hr=parseInt(h,10); return `${hr%12||12}:${m} ${hr>=12?"PM":"AM"}`; };
                      return (
                      <div key={s._id} className="flex items-center gap-4 bg-[#F4F9FF] rounded-xl px-4 py-3">
                        <div className="w-2 h-2 rounded-full bg-[#00AEEF] flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="font-bold text-[#1A3B70] text-sm">{s.subject}</p>
                          <p className="text-xs text-gray-500">{s.teacher?.name || "—"}</p>
                        </div>
                        <span className="text-xs font-bold bg-white border border-gray-200 px-3 py-1 rounded-full">{fmtT(s.startTime)} – {fmtT(s.endTime)}</span>
                      </div>);
                    })}
                  </div>
                )}
              </div>

              {/* Latest announcements */}
              <div className={card}>
                <h3 className="font-black text-[#1A3B70] mb-4">📢 Latest Announcements</h3>
                <div className="space-y-3">
                  {announcements.slice(0, 3).map(a => (
                    <div key={a._id} className={`rounded-xl p-3 border ${a.isImportant ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-100"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-[#1A3B70] text-sm">{a.title}</span>
                        {a.isImportant && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">URGENT</span>}
                      </div>
                      <p className="text-xs text-gray-500">{a.body}</p>
                    </div>
                  ))}
                  {announcements.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No announcements yet</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── MY COURSES ── */}
          {tab === "courses" && (
            <div className="space-y-4">
              {user?.assignedBatches && user.assignedBatches.length > 0 ? (
                user.assignedBatches.map((b) => (
                  <div key={b._id} className={`${card} mb-4`}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-[#E6F4FE] rounded-xl flex items-center justify-center text-3xl">📚</div>
                      <div>
                        <h2 className="font-black text-[#1A3B70] text-xl">{b.course?.title || "—"}</h2>
                        <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">ENROLLED</span>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        ["Batch", b.batchName],
                        ["Timing", b.timing || "—"],
                        ["Teacher", b.teacher?.name || "—"],
                        ["Course Fee", b.course?.price ? `₹${b.course.price}` : "—"],
                      ].map(([l, v]) => (
                        <div key={l} className="bg-[#F4F9FF] rounded-xl p-4">
                          <p className="text-xs font-bold text-gray-400 uppercase">{l}</p>
                          <p className="font-bold text-[#1A3B70] mt-1">{v}</p>
                        </div>
                      ))}
                    </div>
                    {b.course?.description && (
                      <div className="mt-4 bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Description</p>
                        <p className="text-sm text-gray-600">{b.course.description}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : batch ? (
                <div className={card}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-[#E6F4FE] rounded-xl flex items-center justify-center text-3xl">📚</div>
                    <div>
                      <h2 className="font-black text-[#1A3B70] text-xl">{batch.course?.title || "—"}</h2>
                      <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">ENROLLED</span>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      ["Batch", batch.batchName],
                      ["Timing", batch.timing || "—"],
                      ["Teacher", batch.teacher?.name || "—"],
                      ["Course Fee", batch.course?.price ? `₹${batch.course.price}` : "—"],
                    ].map(([l, v]) => (
                      <div key={l} className="bg-[#F4F9FF] rounded-xl p-4">
                        <p className="text-xs font-bold text-gray-400 uppercase">{l}</p>
                        <p className="font-bold text-[#1A3B70] mt-1">{v}</p>
                      </div>
                    ))}
                  </div>
                  {batch.course?.description && (
                    <div className="mt-4 bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Description</p>
                      <p className="text-sm text-gray-600">{batch.course.description}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`${card} text-center py-16`}>
                  <p className="text-4xl mb-3">📚</p>
                  <p className="font-bold text-gray-500">You are not assigned to any batch yet.</p>
                  <p className="text-sm text-gray-400 mt-1">Please contact the admin.</p>
                </div>
              )}
            </div>
          )}

          {/* ── SCHEDULE ── */}
          {tab === "schedule" && (() => {
            const fmtTime = (t) => { if (!t) return "—"; const [h,m]=t.split(":"); const hr=parseInt(h,10); return `${hr%12||12}:${m} ${hr>=12?"PM":"AM"}`; };
            const dayColors = {
              Monday:{bg:"bg-blue-50",text:"text-blue-700",dot:"bg-blue-500"},
              Tuesday:{bg:"bg-purple-50",text:"text-purple-700",dot:"bg-purple-500"},
              Wednesday:{bg:"bg-emerald-50",text:"text-emerald-700",dot:"bg-emerald-500"},
              Thursday:{bg:"bg-amber-50",text:"text-amber-700",dot:"bg-amber-500"},
              Friday:{bg:"bg-rose-50",text:"text-rose-700",dot:"bg-rose-500"},
              Saturday:{bg:"bg-cyan-50",text:"text-cyan-700",dot:"bg-cyan-500"},
              Sunday:{bg:"bg-orange-50",text:"text-orange-700",dot:"bg-orange-500"},
            };
            return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-[#1A3B70]">📅 My Schedule</h2>
                  <p className="text-sm text-gray-500 mt-1">{batch?.batchName || "Batch"} • {schedules.length} class{schedules.length !== 1 ? "es" : ""}</p>
                </div>
              </div>
              {schedules.length === 0 ? (
                <div className={`${card} text-center py-16`}>
                  <p className="text-4xl mb-3">📅</p>
                  <p className="font-bold text-gray-500">No schedule assigned yet.</p>
                  <p className="text-sm text-gray-400 mt-1">Contact your teacher or admin.</p>
                </div>
              ) : (
                days.map(day => {
                  const daySched = schedules.filter(s => s.dayOfWeek === day).sort((a,b) => a.startTime.localeCompare(b.startTime));
                  if (daySched.length === 0) return null;
                  const dc = dayColors[day];
                  const isToday = day === today;
                  return (
                    <div key={day} className={`bg-white rounded-2xl border ${isToday ? "border-green-300 ring-2 ring-green-100" : "border-gray-100"} shadow-sm overflow-hidden`}>
                      <div className={`${dc.bg} px-5 py-3 flex items-center justify-between`}>
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${dc.dot}`}></span>
                          <span className={`${dc.text} font-black text-sm uppercase tracking-wider`}>{day}</span>
                          {isToday && <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">TODAY</span>}
                        </div>
                        <span className={`${dc.text} text-xs font-bold`}>{daySched.length} class{daySched.length > 1 ? "es" : ""}</span>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {daySched.map(s => (
                          <div key={s._id} className="px-5 py-3 flex items-center gap-4">
                            <div className="w-20 text-center flex-shrink-0">
                              <p className="text-xs font-black text-[#1A3B70]">{fmtTime(s.startTime)}</p>
                              <p className="text-[10px] text-gray-400">to {fmtTime(s.endTime)}</p>
                            </div>
                            <div className={`w-1 h-10 rounded-full ${dc.dot}`}></div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[#1A3B70] text-sm">{s.subject}</p>
                              <p className="text-xs text-gray-500">👨‍🏫 {s.teacher?.name || "—"}</p>
                            </div>
                            {s.note && <span className="text-xs text-gray-400 hidden md:block">📝 {s.note}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>);
          })()}

          {/* ── ANNOUNCEMENTS ── */}
          {tab === "announcements" && (
            <div className="space-y-4">
              {announcements.length === 0 ? (
                <div className={`${card} text-center py-16`}><p className="text-4xl mb-3">📢</p><p className="font-bold text-gray-500">No announcements yet.</p></div>
              ) : announcements.map(a => (
                <div key={a._id} className={`${card} ${a.isImportant ? "border-red-300" : ""}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{a.isImportant ? "🚨" : "📌"}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-black text-[#1A3B70]">{a.title}</h3>
                        {a.isImportant && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">URGENT</span>}
                      </div>
                      <p className="text-gray-600 text-sm">{a.body}</p>
                      <p className="text-gray-400 text-xs mt-2">{new Date(a.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── FACULTY ── */}
          {tab === "faculty" && (
            <div className="space-y-4">
              {user?.assignedBatches && user.assignedBatches.length > 0 ? (
                user.assignedBatches.map((b) => b.teacher && (
                  <div key={b._id} className={`${card} flex items-center gap-6 mb-4`}>
                    <div className="w-16 h-16 bg-[#1A3B70] text-white rounded-full flex items-center justify-center font-black text-2xl flex-shrink-0">
                      {b.teacher.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h2 className="font-black text-[#1A3B70] text-xl">{b.teacher.name}</h2>
                      <p className="text-gray-500 text-sm">{b.teacher.subject || b.course?.title || "Commerce & Professional"}</p>
                      {b.teacher.phone && <p className="text-[#00AEEF] text-sm font-bold mt-1">📞 {b.teacher.phone}</p>}
                    </div>
                  </div>
                ))
              ) : batch?.teacher ? (
                <div className={`${card} flex items-center gap-6`}>
                  <div className="w-16 h-16 bg-[#1A3B70] text-white rounded-full flex items-center justify-center font-black text-2xl flex-shrink-0">
                    {batch.teacher.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-black text-[#1A3B70] text-xl">{batch.teacher.name}</h2>
                    <p className="text-gray-500 text-sm">{batch.teacher.subject || "Commerce & Professional"}</p>
                    {batch.teacher.phone && <p className="text-[#00AEEF] text-sm font-bold mt-1">📞 {batch.teacher.phone}</p>}
                  </div>
                </div>
              ) : (
                <div className={`${card} text-center py-16`}><p className="text-4xl mb-3">👨‍🏫</p><p className="font-bold text-gray-500">No faculty assigned yet.</p></div>
              )}
            </div>
          )}

          {/* ── FEE STATUS ── */}
          {tab === "fees" && (
            <div className="space-y-8">
              {fees.length === 0 ? (
                <div className={`${card} text-center py-16`}>
                  <p className="text-4xl mb-3">💰</p>
                  <p className="font-bold text-gray-500">No active fee account assigned.</p>
                  <p className="text-sm text-gray-400 mt-1">Please contact the administration center to set up your fee account.</p>
                </div>
              ) : (
                fees.map((ledger) => {
                  const courseTitle = ledger.course?.title || "Enrolled Course";
                  return (
                    <div key={ledger._id} className="bg-white rounded-3xl border border-gray-100 shadow-md p-6 space-y-6">
                      {/* Course Info Banner */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-blue-50 text-[#1A3B70] rounded-2xl flex items-center justify-center text-2xl font-black">
                            📚
                          </div>
                          <div>
                            <h2 className="font-black text-[#1A3B70] text-xl">{courseTitle}</h2>
                            <p className="text-xs text-gray-500 font-semibold mt-0.5">Account No: #{ledger._id?.slice(-8).toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Status:</span>
                          <span
                            className={`text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider border ${
                              statusCls[ledger.status] ||
                              "bg-slate-50 text-slate-655 border-slate-200"
                            }`}
                          >
                            {ledger.status}
                          </span>
                        </div>
                      </div>

                      {/* Numeric Breakdowns */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[
                          { label: "Total Billed Fee", val: `₹${(ledger.totalFees || 0).toLocaleString("en-IN")}`, style: "text-gray-600 font-bold" },
                          { label: "Scholarship / Disc.", val: `- ₹${(ledger.discount || 0).toLocaleString("en-IN")}`, style: "text-gray-500 font-semibold" },
                          { label: "Net Payable Fee", val: `₹${(ledger.netFee || 0).toLocaleString("en-IN")}`, style: "text-[#1A3B70] font-black text-sm" },
                          { label: "Amount Paid", val: `₹${(ledger.paidAmount || 0).toLocaleString("en-IN")}`, style: "text-green-600 font-bold" },
                          { label: "Remaining Balance", val: `₹${(ledger.remainingAmount || 0).toLocaleString("en-IN")}`, style: "text-red-500 font-black" },
                        ].map((item, idx) => (
                          <div key={idx} className="bg-blue-50/40 rounded-xl p-3 text-center border border-blue-50/20">
                            <p className={`text-base font-extrabold ${item.style}`}>{item.val}</p>
                            <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-wide">{item.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Month-wise Fee History Table */}
                      <div>
                        <h3 className="font-black text-[#1A3B70] text-sm mb-3">📅 Month-wise Fee History</h3>
                        {!ledger.monthlyBills || ledger.monthlyBills.length === 0 ? (
                          <p className="text-gray-400 text-xs text-center py-4 bg-gray-50 rounded-xl">No fee records generated.</p>
                        ) : (
                          <div className="overflow-x-auto rounded-xl border border-gray-100">
                            <table className="w-full text-xs text-left">
                              <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                  {["Month", "Fee", "Paid", "Due", "Status", "Actions"].map((th) => (
                                    <th key={th} className="py-2.5 px-3 font-black text-gray-500 uppercase tracking-wide">
                                      {th}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {ledger.monthlyBills.map((s) => {
                                  const monthPayment = ledger.payments?.find(
                                    (p) => p.statement?._id === s._id || p.statement === s._id || (p.remarks && p.remarks.includes(s.month))
                                  ) || ledger.payments?.[0];
                                  return (
                                    <tr key={s._id || s.month} className="hover:bg-gray-50/50 transition-colors">
                                      <td className="py-2.5 px-3 font-bold text-gray-800">{s.month}</td>
                                      <td className="py-2.5 px-3 text-gray-805 font-bold">₹{s.dueAmount.toLocaleString("en-IN")}</td>
                                      <td className="py-2.5 px-3 text-green-600 font-bold">₹{s.paidAmount.toLocaleString("en-IN")}</td>
                                      <td className="py-2.5 px-3 text-red-500 font-bold">₹{s.pendingAmount.toLocaleString("en-IN")}</td>
                                      <td className="py-2.5 px-3">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                          statusCls[s.status] ||
                                          "bg-slate-50 text-slate-655 border-slate-200"
                                        }`}>
                                          {s.status}
                                        </span>
                                      </td>
                                      <td className="py-2.5 px-3">
                                        <div className="flex items-center gap-2">
                                          {s.pendingAmount > 0 ? (
                                            <button
                                              onClick={() => handlePayOnline(ledger, s)}
                                              className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                                            >
                                              Pay Online
                                            </button>
                                          ) : (
                                            monthPayment && (
                                              <button
                                                onClick={() => {
                                                  setPrintingReceipt({ ledger, payment: monthPayment });
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

                      {/* Payments & Receipts Listing */}
                      <div>
                        <h3 className="font-black text-[#1A3B70] text-sm mb-3">💳 Payment History</h3>
                        {!ledger.payments || ledger.payments.length === 0 ? (
                          <p className="text-gray-400 text-xs text-center py-4 bg-gray-50 rounded-xl">No payments recorded yet.</p>
                        ) : (
                          <div className="overflow-x-auto rounded-xl border border-gray-100">
                            <table className="w-full text-xs text-left">
                              <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                  {["Date & Time", "Month", "Amount", "Mode", "Reference", "Collected By", "Receipt"].map((th) => (
                                    <th key={th} className="py-2.5 px-3 font-black text-gray-500 uppercase tracking-wide">
                                      {th}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {ledger.payments.map((p) => (
                                  <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-2.5 px-3 font-semibold text-gray-600">
                                      {formatDateTime(p.date)}
                                    </td>
                                    <td className="py-2.5 px-3 font-bold text-blue-600">
                                      {p.statement?.month || (p.remarks && p.remarks.match(/[A-Za-z]+ \d{4}/)?.[0]) || "—"}
                                    </td>
                                    <td className="py-2.5 px-3 font-black text-green-600">
                                      ₹{(p.amount || 0).toLocaleString("en-IN")}
                                    </td>
                                    <td className="py-2.5 px-3 text-gray-500 font-semibold">{p.mode}</td>
                                    <td className="py-2.5 px-3 text-gray-400 font-medium max-w-xs truncate" title={p.remarks}>
                                      {p.reference || p.remarks || "—"}
                                    </td>
                                    <td className="py-2.5 px-3 text-gray-550 font-medium">
                                      {(() => {
                                        const cb = p.collectedBy || (p.mode === "Razorpay" ? "Online Payment Gateway" : "Admin");
                                        if (cb === "Online Payment Gateway" || cb === "Online") {
                                          return "Online";
                                        }
                                        if (cb === "Admin") {
                                          return "Admin Recorded";
                                        }
                                        if (cb === "Super Admin") {
                                          return "Staff Recorded";
                                        }
                                        return cb;
                                      })()}
                                    </td>
                                    <td className="py-2.5 px-3">
                                      <button
                                        onClick={() => {
                                          setPrintingReceipt({ ledger, payment: p });
                                          setTimeout(() => {
                                            window.print();
                                          }, 500);
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-sm"
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

                      {ledger.notes && (
                        <div className="bg-gray-50 rounded-xl p-3.5 text-xs text-gray-600 border border-gray-100">
                          <strong>Official Remarks:</strong> {ledger.notes}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              
              {/* Contact Admin support notice */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="text-xs text-gray-500 font-semibold">
                  📞 For fee related questions or installment support, please call:{" "}
                  <strong className="text-[#1A3B70]">+91 82713 65450</strong> or email <strong className="text-[#1A3B70]">commercegiyan@gmail.com</strong>.
                </p>
              </div>
            </div>
          )}

          {/* ── PROFILE ── */}
          {tab === "profile" && (
            <div className="space-y-4 max-w-lg">
              <div className={card}>
                <h3 className="font-black text-[#1A3B70] mb-4">🎓 Academic Profile Details</h3>
                <div className="space-y-3 bg-[#F4F9FF] rounded-2xl p-5 mb-4 border border-gray-100 text-sm">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block">Registration Number</span>
                    <strong className="font-black text-[#1A3B70] text-base mt-0.5">{user?.registrationNumber || "Not assigned"}</strong>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase block">Class</span>
                      <strong className="font-black text-[#1A3B70] mt-0.5 block">{user?.className || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase block">Stream</span>
                      <strong className="font-black text-[#1A3B70] mt-0.5 block">{user?.stream || "—"}</strong>
                    </div>
                  </div>
                </div>

                <h3 className="font-black text-[#1A3B70] mb-4">✏️ Edit Personal Details</h3>
                <div className="space-y-3">
                  {[["Name", "name", "text"], ["Phone", "phone", "text"], ["Address", "address", "text"]].map(([l, k, t]) => (
                    <div key={k}>
                      <label className="text-xs font-bold text-gray-500 uppercase block mb-1">{l}</label>
                      <input type={t} value={profileForm[k] || ""} onChange={e => setProfileForm({ ...profileForm, [k]: e.target.value })} className={inp} />
                    </div>
                  ))}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Parent Name</label>
                      <input type="text" value={profileForm.parentName || ""} readOnly className={`${inp} bg-slate-100 cursor-not-allowed`} title="Contact Admin to update Parent details" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Parent Phone</label>
                      <input type="text" value={profileForm.parentPhone || ""} readOnly className={`${inp} bg-slate-100 cursor-not-allowed`} title="Contact Admin to update Parent details" />
                    </div>
                  </div>

                  <button onClick={handleProfileSave} className="bg-[#1A3B70] text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#122A50] transition-colors mt-2">Save Changes</button>
                </div>
              </div>
              <div className={card}>
                <h3 className="font-black text-[#1A3B70] mb-4">🔒 Change Password</h3>
                <div className="space-y-3">
                  {[["Current Password", "currentPassword"], ["New Password", "newPassword"]].map(([l, k]) => (
                    <div key={k}>
                      <label className="text-xs font-bold text-gray-500 uppercase block mb-1">{l}</label>
                      <input type="password" value={pwForm[k]} onChange={e => setPwForm({ ...pwForm, [k]: e.target.value })} className={inp} />
                    </div>
                  ))}
                  <button onClick={handlePwChange} className="bg-[#00AEEF] text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#009CD6] transition-colors">Update Password</button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {printingReceipt && (
        <ReceiptGenerator
          ledger={printingReceipt.ledger}
          payment={printingReceipt.payment}
          onClose={() => setPrintingReceipt(null)}
        />
      )}
    </div>
  );
}
