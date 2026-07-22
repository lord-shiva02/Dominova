"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import ParticleField from "./ParticleField";
import { DEFAULT_CMS_DATA } from "@/data/cms";
import gsap from "gsap";

export default function Hero() {
  const { heroTitle, heroSubtitle, heroButtonText, heroButtonLink } = DEFAULT_CMS_DATA.settings;
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const inViewport = useRef<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    // Reveal animation
    const ctx = gsap.context(() => {
      gsap.fromTo(".hero-text", 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 1.2, stagger: 0.2, ease: "power3.out", delay: 0.3 }
      );
    }, containerRef);

    // Lazy mount canvas to avoid blocking first paint
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 400);

    // Intersection observer to pause calculations off-screen
    const observer = new IntersectionObserver(([entry]) => {
      inViewport.current = entry.isIntersecting;
    }, { threshold: 0.05 });

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      ctx.revert();
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0A0E1A] bg-[radial-gradient(circle_at_center,_#0F1528_0%,_#0A0E1A_100%)] text-white"
    >
      {/* 3D Particle Background */}
      {isMounted && (
        <div className="absolute inset-0 z-0 opacity-80 pointer-events-none">
          <Canvas 
            camera={{ position: [0, 0, 12] }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
          >
            <ambientLight intensity={0.5} />
            <ParticleField inViewport={inViewport} />
          </Canvas>
        </div>
      )}

      {/* Subtle radial overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E1A]/10 via-[#0A0E1A]/40 to-[#0A0E1A] z-0 pointer-events-none"></div>
      
      {/* Content */}
      <div 
        ref={containerRef} 
        className="relative z-10 text-center px-4 max-w-5xl mx-auto flex flex-col items-center gap-8"
      >
        <h1 
          className="hero-text text-5xl md:text-7xl font-bold tracking-tighter"
          dangerouslySetInnerHTML={{ __html: heroTitle }}
        />
        
        <p className="hero-text text-lg md:text-xl text-neutral-400 max-w-2xl">
          {heroSubtitle}
        </p>
        
        <a 
          href={heroButtonLink}
          className="hero-text px-8 py-4 bg-gold-primary text-black font-semibold rounded-full hover:scale-105 transition-transform duration-300 shadow-[0_0_15px_rgba(201,162,39,0.2)] hover:shadow-[0_0_25px_rgba(201,162,39,0.4)]"
        >
          {heroButtonText}
        </a>
      </div>
    </section>
  );
}
