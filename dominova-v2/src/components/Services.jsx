import { useRef, useEffect } from 'react';
import gsap from 'gsap';

const servicesData = [
  {
    title: "AI & Python Workshops",
    description: "Hands-on intensive training for students to build real-world applications in hours.",
    icon: "💻"
  },
  {
    title: "Software Testing / QA",
    description: "Industry-standard testing methodologies and automation frameworks.",
    icon: "✅"
  },
  {
    title: "Hackathon Mentorship",
    description: "Expert guidance for college hackathons from ideation to prototype.",
    icon: "🚀"
  },
  {
    title: "Guest Lectures",
    description: "Inspiring talks on emerging tech trends by industry professionals.",
    icon: "🎤"
  },
  {
    title: "Full-Stack Development",
    description: "Comprehensive web and app development training for career readiness.",
    icon: "⚡"
  }
];

export default function Services() {
  return (
    <section className="py-24 bg-bg-secondary" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="eyebrow">What We Do</span>
          <h2 className="text-4xl md:text-5xl">Our <span className="text-gold-primary">Services</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesData.map((service, i) => (
            <div key={i} className="glass-panel p-8 hover:border-gold-primary transition-colors duration-300 group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>
              <h3 className="text-xl mb-3">{service.title}</h3>
              <p className="text-text-secondary">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
