"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Login failed"); setLoading(false); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.user.role === "admin") router.push("/admin");
      else router.push("/dashboard");
    } catch {
      setError("Server error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] flex flex-col font-[family-name:var(--font-mulish)]">
      <nav className="w-full bg-white border-b border-gray-100 shadow-sm py-4 px-6 flex justify-center md:justify-start">
        <Link href="/" className="inline-block">
          <Image src="/logo.png" alt="Commerce Giyan Logo" width={180} height={50} className="object-contain max-h-[50px] w-auto" priority />
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
          <div className="bg-[#1A3B70] p-8 text-center relative overflow-hidden">
            <div className="absolute -bottom-6 left-0 w-full h-12 bg-[#00AEEF] rounded-t-[50%] opacity-20 blur-xl"></div>
            <h2 className="text-3xl font-black text-white relative z-10 mb-2">Welcome Back</h2>
            <p className="text-white/80 text-[14px] font-medium relative z-10">Sign in to your Commerce Giyan account</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[14px] font-medium">
                ⚠️ {error}
              </div>
            )}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email" required placeholder="Enter your email"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20 outline-none transition-all text-[15px] bg-gray-50 focus:bg-white"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[14px] font-bold text-gray-700">Password</label>
                  <Link href="#" className="text-[13px] font-bold text-[#00AEEF] hover:underline">Forgot password?</Link>
                </div>
                <input
                  type="password" required placeholder="Enter your password"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20 outline-none transition-all text-[15px] bg-gray-50 focus:bg-white"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full py-3.5 bg-[#1A3B70] text-white font-bold rounded-lg shadow-md hover:bg-[#122A50] transition-colors text-[16px] mt-4 disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 p-4 bg-[#FFF8E1] rounded-lg border border-[#FFCC00]/40 text-center">
              <p className="text-[13px] text-gray-600 font-medium">New student? Apply for admission first</p>
              <Link href="/admission" className="text-[#1A3B70] font-black text-[13px] hover:underline">Submit Admission Enquiry →</Link>
            </div>

            <div className="mt-5 text-center text-[14px] text-gray-600 font-medium">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[#00AEEF] font-bold hover:underline">Register here</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
