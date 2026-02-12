import React from 'react';
import HeroSection from '../components/HeroSection';
import TrustSection from '../components/TrustSection';
import ReservationForm from '../components/ReservationForm';
import WhySection from '../components/WhySection';
import MenuPreview from '../components/MenuPreview';
import GalleryPreview from '../components/GalleryPreview';
import { useRestaurant } from '../hooks/useRestaurant';
import { Section } from '../components/section';

const LoadingSkeleton: React.FC = () => (
  <main className="w-full" role="main">
    <h1 className="sr-only">Kalita Spectrum Restaurant</h1>

    {/* Hero Skeleton */}
    <div className="w-full h-96 bg-slate-200 motion-safe:animate-pulse" />

    {/* Trust Section Skeleton */}
    <section className="w-full py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto space-y-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-12">Why Choose Us</h2>
        <div className="h-8 bg-slate-200 rounded motion-safe:animate-pulse w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded motion-safe:animate-pulse" />
          ))}
        </div>
      </div>
    </section>

    {/* Reservation Section Skeleton */}
    <section className="w-full bg-slate-900 py-24">
      <div className="max-w-4xl mx-auto px-6 space-y-4">
        <h2 className="text-3xl font-bold text-white mb-8">Make a Reservation</h2>
        <div className="h-8 bg-slate-700 rounded motion-safe:animate-pulse w-48" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-slate-700 rounded motion-safe:animate-pulse" />
          ))}
        </div>
      </div>
    </section>

    {/* Why Section Skeleton */}
    <section className="w-full py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Why Kalita Spectrum</h2>
        <div className="h-8 bg-slate-200 rounded motion-safe:animate-pulse w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-slate-200 rounded motion-safe:animate-pulse" />
          ))}
        </div>
      </div>
    </section>

    {/* Menu Preview Skeleton */}
    <section className="w-full py-16 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Our Menu</h2>
        <div className="h-8 bg-slate-200 rounded motion-safe:animate-pulse w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-200 rounded motion-safe:animate-pulse" />
          ))}
        </div>
      </div>
    </section>

    {/* Gallery Skeleton */}
    <section className="w-full py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">Gallery</h2>
        <div className="h-8 bg-slate-200 rounded motion-safe:animate-pulse w-48 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-40 bg-slate-200 rounded motion-safe:animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  </main>
);

const ErrorState: React.FC<{ retry: () => void }> = ({ retry }) => (
  <main className="w-full min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
    <div className="max-w-lg text-center">
      <div className="mb-6">
        <svg
          className="w-16 h-16 mx-auto text-amber-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4v2m0 4v2M9.172 5.172a4 4 0 115.656 5.656m0 2.828a4 4 0 115.656-5.656"
          />
        </svg>
      </div>
      <h1 className="text-3xl font-serif font-bold mb-3">Unable to Load</h1>
      <p className="text-white/60 mb-8">
        We're having trouble connecting to our server. This could be a temporary issue. Please try again or contact us if the problem persists.
      </p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={retry}
          className="px-6 py-3 rounded-full bg-secondary text-black font-bold uppercase tracking-widest hover:bg-white transition-colors"
        >
          Try Again
        </button>
        <a
          href="/contact"
          className="px-6 py-3 rounded-full bg-white/10 text-white font-bold uppercase tracking-widest hover:bg-white/20 transition-colors border border-white/20"
        >
          Contact Us
        </a>
      </div>
    </div>
  </main>
);

const Home: React.FC = () => {
  const { restaurant, loading, error } = useRestaurant();
  const handleRetry = () => {
    window.location.reload();
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState retry={handleRetry} />;
  }

  return (
    <main className="w-full" role="main">
      <h1 className="sr-only">Kalita Spectrum Restaurant</h1>
      
      {/* 1. Hero Section */}
      <HeroSection restaurantName={restaurant?.name ?? undefined} />

      {/* 2. Trust Section */}
    {/*  <Section className="bg-background text-foreground">
            <h2 className="text-2xl font-semibold mb-8">
              Why Choose Us
          </h2>
               <TrustSection />
      </Section> */}

    

      {/* 3. Reservation Section */}
      <section id="reservation-section" className="w-full bg-slate-900 py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-8">Make a Reservation</h2>
          <ReservationForm />
        </div>
      </section>

      {/* 4. Why Kalita Spectrum Section */}
      <section className="w-full">
        <h2 className="sr-only">Why Kalita Spectrum</h2>
        <WhySection />
      </section>

      {/* 5. Menu Preview Section */}
      <section className="w-full">
        <h2 className="sr-only">Our Menu</h2>
        <MenuPreview />
      </section>

      {/* 6. Gallery Preview Section */}
      <section className="w-full">
        <h2 className="sr-only">Gallery</h2>
        <GalleryPreview />
      </section>
    </main>
  );
};

export default Home;
