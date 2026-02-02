import React from 'react';
import { RESTAURANT_NAME } from '../constants/menu';
import WhatsAppButton from './WhatsAppButton';
import analytics from '../services/analytics';

const HeroSection: React.FC = () => {
  const handleReserveClick = () => {
    // Track reserve button click
    analytics.trackReserveButtonClick('Hero Section');
    
    // Scroll to reservation section
    const reservationSection = document.getElementById('reservation-section');
    if (reservationSection) {
      reservationSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover"
          alt="Kalita Spectrum Restaurant in Rukminigaon, Guwahati - Premium dining space with elegant ambiance"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/40 to-primary"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-serif mb-4 leading-tight">
          {RESTAURANT_NAME}
        </h1>
        
        <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
          Authentic Indian heritage meets global culinary artistry
        </p>

        <button
          onClick={handleReserveClick}
          aria-label="Book a table at Kalita Spectrum restaurant"
          className="bg-secondary text-primary px-10 py-4 rounded-full text-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-secondary/20"
        >
          Book a Table
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
      
      <WhatsAppButton />
    </header>
  );
};

export default HeroSection;
