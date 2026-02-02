import React from 'react';

const WhySection: React.FC = () => {
  const features = [
    {
      title: 'Authentic Flavors',
      description: 'Traditional recipes passed down through generations, prepared with premium ingredients and modern techniques.',
      icon: '🍽️'
    },
    {
      title: 'Elegant Ambiance',
      description: 'A serene dining space that blends natural elegance with contemporary design, creating the perfect atmosphere.',
      icon: '✨'
    },
    {
      title: 'Exceptional Service',
      description: 'Dedicated staff committed to providing an unforgettable dining experience with attention to every detail.',
      icon: '👨‍🍳'
    }
  ];

  return (
    <section className="py-24 px-6 bg-primary">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-secondary uppercase text-[10px] tracking-[0.4em] font-bold mb-4 block">Why Choose Us</span>
          <h2 className="text-4xl md:text-5xl font-serif mb-4 text-white">
            Why Kalita Spectrum
          </h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Experience the perfect blend of tradition and innovation
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <article 
              key={index}
              className="scroll-reveal opacity-100 translate-y-0 md:opacity-0 md:translate-y-10 transition-all duration-1000 ease-out bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-serif mb-4 text-white">
                {feature.title}
              </h3>
              <p className="text-white/70 leading-relaxed">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhySection;
