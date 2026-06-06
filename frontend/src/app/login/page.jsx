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

  const inputClass = "w-full h-[56px] px-4 rounded-[14px] border border-[#e5e7eb] bg-white text-sm text-gray-800 placeholder-slate-300 focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/12 outline-none transition-all duration-300";

  return (
    <main className="min-h-screen flex flex-col lg:flex-row font-[family-name:var(--font-mulish)] bg-white relative overflow-hidden">
      
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

      {/* LEFT PANEL — Split Screen Left (50% on Desktop) */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative text-white select-none flex-col justify-between p-12"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 35%),
            radial-gradient(circle at 80% 30%, rgba(255,255,255,0.06), transparent 35%),
            radial-gradient(circle at 50% 80%, rgba(255,255,255,0.05), transparent 40%),
            linear-gradient(135deg, #0F2A66 0%, #153A8A 40%, #1E4ED8 100%)
          `
        }}
      >
        {/* Logo at Top Right of the Left Panel */}
        <div className="absolute" style={{ top: "40px", right: "50px" }}>
          <Link href="/">
            <img 
              src="/logo.png" 
              alt="Commerce Gyan Logo" 
              className="w-[100px] h-auto object-contain invert mix-blend-screen opacity-95 transition-all duration-300 hover:scale-102" 
            />
          </Link>
        </div>

        {/* Center illustration & copy (Vertically balanced and centered) */}
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 max-w-lg mx-auto">
          <div className="w-full max-w-[440px] transition-transform duration-500 hover:scale-[1.02]">
            <img src="/students_illustration.png" alt="Students studying" className="w-full h-auto object-contain" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
              Empowering Future Leaders
            </h1>
            <p className="text-white/70 text-[15px] font-semibold leading-relaxed max-w-sm mx-auto">
              Join Commerce Gyan and unlock expert guidance, structured learning, and career-focused education.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-left">
          <p className="text-white/40 text-xs font-semibold">© 2026 Commerce Gyan. All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT PANEL — Split Screen Right (50% on Desktop, 100% on Mobile) */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white">
        <div className="w-full max-w-[480px]">
          {/* Mobile centered logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Link href="/">
              <img src="/logo.png" alt="Commerce Gyan Logo" className="h-[50px] w-auto object-contain" />
            </Link>
          </div>

          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Welcome Back 👋</h2>
            <p className="text-slate-400 text-sm font-semibold mt-1.5">Sign in to access your coaching workspace</p>
          </div>

          {/* Role switcher tabs */}
          <div className="flex bg-slate-100 rounded-[14px] p-1 mb-6 border border-slate-200/40">
            {[
              { key: "student", label: "🎓 Student" }, 
              { key: "teacher", label: "👨‍🏫 Teacher" }
            ].map(r => (
              <button 
                key={r.key} 
                type="button"
                onClick={() => { setRole(r.key); setError(""); setForm({ email: "", password: "" }); }}
                className={`flex-1 py-3 rounded-[12px] text-[13px] font-black transition-all duration-200 cursor-pointer ${
                  role === r.key
                    ? "bg-white text-[#1d4ed8] shadow-[0_2px_8px_rgba(15,23,42,0.04)] border border-slate-200/30"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-5 px-4 py-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[13px] font-bold flex items-center gap-2.5">
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
                <button type="button" className="text-xs text-[#1d4ed8] font-extrabold hover:text-[#0ea5e9] transition-colors">Forgot?</button>
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 hover:text-[#0ea5e9] transition-colors cursor-pointer select-none"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Standardized Button with Gradient (from #1d4ed8 to #0ea5e9) */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-[56px] rounded-[14px] text-white text-sm font-black transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer mt-6 bg-gradient-to-r from-[#1d4ed8] to-[#0ea5e9]"
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
            <p className="text-center text-sm text-slate-400 mt-6 font-semibold">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[#1d4ed8] font-black hover:text-[#0ea5e9] transition-colors">Create Account</Link>
            </p>
          )}
          {role === "teacher" && (
            <p className="text-center text-[12px] text-slate-400 mt-6 bg-slate-50 border border-slate-100 rounded-[14px] px-4 py-3.5 font-semibold leading-relaxed">
              ℹ️ Teacher accounts are created by the institute admin.
            </p>
          )}

          <div className="mt-6 flex items-center justify-center gap-4">
            <div className="h-px bg-slate-100 flex-1" />
            <Link href="/admin/login" className="text-xs text-slate-400 hover:text-[#1d4ed8] font-extrabold transition-colors whitespace-nowrap">
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
