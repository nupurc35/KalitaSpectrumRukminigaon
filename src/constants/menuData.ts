/**
 * Menu Data Structure
 * 
 * This file contains the menu items organized by categories.
 * Easy to replace with actual menu data.
 * 
 * Structure:
 * - category: Main category name
 * - subCategory: Optional subcategory
 * - items: Array of menu items
 *   - name: Item name (required)
 *   - description: Item description (optional, good for SEO)
 *   - price: Price (optional - can be omitted for "Market Price" or "Ask Server")
 */

export interface MenuItemData {
  id: string;
  name: string;
  description?: string;
  price?: string;
  featured?: boolean;
  highlyRecommended?: boolean;
  salesLast14Days?: number;
}

export interface MenuCategory {
  id: string;
  category: string;
  subCategory?: string;
  items: MenuItemData[];
}

export const MENU_DATA: MenuCategory[] = [
  {
    id: 'cat-appetizers-indian',
    category: 'Appetizers',
    subCategory: 'Indian',
    items: [
      {
        id: 'item-appetizers-indian-tandoori-malai-broccoli',
        name: 'Tandoori Malai Broccoli',
        description: 'Fresh broccoli florets marinated in cream cheese and cardamom, charred in the tandoor',
        price: '₹420',
        featured: true,
      },
      {
        id: 'item-appetizers-indian-amritsari-paneer-tikka',
        name: 'Amritsari Paneer Tikka',
        description: 'Classic cottage cheese skewers with carom seeds and traditional spices',
        price: '₹445',
        featured: true,
      },
      {
        id: 'item-appetizers-indian-hara-bhara-kebab',
        name: 'Hara Bhara Kebab',
        description: 'Spinach and green peas patties, grilled to perfection',
        price: '₹380',
      },
      {
        id: 'item-appetizers-indian-chicken-65',
        name: 'Chicken 65',
        description: 'Spicy deep-fried chicken chunks with curry leaves and red chilies',
        price: '₹395',
      },
    ],
  },
  {
    id: 'cat-appetizers-continental',
    category: 'Appetizers',
    subCategory: 'Continental',
    items: [
      {
        id: 'item-appetizers-continental-cheesy-garlic-gratin',
        name: 'Cheesy Garlic Gratin',
        description: 'Crusty baguette slices topped with a house blend of herbs and melted mozzarella',
        price: '₹320',
      },
      {
        id: 'item-appetizers-continental-crispy-mushroom-duets',
        name: 'Crispy Mushroom Duets',
        description: 'Stuffed mushrooms with spinach and feta, crumb-fried to golden perfection',
        price: '₹380',
      },
      {
        id: 'item-appetizers-continental-caesar-salad',
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with parmesan, croutons, and house-made Caesar dressing',
        price: '₹350',
      },
      {
        id: 'item-appetizers-continental-bruschetta-platter',
        name: 'Bruschetta Platter',
        description: 'Toasted bread topped with fresh tomatoes, basil, and mozzarella',
        price: '₹340',
      },
    ],
  },
  {
    id: 'cat-soups',
    category: 'Soups',
    items: [
      {
        id: 'item-soups-lemon-coriander-soup',
        name: 'Lemon Coriander Soup',
        description: 'A refreshing clear broth infused with fresh coriander and tangy lemon',
        price: '₹220',
      },
      {
        id: 'item-soups-classic-tomato-bisque',
        name: 'Classic Tomato Bisque',
        description: 'Velvety vine-ripened tomato soup served with a drizzle of basil oil',
        price: '₹240',
      },
      {
        id: 'item-soups-cream-of-mushroom-soup',
        name: 'Cream of Mushroom Soup',
        description: 'Rich and creamy mushroom soup with a hint of herbs',
        price: '₹250',
      },
      {
        id: 'item-soups-hot-and-sour-soup',
        name: 'Hot and Sour Soup',
        description: 'Traditional Chinese-style soup with vegetables and tofu',
        price: '₹230',
      },
    ],
  },
  {
    id: 'cat-main-course-indian',
    category: 'Main Course',
    subCategory: 'Indian',
    items: [
      {
        id: 'item-main-course-indian-murgir-jhol',
        name: 'Murgir Jhol',
        description: 'Traditional home-style chicken curry with potatoes and hand-ground spices',
        price: '₹480',
      },
      {
        id: 'item-main-course-indian-paneer-butter-masala',
        name: 'Paneer Butter Masala',
        description: 'Cottage cheese cubes in a rich, creamy tomato and cashew gravy',
        price: '₹450',
      },
      {
        id: 'item-main-course-indian-dal-makhani',
        name: 'Dal Makhani',
        description: 'Slow-cooked black lentils with butter and cream',
        price: '₹380',
      },
      {
        id: 'item-main-course-indian-biryani',
        name: 'Biryani',
        description: 'Fragrant basmati rice cooked with marinated meat and aromatic spices',
        price: '₹520',
        featured: true,
      },
      {
        id: 'item-main-course-indian-butter-chicken',
        name: 'Butter Chicken',
        description: 'Tender chicken in a creamy tomato-based curry',
        price: '₹490',
      },
    ],
  },
  {
    id: 'cat-main-course-world',
    category: 'Main Course',
    subCategory: 'Around the World',
    items: [
      {
        id: 'item-main-course-world-burmese-khao-suey',
        name: 'Burmese Khao Suey',
        description: 'Rich coconut curry noodles served with 8 traditional condiments',
        price: '₹525',
        featured: true,
      },
      {
        id: 'item-main-course-world-mediterranean-grilled-fish',
        name: 'Mediterranean Grilled Fish',
        description: 'Herb-crusted sea bass served with saffron risotto and buttered asparagus',
        price: '₹850',
      },
      {
        id: 'item-main-course-world-pasta-carbonara',
        name: 'Pasta Carbonara',
        description: 'Classic Italian pasta with bacon, eggs, and parmesan cheese',
        price: '₹480',
      },
      {
        id: 'item-main-course-world-thai-green-curry',
        name: 'Thai Green Curry',
        description: 'Aromatic green curry with vegetables and jasmine rice',
        price: '₹460',
      },
    ],
  },
  {
    id: 'cat-beverages',
    category: 'Beverages',
    items: [
      {
        id: 'item-beverages-fresh-lime-soda',
        name: 'Fresh Lime Soda',
        description: 'Refreshing lime juice with soda and mint',
        price: '₹120',
      },
      {
        id: 'item-beverages-mango-lassi',
        name: 'Mango Lassi',
        description: 'Sweet mango yogurt drink, traditional and refreshing',
        price: '₹150',
      },
      {
        id: 'item-beverages-fresh-fruit-juice',
        name: 'Fresh Fruit Juice',
        description: 'Seasonal fresh fruit juice',
        price: '₹180',
      },
      {
        id: 'item-beverages-iced-tea',
        name: 'Iced Tea',
        description: 'House-blend iced tea with lemon',
        price: '₹140',
      },
      {
        id: 'item-beverages-coffee',
        name: 'Coffee',
        description: 'Hot coffee, espresso, or cappuccino',
        price: '₹160',
      },
    ],
  },
  {
    id: 'cat-desserts',
    category: 'Desserts',
    items: [
      {
        id: 'item-desserts-sizzling-brownie',
        name: 'Sizzling Brownie',
        description: 'Decadent chocolate brownie with vanilla gelato and hot chocolate sauce',
        price: '₹350',
        featured: true,
      },
      {
        id: 'item-desserts-gajar-ka-halwa',
        name: 'Gajar Ka Halwa',
        description: 'Slow-cooked carrot pudding with nuts and khoya',
        price: '₹280',
      },
      {
        id: 'item-desserts-gulab-jamun',
        name: 'Gulab Jamun',
        description: 'Soft milk dumplings in rose-flavored sugar syrup',
        price: '₹240',
      },
      {
        id: 'item-desserts-ice-cream-sundae',
        name: 'Ice Cream Sundae',
        description: 'Vanilla ice cream with chocolate sauce and nuts',
        price: '₹320',
      },
      {
        id: 'item-desserts-cheesecake',
        name: 'Cheesecake',
        description: 'New York-style cheesecake with berry compote',
        price: '₹380',
      },
    ],
  },
];
