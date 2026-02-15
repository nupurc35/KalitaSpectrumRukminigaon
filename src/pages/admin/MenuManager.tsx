import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/superbase";
import { restaurantId } from "@/config/env";
import { Toaster, toast } from "react-hot-toast";
import { Layout } from "@/components/crm/Layout";
import { Card } from "@/components/crm/Card";
import { Plus, Search, Edit2, Trash2, X } from "lucide-react";

type MenuRow = {
  id: string;
  name: string | null;
  description: string | null;
  price: number | null;
  featured: boolean | null;
  highly_recommended: boolean | null;
  most_popular: boolean | null;
  category_id: string | null;
  subcategory_id: string | null;
  categories: { id: string; name: string } | null;
  subcategories: { id: string; name: string } | null;
};

type LookupRow = {
  id: string;
  name: string;
};

type MenuFormData = {
  name: string;
  description: string;
  price: string;
  category_id: string;
  subcategory_id: string;
  featured: boolean;
  most_popular: boolean;
  highly_recommended: boolean;
};

const emptyFormData: MenuFormData = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  subcategory_id: "",
  featured: false,
  most_popular: false,
  highly_recommended: false,
};

const CURRENT_RESTAURANT_ID = restaurantId;

const MenuManager: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuRow[]>([]);
  const [categories, setCategories] = useState<LookupRow[]>([]);
  const [subcategories, setSubcategories] = useState<LookupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuRow | null>(null);
  const [formData, setFormData] = useState<MenuFormData>(emptyFormData);
  const [searchQuery, setSearchQuery] = useState("");

  const loadMenuItems = async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select(`
        id,
        name,
        description,
        price,
        featured,
        highly_recommended,
        most_popular,
        category_id,
        subcategory_id,
        categories ( id, name ),
        subcategories ( id, name )
      `)
      .eq("restaurant_id", CURRENT_RESTAURANT_ID)
      .order("name", { ascending: true });

    if (error) {
      console.error("Failed to fetch menu items:", error);
      toast.error("Failed to load menu items.");
      setMenuItems([]);
      return;
    }

    setMenuItems((data ?? []) as unknown as MenuRow[]);
  };

  const loadLookups = async () => {
    const [{ data: categoryData, error: categoryError }, { data: subcategoryData, error: subcategoryError }] =
      await Promise.all([
        supabase
          .from("categories")
          .select("id,name")
          .order("name", { ascending: true }),
        supabase
          .from("subcategories")
          .select("id,name")
          .order("name", { ascending: true }),
      ]);

    if (categoryError) {
      console.error("Failed to fetch categories:", categoryError);
      setCategories([]);
    } else {
      setCategories((categoryData ?? []) as LookupRow[]);
    }

    if (subcategoryError) {
      console.error("Failed to fetch subcategories:", subcategoryError);
      setSubcategories([]);
    } else {
      setSubcategories((subcategoryData ?? []) as LookupRow[]);
    }
  };

  const refreshData = async () => {
    await loadMenuItems();
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadMenuItems(), loadLookups()]);
      setLoading(false);
    };

    loadAll().catch((err) => {
      console.error("Failed to load menu manager data:", err);
      toast.error("Failed to load data.");
      setLoading(false);
    });
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData(emptyFormData);
    setModalOpen(true);
  };

  const openEditModal = (item: MenuRow) => {
    setEditingItem(item);
    setFormData({
      name: item.name ?? "",
      description: item.description ?? "",
      price: item.price !== null && item.price !== undefined ? String(item.price) : "",
      category_id: item.category_id ?? "",
      subcategory_id: item.subcategory_id ?? "",
      featured: !!item.featured,
      most_popular: !!item.most_popular,
      highly_recommended: !!item.highly_recommended,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setModalOpen(false);
  };

  const handleInputChange = (field: keyof MenuFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation without validateField
    if (!formData.name.trim()) {
      toast.error("Item name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: formData.price ? Number.parseFloat(formData.price) : null,
        category_id: formData.category_id || null,
        subcategory_id: formData.subcategory_id || null,
        featured: formData.featured,
        most_popular: formData.most_popular,
        highly_recommended: formData.highly_recommended,
        restaurant_id: CURRENT_RESTAURANT_ID,
      };

      if (editingItem) {
        const { error: updateError } = await supabase
          .from("menu_items")
          .update(payload)
          .eq("id", editingItem.id)
          .eq("restaurant_id", CURRENT_RESTAURANT_ID);

        if (updateError) throw updateError;
        toast.success("Menu item updated successfully.");
      } else {
        const { error: insertError } = await supabase
          .from("menu_items")
          .insert([payload]);

        if (insertError) throw insertError;
        toast.success("Menu item created successfully.");
      }

      await refreshData();
      setModalOpen(false);
      setFormData(emptyFormData);
    } catch (err: any) {
      console.error("Failed to save menu item:", err);
      toast.error(err.message || "Failed to save menu item.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestDelete = (item: MenuRow) => {
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", deleteTarget.id)
        .eq("restaurant_id", CURRENT_RESTAURANT_ID);

      if (error) throw error;
      
      toast.success("Menu item deleted successfully.");
      await refreshData();
      setDeleteTarget(null);
    } catch (err: any) {
      console.error("Failed to delete menu item:", err);
      toast.error(err.message || "Failed to delete menu item.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.name?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.categories?.name?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <Layout title="Menu Items">
        <div className="flex items-center justify-center h-64">
          <div className="text-white/40 animate-pulse">Loading menu items...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Menu Items">
      <Toaster position="top-center" />

      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors text-sm"
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90 transition-all shadow-lg"
          >
            <Plus size={16} />
            New Menu Item
          </button>
        </div>

        {/* Menu Items Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-white/30 text-sm">
                      {searchQuery ? "No items match your search." : "No menu items found. Click 'New Menu Item' to create one."}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-white/90">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{item.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-white/80">
                          ₹{item.price?.toFixed(2) ?? "0.00"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs space-y-0.5">
                          {item.categories && (
                            <p className="text-white/60">{item.categories.name}</p>
                          )}
                          {item.subcategories && (
                            <p className="text-white/40">{item.subcategories.name}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {item.featured && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              FEATURED
                            </span>
                          )}
                          {item.most_popular && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                              POPULAR
                            </span>
                          )}
                          {item.highly_recommended && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                              RECOMMENDED
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="Edit item"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => requestDelete(item)}
                            className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4 z-[99999]">
          <div className="w-full max-w-2xl rounded-2xl bg-neutral-900 border border-white/10 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {editingItem ? "Edit Menu Item" : "New Menu Item"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-white/50 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="e.g., Butter Chicken"
                    required
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-white/50 mb-2">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors resize-none"
                  placeholder="Brief description of the item..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => handleInputChange("category_id", e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 transition-colors appearance-none"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/50 mb-2">
                    Subcategory
                  </label>
                  <select
                    value={formData.subcategory_id}
                    onChange={(e) => handleInputChange("subcategory_id", e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 transition-colors appearance-none"
                  >
                    <option value="">Select subcategory</option>
                    {subcategories.map((subcat) => (
                      <option key={subcat.id} value={subcat.id}>
                        {subcat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange("featured", e.target.checked)}
                    className="w-5 h-5 rounded bg-black/30 border-white/10 text-amber-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                    Featured Item
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.most_popular}
                    onChange={(e) => handleInputChange("most_popular", e.target.checked)}
                    className="w-5 h-5 rounded bg-black/30 border-white/10 text-purple-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                    Most Popular
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.highly_recommended}
                    onChange={(e) => handleInputChange("highly_recommended", e.target.checked)}
                    className="w-5 h-5 rounded bg-black/30 border-white/10 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                    Highly Recommended
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold bg-white text-black rounded-xl hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : editingItem ? "Update Item" : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4 z-[99999]">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-white/10 p-6 shadow-2xl">
            <h2 className="text-xl font-semibold mb-4">Delete Menu Item</h2>
            <p className="text-sm text-white/60 mb-6">
              Are you sure you want to delete{" "}
              <span className="text-white font-semibold">{deleteTarget.name}</span>? This action
              cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MenuManager;