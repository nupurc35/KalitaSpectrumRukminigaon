
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: 'Main Course' | 'Appetizers' | 'Soups' | 'Desserts';
  subCategory?: 'Indian' | 'Around the World' | 'Continental';
  image: string;
  featured?: boolean;     // ⭐ Chef’s Special
  highMargin?: boolean;   // 💰 Restaurant profit focus
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface BookingData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
}

export interface Lead {
  id: string;
  phone: string;
  intent: string;
  source: string;
  created_at: string;
  status: 'New' | 'Contacted';
}

export interface Reservation {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests?: number;
  occasion?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
}
