import React from 'react';
import { Link } from 'react-router-dom';

const GalleryPreview: React.FC = () => {
  const images = [
    "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/327482/pexels-photo-327482.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/7974/food-dinner-eating-lunch.jpg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/1410234/pexels-photo-1410234.jpeg?auto=compress&cs=tinysrgb&w=600",
  ];

  return (
    <div className="text-center">
      {/* Image Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {images.map((src, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <img
              src={src}
              alt={`Gallery image ${idx + 1}`}
              className="object-cover object-center rounded-md"
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </div>

      {/* View Gallery Button */}
      <Link
        to="/gallery"
        className="inline-block px-6 py-3 border border-white text-white uppercase tracking-widest text-sm font-semibold hover:bg-white hover:text-black transition-colors"
      >
        View Full Gallery
      </Link>
    </div>
  );
};


export default GalleryPreview;
