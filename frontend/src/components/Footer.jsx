"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Hide the footer on admin, teacher, and user dashboard pages
  const isDashboard =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/teacher");

  if (isDashboard) return null;

  return (
    <footer className="bg-white border-t border-slate-200/80 font-sans mt-auto">
      {/* Top Footer Section: Multi-column Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Column 1: Institute Info (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-block">
              <img
                src="/logo.png"
                alt="Commerce Gyan Logo"
                className="max-h-[44px] w-auto transition-all duration-300"
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
                      <path d="M22 12c0-5.52-4.48-10-10-10S2c4.48-2 10-2c4.9 0 8.93 3.51 9.77 8.16v-6.93H9.76V12h2.2v6.86H9.76v2.11H12v-6.97h2.2l.33-2.22H12v-1.42c0-.64.18-1.08 1.1-1.08h1.18V7.5c-.2-.03-.9-.09-1.72-.09-1.7 0-2.87 1.04-2.87 2.96v1.66H7.72v2.22h1.99V22c5.52 0 10-4.48 10-10z" />
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
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 11.953.01c3.179 0 6.166 1.237 8.413 3.484 2.247 2.247 3.481 5.233 3.48 8.413-.003 6.557-5.338 11.892-11.893 11.892-2.002 0-3.969-.508-5.717-1.478L0 24zm6.305-1.654a9.88 9.88 0 005.683 1.448h.005c5.454 0 9.888-4.434 9.89-9.889a9.82 9.82 0 00-2.897-6.992 9.82 9.82 0 00-6.992-2.894C5.495.018.157 5.352.155 11.808c-.001 2.096.547 4.142 1.588 5.945L.745 22.37l5.617-1.478zM17.47 14.38c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
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
                  className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200/60 text-slate-500 hover:text-[#00AEEF] hover:bg-[#EAF8FF] hover:border-[#00AEEF]/20 flex items-center justify-center transition-all active:scale-95 duration-200"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-extrabold text-[#1A3B70] text-[13px] tracking-wider uppercase">
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
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-extrabold text-[#1A3B70] text-[13px] tracking-wider uppercase">
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
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-extrabold text-[#1A3B70] text-[13px] tracking-wider uppercase">
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
