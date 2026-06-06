"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

export default function Login() {
  const router = useRouter();
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
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
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { 
        showToast(data.message || "Login failed", "error"); 
        setError(data.message || "Login failed");
        setLoading(false); 
        return; 
      }
      if (data.user.role === "admin") { 
        showToast("Use the Admin Login portal.", "error");
        setError("Use the Admin Login page for admin access."); 
        setLoading(false); 
        return; 
      }
      if (role === "teacher" && data.user.role !== "teacher") { 
        showToast("This account is not a teacher account.", "error");
        setError("This account is not a teacher account."); 
        setLoading(false); 
        return; 
      }
      if (role === "student" && data.user.role !== "student") { 
        showToast("This account is not a student account.", "error");
        setError("This account is not a student account."); 
        setLoading(false); 
        return; 
      }

      showToast("Login successful! Redirecting...", "success");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      setTimeout(() => {
        router.push(data.user.role === "teacher" ? "/teacher" : "/dashboard");
      }, 800);
    } catch { 
      showToast("Server error. Please try again.", "error");
      setError("Server error. Please try again."); 
      setLoading(false); 
    }
  };

  const inputClass = "w-full h-[54px] px-4 rounded-xl border border-slate-200 bg-white text-sm text-gray-800 placeholder-slate-300 focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/12 outline-none transition-all duration-300";

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
          <span className="text-xs font-black text-[#0ea5e9] tracking-widest uppercase mb-3 block">Premier Commerce Coaching</span>
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

      {/* RIGHT — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-slate-50/50">
        <div className="w-full max-w-[400px] bg-white rounded-3xl border border-slate-100 shadow-[0_12px_40px_rgba(15,23,42,0.04)] p-8 md:p-10">
          {/* Mobile logo */}
          <div className="flex justify-center mb-6 lg:hidden">
            <Link href="/">
              <img src="/logo.png" alt="Commerce Gyan" className="h-[48px] w-auto object-contain" />
            </Link>
          </div>

          <div className="mb-6 text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Welcome Back 👋</h2>
            <p className="text-slate-400 text-[13px] font-semibold mt-1">Sign in to access your dashboard</p>
          </div>

          {/* Role switch tabs */}
          <div className="flex bg-slate-100 rounded-2xl p-1 mb-6 border border-slate-200/40">
            {[
              { key: "student", label: "🎓 Student" }, 
              { key: "teacher", label: "👨‍🏫 Teacher" }
            ].map(r => (
              <button 
                key={r.key} 
                type="button"
                onClick={() => { setRole(r.key); setError(""); setForm({ email: "", password: "" }); }}
                className={`flex-1 py-2.5 rounded-xl text-[13px] font-black transition-all duration-200 cursor-pointer ${
                  role === r.key
                    ? "bg-white text-[#0B4DDB] shadow-[0_2px_8px_rgba(15,23,42,0.05)] border border-slate-100"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-5 px-4 py-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[13px] font-bold flex items-center gap-2.5 animate-pulse-soft">
              <span className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 text-[10px] shrink-0 font-extrabold">!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="you@example.com" 
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                <button type="button" className="text-xs text-[#0B4DDB] font-extrabold hover:text-[#0EA5E9] transition-colors">Forgot?</button>
              </div>
              <div className="relative">
                <input 
                  type={showPw ? "text" : "password"} 
                  required 
                  placeholder="••••••••"
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

            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-[54px] rounded-xl text-white text-sm font-black transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer mt-6"
              style={{ background: 'linear-gradient(135deg, #0B4DDB, #0ea5e9)' }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In →</span>
              )}
            </button>
          </form>

          {role === "student" && (
            <p className="text-center text-[13px] text-slate-400 mt-6 font-semibold">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[#0B4DDB] font-black hover:text-[#0ea5e9] transition-colors">Create Account</Link>
            </p>
          )}
          {role === "teacher" && (
            <p className="text-center text-[12px] text-slate-400 mt-6 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 font-semibold leading-relaxed">
              ℹ️ Teacher accounts are created by the institute admin.
            </p>
          )}

          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="h-px bg-slate-100 flex-1" />
            <Link href="/admin/login" className="text-xs text-slate-400 hover:text-[#0B4DDB] font-extrabold transition-colors whitespace-nowrap">
              🔐 Admin Login
            </Link>
            <div className="h-px bg-slate-100 flex-1" />
          </div>

          <p className="text-center text-[11px] text-slate-350 mt-6 font-semibold">
            By continuing, you agree to Commerce Gyan&apos;s{" "}
            <span className="text-slate-400">Privacy Policy</span>
          </p>
        </div>
      </div>
    </main>
  );
}
