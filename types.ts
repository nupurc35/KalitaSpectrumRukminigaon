
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: 'Main Menu' | 'Continental Grills' | 'Oriental Delights' | 'Beverage Bar' | 'Desserts';
  image: string;
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
