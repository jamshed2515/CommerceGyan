"use client";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export const inp =
  "w-full px-3.5 pt-5 pb-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-550 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/5 outline-none text-xs transition-all font-bold disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-50/50 dark:disabled:bg-slate-900/30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]";

export const lbl = "text-[9px] font-black text-slate-400 dark:text-slate-550 uppercase tracking-wider block";

export const card =
  "bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.15)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:border-slate-200/60 dark:hover:border-slate-700/60 transition-all duration-300";

export const btnPrimary =
  "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-1.5 hover:-translate-y-0.5 active:translate-y-0";

export const btnSecondary =
  "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-350 font-bold px-4 py-2.5 rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-98 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm hover:-translate-y-0.5 active:translate-y-0";

export const btnGhost =
  "text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-900/50 hover:text-slate-800 dark:hover:text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5";

export const btnDanger =
  "bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-650 dark:text-red-450 font-bold px-4 py-2.5 rounded-xl text-xs active:scale-98 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm hover:-translate-y-0.5 active:translate-y-0";

export function Toast({ message, type = "success", onClose }) {
  const [visible, setVisible] = useState(!!message);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  const styles = {
    success: "bg-white border-l-4 border-green-500 text-slate-800",
    error: "bg-white border-l-4 border-red-500 text-slate-800",
    info: "bg-white border-l-4 border-blue-500 text-slate-800",
  };

  const icons = {
    success: "✨",
    error: "🚨",
    info: "ℹ️",
  };

  return (
    <AnimatePresence>
      {visible && message && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`fixed top-5 right-5 z-[100] ${styles[type] || styles.success} px-4 py-3.5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-slate-100 font-semibold text-xs flex items-center gap-3.5 max-w-sm`}
          role="status"
        >
          <span className="text-base shrink-0">
            {icons[type] || icons.success}
          </span>
          <span className="flex-1 font-bold text-slate-700">{message.replace(/^[✅❌⚠️]\s*/, "")}</span>
          {onClose && (
            <button
              onClick={() => {
                setVisible(false);
                onClose?.();
              }}
              className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              aria-label="Close"
            >
              ×
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function parseFlashType(msg = "") {
  if (msg.startsWith("❌")) return "error";
  if (msg.startsWith("⚠️")) return "info";
  return "success";
}

export function Avatar({ name, size = "md", className = "" }) {
  const initials = (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
    
  const sizes = { 
    sm: "w-7 h-7 text-[10px]", 
    md: "w-9 h-9 text-xs", 
    lg: "w-11 h-11 text-sm font-bold" 
  };

  return (
    <div
      className={`${sizes[size] || sizes.md} bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-black shrink-0 shadow-sm shadow-blue-500/10 ${className}`}
    >
      {initials}
    </div>
  );
}

export function Field({ label, required, children, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {label && (
        <label className="absolute left-3.5 top-2 text-[9px] font-black text-slate-400 dark:text-slate-500 pointer-events-none uppercase tracking-wider">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
    </div>
  );
}

export function ConfirmModal({ message, onConfirm, onCancel, confirmLabel = "Delete", loading = false }) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.4)] p-5 w-full max-w-sm border border-slate-100 dark:border-slate-800"
        >
          <div className="w-11 h-11 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>
          <h3 className="font-black text-slate-800 dark:text-slate-100 text-center text-sm mb-1">Are you sure?</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs text-center leading-relaxed mb-5">{message || "This action cannot be undone."}</p>
          <div className="flex gap-2">
            <button onClick={onCancel} disabled={loading} className={`flex-1 ${btnGhost}`}>
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 bg-red-650 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-red-500/10"
            >
              {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function FormModal({ title, children, onClose, onSubmit, submitLabel = "Save", loading = false, disabled = false, footer = null, hideHeader = false }) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ y: 15, opacity: 0, scale: 0.99 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 15, opacity: 0, scale: 0.99 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-lg my-4 border border-slate-200/50 dark:border-slate-800/80 overflow-hidden"
        >
          {!hideHeader && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-900/30">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-wide">{title}</h3>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-lg leading-none w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                ×
              </button>
            </div>
          )}
          <div className="p-6">{children}</div>
          {footer ? footer : (
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={onClose} className={`flex-1 h-10 ${btnGhost}`}>
                Cancel
              </button>
              <button onClick={onSubmit} disabled={loading || disabled} className={`flex-1 h-10 ${btnPrimary} flex items-center justify-center gap-2`}>
                {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {submitLabel}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function SkeletonRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3.5 px-4">
          <div className="h-3.5 bg-slate-100 rounded animate-pulse" style={{ width: `${55 + (i % 3) * 12}%` }} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className={`${card} p-5 animate-pulse`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-slate-100 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-slate-100 rounded w-2/3" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-100 rounded" />
        <div className="h-3 bg-slate-100 rounded w-4/5" />
      </div>
    </div>
  );
}

export function EmptyState({ icon = "📭", title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center px-8 bg-blue-50/10 dark:bg-blue-950/10 rounded-3xl border border-dashed border-blue-500/20 dark:border-blue-500/10 max-w-md mx-auto my-4 animate-slide-down">
      <div className="w-20 h-20 bg-blue-50/80 dark:bg-blue-950/45 rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgb(59,130,246,0.1)] border border-blue-100/50 dark:border-blue-900/30 text-4xl mb-5 shrink-0 animate-pulse">
        {icon}
      </div>
      <h3 className="font-black text-slate-800 dark:text-slate-100 text-base mb-2">{title}</h3>
      {subtitle && <p className="text-slate-500 dark:text-slate-400 text-xs max-w-xs leading-relaxed mb-6 font-medium">{subtitle}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <h2 className="text-base font-black text-slate-800 leading-none">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// Custom dropdown for premium action menus (e.g. edit/delete)
export function Dropdown({ trigger, children, className = "", menuClassName = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const listener = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, []);

  // Avoid duplicate styles if custom positioning or width are supplied
  const hasWidth = menuClassName.includes("w-");
  const hasRight = menuClassName.includes("right-") || menuClassName.includes("left-");
  const hasZ = menuClassName.includes("z-");
  const hasMt = menuClassName.includes("mt-");

  const defaultClasses = [
    "absolute",
    hasRight ? "" : "right-0",
    hasMt ? "" : "mt-1",
    hasWidth ? "" : "w-48",
    "rounded-xl",
    "bg-white dark:bg-slate-800",
    "border border-slate-100 dark:border-slate-700/60",
    "shadow-xl dark:shadow-slate-950/40",
    "py-1.5",
    hasZ ? "" : "z-[45]"
  ].filter(Boolean).join(" ");

  return (
    <div className={`relative inline-block text-left ${className}`} ref={ref}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">{trigger}</div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            transition={{ duration: 0.12 }}
            className={`${defaultClasses} ${menuClassName}`}
            onClick={() => setOpen(false)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownItem({ children, onClick, className = "" }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`w-full text-left px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-850 dark:hover:text-white transition-all flex items-center gap-3 whitespace-nowrap cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}
