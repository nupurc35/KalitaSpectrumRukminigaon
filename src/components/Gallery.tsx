
import React from 'react';

const IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1550966841-3ee7adac1661?auto=format&fit=crop&q=80&w=800',
    alt: 'Premium Dining Table Setup',
    caption: 'Curated Ambiance'
  },
  {
    url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800',
    alt: 'Modern Restaurant Interior',
    caption: 'Modern Architecture'
  },
  {
    url: 'https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?auto=format&fit=crop&q=80&w=800',
    alt: 'Artisanal Cocktails',
    caption: 'Crafted Spirits'
  },
  {
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800',
    alt: 'Gourmet Plating',
    caption: 'Culinary Art'
  },
  {
    url: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&q=80&w=800',
    alt: 'Elegant Evening Vibe',
    caption: 'Signature Moments'
  },
  {
    url: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&q=80&w=800',
    alt: 'Master Chef in Action',
    caption: 'Expert Craftsmanship'
  }
];

const Gallery: React.FC = () => {
  return (
    <section id="gallery" className="py-24 px-6 bg-primary text-white scroll-mt-24 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-secondary uppercase text-[10px] tracking-[0.4em] font-bold mb-4 block">Visual Journey</span>
          <h2 className="text-4xl md:text-6xl font-serif italic mb-6">The Visual Spectrum</h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto font-light">
            A glimpse into the soul of Kalita Spectrum. Where fine dining meets natural elegance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {IMAGES.map((img, idx) => (
            <div 
              key={idx} 
              className="group relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-white/5 border border-white/10"
            >
              <img 
                src={img.url} 
                alt={img.alt} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                <p className="text-secondary uppercase text-[10px] tracking-widest font-bold mb-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  {img.caption}
                </p>
                <h4 className="text-xl font-serif italic translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                  {img.alt}
                </h4>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center items-center space-x-4 opacity-30">
          <div className="h-px w-20 bg-white"></div>
          <span className="text-[10px] uppercase tracking-[0.5em] font-bold">End of Preview</span>
          <div className="h-px w-20 bg-white"></div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
