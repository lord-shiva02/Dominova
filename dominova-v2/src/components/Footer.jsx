import { Linkedin, Instagram, Globe } from 'lucide-react';

export default function Footer() {
  const quickLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'About', href: '#about' },
    { name: 'Campus Programs', href: '#programs' },
    { name: 'Events', href: '#events' },
    { name: 'Bring Dominova to Your Campus', href: '#booking' },
    { name: 'Contact', href: '#contact' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms & Conditions', href: '#' },
  ];

  const socials = [
    { icon: <Linkedin className="w-5 h-5" />, label: "LinkedIn", link: "#" },
    { icon: <Instagram className="w-5 h-5" />, label: "Instagram", link: "#" },
    { icon: <Globe className="w-5 h-5" />, label: "Website", link: "https://dominova.tech" }
  ];

  return (
    <footer className="bg-bg-dark-accent text-text-on-dark pt-20 pb-10 border-t border-white/5 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 w-full h-[300px] bg-gold-primary/5 rounded-[100%] blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          <div className="lg:col-span-2">
            <div className="text-3xl font-display font-bold tracking-tight mb-6">
              DOMI<span className="text-gold-primary">NOVA</span>
            </div>
            <p className="text-text-on-dark/70 max-w-md mb-8 leading-relaxed">
              An MSME-registered IT services & training startup dedicated to empowering the next generation of engineers through hands-on education and industry collaboration.
            </p>
            <div className="flex space-x-4">
              {socials.map((social, idx) => (
                <a 
                  key={idx} 
                  href={social.link} 
                  title={social.label}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-text-on-dark/70 hover:bg-gold-primary hover:text-white transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-white text-lg font-display">Explore</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-text-on-dark/70 hover:text-gold-primary transition-colors text-sm font-medium">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-white text-lg font-display">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-text-on-dark/70 hover:text-gold-primary transition-colors text-sm font-medium">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-text-on-dark/40 text-sm">
          <p>&copy; {new Date().getFullYear()} Dominova Tech. All rights reserved.</p>
          <p className="mt-4 md:mt-0 font-medium tracking-wide">
            DESIGNED FOR EXCELLENCE
          </p>
        </div>
      </div>
    </footer>
  );
}
