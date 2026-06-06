"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

const STREAMS = {
  "School": ["Class 7", "Class 8", "Class 9", "Class 10"],
  "Commerce": ["Class 11 (Commerce)", "Class 12 (Commerce)"],
  "Professional Courses": ["B.Com", "CA Foundation", "CMA Foundation", "CS Foundation"],
};

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", stream: "", className: "", address: "" });
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  // Redirect check on mount for already logged-in users
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === "admin") {
          router.push("/admin");
        } else if (user.role === "teacher") {
          router.push("/teacher");
        } else if (user.role === "student") {
          router.push("/dashboard");
        }
      } catch {
        localStorage.clear();
      }
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.stream || !form.className) { 
      showToast("Please select your stream and class.", "error");
      setError("Please select your stream and class."); 
      return; 
    }
    if (!agreed) { 
      showToast("Please agree to the terms to continue.", "error");
      setError("Please agree to the terms to continue."); 
      return; 
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: `${form.firstName} ${form.lastName}`.trim(), 
          email: form.email, 
          password: form.password, 
          phone: form.phone, 
          stream: form.stream, 
          className: form.className, 
          address: form.address 
        }),
      });
      const data = await res.json();
      if (!res.ok) { 
        showToast(data.message || "Registration failed", "error");
        setError(data.message || "Registration failed"); 
        setLoading(false); 
        return; 
      }

      showToast("Account created successfully! Redirecting...", "success");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch { 
      showToast("Server error. Please try again.", "error");
      setError("Server error. Please try again."); 
      setLoading(false); 
    }
  };

  const inputClass = "w-full h-[52px] px-4 rounded-xl border border-slate-200 bg-white text-sm text-gray-800 placeholder-slate-300 focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/12 outline-none transition-all duration-300";
  const selectClass = "w-full h-[52px] px-4 rounded-xl border border-slate-200 bg-white text-sm text-gray-800 focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/12 outline-none transition-all duration-300 disabled:opacity-50 disabled:bg-slate-50";

  return (
    <main className="min-h-screen flex font-[family-name:var(--font-mulish)] relative overflow-hidden bg-white">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes floatMid {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(0.95); }
        }
        @keyframes floatFast {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float-slow {
          animation: floatSlow 8s ease-in-out infinite;
        }
        .animate-float-mid {
          animation: floatMid 6s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: floatFast 4s ease-in-out infinite;
        }
      `}} />

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

      {/* LEFT — Branding Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white select-none">
        {/* Animated background bubbles */}
        <div className="absolute top-1/4 left-1/4 w-36 h-36 bg-white/5 rounded-full blur-2xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-52 h-52 bg-[#0ea5e9]/10 rounded-full blur-3xl animate-float-mid" />
        <div className="absolute top-12 right-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-xl animate-float-fast" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/">
            <div className="bg-white/95 px-5 py-2.5 rounded-2xl inline-block shadow-md hover:bg-white transition-colors duration-200">
              <img src="/logo.png" alt="Commerce Gyan" className="h-8 w-auto object-contain" />
            </div>
          </Link>
        </div>

        {/* Dynamic Showcase Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-sm mx-auto">
          <span className="text-xs font-black text-[#0ea5e9] tracking-widest uppercase mb-3 block">Join our Community</span>
          <h1 className="text-4xl font-black leading-[1.15] tracking-tight mb-8">
            Empowering Future <br />
            Commerce <span className="bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] bg-clip-text text-transparent">Leaders</span>
          </h1>
          
          {/* Bullets with icons */}
          <div className="space-y-5">
            {[
              { text: "98.2% Board Pass Rate", desc: "Consistently delivering top district ranks" },
              { text: "150+ CA & Board Toppers", desc: "Alumni studying at top universities and clearing CA foundation" },
              { text: "Expert Faculty Team", desc: "Mentored by NET qualified and post-graduate teachers" },
              { text: "Career-Focused Learning", desc: "Conceptual clarity and personal workspace tracking" }
            ].map((b, i) => (
              <div key={i} className="flex gap-4 items-start group">
                <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-sm group-hover:bg-[#0ea5e9]/20 transition-colors shrink-0">✨</span>
                <div>
                  <h4 className="font-extrabold text-white text-[15px] leading-tight">{b.text}</h4>
                  <p className="text-blue-200/60 text-[12px] mt-0.5 font-medium">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-blue-300/40 text-xs font-semibold">© 2026 Commerce Gyan. All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT — Signup Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-slate-50/50 overflow-y-auto">
        <div className="w-full max-w-[440px] bg-white rounded-3xl border border-slate-100 shadow-[0_12px_40px_rgba(15,23,42,0.04)] p-8 md:p-10 my-4">
          {/* Mobile logo */}
          <div className="flex justify-center mb-6 lg:hidden">
            <Link href="/">
              <img src="/logo.png" alt="Commerce Gyan" className="h-[48px] w-auto object-contain" />
            </Link>
          </div>

          <div className="mb-6 text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Create Account ✨</h2>
            <p className="text-slate-400 text-[13px] font-semibold mt-1">Register as a new student</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[13px] font-bold flex items-center gap-2.5 animate-pulse-soft">
              <span className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 text-[10px] shrink-0 font-extrabold">!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">First Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="First name" 
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Last Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Last name" 
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email Address *</label>
              <input 
                type="email" 
                required 
                placeholder="you@example.com" 
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Mobile Number *</label>
              <input 
                type="tel" 
                required 
                placeholder="10-digit mobile number" 
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className={inputClass}
              />
            </div>

            {/* Stream & Class */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Stream *</label>
                <select 
                  required 
                  value={form.stream} 
                  onChange={e => setForm({ ...form, stream: e.target.value, className: "" })}
                  className={selectClass}
                >
                  <option value="">Select</option>
                  {Object.keys(STREAMS).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Class *</label>
                <select 
                  required 
                  value={form.className} 
                  onChange={e => setForm({ ...form, className: e.target.value })} 
                  disabled={!form.stream}
                  className={selectClass}
                >
                  <option value="">Select</option>
                  {form.stream && STREAMS[form.stream].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Password *</label>
              <div className="relative">
                <input 
                  type={showPw ? "text" : "password"} 
                  required 
                  placeholder="Create a strong password"
                  value={form.password} 
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className={`${inputClass} pr-14`}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 hover:text-[#0ea5e9] transition-colors cursor-pointer select-none"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-3 cursor-pointer py-1 select-none">
              <input 
                type="checkbox" 
                checked={agreed} 
                onChange={e => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#0B4DDB] rounded border-slate-200" 
              />
              <span className="text-[12px] text-slate-500 font-semibold leading-relaxed">
                I agree to receive communications from Commerce Gyan including updates, fee reminders, and announcements.
              </span>
            </label>

            {/* Submit */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-[54px] rounded-xl text-white text-sm font-black transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer mt-6"
              style={{ background: 'linear-gradient(135deg, #0B4DDB, #0ea5e9)' }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account →</span>
              )}
            </button>
          </form>

          <p className="text-center text-[13px] text-slate-400 mt-6 font-semibold">
            Already on Commerce Gyan?{" "}
            <Link href="/login" className="text-[#0B4DDB] font-black hover:text-[#0ea5e9] transition-colors">Sign In</Link>
          </p>

          <p className="text-center text-[11px] text-slate-350 mt-6 font-semibold">
            By creating an account, you agree to Commerce Gyan&apos;s{" "}
            <span className="text-slate-400">Privacy Policy</span>
          </p>
        </div>
      </div>
    </main>
  );
}
