"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.stream || !form.className) { setError("Please select your stream and class."); return; }
    if (!agreed) { setError("Please agree to the terms to continue."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${form.firstName} ${form.lastName}`.trim(), email: form.email, password: form.password, phone: form.phone, stream: form.stream, className: form.className, address: form.address }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Registration failed"); setLoading(false); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
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
            Your Journey<br />
            <span className="text-[#0EA5E9]">Starts Here.</span>
          </h1>
          <p className="text-blue-200/80 text-[14px] leading-relaxed mb-8 max-w-sm">
            Join Bihar&apos;s premier coaching institute. Get access to expert faculty, weekly test series, and comprehensive study material from day one.
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

      {/* RIGHT — Signup Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-6 bg-[#FAFBFC] overflow-y-auto">
        <div className="w-full max-w-[440px]">
          {/* Mobile logo */}
          <div className="flex justify-center mb-5 lg:hidden">
            <Link href="/"><Image src="/logo.png" alt="Commerce Gyan" width={180} height={50} className="object-contain max-h-[50px] w-auto" priority /></Link>
          </div>

          <div className="mb-5">
            <h2 className="text-[24px] font-black text-[#0F172A]">Create Account ✨</h2>
            <p className="text-gray-400 text-[13px] font-medium mt-1">Register as a new student</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[13px] font-semibold flex items-center gap-2">
              <span className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center text-red-500 text-[10px] shrink-0">!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">First Name *</label>
                <input type="text" required placeholder="First name" value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-300 focus:border-[#0B4DDB] focus:ring-4 focus:ring-[#0B4DDB]/10 outline-none transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Last Name *</label>
                <input type="text" required placeholder="Last name" value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-300 focus:border-[#0B4DDB] focus:ring-4 focus:ring-[#0B4DDB]/10 outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address *</label>
              <input type="email" required placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-300 focus:border-[#0B4DDB] focus:ring-4 focus:ring-[#0B4DDB]/10 outline-none transition-all duration-200"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mobile Number *</label>
              <input type="tel" required placeholder="10-digit mobile number" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-300 focus:border-[#0B4DDB] focus:ring-4 focus:ring-[#0B4DDB]/10 outline-none transition-all duration-200"
              />
            </div>

            {/* Stream & Class */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Stream *</label>
                <select required value={form.stream} onChange={e => setForm({ ...form, stream: e.target.value, className: "" })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:border-[#0B4DDB] focus:ring-4 focus:ring-[#0B4DDB]/10 outline-none transition-all duration-200">
                  <option value="">Select</option>
                  {Object.keys(STREAMS).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Class *</label>
                <select required value={form.className} onChange={e => setForm({ ...form, className: e.target.value })} disabled={!form.stream}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:border-[#0B4DDB] focus:ring-4 focus:ring-[#0B4DDB]/10 outline-none transition-all duration-200 disabled:opacity-50 disabled:bg-gray-50">
                  <option value="">Select</option>
                  {form.stream && STREAMS[form.stream].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password *</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} required placeholder="Create a strong password"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-300 focus:border-[#0B4DDB] focus:ring-4 focus:ring-[#0B4DDB]/10 outline-none transition-all duration-200 pr-14"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400 hover:text-[#0B4DDB] bg-gray-50 px-2.5 py-1 rounded-lg transition-colors border border-gray-100">
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer py-1">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#0B4DDB] rounded" />
              <span className="text-[12px] text-gray-500 leading-relaxed">
                I agree to receive communications from Commerce Gyan including updates, fee reminders, and announcements.
              </span>
            </label>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-white text-[14px] font-black transition-all duration-200 disabled:opacity-50 shadow-[0_4px_14px_rgba(11,77,219,0.3)] hover:shadow-[0_6px_20px_rgba(11,77,219,0.4)] hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: 'linear-gradient(135deg, #0B4DDB, #0EA5E9)' }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : "Create Account →"}
            </button>
          </form>

          <p className="text-center text-[13px] text-gray-400 mt-4 font-medium">
            Already on Commerce Gyan?{" "}
            <Link href="/login" className="text-[#0B4DDB] font-bold hover:text-[#0EA5E9] transition-colors">Sign In</Link>
          </p>

          <p className="text-center text-[11px] text-gray-300 mt-4 font-medium">
            By creating an account, you agree to Commerce Gyan&apos;s{" "}
            <span className="text-gray-400">Privacy Policy</span>
          </p>
        </div>
      </div>
    </main>
  );
}
