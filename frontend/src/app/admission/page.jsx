"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import API from "@/lib/api";

const STREAMS = {
  "School": ["Class 7", "Class 8", "Class 9", "Class 10"],
  "Commerce": ["Class 11 (Commerce)", "Class 12 (Commerce)"],
  "Professional Courses": ["B.Com", "CA Foundation", "CMA Foundation", "CS Foundation"],
};

export default function Admission() {
  const [form, setForm] = useState({ studentName: "", parentName: "", parentPhone: "", email: "", stream: "", className: "", address: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.stream || !form.className) { setError("Please select stream and class."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Submission failed"); setLoading(false); return; }
      setSuccess(true);
      setLoading(false);
    } catch { setError("Server error. Please try again."); setLoading(false); }
  };

  const openWhatsApp = () => {
    const msg = encodeURIComponent(`Hello Sir, I have submitted an admission enquiry for *${form.className}* (${form.stream}) at Commerce Gyan. My name is ${form.studentName}. Please contact me at ${form.parentPhone}.`);
    window.open(`https://wa.me/918271365450?text=${msg}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-white font-[family-name:var(--font-mulish)]">
      <nav className="w-full bg-white border-b border-gray-100 shadow-sm py-4 px-6 flex justify-between items-center sticky top-0 z-50">
        <Link href="/"><Image src="/logo.png" alt="Commerce Gyan" width={180} height={50} className="object-contain max-h-[50px] w-auto" priority /></Link>
        <Link href="/" className="text-[14px] font-bold text-gray-500 hover:text-[#00AEEF] flex items-center gap-1">← Back to Home</Link>
      </nav>

      {/* Hero */}
      <div className="bg-[#1A3B70] text-center py-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00AEEF] rounded-full blur-[80px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-3 relative z-10">Admission Enquiry</h1>
        <p className="text-white/80 text-lg max-w-xl mx-auto relative z-10">Fill the form below and our team will call you back within 24 hours.</p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {success ? (
          /* Success State */
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✅</div>
            <h2 className="text-3xl font-black text-[#1A3B70] mb-3">Enquiry Submitted!</h2>
            <p className="text-gray-600 mb-8 text-lg">Thank you <strong>{form.studentName}</strong>! We have received your enquiry and will contact you at <strong>{form.parentPhone}</strong> shortly.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={openWhatsApp}
                className="bg-[#25D366] text-white font-black px-8 py-4 rounded-xl hover:bg-[#20BD5C] transition-colors text-lg flex items-center gap-3 justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Connect on WhatsApp
              </button>
              <Link href="/" className="bg-[#1A3B70] text-white font-black px-8 py-4 rounded-xl hover:bg-[#122A50] transition-colors text-lg text-center">Back to Home</Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.07)] border border-gray-100 p-8">
            <h2 className="text-2xl font-black text-[#1A3B70] mb-6">Student Admission Form</h2>
            {error && <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[14px]">⚠️ {error}</div>}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Student Name *</label>
                  <input type="text" required placeholder="Full name of student" value={form.studentName}
                    onChange={e => setForm({...form, studentName: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20 outline-none text-[14px] bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Parent / Guardian Name *</label>
                  <input type="text" required placeholder="Parent full name" value={form.parentName}
                    onChange={e => setForm({...form, parentName: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20 outline-none text-[14px] bg-gray-50 focus:bg-white" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Parent Phone Number *</label>
                  <input type="tel" required placeholder="10-digit mobile" value={form.parentPhone}
                    onChange={e => setForm({...form, parentPhone: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20 outline-none text-[14px] bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Email Address *</label>
                  <input type="email" required placeholder="Email address" value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20 outline-none text-[14px] bg-gray-50 focus:bg-white" />
                </div>
              </div>

              {/* Stream & Class */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Stream *</label>
                  <select required value={form.stream} onChange={e => setForm({...form, stream: e.target.value, className: ""})}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00AEEF] outline-none text-[14px] bg-gray-50 focus:bg-white text-gray-700">
                    <option value="">Select Stream</option>
                    {Object.keys(STREAMS).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Class / Course *</label>
                  <select required value={form.className} onChange={e => setForm({...form, className: e.target.value})} disabled={!form.stream}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00AEEF] outline-none text-[14px] bg-gray-50 focus:bg-white text-gray-700 disabled:opacity-50">
                    <option value="">Select Class</option>
                    {form.stream && STREAMS[form.stream].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Address</label>
                <input type="text" placeholder="Village / Colony / Town" value={form.address}
                  onChange={e => setForm({...form, address: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20 outline-none text-[14px] bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Message (Optional)</label>
                <textarea rows="3" placeholder="Any specific query or message..." value={form.message}
                  onChange={e => setForm({...form, message: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20 outline-none text-[14px] bg-gray-50 focus:bg-white resize-none" />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 bg-[#1A3B70] text-white font-black rounded-xl shadow-lg hover:bg-[#122A50] transition-colors text-[16px] disabled:opacity-60">
                {loading ? "Submitting..." : "Submit Enquiry →"}
              </button>
              <p className="text-center text-xs text-gray-400">Your enquiry will be sent directly to our team. We will call you back within 24 hours.</p>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
