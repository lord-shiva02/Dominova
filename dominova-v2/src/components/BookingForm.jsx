import { useState } from 'react';
import { CheckCircle2, ChevronRight, ChevronLeft, CalendarClock, Building2, User, FileText, Send, MessageSquare, Phone, Mail } from 'lucide-react';

const EVENT_TYPES = [
  "AI Workshop", "Hackathon", "Guest Lecture", 
  "Technical Workshop", "Placement Training", 
  "Career Guidance", "Industry Expert Session", "Custom Event"
];

const INSTITUTION_TYPES = [
  "Engineering College", "Arts & Science College", "Polytechnic", 
  "School", "University", "Other"
];

const DEPARTMENTS = [
  "Computer Science", "Information Technology", "Artificial Intelligence & Data Science",
  "Artificial Intelligence & Machine Learning", "Electronics & Communication",
  "Electrical Engineering", "Mechanical Engineering", "Civil Engineering",
  "MBA", "MCA", "BCA", "B.Sc Computer Science", "Other"
];

const DURATIONS = ["Half Day", "Full Day", "Two Days", "Multiple Days"];

export default function BookingForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registrationId, setRegistrationId] = useState('');
  const [showCommunication, setShowCommunication] = useState(false);

  const [formData, setFormData] = useState({
    eventType: '',
    institutionName: '',
    institutionType: '',
    department: '',
    city: '',
    state: '',
    facultyName: '',
    designation: '',
    email: '',
    mobile: '',
    studentsCount: '',
    preferredDate: '',
    duration: '',
    additionalReqs: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 5));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const regId = `REG-${Math.floor(100000 + Math.random() * 900000)}`;
    setRegistrationId(regId);
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    if (id === 'hero') {
      setIsSuccess(false);
      setShowCommunication(false);
      setRegistrationId('');
      setStep(1);
      setFormData({
        eventType: '', institutionName: '', institutionType: '', department: '', city: '', state: '',
        facultyName: '', designation: '', email: '', mobile: '', studentsCount: '', preferredDate: '',
        duration: '', additionalReqs: ''
      });
    }
  };

  if (isSuccess) {
    const isStudent = formData.designation?.toLowerCase().includes('student');
    const facultyName = !isStudent ? formData.facultyName : '';
    const studentName = isStudent ? formData.facultyName : '';

    const message = `Event Name: ${formData.eventType || ''}
College Name: ${formData.institutionName || ''}
Faculty Name: ${facultyName}
Student Name: ${studentName}
Role/Designation: ${formData.designation || ''}
Registration ID: ${registrationId}
Email: ${formData.email || ''}
Mobile Number: ${formData.mobile || ''}

Thank you for registering.`;

    const cleanNumber = (num) => {
      let cleaned = num.replace(/\D/g, '');
      if (cleaned.length === 10) {
        cleaned = '91' + cleaned;
      }
      return cleaned;
    };

    const handleCommunication = (method) => {
      const formattedMobile = cleanNumber(formData.mobile);
      if (method === 'WhatsApp') {
        window.open(`https://wa.me/${formattedMobile}?text=${encodeURIComponent(message)}`, '_blank');
      } else if (method === 'Phone') {
        window.location.href = `tel:${formData.mobile.replace(/\s+/g, '')}`;
      } else if (method === 'Email') {
        window.location.href = `mailto:${formData.email}?subject=Event Registration&body=${encodeURIComponent(message)}`;
      }
    };

    return (
      <section className="py-32 bg-bg-secondary" id="booking">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100 flex flex-col items-center">
            {!showCommunication ? (
              <>
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-4xl font-display font-bold text-text-primary mb-4">Thank You!</h2>
                <p className="text-xl text-text-secondary mb-12">
                  Your request has been successfully submitted. <br/>
                  Our team will review your requirements and contact you within 24 hours.
                </p>
                <div className="flex justify-center w-full">
                  <button 
                    onClick={() => setShowCommunication(true)} 
                    className="px-8 py-4 rounded-full bg-gold-primary text-white font-semibold hover:bg-gold-deep transition-all duration-300 shadow-[0_0_15px_rgba(201,162,39,0.25)] hover:shadow-[0_0_25px_rgba(201,162,39,0.45)]"
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-display font-bold text-text-primary mb-4">How should we connect?</h2>
                <p className="text-xl text-text-secondary mb-10">Select an option to proceed with your event registration details:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
                  {/* WhatsApp */}
                  <button 
                    onClick={() => handleCommunication('WhatsApp')}
                    className="group p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center hover:-translate-y-1 bg-gray-50 border-gray-100 hover:border-green-500/50 hover:bg-green-500/5 shadow-sm hover:shadow-lg"
                  >
                    <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-lg text-text-primary group-hover:text-green-600 transition-colors">WhatsApp</h4>
                    <p className="text-xs text-text-secondary mt-2">Open direct chat</p>
                  </button>
                  
                  {/* Phone Call */}
                  <button 
                    onClick={() => handleCommunication('Phone')}
                    className="group p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center hover:-translate-y-1 bg-gray-50 border-gray-100 hover:border-gold-primary/50 hover:bg-gold-primary/5 shadow-sm hover:shadow-lg"
                  >
                    <div className="w-14 h-14 rounded-full bg-gold-primary/10 text-gold-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Phone className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-lg text-text-primary group-hover:text-gold-primary transition-colors">Phone Call</h4>
                    <p className="text-xs text-text-secondary mt-2">Open dialer</p>
                  </button>
                  
                  {/* Email */}
                  <button 
                    onClick={() => handleCommunication('Email')}
                    className="group p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center hover:-translate-y-1 bg-gray-50 border-gray-100 hover:border-blue-500/50 hover:bg-blue-500/5 shadow-sm hover:shadow-lg"
                  >
                    <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-lg text-text-primary group-hover:text-blue-600 transition-colors">Email</h4>
                    <p className="text-xs text-text-secondary mt-2">Open email client</p>
                  </button>
                </div>
                
                <div className="flex justify-center w-full">
                  <button 
                    onClick={() => scrollToSection('hero')} 
                    className="px-8 py-3 rounded-full border border-gray-200 text-text-secondary hover:bg-gray-50 transition-colors"
                  >
                    Back to Home
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    );
  }

  const steps = [
    { num: 1, title: "Event Type", icon: <FileText className="w-5 h-5"/> },
    { num: 2, title: "Institution", icon: <Building2 className="w-5 h-5"/> },
    { num: 3, title: "Faculty", icon: <User className="w-5 h-5"/> },
    { num: 4, title: "Requirements", icon: <CalendarClock className="w-5 h-5"/> },
    { num: 5, title: "Additional", icon: <Send className="w-5 h-5"/> },
  ];

  const isStepValid = () => {
    switch(step) {
      case 1: return !!formData.eventType;
      case 2: return !!formData.institutionName && !!formData.institutionType && !!formData.department && !!formData.city && !!formData.state;
      case 3: return !!formData.facultyName && !!formData.designation && !!formData.email && !!formData.mobile;
      case 4: return !!formData.studentsCount && !!formData.preferredDate && !!formData.duration;
      case 5: return true; // Optional
      default: return false;
    }
  };

  return (
    <section className="py-32 bg-bg-primary" id="booking">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-4">
            Bring Dominova to <span className="text-gold-primary">Your Campus</span>
          </h2>
          <p className="text-lg text-text-secondary">Request a workshop, hackathon, or training program at your institution.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Progress Bar */}
          <div className="bg-bg-secondary border-b border-gray-100 px-8 py-6 flex justify-between items-center overflow-x-auto">
            {steps.map((s, idx) => (
              <div key={s.num} className="flex items-center min-w-max">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${step >= s.num ? 'bg-gold-primary text-white shadow-md' : 'bg-gray-200 text-gray-400'}`}>
                  {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.icon}
                </div>
                <span className={`ml-3 font-semibold hidden md:block ${step >= s.num ? 'text-text-primary' : 'text-gray-400'}`}>{s.title}</span>
                {idx < steps.length - 1 && <div className={`w-8 md:w-12 h-1 mx-4 rounded-full ${step > s.num ? 'bg-gold-primary' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12">
            
            {/* Step 1: Event Type */}
            {step === 1 && (
              <div className="animate-fadeIn">
                <h3 className="text-2xl font-bold mb-8 font-display">Select Event Type</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {EVENT_TYPES.map(type => (
                    <label key={type} className={`cursor-pointer border-2 rounded-xl p-4 flex items-center transition-all ${formData.eventType === type ? 'border-gold-primary bg-gold-primary/5 shadow-md' : 'border-gray-200 hover:border-gold-primary/50 hover:bg-gray-50'}`}>
                      <input type="radio" name="eventType" value={type} checked={formData.eventType === type} onChange={handleChange} className="hidden" />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 ${formData.eventType === type ? 'border-gold-primary' : 'border-gray-300'}`}>
                        {formData.eventType === type && <div className="w-2.5 h-2.5 bg-gold-primary rounded-full" />}
                      </div>
                      <span className="font-semibold text-text-primary">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Institution Info */}
            {step === 2 && (
              <div className="animate-fadeIn space-y-6">
                <h3 className="text-2xl font-bold mb-8 font-display">Institution Information</h3>
                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wide">Institution Name</label>
                  <input type="text" name="institutionName" value={formData.institutionName} onChange={handleChange} required className="w-full bg-bg-secondary border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:border-gold-primary focus:ring-2 focus:ring-gold-primary/20 transition-all text-text-primary" placeholder="e.g. Saveetha Engineering College" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wide">Institution Type</label>
                    <select name="institutionType" value={formData.institutionType} onChange={handleChange} required className="w-full bg-bg-secondary border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:border-gold-primary focus:ring-2 focus:ring-gold-primary/20 transition-all text-text-primary appearance-none">
                      <option value="">Select Type</option>
                      {INSTITUTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wide">Department</label>
                    <select name="department" value={formData.department} onChange={handleChange} required className="w-full bg-bg-secondary border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:border-gold-primary focus:ring-2 focus:ring-gold-primary/20 transition-all text-text-primary appearance-none">
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wide">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full bg-bg-secondary border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:border-gold-primary focus:ring-2 focus:ring-gold-primary/20 transition-all text-text-primary" placeholder="City" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wide">State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} required className="w-full bg-bg-secondary border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:border-gold-primary focus:ring-2 focus:ring-gold-primary/20 transition-all text-text-primary" placeholder="State" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Faculty Info */}
            {step === 3 && (
              <div className="animate-fadeIn space-y-6">
                <h3 className="text-2xl font-bold mb-8 font-display">Faculty Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wide">Faculty Name</label>
                    <input type="text" name="facultyName" value={formData.facultyName} onChange={handleChange} required className="w-full bg-bg-secondary border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:border-gold-primary focus:ring-2 focus:ring-gold-primary/20 transition-all text-text-primary" placeholder="Full Name" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wide">Designation</label>
                    <input type="text" name="designation" value={formData.designation} onChange={handleChange} required className="w-full bg-bg-secondary border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:border-gold-primary focus:ring-2 focus:ring-gold-primary/20 transition-all text-text-primary" placeholder="e.g. HOD / Assistant Professor" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wide">Official Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-bg-secondary border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:border-gold-primary focus:ring-2 focus:ring-gold-primary/20 transition-all text-text-primary" placeholder="faculty@college.edu.in" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wide">Mobile Number</label>
                    <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required className="w-full bg-bg-secondary border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:border-gold-primary focus:ring-2 focus:ring-gold-primary/20 transition-all text-text-primary" placeholder="+91 XXXXX XXXXX" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Event Requirements */}
            {step === 4 && (
              <div className="animate-fadeIn space-y-6">
                <h3 className="text-2xl font-bold mb-8 font-display">Event Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wide">Expected Number of Students</label>
                    <input type="number" name="studentsCount" value={formData.studentsCount} onChange={handleChange} required min="10" className="w-full bg-bg-secondary border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:border-gold-primary focus:ring-2 focus:ring-gold-primary/20 transition-all text-text-primary" placeholder="e.g. 150" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-text-secondary mb-2 uppercase tracking-wide">Preferred Date</label>
                    <input type="date" name="preferredDate" value={formData.preferredDate} onChange={handleChange} required className="w-full bg-bg-secondary border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:border-gold-primary focus:ring-2 focus:ring-gold-primary/20 transition-all text-text-primary" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-text-secondary mb-4 uppercase tracking-wide">Event Duration</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {DURATIONS.map(dur => (
                        <label key={dur} className={`cursor-pointer border-2 rounded-xl p-3 text-center transition-all ${formData.duration === dur ? 'border-gold-primary bg-gold-primary/5 text-gold-primary font-bold shadow-sm' : 'border-gray-200 hover:border-gold-primary/50 hover:bg-gray-50 text-text-secondary'}`}>
                          <input type="radio" name="duration" value={dur} checked={formData.duration === dur} onChange={handleChange} className="hidden" />
                          {dur}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Additional Requirements */}
            {step === 5 && (
              <div className="animate-fadeIn space-y-6">
                <h3 className="text-2xl font-bold mb-8 font-display">Additional Requirements</h3>
                <div>
                  <textarea name="additionalReqs" value={formData.additionalReqs} onChange={handleChange} rows="6" className="w-full bg-bg-secondary border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:border-gold-primary focus:ring-2 focus:ring-gold-primary/20 transition-all text-text-primary resize-none" placeholder="Tell us about your objectives or any specific requirements for this event..." />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-12 flex items-center justify-between pt-6 border-t border-gray-100">
              <button 
                type="button" 
                onClick={handleBack} 
                className={`flex items-center font-bold px-6 py-3 rounded-full transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-text-secondary hover:bg-gray-100'}`}
              >
                <ChevronLeft className="w-5 h-5 mr-1" /> Back
              </button>
              
              {step < 5 ? (
                <button 
                  type="button" 
                  onClick={handleNext} 
                  disabled={!isStepValid()}
                  className={`flex items-center font-bold px-8 py-4 rounded-full transition-all ${isStepValid() ? 'bg-gold-primary text-white shadow-lg hover:bg-gold-deep hover:-translate-y-1' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  Continue <ChevronRight className="w-5 h-5 ml-1" />
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`flex items-center font-bold px-8 py-4 rounded-full transition-all ${isSubmitting ? 'bg-gray-400 text-white cursor-wait' : 'bg-bg-dark-accent text-white shadow-xl hover:bg-black hover:-translate-y-1'}`}
                >
                  {isSubmitting ? 'Submitting...' : 'Bring Dominova to Our Campus'}
                  {!isSubmitting && <Send className="w-4 h-4 ml-2" />}
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </section>
  );
}
