"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

const STREAMS = {
  "School": ["Class 7", "Class 8", "Class 9", "Class 10"],
  "Commerce": ["Class 11 (Commerce)", "Class 12 (Commerce)"],
  "Professional Courses": ["B.Com", "CA Foundation", "CMA Foundation", "CS Foundation"],
};

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", stream: "", className: "", address: "" });
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
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
    if (step < 3) {
      handleNext();
      return;
    }
    if (!form.stream || !form.className) { 
      showToast("Please select your stream and class.", "error");
      setError("Please select your stream and class."); 
      return; 
    }
    if (!agreed) { 
      showToast("Please agree to the terms to continue.", "error");
      setError("Please agree to the terms to continue."); 
      return; 
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: `${form.firstName} ${form.lastName}`.trim(), 
          email: form.email, 
          password: form.password, 
          phone: form.phone, 
          stream: form.stream, 
          className: form.className, 
          address: form.address 
        }),
      });
      const data = await res.json();
      if (!res.ok) { 
        showToast(data.message || "Registration failed", "error");
        setError(data.message || "Registration failed"); 
        setLoading(false); 
        return; 
      }

      showToast("Account created successfully! Redirecting...", "success");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch { 
      showToast("Server error. Please try again.", "error");
      setError("Server error. Please try again."); 
      setLoading(false); 
    }
  };

  const validateStep1 = () => {
    return form.firstName.trim() && form.lastName.trim() && form.email.trim() && form.phone.trim().length >= 10;
  };

  const validateStep2 = () => {
    return form.stream && form.className && form.address.trim();
  };

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!validateStep1()) {
        setError("Please enter valid details in all fields.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!validateStep2()) {
        setError("Please select your stream, class, and enter address.");
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setError("");
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const inputClass = "w-full h-[56px] px-4 rounded-[14px] border border-[#e5e7eb] bg-white text-sm text-gray-800 placeholder-slate-300 focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/12 outline-none transition-all duration-300";
  const selectClass = "w-full h-[56px] px-4 rounded-[14px] border border-[#e5e7eb] bg-white text-sm text-gray-800 focus:border-[#0ea5e9] focus:ring-4 focus:ring-[#0ea5e9]/12 outline-none transition-all duration-300 disabled:opacity-50 disabled:bg-slate-50";

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
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#00AEEF] text-white select-none flex-col justify-between p-12">
        {/* Logo at Top Left */}
        <div className="relative z-10 text-left">
          <Link href="/">
            <img src="/logo.png" alt="Commerce Gyan Logo" className="h-[46px] w-auto object-contain invert mix-blend-screen opacity-95" />
          </Link>
        </div>

        {/* Center illustration & copy */}
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 max-w-md mx-auto">
          <div className="w-full max-w-[340px]">
            <img src="/students_illustration.png" alt="Students studying" className="w-full h-auto object-contain" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Empowering Future Leaders
            </h1>
            <p className="text-white/80 text-[14px] font-semibold leading-relaxed max-w-sm mx-auto">
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
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Create Account</h2>
            <p className="text-slate-400 text-sm font-semibold mt-1.5">Register to start your learning journey</p>
          </div>

          {/* Sleek Step Indicator */}
          <div className="mb-8 w-full">
            <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
              <span>{step === 1 ? "Step 1: Personal Info" : step === 2 ? "Step 2: Academic Info" : "Step 3: Setup Password"}</span>
              <span>Step {step} of 3</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#1d4ed8] to-[#0ea5e9] transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[13px] font-bold flex items-center gap-2.5">
              <span className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 text-[10px] shrink-0 font-extrabold">!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* STEP 1: PERSONAL DETAILS */}
            {step === 1 && (
              <div className="space-y-4 animate-slide-down">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">First Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="John" 
                      value={form.firstName}
                      onChange={e => setForm({ ...form, firstName: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Last Name</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Doe" 
                      value={form.lastName}
                      onChange={e => setForm({ ...form, lastName: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

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
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Mobile Phone</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="10-digit phone number" 
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <button 
                  type="button" 
                  onClick={handleNext}
                  className="w-full h-[56px] rounded-[14px] text-white text-sm font-black transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer mt-6 bg-gradient-to-r from-[#1d4ed8] to-[#0ea5e9]"
                >
                  <span>Continue →</span>
                </button>
              </div>
            )}

            {/* STEP 2: ACADEMIC DETAILS */}
            {step === 2 && (
              <div className="space-y-4 animate-slide-down">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Stream</label>
                  <select 
                    required 
                    value={form.stream} 
                    onChange={e => setForm({ ...form, stream: e.target.value, className: "" })}
                    className={selectClass}
                  >
                    <option value="">Choose Stream</option>
                    {Object.keys(STREAMS).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Class / Course</label>
                  <select 
                    required 
                    value={form.className} 
                    onChange={e => setForm({ ...form, className: e.target.value })} 
                    disabled={!form.stream}
                    className={selectClass}
                  >
                    <option value="">Choose Class</option>
                    {form.stream && STREAMS[form.stream].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Residential Address</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Village / Area / Town" 
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div className="flex gap-4 mt-6">
                  <button 
                    type="button" 
                    onClick={handleBack}
                    className="flex-1 h-[56px] rounded-[14px] border border-slate-200 text-slate-500 hover:text-slate-700 bg-white font-black transition-all duration-300 text-sm flex items-center justify-center cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button 
                    type="button" 
                    onClick={handleNext}
                    className="flex-[2] h-[56px] rounded-[14px] text-white text-sm font-black transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-[#1d4ed8] to-[#0ea5e9]"
                  >
                    <span>Continue →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: ACCOUNT SETUP */}
            {step === 3 && (
              <div className="space-y-4 animate-slide-down">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
                  <div className="relative">
                    <input 
                      type={showPw ? "text" : "password"} 
                      required 
                      placeholder="Create a strong password"
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

                <label className="flex items-start gap-3 cursor-pointer py-1 select-none">
                  <input 
                    type="checkbox" 
                    checked={agreed} 
                    onChange={e => setAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#1d4ed8] rounded border-slate-200" 
                  />
                  <span className="text-[12px] text-slate-500 font-semibold leading-relaxed">
                    I agree to receive communications from Commerce Gyan including course updates, timetable schedules, and alerts.
                  </span>
                </label>

                <div className="flex gap-4 mt-6">
                  <button 
                    type="button" 
                    onClick={handleBack}
                    className="flex-1 h-[56px] rounded-[14px] border border-slate-200 text-slate-500 hover:text-slate-700 bg-white font-black transition-all duration-300 text-sm flex items-center justify-center cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="flex-[2] h-[56px] rounded-[14px] text-white text-sm font-black transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-[#1d4ed8] to-[#0ea5e9]"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Registering...</span>
                      </>
                    ) : (
                      <span>Create Account ✓</span>
                    )}
                  </button>
                </div>
              </div>
            )}

          </form>

          <p className="text-center text-sm text-slate-400 mt-6 font-semibold">
            Already on Commerce Gyan?{" "}
            <Link href="/login" className="text-[#1d4ed8] font-black hover:text-[#0ea5e9] transition-colors">Sign In</Link>
          </p>

          <p className="text-center text-[11px] text-slate-350 mt-6 font-semibold">
            By creating an account, you agree to Commerce Gyan&apos;s{" "}
            <span className="text-slate-400">Privacy Policy</span>
          </p>
        </div>
      </div>
    </main>
  );
}
