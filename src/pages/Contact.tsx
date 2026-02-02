import React from 'react';
import { MAP_LINK, MAP_EMBED_URL, ADDRESS, PHONE } from '../constants/menu';

const Contact: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-accent scroll-mt-24 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto w-full">
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
  );
};

export default Contact;
