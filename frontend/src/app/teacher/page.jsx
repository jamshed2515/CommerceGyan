"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = "http://localhost:5000";
const inp = "w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-[#1A3B70] outline-none text-sm bg-gray-50";
const NAV = [
  { id: "overview", icon: "🏠", label: "Dashboard" },
  { id: "batches", icon: "🎯", label: "My Batches" },
  { id: "schedule", icon: "📅", label: "Schedule" },
  { id: "announcements", icon: "📢", label: "Announcements" },
  { id: "students", icon: "👥", label: "Students" },
  { id: "profile", icon: "👤", label: "Profile" },
];
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function TeacherDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [batches, setBatches] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [annForm, setAnnForm] = useState({ title: "", body: "", isImportant: false });
  const [editAnn, setEditAnn] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", subject: "" });
  const [schForm, setSchForm] = useState({ batch: "", subject: "", dayOfWeek: "Monday", startTime: "09:00", endTime: "11:00", note: "" });
  const [editSch, setEditSch] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const H = { Authorization: `Bearer ${token}` };
  const JH = { ...H, "Content-Type": "application/json" };
  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    if (stored.role !== "teacher") { router.push("/login"); return; }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [u, bt, sc, an] = await Promise.all([
      fetch(`${API}/api/auth/me`, { headers: H }).then(r => r.json()),
      fetch(`${API}/api/batches/mine`, { headers: H }).then(r => r.json()),
      fetch(`${API}/api/schedules`, { headers: H }).then(r => r.json()),
      fetch(`${API}/api/announcements`).then(r => r.json()),
    ]);
    if (u.message === "Invalid or expired token") { router.push("/login"); return; }
    setUser(u);
    setProfileForm({ name: u.name || "", phone: u.phone || "", subject: u.subject || "" });
    setBatches(Array.isArray(bt) ? bt : []);
    setSchedules(Array.isArray(sc) ? sc.filter(s => s.teacher?._id === u._id || s.teacher === u._id) : []);
    setAnnouncements(Array.isArray(an) ? an : []);
    setLoading(false);
  };

  const handleLogout = () => { localStorage.clear(); router.push("/login"); };

  const saveAnn = async () => {
    if (!annForm.title || !annForm.body) return flash("❌ Title and body required");
    const url = editAnn ? `${API}/api/announcements/${editAnn._id}` : `${API}/api/announcements`;
    const res = await fetch(url, { method: editAnn ? "PUT" : "POST", headers: JH, body: JSON.stringify(annForm) });
    if (res.ok) { flash("✅ Saved!"); setAnnForm({ title: "", body: "", isImportant: false }); setEditAnn(null); loadData(); }
    else flash("❌ Failed");
  };
  const deleteAnn = async (id) => { if (!confirm("Delete?")) return; await fetch(`${API}/api/announcements/${id}`, { method: "DELETE", headers: H }); loadData(); };

  const saveSch = async () => {
    if (!schForm.batch || !schForm.subject) return flash("❌ Batch and subject required");
    const body = { ...schForm, teacher: user._id };
    const url = editSch ? `${API}/api/schedules/${editSch._id}` : `${API}/api/schedules`;
    const res = await fetch(url, { method: editSch ? "PUT" : "POST", headers: JH, body: JSON.stringify(body) });
    if (res.ok) { flash("✅ Saved!"); setSchForm({ batch: "", subject: "", dayOfWeek: "Monday", startTime: "09:00", endTime: "11:00", note: "" }); setEditSch(null); loadData(); }
    else { const d = await res.json(); flash("❌ " + d.message); }
  };
  const deleteSch = async (id) => { if (!confirm("Delete?")) return; await fetch(`${API}/api/schedules/${id}`, { method: "DELETE", headers: H }); loadData(); };

  const saveProfile = async () => {
    const res = await fetch(`${API}/api/auth/profile`, { method: "PUT", headers: JH, body: JSON.stringify(profileForm) });
    if (res.ok) flash("✅ Profile updated!"); else flash("❌ Failed");
  };

  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const todaySch = schedules.filter(s => s.dayOfWeek === today);
  const allStudents = batches.flatMap(b => b.students || []);
  const filtStudents = allStudents.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()));

  const card = "bg-white rounded-2xl border border-gray-100 shadow-sm p-5";

  if (loading) return (
    <div className="min-h-screen bg-[#F4F9FF] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#1A3B70] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F9FF] font-[family-name:var(--font-mulish)] flex">
      {toast && <div className="fixed top-4 right-4 z-50 bg-[#1A3B70] text-white px-5 py-3 rounded-xl shadow-xl font-bold text-sm">{toast}</div>}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-100 shadow-sm flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-4 border-b border-gray-100">
          <Link href="/" className="font-black text-[#1A3B70] text-lg">Commerce<span className="text-[#00AEEF]">Gyan</span></Link>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-9 h-9 bg-[#1A3B70] text-white rounded-full flex items-center justify-center font-black text-sm">{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <p className="font-bold text-[#1A3B70] text-xs leading-tight">{user?.name}</p>
              <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">TEACHER</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(n => (
            <button key={n.id} onClick={() => { setTab(n.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-left ${tab === n.id ? "bg-[#1A3B70] text-white" : "text-gray-600 hover:bg-gray-50"}`}>
              <span>{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 font-bold py-2 rounded-xl text-sm hover:bg-red-100">🚪 Logout</button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="font-black text-[#1A3B70]">{NAV.find(n => n.id === tab)?.label}</h1>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto pb-20 lg:pb-6">

          {/* OVERVIEW */}
          {tab === "overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { icon: "🎯", label: "My Batches", val: batches.length, color: "text-[#1A3B70]", bg: "bg-blue-50" },
                  { icon: "📅", label: "Today's Classes", val: todaySch.length, color: "text-[#00AEEF]", bg: "bg-cyan-50" },
                  { icon: "👥", label: "Total Students", val: allStudents.length, color: "text-purple-600", bg: "bg-purple-50" },
                ].map((c, i) => (
                  <div key={i} className={`${card} flex items-center gap-3`}>
                    <div className={`w-11 h-11 ${c.bg} rounded-xl flex items-center justify-center text-2xl`}>{c.icon}</div>
                    <div><p className={`font-black text-xl ${c.color}`}>{c.val}</p><p className="text-xs text-gray-500">{c.label}</p></div>
                  </div>
                ))}
              </div>
              <div className={card}>
                <h3 className="font-black text-[#1A3B70] mb-3">📅 Today — {today}</h3>
                {todaySch.length === 0
                  ? <p className="text-gray-400 text-sm text-center py-4">No classes today 🎉</p>
                  : todaySch.map(s => (
                    <div key={s._id} className="flex items-center gap-3 bg-[#F4F9FF] rounded-xl px-4 py-3 mb-2">
                      <div className="flex-1">
                        <p className="font-bold text-[#1A3B70] text-sm">{s.subject}</p>
                        <p className="text-xs text-gray-500">{s.batch?.batchName || "—"}</p>
                      </div>
                      <span className="text-xs font-bold bg-white border border-gray-200 px-3 py-1 rounded-full">{s.startTime} – {s.endTime}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* MY BATCHES */}
          {tab === "batches" && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-[#1A3B70]">My Batches ({batches.length})</h2>
              {batches.length === 0
                ? <div className={`${card} text-center py-16`}><p className="text-4xl mb-3">🎯</p><p className="text-gray-400 font-bold">No batches assigned yet.</p></div>
                : batches.map(b => (
                  <div key={b._id} className={card}>
                    <h3 className="font-black text-[#1A3B70] text-lg mb-2">{b.batchName}</h3>
                    <div className="grid md:grid-cols-3 gap-3 text-sm">
                      {[["Course", b.course?.title || "—"], ["Timing", b.timing || "—"], ["Students", b.students?.length || 0]].map(([l, v]) => (
                        <div key={l} className="bg-[#F4F9FF] rounded-xl px-3 py-2">
                          <p className="text-xs text-gray-400 font-bold uppercase">{l}</p>
                          <p className="font-bold text-[#1A3B70] mt-1">{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              }
            </div>
          )}

          {/* SCHEDULE */}
          {tab === "schedule" && (() => {
            const fmtTime = (t) => { if (!t) return "—"; const [h,m]=t.split(":"); const hr=parseInt(h,10); return `${hr%12||12}:${m} ${hr>=12?"PM":"AM"}`; };
            const dayColors = {
              Monday:{bg:"bg-blue-50",text:"text-blue-700",dot:"bg-blue-500",border:"border-blue-200"},
              Tuesday:{bg:"bg-purple-50",text:"text-purple-700",dot:"bg-purple-500",border:"border-purple-200"},
              Wednesday:{bg:"bg-emerald-50",text:"text-emerald-700",dot:"bg-emerald-500",border:"border-emerald-200"},
              Thursday:{bg:"bg-amber-50",text:"text-amber-700",dot:"bg-amber-500",border:"border-amber-200"},
              Friday:{bg:"bg-rose-50",text:"text-rose-700",dot:"bg-rose-500",border:"border-rose-200"},
              Saturday:{bg:"bg-cyan-50",text:"text-cyan-700",dot:"bg-cyan-500",border:"border-cyan-200"},
              Sunday:{bg:"bg-orange-50",text:"text-orange-700",dot:"bg-orange-500",border:"border-orange-200"},
            };
            return (
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-[#1A3B70]">📅 My Schedule</h2>
                  <p className="text-sm text-gray-500 mt-1">{schedules.length} class{schedules.length !== 1 ? "es" : ""} across the week</p>
                </div>
                <button onClick={() => setEditSch(editSch === false ? null : false)}
                  className="bg-[#1A3B70] text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-[#122A50] transition-all shadow-md self-start">
                  {editSch === false ? "✕ Close" : "➕ Add Entry"}
                </button>
              </div>

              {/* Add/Edit Form */}
              {(editSch !== null) && (
                <div className={card + " border border-gray-100 shadow-lg"}>
                  <h3 className="font-black text-[#1A3B70] mb-4">{editSch && editSch._id ? "✏️ Edit Entry" : "➕ Add Entry"}</h3>
                  <div className="grid md:grid-cols-3 gap-3 mb-3">
                    <div><label className="text-xs font-bold text-gray-400 uppercase block mb-1">Batch *</label>
                    <select value={schForm.batch} onChange={e => setSchForm({ ...schForm, batch: e.target.value })} className={inp}>
                      <option value="">Select Batch</option>
                      {batches.map(b => <option key={b._id} value={b._id}>{b.batchName}</option>)}
                    </select></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase block mb-1">Subject *</label>
                    <input placeholder="e.g. Commerce" value={schForm.subject} onChange={e => setSchForm({ ...schForm, subject: e.target.value })} className={inp} /></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase block mb-1">Day *</label>
                    <select value={schForm.dayOfWeek} onChange={e => setSchForm({ ...schForm, dayOfWeek: e.target.value })} className={inp}>
                      {DAYS.map(d => <option key={d}>{d}</option>)}
                    </select></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase block mb-1">Start Time</label>
                    <input type="time" value={schForm.startTime} onChange={e => setSchForm({ ...schForm, startTime: e.target.value })} className={inp} /></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase block mb-1">End Time</label>
                    <input type="time" value={schForm.endTime} onChange={e => setSchForm({ ...schForm, endTime: e.target.value })} className={inp} /></div>
                    <div><label className="text-xs font-bold text-gray-400 uppercase block mb-1">Note</label>
                    <input placeholder="Optional" value={schForm.note} onChange={e => setSchForm({ ...schForm, note: e.target.value })} className={inp} /></div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={saveSch} className="bg-[#1A3B70] text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md">{editSch && editSch._id ? "Update" : "Add"}</button>
                    <button onClick={() => { setEditSch(null); setSchForm({ batch: "", subject: "", dayOfWeek: "Monday", startTime: "09:00", endTime: "11:00", note: "" }); }} className="bg-gray-100 text-gray-700 font-bold px-5 py-2.5 rounded-xl text-sm">Cancel</button>
                  </div>
                </div>
              )}

              {/* Day-grouped timetable */}
              {schedules.length === 0 ? (
                <div className={`${card} text-center py-16`}><p className="text-4xl mb-3">📅</p><p className="text-gray-400 font-bold">No schedule entries yet</p></div>
              ) : (
                DAYS.map(day => {
                  const ds = schedules.filter(s => s.dayOfWeek === day).sort((a,b) => a.startTime.localeCompare(b.startTime));
                  if (ds.length === 0) return null;
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
                        <span className={`${dc.text} text-xs font-bold`}>{ds.length} class{ds.length > 1 ? "es" : ""}</span>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {ds.map(s => (
                          <div key={s._id} className="px-5 py-3 flex items-center gap-4 hover:bg-[#F4F9FF] transition-colors group">
                            <div className="w-20 text-center flex-shrink-0">
                              <p className="text-xs font-black text-[#1A3B70]">{fmtTime(s.startTime)}</p>
                              <p className="text-[10px] text-gray-400">to {fmtTime(s.endTime)}</p>
                            </div>
                            <div className={`w-1 h-10 rounded-full ${dc.dot}`}></div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[#1A3B70] text-sm">{s.subject}</p>
                              <p className="text-xs text-gray-500">{s.batch?.batchName || "—"}</p>
                            </div>
                            {s.note && <span className="text-xs text-gray-400 hidden md:block">📝 {s.note}</span>}
                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditSch(s); setSchForm({ batch: s.batch?._id || s.batch, subject: s.subject, dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime, note: s.note || "" }); }} className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1.5 rounded-lg">Edit</button>
                              <button onClick={() => deleteSch(s._id)} className="bg-red-50 text-red-500 text-xs font-bold px-2.5 py-1.5 rounded-lg">Del</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>);
          })()}

          {/* ANNOUNCEMENTS */}
          {tab === "announcements" && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-[#1A3B70]">Announcements</h2>
              <div className={card}>
                <h3 className="font-black text-[#1A3B70] mb-4">{editAnn ? "✏️ Edit" : "➕ New"}</h3>
                <div className="space-y-3">
                  <input placeholder="Title *" value={annForm.title} onChange={e => setAnnForm({ ...annForm, title: e.target.value })} className={inp} />
                  <textarea rows="3" placeholder="Message *" value={annForm.body} onChange={e => setAnnForm({ ...annForm, body: e.target.value })} className={`${inp} resize-none`} />
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-gray-700">
                    <input type="checkbox" checked={annForm.isImportant} onChange={e => setAnnForm({ ...annForm, isImportant: e.target.checked })} />
                    Mark as Important 🚨
                  </label>
                  <div className="flex gap-3">
                    <button onClick={saveAnn} className="bg-[#1A3B70] text-white font-bold px-5 py-2 rounded-lg text-sm">{editAnn ? "Update" : "Publish"}</button>
                    {editAnn && <button onClick={() => { setEditAnn(null); setAnnForm({ title: "", body: "", isImportant: false }); }} className="bg-gray-100 text-gray-700 font-bold px-5 py-2 rounded-lg text-sm">Cancel</button>}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {announcements.map(a => (
                  <div key={a._id} className={`${card} ${a.isImportant ? "border-red-300" : ""}`}>
                    <div className="flex justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-black text-[#1A3B70]">{a.title}</h4>
                          {a.isImportant && <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">URGENT</span>}
                        </div>
                        <p className="text-gray-600 text-sm">{a.body}</p>
                        <p className="text-gray-400 text-xs mt-1">{new Date(a.createdAt).toLocaleString("en-IN")}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => { setEditAnn(a); setAnnForm({ title: a.title, body: a.body, isImportant: a.isImportant }); }} className="text-[#00AEEF] text-xs font-bold">Edit</button>
                        <button onClick={() => deleteAnn(a._id)} className="text-red-500 text-xs font-bold">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
                {announcements.length === 0 && <div className="text-center py-10 text-gray-400">No announcements yet</div>}
              </div>
            </div>
          )}

          {/* STUDENTS */}
          {tab === "students" && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-[#1A3B70]">Students in My Batches ({allStudents.length})</h2>
              <input placeholder="🔍 Search student..." value={search} onChange={e => setSearch(e.target.value)} className={inp} />
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#F4F9FF]"><tr>
                    {["Name","Email","Class","Stream"].map(h => <th key={h} className="text-left py-3 px-4 font-bold text-gray-500 text-xs uppercase">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {filtStudents.map(s => (
                      <tr key={s._id} className="border-t border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 font-bold text-[#1A3B70]">{s.name}</td>
                        <td className="py-3 px-4 text-gray-500 text-xs">{s.email}</td>
                        <td className="py-3 px-4 text-gray-500 text-xs">{s.className || "—"}</td>
                        <td className="py-3 px-4 text-gray-500 text-xs">{s.stream || "—"}</td>
                      </tr>
                    ))}
                    {filtStudents.length === 0 && <tr><td colSpan={4} className="py-10 text-center text-gray-400">No students found</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PROFILE */}
          {tab === "profile" && (
            <div className="max-w-md space-y-4">
              <h2 className="text-xl font-black text-[#1A3B70]">My Profile</h2>
              <div className={card}>
                <div className="space-y-3">
                  {[["Name", "name", "text"], ["Phone", "phone", "text"], ["Subject", "subject", "text"]].map(([l, k, t]) => (
                    <div key={k}>
                      <label className="text-xs font-bold text-gray-400 uppercase block mb-1">{l}</label>
                      <input type={t} value={profileForm[k]} onChange={e => setProfileForm({ ...profileForm, [k]: e.target.value })} className={inp} />
                    </div>
                  ))}
                  <div className="bg-[#F4F9FF] rounded-xl p-3">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Email</p>
                    <p className="font-bold text-[#1A3B70]">{user?.email}</p>
                  </div>
                  <button onClick={saveProfile} className="bg-[#1A3B70] text-white font-bold px-5 py-2 rounded-xl text-sm hover:bg-[#122A50]">Save Profile</button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
