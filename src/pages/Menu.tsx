import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MENU_DATA } from '../constants/menuData';
import { RESTAURANT_NAME } from '../constants/menu';

const MenuPage: React.FC = () => {
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  // Group menu items by category
  const groupedMenu = MENU_DATA.reduce((acc, category) => {
    const key = category.subCategory 
      ? `${category.category} - ${category.subCategory}`
      : category.category;
    
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(...category.items);
    return acc;
  }, {} as Record<string, typeof MENU_DATA[0]['items']>);

  // Get unique categories
  const categories = Array.from(new Set(MENU_DATA.map(item => item.category)));

  const handleReserveClick = () => {
    // Scroll to reservation section if on home page
    if (window.location.pathname === '/') {
      const reservationSection = document.getElementById('reservation-section');
      if (reservationSection) {
        reservationSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-accent">
      {/* Hero Section */}
      <header className="bg-primary text-white py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-secondary uppercase text-[10px] tracking-[0.4em] font-bold mb-4 block">
            Our Menu
          </span>
          <h1 className="text-4xl md:text-6xl font-serif mb-6">
            {RESTAURANT_NAME} Menu
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Discover our carefully curated selection of authentic Indian and international cuisine, 
            prepared with premium ingredients and traditional techniques.
          </p>
        </div>
      </header>

      {/* Menu Content */}
      <main className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Menu Categories */}
          {Object.entries(groupedMenu).map(([categoryName, items]) => (
            <section key={categoryName} className="mb-16 scroll-reveal">
              <h2 className="text-3xl md:text-4xl font-serif mb-8 text-primary border-b-2 border-secondary pb-4">
                {categoryName}
              </h2>
              
              <div className="space-y-4">
                {items.map((item, index) => (
                  <article 
                    key={`${categoryName}-${index}`}
                    className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <h3 className="text-xl md:text-2xl font-serif font-bold text-primary">
                            {item.name}
                          </h3>
                          {item.featured && (
                            <span className="text-[10px] uppercase font-semibold tracking-[0.18em] px-2 py-1 rounded-full bg-secondary text-white whitespace-nowrap">
                              Chef's Special
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-gray-600 mt-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {item.price && (
                        <div className="md:text-right">
                          <span className="text-xl font-bold text-secondary whitespace-nowrap">
                            {item.price}
                          </span>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}

          {/* Note about prices */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-12">
            <p className="text-sm text-blue-800 text-center">
              <strong>Note:</strong> Prices are subject to change. Some items may have market price or seasonal availability. 
              Please ask your server for current pricing and availability.
            </p>
          </div>
        </div>
      </main>

      {/* CTA Banner */}
      <section className="bg-primary text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">
            Ready to Experience {RESTAURANT_NAME}?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Reserve your table today and enjoy our exceptional cuisine in an elegant setting.
          </p>
          <Link
            to="/"
            onClick={handleReserveClick}
            className="inline-block bg-secondary text-primary px-10 py-4 rounded-full text-lg font-bold uppercase tracking-widest transition-all duration-300 hover:bg-white hover:shadow-xl hover:-translate-y-1"
          >
            Book a Table Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default MenuPage;
