"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const inp = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20 outline-none text-sm bg-white transition-all";

export default function AdminLogin() {
  const router = useRouter();
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
      if (!res.ok || data.user?.role !== "admin") { setError("Invalid admin credentials"); setLoading(false); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/admin");
    } catch { setError("Server error."); setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-5 py-8 font-[family-name:var(--font-mulish)]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/"><Image src="/logo.png" alt="Commerce Gyan" width={200} height={60} className="object-contain max-h-[60px] w-auto" priority /></Link>
        </div>

        {/* Admin badge */}
        <div className="flex justify-center mb-6">
          <span className="bg-[#1A3B70] text-white text-xs font-black px-4 py-1.5 rounded-full tracking-wide">🔐 ADMIN PORTAL</span>
        </div>

        <h2 className="text-xl font-black text-gray-800 mb-1">Admin Login</h2>
        <p className="text-gray-400 text-sm mb-6">Access the Commerce Gyan control panel</p>

        {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">Admin Email</label>
            <input type="email" required placeholder="Enter admin email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} className={inp} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-gray-800">Password</label>
            </div>
            <div className="relative">
              <input type={showPw ? "text" : "password"} required placeholder="Enter admin password"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                className={`${inp} pr-20`} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-bold">
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-[#1A3B70] text-white font-black rounded-xl hover:bg-[#122A50] transition-colors disabled:opacity-50 text-sm">
            {loading ? "Signing in..." : "Access Dashboard →"}
          </button>
        </form>

        <p className="text-center mt-6">
          <Link href="/login" className="text-xs text-gray-400 hover:text-[#1A3B70] font-semibold transition-colors">
            ← Back to Student / Teacher Login
          </Link>
        </p>

        <p className="text-center text-xs text-gray-400 mt-6">
          By proceeding, you agree to Commerce Gyan&apos;s{" "}
          <span className="text-[#00AEEF]">Privacy Policy</span>
        </p>
      </div>
    </main>
  );
}
