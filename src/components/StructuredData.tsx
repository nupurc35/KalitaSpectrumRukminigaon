import React from 'react';
import { GOOGLE_RATING, REVIEW_COUNT, MAP_LINK } from '../constants/menu';
import { useRestaurant } from '../hooks/useRestaurant';

const StructuredData: React.FC = () => {
  const { restaurant, loading } = useRestaurant();

  if (loading) {
    return null;
  }

  const structuredData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": restaurant?.name ?? "",
    "image": "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=2000",
    "url": "https://kalitaspectrum.com",
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

  if (restaurant?.address) {
    structuredData.address = {
      "@type": "PostalAddress",
      "streetAddress": restaurant.address
    };
  }

  if (restaurant?.phone) {
    structuredData.telephone = restaurant.phone.replace(/\s/g, '');
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default StructuredData;
