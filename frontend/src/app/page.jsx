"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import WhatsAppButton from "../components/WhatsAppButton";
import API from "@/lib/api";

export default function Home() {
  const [activeCourseTab, setActiveCourseTab] = useState("School");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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
    { name: 'Pariniti', score: '91.2%' },
    { name: 'Kishore', score: '89.8%' },
    { name: 'Rinki', score: '89%' },
    { name: 'Subhadra', score: '87.4%' },
    { name: 'Uday', score: '85.4%' }
  ];

  const displayAchievers = dbAchievers.length > 0 ? dbAchievers : defaultAchievers;

  return (
    <main className="min-h-screen bg-white text-[var(--color-text)] font-[family-name:var(--font-mulish)]">

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
      
      {/* Top Navbar matching screenshot */}
      <nav className="sticky top-0 w-full z-50 bg-white border-b border-gray-100 shadow-sm flex items-center justify-between px-6 h-[80px]">
        {/* Left Logo */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="Commerce Gyan Logo" 
              width={220} 
              height={60} 
              className="object-contain max-h-[60px] w-auto"
              priority
            />
          </Link>
        </div>

        {/* Center Menus (Shifted Left) */}
        <div className="hidden lg:flex items-center gap-8 font-bold text-[14px] text-[#2D2D2D] flex-1 ml-16">
          <Link href="#programs" className="flex items-center gap-1 hover:text-[#00AEEF]">
            Courses 
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </Link>
          <Link href="#results" className="flex items-center gap-1 hover:text-[#00AEEF]">
            Results
            <span className="bg-[#8CC63F] text-white text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider relative -top-2">New</span>
          </Link>
          <Link href="#blogs" className="hover:text-[#00AEEF]">Blogs</Link>
          <Link href="#careers" className="hover:text-[#00AEEF]">Careers</Link>
          <Link href="/contact" className="hover:text-[#00AEEF]">Contact Us</Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 mr-2">
            <div className="w-10 h-10 bg-[#E6F4FE] rounded-full flex items-center justify-center text-[#00AEEF]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
            </div>
            <div>
              <p className="text-[12px] text-gray-600 font-medium leading-tight">Call now</p>
              <p className="text-[14px] font-semibold text-[#2D2D2D] leading-tight mt-0.5">8271365450</p>
            </div>
          </div>
          
          <div className="w-10 h-10 bg-[#E6F4FE] rounded-full hidden md:flex items-center justify-center text-[#1A3B70] cursor-pointer hover:bg-[#D0EBFC] transition-colors border border-[#00AEEF]/20">
            <svg className="w-5 h-5 text-[#1A3B70]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </div>

          {/* Profile with Dropdown */}
          <div className="relative ml-1">
            <div 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 bg-[#E6F4FE] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#D0EBFC] transition-colors border border-[#00AEEF]/20"
            >
              <svg className="w-5 h-5 text-[#1A3B70]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-40 bg-white rounded shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-gray-200 overflow-hidden z-50">
                <div className="flex flex-col">
                  <Link href="/login" className="px-5 py-3 text-[14px] text-gray-700 hover:bg-gray-50 transition-colors">
                    Login
                  </Link>
                  <Link href="/signup" className="px-5 py-3 text-[14px] text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100">
                    Signup
                  </Link>
                  <Link href="#" className="px-5 py-3 text-[14px] text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100">
                    Pay due fees
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Slider Section matching screenshot */}
      <section className="relative w-full bg-white py-6">
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="relative w-full overflow-hidden bg-[#00AEEF] min-h-[450px]">
            
            {/* The 3 Slides */}
            <div className="flex transition-transform duration-500 ease-in-out h-full" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {heroSlides.map((slide, idx) => (
                <div key={idx} className="min-w-full grid md:grid-cols-2 items-center relative">
                  
                  {/* Left Text Content */}
                  <div className="pl-12 pr-6 py-16 md:py-24 relative z-10">
                     <div className="inline-block bg-[#FFCC00] text-[#1A3B70] px-4 py-1.5 font-bold text-[18px] mb-4">
                       {slide.subtitle}
                     </div>
                     <h1 className="text-[44px] md:text-[56px] font-black leading-[1.1] text-white mb-8">
                       {slide.title} <br/>
                       <span className="text-[#FFCC00]">{slide.highlight}</span>
                     </h1>
                     <button className="bg-[#FFCC00] text-[#1A3B70] font-bold text-[18px] px-8 py-3.5 rounded-lg shadow-md hover:bg-[#FFD633] transition-colors">
                       {slide.btnText}
                     </button>
                  </div>

                  {/* Right Image Placeholder */}
                  <div className="absolute inset-0 md:relative h-full w-full -z-10 md:z-0">
                     {/* Gradient overlay for mobile readability */}
                    <div className="absolute inset-0 bg-[#00AEEF]/80 md:hidden"></div>
                    <img src={slide.image} alt="Slider image" className="w-full h-full object-cover object-right md:object-center" />
                  </div>
                </div>
              ))}
            </div>

            {/* Slider Controls */}
            <div 
              onClick={() => setCurrentSlide(prev => prev === 0 ? heroSlides.length - 1 : prev - 1)}
              className="absolute top-1/2 -translate-y-1/2 left-2 w-10 h-14 bg-black/20 rounded-md flex items-center justify-center text-white cursor-pointer hover:bg-black/40 z-20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </div>
            <div 
              onClick={() => setCurrentSlide(prev => prev === heroSlides.length - 1 ? 0 : prev + 1)}
              className="absolute top-1/2 -translate-y-1/2 right-2 w-10 h-14 bg-black/20 rounded-md flex items-center justify-center text-white cursor-pointer hover:bg-black/40 z-20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </div>

            {/* Bottom Dark Blue Wave Bar */}
            <div className="absolute bottom-0 left-0 w-full z-20">
              <div className="relative w-full h-[60px] md:h-[80px] bg-[#122A50] flex items-center justify-center">
                 {/* Simulated wave shape on left */}
                 <div className="absolute left-[10%] -top-[20px] md:-top-[30px] w-[40px] h-[40px] md:w-[60px] md:h-[60px] bg-[#122A50] rounded-full">
                    <div className="absolute -top-[10px] md:-top-[15px] left-1/2 -translate-x-1/2 w-3 h-3 md:w-4 md:h-4 bg-[#122A50] rounded-full"></div>
                 </div>
                 
                 {/* Slider Dots */}
                 <div className="flex gap-2 relative z-10 pt-2">
                   {heroSlides.map((_, idx) => (
                     <div 
                       key={idx} 
                       onClick={() => setCurrentSlide(idx)}
                       className={`w-6 md:w-8 h-1.5 rounded-full cursor-pointer transition-colors ${currentSlide === idx ? 'bg-[#FFCC00]' : 'bg-white/40'}`}
                     ></div>
                   ))}
                 </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Select your goal Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-[28px] md:text-[36px] font-bold text-[#2D2D2D] mb-12">
            Select your goal <span className="text-[#00AEEF]">to explore our courses</span>
          </h2>
          
          <div className="grid grid-cols-3 gap-4 max-w-[380px] md:max-w-none md:flex md:justify-center md:gap-10 mx-auto">
            {[
              { icon: '🎒', label: 'School' },
              { icon: '📊', label: 'Commerce' },
              { icon: '🎓', label: 'Professional' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center">
                <div 
                  onClick={() => setActiveCourseTab(item.label)}
                  className={`w-full aspect-square max-w-[110px] md:w-[140px] md:h-[140px] rounded-[20px] border shadow-[0_2px_10px_rgba(0,0,0,0.04)] flex items-center justify-center mb-3 relative group hover:border-[#00AEEF] hover:shadow-[0_4px_20px_rgba(0,174,239,0.15)] transition-all duration-300 cursor-pointer mx-auto ${activeCourseTab === item.label ? 'border-[#00AEEF] bg-[#E6F4FE]' : 'border-gray-200 bg-white'}`}
                >
                  <span className="text-5xl md:text-6xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                </div>
                <p className="font-bold text-[#2D2D2D] text-[14px] md:text-[18px]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Mentor / Admissions Section — Viewport-Fit Layout */}
      <section className="bg-white border-t border-gray-100 overflow-hidden" style={{ height: '78vh' }}>
        <div className="max-w-7xl mx-auto h-full">
          <div className="flex flex-col lg:flex-row h-full">

            {/* LEFT — Teacher Photo — auto-width column, zero gutters */}
            <div className="relative bg-[#1A3B70] flex-shrink-0 h-[45vw] lg:h-full w-full lg:w-auto">
              <img
                src="/teacher.png"
                alt="Tabarak Sir — Lead Mentor"
                className="h-full w-auto block"
              />
              {/* Name badge */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center z-10">
                <div className="inline-flex items-center gap-1.5 bg-[#FFCC00] text-[#1A3B70] px-3.5 py-1.5 rounded-full font-black text-[13px] shadow-lg">
                  <span>⭐</span> TABARAK SIR — Lead Mentor
                </div>
              </div>
            </div>

            {/* RIGHT — Info Panel */}
            <div className="flex-1 bg-[#F4F9FF] flex flex-col justify-center px-6 py-4 lg:px-10 overflow-y-auto min-w-0">
              <div className="inline-block px-3 py-1 rounded-full bg-[#E6F4FE] text-[#00AEEF] font-bold text-xs uppercase tracking-wide border border-[#B3E3FA] mb-2 self-start">
                🎓 Admissions Open 2026-27
              </div>

              <h2 className="text-[20px] md:text-[24px] font-black text-[#1A3B70] leading-tight mb-2">
                Learn From <br />
                <span className="text-[#00AEEF]">The Best</span>
              </h2>

              <p className="text-gray-600 leading-relaxed text-[13px] mb-2.5">
                We provide the most comprehensive syllabus coverage with weekly test series, PDF notes, and concept-based teaching in small batch sizes for maximum attention.
              </p>

              {/* Credential badges */}
              <div className="flex flex-col gap-1.5 mb-2.5">
                <div className="flex items-center gap-3 bg-white rounded-xl px-3.5 py-1.5 shadow-sm border border-gray-100">
                  <span className="w-6 h-6 rounded-full bg-[#E6F4FE] text-[#00AEEF] flex items-center justify-center font-black text-xs flex-shrink-0">✓</span>
                  <span className="text-gray-700 font-bold text-[13px]">NET Qualified &amp; M.Com</span>
                </div>
                <div className="flex items-center gap-3 bg-white rounded-xl px-3.5 py-1.5 shadow-sm border border-gray-100">
                  <span className="w-6 h-6 rounded-full bg-[#E6F4FE] text-[#00AEEF] flex items-center justify-center font-black text-xs flex-shrink-0">✓</span>
                  <span className="text-gray-700 font-bold text-[13px]">B.Ed &amp; CMA (Inter Level)</span>
                </div>
                <div className="flex items-center gap-3 bg-white rounded-xl px-3.5 py-1.5 shadow-sm border border-gray-100">
                  <span className="w-6 h-6 rounded-full bg-[#FFCC00] text-[#1A3B70] flex items-center justify-center font-black text-xs flex-shrink-0">★</span>
                  <span className="text-gray-700 font-bold text-[13px]">7+ Years Teaching Experience</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <p className="font-bold text-gray-400 uppercase tracking-wider text-xs mb-2">
                  Class 7 to 12 | B.Com | CA | CMA | CS
                </p>
                <Link href="/signup">
                  <button className="bg-[#1A3B70] text-white font-bold text-[13px] px-6 py-2 rounded-xl hover:bg-[#122A50] transition-colors shadow-md">
                    Enrol Now →
                  </button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>




      {/* Courses Mega-Menu Style Section (From previous design, integrated) */}
      <section id="programs" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-[36px] font-bold text-[#1A3B70] mb-4">Detailed Course Overview</h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {Object.keys(displayCourses).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveCourseTab(tab)}
                className={`py-3 px-10 rounded-full font-bold text-[18px] transition-all duration-300 ${
                  activeCourseTab === tab 
                    ? "bg-[#1A3B70] text-white shadow-md" 
                    : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-[#00AEEF]"
                }`}
              >
                {tab === "School" ? "School Classes" : tab === "Commerce" ? "Commerce Classes" : "Professional Courses"}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayCourses[activeCourseTab].map((course, idx) => (
              <div key={idx} className="bg-white rounded-[20px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow border border-gray-100 flex flex-col h-full justify-between">
                 <div>
                   <h3 className="text-[17px] font-black text-[#1A3B70] mb-2">{course.title}</h3>
                   {course.price && (
                     <div className="text-[14px] font-black text-[#00AEEF] mb-3">
                       ₹{Number(course.price).toLocaleString()}
                     </div>
                   )}
                   <p className="text-[13px] text-gray-500 mb-4 leading-relaxed font-medium">{course.desc}</p>
                   
                   {course.syllabus && course.syllabus.length > 0 && (
                     <div className="mb-4">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide mb-1">Topics Covered</p>
                       <ul className="text-xs text-gray-600 space-y-0.5 list-disc pl-4">
                         {course.syllabus.slice(0, 3).map((s, i) => (
                           <li key={i} className="truncate">{s}</li>
                         ))}
                       </ul>
                     </div>
                   )}
                 </div>
                 <button className="w-full py-2.5 border-2 border-[#1A3B70] text-[#1A3B70] rounded-xl font-bold hover:bg-[#1A3B70] hover:text-white transition-colors text-[13px] mt-4">
                   View Details
                 </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section id="facilities" className="py-20 bg-[#FAFAFA] border-t border-gray-100">
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

      {/* Achievers Section */}
      <section id="results" className="py-20 bg-[#1A3B70]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[36px] font-bold text-white mb-4">Our Achievers</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {displayAchievers.map((achiever, idx) => (
              <div key={idx} className="bg-white rounded-[20px] overflow-hidden w-44 text-center shadow-lg hover:scale-105 transition-transform duration-300 flex flex-col justify-between">
                <div>
                  <div className="h-32 bg-gray-100 flex items-center justify-center text-gray-300 border-b border-gray-100 overflow-hidden relative">
                    {achiever.imageUrl ? (
                      <img src={achiever.imageUrl} alt={achiever.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl">👤</span>
                    )}
                    {achiever.year && (
                      <span className="absolute top-2 right-2 bg-[#1A3B70] text-[#FFCC00] text-[9px] font-black px-1.5 py-0.5 rounded">
                        {achiever.year}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="font-bold text-[#1A3B70] text-[15px] mb-1 truncate">{achiever.name}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase truncate mb-2">{achiever.course || "Commerce"}</div>
                    <div className="text-[#00AEEF] font-black text-[22px]">{achiever.score}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer id="contact" className="bg-[#0D1E3A] text-white pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <h4 className="text-[24px] font-black mb-6 text-white tracking-tight">
              Commerce<span className="text-[#00AEEF]">Gyan</span>
            </h4>
            <p className="text-white/60 text-[14px] font-medium leading-relaxed mb-6">
              India's premier coaching institute for commerce and professional courses, dedicated to conceptual clarity and student success.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white text-[16px] mb-6">Quick Links</h4>
            <ul className="space-y-3 text-[14px] text-white/70 font-medium">
              <li><Link href="#" className="hover:text-[#00AEEF] transition-colors">About Us</Link></li>
              <li><Link href="#programs" className="hover:text-[#00AEEF] transition-colors">Courses</Link></li>
              <li><Link href="#results" className="hover:text-[#00AEEF] transition-colors">Results</Link></li>
              <li><Link href="#facilities" className="hover:text-[#00AEEF] transition-colors">Facilities</Link></li>
            </ul>
          </div>
          <div className="md:col-span-1">
             <h4 className="font-bold text-white text-[16px] mb-6">Contact Us</h4>
             <ul className="space-y-4 text-[14px] text-white/70 font-medium">
              <li className="flex items-start gap-3">
                <span className="text-[#00AEEF] text-base">📍</span>
                <span>Behind Rajasthani Dharamshala,<br/>Katrasgarh (Katras)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#00AEEF] text-base">📞</span>
                <span className="font-bold text-white">8271365450</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#00AEEF] text-base">✉️</span>
                <span>commerceGyan@gmail.com</span>
              </li>
            </ul>
          </div>
          <div>
            <div className="bg-[#122A50] p-6 rounded-[20px] border border-white/5 text-center">
               <h4 className="font-bold text-white text-[18px] mb-2">Ready to Start?</h4>
               <p className="text-white/70 text-[13px] font-medium mb-4">Book your free counseling session today.</p>
               <Link href="/admission" className="block w-full py-3 bg-[#00AEEF] text-white font-bold rounded-lg hover:bg-[#009CD6] transition-colors text-[14px] text-center">
                Enquire Now
              </Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-6 border-t border-white/10 text-center text-white/40 text-[13px] font-medium flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Commerce Gyan. All Rights Reserved.</p>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <WhatsAppButton />
    </main>
  );
}
