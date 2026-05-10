"use client";
import Link from "next/link";
import Image from "next/image";

export default function Contact() {
  return (
    <main className="min-h-screen bg-white flex flex-col font-[family-name:var(--font-mulish)]">
      
      {/* Simple Header */}
      <nav className="w-full bg-white border-b border-gray-100 shadow-sm py-4 px-6 flex justify-between items-center max-w-[1400px] mx-auto">
        <Link href="/" className="inline-block">
          <Image 
            src="/logo.png" 
            alt="Commerce Giyan Logo" 
            width={180} 
            height={50} 
            className="object-contain max-h-[50px] w-auto"
            priority
          />
        </Link>
        <Link href="/" className="text-[14px] font-bold text-gray-500 hover:text-[#00AEEF] transition-colors flex items-center gap-2">
          <span>←</span> Back to Home
        </Link>
      </nav>

      {/* Contact Header */}
      <div className="bg-[#1A3B70] text-center py-20 px-6 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00AEEF] rounded-full blur-[80px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FFCC00] rounded-full blur-[80px] opacity-10 -translate-x-1/2 translate-y-1/2"></div>
        
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 relative z-10">Get In Touch</h1>
        <p className="text-white/80 text-lg max-w-2xl mx-auto font-medium relative z-10">
          Have questions about our courses or admissions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      {/* Contact Content */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-16">
        <div className="grid md:grid-cols-5 gap-12">
          
          {/* Contact Info (Left) */}
          <div className="md:col-span-2 space-y-8">
            <div>
              <h3 className="text-[24px] font-black text-[#1A3B70] mb-6">Contact Information</h3>
              <p className="text-gray-500 font-medium text-[15px] mb-8">
                Fill up the form and our team will get back to you within 24 hours.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#E6F4FE] rounded-full flex items-center justify-center text-[#00AEEF] text-xl flex-shrink-0">
                  📍
                </div>
                <div>
                  <h4 className="font-bold text-[#1A3B70] text-[16px]">Visit Us</h4>
                  <p className="text-gray-600 text-[14px] leading-relaxed mt-1">
                    Behind Rajasthani Dharamshala,<br/>Katrasgarh (Katras), Jharkhand
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#E6F4FE] rounded-full flex items-center justify-center text-[#00AEEF] text-xl flex-shrink-0">
                  📞
                </div>
                <div>
                  <h4 className="font-bold text-[#1A3B70] text-[16px]">Call Us</h4>
                  <p className="text-gray-600 text-[14px] mt-1 font-bold">
                    +91 8271365450
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#E6F4FE] rounded-full flex items-center justify-center text-[#00AEEF] text-xl flex-shrink-0">
                  ✉️
                </div>
                <div>
                  <h4 className="font-bold text-[#1A3B70] text-[16px]">Email Us</h4>
                  <p className="text-gray-600 text-[14px] mt-1">
                    commercegiyan@gmail.com
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-gray-100">
               <h4 className="font-bold text-[#1A3B70] text-[16px] mb-4">Follow Us</h4>
               <div className="flex gap-4">
                 <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-[#1A3B70] hover:text-white transition-colors cursor-pointer">FB</div>
                 <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-[#1A3B70] hover:text-white transition-colors cursor-pointer">IG</div>
                 <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-[#1A3B70] hover:text-white transition-colors cursor-pointer">YT</div>
               </div>
            </div>
          </div>

          {/* Contact Form (Right) */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-100 p-8 md:p-10">
              <h3 className="text-[24px] font-black text-[#1A3B70] mb-8">Send us a Message</h3>
              
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[14px] font-bold text-gray-700 mb-2">Your Name</label>
                    <input 
                      type="text" 
                      placeholder="Enter your name" 
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20 outline-none transition-all text-[15px] bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-bold text-gray-700 mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="Enter mobile number" 
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20 outline-none transition-all text-[15px] bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-bold text-gray-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20 outline-none transition-all text-[15px] bg-gray-50 focus:bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-[14px] font-bold text-gray-700 mb-2">Select Course Interest</label>
                  <select className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20 outline-none transition-all text-[15px] bg-gray-50 focus:bg-white text-gray-600">
                    <option>School Classes (7th to 10th)</option>
                    <option>Commerce Classes (11th & 12th)</option>
                    <option>Professional Courses (CA/CMA/CS)</option>
                    <option>General Enquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[14px] font-bold text-gray-700 mb-2">Your Message</label>
                  <textarea 
                    rows="4"
                    placeholder="How can we help you?" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20 outline-none transition-all text-[15px] bg-gray-50 focus:bg-white resize-none"
                  ></textarea>
                </div>

                <button 
                  type="button"
                  className="w-full md:w-auto px-10 py-4 bg-[#00AEEF] text-white font-bold rounded-lg shadow-md hover:bg-[#009CD6] transition-colors text-[16px]"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>

    </main>
  );
}
