
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
        
        {/* Navigation links and buttons removed per request */}
      </div>
    </nav>
  );
};

export default Navbar;
