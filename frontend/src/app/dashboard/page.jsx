"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API from "@/lib/api";
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

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const H = { Authorization: `Bearer ${token}` };

  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    Promise.all([
      fetch(`${API}/api/auth/me`, { headers: H }).then(r => r.json()),
      fetch(`${API}/api/announcements`).then(r => r.json()),
      fetch(`${API}/api/fees/my`, { headers: H }).then(r => r.json()),
      fetch(`${API}/api/notes`, { headers: H }).then(r => r.json()),
    ]).then(([u, a, f, n]) => {
      if (u.message === "Invalid or expired token") { router.push("/login"); return; }
      setUser(u);
      setProfileForm({ name: u.name || "", phone: u.phone || "", address: u.address || "" });
      setAnnouncements(Array.isArray(a) ? a : []);
      setFees(Array.isArray(f) ? f : []);
      setNotes(Array.isArray(n) ? n : []);
      if (u.batch?._id || u.batch) {
        const bId = u.batch?._id || u.batch;
        fetch(`${API}/api/schedules?batch=${bId}`, { headers: H }).then(r => r.json()).then(s => {
          setSchedules(Array.isArray(s) ? s : []);
        });
        fetch(`${API}/api/batches/${bId}`, { headers: H }).then(r => r.json()).then(b => setBatch(b));
      }
      setLoading(false);
    }).catch(() => router.push("/login"));
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

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const todaySchedule = schedules.filter(s => s.dayOfWeek === today);
  const feeRec = fees[0];

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

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Enrolled Course", val: batch?.course?.title || (user?.stream || "—"), color: "text-[#1A3B70]", bg: "bg-blue-50", icon: "📚" },
                  { label: "Batch Timing", val: batch?.timing || user?.batch?.timing || "Not assigned", color: "text-[#00AEEF]", bg: "bg-cyan-50", icon: "⏰" },
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
              {batch ? (
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
              {batch?.teacher ? (
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
            <div className="space-y-4">
              {feeRec ? (
                <>
                  <div className={`${card} border-2 ${feeRec.status === "Paid" ? "border-green-400" : feeRec.status === "PartialPaid" ? "border-yellow-400" : "border-red-400"}`}>
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-5xl">{feeRec.status === "Paid" ? "✅" : feeRec.status === "PartialPaid" ? "⚠️" : "❌"}</span>
                      <div>
                        <h2 className="font-black text-[#1A3B70] text-xl">Fee Status</h2>
                        <span className={`text-sm font-black px-3 py-1 rounded-full ${feeRec.status === "Paid" ? "bg-green-100 text-green-700" : feeRec.status === "PartialPaid" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{feeRec.status.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        ["Total Fees", `₹${feeRec.totalFees}`, "text-[#1A3B70]"],
                        ["Paid", `₹${feeRec.paidAmount}`, "text-green-600"],
                        ["Remaining", `₹${feeRec.remainingAmount}`, "text-red-500"],
                      ].map(([l, v, c]) => (
                        <div key={l} className="bg-[#F4F9FF] rounded-xl p-4 text-center">
                          <p className={`text-2xl font-black ${c}`}>{v}</p>
                          <p className="text-xs text-gray-500 font-bold mt-1">{l}</p>
                        </div>
                      ))}
                    </div>
                    {feeRec.notes && <div className="mt-4 bg-gray-50 rounded-xl p-3 text-sm text-gray-600"><strong>Note:</strong> {feeRec.notes}</div>}
                    <p className="text-xs text-gray-400 mt-3">Last updated: {new Date(feeRec.lastUpdated).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div className={card}>
                    <p className="text-sm text-gray-600">📞 For fee queries contact: <strong className="text-[#1A3B70]">+91 8271365450</strong></p>
                  </div>
                </>
              ) : (
                <div className={`${card} text-center py-16`}><p className="text-4xl mb-3">💰</p><p className="font-bold text-gray-500">No fee record assigned yet.</p><p className="text-sm text-gray-400 mt-1">Contact admin to set up your fee record.</p></div>
              )}
            </div>
          )}

          {/* ── PROFILE ── */}
          {tab === "profile" && (
            <div className="space-y-4 max-w-lg">
              <div className={card}>
                <h3 className="font-black text-[#1A3B70] mb-4">✏️ Edit Profile</h3>
                <div className="space-y-3">
                  {[["Name", "name", "text"], ["Phone", "phone", "text"], ["Address", "address", "text"]].map(([l, k, t]) => (
                    <div key={k}>
                      <label className="text-xs font-bold text-gray-500 uppercase block mb-1">{l}</label>
                      <input type={t} value={profileForm[k]} onChange={e => setProfileForm({ ...profileForm, [k]: e.target.value })} className={inp} />
                    </div>
                  ))}
                  <button onClick={handleProfileSave} className="bg-[#1A3B70] text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#122A50] transition-colors">Save Changes</button>
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
    </div>
  );
}
