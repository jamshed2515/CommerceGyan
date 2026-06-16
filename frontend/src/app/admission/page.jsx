"use client";
import { useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import API from "@/config/api";

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

  const inputClass = "w-full h-[54px] px-4 rounded-xl border border-slate-200 bg-white text-sm text-gray-800 placeholder-slate-350 focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/12 outline-none transition-all duration-300";
  const selectClass = "w-full h-[54px] px-4 rounded-xl border border-slate-200 bg-white text-sm text-gray-800 focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/12 outline-none transition-all duration-300 disabled:opacity-50 disabled:bg-slate-50";
  const textareaClass = "w-full min-h-[120px] px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm text-gray-800 placeholder-slate-350 focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/12 outline-none transition-all duration-300 resize-none";

  return (
    <main className="min-h-screen bg-slate-50/30 font-[family-name:var(--font-mulish)] pt-[75px] lg:pt-[80px]">
      
      {/* Unified Header */}
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-center py-20 px-6 relative overflow-hidden select-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00AEEF]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="bg-white/10 text-[#38bdf8] text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase mb-4 inline-block backdrop-blur-md border border-white/5">
            Admissions 2026-27
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 relative z-10">Admission Enquiry</h1>
          <p className="text-blue-100/70 text-sm md:text-base max-w-xl mx-auto font-medium leading-relaxed">
            Fill the form below and our counseling team will call you back within 24 hours.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {success ? (
          /* Success State */
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_12px_45px_rgba(15,23,42,0.03)] p-8 md:p-12 text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✅</div>
            <h2 className="text-3xl font-black text-[#1A3B70] mb-3">Enquiry Submitted!</h2>
            <p className="text-slate-600 mb-8 text-base">Thank you <strong>{form.studentName}</strong>! We have received your details and will contact you at <strong>{form.parentPhone}</strong> shortly.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={openWhatsApp}
                className="h-[54px] bg-[#25D366] text-white font-black px-8 rounded-xl hover:bg-[#20BD5C] shadow-md hover:shadow-lg transition-all duration-200 text-sm flex items-center gap-3 justify-center cursor-pointer"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <span>Connect on WhatsApp</span>
              </button>
              <Link 
                href="/" 
                className="h-[54px] bg-[#1A3B70] hover:bg-[#122A50] text-white font-black px-8 rounded-xl transition-all duration-200 text-sm flex items-center justify-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_12px_45px_rgba(15,23,42,0.03)] p-8 md:p-10">
            <h2 className="text-2xl font-black text-[#1A3B70] mb-6">Student Admission Form</h2>
            {error && (
              <div className="mb-5 px-4 py-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[13px] font-bold flex items-center gap-2.5 animate-pulse-soft">
                <span className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 text-[10px] shrink-0 font-extrabold">!</span>
                {error}
              </div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Student Name *</label>
                  <input type="text" required placeholder="Full name of student" value={form.studentName}
                    onChange={e => setForm({...form, studentName: e.target.value})}
                    className={inputClass} />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Parent / Guardian Name *</label>
                  <input type="text" required placeholder="Parent full name" value={form.parentName}
                    onChange={e => setForm({...form, parentName: e.target.value})}
                    className={inputClass} />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Parent Phone Number *</label>
                  <input type="tel" required placeholder="10-digit mobile" value={form.parentPhone}
                    onChange={e => setForm({...form, parentPhone: e.target.value})}
                    className={inputClass} />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address *</label>
                  <input type="email" required placeholder="Email address" value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    className={inputClass} />
                </div>
              </div>

              {/* Stream & Class */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Stream *</label>
                  <select required value={form.stream} onChange={e => setForm({...form, stream: e.target.value, className: ""})}
                    className={selectClass}>
                    <option value="">Select Stream</option>
                    {Object.keys(STREAMS).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Class / Course *</label>
                  <select required value={form.className} onChange={e => setForm({...form, className: e.target.value})} disabled={!form.stream}
                    className={selectClass}>
                    <option value="">Select Class</option>
                    {form.stream && STREAMS[form.stream].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Address</label>
                <input type="text" placeholder="Village / Colony / Town" value={form.address}
                  onChange={e => setForm({...form, address: e.target.value})}
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Message (Optional)</label>
                <textarea rows="3" placeholder="Any specific query or message..." value={form.message}
                  onChange={e => setForm({...form, message: e.target.value})}
                  className={textareaClass} />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full h-[54px] bg-[#00AEEF] hover:bg-[#009CD6] text-white font-black rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 text-sm flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting Enquiry...</span>
                  </>
                ) : (
                  <span>Submit Enquiry →</span>
                )}
              </button>
              <p className="text-center text-xs text-gray-400">Your enquiry will be sent directly to our team. We will call you back within 24 hours.</p>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
