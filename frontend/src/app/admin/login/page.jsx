"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };

  // Redirect check on mount for already logged-in admin users
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === "admin") {
          router.push("/admin");
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
      if (!res.ok || data.user?.role !== "admin") { 
        showToast("Invalid admin credentials", "error");
        setError("Invalid admin credentials"); 
        setLoading(false); 
        return; 
      }

      showToast("Access granted! Redirecting...", "success");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      setTimeout(() => {
        router.push("/admin");
      }, 800);
    } catch { 
      showToast("Server error. Please try again.", "error");
      setError("Server error."); 
      setLoading(false); 
    }
  };

  const inputClass = "w-full h-[54px] px-4 rounded-xl border border-slate-200 bg-white text-sm text-gray-800 placeholder-slate-300 focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/12 outline-none transition-all duration-300";

  return (
    <main className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center px-6 py-12 font-[family-name:var(--font-mulish)] relative overflow-hidden">
      
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

      {/* Admin Panel Container */}
      <div className="w-full max-w-[400px] bg-white rounded-3xl border border-slate-100 shadow-[0_12px_40px_rgba(15,23,42,0.04)] p-8 md:p-10">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/">
            <img src="/logo.png" alt="Commerce Gyan Logo" className="h-[52px] w-auto object-contain" />
          </Link>
        </div>

        {/* Admin Badge */}
        <div className="flex justify-center mb-6">
          <span className="bg-slate-900 text-[#38bdf8] text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase">
            🔐 ADMIN PORTAL
          </span>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Admin Login</h2>
          <p className="text-slate-400 text-[13px] font-semibold mt-1">Access the control panel</p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[13px] font-bold flex items-center gap-2.5 animate-pulse-soft">
            <span className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 text-[10px] shrink-0 font-extrabold">!</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Admin Email</label>
            <input 
              type="email" 
              required 
              placeholder="admin@commercegyan.com" 
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} 
              className={inputClass} 
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
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
            className="w-full h-[54px] bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-all duration-300 disabled:opacity-50 text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer mt-6"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Entering Portal...</span>
              </>
            ) : (
              <span>Access Dashboard →</span>
            )}
          </button>
        </form>

        <p className="text-center mt-6">
          <Link href="/login" className="text-xs text-[#0B4DDB] font-black hover:text-[#0ea5e9] transition-colors">
            ← Back to Student / Teacher Login
          </Link>
        </p>

        <p className="text-center text-[11px] text-slate-350 mt-6 font-semibold">
          By proceeding, you agree to Commerce Gyan&apos;s{" "}
          <span className="text-slate-400">Privacy Policy</span>
        </p>
      </div>
    </main>
  );
}
