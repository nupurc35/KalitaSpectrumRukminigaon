import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/superbase";
import { Toaster, toast } from "react-hot-toast";
import { required, validateField } from "@/utils/validation";
import { Layout } from "@/components/crm/Layout";
import { Card } from "@/components/crm/Card";
import { Plus, Edit2, Trash2, X } from "lucide-react";

type CategoryRow = {
  id: string;
  name: string | null;
};

type SubcategoryRow = {
  id: string;
  name: string | null;
  category_id: string | null;
  categories: { id: string; name: string } | null;
};

type DeleteTarget =
  | { type: "category"; id: string; name: string | null }
  | { type: "subcategory"; id: string; name: string | null };

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [subcategoryModalOpen, setSubcategoryModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<SubcategoryRow | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [subcategoryCategoryId, setSubcategoryCategoryId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id,name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to load categories.");
      setCategories([]);
      return;
    }

    setCategories((data ?? []) as CategoryRow[]);
  };

  const loadSubcategories = async () => {
    const { data, error } = await supabase
      .from("subcategories")
      .select("id,name,category_id,categories ( id, name )")
      .order("name", { ascending: true });

    if (error) {
      console.error("Failed to fetch subcategories:", error);
      toast.error("Failed to load subcategories.");
      setSubcategories([]);
      return;
    }

    setSubcategories((data ?? []) as unknown as SubcategoryRow[]);
  };

  const refreshData = async () => {
    await Promise.all([loadCategories(), loadSubcategories()]);
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };

    loadAll().catch((err) => {
      console.error("Failed to load category manager data:", err);
      toast.error("Failed to load category manager data.");
      setLoading(false);
    });
  }, []);

  const subcategoriesByCategory = useMemo(() => {
    const grouped = new Map<string, SubcategoryRow[]>();
    subcategories.forEach((subcategory) => {
      if (!subcategory.category_id) return;
      const current = grouped.get(subcategory.category_id) ?? [];
      current.push(subcategory);
      grouped.set(subcategory.category_id, current);
    });
    return grouped;
  }, [subcategories]);

  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryModalOpen(true);
  };

  const openEditCategoryModal = (category: CategoryRow) => {
    setEditingCategory(category);
    setCategoryName(category.name ?? "");
    setCategoryModalOpen(true);
  };

  const openAddSubcategoryModal = (categoryId?: string) => {
    if (categories.length === 0) {
      toast.error("Create a category first.");
      return;
    }
    setEditingSubcategory(null);
    setSubcategoryName("");
    setSubcategoryCategoryId(categoryId ?? categories[0]?.id ?? "");
    setSubcategoryModalOpen(true);
  };

  const openEditSubcategoryModal = (subcategory: SubcategoryRow) => {
    setEditingSubcategory(subcategory);
    setSubcategoryName(subcategory.name ?? "");
    setSubcategoryCategoryId(subcategory.category_id ?? "");
    setSubcategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    if (isSubmitting) return;
    setCategoryModalOpen(false);
  };

  const closeSubcategoryModal = () => {
    if (isSubmitting) return;
    setSubcategoryModalOpen(false);
  };

  const handleCategorySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmedName = categoryName.trim();
    const nameError = validateField(trimmedName, [required("Category name is required.")]);
    if (nameError) {
      toast.error(nameError);
      return;
    }

    setIsSubmitting(true);

    if (editingCategory) {
      const { error } = await supabase
        .from("categories")
        .update({ name: trimmedName })
        .eq("id", editingCategory.id);

      if (error) {
        console.error(error);
        toast.error(error.message);
        setIsSubmitting(false);
        return;
      }

      toast.success("Category updated.");
    } else {
      const { error } = await supabase
        .from("categories")
        .insert([{ name: trimmedName }]);

      if (error) {
        console.error(error);
        toast.error(error.message);
        setIsSubmitting(false);
        return;
      }

      toast.success("Category added.");
    }

    await refreshData();
    setIsSubmitting(false);
    setCategoryModalOpen(false);
  };

  const handleSubcategorySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmedName = subcategoryName.trim();
    const nameError = validateField(trimmedName, [required("Subcategory name is required.")]);
    if (nameError) {
      toast.error(nameError);
      return;
    }

    if (!subcategoryCategoryId) {
      toast.error("Select a parent category.");
      return;
    }

    setIsSubmitting(true);

    if (editingSubcategory) {
      const { error } = await supabase
        .from("subcategories")
        .update({ name: trimmedName, category_id: subcategoryCategoryId })
        .eq("id", editingSubcategory.id);

      if (error) {
        console.error(error);
        toast.error(error.message);
        setIsSubmitting(false);
        return;
      }

      toast.success("Subcategory updated.");
    } else {
      const { error } = await supabase
        .from("subcategories")
        .insert([{ name: trimmedName, category_id: subcategoryCategoryId }]);

      if (error) {
        console.error(error);
        toast.error(error.message);
        setIsSubmitting(false);
        return;
      }

      toast.success("Subcategory added.");
    }

    await refreshData();
    setIsSubmitting(false);
    setSubcategoryModalOpen(false);
  };

  const requestDeleteCategory = (category: CategoryRow) => {
    setDeleteTarget({ type: "category", id: category.id, name: category.name });
  };

  const requestDeleteSubcategory = (subcategory: SubcategoryRow) => {
    setDeleteTarget({ type: "subcategory", id: subcategory.id, name: subcategory.name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;

    setIsDeleting(true);

    if (deleteTarget.type === "category") {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", deleteTarget.id);

      if (error) {
        console.error(error);
        toast.error(error.message);
        setIsDeleting(false);
        return;
      }

      toast.success("Category deleted.");
    } else {
      const { error } = await supabase
        .from("subcategories")
        .delete()
        .eq("id", deleteTarget.id);

      if (error) {
        console.error(error);
        toast.error(error.message);
        setIsDeleting(false);
        return;
      }

      toast.success("Subcategory deleted.");
    }

    await refreshData();
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <Layout title="Categories">
        <div className="flex items-center justify-center h-64">
          <div className="text-white/40 animate-pulse">Loading categories...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Categories">
      <Toaster position="top-center" />

      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <p className="text-sm text-white/50">
            Manage menu categories and subcategories
          </p>
          <div className="flex gap-3">
            <button
              onClick={openAddCategoryModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90 transition-all shadow-lg"
            >
              <Plus size={16} />
              New Category
            </button>
            <button
              onClick={() => openAddSubcategoryModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/10 text-white rounded-xl text-sm font-semibold hover:bg-white/20 transition-all"
            >
              <Plus size={16} />
              New Subcategory
            </button>
          </div>
        </div>

        {/* Categories Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Subcategories
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-white/30 text-sm">
                      No categories found. Click "New Category" to create one.
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => {
                    const relatedSubcategories = subcategoriesByCategory.get(category.id) || [];
                    return (
                      <tr
                        key={category.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-5 text-sm font-semibold text-white/90 align-top">
                          {category.name ?? "Unnamed Category"}
                        </td>
                        <td className="px-6 py-5 align-top">
                          {relatedSubcategories.length === 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-white/30 italic">No subcategories</span>
                              <button
                                onClick={() => openAddSubcategoryModal(category.id)}
                                className="text-xs text-white/40 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-all"
                              >
                                + Add
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {relatedSubcategories.map((subcategory) => (
                                <div
                                  key={subcategory.id}
                                  className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs transition-colors hover:border-white/20 hover:bg-white/[0.05]"
                                >
                                  <span className="text-white/80 font-medium">
                                    {subcategory.name ?? "Unnamed"}
                                  </span>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1 border-l border-white/10 pl-2">
                                    <button
                                      onClick={() => openEditSubcategoryModal(subcategory)}
                                      className="p-1 text-white/40 hover:text-white transition-colors"
                                      title="Edit"
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                    <button
                                      onClick={() => requestDeleteSubcategory(subcategory)}
                                      className="p-1 text-white/40 hover:text-red-400 transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5 text-right align-top">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => openEditCategoryModal(category)}
                              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                              title="Edit category"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => requestDeleteCategory(category)}
                              className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete category"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Category Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4 z-[99999]">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>
              <button
                onClick={closeCategoryModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="e.g., Starters, Main Course"
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCategoryModal}
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
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {subcategoryModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4 z-[99999]">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {editingSubcategory ? "Edit Subcategory" : "Add Subcategory"}
              </h2>
              <button
                onClick={closeSubcategoryModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubcategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-2">
                  Subcategory Name
                </label>
                <input
                  type="text"
                  value={subcategoryName}
                  onChange={(e) => setSubcategoryName(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="e.g., Vegetarian, Non-Veg"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-2">
                  Parent Category
                </label>
                <select
                  value={subcategoryCategoryId}
                  onChange={(e) => setSubcategoryCategoryId(e.target.value)}
                  className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 transition-colors appearance-none"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeSubcategoryModal}
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
                  {isSubmitting ? "Saving..." : "Save"}
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
            <h2 className="text-xl font-semibold mb-4">
              Delete {deleteTarget.type === "category" ? "Category" : "Subcategory"}
            </h2>
            <p className="text-sm text-white/60 mb-6">
              Are you sure you want to delete{" "}
              <span className="text-white font-semibold">
                {deleteTarget.name ?? "this item"}
              </span>
              ? This action cannot be undone.
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
                onClick={handleConfirmDelete}
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

export default CategoryManager;