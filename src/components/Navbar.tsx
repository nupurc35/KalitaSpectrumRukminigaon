
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RESTAURANT_NAME } from '../constants/menu';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-nav py-4 border-b border-white/10' : 'bg-transparent py-6'}`} aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <Link 
          to="/" 
          aria-label={`${RESTAURANT_NAME} - Home`}
          className="text-2xl font-serif font-bold tracking-tight hover:opacity-80 transition-opacity"
        >
          {RESTAURANT_NAME.split(' ')[0]} <span className="text-secondary">{RESTAURANT_NAME.split(' ')[1]}</span>
        </Link>
        
        <div className="flex items-center space-x-8" role="list">
          <Link 
            to="/" 
            aria-current={isActive('/') ? 'page' : undefined}
            className={`text-sm uppercase tracking-widest font-bold transition-colors ${
              isActive('/') ? 'text-secondary' : 'text-white/80 hover:text-white'
            }`}
            role="listitem"
          >
            Home
          </Link>
          <Link 
            to="/menu" 
            aria-current={isActive('/menu') ? 'page' : undefined}
            className={`text-sm uppercase tracking-widest font-bold transition-colors ${
              isActive('/menu') ? 'text-secondary' : 'text-white/80 hover:text-white'
            }`}
            role="listitem"
          >
            Menu
          </Link>
          <Link 
            to="/about" 
            aria-current={isActive('/about') ? 'page' : undefined}
            className={`text-sm uppercase tracking-widest font-bold transition-colors ${
              isActive('/about') ? 'text-secondary' : 'text-white/80 hover:text-white'
            }`}
            role="listitem"
          >
            About
          </Link>
          <Link 
            to="/contact" 
            aria-current={isActive('/contact') ? 'page' : undefined}
            className={`text-sm uppercase tracking-widest font-bold transition-colors ${
              isActive('/contact') ? 'text-secondary' : 'text-white/80 hover:text-white'
            }`}
            role="listitem"
          >
            Contact
          </Link>
          <Link to="/gallery"aria-current={isActive('/gallery') ? 'page' : undefined}
  className={`text-sm uppercase tracking-widest font-bold transition-colors ${
    isActive('/gallery') ? 'text-secondary' : 'text-white/80 hover:text-white'
  }`}role="listitem">Gallery</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
