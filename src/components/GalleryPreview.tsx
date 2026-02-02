import React from 'react';
import { Link } from 'react-router-dom';

const GalleryPreview: React.FC = () => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[
        "https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/327482/pexels-photo-327482.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/7974/food-dinner-eating-lunch.jpg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=600",
        "https://images.pexels.com/photos/1410234/pexels-photo-1410234.jpeg?auto=compress&cs=tinysrgb&w=600",
      ].map((src, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <img
            src={src}
            alt={`Gallery image ${idx + 1}`}
            className="object-cover object-center rounded-md"
            loading="lazy"
          />
          <h3 className="text-lg font-semibold mt-4">Image Title</h3>
          <p className="text-sm text-gray-500">Image Description</p>
        </div>
      ))}
    </div>
  );
};

export default GalleryPreview;
