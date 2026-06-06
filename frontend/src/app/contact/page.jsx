"use client";
import { useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
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

  const inputClass = "w-full h-[54px] px-4 rounded-xl border border-slate-200 bg-white text-sm text-gray-800 placeholder-slate-300 focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/12 outline-none transition-all duration-300";
  const selectClass = "w-full h-[54px] px-4 rounded-xl border border-slate-200 bg-white text-sm text-gray-800 focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/12 outline-none transition-all duration-300 disabled:opacity-50 disabled:bg-slate-50";

  return (
    <main className="min-h-screen bg-slate-50/30 flex flex-col font-[family-name:var(--font-mulish)] relative pt-[75px] lg:pt-[80px]">
      
      {/* Unified Header */}
      <Header />

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

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-center py-20 px-6 relative overflow-hidden select-none">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00AEEF]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="bg-white/10 text-[#38bdf8] text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase mb-4 inline-block backdrop-blur-md border border-white/5">
            Get In Touch
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight leading-tight">
            Let's Start Your <span className="bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] bg-clip-text text-transparent">Academic Journey</span>
          </h1>
          <p className="text-blue-100/70 text-sm md:text-base max-w-xl mx-auto font-medium leading-relaxed">
            Have questions about admissions, course curricula, or batches? Our expert academic counseling team is ready to guide you.
          </p>
        </div>
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
                  icon: (
                    <svg className="w-5 h-5 text-[#00AEEF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  ), 
                  title: "Visit Us", 
                  desc: "Behind Rajasthani Dharamshala, Katrasgarh, Dhanbad, Jharkhand", 
                  link: "https://maps.google.com/?q=Commerce+Gyan+Katrasgarh" 
                },
                { 
                  icon: (
                    <svg className="w-5 h-5 text-[#00AEEF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  ), 
                  title: "Call Us", 
                  desc: "+91 82713 65450", 
                  link: "tel:8271365450" 
                },
                { 
                  icon: (
                    <svg className="w-5 h-5 text-[#00AEEF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  ), 
                  title: "Email Us", 
                  desc: "info@commercegyan.com", 
                  link: "mailto:info@commercegyan.com" 
                },
                { 
                  icon: (
                    <svg className="w-5 h-5 text-[#00AEEF]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 11.908.01c3.152.001 6.117 1.23 8.351 3.463a11.756 11.756 0 013.48 8.368c-.004 6.548-5.342 11.887-11.853 11.887a11.815 11.815 0 01-5.686-1.448L0 24zm6.305-1.654a9.882 9.882 0 004.93 1.303h.005c5.507 0 9.99-4.478 9.99-9.985 0-2.667-1.04-5.176-2.93-7.065A9.925 9.925 0 0012.012 2c-5.506 0-9.989 4.478-9.989 9.984a9.96 9.96 0 001.37 5.054L2 22l5.077-1.332zm11.168-7.29c-.3-.15-1.774-.877-2.046-.977-.272-.1-.47-.15-.668-.15-.198-.3-.767-.976-.94-1.175-.173-.2-.347-.225-.647-.075-.3.15-1.266.467-2.41 1.485-.89.795-1.492 1.779-1.666 2.079-.173.3-.018.462.13.61.135.134.3.349.45.524.15.175.2.299.3.5.1.2.05.374-.025.524-.075.15-.668 1.61-1.11 2.685-.246.596-.495.516-.678.507-.173-.008-.37-.01-.57-.01-.197 0-.518.074-.789.373-.272.3-1.04 1.022-1.04 2.492 0 1.47 1.07 2.89 1.22 3.09.15.2 2.102 3.21 5.093 4.5 1.185.51 1.938.697 2.486.772.71.099 1.36.05 1.875-.025.572-.085 1.774-.724 2.022-1.42.247-.699.247-1.296.173-1.42-.074-.124-.272-.2-.572-.35z"/>
                    </svg>
                  ), 
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
                    <div className="w-10 h-10 bg-[#E6F4FE] rounded-xl flex items-center justify-center shadow-sm mb-4 shrink-0">
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
                  className="flex-1 h-[54px] bg-[#1A3B70] text-white font-black text-center rounded-xl text-xs hover:bg-[#122A50] hover:-translate-y-0.5 active:translate-y-0 shadow-sm transition-all duration-205 flex items-center justify-center gap-2"
                >
                  📞 Call Now
                </a>
                <a 
                  href="https://wa.me/918271365450" 
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 h-[54px] bg-[#25D366] text-white font-black text-center rounded-xl text-xs hover:bg-[#20ba59] hover:-translate-y-0.5 active:translate-y-0 shadow-sm transition-all duration-205 flex items-center justify-center gap-2"
                >
                  💬 WhatsApp
                </a>
                <a 
                  href="https://maps.google.com/?q=Commerce+Gyan+Katrasgarh" 
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 h-[54px] bg-[#FFCC00] text-[#1A3B70] font-black text-center rounded-xl text-xs hover:bg-[#ffd633] hover:-translate-y-0.5 active:translate-y-0 shadow-sm transition-all duration-205 flex items-center justify-center gap-2"
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
                    className="w-full min-h-[120px] px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm text-gray-800 placeholder-slate-300 focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/12 outline-none transition-all duration-300 resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-[54px] bg-[#00AEEF] hover:bg-[#009CD6] text-white font-black rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 text-sm flex items-center justify-center gap-2 cursor-pointer mt-4"
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
          </div>

        </div>
      </div>

      {/* Visit Our Campus Section */}
      <section className="bg-white border-t border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Address & Details (Col: 4) */}
            <div className="lg:col-span-4 space-y-6">
              <div>
                <span className="text-xs font-black text-[#00AEEF] tracking-widest uppercase block mb-2">Location</span>
                <h2 className="text-3xl font-black text-[#1A3B70] tracking-tight">Visit Our Campus</h2>
                <p className="text-slate-500 text-sm font-semibold mt-2 leading-relaxed">
                  Walk in to our main center in Katrasgarh for admissions, counseling sessions, and student queries.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h3 className="font-extrabold text-slate-800 text-[15px] mb-3">Campus Address</h3>
                <p className="text-slate-600 text-[14px] font-bold leading-relaxed whitespace-pre-line">
                  Commerce Gyan
                  Behind Rajasthani Dharamshala,
                  Katrasgarh, Dhanbad,
                  Jharkhand – 828113
                </p>
              </div>

              <div className="space-y-3">
                <a 
                  href="https://maps.google.com/?q=Commerce+Gyan+Katrasgarh"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex h-12 bg-[#00AEEF] hover:bg-[#009CD6] text-white font-black rounded-xl text-xs items-center justify-center gap-2 shadow-sm hover:shadow transition-all duration-200"
                >
                  🗺️ Open in Google Maps
                </a>
              </div>
            </div>

            {/* Map Frame (Col: 8) */}
            <div className="lg:col-span-8">
              <div className="bg-slate-50 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.03)] p-4 overflow-hidden h-[400px] w-full relative">
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
      </section>

    </main>
  );
}
