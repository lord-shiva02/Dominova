export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="text-2xl font-display font-bold tracking-tighter text-text-primary">
          DOMI<span className="text-gold-primary">NOVA</span>
        </div>
        <nav className="hidden md:flex space-x-8">
          {['Events', 'Services', 'About', 'Testimonials', 'Contact'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`}
              className="text-text-secondary hover:text-gold-primary transition-colors text-sm font-semibold tracking-wide uppercase"
            >
              {item}
            </a>
          ))}
        </nav>
        <button className="hidden md:block bg-bg-dark-accent text-text-on-dark px-6 py-2 rounded-full font-semibold hover:bg-gold-primary transition-colors">
          Get in Touch
        </button>
      </div>
    </header>
  );
}
