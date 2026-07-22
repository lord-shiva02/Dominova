import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const eventsData = [
  {
    id: 1,
    category: "AI & Python Workshop at SIMATS",
    title: "NEXORA 2K25",
    description: "A groundbreaking national-level symposium where DOMINOVA conducted comprehensive AI and Python workshops for 800+ students. Students learned to build real mobile apps and websites in just 3 hours using cutting-edge AI tools.",
    stats: [
      { value: "800+", label: "Students" },
      { value: "3 Hours", label: "Duration" },
      { value: "2", label: "Topics" },
      { value: "3", label: "Trainers" }
    ],
    highlights: [
      "800+ students trained (550 in AI, 350 in Python)",
      "Students created functional apps and websites using AI in 3 hours",
      "Overwhelmingly positive student feedback and engagement",
      "Hands-on, interactive sessions with live project building",
      "Led by B Deepak (Founder), Manikandan (Infosys), and Gauthaman (CTS)"
    ],
    gallery: [
      "/images/panel-seating.jpg",
      "/images/award.jpg",
      "/images/portrait.jpg",
      "/images/stage.jpg",
      "/images/crowd.jpg"
    ]
  },
  {
    id: 2,
    category: "Software Testing Bootcamp",
    title: "QA MASTERY 2026",
    description: "An intensive hands-on bootcamp focusing on modern QA methodologies and automated testing tools. Students went from zero to writing full E2E automation suites in Playwright.",
    stats: [
      { value: "250+", label: "Participants" },
      { value: "2 Days", label: "Duration" },
      { value: "4", label: "Frameworks" },
      { value: "100%", label: "Hands-on" }
    ],
    highlights: [
      "Covered Playwright, Selenium, and Cypress automation",
      "Students built scalable testing frameworks from scratch",
      "Mock interviews with industry QA Leads",
      "Top performers awarded paid internships"
    ],
    gallery: [
      "/images/qa-lab.jpg",
      "/images/qa-presentation.jpg",
      "/images/qa-group.jpg"
    ]
  }
];

export default function Events() {
  const sectionRef = useRef(null);

  useEffect(() => {
    // GSAP ScrollTrigger for cards
    const cards = gsap.utils.toArray('.event-card');
    cards.forEach((card, i) => {
      gsap.fromTo(card, 
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-bg-primary" id="events">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="eyebrow">Our Impact</span>
          <h2 className="text-4xl md:text-5xl">Featured <span className="text-gold-primary">Events</span></h2>
        </div>

        <div className="space-y-16">
          {eventsData.map((event) => (
            <div key={event.id} className="event-card glass-panel p-8 md:p-12">
              <span className="eyebrow">{event.category}</span>
              <h3 className="text-3xl mb-4">{event.title}</h3>
              <p className="text-text-secondary mb-8 max-w-3xl">
                {event.description}
              </p>
              
              {/* Stat Block */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {event.stats.map((stat, i) => (
                  <div key={i} className="dark-panel p-4 text-center">
                    <div className="text-2xl font-bold text-gold-primary">{stat.value}</div>
                    <div className="text-sm text-text-on-dark/80">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Highlights */}
              <div className="mb-8">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-text-secondary">
                  {event.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-gold-primary mr-2">•</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Photo Strip (Placeholder for React Bits Gallery) */}
              <div className="overflow-x-auto pb-4 hide-scrollbar">
                <div className="flex space-x-4 w-max">
                  {event.gallery.map((img, i) => (
                    <div key={i} className="w-64 h-40 bg-bg-secondary rounded-lg border border-border-hairline flex items-center justify-center text-text-secondary text-sm">
                      [Image: {img.split('/').pop()}]
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
