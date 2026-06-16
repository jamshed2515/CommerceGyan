"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "@/config/api";
import { getStoredToken, getStoredUser, setSession, clearSession } from "@/lib/auth";

const RULES = [
  { re: /.{8,}/, label: "At least 8 characters" },
  { re: /[A-Z]/, label: "One uppercase letter" },
  { re: /[a-z]/, label: "One lowercase letter" },
  { re: /\d/, label: "One number" },
  { re: /[^A-Za-z\d]/, label: "One special character (!@#$...)" },
];

export default function SetupPasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState({ cur: false, new: false, con: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Guard: only accessible by teachers with isFirstLogin=true
  useEffect(() => {
    const user = getStoredUser();
    const token = getStoredToken();
    if (!token || !user) { router.replace("/login"); return; }
    if (user.role !== "teacher") { router.replace("/"); return; }
    if (user.isFirstLogin === false) { router.replace("/teacher"); return; }
  }, [router]);

  const strength = RULES.map((r) => ({ ...r, ok: r.re.test(form.newPassword) }));
  const allStrong = strength.every((r) => r.ok);
  const passwordsMatch = form.newPassword === form.confirmPassword && form.confirmPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!allStrong) { setError("Password does not meet all requirements."); return; }
    if (!passwordsMatch) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const token = getStoredToken();
      const res = await fetch(`${API}/api/auth/setup-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed. Try again."); setLoading(false); return; }

      // Update stored user: clear isFirstLogin flag
      const user = getStoredUser();
      const isLocalStorage = !!localStorage.getItem("token");
      setSession(token, { ...user, isFirstLogin: false }, isLocalStorage);

      setSuccess(true);
      setTimeout(() => router.push("/teacher"), 1800);
    } catch {
      setError("Server error. Please try again.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A3B70] to-[#0f2547] px-4 font-[family-name:var(--font-mulish)]">
        <div className="text-center text-white space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto text-3xl shadow-xl">✓</div>
          <h2 className="text-2xl font-black">Password Set!</h2>
          <p className="text-white/70 font-semibold">Redirecting to your dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1A3B70] to-[#0f2547] px-4 py-12 font-[family-name:var(--font-mulish)]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Commerce Gyan" className="h-12 w-auto object-contain brightness-0 invert" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Top banner */}
          <div className="bg-gradient-to-r from-[#1A3B70] to-[#0ea5e9] px-8 py-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-xl">🔐</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Security Setup Required</span>
            </div>
            <h1 className="text-xl font-black leading-snug">Welcome to Commerce Gyan</h1>
            <p className="text-white/75 text-sm font-semibold mt-1.5 leading-relaxed">
              For security reasons, please create your personal password before accessing the teacher portal.
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-7 space-y-5">
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-[13px] font-bold flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-[10px] shrink-0">!</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Current (temp) password */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Current (Temporary) Password
                </label>
                <div className="relative">
                  <input
                    type={showPw.cur ? "text" : "password"}
                    required
                    value={form.currentPassword}
                    onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                    placeholder="Enter the password given by admin"
                    className="w-full h-12 px-4 pr-14 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 placeholder-slate-300 focus:border-[#1A3B70] focus:ring-4 focus:ring-[#1A3B70]/10 outline-none transition-all"
                  />
                  <button type="button" onClick={() => setShowPw((s) => ({ ...s, cur: !s.cur }))}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 hover:text-[#1A3B70] transition-colors cursor-pointer">
                    {showPw.cur ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPw.new ? "text" : "password"}
                    required
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                    placeholder="Create a strong password"
                    className="w-full h-12 px-4 pr-14 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 placeholder-slate-300 focus:border-[#1A3B70] focus:ring-4 focus:ring-[#1A3B70]/10 outline-none transition-all"
                  />
                  <button type="button" onClick={() => setShowPw((s) => ({ ...s, new: !s.new }))}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 hover:text-[#1A3B70] transition-colors cursor-pointer">
                    {showPw.new ? "Hide" : "Show"}
                  </button>
                </div>

                {/* Strength rules */}
                {form.newPassword.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    {strength.map((r) => (
                      <div key={r.label} className={`flex items-center gap-1.5 text-[11px] font-bold transition-colors ${r.ok ? "text-emerald-600" : "text-slate-400"}`}>
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] flex-shrink-0 transition-colors ${r.ok ? "bg-emerald-100 text-emerald-600" : "bg-slate-100"}`}>
                          {r.ok ? "✓" : "○"}
                        </span>
                        {r.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPw.con ? "text" : "password"}
                    required
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Re-enter your new password"
                    className={`w-full h-12 px-4 pr-14 rounded-xl border text-sm font-semibold placeholder-slate-300 outline-none transition-all ${
                      form.confirmPassword.length > 0
                        ? passwordsMatch
                          ? "border-emerald-400 bg-emerald-50 text-slate-700 focus:ring-4 focus:ring-emerald-500/10"
                          : "border-rose-300 bg-rose-50 text-slate-700 focus:ring-4 focus:ring-rose-500/10"
                        : "border-slate-200 bg-slate-50 text-slate-700 focus:border-[#1A3B70] focus:ring-4 focus:ring-[#1A3B70]/10"
                    }`}
                  />
                  <button type="button" onClick={() => setShowPw((s) => ({ ...s, con: !s.con }))}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 hover:text-[#1A3B70] transition-colors cursor-pointer">
                    {showPw.con ? "Hide" : "Show"}
                  </button>
                </div>
                {form.confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="text-[11px] font-bold text-rose-500 mt-1.5">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !allStrong || !passwordsMatch || !form.currentPassword}
                className="w-full h-12 bg-[#1A3B70] text-white font-black rounded-xl hover:bg-[#0f2547] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2 mt-2 shadow-lg shadow-[#1A3B70]/20 cursor-pointer"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Setting Password...</span></>
                ) : (
                  <span>Set Password & Enter Dashboard →</span>
                )}
              </button>
            </form>

            <p className="text-center text-[11px] text-slate-400 font-semibold">
              This is a one-time security setup. Your password is stored securely and encrypted.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
