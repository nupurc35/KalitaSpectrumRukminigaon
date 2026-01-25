
import React from 'react';
import { RESTAURANT_NAME, GOOGLE_RATING, REVIEW_COUNT, WHATSAPP_LINK } from '../constants';

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image: Aerial Forest Resort (Matches user-provided image) */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover"
          alt="Luxury Forest Resort Aerial View"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/40 to-primary"></div>
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl">
        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-8">
          <span className="text-secondary text-lg">★</span>
          <span className="text-sm font-medium">{GOOGLE_RATING} Google Rating ({REVIEW_COUNT}+ Reviews)</span>
        </div>
        
        <h1 className="text-5xl md:text-8xl font-serif mb-6 leading-tight">
          The <span className="italic text-secondary">Spectrum</span> of <br className="hidden md:block" /> Modern Flavors
        </h1>
        
        <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
          {RESTAURANT_NAME} brings a refined fusion of authentic Indian heritage and global culinary artistry to a serene, natural sanctuary.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href="#menu" 
            className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-4 rounded-full text-lg font-medium hover:bg-white/20 transition-all"
          >
            Experience the Flavors
          </a>
          <a 
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-secondary text-primary px-10 py-4 rounded-full text-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-secondary/20"
          >
            Reserve a Table
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
