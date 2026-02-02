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
  name: string;
  description?: string;
  price?: string;
  featured?: boolean;
}

export interface MenuCategory {
  category: string;
  subCategory?: string;
  items: MenuItemData[];
}

export const MENU_DATA: MenuCategory[] = [
  {
    category: 'Appetizers',
    subCategory: 'Indian',
    items: [
      {
        name: 'Tandoori Malai Broccoli',
        description: 'Fresh broccoli florets marinated in cream cheese and cardamom, charred in the tandoor',
        price: '₹420',
        featured: true,
      },
      {
        name: 'Amritsari Paneer Tikka',
        description: 'Classic cottage cheese skewers with carom seeds and traditional spices',
        price: '₹445',
        featured: true,
      },
      {
        name: 'Hara Bhara Kebab',
        description: 'Spinach and green peas patties, grilled to perfection',
        price: '₹380',
      },
      {
        name: 'Chicken 65',
        description: 'Spicy deep-fried chicken chunks with curry leaves and red chilies',
        price: '₹395',
      },
    ],
  },
  {
    category: 'Appetizers',
    subCategory: 'Continental',
    items: [
      {
        name: 'Cheesy Garlic Gratin',
        description: 'Crusty baguette slices topped with a house blend of herbs and melted mozzarella',
        price: '₹320',
      },
      {
        name: 'Crispy Mushroom Duets',
        description: 'Stuffed mushrooms with spinach and feta, crumb-fried to golden perfection',
        price: '₹380',
      },
      {
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with parmesan, croutons, and house-made Caesar dressing',
        price: '₹350',
      },
      {
        name: 'Bruschetta Platter',
        description: 'Toasted bread topped with fresh tomatoes, basil, and mozzarella',
        price: '₹340',
      },
    ],
  },
  {
    category: 'Soups',
    items: [
      {
        name: 'Lemon Coriander Soup',
        description: 'A refreshing clear broth infused with fresh coriander and tangy lemon',
        price: '₹220',
      },
      {
        name: 'Classic Tomato Bisque',
        description: 'Velvety vine-ripened tomato soup served with a drizzle of basil oil',
        price: '₹240',
      },
      {
        name: 'Cream of Mushroom Soup',
        description: 'Rich and creamy mushroom soup with a hint of herbs',
        price: '₹250',
      },
      {
        name: 'Hot and Sour Soup',
        description: 'Traditional Chinese-style soup with vegetables and tofu',
        price: '₹230',
      },
    ],
  },
  {
    category: 'Main Course',
    subCategory: 'Indian',
    items: [
      {
        name: 'Murgir Jhol',
        description: 'Traditional home-style chicken curry with potatoes and hand-ground spices',
        price: '₹480',
      },
      {
        name: 'Paneer Butter Masala',
        description: 'Cottage cheese cubes in a rich, creamy tomato and cashew gravy',
        price: '₹450',
      },
      {
        name: 'Dal Makhani',
        description: 'Slow-cooked black lentils with butter and cream',
        price: '₹380',
      },
      {
        name: 'Biryani',
        description: 'Fragrant basmati rice cooked with marinated meat and aromatic spices',
        price: '₹520',
        featured: true,
      },
      {
        name: 'Butter Chicken',
        description: 'Tender chicken in a creamy tomato-based curry',
        price: '₹490',
      },
    ],
  },
  {
    category: 'Main Course',
    subCategory: 'Around the World',
    items: [
      {
        name: 'Burmese Khao Suey',
        description: 'Rich coconut curry noodles served with 8 traditional condiments',
        price: '₹525',
        featured: true,
      },
      {
        name: 'Mediterranean Grilled Fish',
        description: 'Herb-crusted sea bass served with saffron risotto and buttered asparagus',
        price: '₹850',
      },
      {
        name: 'Pasta Carbonara',
        description: 'Classic Italian pasta with bacon, eggs, and parmesan cheese',
        price: '₹480',
      },
      {
        name: 'Thai Green Curry',
        description: 'Aromatic green curry with vegetables and jasmine rice',
        price: '₹460',
      },
    ],
  },
  {
    category: 'Beverages',
    items: [
      {
        name: 'Fresh Lime Soda',
        description: 'Refreshing lime juice with soda and mint',
        price: '₹120',
      },
      {
        name: 'Mango Lassi',
        description: 'Sweet mango yogurt drink, traditional and refreshing',
        price: '₹150',
      },
      {
        name: 'Fresh Fruit Juice',
        description: 'Seasonal fresh fruit juice',
        price: '₹180',
      },
      {
        name: 'Iced Tea',
        description: 'House-blend iced tea with lemon',
        price: '₹140',
      },
      {
        name: 'Coffee',
        description: 'Hot coffee, espresso, or cappuccino',
        price: '₹160',
      },
    ],
  },
  {
    category: 'Desserts',
    items: [
      {
        name: 'Sizzling Brownie',
        description: 'Decadent chocolate brownie with vanilla gelato and hot chocolate sauce',
        price: '₹350',
        featured: true,
      },
      {
        name: 'Gajar Ka Halwa',
        description: 'Slow-cooked carrot pudding with nuts and khoya',
        price: '₹280',
      },
      {
        name: 'Gulab Jamun',
        description: 'Soft milk dumplings in rose-flavored sugar syrup',
        price: '₹240',
      },
      {
        name: 'Ice Cream Sundae',
        description: 'Vanilla ice cream with chocolate sauce and nuts',
        price: '₹320',
      },
      {
        name: 'Cheesecake',
        description: 'New York-style cheesecake with berry compote',
        price: '₹380',
      },
    ],
  },
];
