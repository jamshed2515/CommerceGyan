"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
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
    <main className="min-h-screen bg-[#0D1E3A] flex items-center justify-center p-6 font-[family-name:var(--font-mulish)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white mb-1">Commerce<span className="text-[#FFCC00]">Giyan</span></h1>
          <p className="text-white/60 text-sm">Admin Control Panel</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-[#1A3B70] p-6 text-center">
            <div className="w-14 h-14 bg-[#FFCC00] rounded-full flex items-center justify-center text-2xl mx-auto mb-3">🔐</div>
            <h2 className="text-xl font-black text-white">Admin Login</h2>
          </div>
          <div className="p-8">
            {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">⚠️ {error}</div>}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Admin Email</label>
                <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1A3B70] outline-none text-[14px] bg-gray-50" placeholder="Admin email" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Password</label>
                <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#1A3B70] outline-none text-[14px] bg-gray-50" placeholder="Admin password" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-[#1A3B70] text-white font-black rounded-lg hover:bg-[#122A50] transition-colors disabled:opacity-60">
                {loading ? "Signing in..." : "Access Dashboard →"}
              </button>
            </form>
            <div className="mt-4 text-center"><Link href="/" className="text-sm text-gray-400 hover:text-[#00AEEF]">← Back to website</Link></div>
          </div>
        </div>
      </div>
    </main>
  );
}
