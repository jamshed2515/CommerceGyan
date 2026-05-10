"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const STREAMS = {
  "School": ["Class 7", "Class 8", "Class 9", "Class 10"],
  "Commerce": ["Class 11 (Commerce)", "Class 12 (Commerce)"],
  "Professional Courses": ["B.Com", "CA Foundation", "CMA Foundation", "CS Foundation"],
};

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", stream: "", className: "", address: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.stream || !form.className) { setError("Please select your stream and class."); return; }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email, password: form.password,
          phone: form.phone, stream: form.stream,
          className: form.className, address: form.address,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Registration failed"); setLoading(false); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch { setError("Server error. Please try again."); setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] flex flex-col font-[family-name:var(--font-mulish)]">
      <nav className="w-full bg-white border-b border-gray-100 shadow-sm py-4 px-6 flex justify-center md:justify-start">
        <Link href="/"><Image src="/logo.png" alt="Commerce Giyan" width={180} height={50} className="object-contain max-h-[50px] w-auto" priority /></Link>
      </nav>
      <div className="flex-1 flex items-center justify-center p-6 py-10">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
          <div className="bg-[#1A3B70] p-8 text-center">
            <h2 className="text-3xl font-black text-white mb-1">Create Account</h2>
            <p className="text-white/80 text-[14px]">Start your journey with Commerce Giyan</p>
          </div>
          <div className="p-8">
            {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[14px]">⚠️ {error}</div>}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">First Name *</label>
                  <input type="text" required placeholder="First Name" value={form.firstName}
                    onChange={e => setForm({...form, firstName: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20 outline-none text-[14px] bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Last Name *</label>
                  <input type="text" required placeholder="Last Name" value={form.lastName}
                    onChange={e => setForm({...form, lastName: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20 outline-none text-[14px] bg-gray-50 focus:bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Email Address *</label>
                <input type="email" required placeholder="Enter your email" value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20 outline-none text-[14px] bg-gray-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Phone Number *</label>
                <input type="tel" required placeholder="10-digit mobile number" value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20 outline-none text-[14px] bg-gray-50 focus:bg-white" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Stream *</label>
                  <select required value={form.stream}
                    onChange={e => setForm({...form, stream: e.target.value, className: ""})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#00AEEF] outline-none text-[14px] bg-gray-50 focus:bg-white text-gray-700">
                    <option value="">Select Stream</option>
                    {Object.keys(STREAMS).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Class / Course *</label>
                  <select required value={form.className}
                    onChange={e => setForm({...form, className: e.target.value})}
                    disabled={!form.stream}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#00AEEF] outline-none text-[14px] bg-gray-50 focus:bg-white text-gray-700 disabled:opacity-50">
                    <option value="">Select Class</option>
                    {form.stream && STREAMS[form.stream].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">Password *</label>
                <input type="password" required placeholder="Create a strong password" value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20 outline-none text-[14px] bg-gray-50 focus:bg-white" />
              </div>
              <div className="flex items-start gap-3 pt-1">
                <input type="checkbox" id="terms" required className="mt-1" />
                <label htmlFor="terms" className="text-[12px] text-gray-600 leading-tight">
                  I agree to the <Link href="#" className="text-[#00AEEF] hover:underline">Terms of Service</Link> and <Link href="#" className="text-[#00AEEF] hover:underline">Privacy Policy</Link> of Commerce Giyan.
                </label>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-[#00AEEF] text-white font-bold rounded-lg shadow-md hover:bg-[#009CD6] transition-colors text-[15px] disabled:opacity-60">
                {loading ? "Creating Account..." : "Sign Up Now"}
              </button>
            </form>
            <div className="mt-5 text-center text-[14px] text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-[#1A3B70] font-black hover:underline">Login here</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
