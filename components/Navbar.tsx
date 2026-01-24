
import React, { useState, useEffect } from 'react';
import { RESTAURANT_NAME } from '../constants';

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
        
        <div className="hidden md:flex space-x-8 text-sm font-medium tracking-wide uppercase">
          <a href="#menu" className="hover:text-secondary transition-colors">Menu</a>
          <a href="#about" className="hover:text-secondary transition-colors">Experience</a>
          <a href="#location" className="hover:text-secondary transition-colors">Location</a>
          <a href="#reviews" className="hover:text-secondary transition-colors">Reviews</a>
        </div>

        <a 
          href="#book" 
          className="bg-secondary text-primary px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-white transition-all shadow-lg hover:shadow-secondary/20"
        >
          Book a Table
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
