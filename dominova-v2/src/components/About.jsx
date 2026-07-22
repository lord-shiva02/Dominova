import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Target, Users, Zap, Award } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.about-item', 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          stagger: 0.15, 
          duration: 1, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          }
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const points = [
    {
      icon: <Users className="w-6 h-6 text-gold-primary" />,
      title: "Who We Are",
      desc: "Dominova Tech is an MSME-registered IT services and training startup based in Chennai. We are a team of passionate engineers and industry veterans dedicated to modern education."
    },
    {
      icon: <Zap className="w-6 h-6 text-gold-primary" />,
      title: "What We Do",
      desc: "We bring cutting-edge tech directly to campuses. From intensive AI & Python workshops to national-level hackathons and placement readiness programs."
    },
    {
      icon: <Target className="w-6 h-6 text-gold-primary" />,
      title: "Our Mission",
      desc: "To bridge the gap between academia and the IT industry by equipping students with real-world skills and functional project-building experience."
    },
    {
      icon: <Award className="w-6 h-6 text-gold-primary" />,
      title: "Why Collaborate",
      desc: "We don't just teach theory. We ensure students build real applications, offering expert mentorship that significantly boosts campus placement rates."
    }
  ];

  return (
    <section ref={sectionRef} className="py-32 bg-bg-primary relative overflow-hidden" id="about">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-bg-dark-accent/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 about-item">
          <span className="eyebrow">About Dominova</span>
          <h2 className="text-4xl md:text-6xl mb-6 font-display font-bold tracking-tight text-text-primary">
            Bridging the Gap Between <br className="hidden md:block"/>
            <span className="text-gold-primary">Academia & Industry</span>
          </h2>
          <p className="text-xl text-text-secondary font-light">
            We are transforming how engineering students learn by delivering premium, hands-on technology experiences directly inside college campuses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {points.map((point, i) => (
            <div key={i} className="about-item glass-panel p-8 group hover:-translate-y-2 transition-all duration-300 border border-transparent hover:border-gold-primary/30">
              <div className="w-14 h-14 rounded-2xl bg-bg-secondary flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                {point.icon}
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-3 font-display">{point.title}</h3>
              <p className="text-text-secondary leading-relaxed">
                {point.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
