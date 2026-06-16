"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { clearSession, getStoredUser, getStoredToken } from "@/lib/auth";

export default function Header() {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [authUser, setAuthUser] = useState(null); // null = loading, false = not logged in

  // Read auth state on mount (client-only to avoid SSR mismatch)
  useEffect(() => {
    const user = getStoredUser();
    const token = getStoredToken();
    if (user && token) {
      setAuthUser(user);
    } else {
      setAuthUser(false);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    clearSession();
    setAuthUser(false);
    setIsProfileOpen(false);
    router.push("/");
  };

  // Smart login handler: if a valid session exists, go to the correct dashboard.
  // Otherwise navigate to the login page.
  const handleLoginClick = (e) => {
    e.preventDefault();
    setIsProfileOpen(false);
    const user = getStoredUser();
    const token = getStoredToken();
    if (user && token) {
      if (user.role === "admin") router.push("/admin");
      else if (user.role === "teacher") router.push("/teacher");
      else router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  // Determine user dashboard link (for already-logged-in state)
  const dashboardLink = authUser
    ? authUser.role === "admin"
      ? "/admin"
      : authUser.role === "teacher"
      ? "/teacher"
      : "/dashboard"
    : null;

  const dashboardLabel = authUser
    ? authUser.role === "admin"
      ? "🛡️ Admin Panel"
      : authUser.role === "teacher"
      ? "📚 My Classes"
      : "🎓 My Dashboard"
    : null;

  return (
    <nav className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 flex items-center justify-between px-6 backdrop-blur-md ${
      isScrolled 
        ? "bg-white/90 border-b border-gray-200/50 shadow-[0_4px_20px_rgba(0,0,0,0.06)] h-[60px] lg:h-[70px]" 
        : "bg-white/95 border-b border-gray-100/80 shadow-[0_2px_15px_rgba(0,0,0,0.02)] h-[75px] lg:h-[80px]"
    }`}>
      {/* Left Logo */}
      <div className="flex items-center flex-shrink-0">
        <Link href="/" className="flex items-center group">
          <Image 
            src="/logo.png" 
            alt="Commerce Gyan Logo" 
            width={200} 
            height={55} 
            className={`object-contain w-auto group-hover:scale-102 transition-all duration-300 ${
              isScrolled ? "max-h-[38px] lg:max-h-[45px]" : "max-h-[48px] lg:max-h-[55px]"
            }`}
            priority
          />
        </Link>
      </div>

      {/* Center Menus (Desktop) */}
      <div className="hidden lg:flex items-center gap-8 font-bold text-[14px] text-gray-700 flex-1 ml-16">
        <Link href="/#programs" className="flex items-center gap-1 hover:text-[#00AEEF] transition-colors">
          Courses 
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </Link>
        <Link href="/#results" className="flex items-center gap-1 hover:text-[#00AEEF] transition-colors">
          Results
          <span className="bg-[#8CC63F] text-white text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider relative -top-2">New</span>
        </Link>
        <Link href="/#blogs" className="hover:text-[#00AEEF] transition-colors">Blogs</Link>
        <Link href="/#careers" className="hover:text-[#00AEEF] transition-colors">Careers</Link>
        <Link href="/contact" className="hover:text-[#00AEEF] transition-colors">Contact Us</Link>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-3 mr-2">
          <a href="tel:8271365450" className="w-10 h-10 bg-[#E6F4FE] rounded-full flex items-center justify-center text-[#00AEEF] hover:scale-105 transition-transform">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
          </a>
          <div>
            <p className="text-[11px] text-gray-500 font-medium leading-tight">Call now</p>
            <p className="text-[14px] font-bold text-[#1A3B70] leading-tight mt-0.5">8271365450</p>
          </div>
        </div>
        
        <a 
          href="https://maps.google.com/?q=Commerce+Gyan+Katrasgarh"
          target="_blank"
          rel="noreferrer"
          className="w-10 h-10 bg-[#E6F4FE] rounded-full hidden md:flex items-center justify-center text-[#1A3B70] cursor-pointer hover:bg-[#D0EBFC] transition-colors border border-[#00AEEF]/20"
        >
          <svg className="w-5 h-5 text-[#1A3B70]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        </a>

        {/* Profile / Auth Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 bg-[#E6F4FE] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#D0EBFC] transition-all border border-[#00AEEF]/20 active:scale-95"
          >
            {authUser ? (
              // Show first letter of user's name as avatar
              <span className="text-[#1A3B70] font-black text-sm">
                {authUser.name?.[0]?.toUpperCase() || "U"}
              </span>
            ) : (
              <svg className="w-5 h-5 text-[#1A3B70]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            )}
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden z-50 animate-slide-down">
              <div className="flex flex-col py-1">
                {authUser ? (
                  // Logged-in user menu
                  <>
                    {/* User identity row */}
                    <div className="px-5 py-3 border-b border-gray-50">
                      <p className="text-[12px] font-black text-[#1A3B70] truncate">{authUser.name}</p>
                      <p className="text-[10px] font-semibold text-gray-400 capitalize">{authUser.role}</p>
                    </div>
                    <Link 
                      href={dashboardLink} 
                      onClick={() => setIsProfileOpen(false)}
                      className="px-5 py-2.5 text-[14px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {dashboardLabel}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-5 py-2.5 text-[14px] font-semibold text-red-500 hover:bg-red-50 transition-colors border-t border-gray-50"
                    >
                      🚪 Logout
                    </button>
                  </>
                ) : (
                  // Guest menu
                  <>
                    <button
                      onClick={handleLoginClick}
                      className="w-full text-left px-5 py-2.5 text-[14px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Login
                    </button>
                    <Link href="/signup" className="px-5 py-2.5 text-[14px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-50">
                      Signup
                    </Link>
                    <Link href="/admission" className="px-5 py-2.5 text-[14px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-50">
                      Admission Enquiry
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Button (Hamburger) */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-10 h-10 rounded-full flex items-center justify-center lg:hidden hover:bg-gray-100 transition-colors cursor-pointer active:scale-95"
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          ) : (
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className={`absolute left-0 w-full bg-white border-b border-gray-200 shadow-lg z-40 flex flex-col p-6 gap-4 lg:hidden animate-slide-down transition-all duration-300 ${
          isScrolled ? "top-[60px]" : "top-[75px]"
        }`}>
          <Link 
            href="/#programs" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-base font-bold text-gray-700 hover:text-[#00AEEF] pb-2 border-b border-gray-50 flex justify-between items-center"
          >
            <span>Courses</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </Link>
          <Link 
            href="/#results" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-base font-bold text-gray-700 hover:text-[#00AEEF] pb-2 border-b border-gray-50 flex justify-between items-center"
          >
            <span className="flex items-center gap-2">Results <span className="bg-[#8CC63F] text-white text-[8px] px-1.5 py-0.5 rounded font-black uppercase">New</span></span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </Link>
          <Link 
            href="/#blogs" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-base font-bold text-gray-700 hover:text-[#00AEEF] pb-2 border-b border-gray-50 flex justify-between items-center"
          >
            <span>Blogs</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </Link>
          <Link 
            href="/#careers" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-base font-bold text-gray-700 hover:text-[#00AEEF] pb-2 border-b border-gray-50 flex justify-between items-center"
          >
            <span>Careers</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </Link>
          <Link 
            href="/contact" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-base font-bold text-gray-700 hover:text-[#00AEEF] pb-2 border-b border-gray-50 flex justify-between items-center"
          >
            <span>Contact Us</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </Link>

          {/* Mobile auth section */}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            {authUser ? (
              <>
                <Link
                  href={dashboardLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center bg-[#1A3B70] text-white font-bold py-3 rounded-xl text-sm"
                >
                  {dashboardLabel}
                </Link>
                <button
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="block w-full text-center text-red-500 font-bold py-2 text-sm"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={(e) => { setIsMobileMenuOpen(false); handleLoginClick(e); }}
                  className="flex-1 text-center bg-[#1A3B70] text-white font-bold py-3 rounded-xl text-sm"
                >
                  Login
                </button>
                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 text-center border border-[#1A3B70] text-[#1A3B70] font-bold py-3 rounded-xl text-sm">Sign Up</Link>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <div className="flex items-center gap-3">
              <a href="tel:8271365450" className="w-10 h-10 bg-[#E6F4FE] rounded-full flex items-center justify-center text-[#00AEEF]">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
              </a>
              <div>
                <p className="text-[11px] text-gray-500 font-medium">Call now</p>
                <p className="text-[15px] font-bold text-[#1A3B70] mt-0.5">8271365450</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
