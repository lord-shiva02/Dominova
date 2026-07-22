import { Mail, Phone, MapPin, Clock, MessageCircle, Linkedin, Instagram, Globe } from 'lucide-react';
import { CONTACT_CONFIG } from '../config/contactConfig';

export default function Contact() {
  const notConfiguredText = "Contact information has not been configured.";
  
  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />,
      label: "Official Email",
      value: CONTACT_CONFIG.email || notConfiguredText,
      link: CONTACT_CONFIG.email ? `mailto:${CONTACT_CONFIG.email}` : "#",
      primary: true
    },
    {
      icon: <Phone className="w-6 h-6" />,
      label: "Business Phone",
      value: CONTACT_CONFIG.phone || notConfiguredText,
      link: CONTACT_CONFIG.phone ? `tel:${CONTACT_CONFIG.phone.replace(/[^0-9+]/g, '')}` : "#"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      label: "WhatsApp",
      value: CONTACT_CONFIG.whatsapp || notConfiguredText,
      link: CONTACT_CONFIG.whatsapp ? `https://wa.me/${CONTACT_CONFIG.whatsapp.replace(/[^0-9]/g, '')}` : "#"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      label: "Office Location",
      value: "Chennai, Tamil Nadu, India",
      link: "#"
    }
  ];

  const socials = [
    { icon: <Linkedin className="w-5 h-5" />, label: "LinkedIn", link: "#" },
    { icon: <Instagram className="w-5 h-5" />, label: "Instagram", link: "#" },
    { icon: <Globe className="w-5 h-5" />, label: "Website", link: "https://dominova.tech" }
  ];

  return (
    <section className="py-32 bg-bg-secondary relative overflow-hidden" id="contact">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold-primary/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Left Column: Text */}
          <div className="flex flex-col justify-center">
            <span className="eyebrow">Contact Us</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-text-primary mb-6 leading-tight">
              Let's Build Something <br/>
              <span className="text-gold-primary">Meaningful Together</span>
            </h2>
            <p className="text-xl text-text-secondary leading-relaxed mb-12">
              Whether you're planning a workshop, hackathon, guest lecture, placement program, or any technical event, our team is ready to collaborate with your institution and deliver an engaging learning experience for your students.
            </p>
            
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-8 lg:mb-0">
              <div className="flex items-start mb-6">
                <div className="w-12 h-12 rounded-full bg-bg-secondary flex items-center justify-center text-gold-primary mr-4 shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-text-primary mb-1">Business Hours</h4>
                  <p className="text-text-secondary">Monday &ndash; Saturday</p>
                  <p className="text-text-secondary">9:30 AM &ndash; 6:30 PM</p>
                </div>
              </div>
              <div className="pt-6 border-t border-gray-100">
                <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Response Time</p>
                <p className="text-lg font-bold text-text-primary mt-1">We typically respond within 24 hours.</p>
              </div>
            </div>
          </div>
          
          {/* Right Column: Contact Cards */}
          <div className="flex flex-col justify-center gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactMethods.map((method, i) => (
                <a 
                  key={i} 
                  href={method.link}
                  className={`group p-6 rounded-2xl border transition-all duration-300 flex flex-col hover:-translate-y-1 ${method.primary ? 'bg-bg-dark-accent border-bg-dark-accent text-white shadow-xl hover:shadow-2xl' : 'bg-white border-gray-100 shadow-sm hover:border-gold-primary/30 hover:shadow-md'}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${method.primary ? 'bg-white/10 text-gold-light group-hover:bg-gold-primary group-hover:text-white' : 'bg-bg-secondary text-gold-primary group-hover:bg-gold-primary group-hover:text-white'}`}>
                    {method.icon}
                  </div>
                  <h4 className={`text-sm font-semibold uppercase tracking-wider mb-1 opacity-80 ${method.primary ? 'text-gray-300' : 'text-text-secondary'}`}>
                    {method.label}
                  </h4>
                  <p className={`font-bold text-lg ${method.primary ? 'text-white' : 'text-text-primary'}`}>
                    {method.value}
                  </p>
                </a>
              ))}
            </div>

            {/* Social Links Box */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between mt-2">
              <span className="font-bold text-text-primary">Connect with us</span>
              <div className="flex gap-3">
                {socials.map((social, i) => (
                  <a 
                    key={i}
                    href={social.link}
                    title={social.label}
                    className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center text-text-secondary hover:bg-gold-primary hover:text-white transition-colors"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
