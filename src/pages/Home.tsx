import React, { useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import TrustSection from '../components/TrustSection';
import ReservationForm from '../components/ReservationForm';
import WhySection from '../components/WhySection';
import MenuPreview from '../components/MenuPreview';
import GalleryPreview from '../components/GalleryPreview';
import LocationSection from '../components/LocationSection';

const Home: React.FC = () => {
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

  return (
    <>
      {/* 1. Hero Section */}
      <HeroSection />
      
      {/* 2. Trust Section */}
      <TrustSection />

      {/* 3. Reservation Section */}
      <section id="reservation-section" className="w-full bg-slate-900 py-24">
        <div className="max-w-4xl mx-auto px-6">
          <ReservationForm />
        </div>
      </section>

      {/* 4. Why Kalita Spectrum Section */}
      <WhySection />

      {/* 5. Menu Preview Section */}
      <MenuPreview />

      {/* 6. Gallery Preview Section */}
      <GalleryPreview />

      {/* 7. Location & Hours Section */}
      <LocationSection />
    </>
  );
};

export default Home;
