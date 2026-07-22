const testimonials = [
  {
    quote: "The AI & Python workshop by DOMINOVA was a game changer for our students. They built functional apps in just 3 hours!",
    author: "Dr. Ramesh Kumar",
    role: "HOD Computer Science, SIMATS"
  },
  {
    quote: "Exceptional hackathon mentorship. Their team's guidance helped our students secure first place at the national level.",
    author: "Priya Sharma",
    role: "Placement Coordinator, Tech Institute"
  },
  {
    quote: "The Software Testing training was incredibly thorough. Our students are now industry-ready and confident.",
    author: "Karthik Raj",
    role: "Dean of Engineering, Excel College"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-bg-secondary" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="eyebrow">Success Stories</span>
          <h2 className="text-4xl md:text-5xl">What Colleges <span className="text-gold-primary">Say</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="glass-panel p-8 relative">
              <div className="text-gold-primary text-6xl absolute top-4 left-4 opacity-20">"</div>
              <p className="text-text-primary text-lg relative z-10 mb-8 italic">
                {t.quote}
              </p>
              <div className="border-t border-border-hairline pt-4">
                <div className="font-bold text-bg-dark-accent">{t.author}</div>
                <div className="text-sm text-text-secondary">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
