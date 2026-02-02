import React from 'react';
import { GOOGLE_RATING, REVIEW_COUNT, GOOGLE_REVIEW_URL } from '../constants/menu';

const TrustSection: React.FC = () => {
  return (
    <section className="py-16 px-6 bg-accent">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-primary/10 shadow-lg">
          <span className="text-secondary text-2xl">★</span>
          <div className="text-left">
            <p className="text-primary font-bold text-lg">
              {GOOGLE_RATING} Google Rating
            </p>
            <p className="text-primary/60 text-sm">
              Based on {REVIEW_COUNT}+ verified reviews
            </p>
          </div>
          <a 
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 text-primary/80 hover:text-primary text-sm font-medium underline"
          >
            Read Reviews
          </a>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
