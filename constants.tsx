
import { MenuItem, Review } from './types';

export const RESTAURANT_NAME = "Kalita Spectrum";
export const ADDRESS = "GS Rd, Opp. Pantaloons, Rukmini Gaon, Guwahati, Assam 781006";
export const PHONE = "+91 91270 70050";
export const WHATSAPP_LINK = "https://wa.me/919127070050?text=Hi%2C%20I'd%20like%20to%20reserve%20a%20table%20at%20Kalita%20Spectrum.";
export const GOOGLE_RATING = 4.4;
export const REVIEW_COUNT = "6,422";

export const MENU_LINKS = [
  { label: "Main Menu", url: "https://maps.app.goo.gl/Pw118eEj5D6d8ghA8" },
  { label: "Continental Grills", url: "https://maps.app.goo.gl/LX2aTA6YBaLbwqTy8" },
  { label: "Oriental Delights", url: "https://maps.app.goo.gl/7QbgY1LpTSbNcFg9A" },
  { label: "Beverage Bar", url: "https://maps.app.goo.gl/HLgp8fXJLWQ6VjkN9" },
  { label: "Desserts", url: "https://maps.app.goo.gl/CJpNNaytpzPFGuex7" },
  { label: "Guest Gallery", url: "https://maps.app.goo.gl/6ydbDEaBMfRWngYq5" }
];

export const MAP_EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m12!1m3!1d3581.085876378129!2d91.8024565!3d26.1362685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x375a58d001a8eed9%3A0xf12d300a9632bf09!2sKalita%20Spectrum!5e0!3m2!1sen!2sin!4v1710000000000!5m2!1sen!2sin";
export const MAP_LINK = "https://maps.app.goo.gl/fyAkMqjvwbQrmXRNA";

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'mm1',
    name: 'Murgir Jhol',
    description: 'Traditional home-style chicken curry with potatoes and hand-ground spices.',
    price: '₹480',
    category: 'Main Menu',
    image: 'https://images.unsplash.com/photo-1603894527177-9d1f40fbc89d?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'mm2',
    name: 'Jujeh Kabab',
    description: 'Saffron-marinated tender chicken chunks grilled in a traditional clay oven.',
    price: '₹520',
    category: 'Main Menu',
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'cg1',
    name: 'Spectrum Sizzler',
    description: 'Prime cuts of grilled meat served on a sizzling platter with buttered rice and veggies.',
    price: '₹895',
    category: 'Continental Grills',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'cg2',
    name: 'Herb Fish Gratin',
    description: 'Baked fish fillet with a golden herb crust, served with lemon butter sauce.',
    price: '₹620',
    category: 'Continental Grills',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'od1',
    name: 'Burmese Khao Suey',
    description: 'Rich coconut curry noodles served with 8 traditional condiments.',
    price: '₹525',
    category: 'Oriental Delights',
    image: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'od2',
    name: 'Basil Garlic Prawns',
    description: 'Wok-tossed prawns with Thai basil, garlic, and birds eye chili.',
    price: '₹680',
    category: 'Oriental Delights',
    image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'bb1',
    name: 'Guava Chili Mocktail',
    description: 'Guava nectar with a spicy chili kick and a black salt rim.',
    price: '₹245',
    category: 'Beverage Bar',
    image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'd1',
    name: 'Sizzling Brownie',
    description: 'Decadent chocolate brownie with vanilla gelato and hot chocolate sauce.',
    price: '₹350',
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=800'
  }
];

export const REVIEWS: Review[] = [
  {
    id: 'r1',
    author: 'Anjali Sharma',
    rating: 5,
    comment: 'Exceptional variety! The North Indian mains are heart-warming and the service is impeccable.',
    date: '2 weeks ago'
  },
  {
    id: 'r2',
    author: 'David Wright',
    rating: 5,
    comment: 'The Continental grills here are the best in the city. Perfectly seasoned and great portion sizes.',
    date: '1 month ago'
  }
];
