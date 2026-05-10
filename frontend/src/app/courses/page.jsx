import Link from "next/link";

export const metadata = {
  title: "Our Programs | Katras Success Academy",
  description: "Browse our comprehensive list of coaching programs for IIT-JEE, NEET, and Foundation courses.",
};

export default function CoursesPage() {
  // Mock data for initial SSR render - in production this would fetch from our Express backend
  const courses = [
    {
      id: "1",
      title: "IIT-JEE Foundation target",
      description: "Comprehensive 2-year classroom program covering physics, chemistry, and maths for Classes 11 and 12 with rigorous test series.",
      targetAudience: "Class 11 & 12",
      price: "₹50,000",
      icon: "🚀",
      color: "blue"
    },
    {
      id: "2",
      title: "NEET Achievers target",
      description: "Intensive medical entrance preparation covering Biology, Physics, and Chemistry perfectly aligned with NCERT.",
      targetAudience: "Class 12 & Droppers",
      price: "₹45,000",
      icon: "⚕️",
      color: "orange"
    },
    {
      id: "3",
      title: "Foundation Course target",
      description: "Build a strong core for future competitive exams while excelling in your school board examinations.",
      targetAudience: "Class 8th - 10th",
      price: "₹25,000",
      icon: "📚",
      color: "gray"
    }
  ];

  return (
    <main className="min-h-screen bg-[var(--color-bg)] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <Link href="/" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] font-medium mb-4 inline-block">
            &larr; Back to Home
          </Link>
          <h1 className="heading-1 mb-4">Our Programs</h1>
          <p className="text-xl text-[var(--color-text-muted)] max-w-2xl">
            Choose from our specialized programs designed and mentored by top-tier faculty to guarantee your success in competitive exams.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <div key={course.id} className="glass-panel p-8 flex flex-col h-full border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-md ${course.color === 'blue' ? 'bg-[var(--color-primary)]' : course.color === 'orange' ? 'bg-[var(--color-accent)]' : 'bg-gray-800'}`}>
                {course.icon}
              </div>
              <div className="inline-block px-3 py-1 bg-gray-100 text-sm font-semibold rounded-full mb-4 w-fit">
                {course.targetAudience}
              </div>
              <h2 className="text-2xl font-bold text-[var(--color-primary-dark)] mb-3">{course.title}</h2>
              <p className="text-[var(--color-text-muted)] mb-8 flex-grow">{course.description}</p>
              
              <div className="pt-6 border-t border-gray-100 mt-auto flex items-center justify-between">
                <span className="text-xl font-bold text-[var(--color-primary)]">{course.price}</span>
                <button className={course.color === 'orange' ? 'btn-accent !py-2 !px-4' : 'btn-primary !py-2 !px-4'}>
                  Enroll Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
