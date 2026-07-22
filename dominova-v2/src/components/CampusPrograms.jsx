import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Bot, Code2, Mic2, Laptop, Compass, Briefcase, GraduationCap, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const programs = [
  {
    icon: <Bot className="w-8 h-8" />,
    title: "AI Workshops",
    desc: "Hands-on sessions where students build functional AI applications, chatbots, and agents in just a few hours."
  },
  {
    icon: <Code2 className="w-8 h-8" />,
    title: "Hackathons",
    desc: "End-to-end national level hackathon management, mentoring, and technical evaluation to foster innovation."
  },
  {
    icon: <Mic2 className="w-8 h-8" />,
    title: "Guest Lectures",
    desc: "Inspirational talks by industry veterans on emerging technologies, startup culture, and the future of IT."
  },
  {
    icon: <Laptop className="w-8 h-8" />,
    title: "Technical Workshops",
    desc: "Deep-dive training in Python, Full-Stack Development, Cloud Computing, and Software Testing."
  },
  {
    icon: <Compass className="w-8 h-8" />,
    title: "Career Guidance Sessions",
    desc: "Strategic advice to help students choose the right tech stack and navigate the modern IT job market."
  },
  {
    icon: <Briefcase className="w-8 h-8" />,
    title: "Placement Readiness",
    desc: "Intensive aptitude, coding interview preparation, and mock interviews to maximize campus hiring rates."
  },
  {
    icon: <GraduationCap className="w-8 h-8" />,
    title: "Industry Expert Sessions",
    desc: "Exclusive interactions with top professionals from leading tech giants like Infosys, CTS, and specialized startups."
  }
];

export default function CampusPrograms() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.program-card', 
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          stagger: 0.1, 
          duration: 0.8, 
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          }
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const scrollToBooking = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={sectionRef} className="py-32 bg-bg-secondary relative" id="programs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="eyebrow">What We Do</span>
          <h2 className="text-4xl md:text-6xl font-display font-bold text-text-primary">
            Campus Programs <br className="hidden md:block"/> 
            <span className="text-gold-primary">We Offer</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {programs.map((program, i) => (
            <div 
              key={i} 
              className={`program-card group bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gold-primary/30 flex flex-col h-full transform hover:-translate-y-2 ${i === 6 ? 'md:col-span-2 lg:col-span-3 xl:col-span-1' : ''}`}
            >
              <div className="w-16 h-16 rounded-2xl bg-bg-secondary text-gold-primary flex items-center justify-center mb-8 group-hover:bg-gold-primary group-hover:text-white transition-colors duration-300">
                {program.icon}
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-4 font-display group-hover:text-gold-primary transition-colors duration-300">
                {program.title}
              </h3>
              <p className="text-text-secondary leading-relaxed mb-8 flex-grow">
                {program.desc}
              </p>
              
              <button onClick={scrollToBooking} className="flex items-center text-sm font-bold text-text-primary group-hover:text-gold-primary transition-colors mt-auto w-fit">
                Learn More 
                <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
