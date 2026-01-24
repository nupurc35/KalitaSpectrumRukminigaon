
import React, { useState } from 'react';
import { MENU_ITEMS, MENU_LINKS } from '../constants';

const Menu: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('Everything');
  
  const categories = [
    'Everything',
    'Main Menu',
    'Continental Grills',
    'Oriental Delights',
    'Beverage Bar',
    'Desserts'
  ];

  const filteredItems = activeCategory === 'Everything' 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(item => item.category === activeCategory);

  return (
    <section id="menu" className="py-24 px-6 bg-accent text-primary scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-secondary uppercase text-xs font-bold tracking-[0.3em] mb-4 block">Our Culinary Spectrum</span>
          <h2 className="text-4xl md:text-6xl font-serif mb-6 italic">A World on a Plate</h2>
          <p className="text-primary/60 text-lg max-w-2xl mx-auto">From the heart of Assam to the streets of Asia and the bistros of Europe. Explore our diverse menu selections.</p>
        </div>

        {/* Visual Menu Quick Links */}
        <div className="mb-16">
          <p className="text-[10px] uppercase font-bold tracking-widest text-primary/40 text-center mb-6">Digital Menu Archives (Google Maps Photos)</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {MENU_LINKS.map((link) => (
              <a 
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-white p-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-center hover:bg-secondary transition-all hover:-translate-y-1 shadow-md flex flex-col items-center justify-center space-y-2 border border-white/5"
              >
                <svg className="w-5 h-5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${
                activeCategory === cat 
                  ? 'bg-primary text-white shadow-lg scale-105' 
                  : 'bg-white text-primary hover:bg-primary/5 border border-primary/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 gap-8 min-h-[400px]">
          {filteredItems.map(item => (
            <div key={item.id} className="group bg-white p-5 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col sm:flex-row gap-6 border border-primary/5">
              <div className="sm:w-40 h-40 flex-shrink-0 overflow-hidden rounded-2xl bg-accent">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold font-serif">{item.name}</h3>
                  <span className="text-secondary font-bold">{item.price}</span>
                </div>
                <p className="text-primary/60 text-sm leading-relaxed line-clamp-2 italic mb-2">
                  {item.category}
                </p>
                <p className="text-primary/50 text-xs leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
            <p className="text-primary/40 text-xs mb-6 font-medium uppercase tracking-[0.2em]">Our full menu contains over 150+ delicacies</p>
            <a href="#book" className="inline-block bg-primary text-white px-12 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-secondary transition-all shadow-xl">Book Your Table</a>
        </div>
      </div>
    </section>
  );
};

export default Menu;
