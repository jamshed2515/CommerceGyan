"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? "#1A3B70" : "none"} stroke={active ? "#1A3B70" : "#6B7280"} strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Courses",
    href: "/#programs",
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? "#1A3B70" : "none"} stroke={active ? "#1A3B70" : "#6B7280"} strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    label: "Results",
    href: "/#results",
    badge: "New",
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? "#1A3B70" : "none"} stroke={active ? "#1A3B70" : "#6B7280"} strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    label: "Contact",
    href: "/contact",
    icon: (active) => (
      <svg className="w-6 h-6" fill={active ? "#1A3B70" : "none"} stroke={active ? "#1A3B70" : "#6B7280"} strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
  {
    label: "More",
    href: "/admission",
    icon: (active) => (
      <svg className="w-6 h-6" fill="none" stroke={active ? "#1A3B70" : "#6B7280"} strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
      </svg>
    ),
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Hide navigation on dashboard and authentication pages
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
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href.split("#")[0]) && item.href.split("#")[0] !== "/";

        return (
          <Link
            key={item.label}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative group"
          >
            {/* Active indicator bar */}
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full bg-[#1A3B70]" />
            )}

            {/* Badge */}
            {item.badge && (
              <span className="absolute top-1.5 right-[calc(50%-18px)] bg-[#8CC63F] text-white text-[8px] font-black px-1 py-0.5 rounded leading-none">
                {item.badge}
              </span>
            )}

            {/* Icon */}
            <span className={`transition-transform duration-150 ${isActive ? "scale-110" : "group-active:scale-95"}`}>
              {item.icon(isActive)}
            </span>

            {/* Label */}
            <span
              className={`text-[10px] font-semibold leading-none transition-colors ${
                isActive ? "text-[#1A3B70]" : "text-gray-500"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
