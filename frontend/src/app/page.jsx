"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import WhatsAppButton from "../components/WhatsAppButton";
import Header from "../components/Header";
import API from "@/config/api";

export default function Home() {
  const [activeCourseTab, setActiveCourseTab] = useState("School");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [dbCourses, setDbCourses] = useState([]);
  const [dbAchievers, setDbAchievers] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/announcements`)
      .then(r => r.json()).then(d => setAnnouncements(Array.isArray(d) ? d.slice(0, 5) : []))
      .catch(() => {});

    fetch(`${API}/api/courses`)
      .then(r => r.json()).then(d => setDbCourses(Array.isArray(d) ? d : []))
      .catch(() => {});

    fetch(`${API}/api/achievers`)
      .then(r => r.json()).then(d => setDbAchievers(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const heroSlides = [
    {
      subtitle: "Don't just prepare.",
      title: "Prepare smarter",
      highlight: "with Commerce Gyan",
      btnText: "Know More",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
      subtitle: "Believe in your preparation",
      title: "ALL THE BEST for",
      highlight: "BOARDS 2026",
      btnText: "Register Now",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
      subtitle: "Start your journey",
      title: "Top Faculty for",
      highlight: "CA Foundation",
      btnText: "Explore Courses",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    }
  ];

  const defaultCourses = {
    School: [
      { title: "Class 7", desc: "Build a strong foundation for future success." },
      { title: "Class 8", desc: "Concept building and olympiad preparation." },
      { title: "Class 9", desc: "Pre-board foundation and concept clarity." },
      { title: "Class 10", desc: "Board exam excellence and career counseling." }
    ],
    Commerce: [
      { title: "Class 11 (Commerce)", desc: "Introduction to core commerce concepts." },
      { title: "Class 12 (Commerce)", desc: "Expert coaching for top board results." }
    ],
    Professional: [
      { title: "B.Com", desc: "Undergraduate commerce coaching." },
      { title: "CA Foundation", desc: "Top-tier coaching for Chartered Accountancy." },
      { title: "CMA Foundation", desc: "Cost and Management Accountancy preparation." },
      { title: "CS Foundation", desc: "Company Secretary foundation course." }
    ]
  };

  const displayCourses = useMemo(() => {
    if (dbCourses.length === 0) return defaultCourses;
    
    const grouped = { School: [], Commerce: [], Professional: [] };
    dbCourses.forEach(c => {
      const item = {
        title: c.title,
        desc: c.description,
        price: c.price,
        syllabus: c.syllabus || []
      };
      
      const aud = c.targetAudience;
      if (aud === "Class 7 to 10") {
        grouped.School.push(item);
      } else if (aud === "Class 11 to 12 Commerce") {
        grouped.Commerce.push(item);
      } else {
        grouped.Professional.push(item);
      }
    });

    return {
      School: grouped.School.length > 0 ? grouped.School : defaultCourses.School,
      Commerce: grouped.Commerce.length > 0 ? grouped.Commerce : defaultCourses.Commerce,
      Professional: grouped.Professional.length > 0 ? grouped.Professional : defaultCourses.Professional
    };
  }, [dbCourses]);

  const defaultAchievers = [
    { name: 'Pariniti', score: '91.2%', course: 'Class 12 Boards', year: '2025', imageUrl: '/achievers/pariniti.png' },
    { name: 'Kishore', score: '89.8%', course: 'Class 12 Boards', year: '2025', imageUrl: '/achievers/kishore.png' },
    { name: 'Rinki', score: '89%', course: 'Class 12 Boards', year: '2025', imageUrl: '/achievers/rinki.png' },
    { name: 'Subhadra', score: '87.4%', course: 'Class 12 Boards', year: '2025', imageUrl: '/achievers/subhadra.png' },
    { name: 'Uday', score: '85.4%', course: 'Class 12 Boards', year: '2025', imageUrl: '/achievers/uday.png' }
  ];

  const displayAchievers = dbAchievers.length > 0 ? dbAchievers : defaultAchievers;

  return (
    <main className="min-h-screen bg-white text-[var(--color-text)] font-[family-name:var(--font-mulish)] overflow-x-hidden pt-[75px] lg:pt-[80px]">

      {/* Announcements Ticker */}
      {announcements.length > 0 && (
        <div className="bg-[#1A3B70] text-white py-2 px-4 overflow-hidden">
          <div className="flex items-center gap-4 max-w-7xl mx-auto">
            <span className="bg-[#FFCC00] text-[#1A3B70] text-xs font-black px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0">📢 NOTICE</span>
            <div className="overflow-hidden flex-1">
              <div className="flex gap-12 animate-marquee whitespace-nowrap">
                {[...announcements, ...announcements].map((a, i) => (
                  <span key={i} className="text-sm font-medium">
                    {a.isImportant && <span className="text-[#FFCC00] font-bold mr-1">🚨</span>}
                    {a.title}: {a.body}
                    <span className="mx-6 text-white/30">|</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Top Navbar with Glassmorphism */}
      <Header />

      {/* Redesigned Hero Section - Split Layout */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50/30 pt-8 pb-12 md:py-20">
        {/* Decorative background blobs */}
        <div className="absolute top-20 right-[-100px] w-[350px] h-[350px] rounded-full bg-[#00AEEF]/5 blur-[80px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-10 left-[-100px] w-[300px] h-[300px] rounded-full bg-blue-400/5 blur-[70px] -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Typography, Badges, CTAs, and Metrics */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8">
            {/* Admissions Open badge */}
            <div className="inline-flex items-center gap-2 bg-[#E6F4FE] border border-[#00AEEF]/30 rounded-full px-4 py-1.5 shadow-sm text-xs md:text-sm font-bold text-[#00AEEF] uppercase tracking-wider animate-pulse-soft">
              <span className="w-2.5 h-2.5 bg-[#8CC63F] rounded-full inline-block animate-ping"></span>
              🎓 Admissions Open for Session 2026-27
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-[#1A3B70] leading-[1.1] tracking-tight">
              Shaping Future <br className="hidden md:inline" />
              Leaders of <span className="bg-gradient-to-r from-[#00AEEF] to-[#1A3B70] bg-clip-text text-transparent">Tomorrow</span>
            </h1>

            {/* Subtext */}
            <p className="text-gray-650 text-base md:text-lg leading-relaxed max-w-xl font-medium">
              Commerce Gyan in Katrasgarh is the premier coaching institute offering expert conceptual preparation for school, boards, and professional programs like CA, CMA, and CS. 
            </p>

            {/* Core Trust Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg pt-2">
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:scale-102 transition-transform duration-200">
                <div className="w-10 h-10 rounded-lg bg-[#E6F4FE] text-[#00AEEF] flex items-center justify-center font-bold text-xl">🏆</div>
                <div>
                  <h4 className="font-extrabold text-[#1A3B70] text-[15px] leading-tight">98.2% Board Pass Rate</h4>
                  <p className="text-[12px] text-gray-500 font-medium">Consistent toppers</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:scale-102 transition-transform duration-200">
                <div className="w-10 h-10 rounded-lg bg-[#FFFBEB] text-[#FFCC00] flex items-center justify-center font-bold text-xl">🎓</div>
                <div>
                  <h4 className="font-extrabold text-[#1A3B70] text-[15px] leading-tight">150+ CA & Board Toppers</h4>
                  <p className="text-[12px] text-gray-500 font-medium">Mentored by expert faculty</p>
                </div>
              </div>
            </div>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/signup">
                <button className="w-full sm:w-auto bg-[#FFCC00] text-[#1A3B70] font-black text-[16px] px-8 py-4 rounded-xl shadow-lg shadow-amber-400/20 hover:bg-[#FFD633] hover:shadow-xl hover:shadow-amber-400/30 transition-all duration-300 active:scale-98 flex items-center justify-center gap-2 cursor-pointer">
                  <span>Enroll Now</span>
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </Link>
              <Link href="/admission">
                <button className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-bold text-[16px] px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 active:scale-98 flex items-center justify-center gap-2 cursor-pointer">
                  <span>Book Free Counselling</span>
                  <svg className="w-4.5 h-4.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                </button>
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Slider & Floating Cards */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-200 aspect-[4/3] lg:aspect-square group">
              {/* Slides */}
              <div className="flex transition-transform duration-500 ease-in-out h-full" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {heroSlides.map((slide, idx) => (
                  <div key={idx} className="min-w-full h-full relative">
                    <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                    {/* Shadow overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                    
                    {/* Slide Caption (Visual indicator overlay) - Right Aligned on Mobile to prevent card overlaps */}
                    <div className="absolute bottom-4 right-4 left-auto md:left-6 md:right-6 flex flex-col items-end md:items-start text-right md:text-left space-y-0.5 md:space-y-1 z-10">
                      <p className="text-[#FFCC00] text-[10px] md:text-xs font-extrabold uppercase tracking-widest">{slide.subtitle}</p>
                      <h3 className="text-sm md:text-xl font-bold leading-tight text-white">{slide.title} {slide.highlight}</h3>
                    </div>
                  </div>
                ))}
              </div>

              {/* Slider Arrows */}
              <button 
                onClick={() => setCurrentSlide(prev => prev === 0 ? heroSlides.length - 1 : prev - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white transition-colors cursor-pointer active:scale-90 z-20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <button 
                onClick={() => setCurrentSlide(prev => prev === heroSlides.length - 1 ? 0 : prev + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white transition-colors cursor-pointer active:scale-90 z-20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
              </button>

              {/* Slide Dots - Positioned Top-Left on Mobile to avoid overlapping cards & captions */}
              <div className="absolute top-4 left-4 md:bottom-6 md:right-6 md:top-auto md:left-auto flex gap-1.5 z-20">
                {heroSlides.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-3.5 h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'bg-[#FFCC00] w-6' : 'bg-white/50'}`}
                  ></button>
                ))}
              </div>
            </div>

            {/* Floating Card 1: Top Performing Students (Evergreen achievement card, 10-15% reduced on desktop, compact on mobile) */}
            <div 
              className="absolute bottom-4 left-2 lg:bottom-12 lg:left-8 flex items-center gap-2.5 lg:gap-3 rounded-[16px] lg:rounded-[20px] animate-float z-30 w-[190px] h-[52px] lg:w-[240px] lg:h-[68px] px-2.5 lg:px-4 py-2 lg:py-3.5"
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 30px rgba(15, 23, 42, 0.08)'
              }}
            >
              <div className="w-7 h-7 lg:w-9 lg:h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm lg:text-lg shadow-inner">🏆</div>
              <div>
                <h4 className="font-extrabold text-[#1A3B70] text-[11px] lg:text-[12.5px] leading-tight">Top Performing Students</h4>
                <p className="text-[9px] lg:text-[10.5px] text-gray-500 font-medium leading-tight mt-0.5">Consistent Academic Excellence</p>
              </div>
            </div>

            {/* Floating Card 2: CA Foundation Prep (10-15% reduced on desktop, compact on mobile) */}
            <div 
              className="absolute top-4 right-2 lg:top-16 lg:right-8 flex items-center gap-2.5 lg:gap-3 rounded-[16px] lg:rounded-[20px] animate-float z-30 [animation-delay:2s] w-[190px] h-[52px] lg:w-[230px] lg:h-[64px] px-2.5 lg:px-3.5 py-2 lg:py-3"
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 30px rgba(15, 23, 42, 0.08)'
              }}
            >
              <div className="w-7 h-7 lg:w-9 lg:h-9 rounded-full bg-amber-100 flex items-center justify-center text-sm lg:text-lg">🔥</div>
              <div>
                <h4 className="font-extrabold text-[#1A3B70] text-[11px] lg:text-[12.5px] leading-tight">CA Foundation Prep</h4>
                <p className="text-[9px] lg:text-[10.5px] text-gray-500 font-medium leading-tight mt-0.5">New Batches Open</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Redesigned Statistics Section */}
      <section className="bg-white py-12 border-b border-gray-55">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Students Trained', val: '5,000+', icon: '👨‍🎓', desc: 'Over the last 7 years', gradient: 'from-blue-50 to-indigo-50/20' },
              { label: 'Years Experience', val: '7+', icon: '⌛', desc: 'Teaching excellence', gradient: 'from-amber-50 to-orange-50/20' },
              { label: 'Success Rate', val: '98.2%', icon: '📈', desc: 'Board & CA clearance', gradient: 'from-green-50 to-emerald-50/20' },
              { label: 'Top Performers', val: '150+', icon: '🏆', desc: 'District toppers', gradient: 'from-rose-50 to-red-50/20' },
            ].map((stat, i) => (
              <div key={i} className={`bg-gradient-to-tr ${stat.gradient} rounded-2xl p-6 border border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.01)] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(0,0,0,0.03)] transition-all duration-300 text-center relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl -z-10 group-hover:scale-120 transition-transform"></div>
                <div className="text-3xl mb-2 inline-block scale-100 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-black text-[#1A3B70] tracking-tight">{stat.val}</div>
                <div className="font-extrabold text-gray-700 text-sm mt-1">{stat.label}</div>
                <div className="text-[11px] text-gray-400 font-medium mt-1">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Select your goal Section */}
      <section className="py-10 lg:py-20 bg-gradient-to-b from-white to-[#F4F9FF]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-block bg-[#E6F4FE] text-[#00AEEF] px-4 py-1.5 rounded-full font-extrabold text-xs uppercase tracking-wider mb-3">
            Our Offerings
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#1A3B70] mb-4">
            Select Your Goal
          </h2>
          <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto mb-12 font-medium">
            Explore curated courses designed specifically to help you excel in school academics, board exams, and competitive professional certifications.
          </p>
          
          <div className="flex justify-center gap-6 md:gap-8 max-w-4xl mx-auto flex-wrap">
            {[
              { icon: (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              ), label: 'School' },
              { icon: (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"></path>
                </svg>
              ), label: 'Commerce' },
              { icon: (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"></path>
                </svg>
              ), label: 'Professional' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setActiveCourseTab(item.label);
                  document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex flex-col items-center justify-center p-6 w-36 h-36 rounded-2xl border transition-all duration-300 cursor-pointer active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.02)] ${
                  activeCourseTab === item.label 
                    ? 'border-[#00AEEF] bg-white text-[#00AEEF] shadow-[0_10px_25px_rgba(0,174,239,0.12)] font-black' 
                    : 'border-gray-100 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <div className={`mb-3 transition-transform duration-300 ${activeCourseTab === item.label ? 'scale-110' : ''}`}>
                  {item.icon}
                </div>
                <span className="text-sm font-bold">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Redesigned Mentor Section */}
      <section className="bg-gradient-to-r from-[#1A3B70] to-[#122A50] py-10 lg:py-20 text-white overflow-hidden relative border-t border-white/5">
        {/* Subtle backdrop shapes */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00AEEF]/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Teacher Image Container with floating stats */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-[360px] aspect-[4/5] rounded-[2rem] overflow-hidden border-4 border-white/20 shadow-2xl bg-slate-900 group">
                <img
                  src="/teacher.png"
                  alt="Tabarak Sir — Lead Mentor"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#122A50]/90 via-transparent to-transparent"></div>
                {/* Floating name tag */}
                <div className="absolute bottom-5 left-5 right-5 text-center">
                  <div className="inline-block bg-[#FFCC00] text-[#1A3B70] px-4 py-2 rounded-full font-black text-sm shadow-xl">
                    ⭐ TABARAK SIR
                  </div>
                  <p className="text-xs text-white/80 font-bold mt-1.5 uppercase tracking-wide">Founder &amp; Lead Mentor</p>
                </div>
              </div>

              {/* Float badge experience */}
              <div className="absolute top-6 left-[-10px] bg-[#8CC63F] text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-lg animate-float">
                🎓 7+ Years Excellence
              </div>
            </div>

            {/* Right Column: Profile Info & Values */}
            <div className="lg:col-span-7 space-y-6 md:space-y-8">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3.5 py-1 text-xs font-bold text-[#FFCC00] border border-white/5 uppercase tracking-wide">
                  <span>💡</span> Visionary Mentorship
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                  Learn from the <span className="text-[#00AEEF]">Region's Best</span>
                </h2>
                <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-xl font-medium">
                  We believe that commerce education requires deep conceptual clarity, not rote memorization. Tabarak Sir and our support mentors provide personalized guidance to unlock your potential.
                </p>
              </div>

              {/* Interactive credentials checklist */}
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: "NET Qualified", desc: "National Eligibility Test certified", bg: "bg-white/5" },
                  { title: "M.Com (Master of Commerce)", desc: "Core commerce expertise", bg: "bg-white/5" },
                  { title: "B.Ed (Bachelor of Education)", desc: "Trained educational pedagogy", bg: "bg-white/5" },
                  { title: "CMA (Inter Level) Cleared", desc: "Professional corporate coaching standard", bg: "bg-white/5" }
                ].map((cred, i) => (
                  <div key={i} className={`${cred.bg} rounded-xl p-4 border border-white/10 flex gap-3.5 hover:bg-white/10 transition-colors`}>
                    <span className="text-[#8CC63F] text-lg font-bold">✓</span>
                    <div>
                      <h4 className="font-extrabold text-white text-sm">{cred.title}</h4>
                      <p className="text-white/60 text-[11px] font-medium mt-0.5">{cred.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Personal Quote */}
              <div className="border-l-4 border-[#00AEEF] pl-4 italic text-white/80 text-sm md:text-base leading-relaxed max-w-xl font-medium">
                "Our small batch sizes and weekly test series ensure that no student gets left behind. We prepare you not just to clear boards, but to lead CA and CMA certifications globally."
              </div>

              <div className="flex flex-wrap gap-4 items-center pt-2">
                <Link href="/signup">
                  <button className="bg-[#FFCC00] hover:bg-[#FFD633] text-[#1A3B70] font-black text-sm px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer active:scale-95">
                    Register for Free Demo Class →
                  </button>
                </Link>
                <div className="text-xs text-white/50 font-bold uppercase tracking-wider">
                  Class 7-12 | B.Com | CA | CMA | CS
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      
      {/* Detailed Course Grid Section */}
      <section id="programs" className="py-12 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-block bg-[#E6F4FE] text-[#00AEEF] px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider">
              Course Structure
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-[#1A3B70]">Detailed Course Overview</h2>
            <p className="text-gray-550 text-sm font-medium">Explore specific batch syllabus coverage, affordable pricing models, and key learning outcomes for our programs.</p>
          </div>
          
          {/* Modern tab pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {Object.keys(displayCourses).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCourseTab(tab)}
                className={`py-3 px-8 rounded-xl font-bold text-sm md:text-base transition-all duration-300 active:scale-95 cursor-pointer ${
                  activeCourseTab === tab 
                    ? "bg-[#1A3B70] text-white shadow-lg shadow-blue-900/10" 
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                {tab === "School" ? "School Academics" : tab === "Commerce" ? "Commerce Boards" : "Professional Foundation"}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayCourses[activeCourseTab].map((course, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 lg:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(0,174,239,0.1)] hover:border-[#00AEEF]/50 transition-all duration-300 border border-gray-100 flex flex-col h-full justify-between group">
                 <div>
                   {/* Top Header Card Info */}
                   <div className="flex items-start justify-between mb-2.5 lg:mb-4">
                     <span className="inline-block bg-[#E6F4FE] text-[#00AEEF] px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wide">
                       {activeCourseTab === "School" ? "Boards Focus" : activeCourseTab === "Commerce" ? "High Scoring" : "Career Track"}
                     </span>
                     <div className="text-gray-300 group-hover:text-[#00AEEF] transition-colors">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                       </svg>
                     </div>
                   </div>

                   <h3 className="text-base lg:text-lg font-extrabold text-[#1A3B70] mb-1.5 lg:mb-2 group-hover:text-[#00AEEF] transition-colors">{course.title}</h3>
                   
                   {course.price ? (
                     <div className="flex items-baseline gap-1.5 mb-3 lg:mb-4">
                       <span className="text-lg lg:text-xl font-black text-[#00AEEF]">₹{Number(course.price).toLocaleString()}</span>
                       <span className="text-gray-400 text-[10px] font-bold uppercase">One-time / Monthly</span>
                     </div>
                   ) : (
                     <div className="flex items-baseline gap-1.5 mb-3 lg:mb-4">
                       <span className="text-sm font-extrabold text-amber-500 uppercase">Enquire for fees</span>
                     </div>
                   )}
                   
                   <p className="text-xs text-gray-500 mb-3 lg:mb-4 leading-relaxed font-semibold">{course.desc}</p>
                   
                   {course.syllabus && course.syllabus.length > 0 ? (
                     <div className="mb-3 lg:mb-4 pt-2 lg:pt-3 border-t border-gray-50">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-2">Key Areas Covered</p>
                       <div className="flex flex-wrap gap-1.5">
                         {course.syllabus.slice(0, 3).map((s, i) => (
                           <span key={i} className="inline-block bg-slate-50 text-slate-650 px-2 py-0.5 rounded text-[10px] font-bold truncate max-w-full">
                             {s}
                           </span>
                         ))}
                       </div>
                     </div>
                   ) : (
                     <div className="mb-3 lg:mb-4 pt-2 lg:pt-3 border-t border-gray-50">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-2">Inclusions</p>
                       <div className="flex flex-wrap gap-1.5">
                         <span className="inline-block bg-slate-50 text-slate-650 px-2 py-0.5 rounded text-[10px] font-bold font-medium">Concept Lectures</span>
                         <span className="inline-block bg-slate-50 text-slate-655 px-2 py-0.5 rounded text-[10px] font-bold font-medium">Weekly Tests</span>
                       </div>
                     </div>
                   )}
                 </div>
                 
                 <div className="flex gap-2 pt-3 lg:block lg:space-y-2 lg:pt-4">
                   <Link href="/signup" className="flex-1 lg:block lg:w-full">
                     <button className="w-full py-2 lg:py-2.5 bg-[#1A3B70] hover:bg-[#122A50] text-white rounded-lg lg:rounded-xl font-bold transition-all text-[11px] lg:text-xs cursor-pointer shadow-md group-hover:shadow-lg">
                       <span className="inline lg:hidden">Enroll</span>
                       <span className="hidden lg:inline">Enroll in Batch</span>
                     </button>
                   </Link>
                   <Link href="/admission" className="flex-1 lg:block lg:w-full">
                     <button className="w-full py-2 lg:py-2.5 border border-gray-200 text-gray-655 rounded-lg lg:rounded-xl font-bold hover:bg-gray-50 transition-colors text-[11px] lg:text-xs cursor-pointer">
                       <span className="inline lg:hidden">Syllabus</span>
                       <span className="hidden lg:inline">Syllabus &amp; Schedule</span>
                     </button>
                   </Link>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Facilities Section */}
      <section id="facilities" className="py-10 lg:py-20 bg-[#FAFAFA] border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[36px] font-bold text-[#1A3B70] mb-4">Why Commerce Gyan?</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { icon: '📄', title: 'PDF Notes' },
              { icon: '📝', title: 'Weekly Test Series' },
              { icon: '👨‍🏫', title: 'Concept Based Teaching' },
              { icon: '❓', title: 'Doubt Clearing' },
              { icon: '👥', title: 'Small Batch Size' },
              { icon: '🏆', title: 'Result Oriented' },
            ].map((facility, idx) => (
              <div key={idx} className="bg-white rounded-[20px] p-6 text-center hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(0,174,239,0.12)] transition-all duration-300 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] cursor-pointer group">
                <div className="w-14 h-14 mx-auto bg-[#E6F4FE] rounded-full flex items-center justify-center text-2xl mb-4 group-hover:bg-[#1A3B70] transition-colors duration-300">
                  {facility.icon}
                </div>
                <h4 className="font-bold text-[#1A3B70] text-[14px] leading-snug">{facility.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Redesigned Achievers Section (Hall of Fame) */}
      <section id="results" className="py-12 lg:py-24 bg-gradient-to-b from-[#1A3B70] to-[#0f172a] text-white overflow-hidden relative">
        <div className="absolute top-10 left-[-150px] w-96 h-96 bg-[#00AEEF]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-[-150px] w-96 h-96 bg-[#8CC63F]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-block bg-white/10 text-[#FFCC00] border border-white/10 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider">
              Student Triumphs
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white">Our Hall of Fame</h2>
            <p className="text-white/60 text-sm font-medium">We celebrate the hard work and academic brilliance of our students who consistently top district and board examinations.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
            {displayAchievers.map((achiever, idx) => {
              const scoreNum = parseFloat(achiever.score);
              const isTopper = !isNaN(scoreNum) && scoreNum >= 90;
              const studentImg = achiever.imageUrl || (achiever.name ? `/achievers/${achiever.name.toLowerCase()}.png` : '/logo.png');
              return (
                <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-2.5 md:p-6 text-center shadow-xl hover:-translate-y-1.5 hover:bg-white/10 hover:border-[#00AEEF]/40 transition-all duration-300 relative group flex flex-col justify-between h-full w-full">
                  {isTopper && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FFCC00] text-[#1A3B70] text-[7px] md:text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-md whitespace-nowrap z-10">
                      👑 TOPPER
                    </div>
                  )}

                  <div>
                    {/* Centered Image with explicit dimensions to prevent Layout Shift */}
                    <div className="w-12 h-12 md:w-24 md:h-24 mx-auto rounded-full border-2 border-white/20 overflow-hidden flex items-center justify-center mb-2 md:mb-4 relative shadow-inner bg-white/10">
                      <img 
                        src={studentImg} 
                        alt={achiever.name} 
                        width={96}
                        height={96}
                        loading="lazy"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const initialsDiv = e.target.nextSibling;
                          if (initialsDiv) {
                            initialsDiv.style.setProperty('display', 'flex', 'important');
                          }
                        }}
                      />
                      <div className="hidden absolute inset-0 w-full h-full bg-[#E6F4FE] text-[#1A3B70] flex items-center justify-center text-xl md:text-3xl font-black">
                        {achiever.name ? achiever.name.charAt(0).toUpperCase() : 'S'}
                      </div>
                    </div>

                    <h3 className="font-extrabold text-white text-xs md:text-base group-hover:text-[#00AEEF] transition-colors line-clamp-1">{achiever.name}</h3>
                    <p className="text-[#00AEEF] text-[8px] md:text-xs font-bold uppercase mt-0.5 tracking-wider line-clamp-1">{achiever.course || achiever.stream || "Commerce Boards"}</p>
                  </div>
                  
                  <div className="mt-2 md:mt-4 pt-1.5 md:pt-3 border-t border-white/5">
                    <span className="text-base md:text-2xl font-black text-[#FFCC00] tracking-tight">{achiever.score}</span>
                    {achiever.year && (
                      <span className="block text-[7px] md:text-[9px] text-white/40 font-bold mt-0.5 uppercase">Class of {achiever.year}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-24 bg-gradient-to-b from-[#F4F9FF] to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-block bg-[#E6F4FE] text-[#00AEEF] px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider">
              Success Stories
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-[#1A3B70]">What Parents &amp; Students Say</h2>
            <p className="text-gray-500 text-sm font-medium">Real reviews from the family of students who achieved success through conceptual mentoring.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Tabarak Sir's attention to conceptual clarity is unmatched. My daughter scored 91.2% in her boards and got selected for CA Foundation prep! Truly the best coaching in Katras.",
                author: "Parent of Pariniti",
                badge: "91.2% Boards Parent",
                initials: "PP"
              },
              {
                quote: "The weekly test series helped me manage exam pressure. The doubts desk is active 24/7. Highly recommend Commerce Gyan for professional CA/CMA preparation!",
                author: "Kishore Kumar",
                badge: "CA Foundation Student",
                initials: "KK"
              },
              {
                quote: "Commerce Gyan provides professional printed study materials and clear doubt-clearing sessions. Small batch sizes make a huge difference in learning speed.",
                author: "Rinki Kumari",
                badge: "89% Class 12 Boards",
                initials: "RK"
              }
            ].map((t, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:shadow-[0_10px_35px_rgba(0,174,239,0.06)] hover:border-[#00AEEF]/30 transition-all duration-300">
                <div className="space-y-4">
                  {/* Rating Stars */}
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-gray-650 text-sm leading-relaxed italic font-medium">"{t.quote}"</p>
                </div>
                <div className="flex items-center gap-4 pt-6 mt-6 border-t border-gray-50">
                  <div className="w-10 h-10 rounded-full bg-[#E6F4FE] text-[#00AEEF] flex items-center justify-center font-black text-sm">
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#1A3B70] text-sm">{t.author}</h4>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.badge}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-12 lg:py-24 bg-white border-t border-gray-50 relative overflow-hidden">
        {/* Subtle backdrop glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00AEEF]/3 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-block bg-[#E6F4FE] text-[#00AEEF] px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-wider animate-pulse-soft">
              📸 REAL CLASSROOM MOMENTS
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-[#1A3B70]">Life at Commerce Gyan</h2>
            <p className="text-gray-550 text-sm md:text-base font-medium">Take a glimpse into our classroom activities, student celebrations, mentoring sessions, and memorable achievements.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Student Celebrations",
                desc: "Celebrating achievements and special occasions together.",
                img: "/learningEnvironment/image1.jpeg"
              },
              {
                title: "Academic Community",
                desc: "Building confidence through mentorship and teamwork.",
                img: "/learningEnvironment/image2.jpeg"
              },
              {
                title: "Student Recognition",
                desc: "Encouraging excellence through appreciation and rewards.",
                img: "/learningEnvironment/image3.jpeg"
              },
              {
                title: "Interactive Learning",
                desc: "Friendly learning environment with personal guidance.",
                img: "/learningEnvironment/image4.jpeg"
              }
            ].map((g, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden h-[260px] lg:h-[280px] shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-end bg-slate-900">
                {/* Image background with explicit layout size to prevent CLS */}
                <img 
                  src={g.img} 
                  alt={g.title} 
                  width={400}
                  height={280}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" 
                  onError={(e) => {
                    // Fail-safe fallback to image1 if image4 or any other image is missing
                    e.target.src = '/learningEnvironment/image1.jpeg';
                  }}
                />
                
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5 z-10 transition-opacity duration-300"></div>
                
                {/* Text Content */}
                <div className="p-5 relative z-20 text-white space-y-1.5">
                  <h4 className="font-extrabold text-base tracking-tight leading-tight">{g.title}</h4>
                  <p className="text-[11px] text-white/80 font-medium leading-snug">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-12 lg:py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <div className="inline-block bg-[#E6F4FE] text-[#00AEEF] px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider">
              Queries Resolved
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-[#1A3B70]">Frequently Asked Questions</h2>
            <p className="text-gray-500 text-sm font-medium">Have questions about admissions, syllabus, or mock exams? Read below.</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What subjects and courses are covered?",
                a: "We cover School Academics (Class 7 to 10 science/maths/social), Commerce Boards (Class 11 & 12 Accountancy, Business Studies, Economics), B.Com, and professional certification prep for CA Foundation, CMA, and CS exams."
              },
              {
                q: "What is the typical batch size at Commerce Gyan?",
                a: "To ensure tabbed, individual attention from Tabarak Sir, we limit our batch sizes to 25-30 students. This guarantees personalized guidance during doubt sessions."
              },
              {
                q: "How often are student evaluation tests conducted?",
                a: "We run Weekly Chapter-wise Tests to assess continuous progress, along with structured Full-Syllabus Mock Exams designed strictly on board patterns before finals."
              },
              {
                q: "Is standard study material provided?",
                a: "Yes, all students receive printed topic-wise theory summaries, formula lists, practice books, weekly mock papers, and digital PDF notes."
              },
              {
                q: "Where is the coaching center located?",
                a: "Commerce Gyan is centrally located behind Rajasthani Dharamshala in Katrasgarh. You are welcome to visit our counseling desk for details."
              }
            ].map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full py-5 px-6 flex items-center justify-between font-bold text-[#1A3B70] text-left hover:text-[#00AEEF] transition-colors cursor-pointer text-sm md:text-base"
                  >
                    <span>{faq.q}</span>
                    <span className={`text-lg transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#00AEEF]' : 'text-gray-400'}`}>
                      ▼
                    </span>
                  </button>
                  <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
                    <div className="px-6 pb-6 pt-1 text-gray-505 font-medium leading-relaxed text-xs md:text-sm border-t border-gray-50">
                      {faq.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Floating WhatsApp Button */}
      <WhatsAppButton />
    </main>
  );
}
