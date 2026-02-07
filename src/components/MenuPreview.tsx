import React from 'react';
import { Link } from 'react-router-dom';
import { MENU_ITEMS } from '../constants/menu';

const MenuPreview: React.FC = () => {
  const previewItems = MENU_ITEMS
    .filter((item) => item.featured === true)
    .slice(0, 3);

  return (
    <section className="py-24 px-6 bg-accent">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-secondary uppercase text-[10px] tracking-[0.4em] font-bold mb-4 block">Our Menu</span>
          <h2 className="text-4xl md:text-5xl font-serif mb-4 text-primary">
            Signature Dishes
          </h2>
          <p className="text-primary/60 text-lg max-w-2xl mx-auto">
            A taste of our culinary excellence
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {previewItems.map((item) => (
            <article 
              key={item.id}
              className="scroll-reveal opacity-100 translate-y-0 transition-all duration-1000 ease-out bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                  decoding="async"
                />
                {item.featured && (
                  <span className="absolute top-4 left-4 text-[9px] uppercase font-semibold tracking-[0.18em] px-3 py-1 rounded-full bg-secondary text-white">
                    Chef's Special
                  </span>
                )}
                {item.highlyRecommended && (
                  <span className="absolute top-5 right-5 text-[10px] uppercase font-semibold tracking-[0.25em] px-4 py-1.5 rounded-full bg-primary text-white">
                    Highly Recommended
                  </span>
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-serif font-bold text-primary">
                    {item.name}
                  </h3>
                  <span className="text-secondary font-bold">
                    {item.price}
                  </span>
                </div>
                <p className="text-primary/60 text-sm mb-2">
                  {item.category}
                  {item.subCategory && ` • ${item.subCategory}`}
                </p>
                <p className="text-primary/70 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/menu"
            className="inline-block bg-primary text-white px-12 py-4 rounded-full font-bold uppercase tracking-widest transition-all duration-300 hover:bg-secondary hover:shadow-xl hover:-translate-y-1"
          >
            View Full Menu
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MenuPreview;
