"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Hide the footer on admin, teacher, dashboard, and authentication pages
  const isDashboardOrAuth =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/teacher") ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";

  if (isDashboardOrAuth) return null;

  return (
    <footer className="border-t border-slate-200/60 font-sans mt-auto" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)' }}>
      {/* Top Footer Section: Multi-column Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Column 1: Institute Info (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block">
              <img
                src="/logo.png"
                alt="Commerce Gyan Logo"
                className="max-h-[58px] w-auto transition-all duration-300"
              />
            </Link>
            <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-sm">
              Commerce Gyan in Katrasgarh is the premier coaching institute dedicated to conceptual clarity, personal mentorship, and academic excellence in school, board, and professional courses.
            </p>
            {/* Social Media Links */}
            <div className="flex items-center gap-3.5 pt-1">
              {[
                {
                  label: "Facebook",
                  href: "https://facebook.com",
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  ),
                },
                {
                  label: "Instagram",
                  href: "https://instagram.com",
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  ),
                },
                {
                  label: "YouTube",
                  href: "https://youtube.com",
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.002 3.002 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  ),
                },
                {
                  label: "WhatsApp",
                  href: "https://wa.me/918271365450",
                  icon: (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.012 2c-5.506 0-9.989 4.478-9.989 9.984a9.96 9.96 0 001.37 5.054L2 22l5.077-1.332a9.936 9.936 0 004.93 1.302h.005c5.507 0 9.99-4.478 9.99-9.985 0-2.667-1.04-5.176-2.93-7.065A9.925 9.925 0 0012.012 2zm5.47 14.056c-.3.15-1.774.877-2.046.977-.272.1-.47.15-.668-.15-.198-.3-.767-.976-.94-1.175-.173-.2-.347-.225-.647-.075-.3.15-1.266.467-2.41 1.485-.89.795-1.492 1.779-1.666 2.079-.173.3-.018.462.13.61.135.134.3.349.45.524.15.175.2.299.3.5.1.2.05.374-.025.524-.075.15-.668 1.61-1.11 2.685-.246.596-.495.516-.678.507-.173-.008-.37-.01-.57-.01-.197 0-.518.074-.789.373-.272.3-1.04 1.022-1.04 2.492 0 1.47 1.07 2.89 1.22 3.09.15.2 2.102 3.21 5.093 4.5 1.185.51 1.938.697 2.486.772.71.099 1.36.05 1.875-.025.572-.085 1.774-.724 2.022-1.42.247-.699.247-1.296.173-1.42-.074-.124-.272-.2-.572-.35z" />
                    </svg>
                  ),
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Follow on ${social.label}`}
                  className="w-11 h-11 rounded-full bg-white border border-slate-200/80 text-slate-500 hover:text-[#00AEEF] hover:border-[#00AEEF]/30 shadow-sm hover:shadow-md hover:-translate-y-1 flex items-center justify-center transition-all duration-300 cursor-pointer"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-5">
            <h4 className="font-black text-[#1A3B70] text-sm tracking-widest uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Home", href: "/" },
                { label: "Courses", href: "/#programs" },
                { label: "Results", href: "/#results" },
                { label: "Blogs", href: "#" },
                { label: "Careers", href: "#" },
                { label: "Contact Us", href: "/contact" },
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-[#00AEEF] font-bold text-xs transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Programs (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-5">
            <h4 className="font-black text-[#1A3B70] text-sm tracking-widest uppercase">
              Programs
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Class 11 Commerce", href: "/#programs" },
                { label: "Class 12 Commerce", href: "/#programs" },
                { label: "CA Foundation", href: "/#programs" },
                { label: "CMA Foundation", href: "/#programs" },
                { label: "CS Foundation", href: "/#programs" },
              ].map((prog, i) => (
                <li key={i}>
                  <Link
                    href={prog.href}
                    className="text-gray-500 hover:text-[#00AEEF] font-bold text-xs transition-colors"
                  >
                    {prog.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-5">
            <h4 className="font-black text-[#1A3B70] text-sm tracking-widest uppercase">
              Contact Us
            </h4>
            <ul className="space-y-3.5 text-xs text-gray-500 font-medium leading-relaxed">
              <li className="flex gap-2">
                <span className="text-[#00AEEF] text-sm font-bold">📍</span>
                <span>
                  Behind Rajasthani Dharamshala, Katrasgarh, Dhanbad, Jharkhand - 828113
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#00AEEF] text-sm font-bold">📞</span>
                <a
                  href="tel:8271365450"
                  className="hover:text-[#00AEEF] font-bold transition-colors"
                >
                  +91 82713 65450
                </a>
              </li>
              <li className="flex gap-2">
                <span className="text-[#00AEEF] text-sm font-bold">✉️</span>
                <a
                  href="mailto:info@commercegyan.com"
                  className="hover:text-[#00AEEF] font-bold transition-colors"
                >
                  info@commercegyan.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider and Copyright Row */}
        <div className="border-t border-slate-100/80 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-gray-400 text-xs font-semibold">
            &copy; {new Date().getFullYear()} Commerce Gyan. All Rights Reserved.
          </p>
          <div className="flex gap-4 text-gray-400 text-[11px] font-semibold">
            <a href="#" className="hover:text-[#00AEEF] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[#00AEEF] transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
