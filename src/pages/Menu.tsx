import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/superbase';
import { restaurantId } from '@/config/env';
import { useRestaurant } from '../hooks/useRestaurant';

type MenuItemData = {
  id: string;
  name: string;
  description?: string;
  price?: string;
  featured?: boolean;
  highlyRecommended?: boolean;
  mostPopular?: boolean;
  salesLast14Days?: number;
  displayOrder?: number;
};

type MenuCategory = {
  category: string;
  subCategory?: string;
  items: MenuItemData[];
};

type MenuRow = {
  id: string;
  name: string | null;
  description: string | null;
  price: string | null;
  featured: boolean | null;
  highly_recommended: boolean | null;
  most_popular: boolean | null;
  sales_last_14_days: number | null;
  display_order: number | null;
  categories: { id: string; name: string } | null;
  subcategories: { id: string; name: string } | null;
};

type FlatMenuItem = MenuItemData & {
  mostPopular?: boolean;
  category: string;
  subCategory?: string;
  _sortIndex: number;
};

const getCategoryKey = (category: string, subCategory?: string) =>
  subCategory ? `${category} - ${subCategory}` : category;

const rankItems = (items: FlatMenuItem[]) => {
  return [...items].sort((a, b) => {
    const salesDiff = (b.salesLast14Days ?? 0) - (a.salesLast14Days ?? 0);
    if (salesDiff !== 0) return salesDiff;

    const recommendedDiff = Number(!!b.highlyRecommended) - Number(!!a.highlyRecommended);
    if (recommendedDiff !== 0) return recommendedDiff;

    const featuredDiff = Number(!!b.featured) - Number(!!a.featured);
    if (featuredDiff !== 0) return featuredDiff;

    return a._sortIndex - b._sortIndex;
  });
};

const getFilledItems = (
  baseItems: FlatMenuItem[],
  minimumCount = 12
) => {
  return rankItems(baseItems);
};

const MENU_PAGE_SIZE = 200;

const MenuPage: React.FC = () => {
  const { restaurant, loading: restaurantLoading } = useRestaurant();
  const [menuData, setMenuData] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const restaurantName = restaurant?.name ?? 'Our Restaurant';

  useEffect(() => {
    let isMounted = true;

    const fetchMenu = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          id,
          name,
          description,
          price,
          featured,
          highly_recommended,
          most_popular,
          sales_last_14_days,
          display_order,
          categories ( id, name ),
          subcategories ( id, name )
        `)
        .eq("restaurant_id", restaurantId)
        .range(0, MENU_PAGE_SIZE - 1)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Failed to fetch menu items:', error);
        if (isMounted) {
          setMenuData([]);
          setLoading(false);
        }
        return;
      }

      const rows = (data ?? []) as MenuRow[];
      const grouped = new Map<string, MenuCategory>();

      rows.forEach((row) => {
        const category = row.categories?.name ?? 'Uncategorized';
        const subCategory = row.subcategories?.name ?? undefined;
        const key = getCategoryKey(category, subCategory);

        if (!grouped.has(key)) {
          grouped.set(key, { category, subCategory, items: [] });
        }

        grouped.get(key)!.items.push({
          id: String(row.id),
          name: row.name ?? 'Unnamed Item',
          description: row.description ?? undefined,
          price: row.price ?? undefined,
          featured: !!row.featured,
          highlyRecommended: !!row.highly_recommended,
          mostPopular: !!row.most_popular,
          salesLast14Days: row.sales_last_14_days ?? 0,
          displayOrder: row.display_order ?? undefined,
        });
      });

      if (isMounted) {
        setMenuData(Array.from(grouped.values()));
        setLoading(false);
      }
    };

    fetchMenu().catch((err) => {
      console.error('Failed to fetch menu items:', err);
      if (isMounted) {
        setMenuData([]);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(menuData.map((item) => item.category)));
    return ['All', ...uniqueCategories];
  }, [menuData]);

  const subCategories = useMemo(() => {
    if (selectedCategory === 'All') return [];
    const subs = menuData
      .filter((item) => item.category === selectedCategory && item.subCategory)
      .map((item) => item.subCategory as string);
    return ['All', ...Array.from(new Set(subs))];
  }, [menuData, selectedCategory]);

  const allItems = useMemo(() => {
    let sortIndex = 0;
    return menuData.flatMap((category) =>
      category.items.map((item) => ({
        ...item,
        category: category.category,
        subCategory: category.subCategory,
        _sortIndex: sortIndex++,
      }))
    );
  }, [menuData]);

  const rankedAllItems = useMemo(() => rankItems(allItems), [allItems]);

  const displayItems = useMemo(() => {
    if (selectedCategory === 'All') {
      return getFilledItems(allItems, 16);
    }

    const categoryItems = allItems.filter((item) => item.category === selectedCategory);

    if (selectedSubCategory !== 'All') {
      const subCategoryItems = categoryItems.filter(
        (item) => item.subCategory === selectedSubCategory
      );
      return getFilledItems(subCategoryItems, 10);
    }

    return getFilledItems(categoryItems, 12);
  }, [allItems, selectedCategory, selectedSubCategory]);

  const groupOrder = useMemo(
    () => menuData.map((category) => getCategoryKey(category.category, category.subCategory)),
    [menuData]
  );

  const groupedMenu = useMemo(() => {
    const grouped = new Map<string, FlatMenuItem[]>();

    for (const item of displayItems) {
      const key = getCategoryKey(item.category, item.subCategory);
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(item);
    }

    return groupOrder
      .map((key) => [key, grouped.get(key) ?? []] as const)
      .filter(([, items]) => items.length > 0);
  }, [displayItems, groupOrder]);

  const highlightSections = useMemo(() => {
    const used = new Set<string>();

    const mostPopular = rankedAllItems
      .filter((item) => item.mostPopular === true)
      .slice(0, 6);
    mostPopular.forEach((item) => used.add(item.id));

    const chefsSpecial = rankedAllItems
      .filter((item) => item.featured === true && !used.has(item.id))
      .slice(0, 6);
    chefsSpecial.forEach((item) => used.add(item.id));

    const highlyRecommended = rankedAllItems
      .filter((item) => item.highlyRecommended === true && !used.has(item.id))
      .slice(0, 6);
    highlyRecommended.forEach((item) => used.add(item.id));

    return { mostPopular, chefsSpecial, highlyRecommended };
  }, [rankedAllItems]);

  const handleReserveClick = () => {
    // Scroll to reservation section if on home page
    if (window.location.pathname === '/') {
      const reservationSection = document.getElementById('reservation-section');
      if (reservationSection) {
        reservationSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (loading || restaurantLoading) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center">
        <p className="text-primary text-lg">Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent">
      {/* Hero Section */}
      <header className="bg-primary text-white py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-secondary uppercase text-[10px] tracking-[0.4em] font-bold mb-4 block">
            Our Menu
          </span>
          <h1 className="text-4xl md:text-6xl font-serif mb-6">
            {restaurantName} Menu
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Discover our carefully curated selection of authentic Indian and international cuisine, 
            prepared with premium ingredients and traditional techniques.
          </p>
        </div>
      </header>

      {/* Menu Content */}
      <main className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Category Filters */}
          <div className="mb-10 space-y-6">
            <div>
              <p className="text-[10px] uppercase font-semibold tracking-[0.3em] text-primary mb-3">
                Categories
              </p>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setSelectedSubCategory('All');
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                      selectedCategory === category
                        ? 'bg-secondary text-white border-secondary'
                        : 'bg-white text-primary border-gray-200 hover:border-secondary'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {selectedCategory !== 'All' && (
              <div>
                <label
                  htmlFor="subcategory-select"
                  className="text-[10px] uppercase font-semibold tracking-[0.3em] text-primary mb-3 block"
                >
                  Subcategory
                </label>
                <select
                  id="subcategory-select"
                  value={selectedSubCategory}
                  onChange={(event) => setSelectedSubCategory(event.target.value)}
                  className="w-full md:w-72 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-secondary"
                >
                  {subCategories.map((subCategory) => (
                    <option key={subCategory} value={subCategory}>
                      {subCategory}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {highlightSections.mostPopular.length > 0 && (
            <section className="mb-16 scroll-reveal">
              <h2 className="text-3xl md:text-4xl font-serif mb-8 text-primary border-b-2 border-secondary pb-4">
                🔥 Most Popular
              </h2>
              <div className="space-y-4">
                {highlightSections.mostPopular.map((item) => (
                  <article 
                    key={item.id}
                    className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <h3 className="text-xl md:text-2xl font-serif font-bold text-primary">
                            {item.name}
                          </h3>
                          {item.mostPopular && (
                            <span className="text-[10px] uppercase font-semibold tracking-[0.18em] px-2 py-1 rounded-full bg-amber-500 text-white whitespace-nowrap">
                              Most Popular
                            </span>
                          )}
                          {item.highlyRecommended && (
                            <span className="text-[10px] uppercase font-semibold tracking-[0.18em] px-2 py-1 rounded-full bg-blue-500 text-white whitespace-nowrap">
                              Highly Recommended
                            </span>
                          )}
                          {item.featured && (
                            <span className="text-[10px] uppercase font-semibold tracking-[0.18em] px-2 py-1 rounded-full bg-secondary text-white whitespace-nowrap">
                              Chef's Special
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-gray-600 mt-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {item.price && (
                        <div className="md:text-right">
                          <span className="text-xl font-bold text-secondary whitespace-nowrap">
                            {item.price}
                          </span>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {highlightSections.chefsSpecial.length > 0 && (
            <section className="mb-16 scroll-reveal">
              <h2 className="text-3xl md:text-4xl font-serif mb-8 text-primary border-b-2 border-secondary pb-4">
                Chef’s Special
              </h2>
              <div className="space-y-4">
                {highlightSections.chefsSpecial.map((item) => (
                  <article 
                    key={item.id}
                    className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <h3 className="text-xl md:text-2xl font-serif font-bold text-primary">
                            {item.name}
                          </h3>
                          {item.mostPopular && (
                            <span className="text-[10px] uppercase font-semibold tracking-[0.18em] px-2 py-1 rounded-full bg-amber-500 text-white whitespace-nowrap">
                              Most Popular
                            </span>
                          )}
                          {item.highlyRecommended && (
                            <span className="text-[10px] uppercase font-semibold tracking-[0.18em] px-2 py-1 rounded-full bg-blue-500 text-white whitespace-nowrap">
                              Highly Recommended
                            </span>
                          )}
                          {item.featured && (
                            <span className="text-[10px] uppercase font-semibold tracking-[0.18em] px-2 py-1 rounded-full bg-secondary text-white whitespace-nowrap">
                              Chef's Special
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-gray-600 mt-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {item.price && (
                        <div className="md:text-right">
                          <span className="text-xl font-bold text-secondary whitespace-nowrap">
                            {item.price}
                          </span>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {highlightSections.highlyRecommended.length > 0 && (
            <section className="mb-16 scroll-reveal">
              <h2 className="text-3xl md:text-4xl font-serif mb-8 text-primary border-b-2 border-secondary pb-4">
                Highly Recommended
              </h2>
              <div className="space-y-4">
                {highlightSections.highlyRecommended.map((item) => (
                  <article 
                    key={item.id}
                    className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <h3 className="text-xl md:text-2xl font-serif font-bold text-primary">
                            {item.name}
                          </h3>
                          {item.mostPopular && (
                            <span className="text-[10px] uppercase font-semibold tracking-[0.18em] px-2 py-1 rounded-full bg-amber-500 text-white whitespace-nowrap">
                              Most Popular
                            </span>
                          )}
                          {item.highlyRecommended && (
                            <span className="text-[10px] uppercase font-semibold tracking-[0.18em] px-2 py-1 rounded-full bg-blue-500 text-white whitespace-nowrap">
                              Highly Recommended
                            </span>
                          )}
                          {item.featured && (
                            <span className="text-[10px] uppercase font-semibold tracking-[0.18em] px-2 py-1 rounded-full bg-secondary text-white whitespace-nowrap">
                              Chef's Special
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-gray-600 mt-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {item.price && (
                        <div className="md:text-right">
                          <span className="text-xl font-bold text-secondary whitespace-nowrap">
                            {item.price}
                          </span>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Menu Categories */}
          {groupedMenu.map(([categoryName, items]) => (
            <section key={categoryName} className="mb-16 scroll-reveal">
              <h2 className="text-3xl md:text-4xl font-serif mb-8 text-primary border-b-2 border-secondary pb-4">
                {categoryName}
              </h2>
              
              <div className="space-y-4">
                {items.map((item) => (
                  <article 
                    key={item.id}
                    className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <h3 className="text-xl md:text-2xl font-serif font-bold text-primary">
                            {item.name}
                          </h3>
                          {item.mostPopular && (
                            <span className="text-[10px] uppercase font-semibold tracking-[0.18em] px-2 py-1 rounded-full bg-amber-500 text-white whitespace-nowrap">
                              Most Popular
                            </span>
                          )}
                          {item.highlyRecommended && (
                            <span className="text-[10px] uppercase font-semibold tracking-[0.18em] px-2 py-1 rounded-full bg-blue-500 text-white whitespace-nowrap">
                              Highly Recommended
                            </span>
                          )}
                          {item.featured && (
                            <span className="text-[10px] uppercase font-semibold tracking-[0.18em] px-2 py-1 rounded-full bg-secondary text-white whitespace-nowrap">
                              Chef's Special
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-gray-600 mt-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {item.price && (
                        <div className="md:text-right">
                          <span className="text-xl font-bold text-secondary whitespace-nowrap">
                            {item.price}
                          </span>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}

          {/* Note about prices */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-12">
            <p className="text-sm text-blue-800 text-center">
              <strong>Note:</strong> Prices are subject to change. Some items may have market price or seasonal availability. 
              Please ask your server for current pricing and availability.
            </p>
          </div>
        </div>
      </main>

      {/* CTA Banner */}
      <section className="bg-primary text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">
            Ready to Experience {restaurantName}?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Reserve your table today and enjoy our exceptional cuisine in an elegant setting.
          </p>
          <Link
            to="/"
            onClick={handleReserveClick}
            className="inline-block bg-secondary text-primary px-10 py-4 rounded-full text-lg font-bold uppercase tracking-widest transition-all duration-300 hover:bg-white hover:shadow-xl hover:-translate-y-1"
          >
            Book a Table Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default MenuPage;
