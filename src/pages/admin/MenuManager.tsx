import React, { useEffect, useState } from "react";
import AdminHeader from "./adminNavbar";
import { supabase } from "@/lib/superbase";
import { KALITA_RESTAURANT_ID } from "@/constants/restaurent";
import { Toaster, toast } from "react-hot-toast";
import AdminTabs from "@/components/AdminTabs";
import AdminPageHeader from "@/components/AdminPageHeader";

type MenuRow = {
  id: string;
  name: string | null;
  description: string | null;
  price: number | null;
  featured: boolean | null;
  highly_recommended: boolean | null;
  most_popular: boolean | null;
  sales_last_14_days: number | null;
  display_order: number | null;
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
  display_order: string;
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
  display_order: "",
};

const CURRENT_RESTAURANT_ID = KALITA_RESTAURANT_ID;

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
        sales_last_14_days,
        display_order,
        category_id,
        subcategory_id,
        categories ( id, name ),
        subcategories ( id, name )
      `)
      .eq("restaurant_id", CURRENT_RESTAURANT_ID)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Failed to fetch menu items:", error);
      setMenuItems([]);
      return;
    }

    setMenuItems((data ?? []) as MenuRow[]);
  };

  const loadLookups = async () => {
    const [{ data: categoryData, error: categoryError }, { data: subcategoryData, error: subcategoryError }] =
      await Promise.all([
        supabase.from("categories").select("id,name").order("name", { ascending: true }),
        supabase.from("subcategories").select("id,name").order("name", { ascending: true }),
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

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadMenuItems(), loadLookups()]);
      setLoading(false);
    };

    loadAll().catch((err) => {
      console.error("Failed to load menu manager data:", err);
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
      display_order: item.display_order !== null ? String(item.display_order) : "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setModalOpen(false);
  };

  const handleToggleFeatured = async (itemId: string, newValue: boolean) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ featured: newValue })
      .eq("id", itemId)
      .eq("restaurant_id", CURRENT_RESTAURANT_ID);

    if (error) {
      console.error(error);
      toast.error(error.message);
      return;
    }

    setMenuItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, featured: newValue } : item))
    );
  };

  const handleToggleMostPopular = async (itemId: string, newValue: boolean) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ most_popular: newValue })
      .eq("id", itemId)
      .eq("restaurant_id", CURRENT_RESTAURANT_ID);

    if (error) {
      console.error(error);
      toast.error(error.message);
      return;
    }

    setMenuItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, most_popular: newValue } : item))
    );
  };

  const handleToggleHighlyRecommended = async (itemId: string, newValue: boolean) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ highly_recommended: newValue })
      .eq("id", itemId)
      .eq("restaurant_id", CURRENT_RESTAURANT_ID);

    if (error) {
      console.error(error);
      toast.error(error.message);
      return;
    }

    setMenuItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, highly_recommended: newValue } : item
      )
    );
  };

  const requestDelete = (item: MenuRow) => {
    setDeleteTarget(item);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);

    const previousItems = menuItems;
    setMenuItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));

    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", deleteTarget.id)
      .eq("restaurant_id", CURRENT_RESTAURANT_ID);

    if (error) {
      console.error(error);
      toast.error(error.message);
      setMenuItems(previousItems);
      setIsDeleting(false);
      return;
    }

    toast.success("Menu item deleted.");
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim() || null,
      description: formData.description.trim() || null,
      price: Number(formData.price),
      category_id: formData.category_id || null,
      subcategory_id: formData.subcategory_id || null,
      featured: formData.featured,
      most_popular: formData.most_popular,
      highly_recommended: formData.highly_recommended,
      display_order: Number(formData.display_order),
    };

    if (editingItem) {
      const { error } = await supabase
        .from("menu_items")
        .update(payload)
        .eq("id", editingItem.id)
        .eq("restaurant_id", CURRENT_RESTAURANT_ID);
      if (error) {
        console.error(error);
        toast.error(error.message);
        setIsSubmitting(false);
        return;
      }
      toast.success("Menu item updated.");
    } else {
      const { error } = await supabase
        .from("menu_items")
        .insert([{
          name: formData.name,
          description: formData.description,
          price: Number(formData.price),
          category_id: formData.category_id,
          subcategory_id: formData.subcategory_id,
          featured: formData.featured || false,
          most_popular: formData.most_popular || false,
          highly_recommended: formData.highly_recommended || false,
          display_order: Number(formData.display_order) || 0,
          restaurant_id: CURRENT_RESTAURANT_ID
        }]);
      if (error) {
        console.error(error);
        toast.error(error.message);
        setIsSubmitting(false);
        return;
      }
      toast.success("Menu item added.");
    }

    await loadMenuItems();
    setIsSubmitting(false);
    setModalOpen(false);
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="relative z-[9999]">
        <AdminHeader />
      </div>

      <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <AdminPageHeader />
          <header className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-4xl font-serif text-white mb-2">Menu Manager</h1>
              <p className="text-white/40">Manage menu items and highlights.</p>
            </div>
            <button
              onClick={openAddModal}
              className="px-5 py-2.5 rounded-full bg-secondary text-black text-sm font-bold uppercase tracking-widest hover:bg-white transition-colors"
            >
              Add Menu Item
            </button>
          </header>

          <AdminTabs />

          <div className="rounded-2xl border border-white/5 overflow-hidden bg-white/[0.01]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">Name</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">Category</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">Subcategory</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">Price</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">Featured</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">Most Popular</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">Highly Recommended</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">Display Order</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40 text-right">Edit</th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40 text-right">Delete</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-white/50">
                      Loading menu items...
                    </td>
                  </tr>
                ) : menuItems.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-white/50">
                      No menu items found.
                    </td>
                  </tr>
                ) : (
                  menuItems.map((item) => (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 text-sm font-semibold text-white/90">
                        {item.name ?? "Unnamed Item"}
                      </td>
                      <td className="py-4 px-6 text-sm text-white/70">
                        {item.categories?.name ?? "Uncategorized"}
                      </td>
                      <td className="py-4 px-6 text-sm text-white/70">
                        {item.subcategories?.name ?? "-"}
                      </td>
                      <td className="py-4 px-6 text-sm text-white/70">
                        {item.price !== null ? `₹${item.price}` : "-"}
                      </td>
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={!!item.featured}
                          onChange={(event) => handleToggleFeatured(item.id, event.target.checked)}
                        />
                      </td>
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={!!item.most_popular}
                          onChange={(event) => handleToggleMostPopular(item.id, event.target.checked)}
                        />
                      </td>
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={!!item.highly_recommended}
                          onChange={(event) => handleToggleHighlyRecommended(item.id, event.target.checked)}
                        />
                      </td>
                      <td className="py-4 px-6 text-sm text-white/70">
                        {item.display_order ?? "-"}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => openEditModal(item)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => requestDelete(item)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-6 z-[99999]">
          <div className="w-full max-w-2xl rounded-2xl bg-neutral-900 border border-white/10 p-8">
            <h2 className="text-2xl font-serif text-white mb-6">
              {editingItem ? "Edit Menu Item" : "Add Menu Item"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-white/50">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  className="mt-2 w-full rounded-lg bg-neutral-950 border border-white/10 px-4 py-2 text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-white/50">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                  className="mt-2 w-full rounded-lg bg-neutral-950 border border-white/10 px-4 py-2 text-sm text-white"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-white/50">Price</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(event) => setFormData({ ...formData, price: event.target.value })}
                    className="mt-2 w-full rounded-lg bg-neutral-950 border border-white/10 px-4 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-white/50">Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(event) => setFormData({ ...formData, display_order: event.target.value })}
                    className="mt-2 w-full rounded-lg bg-neutral-950 border border-white/10 px-4 py-2 text-sm text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-widest text-white/50">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, category_id: event.target.value }))
                    }
                    className="mt-2 w-full rounded-lg bg-neutral-950 border border-white/10 px-4 py-2 text-sm text-white"
                  >
                    <option value="">None</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-white/50">Subcategory</label>
                  <select
                    value={formData.subcategory_id}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, subcategory_id: event.target.value }))
                    }
                    className="mt-2 w-full rounded-lg bg-neutral-950 border border-white/10 px-4 py-2 text-sm text-white"
                  >
                    <option value="">None</option>
                    {subcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(event) =>
                      setFormData({ ...formData, featured: event.target.checked })
                    }
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={formData.most_popular}
                    onChange={(event) =>
                      setFormData({ ...formData, most_popular: event.target.checked })
                    }
                  />
                  Most Popular
                </label>
                <label className="flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={formData.highly_recommended}
                    onChange={(event) =>
                      setFormData({ ...formData, highly_recommended: event.target.checked })
                    }
                  />
                  Highly Recommended
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg text-sm font-bold bg-secondary text-black hover:bg-white transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/40 border-t-black" />
                      Saving...
                    </span>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-6 z-[99999]">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-white/10 p-6">
            <h2 className="text-xl font-serif text-white mb-3">Delete Menu Item</h2>
            <p className="text-sm text-white/60">
              Are you sure you want to delete{" "}
              <span className="text-white/90 font-semibold">
                {deleteTarget.name ?? "this item"}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white/70 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-red-500 text-white hover:bg-red-400 transition-colors disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuManager;
