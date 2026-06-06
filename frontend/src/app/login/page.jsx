"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Login failed"); setLoading(false); return; }
      if (data.user.role === "admin") { setError("Use the Admin Login page for admin access."); setLoading(false); return; }
      if (role === "teacher" && data.user.role !== "teacher") { setError("This account is not a teacher account."); setLoading(false); return; }
      if (role === "student" && data.user.role !== "student") { setError("This account is not a student account."); setLoading(false); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push(data.user.role === "teacher" ? "/teacher" : "/dashboard");
    } catch { setError("Server error. Please try again."); setLoading(false); }
  };

  return (
    <main className="min-h-screen flex font-[family-name:var(--font-mulish)]">
      {/* LEFT — Branding Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between"
        style={{ background: 'linear-gradient(160deg, #0F172A 0%, #1E3A5F 40%, #0B4DDB 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute bottom-32 -left-16 w-56 h-56 bg-[#0EA5E9]/10 rounded-full" />
        <div className="absolute top-1/2 right-10 w-32 h-32 bg-[#0B4DDB]/20 rounded-full" />

        <div className="relative z-10 px-10 pt-10">
          <Link href="/">
            <Image src="/logo.png" alt="Commerce Gyan" width={180} height={50} className="object-contain max-h-[50px] w-auto brightness-0 invert" priority />
          </Link>
        </div>

        <div className="relative z-10 px-10 flex-1 flex flex-col justify-center">
          <h1 className="text-[32px] font-black text-white leading-tight mb-4">
            Learn. Grow.<br />
            <span className="text-[#0EA5E9]">Succeed.</span>
          </h1>
          <p className="text-blue-200/80 text-[14px] leading-relaxed mb-8 max-w-sm">
            Bihar&apos;s most trusted coaching institute for Commerce education. Expert faculty, proven results, and personalized attention for every student.
          </p>

          {/* Stats */}
          <div className="flex gap-3">
            {[
              { val: "500+", label: "Students" },
              { val: "20+", label: "Courses" },
              { val: "7+", label: "Years Exp." },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 text-center flex-1">
                <p className="text-white text-xl font-black">{s.val}</p>
                <p className="text-blue-200/70 text-[11px] font-bold mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 px-10 pb-6">
          <p className="text-blue-300/50 text-[11px] font-semibold">© 2026 Commerce Gyan. All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 bg-[#FAFBFC]">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex justify-center mb-6 lg:hidden">
            <Link href="/"><Image src="/logo.png" alt="Commerce Gyan" width={180} height={50} className="object-contain max-h-[50px] w-auto" priority /></Link>
          </div>

          <div className="mb-6">
            <h2 className="text-[24px] font-black text-[#0F172A]">Welcome Back 👋</h2>
            <p className="text-gray-400 text-[13px] font-medium mt-1">Sign in to access your dashboard</p>
          </div>

          {/* Role switch */}
          <div className="flex bg-[#F1F5F9] rounded-2xl p-1 mb-6 border border-gray-200/50">
            {[{ key: "student", label: "🎓 Student", emoji: "" }, { key: "teacher", label: "👨‍🏫 Teacher", emoji: "" }].map(r => (
              <button key={r.key} onClick={() => { setRole(r.key); setError(""); setForm({ email: "", password: "" }); }}
                className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 ${
                  role === r.key
                    ? "bg-white text-[#0B4DDB] shadow-[0_2px_8px_rgba(11,77,219,0.12)] border border-[#0B4DDB]/10"
                    : "text-gray-500 hover:text-gray-700"
                }`}>
                {r.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[13px] font-semibold flex items-center gap-2">
              <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center text-red-500 text-[10px] shrink-0">!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
              <input type="email" required placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-300 focus:border-[#0B4DDB] focus:ring-4 focus:ring-[#0B4DDB]/10 outline-none transition-all duration-200"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Password</label>
                <button type="button" className="text-[12px] text-[#0B4DDB] font-semibold hover:text-[#0EA5E9] transition-colors">Forgot?</button>
              </div>
              <div className="relative">
                <input type={showPw ? "text" : "password"} required placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-300 focus:border-[#0B4DDB] focus:ring-4 focus:ring-[#0B4DDB]/10 outline-none transition-all duration-200 pr-14"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400 hover:text-[#0B4DDB] bg-gray-50 px-2.5 py-1 rounded-lg transition-colors border border-gray-100">
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-white text-[14px] font-black transition-all duration-200 disabled:opacity-50 shadow-[0_4px_14px_rgba(11,77,219,0.3)] hover:shadow-[0_6px_20px_rgba(11,77,219,0.4)] hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: 'linear-gradient(135deg, #0B4DDB, #0EA5E9)' }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : "Sign In →"}
            </button>
          </form>

          {role === "student" && (
            <p className="text-center text-[13px] text-gray-400 mt-5 font-medium">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[#0B4DDB] font-bold hover:text-[#0EA5E9] transition-colors">Create Account</Link>
            </p>
          )}
          {role === "teacher" && (
            <p className="text-center text-[12px] text-gray-400 mt-5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 font-medium">
              ℹ️ Teacher accounts are created by the institute admin.
            </p>
          )}

          <div className="mt-5 flex items-center justify-center gap-3">
            <div className="h-px bg-gray-200 flex-1" />
            <Link href="/admin/login" className="text-[11px] text-gray-400 hover:text-[#0B4DDB] font-semibold transition-colors whitespace-nowrap">
              🔐 Admin Login
            </Link>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          <p className="text-center text-[11px] text-gray-300 mt-6 font-medium">
            By continuing, you agree to Commerce Gyan&apos;s{" "}
            <span className="text-gray-400">Privacy Policy</span>
          </p>
        </div>
      </div>
    </main>
  );
}
