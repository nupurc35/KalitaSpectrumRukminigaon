export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  subCategory?: string;

  image: string;

  featured?: boolean;
  highMargin?: boolean;
  highlyRecommended?: boolean;
}
