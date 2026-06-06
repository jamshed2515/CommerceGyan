"use client";
import { useState } from "react";
import Link from "next/link";
import API from "@/lib/api";

const STREAMS = {
  "School": ["Class 7", "Class 8", "Class 9", "Class 10"],
  "Commerce": ["Class 11 (Commerce)", "Class 12 (Commerce)"],
  "Professional Courses": ["B.Com", "CA Foundation", "CMA Foundation", "CS Foundation"],
};

export default function Contact() {
  const [form, setForm] = useState({
    studentName: "",
    parentName: "",
    parentPhone: "",
    email: "",
    stream: "",
    className: "",
    address: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || "Failed to submit enquiry.", "error");
        setLoading(false);
        return;
      }
      showToast("Enquiry submitted successfully! We will call you back soon.", "success");
      setForm({
        studentName: "",
        parentName: "",
        parentPhone: "",
        email: "",
        stream: "",
        className: "",
        address: "",
        message: ""
      });
      setLoading(false);
    } catch {
      showToast("Server error. Please check your internet connection.", "error");
      setLoading(false);
    }
  };

  const inputClass = "w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-gray-800 placeholder-slate-400 focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/12 focus:bg-white outline-none transition-all duration-300";
  const selectClass = "w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-gray-800 focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/12 focus:bg-white outline-none transition-all duration-300 disabled:opacity-50 disabled:bg-slate-100";

  return (
    <main className="min-h-screen bg-slate-50/30 flex flex-col font-[family-name:var(--font-mulish)] relative">
      
      {/* SUCCESS / ERROR TOAST */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3.5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] border transition-all duration-300 ${
          toast.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
            toast.type === "success" ? "bg-emerald-200 text-emerald-800" : "bg-rose-200 text-rose-800"
          }`}>
            {toast.type === "success" ? "✓" : "!"}
          </span>
          <span className="text-[13px] font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header Navigation */}
      <nav className="w-full bg-white border-b border-slate-100 py-4 px-6 flex justify-between items-center max-w-[1400px] mx-auto z-10">
        <Link href="/" className="inline-block">
          <img src="/logo.png" alt="Commerce Gyan Logo" className="h-[44px] w-auto object-contain" />
        </Link>
        <Link href="/" className="text-[13px] font-black text-slate-500 hover:text-[#00AEEF] transition-colors flex items-center gap-2">
          <span>←</span> Back to Home
        </Link>
      </nav>

      {/* Hero Section */}
      <div className="bg-[#1A3B70] text-center py-20 px-6 relative overflow-hidden select-none">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00AEEF] rounded-full blur-[90px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#FFCC00] rounded-full blur-[90px] opacity-10 -translate-x-1/2 translate-y-1/2"></div>
        
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 relative z-10 tracking-tight leading-none">
          Let&apos;s Start Your Academic Journey
        </h1>
        <p className="text-blue-100/90 text-sm md:text-base max-w-2xl mx-auto font-bold relative z-10 leading-relaxed">
          We&apos;re here to help with admissions, batch queries, courses, and personalized career guidance.
        </p>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-16">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT — Cards, Actions & Socials (Col: 5) */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h2 className="text-2xl font-black text-[#1A3B70] tracking-tight">Contact Details</h2>
              <p className="text-slate-500 font-bold text-[14px] mt-1.5 leading-relaxed">
                Connect with us directly via phone, mail, or walk into our coaching center.
              </p>
            </div>

            {/* Info Cards Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { 
                  icon: "📍", 
                  title: "Visit Us", 
                  desc: "Behind Rajasthani Dharamshala, Katrasgarh, Dhanbad, Jharkhand", 
                  link: "https://maps.google.com/?q=Commerce+Gyan+Katrasgarh" 
                },
                { 
                  icon: "📞", 
                  title: "Call Us", 
                  desc: "+91 82713 65450", 
                  link: "tel:8271365450" 
                },
                { 
                  icon: "✉️", 
                  title: "Email Us", 
                  desc: "info@commercegyan.com", 
                  link: "mailto:info@commercegyan.com" 
                },
                { 
                  icon: "💬", 
                  title: "WhatsApp Chat", 
                  desc: "+91 82713 65450", 
                  link: "https://wa.me/918271365450" 
                }
              ].map((card, idx) => (
                <a 
                  key={idx} 
                  href={card.link}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_15px_rgba(15,23,42,0.02)] hover:shadow-[0_12px_25px_rgba(15,23,42,0.06)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-lg shadow-sm mb-4 shrink-0">
                      {card.icon}
                    </div>
                    <h3 className="font-extrabold text-[#1A3B70] text-[15px]">{card.title}</h3>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed mt-2">{card.desc}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Quick Actions Buttons */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_15px_rgba(15,23,42,0.02)] space-y-3">
              <h4 className="font-extrabold text-[#1A3B70] text-sm uppercase tracking-wider mb-2">Quick Response Actions</h4>
              <div className="flex flex-wrap gap-3">
                <a 
                  href="tel:8271365450" 
                  className="flex-1 bg-[#1A3B70] text-white font-black text-center py-3 px-4 rounded-xl text-xs hover:bg-[#122A50] hover:-translate-y-0.5 active:translate-y-0 shadow-sm transition-all duration-200"
                >
                  📞 Call Now
                </a>
                <a 
                  href="https://wa.me/918271365450" 
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-[#25D366] text-white font-black text-center py-3 px-4 rounded-xl text-xs hover:bg-[#20ba59] hover:-translate-y-0.5 active:translate-y-0 shadow-sm transition-all duration-200"
                >
                  💬 WhatsApp
                </a>
                <a 
                  href="https://maps.google.com/?q=Commerce+Gyan+Katrasgarh" 
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-[#FFCC00] text-[#1A3B70] font-black text-center py-3 px-4 rounded-xl text-xs hover:bg-[#ffd633] hover:-translate-y-0.5 active:translate-y-0 shadow-sm transition-all duration-200"
                >
                  🗺️ Get Directions
                </a>
              </div>
            </div>

            {/* Branded Social Links */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="font-extrabold text-[#1A3B70] text-sm">Follow our updates:</span>
              <div className="flex gap-3">
                {[
                  {
                    label: "Facebook",
                    href: "https://facebook.com",
                    icon: (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                      </svg>
                    )
                  },
                  {
                    label: "Instagram",
                    href: "https://instagram.com",
                    icon: (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    )
                  },
                  {
                    label: "YouTube",
                    href: "https://youtube.com",
                    icon: (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.002 3.002 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    )
                  }
                ].map((social, sIdx) => (
                  <a 
                    key={sIdx} 
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Follow on ${social.label}`}
                    className="w-10 h-10 rounded-full bg-white border border-slate-200/80 text-slate-500 hover:text-[#00AEEF] hover:border-[#00AEEF]/30 shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center transition-all duration-200 cursor-pointer"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Enquiry Form (Col: 7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_12px_45px_rgba(15,23,42,0.03)] p-8 md:p-10">
              <h3 className="text-2xl font-black text-[#1A3B70] tracking-tight mb-6">Send an Admission Enquiry</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Names grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Student Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Enter student's name" 
                      value={form.studentName}
                      onChange={e => setForm({ ...form, studentName: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Parent / Guardian Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Enter parent's name" 
                      value={form.parentName}
                      onChange={e => setForm({ ...form, parentName: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Mobile Number *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="10-digit mobile number" 
                      value={form.parentPhone}
                      onChange={e => setForm({ ...form, parentPhone: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address *</label>
                    <input 
                      type="email" 
                      required
                      placeholder="Enter email address" 
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Stream and Class Selector */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Stream *</label>
                    <select 
                      required 
                      value={form.stream} 
                      onChange={e => setForm({ ...form, stream: e.target.value, className: "" })}
                      className={selectClass}
                    >
                      <option value="">Select Stream</option>
                      {Object.keys(STREAMS).map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Class / Course Interest *</label>
                    <select 
                      required 
                      value={form.className} 
                      onChange={e => setForm({ ...form, className: e.target.value })} 
                      disabled={!form.stream}
                      className={selectClass}
                    >
                      <option value="">Select Class</option>
                      {form.stream && STREAMS[form.stream].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Residential Address</label>
                  <input 
                    type="text" 
                    placeholder="Enter street, city, state" 
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    className={inputClass}
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">How can we help you?</label>
                  <textarea 
                    rows="3"
                    placeholder="Enter any additional queries about batches or study materials" 
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full min-h-[100px] px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-gray-800 placeholder-slate-400 focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/12 focus:bg-white outline-none transition-all duration-300 resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto h-12 px-10 bg-[#00AEEF] hover:bg-[#009CD6] text-white font-black rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 text-sm flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending Enquiry...</span>
                    </>
                  ) : (
                    <span>Submit Enquiry →</span>
                  )}
                </button>
              </form>
            </div>

            {/* Embedded Google Map Section */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_12px_45px_rgba(15,23,42,0.03)] p-6 overflow-hidden h-[340px] relative">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.0463283907765!2d86.27649537604555!3d23.816960886131495!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f4236a28cc1a21%3A0xe54d924dc528c11e!2sCommerce%20Gyan!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0, borderRadius: "1.25rem" }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Commerce Gyan Map Location"
              ></iframe>
            </div>
          </div>

        </div>
      </div>

    </main>
  );
}
