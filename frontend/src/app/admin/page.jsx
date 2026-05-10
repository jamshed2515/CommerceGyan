"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const API = "http://localhost:5000";

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState("students");
  const [students, setStudents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notes, setNotes] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [annForm, setAnnForm] = useState({ title: "", body: "", isImportant: false });
  const [editAnn, setEditAnn] = useState(null);
  const [noteForm, setNoteForm] = useState({ title: "", subject: "", className: "", course: "" });
  const [noteFile, setNoteFile] = useState(null);
  const [msg, setMsg] = useState("");
  const fileRef = useRef();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = { Authorization: `Bearer ${token}` };

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!token || user.role !== "admin") { router.push("/admin/login"); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [s, a, n, e, p] = await Promise.all([
      fetch(`${API}/api/admin/students`, { headers }).then(r => r.json()),
      fetch(`${API}/api/announcements`).then(r => r.json()),
      fetch(`${API}/api/notes`, { headers }).then(r => r.json()),
      fetch(`${API}/api/enquiry`, { headers }).then(r => r.json()),
      fetch(`${API}/api/payments/all`, { headers }).then(r => r.json()),
    ]);
    setStudents(Array.isArray(s) ? s : []);
    setAnnouncements(Array.isArray(a) ? a : []);
    setNotes(Array.isArray(n) ? n : []);
    setEnquiries(Array.isArray(e) ? e : []);
    setPayments(Array.isArray(p) ? p : []);
    setLoading(false);
  };

  const handleLogout = () => { localStorage.clear(); router.push("/admin/login"); };

  // Announcements
  const saveAnn = async () => {
    const url = editAnn ? `${API}/api/announcements/${editAnn._id}` : `${API}/api/announcements`;
    const method = editAnn ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(annForm) });
    if (res.ok) { flash(editAnn ? "✅ Updated!" : "✅ Created!"); setAnnForm({ title: "", body: "", isImportant: false }); setEditAnn(null); fetchAll(); }
  };
  const deleteAnn = async (id) => { if (!confirm("Delete?")) return; await fetch(`${API}/api/announcements/${id}`, { method: "DELETE", headers }); fetchAll(); };
  const startEditAnn = (a) => { setEditAnn(a); setAnnForm({ title: a.title, body: a.body, isImportant: a.isImportant }); };

  // Notes
  const uploadNote = async () => {
    if (!noteFile) { flash("❌ Select a PDF file"); return; }
    const fd = new FormData();
    Object.entries(noteForm).forEach(([k, v]) => fd.append(k, v));
    fd.append("pdf", noteFile);
    const res = await fetch(`${API}/api/notes`, { method: "POST", headers, body: fd });
    if (res.ok) { flash("✅ Note uploaded!"); setNoteForm({ title: "", subject: "", className: "", course: "" }); setNoteFile(null); if (fileRef.current) fileRef.current.value = ""; fetchAll(); }
    else { const d = await res.json(); flash("❌ " + (d.message || "Upload failed")); }
  };
  const deleteNote = async (id) => { if (!confirm("Delete note?")) return; await fetch(`${API}/api/notes/${id}`, { method: "DELETE", headers }); fetchAll(); };

  // Students
  const updateFee = async (id, feeStatus) => {
    await fetch(`${API}/api/admin/students/${id}/fee`, { method: "PUT", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ feeStatus }) });
    fetchAll();
  };
  const deleteStudent = async (id) => { if (!confirm("Delete student?")) return; await fetch(`${API}/api/admin/students/${id}`, { method: "DELETE", headers }); fetchAll(); };

  const sidebarTabs = [
    { id: "students", icon: "👥", label: "Students", count: students.length },
    { id: "announcements", icon: "📢", label: "Announcements", count: announcements.length },
    { id: "notes", icon: "📄", label: "Notes / PDFs", count: notes.length },
    { id: "enquiries", icon: "📩", label: "Enquiries", count: enquiries.length },
    { id: "payments", icon: "💳", label: "Payments", count: payments.length },
  ];

  const inputCls = "w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:border-[#1A3B70] outline-none text-[13px] bg-gray-50 focus:bg-white";

  if (loading) return (
    <div className="min-h-screen bg-[#F4F9FF] flex items-center justify-center">
      <div className="text-center"><div className="w-12 h-12 border-4 border-[#1A3B70] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div><p className="text-[#1A3B70] font-bold">Loading admin panel...</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F9FF] font-[family-name:var(--font-mulish)] flex flex-col">
      {/* Header */}
      <header className="bg-[#1A3B70] text-white px-6 py-4 flex items-center justify-between shadow-lg flex-shrink-0">
        <div>
          <span className="font-black text-xl">Commerce<span className="text-[#FFCC00]">Giyan</span></span>
          <span className="ml-3 text-xs bg-[#FFCC00] text-[#1A3B70] font-black px-2 py-0.5 rounded-full">ADMIN</span>
        </div>
        <div className="flex gap-3">
          <a href="/" target="_blank" className="text-white/70 hover:text-white text-sm font-bold">View Site</a>
          <button onClick={handleLogout} className="bg-white/10 hover:bg-white/20 text-white text-sm font-bold px-4 py-1.5 rounded-lg">Logout</button>
        </div>
      </header>

      {msg && <div className="fixed top-20 right-6 z-50 bg-[#1A3B70] text-white px-5 py-3 rounded-xl shadow-xl font-bold text-sm">{msg}</div>}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-gray-100 shadow-sm flex-shrink-0 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {sidebarTabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all ${tab === t.id ? "bg-[#1A3B70] text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                <span>{t.icon} {t.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${tab === t.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>{t.count}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* STUDENTS */}
          {tab === "students" && (
            <div>
              <h2 className="text-xl font-black text-[#1A3B70] mb-5">Students ({students.length})</h2>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F4F9FF]"><tr>
                      {["Name", "Email", "Phone", "Stream", "Class", "Fee Status", "Actions"].map(h => <th key={h} className="text-left py-3 px-4 font-bold text-gray-600 text-xs uppercase">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {students.map(s => (
                        <tr key={s._id} className="border-t border-gray-50 hover:bg-gray-50">
                          <td className="py-3 px-4 font-bold text-[#1A3B70]">{s.name}</td>
                          <td className="py-3 px-4 text-gray-600 text-xs">{s.email}</td>
                          <td className="py-3 px-4 text-gray-600">{s.phone || "—"}</td>
                          <td className="py-3 px-4 text-gray-600">{s.stream || "—"}</td>
                          <td className="py-3 px-4 text-gray-600">{s.className || "—"}</td>
                          <td className="py-3 px-4">
                            <select value={s.feeStatus} onChange={e => updateFee(s._id, e.target.value)}
                              className={`text-xs font-bold px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${s.feeStatus === "paid" ? "bg-green-100 text-green-700" : s.feeStatus === "partial" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                              <option value="due">DUE</option>
                              <option value="partial">PARTIAL</option>
                              <option value="paid">PAID</option>
                            </select>
                          </td>
                          <td className="py-3 px-4">
                            <button onClick={() => deleteStudent(s._id)} className="text-red-500 hover:text-red-700 text-xs font-bold">Delete</button>
                          </td>
                        </tr>
                      ))}
                      {students.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-gray-400">No students registered yet</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ANNOUNCEMENTS */}
          {tab === "announcements" && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-[#1A3B70]">Announcements</h2>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-black text-[#1A3B70] mb-4">{editAnn ? "✏️ Edit Announcement" : "➕ New Announcement"}</h3>
                <div className="space-y-3">
                  <input placeholder="Title *" value={annForm.title} onChange={e => setAnnForm({...annForm, title: e.target.value})} className={inputCls} />
                  <textarea rows="3" placeholder="Message body *" value={annForm.body} onChange={e => setAnnForm({...annForm, body: e.target.value})} className={`${inputCls} resize-none`} />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={annForm.isImportant} onChange={e => setAnnForm({...annForm, isImportant: e.target.checked})} />
                    <span className="text-sm font-bold text-gray-700">Mark as Important 🚨</span>
                  </label>
                  <div className="flex gap-3">
                    <button onClick={saveAnn} className="bg-[#1A3B70] text-white font-bold px-6 py-2.5 rounded-lg hover:bg-[#122A50] transition-colors text-sm">
                      {editAnn ? "Update" : "Publish"}
                    </button>
                    {editAnn && <button onClick={() => { setEditAnn(null); setAnnForm({ title: "", body: "", isImportant: false }); }} className="bg-gray-100 text-gray-700 font-bold px-6 py-2.5 rounded-lg text-sm">Cancel</button>}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {announcements.map(a => (
                  <div key={a._id} className={`bg-white rounded-2xl p-5 border shadow-sm ${a.isImportant ? "border-red-300" : "border-gray-100"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-black text-[#1A3B70]">{a.title}</h4>
                          {a.isImportant && <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">IMPORTANT</span>}
                        </div>
                        <p className="text-gray-600 text-sm">{a.body}</p>
                        <p className="text-gray-400 text-xs mt-2">{new Date(a.createdAt).toLocaleString("en-IN")}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => startEditAnn(a)} className="text-[#00AEEF] hover:text-[#009CD6] text-xs font-bold">Edit</button>
                        <button onClick={() => deleteAnn(a._id)} className="text-red-500 hover:text-red-700 text-xs font-bold">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
                {announcements.length === 0 && <div className="text-center py-10 text-gray-400">No announcements yet</div>}
              </div>
            </div>
          )}

          {/* NOTES */}
          {tab === "notes" && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-[#1A3B70]">Notes / PDFs</h2>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-black text-[#1A3B70] mb-4">➕ Upload New Note</h3>
                <div className="grid md:grid-cols-2 gap-3 mb-3">
                  <input placeholder="Note title *" value={noteForm.title} onChange={e => setNoteForm({...noteForm, title: e.target.value})} className={inputCls} />
                  <input placeholder="Subject (e.g. Accountancy)" value={noteForm.subject} onChange={e => setNoteForm({...noteForm, subject: e.target.value})} className={inputCls} />
                  <input placeholder="Class (e.g. Class 11)" value={noteForm.className} onChange={e => setNoteForm({...noteForm, className: e.target.value})} className={inputCls} />
                  <input placeholder="Course (e.g. CA Foundation)" value={noteForm.course} onChange={e => setNoteForm({...noteForm, course: e.target.value})} className={inputCls} />
                </div>
                <div className="mb-3">
                  <input type="file" accept=".pdf" ref={fileRef} onChange={e => setNoteFile(e.target.files[0])}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-bold file:bg-[#1A3B70] file:text-white hover:file:bg-[#122A50]" />
                </div>
                <button onClick={uploadNote} className="bg-[#00AEEF] text-white font-bold px-6 py-2.5 rounded-lg hover:bg-[#009CD6] transition-colors text-sm">Upload PDF</button>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#F4F9FF]"><tr>
                    {["Title", "Subject", "Class", "Uploaded", "Actions"].map(h => <th key={h} className="text-left py-3 px-4 font-bold text-gray-600 text-xs uppercase">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {notes.map(n => (
                      <tr key={n._id} className="border-t border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 font-bold text-[#1A3B70]">{n.title}</td>
                        <td className="py-3 px-4 text-gray-600">{n.subject}</td>
                        <td className="py-3 px-4 text-gray-600">{n.className}</td>
                        <td className="py-3 px-4 text-gray-400 text-xs">{new Date(n.createdAt).toLocaleDateString("en-IN")}</td>
                        <td className="py-3 px-4 flex gap-3">
                          <a href={`${API}${n.fileUrl}`} target="_blank" className="text-[#00AEEF] text-xs font-bold hover:underline">View</a>
                          <button onClick={() => deleteNote(n._id)} className="text-red-500 text-xs font-bold hover:text-red-700">Delete</button>
                        </td>
                      </tr>
                    ))}
                    {notes.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-gray-400">No notes uploaded yet</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ENQUIRIES */}
          {tab === "enquiries" && (
            <div>
              <h2 className="text-xl font-black text-[#1A3B70] mb-5">Admission Enquiries ({enquiries.length})</h2>
              <div className="space-y-4">
                {enquiries.map(q => (
                  <div key={q._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-black text-[#1A3B70] text-base">{q.studentName}</h4>
                        <p className="text-gray-500 text-xs">Submitted {new Date(q.createdAt).toLocaleString("en-IN")}</p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${q.status === "new" ? "bg-blue-100 text-blue-700" : q.status === "contacted" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{q.status?.toUpperCase()}</span>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3 text-sm">
                      {[["Parent", q.parentName], ["Phone", q.parentPhone], ["Email", q.email], ["Stream", q.stream], ["Class", q.className], ["Address", q.address || "—"]].map(([l, v]) => (
                        <div key={l} className="bg-[#F4F9FF] rounded-lg px-3 py-2">
                          <p className="text-xs text-gray-500 font-bold">{l}</p>
                          <p className="text-[#1A3B70] font-bold text-sm">{v}</p>
                        </div>
                      ))}
                    </div>
                    {q.message && <div className="mt-3 bg-gray-50 rounded-lg px-4 py-2 text-sm text-gray-600"><strong>Message:</strong> {q.message}</div>}
                    <div className="mt-3 flex gap-3">
                      <a href={`https://wa.me/91${q.parentPhone}`} target="_blank" className="text-[#25D366] text-xs font-bold hover:underline">WhatsApp →</a>
                      <a href={`tel:${q.parentPhone}`} className="text-[#1A3B70] text-xs font-bold hover:underline">Call →</a>
                    </div>
                  </div>
                ))}
                {enquiries.length === 0 && <div className="text-center py-12 bg-white rounded-2xl border border-gray-100"><p className="text-gray-400 font-bold">No enquiries yet</p></div>}
              </div>
            </div>
          )}

          {/* PAYMENTS */}
          {tab === "payments" && (
            <div>
              <h2 className="text-xl font-black text-[#1A3B70] mb-5">Payments ({payments.length})</h2>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#F4F9FF]"><tr>
                    {["Student", "Amount", "Razorpay ID", "Date", "Status"].map(h => <th key={h} className="text-left py-3 px-4 font-bold text-gray-600 text-xs uppercase">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p._id} className="border-t border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 font-bold text-[#1A3B70]">{p.studentName || p.studentId?.name || "—"}</td>
                        <td className="py-3 px-4 font-bold">₹{p.amount}</td>
                        <td className="py-3 px-4 text-gray-400 text-xs">{p.razorpayPaymentId || "—"}</td>
                        <td className="py-3 px-4 text-gray-500 text-xs">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                        <td className="py-3 px-4"><span className={`text-xs font-bold px-2 py-1 rounded-full ${p.status === "paid" ? "bg-green-100 text-green-700" : p.status === "failed" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{p.status?.toUpperCase()}</span></td>
                      </tr>
                    ))}
                    {payments.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-gray-400">No payments recorded</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
