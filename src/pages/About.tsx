import React, { useEffect } from 'react';
import { useRestaurant } from '../hooks/useRestaurant';

const About: React.FC = () => {
  const { restaurant, loading } = useRestaurant();

  useEffect(() => {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.scroll-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const address = restaurant?.address ?? 'the heart of the city';
  const name = restaurant?.name ?? 'our restaurant';

  if (loading) {
    return null;
  }

  return (
    <section className="relative py-32 px-6 overflow-hidden scroll-mt-24 min-h-screen flex items-center">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=2000" 
          className="w-full h-full object-cover"
          alt="Nature Background"
          decoding="async"
        />
        <div className="absolute inset-0 bg-primary/85 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div className="relative order-2 md:order-1">
          <img 
            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1200" 
            alt={`${name} interior`}
            className="rounded-3xl shadow-2xl relative z-10 w-full h-[500px] object-cover border border-white/10"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-secondary rounded-3xl z-0 opacity-50"></div>
        </div>
        <div className="scroll-reveal opacity-0 translate-y-10 transition-all duration-1000 ease-out order-1 md:order-2">
          <span className="text-secondary uppercase text-[10px] tracking-[0.4em] font-bold mb-4 block">Our Philosophy</span>
          <h2 className="text-4xl md:text-6xl font-serif mb-8 leading-tight">Authentic Soul, <br />Modern Craft.</h2>
          <p className="text-white/80 text-lg mb-6 leading-relaxed">
            Located at {address}, {name} is an urban sanctuary where culinary borders fade. We blend high-art Indian gastronomy with sophisticated global influences.
          </p>
          <p className="text-white/70 text-lg mb-8 leading-relaxed italic border-l-2 border-secondary pl-6">
            "Our mission is to serve as the definitive spectrum of modern dining—a place where every flavor tells a story of tradition and innovation, set against the backdrop of natural elegance."
          </p>
          <div className="flex items-center space-x-4">
            <div className="h-px w-12 bg-secondary"></div>
            <span className="uppercase tracking-[0.3em] text-xs font-bold text-secondary text-nowrap">The Kalita Standard</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
