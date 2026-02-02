
import React from 'react';
import {BUSINESS } from '../constants/business';

const Reviews: React.FC = () => {
  return (
    <section
      id="reviews"
      className="py-24 px-6 bg-accent text-primary text-center scroll-mt-24"
    >
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-serif mb-6">
          Loved by Our Guests
        </h2>

        <p className="text-primary/70 text-lg mb-8">
          ⭐ {BUSINESS.google.rating} rating on Google  
          <br />
          Based on {BUSINESS.google.reviewCount}+ verified reviews
        </p>

        <a
          href={BUSINESS.google. reviewsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-semibold hover:bg-secondary transition"
        >
          Read all reviews on Google
        </a>

        <p className="text-xs text-primary/40 mt-4">
          Reviews are hosted on Google
        </p>
      </div>
    </section>
  );
};

export default Reviews;

