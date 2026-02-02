import React from 'react';
import { RESTAURANT_NAME, ADDRESS, PHONE, GOOGLE_RATING, REVIEW_COUNT, MAP_LINK } from '../constants/menu';

const StructuredData: React.FC = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": RESTAURANT_NAME,
    "image": "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=2000",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "GS Rd, Opp. Pantaloons, Rukmini Gaon",
      "addressLocality": "Guwahati",
      "addressRegion": "Assam",
      "postalCode": "781006",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "26.1362685",
      "longitude": "91.8024565"
    },
    "url": "https://kalitaspectrum.com",
    "telephone": PHONE.replace(/\s/g, ''),
    "priceRange": "₹₹₹",
    "servesCuisine": ["Indian", "Continental", "Asian"],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "12:00",
        "closes": "23:30"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Saturday",
          "Sunday"
        ],
        "opens": "11:30",
        "closes": "00:00"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": GOOGLE_RATING.toString(),
      "reviewCount": REVIEW_COUNT.replace(/,/g, ''),
      "bestRating": "5",
      "worstRating": "1"
    },
    "sameAs": [
      MAP_LINK
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default StructuredData;
