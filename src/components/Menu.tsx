
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MENU_ITEMS, WHATSAPP_LINK } from '../constants/menu';
const handleMenuClick = (item) => {
  if (item.featured) {
    window.gtag?.('event', 'menu_featured_click', {
      event_category: 'menu',
      event_label: item.name
    });
  }
};
const Menu: React.FC = () => {
  const categories = [
    'Appetizers',
    'Soups',
    'Main Course',
    'Desserts'
  ] as const;

  const subCategoriesMap: Record<string, string[]> = {
    'Appetizers': ['Indian', 'Continental'],
    'Main Course': ['Indian', 'Around the World'],
  };

  const [activeCategory, setActiveCategory] = useState<typeof categories[number]>(categories[0]);
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null);

  // Set default subcategory when category changes
  useEffect(() => {
    if (subCategoriesMap[activeCategory]) {
      setActiveSubCategory(subCategoriesMap[activeCategory][0]);
    } else {
      setActiveSubCategory(null);
    }
  }, [activeCategory]);

  const filteredItems = MENU_ITEMS.filter(item => {
    const categoryMatch = item.category === activeCategory;
    if (activeSubCategory) {
      return categoryMatch && item.subCategory === activeSubCategory;
    }
    return categoryMatch;
  });

  return (
    <section id="menu" className="py-24 px-6 bg-accent text-primary scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-secondary uppercase text-xs font-bold tracking-[0.3em] mb-4 block">Our Culinary Selection</span>
          <h2 className="text-4xl md:text-6xl font-serif mb-6 italic">Taste the Spectrum</h2>
          <p className="text-primary/60 text-lg max-w-2xl mx-auto">Handcrafted delicacies prepared with authentic ingredients and modern culinary techniques.</p>
        </div>

        {/* Primary Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 rounded-full text-[12px] font-bold uppercase tracking-widest transition-all ${
                activeCategory === cat 
                  ? 'bg-primary text-white shadow-xl scale-105' 
                  : 'bg-white text-primary hover:bg-primary/5 border border-primary/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Subcategory Tabs */}
        {subCategoriesMap[activeCategory] && (
          <div className="flex justify-center gap-4 mb-12 animate-in fade-in slide-in-from-top-2 duration-500">
            {subCategoriesMap[activeCategory].map(sub => (
              <button
                key={sub}
                onClick={() => setActiveSubCategory(sub)}
                className={`flex items-center space-x-2 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  activeSubCategory === sub
                    ? 'border-secondary bg-secondary/10 text-secondary'
                    : 'border-primary/10 bg-transparent text-primary/40 hover:text-primary'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${activeSubCategory === sub ? 'bg-secondary' : 'bg-primary/20'}`}></div>
                <span>{sub}</span>
              </button>
            ))}
          </div>
        )}

        {/* Menu Grid */}
     {   <div className="grid md:grid-cols-2 gap-8 min-h-[400px]">
          
          {filteredItems.map(item => (
            <div onClick={()=>handleMenuClick(item)} key={item.id} className="relative group bg-white p-5 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col sm:flex-row gap-6 border border-primary/5">
                <div  className="absolute top-8 left-8 z-10 flex gap-2">
               {item.featured && (<span className="text-[9px] uppercase font-semibold tracking-[0.18em]
      px-3 py-1 rounded-full bg-secondary text-white">Chef’s Special </span>
  )}
        {item.highMargin && (
              <span className="text-[9px] uppercase font-semibold tracking-[0.18em]
      px-3 py-1 rounded-full bg-emerald-500 text-white">
                Recommended
            </span>
  )}
            </div>
              
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
                   {item.highMargin && (
                    <p className="text-[11px] text-emerald-600 italic mt-1">
                        Guest favorite
                    </p>
)}
                </div>
                <p className="text-primary/40 text-[10px] uppercase font-bold tracking-widest mb-2 flex items-center">
                  <span className="opacity-50">{item.category}</span>
                  {item.subCategory && (
                    <>
                      <span className="mx-2 opacity-30">/</span>
                      <span className="text-secondary">{item.subCategory}</span>
                    </>
                  )}
                </p>
                <p className="text-primary/60 text-xs leading-relaxed italic">
                  {item.description}
                </p>
              </div>
            </div>
          ))}




        </div>  }
        
        
        <div className="mt-16 text-center">
            <Link 
              to="/"
              onClick={(e) => {
                if (window.location.pathname === '/') {
                  e.preventDefault();
                  const reservationSection = document.getElementById('reservation-section');
                  if (reservationSection) {
                    reservationSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }}
              className="inline-block bg-primary text-white px-12 py-4 rounded-full font-bold uppercase tracking-widest transition-all duration-300 hover:bg-secondary hover:shadow-xl hover:-translate-y-1"
            >
              Reserve a Table
            </Link>
        </div>
      </div>
    </section>
  );
};

export default Menu;
