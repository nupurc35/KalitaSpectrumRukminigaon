
import React, { useState, useEffect } from 'react';
import { RESTAURANT_NAME, WHATSAPP_LINK } from '../constants';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-nav py-4 border-b border-white/10' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="text-2xl font-serif font-bold tracking-tight">
          {RESTAURANT_NAME.split(' ')[0]} <span className="text-secondary">{RESTAURANT_NAME.split(' ')[1]}</span>
        </div>
        
        <div className="hidden md:flex space-x-8 text-sm font-medium tracking-wide uppercase items-center">
          <a href="#menu" className="hover:text-secondary transition-colors">Menu</a>
          <a href="#about" className="hover:text-secondary transition-colors">Experience</a>
          <a href="#location" className="hover:text-secondary transition-colors">Location</a>
          <a href="#reviews" className="hover:text-secondary transition-colors">Reviews</a>
          <a 
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-secondary text-primary px-5 py-2 rounded-full text-[10px] font-bold tracking-widest hover:bg-white transition-all shadow-lg"
          >
            Reserve a Table
          </a>
        </div>
        
        {/* Mobile simple view if needed, but keeping desktop focus for now */}
        <div className="md:hidden">
           <a 
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-secondary text-primary px-4 py-2 rounded-full text-[9px] font-bold tracking-widest"
          >
            Reserve
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
