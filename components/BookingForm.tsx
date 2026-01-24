
import React, { useState } from 'react';

const BookingForm: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setTimeout(() => {
        setStatus('success');
        window.scrollTo({ top: document.getElementById('book')?.offsetTop! - 100, behavior: 'smooth' });
    }, 1500);
  };

  if (status === 'success') {
    return (
      <section id="book" className="py-24 px-6 bg-primary text-white scroll-mt-24">
        <div className="max-w-3xl mx-auto bg-secondary/10 border border-secondary/30 p-12 rounded-[3rem] text-center">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
            </div>
            <h3 className="text-3xl font-serif mb-2">Reservation Received!</h3>
            <p className="text-white/70">We've sent a confirmation text to your mobile. See you soon!</p>
            <button 
                onClick={() => setStatus('idle')} 
                className="mt-8 bg-secondary text-primary px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-white transition-all shadow-xl"
            >
                Make another booking
            </button>
        </div>
      </section>
    );
  }

  return (
    <section id="book" className="py-24 px-6 bg-primary text-white scroll-mt-24">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="lg:w-1/2">
          <h2 className="text-5xl md:text-7xl font-serif mb-8 leading-tight">Secure your <span className="text-secondary italic">Spectrum</span> experience.</h2>
          <p className="text-lg text-white/60 mb-8 max-w-md">
            Whether it's an intimate date or a vibrant family gathering, we curate every detail to perfection.
          </p>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <p className="font-bold">Fast & Direct</p>
                <p className="text-sm text-white/50">Instant confirmation for your peace of mind.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-1/2 w-full">
          <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-8 md:p-12 rounded-[2.5rem] backdrop-blur-sm space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-white/50">Full Name</label>
                <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-secondary outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-white/50">Phone Number</label>
                <input required type="tel" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-secondary outline-none transition-all" />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-white/50">Date</label>
                <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-secondary outline-none transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-white/50">Time</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-secondary outline-none transition-all">
                  <option className="bg-primary">12:30 PM</option>
                  <option className="bg-primary">01:30 PM</option>
                  <option className="bg-primary">07:00 PM</option>
                  <option className="bg-primary">08:30 PM</option>
                  <option className="bg-primary">09:30 PM</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-white/50">Guests</label>
                <input required type="number" min="1" max="20" placeholder="2" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-secondary outline-none transition-all" />
              </div>
            </div>

            <button 
              disabled={status === 'submitting'}
              type="submit" 
              className="w-full bg-secondary text-primary py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
            >
              {status === 'submitting' ? 'Reserving...' : 'Confirm Reservation'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default BookingForm;
