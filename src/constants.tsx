
import { MenuItem, Review } from './types';

export const RESTAURANT_NAME = "Kalita Spectrum";
export const ADDRESS = "GS Rd, Opp. Pantaloons, Rukmini Gaon, Guwahati, Assam 781006";
export const PHONE = "+91 91270 70050";
export const WHATSAPP_LINK = "https://wa.me/918453708792?text=Hi%2C%20I'd%20like%20to%20reserve%20a%20table%20at%20Kalita%20Spectrum.";
export const GOOGLE_RATING = 4.4;
export const REVIEW_COUNT = "6,422";
export const GOOGLE_REVIEW_URL = "https://www.google.com/maps/place/Kalita+Spectrum/@26.1362733,91.7998816,17z/data=!4m8!3m7!1s0x375a58d001a8eed9:0xf12d300a9632bf09!8m2!3d26.1362685!4d91.8024565!9m1!1b1!16s%2Fg%2F11hbgt3_lv?entry=ttu&g_ep=EgoyMDI2MDEyMS4wIKXMDSoKLDEwMDc5MjA2OUgBUAM%3D";

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
  // Appetizers - Indian
  {
    id: 'api1',
    name: 'Tandoori Malai Broccoli',
    description: 'Fresh broccoli florets marinated in cream cheese and cardamom, charred in the tandoor.',
    price: '₹420',
    category: 'Appetizers',
    subCategory: 'Indian',
    image: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&q=80&w=800',
    featured: true,
    highMargin: true,
  },
  {
    id: 'api2',
    name: 'Amritsari Paneer Tikka',
    description: 'Classic cottage cheese skewers with carom seeds and traditional spices.',
    price: '₹445',
    category: 'Appetizers',
    subCategory: 'Indian',
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=800',
    featured: true,
},
  // Appetizers - Continental
  {
    id: 'apc1',
    name: 'Cheesy Garlic Gratin',
    description: 'Crusty baguette slices topped with a house blend of herbs and melted mozzarella.',
    price: '₹320',
    category: 'Appetizers',
    subCategory: 'Continental',
    image: 'https://images.unsplash.com/photo-1573140401552-390e248b71e8?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'apc2',
    name: 'Crispy Mushroom Duets',
    description: 'Stuffed mushrooms with spinach and feta, crumb-fried to golden perfection.',
    price: '₹380',
    category: 'Appetizers',
    subCategory: 'Continental',
    image: 'https://images.unsplash.com/photo-1621841957884-1210fe19d66d?auto=format&fit=crop&q=80&w=800'
  },
  // Soups
  {
    id: 'sp1',
    name: 'Lemon Coriander Soup',
    description: 'A refreshing clear broth infused with fresh coriander and tangy lemon.',
    price: '₹220',
    category: 'Soups',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'sp2',
    name: 'Classic Tomato Bisque',
    description: 'Velvety vine-ripened tomato soup served with a drizzle of basil oil.',
    price: '₹240',
    category: 'Soups',
    image: 'https://images.unsplash.com/photo-1547592115-39d732c53443?auto=format&fit=crop&q=80&w=800'
  },
  // Main Course - Indian
  {
    id: 'mci1',
    name: 'Murgir Jhol',
    description: 'Traditional home-style chicken curry with potatoes and hand-ground spices.',
    price: '₹480',
    category: 'Main Course',
    subCategory: 'Indian',
    image: 'https://images.unsplash.com/photo-1603894527177-9d1f40fbc89d?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'mci2',
    name: 'Paneer Butter Masala',
    description: 'Cottage cheese cubes in a rich, creamy tomato and cashew gravy.',
    price: '₹450',
    category: 'Main Course',
    subCategory: 'Indian',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=800'
  },
  // Main Course - Around the World
  {
    id: 'mcw1',
    name: 'Burmese Khao Suey',
    description: 'Rich coconut curry noodles served with 8 traditional condiments.',
    price: '₹525',
    category: 'Main Course',
    subCategory: 'Around the World',
    image: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'mcw2',
    name: 'Mediterranean Grilled Fish',
    description: 'Herb-crusted sea bass served with saffron risotto and buttered asparagus.',
    price: '₹850',
    category: 'Main Course',
    subCategory: 'Around the World',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800'
  },
  // Desserts
  {
    id: 'd1',
    name: 'Sizzling Brownie',
    description: 'Decadent chocolate brownie with vanilla gelato and hot chocolate sauce.',
    price: '₹350',
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'd2',
    name: 'Gajar Ka Halwa',
    description: 'Slow-cooked carrot pudding with nuts and khoya.',
    price: '₹280',
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1630136594248-18544d93549f?auto=format&fit=crop&q=80&w=800'
  }
];


