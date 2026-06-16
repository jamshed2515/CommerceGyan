"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import API from "@/config/api";
import { setSession } from "@/lib/auth";

export default function Login() {
  const router = useRouter();
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 4000);
  };



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
      // Store in sessionStorage by default; localStorage only if "Remember Me" is checked
      setSession(data.token, data.user, rememberMe);
      
      setTimeout(() => {
        if (data.user.role === "teacher") {
          router.push(data.user.isFirstLogin ? "/teacher/setup-password" : "/teacher");
        } else {
          router.push("/dashboard");
        }
      }, 800);
    } catch { 
      showToast("Server error. Please try again.", "error");
      setError("Server error. Please try again."); 
      setLoading(false); 
    }
  };

  const inputClass = "w-full h-[56px] px-4 rounded-[14px] border border-[#e5e7eb] bg-white text-sm text-gray-800 placeholder-slate-355 focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10 outline-none transition-all duration-300";

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
        className="hidden lg:flex lg:w-1/2 relative text-white select-none flex-col justify-center p-8 lg:p-12"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 35%),
            radial-gradient(circle at 80% 30%, rgba(255,255,255,0.06), transparent 35%),
            radial-gradient(circle at 50% 80%, rgba(255,255,255,0.05), transparent 40%),
            linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #38BDF8 100%)
          `
        }}
      >
        {/* Center illustration & copy (Vertically centered, clean spacing) */}
        <div className="flex flex-col items-center justify-center text-center space-y-9 max-w-[500px] mx-auto pb-4 animate-fade-in">
          
          {/* Transparent Inline Vector Education Illustration */}
          <div className="w-full flex justify-center max-w-[245px] transition-transform duration-500 hover:scale-[1.02]">
            <svg viewBox="0 0 400 320" className="w-full h-auto object-contain" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Soft glow behind */}
              <circle cx="200" cy="160" r="100" fill="url(#glow-grad)" opacity="0.12" />
              
              {/* Floating stars */}
              <path d="M120 70L123 76L130 77L125 82L126 89L120 85L114 89L115 82L110 77L117 76L120 70Z" fill="#38BDF8" opacity="0.8" />
              <path d="M280 230L282 234L287 235L283 239L284 244L280 241L276 244L277 239L273 235L278 234L280 230Z" fill="#38BDF8" opacity="0.6" />
              
              {/* Graduation Cap floating at the top */}
              <g transform="translate(150, 40) scale(1.1)">
                {/* Cap diamond */}
                <path d="M45 15L85 30L45 45L5 30L45 15Z" fill="#FFFFFF" />
                <path d="M45 15L85 30L45 45L5 30L45 15Z" stroke="#38BDF8" strokeWidth="2.5" strokeLinejoin="round" />
                
                {/* Cap base */}
                <path d="M22 36.5V49C22 55 68 55 68 49V36.5" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Tassel */}
                <path d="M45 30V48L58 55" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="58" cy="55" r="3.5" fill="#38BDF8" />
              </g>

              {/* Stack of books */}
              <g transform="translate(110, 160)">
                {/* Book 3 (Bottom) - Dark Blue */}
                <rect x="10" y="50" width="160" height="22" rx="4" fill="#0F2A66" stroke="#FFFFFF" strokeWidth="2" />
                <rect x="150" y="52" width="16" height="18" fill="#38BDF8" rx="2" />
                
                {/* Book 2 (Middle) - Sky Blue */}
                <rect x="22" y="26" width="140" height="22" rx="4" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2" />
                <rect x="142" y="28" width="16" height="18" fill="#FFFFFF" rx="2" />
                
                {/* Book 1 (Top) - White/Soft */}
                <rect x="35" y="2" width="115" height="22" rx="4" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="2" />
                <rect x="130" y="4" width="16" height="18" fill="#0F2A66" rx="2" />
              </g>

              {/* Stylized Modern Laptop next to books */}
              <g transform="translate(210, 195) scale(0.9)">
                {/* Laptop Screen */}
                <rect x="10" y="10" width="80" height="52" rx="6" fill="#0F2A66" stroke="#FFFFFF" strokeWidth="2.5" />
                <rect x="15" y="15" width="70" height="42" rx="3" fill="url(#screen-grad)" />
                {/* Code lines on screen */}
                <line x1="22" y1="22" x2="42" y2="22" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
                <line x1="22" y1="30" x2="62" y2="30" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                <line x1="22" y1="38" x2="52" y2="38" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
                
                {/* Laptop Keyboard / Base */}
                <path d="M2 62H98L104 70H-4L2 62Z" fill="#FFFFFF" />
                <path d="M2 62H98L104 70H-4L2 62Z" stroke="#FFFFFF" strokeWidth="2.5" strokeLinejoin="round" />
                <line x1="38" y1="66" x2="62" y2="66" stroke="#0F2A66" strokeWidth="3" strokeLinecap="round" />
              </g>

              {/* Floating Lightbulb */}
              <g transform="translate(70, 90) scale(0.85)">
                <circle cx="25" cy="25" r="22" fill="#FFFFFF" opacity="0.1" />
                {/* Bulb thread */}
                <path d="M20 38H30M22 42H28" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
                {/* Bulb outline */}
                <path d="M15 26C15 17.5 35 17.5 35 26C35 31 29 33 27 36H23C21 33 15 31 15 26Z" stroke="#38BDF8" strokeWidth="2.5" strokeLinejoin="round" fill="#FFFFFF" />
                {/* Glow lines */}
                <line x1="25" y1="8" x2="25" y2="13" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                <line x1="10" y1="18" x2="14" y2="21" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                <line x1="40" y1="18" x2="36" y2="21" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
              </g>

              {/* Floating Globe */}
              <g transform="translate(260, 95) scale(0.8)">
                <circle cx="25" cy="25" r="20" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.8" />
                {/* Latitudes & Longitudes */}
                <path d="M25 5C25 5 31 12 31 25C31 38 25 45 25 45M25 5C25 5 19 12 19 25C19 38 25 45 25 45" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" />
                <line x1="5" y1="25" x2="45" y2="25" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" />
              </g>

              <defs>
                <linearGradient id="glow-grad" x1="200" y1="60" x2="200" y2="260" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#38BDF8" />
                  <stop offset="1" stopColor="#2563EB" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="screen-grad" x1="50" y1="15" x2="50" y2="57" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#1e3a8a" />
                  <stop offset="1" stopColor="#0f172a" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="space-y-3.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Empowering Future Leaders
            </h1>
            <p className="text-white/75 text-[14px] font-semibold leading-relaxed max-w-[450px] mx-auto">
              Join Commerce Gyan and unlock expert guidance, structured learning, and career-focused education.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="w-full max-w-[420px] text-left space-y-4 pt-6 border-t border-white/15">
            {[
              {
                title: "Expert Faculty",
                desc: "Mentored by experienced educators and subject specialists"
              },
              {
                title: "Professional Course Preparation",
                desc: "Structured preparation for professional exams"
              },
              {
                title: "Personalized Mentorship",
                desc: "Individual guidance and academic support"
              }
            ].map((feat, idx) => (
              <div key={idx} className="flex items-start gap-3.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-white shrink-0 mt-0.5">
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-[13.5px] font-bold text-white tracking-wide">{feat.title}</h3>
                  <p className="text-white/65 text-xs font-semibold mt-0.5 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — Split Screen Right (50% on Desktop, 100% on Mobile) */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-8 lg:py-10 bg-white relative">
        {/* Logo at Top Right Corner of Right Panel (Desktop only) */}
        <div className="absolute hidden lg:block" style={{ top: "24px", right: "32px" }}>
          <Link href="/">
            <img 
              src="/logo.png" 
              alt="Commerce Gyan Logo" 
              className="w-[125px] h-auto object-contain opacity-95 transition-all duration-300 hover:scale-102" 
            />
          </Link>
        </div>

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
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                {role === "student" ? "Email / Reg No / Mobile" : "Email Address"}
              </label>
              <input 
                type="text" 
                required 
                placeholder={role === "student" ? "you@example.com or CGA260001" : "you@example.com"} 
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
