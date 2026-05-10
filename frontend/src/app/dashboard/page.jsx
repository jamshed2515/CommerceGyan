"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = "http://localhost:5000";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [notes, setNotes] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    Promise.all([
      fetch(`${API}/api/auth/me`, { headers }).then(r => r.json()),
      fetch(`${API}/api/announcements`).then(r => r.json()),
      fetch(`${API}/api/notes`, { headers }).then(r => r.json()),
      fetch(`${API}/api/payments/history`, { headers }).then(r => r.json()),
    ]).then(([u, a, n, p]) => {
      if (u.message === "Invalid or expired token") { router.push("/login"); return; }
      setUser(u); setAnnouncements(Array.isArray(a) ? a : []); setNotes(Array.isArray(n) ? n : []); setPayments(Array.isArray(p) ? p : []);
      setLoading(false);
    }).catch(() => { router.push("/login"); });
  }, []);

  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("user"); router.push("/login"); };

  const handlePayFee = async () => {
    try {
      const res = await fetch(`${API}/api/payments/create-order`, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ amount: 5000 }) });
      const order = await res.json();
      const rzpKey = order.key || "rzp_test_123456";
      const options = {
        key: rzpKey, amount: order.amount, currency: "INR", name: "Commerce Giyan",
        description: "Fee Payment", order_id: order.id,
        handler: async (response) => {
          const vRes = await fetch(`${API}/api/payments/verify`, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ ...response, paymentDocId: order.paymentDocId }) });
          const vData = await vRes.json();
          if (vRes.ok) { alert("✅ Payment successful!"); setUser(u => ({ ...u, feeStatus: "paid" })); }
          else alert("Payment verification failed: " + vData.message);
        },
        theme: { color: "#1A3B70" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch { alert("Error initiating payment"); }
  };

  const tabs = [
    { id: "profile", icon: "👤", label: "Profile" },
    { id: "announcements", icon: "📢", label: "Announcements", badge: announcements.filter(a => a.isImportant).length },
    { id: "notes", icon: "📄", label: "Notes & PDFs" },
    { id: "fees", icon: "💳", label: "Fee Payment" },
    { id: "history", icon: "🧾", label: "Payment History" },
  ];

  if (loading) return (
    <div className="min-h-screen bg-[#F4F9FF] flex items-center justify-center">
      <div className="text-center"><div className="w-12 h-12 border-4 border-[#00AEEF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p className="text-[#1A3B70] font-bold">Loading your dashboard...</p></div>
    </div>
  );

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      <div className="min-h-screen bg-[#F4F9FF] font-[family-name:var(--font-mulish)]">
        {/* Topbar */}
        <header className="bg-[#1A3B70] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-lg">
          <Link href="/" className="text-[#FFCC00] font-black text-xl">Commerce<span className="text-white">Giyan</span></Link>
          <div className="flex items-center gap-4">
            <span className="text-white/80 text-sm hidden md:block">Welcome, <strong className="text-[#FFCC00]">{user?.name}</strong></span>
            <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors">Logout</button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
              <div className="text-center mb-5 pb-5 border-b border-gray-100">
                <div className="w-16 h-16 bg-[#1A3B70] text-white rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-3">{user?.name?.[0]?.toUpperCase()}</div>
                <h3 className="font-black text-[#1A3B70] text-base">{user?.name}</h3>
                <p className="text-gray-500 text-xs mt-0.5">{user?.stream} • {user?.className}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${user?.feeStatus === "paid" ? "bg-green-100 text-green-700" : user?.feeStatus === "partial" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                  Fee: {user?.feeStatus?.toUpperCase()}
                </span>
              </div>
              <nav className="space-y-1">
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? "bg-[#1A3B70] text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                    <span className="flex items-center gap-2">{tab.icon} {tab.label}</span>
                    {tab.badge > 0 && <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{tab.badge}</span>}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-5">

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-black text-[#1A3B70] mb-6">My Profile</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {[["Full Name", user?.name], ["Email", user?.email], ["Phone", user?.phone || "—"], ["Stream", user?.stream || "—"], ["Class / Course", user?.className || "—"], ["Address", user?.address || "—"]].map(([label, val]) => (
                    <div key={label} className="bg-[#F4F9FF] rounded-xl p-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
                      <p className="text-[#1A3B70] font-bold text-sm">{val}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4">
                  {[["Fee Status", user?.feeStatus?.toUpperCase(), user?.feeStatus === "paid" ? "text-green-600" : "text-red-600"],
                    ["Enrolled Courses", user?.enrolledCourses?.length || 0, "text-[#1A3B70]"],
                    ["Announcements", announcements.length, "text-[#00AEEF]"]
                  ].map(([label, val, color]) => (
                    <div key={label} className="bg-[#F4F9FF] rounded-xl p-4 text-center">
                      <p className={`text-2xl font-black ${color}`}>{val}</p>
                      <p className="text-xs text-gray-500 font-bold mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ANNOUNCEMENTS TAB */}
            {activeTab === "announcements" && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-[#1A3B70]">Announcements</h2>
                {announcements.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                    <p className="text-4xl mb-3">📢</p><p className="text-gray-400 font-bold">No announcements yet</p>
                  </div>
                ) : announcements.map(ann => (
                  <div key={ann._id} className={`bg-white rounded-2xl p-5 border shadow-sm ${ann.isImportant ? "border-red-300 bg-red-50" : "border-gray-100"}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{ann.isImportant ? "🚨" : "📌"}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-black text-[#1A3B70] text-base">{ann.title}</h3>
                          {ann.isImportant && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">IMPORTANT</span>}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{ann.body}</p>
                        <p className="text-gray-400 text-xs mt-2">{new Date(ann.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* NOTES TAB */}
            {activeTab === "notes" && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-[#1A3B70]">Notes & Study Material</h2>
                {notes.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                    <p className="text-4xl mb-3">📄</p><p className="text-gray-400 font-bold">No notes uploaded yet</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {notes.map(note => (
                      <div key={note._id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:border-[#00AEEF] transition-colors">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📄</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-[#1A3B70] text-sm truncate">{note.title}</h4>
                          <p className="text-gray-500 text-xs mt-0.5">{note.subject} • {note.className}</p>
                        </div>
                        <a href={`${API}${note.fileUrl}`} target="_blank" rel="noreferrer"
                          className="bg-[#1A3B70] text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#122A50] transition-colors flex-shrink-0">
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FEE PAYMENT TAB */}
            {activeTab === "fees" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-black text-[#1A3B70] mb-6">Fee Payment</h2>
                <div className={`rounded-2xl p-6 mb-6 ${user?.feeStatus === "paid" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{user?.feeStatus === "paid" ? "✅" : "⚠️"}</span>
                    <div>
                      <h3 className="font-black text-lg text-[#1A3B70]">Current Fee Status: <span className={user?.feeStatus === "paid" ? "text-green-600" : "text-red-600"}>{user?.feeStatus?.toUpperCase()}</span></h3>
                      <p className="text-gray-600 text-sm mt-1">{user?.feeStatus === "paid" ? "Your fees are paid. Thank you!" : "Please pay your fees to continue your classes."}</p>
                    </div>
                  </div>
                </div>
                {user?.feeStatus !== "paid" && (
                  <button onClick={handlePayFee}
                    className="w-full md:w-auto bg-[#1A3B70] text-white font-black px-8 py-4 rounded-xl hover:bg-[#122A50] transition-colors text-base shadow-lg">
                    💳 Pay Fees Online via Razorpay
                  </button>
                )}
                <div className="mt-6 p-4 bg-[#F4F9FF] rounded-xl border border-[#00AEEF]/20">
                  <p className="text-sm text-gray-600 font-medium">📞 For fee-related queries contact: <strong className="text-[#1A3B70]">+91 8271365450</strong></p>
                </div>
              </div>
            )}

            {/* PAYMENT HISTORY TAB */}
            {activeTab === "history" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-black text-[#1A3B70] mb-6">Payment History</h2>
                {payments.length === 0 ? (
                  <div className="text-center py-12"><p className="text-4xl mb-3">🧾</p><p className="text-gray-400 font-bold">No payments yet</p></div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-gray-100">
                        {["Date", "Amount", "Payment ID", "Status"].map(h => <th key={h} className="text-left py-3 px-4 font-bold text-gray-500 text-xs uppercase">{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {payments.map(p => (
                          <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-600">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                            <td className="py-3 px-4 font-bold text-[#1A3B70]">₹{p.amount}</td>
                            <td className="py-3 px-4 text-gray-500 text-xs">{p.razorpayPaymentId || "—"}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.status === "paid" ? "bg-green-100 text-green-700" : p.status === "failed" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{p.status.toUpperCase()}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
