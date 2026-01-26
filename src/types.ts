
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
