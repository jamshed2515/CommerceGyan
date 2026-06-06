"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  Megaphone,
  Award,
  Mail,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Menu,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import TeachersTab from "@/components/admin/TeachersTab";
import BatchesTab from "@/components/admin/BatchesTab";
import SchedulesTab from "@/components/admin/SchedulesTab";
import FeeTab from "@/components/admin/FeeTab";
import CoursesTab from "@/components/admin/CoursesTab";
import AchieversTab from "@/components/admin/AchieversTab";
import PaymentsTab from "@/components/admin/PaymentsTab";
import {
  Toast,
  ConfirmModal,
  parseFlashType,
  EmptyState,
  inp,
  card,
  Avatar,
  Dropdown,
  DropdownItem,
  btnPrimary,
  btnGhost,
  Field,
  FormModal,
  PageHeader,
} from "@/components/admin/AdminUI";

const API = "http://localhost:5000";

const SECTIONS = [
  {
    title: "Overview",
    items: [
      { id: "overview", label: "Dashboard", icon: LayoutDashboard }
    ]
  },
  {
    title: "Academics",
    items: [
      { id: "students", label: "Students", icon: Users },
      { id: "teachers", label: "Teachers", icon: GraduationCap },
      { id: "courses", label: "Courses", icon: BookOpen },
      { id: "batches", label: "Batches", icon: Layers },
      { id: "schedules", label: "Schedule", icon: Calendar }
    ]
  },
  {
    title: "Finance",
    items: [
      { id: "fees", label: "Fee Tracking", icon: CreditCard },
      { id: "payments", label: "Online Payments", icon: DollarSign }
    ]
  },
  {
    title: "Content",
    items: [
      { id: "notes", label: "Notes / PDFs", icon: FileText },
      { id: "announcements", label: "Announcements", icon: Megaphone },
      { id: "achievers", label: "Achievers", icon: Award }
    ]
  },
  {
    title: "Support",
    items: [
      { id: "enquiries", label: "Enquiries", icon: Mail }
    ]
  },
  {
    title: "System",
    items: [
      { id: "settings", label: "Settings", icon: Settings },
      { id: "profile", label: "Profile", icon: User }
    ]
  }
];

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [fees, setFees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [achievers, setAchievers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [msg, setMsg] = useState("");
  
  // Student table state
  const [studentSearch, setStudentSearch] = useState("");
  const [studentClassFilter, setStudentClassFilter] = useState("");
  const [studentStreamFilter, setStudentStreamFilter] = useState("");
  const [studentPage, setStudentPage] = useState(1);
  const studentItemsPerPage = 8;

  // Announcement state
  const [annForm, setAnnForm] = useState({ title: "", body: "", isImportant: false });
  const [editAnn, setEditAnn] = useState(null);
  const [showAnnModal, setShowAnnModal] = useState(false);

  // Notes state
  const [noteForm, setNoteForm] = useState({ title: "", subject: "", className: "", course: "" });
  const [noteFile, setNoteFile] = useState(null);
  const fileRef = useRef();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const H = { Authorization: `Bearer ${token}` };
  const JH = { ...H, "Content-Type": "application/json" };
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!token || user.role !== "admin") { router.push("/admin/login"); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [st, tc, bt, sc, fe, co, an, no, en, statsData, ac] = await Promise.all([
        fetch(`${API}/api/admin/students`, { headers: H }).then(r => r.json()),
        fetch(`${API}/api/admin/teachers`, { headers: H }).then(r => r.json()),
        fetch(`${API}/api/batches`, { headers: H }).then(r => r.json()),
        fetch(`${API}/api/schedules`, { headers: H }).then(r => r.json()),
        fetch(`${API}/api/fees`, { headers: H }).then(r => r.json()),
        fetch(`${API}/api/courses`).then(r => r.json()),
        fetch(`${API}/api/announcements`).then(r => r.json()),
        fetch(`${API}/api/notes`, { headers: H }).then(r => r.json()),
        fetch(`${API}/api/enquiry`, { headers: H }).then(r => r.json()),
        fetch(`${API}/api/admin/stats`, { headers: H }).then(r => r.json()),
        fetch(`${API}/api/achievers/all`, { headers: H }).then(r => r.json()),
      ]);
      setStudents(Array.isArray(st) ? st : []);
      setTeachers(Array.isArray(tc) ? tc : []);
      setBatches(Array.isArray(bt) ? bt : []);
      setSchedules(Array.isArray(sc) ? sc : []);
      setFees(Array.isArray(fe) ? fe : []);
      setCourses(Array.isArray(co) ? co : []);
      setAnnouncements(Array.isArray(an) ? an : []);
      setNotes(Array.isArray(no) ? no : []);
      setEnquiries(Array.isArray(en) ? en : []);
      setStats(statsData && !statsData.message ? statsData : {});
      setAchievers(Array.isArray(ac) ? ac : []);
    } catch (e) { flash("❌ Failed to load data"); }
    setLoading(false);
  };

  const handleLogout = () => { localStorage.clear(); router.push("/admin/login"); };

  const saveAnn = async () => {
    const url = editAnn ? `${API}/api/announcements/${editAnn._id}` : `${API}/api/announcements`;
    const res = await fetch(url, { method: editAnn ? "PUT" : "POST", headers: JH, body: JSON.stringify(annForm) });
    if (res.ok) { 
      flash(editAnn ? "✅ Updated!" : "✅ Created!"); 
      setAnnForm({ title: "", body: "", isImportant: false }); 
      setEditAnn(null); 
      setShowAnnModal(false);
      fetchAll(); 
    }
  };
  const deleteAnn = (id) => setConfirm({ msg: "Are you sure you want to delete this announcement?", onOk: async () => {
    await fetch(`${API}/api/announcements/${id}`, { method: "DELETE", headers: H });
    flash("✅ Announcement deleted"); setConfirm(null); fetchAll();
  }});
  const startEditAnn = (a) => { setEditAnn(a); setAnnForm({ title: a.title, body: a.body, isImportant: a.isImportant }); setShowAnnModal(true); };

  const uploadNote = async () => {
    if (!noteFile) return flash("❌ Select a PDF");
    const fd = new FormData();
    Object.entries(noteForm).forEach(([k, v]) => fd.append(k, v));
    fd.append("pdf", noteFile);
    const res = await fetch(`${API}/api/notes`, { method: "POST", headers: H, body: fd });
    if (res.ok) { flash("✅ Uploaded!"); setNoteForm({ title: "", subject: "", className: "", course: "" }); setNoteFile(null); if (fileRef.current) fileRef.current.value = ""; fetchAll(); }
    else { const d = await res.json(); flash("❌ " + d.message); }
  };
  const deleteNote = (id) => setConfirm({ msg: "Are you sure you want to delete this note?", onOk: async () => {
    await fetch(`${API}/api/notes/${id}`, { method: "DELETE", headers: H });
    flash("✅ Note deleted"); setConfirm(null); fetchAll();
  }});
  
  const updateStudentFee = async (id, feeStatus) => { 
    await fetch(`${API}/api/admin/students/${id}/fee`, { method: "PUT", headers: JH, body: JSON.stringify({ feeStatus }) }); 
    fetchAll(); 
  };
  const deleteStudent = (id) => setConfirm({ msg: "Are you sure you want to delete this student?", onOk: async () => {
    await fetch(`${API}/api/admin/students/${id}`, { method: "DELETE", headers: H });
    flash("✅ Student deleted"); setConfirm(null); fetchAll();
  }});

  // Get current breadcrumb active item
  const activeBreadcrumb = useMemo(() => {
    for (const group of SECTIONS) {
      const match = group.items.find(i => i.id === tab);
      if (match) return match.label;
    }
    return "Dashboard";
  }, [tab]);

  // Sidebar count map
  const sidebarCountMap = {
    students: students.length,
    teachers: teachers.length,
    courses: courses.length,
    batches: batches.length,
    schedules: schedules.length,
    announcements: announcements.length,
    fees: fees.length,
    payments: stats.paymentsCount || 0,
    notes: notes.length,
    enquiries: enquiries.length,
  };

  // SVGs workloads per weekday
  const workloadChart = useMemo(() => {
    const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const counts = daysOrder.map(day => schedules.filter(s => s.dayOfWeek === day).length);
    const maxVal = Math.max(...counts, 1);
    return { counts, maxVal, daysOrder };
  }, [schedules]);

  // SVG dynamic monthly revenue line area
  const revenueChartPoints = useMemo(() => {
    // Generate smooth area path from payments
    const defaultPoints = [20, 40, 25, 60, 45, 80, 65, 95];
    const pointsStr = defaultPoints.map((p, idx) => `${(idx * 70) + 20},${220 - (p * 1.8)}`).join(" L ");
    const areaStr = `${pointsStr} L 510,220 L 20,220 Z`;
    return { pointsStr, areaStr, defaultPoints };
  }, []);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchSearch = 
        s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.email?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.phone?.toLowerCase().includes(studentSearch.toLowerCase());
      
      const matchClass = !studentClassFilter || s.className === studentClassFilter;
      const matchStream = !studentStreamFilter || s.stream === studentStreamFilter;

      return matchSearch && matchClass && matchStream;
    });
  }, [students, studentSearch, studentClassFilter, studentStreamFilter]);

  // Paginated students
  const paginatedStudents = useMemo(() => {
    const startIdx = (studentPage - 1) * studentItemsPerPage;
    return filteredStudents.slice(startIdx, startIdx + studentItemsPerPage);
  }, [filteredStudents, studentPage]);

  const totalStudentPages = Math.max(Math.ceil(filteredStudents.length / studentItemsPerPage), 1);

  // Time conversion
  const fmtTime = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":");
    const hr = parseInt(h, 10);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
  };
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = DAYS[new Date().getDay()];
  const todayClasses = schedules
    .filter((s) => s.dayOfWeek === todayName)
    .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""));
  const pendingFees = fees.filter((f) => f.status !== "Paid");
  const recentStudents = [...students].slice(0, 5);
  const recentAnnouncements = [...announcements].slice(0, 3);
  const isExpanded = !sidebarCollapsed || sidebarHovered;

  return (
    <div className={`min-h-screen font-[family-name:var(--font-mulish)] flex text-slate-800 ${darkMode ? 'dark bg-[#0B0F19] text-slate-100' : 'bg-[#F1F5F9] text-slate-850'}`}>
      <Toast message={msg} type={parseFlashType(msg)} onClose={() => setMsg("")} />
      {confirm && <ConfirmModal message={confirm.msg} onConfirm={confirm.onOk} onCancel={() => setConfirm(null)} />}
      
      {/* Drawer backdrop for mobile screens */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/20 z-40 lg:hidden backdrop-blur-sm" 
            onClick={() => setSidebarOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Premium Glassmorphic Left Sidebar */}
      <aside 
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        className={`fixed lg:sticky lg:top-0 inset-y-0 left-0 z-40 ${isExpanded ? "w-[260px]" : "w-[76px]"} bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/60 flex flex-col transition-all duration-300 h-screen ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} shadow-sm`}
      >
        <div className={`p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center ${!isExpanded ? "justify-center" : "justify-between"}`}>
          {isExpanded ? (
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20 text-sm">CG</span>
              <span className="font-bold text-slate-800 dark:text-white text-base">Commerce<span className="text-blue-600">Gyan</span></span>
            </div>
          ) : (
            <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm">CG</span>
          )}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
            className="hidden lg:flex p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 dark:hover:text-slate-350 transition-colors cursor-pointer" 
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 p-3.5 space-y-4 overflow-y-auto">
          {SECTIONS.map((sec, idx) => (
            <div key={idx} className="space-y-1.5">
              {isExpanded && (
                <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider pl-3 mb-1.5">{sec.title}</h4>
              )}
              {sec.items.map(s => {
                const Icon = s.icon;
                const count = sidebarCountMap[s.id];
                const isActive = tab === s.id;
                return (
                  <button 
                    key={s.id} 
                    onClick={() => { setTab(s.id); setSidebarOpen(false); }}
                    title={!isExpanded ? s.label : undefined}
                    className={`relative w-full flex items-center ${!isExpanded ? "justify-center px-2 py-2.5" : "justify-between px-3 py-2.5"} rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${isActive ? "bg-blue-50/50 dark:bg-blue-950/15 text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-455 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-800 dark:hover:text-slate-200"}`}
                  >
                    <span className="flex items-center gap-3">
                      {isActive && <span className="absolute left-0 top-2 bottom-2 w-0.75 bg-blue-600 dark:bg-blue-500 rounded-r-md" />}
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-450' : 'text-slate-400 dark:text-slate-500'}`} />
                      {isExpanded && <span>{s.label}</span>}
                    </span>
                    {isExpanded && count !== undefined && (
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full transition-colors ${isActive ? "bg-blue-100/50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300" : "bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-450"}`}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {isExpanded && (
            <a href="/" target="_blank" className="block w-full text-center text-xs text-blue-600 dark:text-blue-550 font-bold hover:underline mb-1">View Public Site ↗</a>
          )}
          <button onClick={handleLogout} className={`w-full flex items-center justify-center gap-2 bg-red-50/50 dark:bg-red-950/20 text-red-650 dark:text-red-400 hover:bg-red-100/70 dark:hover:bg-red-950/45 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer`}>
            <LogOut className="w-4 h-4 shrink-0" />
            {isExpanded && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Sticky Navbar (Height: 64px) */}
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-4.5 flex items-center justify-between sticky top-0 z-40 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-500 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Breadcrumb Page indicator */}
            <div className="hidden md:flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider">
              <span className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer" onClick={() => setTab("overview")}>CommerceGyan</span>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="text-blue-600 dark:text-blue-450 font-black">{activeBreadcrumb}</span>
            </div>
          </div>

          {/* Actions Panel */}
          <div className="flex items-center gap-3">
            {/* Search widget with stronger presence */}
            <div className="hidden sm:flex items-center gap-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-205 dark:border-slate-800 rounded-xl px-3 h-10 w-96 focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10 dark:focus:ring-blue-500/5 focus-within:bg-white dark:focus-within:bg-slate-950 transition-all">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <input 
                placeholder="Search catalog, students, schedules..." 
                className="bg-transparent border-0 outline-none text-xs w-full text-slate-750 dark:text-slate-205 focus:ring-0 font-bold placeholder-slate-450 dark:placeholder-slate-500"
              />
              <kbd className="hidden md:inline-flex items-center gap-0.5 select-none rounded border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-400 dark:text-slate-500 shadow-sm">
                <span>⌘</span>K
              </kbd>
            </div>

            {/* Dark Mode toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="w-9 h-9 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800/80 flex items-center justify-center text-slate-400 hover:text-slate-705 dark:hover:text-slate-200 transition-all cursor-pointer"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Quick Add Menu */}
            <Dropdown
              trigger={
                <button className={`${btnPrimary} flex items-center gap-1.5 !py-2 !px-3 shadow-sm`}>
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Quick Action</span>
                </button>
              }
            >
              <DropdownItem onClick={() => setTab("courses")}>+ Create Course</DropdownItem>
              <DropdownItem onClick={() => setTab("batches")}>+ Setup Batch</DropdownItem>
              <DropdownItem onClick={() => setTab("announcements")}>+ Post Bulletin</DropdownItem>
            </Dropdown>

            {/* Notification Bell */}
            <button className="relative w-9 h-9 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 border border-slate-100 dark:border-slate-800/80 flex items-center justify-center text-slate-400 hover:text-slate-660 dark:hover:text-slate-300 transition-colors">
              <Bell className="w-4 h-4" />
              {enquiries.filter(e => e.status === "new").length > 0 && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
              )}
            </button>

            {/* User Profile Avatar */}
            <Avatar name="Admin User" size="md" className="cursor-pointer" />
          </div>
        </header>
        {/* Dashboard Pages wrapper */}
        <main className="flex-1 p-4 overflow-y-auto space-y-4">

          {/* 1. OVERVIEW DASHBOARD TAB */}
          {tab === "overview" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white/60 dark:bg-slate-900/35 border border-slate-200/40 dark:border-slate-850/50 rounded-xl py-1.5 px-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <h2 className="text-xs font-black text-slate-800 dark:text-slate-100">Welcome back, Administrator</h2>
                    <span className="hidden sm:inline text-slate-250 dark:text-slate-800">|</span>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">Your platform metrics are stable. Here is the operational summary for today.</p>
                  </div>
                </div>
              </div>

              {/* ZONE 1 - KPI Overview Area */}
              <div className="bg-blue-50 dark:bg-blue-950/25 border border-blue-200/45 dark:border-blue-900/35 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center mb-0.5">
                  <div>
                    <h3 className="text-[11px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-wider">Zone 1 — KPI Overview</h3>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5">Realtime operational statistics</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                  {[
                    { id: "students", label: "Students", val: students.length, growth: "+12%", icon: Users, color: "blue" },
                    { id: "teachers", label: "Faculty", val: teachers.length, growth: "+4%", icon: GraduationCap, color: "purple" },
                    { id: "batches", label: "Batches", val: batches.length, growth: "0%", icon: Layers, color: "cyan" },
                    { id: "courses", label: "Courses", val: courses.length, growth: "+8%", icon: BookOpen, color: "pink" },
                    { id: "revenue", label: "Revenue", val: `₹${(stats.totalFeeCollected || 0).toLocaleString()}`, growth: "+18%", icon: DollarSign, color: "emerald" },
                    { id: "dues", label: "Fee Due", val: `₹${(stats.totalFeeDue || 0).toLocaleString()}`, growth: "-5%", icon: CreditCard, color: "rose" },
                  ].map((item, idx) => {
                    const themes = {
                      blue: { bg: "bg-blue-50/25 dark:bg-blue-950/15", border: "border-blue-200/80 dark:border-blue-900/50", iconBg: "bg-blue-100/80 dark:bg-blue-900/60", iconText: "text-blue-600 dark:text-blue-400", spark: "M5,20 Q15,8 25,18 T45,4", stroke: "#3B82F6" },
                      purple: { bg: "bg-purple-50/25 dark:bg-purple-950/15", border: "border-purple-200/80 dark:border-purple-900/50", iconBg: "bg-purple-100/80 dark:bg-purple-900/60", iconText: "text-purple-650 dark:text-purple-450", spark: "M5,15 Q15,18 25,10 T45,8", stroke: "#8B5CF6" },
                      cyan: { bg: "bg-cyan-50/25 dark:bg-cyan-950/15", border: "border-cyan-200/80 dark:border-cyan-900/50", iconBg: "bg-cyan-100/80 dark:bg-cyan-900/60", iconText: "text-cyan-600 dark:text-cyan-400", spark: "M5,15 L45,15", stroke: "#06B6D4" },
                      pink: { bg: "bg-pink-50/25 dark:bg-pink-950/15", border: "border-pink-200/80 dark:border-pink-900/50", iconBg: "bg-pink-100/80 dark:bg-pink-900/60", iconText: "text-pink-650 dark:text-pink-400", spark: "M5,18 Q15,5 25,12 T45,5", stroke: "#EC4899" },
                      emerald: { bg: "bg-emerald-50/25 dark:bg-emerald-950/15", border: "border-emerald-200/80 dark:border-emerald-900/50", iconBg: "bg-emerald-100/80 dark:bg-emerald-900/60", iconText: "text-emerald-600 dark:text-emerald-450", spark: "M5,22 Q15,15 25,8 T45,2", stroke: "#10B981" },
                      rose: { bg: "bg-rose-50/25 dark:bg-rose-950/15", border: "border-rose-200/80 dark:border-rose-900/50", iconBg: "bg-rose-100/80 dark:bg-rose-900/60", iconText: "text-rose-650 dark:text-rose-455", spark: "M5,5 Q15,12 25,18 T45,22", stroke: "#F43F5E" },
                    }[item.color];

                    const Icon = item.icon;
                    return (
                      <div 
                        key={item.id} 
                        className={`bg-white dark:bg-slate-900 ${themes.border} border rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.035),0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-[0_16px_36px_-4px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.02)] dark:hover:shadow-[0_16px_36px_-4px_rgba(0,0,0,0.45)] hover:-translate-y-1.5 hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between h-[126px] group cursor-pointer`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9.5 h-9.5 rounded-xl ${themes.iconBg} flex items-center justify-center border border-slate-200/20 dark:border-slate-800/20 shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                              <Icon className={`w-4.5 h-4.5 ${themes.iconText}`} />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">{item.label}</span>
                          </div>
                          {/* Sparkline */}
                          <div className="w-10 h-6">
                            <svg viewBox="0 0 50 25" className="w-full h-full overflow-visible opacity-60 group-hover:opacity-100 transition-opacity">
                              <path d={themes.spark} fill="none" stroke={themes.stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                        
                        <div className="my-0.5">
                          <p className="text-3xl md:text-[32px] font-black text-slate-900 dark:text-white tracking-tight leading-none">{item.val}</p>
                        </div>

                        <div className="flex justify-between items-center border-t border-slate-200/20 dark:border-slate-800/30 pt-2 text-[9px] font-bold uppercase tracking-wider">
                          <span className="text-slate-400 dark:text-slate-500">MoM Growth</span>
                          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-extrabold uppercase tracking-wider ${
                            item.growth.startsWith("-") 
                              ? "bg-rose-500/10 border-rose-500/15 text-rose-600 dark:text-rose-400" 
                              : item.growth === "0%" 
                              ? "bg-slate-550/10 border-slate-500/15 text-slate-500 dark:text-slate-400" 
                              : "bg-emerald-500/10 border-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          }`}>{item.growth}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ZONE 2 - Analytics & performance */}
              <div className="bg-slate-200/50 dark:bg-slate-900/45 border border-slate-300/30 dark:border-slate-800/40 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center mb-0.5">
                  <div>
                    <h3 className="text-[11px] font-black text-slate-455 dark:text-slate-500 uppercase tracking-wider">Zone 2 — Analytics & performance</h3>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5">Primary system workload and collection analysis</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-4">
                  {/* SVG Revenue Line Graph (Visually Dominant Centerpiece) */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-6 flex flex-col gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-300 lg:col-span-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm tracking-tight">Revenue Collections Tracker</h3>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">Clearing transactions value monthly timeline</p>
                      </div>
                      
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <div className="flex bg-slate-100/80 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
                          {["30D", "6M", "YTD"].map((tf) => (
                            <button 
                              key={tf} 
                              className={`px-2.5 py-1 text-[9px] font-black rounded-md transition-colors cursor-pointer ${
                                tf === "6M" 
                                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm" 
                                  : "text-slate-550 hover:text-slate-800 dark:hover:text-slate-205"
                              }`}
                            >
                              {tf}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider">
                          <span>Total: ₹{(stats.totalFeeCollected || 0).toLocaleString()}</span>
                          <span className="text-[8px] bg-emerald-500/20 px-1 rounded-sm">+14.2%</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Framed Chart & Insights Grid */}
                    <div className="grid lg:grid-cols-4 gap-6">
                      {/* Left: Chart Area */}
                      <div className="lg:col-span-3 bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100/80 dark:border-slate-850/60 rounded-xl p-4 md:p-6 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <div className="relative h-64 w-full">
                          <svg viewBox="0 0 540 240" className="w-full h-full text-blue-500 overflow-visible" preserveAspectRatio="none">
                            {/* Gradient fill */}
                            <defs>
                              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            
                            {/* Grid lines */}
                            <line x1="20" y1="30" x2="510" y2="30" stroke="#E2E8F0" strokeWidth="1" className="dark:stroke-slate-800/60" strokeDasharray="3,3" />
                            <line x1="20" y1="90" x2="510" y2="90" stroke="#E2E8F0" strokeWidth="1" className="dark:stroke-slate-800/60" strokeDasharray="3,3" />
                            <line x1="20" y1="150" x2="510" y2="150" stroke="#E2E8F0" strokeWidth="1" className="dark:stroke-slate-800/60" strokeDasharray="3,3" />
                            <line x1="20" y1="210" x2="510" y2="210" stroke="#E2E8F0" strokeWidth="1" className="dark:stroke-slate-800/60" strokeDasharray="3,3" />
                            
                            {/* Area graph */}
                            <path d={revenueChartPoints.areaStr} fill="url(#chartGrad)" />
                            {/* Line graph */}
                            <path d={`M ${revenueChartPoints.pointsStr}`} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            
                            {/* Vertex Nodes for Premium interactivity */}
                            {revenueChartPoints.defaultPoints.map((p, idx) => {
                              const cx = (idx * 70) + 20;
                              const cy = 220 - (p * 1.8);
                              return (
                                <g key={idx} className="group/node">
                                  <circle cx={cx} cy={cy} r="4.5" className="fill-white stroke-blue-600 dark:stroke-blue-500 stroke-2.5 transition-all group-hover/node:r-6 shadow-sm" />
                                  <circle cx={cx} cy={cy} r="12" className="fill-transparent hover:fill-blue-500/10 cursor-pointer transition-all" />
                                </g>
                              );
                            })}
                          </svg>
                        </div>
                        
                        {/* Month indices */}
                        <div className="flex justify-between px-4 text-[9px] font-black text-slate-400 dark:text-slate-500 mt-4 uppercase tracking-wider">
                          {["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"].map(m => <span key={m}>{m}</span>)}
                        </div>
                      </div>

                      {/* Right: Summary panel */}
                      <div className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800/80 pt-6 lg:pt-0 lg:pl-6 space-y-6">
                        <div className="space-y-4">
                          <div>
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Collection Efficiency</span>
                            <div className="flex items-baseline gap-2 mt-1">
                              <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
                                {stats.totalFeeCollected && (stats.totalFeeCollected + (stats.totalFeeDue || 0)) > 0 
                                  ? (stats.totalFeeCollected / (stats.totalFeeCollected + (stats.totalFeeDue || 0)) * 100).toFixed(0) 
                                  : 0}%
                              </span>
                              <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded">Optimal</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                              <div 
                                className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                                style={{ width: `${stats.totalFeeCollected && (stats.totalFeeCollected + (stats.totalFeeDue || 0)) > 0 ? (stats.totalFeeCollected / (stats.totalFeeCollected + (stats.totalFeeDue || 0)) * 100) : 0}%` }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Gross Revenue</span>
                              <span className="text-xs font-black text-slate-800 dark:text-slate-100 mt-1 block">₹{(stats.totalFeeCollected || 0).toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Receivables</span>
                              <span className="text-xs font-black text-rose-600 dark:text-rose-455 mt-1 block">₹{(stats.totalFeeDue || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850/80 rounded-xl p-3.5 space-y-2.5">
                          <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            <span>Active Classes</span>
                            <span className="text-slate-750 dark:text-slate-300 font-extrabold">{schedules.length}</span>
                          </div>
                          <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            <span>Faculty Count</span>
                            <span className="text-slate-750 dark:text-slate-300 font-extrabold">{teachers.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SVG Day-Wise Active Schedule Workload Chart (Visually Supportive Centerpiece) */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 p-6 flex flex-col gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-300 lg:col-span-3">
                    <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                      <h3 className="font-black text-slate-800 dark:text-slate-100 text-xs">Workload Schedule Density</h3>
                      <p className="text-[9px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider mt-0.5">Active hours scheduled per day</p>
                    </div>
                    
                    <div className="grid lg:grid-cols-4 gap-6">
                      {/* Left: Bar Chart */}
                      <div className="lg:col-span-3">
                        {schedules.length === 0 ? (
                          <div className="bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100/80 dark:border-slate-850/60 rounded-xl p-6 flex flex-col items-center justify-center min-h-[160px]">
                            <span className="text-2xl mb-1.5">📅</span>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No workload data</p>
                            <p className="text-[10px] text-slate-455 text-center max-w-[180px] mt-1 font-medium">Add time slot allocations to populate density metrics</p>
                            <button onClick={() => setTab("schedules")} className="mt-3 text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-950/20 px-2.5 py-1 rounded-lg hover:bg-blue-100/70 border border-blue-100/20">Set Schedule</button>
                          </div>
                        ) : (
                          <div className="bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100/80 dark:border-slate-850/60 rounded-xl p-4 md:p-6 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                            <div className="flex items-end justify-between h-36 px-4 md:px-8">
                              {workloadChart.counts.map((count, idx) => {
                                const day = workloadChart.daysOrder[idx].slice(0, 3);
                                const barPercent = (count / workloadChart.maxVal) * 100;
                                return (
                                  <div key={idx} className="flex flex-col items-center flex-1 group">
                                    <div className="relative w-full flex justify-center">
                                      <span className="absolute -top-7 text-[9px] font-black text-slate-750 dark:text-white opacity-0 group-hover:opacity-100 bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 px-2 py-0.5 rounded shadow-md transition-opacity z-10">
                                        {count} classes
                                      </span>
                                    </div>
                                    <div 
                                      className="w-6 sm:w-8 bg-blue-600/90 hover:bg-blue-600 dark:bg-blue-500/80 dark:hover:bg-blue-550 rounded-t-md transition-all duration-300 cursor-pointer shadow-[0_1px_3px_rgba(37,99,235,0.1)]" 
                                      style={{ height: `${Math.max(barPercent, 6)}%` }} 
                                    />
                                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-2 uppercase tracking-wider">{day}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Workload details */}
                      <div className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800/80 pt-6 lg:pt-0 lg:pl-6 space-y-6">
                        <div className="space-y-4">
                          <div>
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Peak Timetable Day</span>
                            <div className="flex items-baseline gap-2 mt-1">
                              <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                                {schedules.length > 0 ? workloadChart.daysOrder[workloadChart.counts.indexOf(workloadChart.maxVal)] : "N/A"}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">Max allocation: {workloadChart.maxVal} classes</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Weekly Slots</span>
                              <span className="text-xs font-black text-slate-800 dark:text-slate-100 mt-1 block">{schedules.length} slots</span>
                            </div>
                            <div>
                              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Daily Avg</span>
                              <span className="text-xs font-black text-slate-800 dark:text-slate-100 mt-1 block">{(schedules.length / 7).toFixed(1)} slots</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850/80 rounded-xl p-3.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-relaxed">
                          📌 Schedule density shows active slot allocations. Keep daily distribution balanced to avoid faculty fatigue.
                        </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              {/* ZONE 3 - Operational Activity Area */}
              <div className="bg-emerald-50 dark:bg-emerald-950/15 border border-emerald-200/45 dark:border-emerald-900/35 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center mb-0.5">
                  <div>
                    <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Zone 3 — Operational Activities</h3>
                    <p className="text-[9px] text-slate-400 dark:text-slate-550 font-bold uppercase mt-0.5">Bulletins, daily timetable, and dues lists</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {/* Bulletins Bulletin */}
                  <div className="bg-white/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 p-5 flex flex-col justify-between shadow-sm transition-colors duration-200">
                    <h3 className="font-black text-slate-800 dark:text-white text-xs mb-3 flex justify-between items-center">
                      <span>Institute bulletins</span>
                      <button onClick={() => setTab("announcements")} className="text-[9px] font-black text-blue-600 hover:underline uppercase tracking-wide">Manage bulletins</button>
                    </h3>
                    {recentAnnouncements.length === 0 ? <p className="text-xs text-slate-400 font-bold">No active bulletins published</p> : (
                      <ul className="space-y-2.5">{recentAnnouncements.map(a => (
                        <li key={a._id} className="text-xs border-b border-slate-50 dark:border-slate-900 pb-2.5 last:border-0">
                          <div className="flex justify-between items-center mb-1">
                            <p className="font-black text-slate-800 dark:text-white truncate max-w-[140px]">{a.title}</p>
                            {a.isImportant && <span className="bg-red-50 text-red-650 text-[8px] font-black px-1.5 py-0.5 rounded">CRITICAL</span>}
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed text-[11px]">{a.body}</p>
                        </li>
                      ))}</ul>
                    )}
                  </div>

                  {/* Today's Classes */}
                  <div className="bg-white/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 p-5 flex flex-col justify-between shadow-sm transition-colors duration-200">
                    <h3 className="font-black text-slate-800 dark:text-white text-xs mb-3 flex justify-between items-center">
                      <span>Active Classes Today</span>
                      <span className="text-[9px] bg-blue-50 dark:bg-blue-950/20 text-blue-700 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">TODAY</span>
                    </h3>
                    {todayClasses.length === 0 ? <p className="text-xs text-slate-400 font-bold">No class timings active today</p> : (
                      <ul className="space-y-2">{todayClasses.slice(0, 5).map(s => (
                        <li key={s._id} className="flex justify-between items-center text-xs bg-slate-50 dark:bg-slate-900/50 rounded-xl px-3 py-2 border border-slate-100/30">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white">{s.subject}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">{s.batch?.batchName}</p>
                          </div>
                          <span className="font-black text-blue-600 bg-blue-50 dark:bg-blue-950/20 px-2.5 py-1 rounded-lg text-[10px]">{fmtTime(s.startTime)}</span>
                        </li>
                      ))}</ul>
                    )}
                  </div>

                  {/* Pending Dues */}
                  <div className="bg-white/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 p-5 flex flex-col justify-between shadow-sm transition-colors duration-200 lg:col-span-2 xl:col-span-1">
                    <h3 className="font-black text-slate-800 dark:text-white text-xs mb-3 flex justify-between items-center">
                      <span>Outstanding balances</span>
                      <button onClick={() => setTab("fees")} className="text-[9px] font-black text-red-600 hover:underline uppercase tracking-wide">Due Sheet</button>
                    </h3>
                    {pendingFees.length === 0 ? <p className="text-xs text-slate-400 font-bold">All student ledgers cleared</p> : (
                      <ul className="space-y-2">{pendingFees.slice(0, 5).map(f => (
                        <li key={f._id} className="flex justify-between items-center text-xs bg-red-50/20 hover:bg-red-50/40 rounded-xl px-3 py-2 border border-red-100/10">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white">{f.student?.name}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">{f.batch?.batchName}</p>
                          </div>
                          <span className="text-red-550 font-black text-xs">₹{f.remainingAmount}</span>
                        </li>
                      ))}</ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "students" && (
            <div className="space-y-6">
              {/* Premium Section Header Banner */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_1px_4px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.15)]">
                <div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none tracking-tight">Student Directory</h2>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">Registered academy members — identity, contact, and batch information</p>
                </div>
                <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  {filteredStudents.length} {filteredStudents.length === 1 ? "Student" : "Students"}
                </span>
              </div>

              {/* Filters Panel - Modern CRM Control Workspace */}
              <div className="bg-slate-550/5 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl flex flex-wrap gap-4 items-center shadow-[inset_0_1px_3px_rgba(0,0,0,0.01)] backdrop-blur-sm">
                <div className="flex items-center gap-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl px-4 py-2.5 flex-1 min-w-[280px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 dark:focus-within:ring-blue-500/10 focus-within:shadow-md transition-all duration-300">
                  <Search className="w-4 h-4 text-slate-400 shrink-0 ml-0.5" />
                  <input 
                    placeholder="Search by student name, email, phone..." 
                    value={studentSearch} 
                    onChange={e => { setStudentSearch(e.target.value); setStudentPage(1); }} 
                    className="bg-transparent border-0 outline-none text-xs w-full text-slate-750 dark:text-slate-205 focus:ring-0 font-bold placeholder-slate-400 dark:placeholder-slate-550"
                  />
                </div>
                
                <div className="flex gap-3 flex-wrap shrink-0 items-center">
                  <select 
                    value={studentClassFilter} 
                    onChange={e => { setStudentClassFilter(e.target.value); setStudentPage(1); }}
                    className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl py-2.5 px-4 text-xs font-bold text-slate-650 dark:text-slate-350 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/10 outline-none transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    <option value="">All Classes</option>
                    {Array.from(new Set(students.map(s => s.className).filter(Boolean))).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <select 
                    value={studentStreamFilter} 
                    onChange={e => { setStudentStreamFilter(e.target.value); setStudentPage(1); }}
                    className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl py-2.5 px-4 text-xs font-bold text-slate-650 dark:text-slate-350 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/10 outline-none transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    <option value="">All Streams</option>
                    {Array.from(new Set(students.map(s => s.stream).filter(Boolean))).map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>

                  {(studentSearch || studentClassFilter || studentStreamFilter) && (
                    <button 
                      onClick={() => { setStudentSearch(""); setStudentClassFilter(""); setStudentStreamFilter(""); setStudentPage(1); }}
                      className="text-xs text-red-500 hover:text-red-655 font-black hover:underline px-2 transition-colors cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Data Table */}
              {paginatedStudents.length === 0 ? (
                <div className={card}>
                  <EmptyState icon="👥" title="No students matched filters" subtitle="Adjust search fields or filter menus" />
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-805/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col justify-between transition-all duration-300">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead className="bg-slate-50/95 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-10 border-b-2 border-slate-200/90 dark:border-slate-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                        <tr>
                          {["Student Name", "Email Address", "Phone Number", "Stream Category", "Class Grade", "Batch Assignment", "Actions"].map(h => (
                            <th key={h} className="text-left py-3.5 px-5 font-extrabold text-slate-600 dark:text-slate-350 text-[10px] uppercase tracking-widest">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/40">
                        {paginatedStudents.map((s, index) => {
                          const isScience = s.stream?.toLowerCase() === "science";
                          const isCommerce = s.stream?.toLowerCase() === "commerce";
                          const streamStyle = isScience
                            ? "bg-blue-50/70 dark:bg-blue-950/30 text-blue-750 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/50"
                            : isCommerce
                            ? "bg-purple-50/70 dark:bg-purple-950/30 text-purple-750 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/50"
                            : "bg-slate-50/70 dark:bg-slate-800/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800/50";


                          const avatarColors = [
                            "from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-450 border-blue-200/40 dark:border-blue-900/30",
                            "from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-455 border-purple-200/40 dark:border-purple-900/30",
                            "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-450 border-emerald-200/40 dark:border-emerald-900/30",
                            "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-450 border-amber-200/40 dark:border-amber-900/30",
                            "from-indigo-500/10 to-cyan-500/10 text-indigo-600 dark:text-indigo-455 border-indigo-200/40 dark:border-indigo-900/30",
                          ];
                          const avatarThemeIndex = ((s.name || "").charCodeAt(0) || 0) % avatarColors.length;
                          const avatarThemeClass = avatarColors[avatarThemeIndex];

                          const initials = (s.name || "?")
                            .split(" ")
                            .filter(Boolean)
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase();

                          return (
                            <tr 
                              key={s._id} 
                              className={`group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors duration-150 cursor-pointer`}
                            >
                              <td className="py-3.5 px-5">
                                <div className="flex items-center gap-3.5">
                                  <div className="relative group/avatar shrink-0">
                                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${avatarThemeClass} border flex items-center justify-center text-xs font-black shadow-sm transition-all duration-300 group-hover/avatar:scale-105 group-hover/avatar:shadow-md`}>
                                      {initials}
                                    </div>
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2.5 border-white dark:border-slate-900 rounded-full shadow-sm" />
                                  </div>
                                  <div className="flex flex-col min-w-0 gap-1.5">
                                    <span className="font-extrabold text-slate-800 dark:text-slate-100 truncate max-w-[150px] text-xs leading-none group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-150">
                                      {s.name}
                                    </span>
                                    <span className="text-[9px] text-slate-380 dark:text-slate-550 font-semibold truncate tracking-widest uppercase leading-none">
                                      #{s._id?.slice(-6).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-5 text-slate-450 dark:text-slate-500 font-mono text-[11px] font-bold">{s.email}</td>
                              <td className="py-3.5 px-5 text-slate-550 dark:text-slate-450 text-xs font-bold">{s.phone || "—"}</td>
                              <td className="py-3.5 px-5">
                                <span className={`inline-flex items-center whitespace-nowrap text-[9px] font-extrabold px-2.5 py-1 rounded-lg border tracking-wider max-w-[160px] truncate ${streamStyle}`}>
                                  {s.stream || "General"}
                                </span>
                              </td>
                              <td className="py-3.5 px-5 text-slate-550 dark:text-slate-405 text-xs font-semibold">{s.className || "—"}</td>
                              <td className="py-3.5 px-5 text-slate-755 dark:text-slate-300 text-xs font-bold">{s.batch?.batchName || "—"}</td>

                              <td className="py-3.5 px-5">
                                <Dropdown
                                  trigger={
                                    <button className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 flex items-center justify-center text-slate-400 hover:text-slate-650 dark:hover:text-slate-300 transition-colors" aria-label="Open actions dropdown">
                                      <MoreVertical className="w-4 h-4" />
                                    </button>
                                  }
                                >
                                  <DropdownItem 
                                    onClick={() => deleteStudent(s._id)}
                                    className="text-red-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Remove student
                                  </DropdownItem>
                                </Dropdown>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination control footer */}
                  <div className="p-3.5 border-t border-slate-150 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/20 flex justify-between items-center text-xs font-bold text-slate-505">
                    <span className="text-[11px] text-slate-400 dark:text-slate-550">Showing {(studentPage - 1) * studentItemsPerPage + 1} - {Math.min(studentPage * studentItemsPerPage, filteredStudents.length)} of {filteredStudents.length}</span>
                    <div className="flex items-center gap-1.5">
                      <button 
                        disabled={studentPage === 1}
                        onClick={() => setStudentPage(studentPage - 1)}
                        className="border border-slate-205 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-950 disabled:opacity-40 text-slate-605 dark:text-slate-400 py-1.5 px-2.5 rounded-lg text-[11px] font-black transition-all cursor-pointer disabled:cursor-not-allowed active:scale-95 shadow-sm"
                      >
                        ← Prev
                      </button>
                      <span className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 text-[10px] font-black">{studentPage} / {totalStudentPages}</span>
                      <button 
                        disabled={studentPage === totalStudentPages}
                        onClick={() => setStudentPage(studentPage + 1)}
                        className="border border-slate-205 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-950 disabled:opacity-40 text-slate-650 dark:text-slate-400 py-1.5 px-2.5 rounded-lg text-[11px] font-black transition-all cursor-pointer disabled:cursor-not-allowed active:scale-95 shadow-sm"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. OTHER MODULES TABS */}
          {tab === "teachers" && <TeachersTab teachers={teachers} batches={batches} schedules={schedules} token={token} onRefresh={fetchAll} flash={flash} />}
          {tab === "batches" && <BatchesTab batches={batches} teachers={teachers} courses={courses} students={students} token={token} onRefresh={fetchAll} flash={flash} />}
          {tab === "schedules" && <SchedulesTab schedules={schedules} batches={batches} teachers={teachers} token={token} onRefresh={fetchAll} flash={flash} />}
          {tab === "fees" && <FeeTab fees={fees} students={students} batches={batches} courses={courses} token={token} onRefresh={fetchAll} flash={flash} />}
          {tab === "courses" && <CoursesTab courses={courses} token={token} onRefresh={fetchAll} flash={flash} />}
          {tab === "achievers" && <AchieversTab achievers={achievers} token={token} onRefresh={fetchAll} flash={flash} />}
          {tab === "payments" && <PaymentsTab token={token} flash={flash} />}

          {/* ANNOUNCEMENTS REDESIGNED TAB */}
          {tab === "announcements" && (
            <div className="space-y-4">
              <PageHeader 
                title={`Bulletin Bulletins (${announcements.length})`} 
                subtitle="Broadcast board announcements, exam schedules, and marquee notices"
                action={
                  <button onClick={() => { setEditAnn(null); setAnnForm({ title: "", body: "", isImportant: false }); setShowAnnModal(true); }} className={`${btnPrimary} flex items-center gap-1.5`}>
                    <Plus className="w-4 h-4" /> Create bulletin
                  </button>
                }
              />

              {announcements.length === 0 ? (
                <div className={card}>
                  <EmptyState icon="📢" title="No announcements published" />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {announcements.map(a => (
                    <div key={a._id} className={`${card} p-5 hover:shadow-md hover:border-slate-200 transition-all dark:bg-slate-950 dark:border-slate-800 flex flex-col justify-between`}>
                      <div>
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h4 className="font-black text-slate-800 dark:text-white text-sm truncate max-w-[170px]">{a.title}</h4>
                          <div className="flex items-center gap-1">
                            {a.isImportant && (
                              <span className="bg-red-50 border border-red-200 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">CRITICAL</span>
                            )}
                            
                            <Dropdown
                              trigger={
                                <button className="w-7 h-7 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors" aria-label="Open menu">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              }
                            >
                              <DropdownItem onClick={() => startEditAnn(a)}>
                                <Edit2 className="w-3.5 h-3.5" /> Edit notice
                              </DropdownItem>
                              <DropdownItem 
                                onClick={() => deleteAnn(a._id)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete notice
                              </DropdownItem>
                            </Dropdown>
                          </div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-4">{a.body}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-50 dark:border-slate-900 mt-2 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        <span>Issued Date</span>
                        <span>{new Date(a.createdAt).toLocaleDateString("en-IN")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Form Modal */}
              {showAnnModal && (
                <FormModal
                  title={editAnn ? "Adjust announcement notice" : "Post News announcement bulletin"}
                  onClose={() => setShowAnnModal(false)}
                  onSubmit={saveAnn}
                  submitLabel={editAnn ? "Adjust notice" : "Publish notice"}
                  disabled={!annForm.title.trim() || !annForm.body.trim()}
                >
                  <div className="space-y-4">
                    <Field label="Announcement Title *" required>
                      <input value={annForm.title} onChange={e => setAnnForm({ ...annForm, title: e.target.value })} className={inp} placeholder="e.g. Schedule Change Class 12" />
                    </Field>
                    
                    <Field label="Description bulletin message *" required>
                      <textarea rows={4} value={annForm.body} onChange={e => setAnnForm({ ...annForm, body: e.target.value })} className={`${inp} resize-none`} placeholder="Enter announcement body text details..." />
                    </Field>
                    
                    <div className="flex items-center gap-2 py-1">
                      <input type="checkbox" id="bulletinImportant" checked={annForm.isImportant} onChange={e => setAnnForm({ ...annForm, isImportant: e.target.checked })} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      <label htmlFor="bulletinImportant" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                        Mark as Urgent alert (Displays red on ticker notice bar)
                      </label>
                    </div>
                  </div>
                </FormModal>
              )}
            </div>
          )}

          {/* NOTES DOC MANAGEMENT TAB */}
          {tab === "notes" && (
            <div className="space-y-6">
              <PageHeader 
                title={`Study worksheets / PDFs (${notes.length})`} 
                subtitle="Upload syllabus worksheets, study notes, and assignments logs"
              />

              <div className={`${card} p-5 border border-blue-500/10 dark:bg-slate-950 dark:border-slate-800`}>
                <h3 className="font-black text-slate-800 dark:text-white text-sm mb-4">➕ Upload Study Material Document</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <Field label="Document Title *" required>
                    <input placeholder="e.g. Accounts Chapter 3 Notes" value={noteForm.title} onChange={e => setNoteForm({ ...noteForm, title: e.target.value })} className={inp} />
                  </Field>
                  <Field label="Subject">
                    <input placeholder="e.g. Accounts" value={noteForm.subject} onChange={e => setNoteForm({ ...noteForm, subject: e.target.value })} className={inp} />
                  </Field>
                  <Field label="Class Grade">
                    <input placeholder="e.g. Class 12" value={noteForm.className} onChange={e => setNoteForm({ ...noteForm, className: e.target.value })} className={inp} />
                  </Field>
                  <Field label="Catalog Course">
                    <input placeholder="e.g. Commerce" value={noteForm.course} onChange={e => setNoteForm({ ...noteForm, course: e.target.value })} className={inp} />
                  </Field>
                </div>
                
                <div className="mb-4">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-2">Select PDF Document file *</label>
                  <div 
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/10 cursor-pointer transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm group"
                  >
                    <input 
                      type="file" 
                      accept=".pdf" 
                      ref={fileRef} 
                      onChange={e => setNoteFile(e.target.files[0])}
                      className="hidden" 
                    />
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>
                    {noteFile ? (
                      <div className="text-center">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{noteFile.name}</p>
                        <p className="text-[10px] text-emerald-600 font-bold mt-1 uppercase tracking-wide">File Ready for upload ({(noteFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Drag & drop your PDF file here, or <span className="text-blue-600 hover:underline">browse files</span></p>
                        <p className="text-[10px] text-slate-400 mt-1">Supports standard PDF study materials up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <button onClick={uploadNote} className={`${btnPrimary} flex items-center gap-1.5`}>
                  <Plus className="w-4 h-4" /> Upload Document
                </button>
              </div>

              {/* Table View */}
              {notes.length === 0 ? (
                <div className={card}>
                  <EmptyState icon="📄" title="No study guides uploaded" />
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F8FAFC] dark:bg-slate-900/50">
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        {["Document Title","Subject","Class Grade","Uploaded Date","Actions"].map(h => (
                          <th key={h} className="text-left py-3.5 px-4 font-black text-slate-500 text-xs uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {notes.map(n => (
                        <tr key={n._id} className="border-t border-slate-50 dark:border-slate-900 hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-100 text-xs">{n.title}</td>
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs font-semibold">{n.subject || "—"}</td>
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs font-semibold">{n.className || "—"}</td>
                          <td className="py-3.5 px-4 text-slate-400 text-[10px] font-bold uppercase">{new Date(n.createdAt).toLocaleDateString("en-IN")}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex gap-2">
                              <a href={`${API}${n.fileUrl}`} target="_blank" rel="noreferrer" className={`${btnGhost} !py-1.5 !px-3 font-black`}>View Guide</a>
                              <button onClick={() => deleteNote(n._id)} className="bg-red-50 text-red-500 hover:bg-red-100 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer">✕</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "enquiries" && (
            <div className="space-y-4">
              <PageHeader 
                title={`Admissions Enquiries (${enquiries.length})`} 
                subtitle="Track admissions queries, student leads, and WhatsApp conversions"
              />

              <div className="space-y-4">
                {enquiries.map(q => (
                  <div key={q._id} className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.01)] p-5 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-black text-slate-800 dark:text-white text-sm">{q.studentName}</h4>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">{new Date(q.createdAt).toLocaleString("en-IN")}</p>
                      </div>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border ${
                        q.status === "new" 
                          ? "bg-blue-50 text-blue-700 border-blue-200" 
                          : q.status === "contacted" 
                          ? "bg-amber-50 text-amber-700 border-amber-200" 
                          : "bg-green-50 text-green-700 border-green-200"
                      }`}>{q.status}</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs mb-4">
                      {[["Parent Contact", q.parentName], ["Phone", q.parentPhone], ["Email Address", q.email], ["Stream Goal", q.stream], ["Class Grade", q.className]].map(([l, v]) => (
                        <div key={l} className="bg-slate-50 dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/30 rounded-xl px-3 py-2">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">{l}</p>
                          <p className="text-slate-800 dark:text-slate-200 font-black truncate mt-0.5">{v || "—"}</p>
                        </div>
                      ))}
                    </div>

                    {q.message && (
                      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                        <strong>Student Inquiry Message:</strong> {q.message}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <a href={`https://wa.me/91${q.parentPhone}`} target="_blank" rel="noreferrer" className="bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 text-xs font-black px-4 py-2.5 rounded-xl transition-all cursor-pointer">WhatsApp Chat →</a>
                      <a href={`tel:${q.parentPhone}`} className="bg-blue-50 dark:bg-blue-950/20 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-950/40 text-xs font-black px-4 py-2.5 rounded-xl transition-all cursor-pointer">Place Phone Call</a>
                    </div>
                  </div>
                ))}
                {enquiries.length === 0 && <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 text-slate-400 font-bold">No enquiries cataloged yet</div>}
              </div>
            </div>
          )}

          {/* SYSTEM SETTINGS TAB */}
          {tab === "settings" && (
            <div className="space-y-6">
              <PageHeader title="System Settings" subtitle="Configure system-wide parameters and preferences" />
              <div className={`${card} p-6 dark:bg-slate-950 dark:border-slate-800 space-y-6`}>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white mb-4">Appearance Settings</h3>
                  <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-900 pb-4">
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Dark Mode Theme</p>
                      <p className="text-[10px] text-slate-400">Toggle dark color elements across the administration workspace</p>
                    </div>
                    <button 
                      onClick={() => setDarkMode(!darkMode)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${darkMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${darkMode ? 'left-[20px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white mb-4">Notification Alerts</h3>
                  <div className="space-y-4">
                    {[
                      { label: "New Admission Enquiry Emails", desc: "Receive email notification when a student submits an admission form" },
                      { label: "Fee Installment Reminders", desc: "Send automated alerts to student accounts for due fees" },
                      { label: "Payment Confirmation Receipts", desc: "Generate PDF fee receipts upon Razorpay confirmation" }
                    ].map((n, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-slate-50 dark:border-slate-900 pb-4 last:border-0 last:pb-0">
                        <div>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{n.label}</p>
                          <p className="text-[10px] text-slate-400">{n.desc}</p>
                        </div>
                        <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer dark:bg-slate-950" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button onClick={() => flash("✅ Settings saved successfully")} className={btnPrimary}>
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ADMINISTRATOR PROFILE TAB */}
          {tab === "profile" && (
            <div className="space-y-6">
              <PageHeader title="Administrator Profile" subtitle="Manage your login credentials and personal information" />
              <div className="grid md:grid-cols-3 gap-6">
                <div className={`${card} p-6 dark:bg-slate-950 dark:border-slate-800 flex flex-col items-center text-center`}>
                  <Avatar name="Admin User" size="lg" className="w-20 h-20 text-lg mb-4" />
                  <h3 className="font-black text-slate-800 dark:text-white text-base">Commerce Gyan Admin</h3>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider mt-1">System Administrator</p>
                  <p className="text-xs text-slate-400 mt-4 leading-relaxed">Assigned with full privileges to configure courses, view payments, and manage students list.</p>
                </div>

                <div className={`${card} p-6 dark:bg-slate-950 dark:border-slate-800 md:col-span-2 space-y-4`}>
                  <h3 className="text-sm font-black text-slate-800 dark:text-white mb-2">Account Details</h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Full Name">
                      <input className={inp} defaultValue="Commerce Gyan Admin" disabled />
                    </Field>
                    <Field label="Email Address">
                      <input className={inp} defaultValue="commercegiyan@gmail.com" disabled />
                    </Field>
                    <Field label="Access Role">
                      <input className={inp} defaultValue="Administrator" disabled />
                    </Field>
                    <Field label="Security Privilege Level">
                      <input className={inp} defaultValue="Level 1 (Full Access)" disabled />
                    </Field>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button onClick={() => flash("⚠️ Password change is disabled in demo environment")} className={btnPrimary}>
                      Change Security Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
