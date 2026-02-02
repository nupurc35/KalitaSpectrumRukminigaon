import React from 'react';
import { Link } from 'react-router-dom';

const GalleryPreview: React.FC = () => {
  const previewImages = [
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
    }
  ];

  return (
    <section className="py-24 px-6 bg-primary">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-secondary uppercase text-[10px] tracking-[0.4em] font-bold mb-4 block">Gallery</span>
          <h2 className="text-4xl md:text-5xl font-serif mb-4 text-white">
            Experience the Ambiance
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            A glimpse into our elegant dining space
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {previewImages.map((img, index) => (
            <article 
              key={index}
              className="scroll-reveal opacity-100 translate-y-0 md:opacity-0 md:translate-y-10 transition-all duration-1000 ease-out group relative aspect-[4/5] overflow-hidden rounded-2xl bg-white/5 border border-white/10"
            >
              <img 
                src={img.url} 
                alt={img.alt}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                <p className="text-secondary uppercase text-[10px] tracking-widest font-bold mb-1">
                  {img.caption}
                </p>
                <h4 className="text-lg font-serif italic">
                  {img.alt}
                </h4>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/about"
            className="inline-block bg-secondary text-primary px-12 py-4 rounded-full font-bold uppercase tracking-widest transition-all duration-300 hover:bg-white hover:shadow-xl hover:-translate-y-1"
          >
            Learn More About Us
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GalleryPreview;
