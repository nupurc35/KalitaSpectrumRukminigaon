
import React from 'react';
import { REVIEWS, REVIEW_COUNT, GOOGLE_RATING } from '../constants';

const Reviews: React.FC = () => {
  return (
    <section id="reviews" className="py-24 px-6 bg-accent text-primary overflow-hidden scroll-mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <h2 className="text-4xl md:text-6xl font-serif mb-4">What Our Guests Say</h2>
            <p className="text-primary/60 max-w-md">Trusted by over {REVIEW_COUNT} local and international food lovers.</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-4xl font-serif font-bold text-secondary">{GOOGLE_RATING}</p>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Google Rating</p>
            </div>
            <div className="h-12 w-px bg-primary/10"></div>
            <div className="text-center">
              <p className="text-4xl font-serif font-bold text-secondary">{REVIEW_COUNT}</p>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Total Reviews</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {REVIEWS.map((review) => (
            <div key={review.id} className="bg-white p-8 rounded-3xl border border-primary/5 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="flex mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <span key={i} className="text-secondary">★</span>
                ))}
              </div>
              <p className="italic text-lg mb-6 leading-relaxed">"{review.comment}"</p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center font-bold text-primary">
                  {review.author[0]}
                </div>
                <div>
                  <p className="font-bold text-sm">{review.author}</p>
                  <p className="text-xs text-primary/40 uppercase tracking-widest font-medium">{review.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a 
            href="https://google.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-primary font-bold hover:text-secondary transition-colors"
          >
            <span>Read all reviews on Google</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7-7m7-7H3"></path></svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
