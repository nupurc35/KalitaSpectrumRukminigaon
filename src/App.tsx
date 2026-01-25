
import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ReservationForm from "./components/ReservationForm";
import Menu from './components/Menu';
import Gallery from './components/Gallery';
import Reviews from './components/Reviews';
import Footer from './components/Footer';
import { RESTAURANT_NAME, MAP_LINK, MAP_EMBED_URL, ADDRESS, PHONE } from './constants';

const App: React.FC = () => {
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
    <div className="relative min-h-screen">
      <Navbar />
      
      <main>
        <Hero />
   <section className="w-full bg-slate-900 py-24">
         <div className="max-w-4xl mx-auto px-6">
              <ReservationForm />
         </div>
  </section>
        
        <div className="scroll-reveal opacity-0 translate-y-10 transition-all duration-1000 ease-out">
          <Menu />
        </div>

        {/* Section 3: About with Forest Background */}
        <section id="about" className="relative py-32 px-6 overflow-hidden scroll-mt-24">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=2000" 
              className="w-full h-full object-cover"
              alt="Nature Background"
            />
            <div className="absolute inset-0 bg-primary/85 backdrop-blur-[2px]"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 md:order-1">
              <img 
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1200" 
                alt="Kalita Spectrum Interior"
                className="rounded-3xl shadow-2xl relative z-10 w-full h-[500px] object-cover border border-white/10"
              />
              <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-secondary rounded-3xl z-0 opacity-50"></div>
            </div>
            <div className="scroll-reveal opacity-0 translate-y-10 transition-all duration-1000 ease-out order-1 md:order-2">
              <span className="text-secondary uppercase text-[10px] tracking-[0.4em] font-bold mb-4 block">Our Philosophy</span>
              <h2 className="text-4xl md:text-6xl font-serif mb-8 leading-tight">Authentic Soul, <br />Modern Craft.</h2>
              <p className="text-white/80 text-lg mb-6 leading-relaxed">
                Located in the heart of Guwahati at GS Road, {RESTAURANT_NAME} is an urban sanctuary where culinary borders fade. We blend high-art Indian gastronomy with sophisticated global influences.
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

        <div className="scroll-reveal opacity-0 translate-y-10 transition-all duration-1000 ease-out">
          <Gallery />
        </div>

        <div className="scroll-reveal opacity-0 translate-y-10 transition-all duration-1000 ease-out">
          <Reviews />
        </div>

        <section id="location" className="py-24 px-6 bg-accent scroll-mt-24">
           <div className="max-w-7xl mx-auto">
              <div className="bg-primary rounded-[40px] overflow-hidden flex flex-col lg:flex-row shadow-2xl border border-white/5">
                 <div className="p-8 md:p-16 lg:w-2/5 flex flex-col justify-center">
                    <span className="text-secondary uppercase text-[10px] tracking-widest font-bold mb-4">Location & Hours</span>
                    <h3 className="text-4xl md:text-5xl font-serif mb-8 text-white italic">Visit Spectrum</h3>
                    <div className="space-y-8">
                       <div>
                          <p className="text-white/50 uppercase text-[10px] tracking-widest font-bold mb-2">Our Address</p>
                          <p className="text-white text-lg leading-relaxed">{ADDRESS}</p>
                       </div>
                       <div>
                          <p className="text-white/50 uppercase text-[10px] tracking-widest font-bold mb-2">Direct Contact</p>
                          <a href={`tel:${PHONE.replace(/\s/g, '')}`} className="text-secondary text-3xl font-serif hover:text-white transition-colors">{PHONE}</a>
                       </div>
                       <div className="pt-4">
                         <a 
                            href={MAP_LINK} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-3 bg-secondary text-primary px-8 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-secondary/10"
                          >
                            <span>Open in Google Maps</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                          </a>
                       </div>
                    </div>
                 </div>
                 <div className="lg:w-3/5 min-h-[500px] relative">
                    <iframe 
                      src={MAP_EMBED_URL}
                      width="100%" 
                      height="100%" 
                      style={{ border: 0, minHeight: '500px' }} 
                      allowFullScreen={true} 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                      className="grayscale-[0.1] contrast-[1.1] hover:grayscale-0 transition-all duration-700"
                    ></iframe>
                 </div>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default App;
