import React, { useEffect, useMemo, useState } from "react";
import AdminHeader from "./adminNavbar";
import { supabase } from "@/lib/superbase";
import { Toaster, toast } from "react-hot-toast";
import AdminTabs from "@/components/AdminTabs";
import AdminPageHeader from "@/components/AdminPageHeader";

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

    setSubcategories((data ?? []) as SubcategoryRow[]);
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
    if (!trimmedName) {
      toast.error("Category name is required.");
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
      const { error } = await supabase.from("categories").insert([{ name: trimmedName }]);

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
    if (!trimmedName) {
      toast.error("Subcategory name is required.");
      return;
    }

    if (!subcategoryCategoryId) {
      toast.error("Please select a category.");
      return;
    }

    setIsSubmitting(true);

    if (editingSubcategory) {
      const { error } = await supabase
        .from("subcategories")
        .update({
          name: trimmedName,
          category_id: subcategoryCategoryId,
        })
        .eq("id", editingSubcategory.id);

      if (error) {
        console.error(error);
        toast.error(error.message);
        setIsSubmitting(false);
        return;
      }

      toast.success("Subcategory updated.");
    } else {
      const { error } = await supabase.from("subcategories").insert([
        {
          name: trimmedName,
          category_id: subcategoryCategoryId,
        },
      ]);

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

    const tableName = deleteTarget.type === "category" ? "categories" : "subcategories";
    const { error } = await supabase.from(tableName).delete().eq("id", deleteTarget.id);

    if (error) {
      console.error(error);
      toast.error(error.message);
      setIsDeleting(false);
      return;
    }

    toast.success(
      deleteTarget.type === "category" ? "Category deleted." : "Subcategory deleted."
    );

    await refreshData();
    setIsDeleting(false);
    setDeleteTarget(null);
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
              <h1 className="text-4xl font-serif text-white mb-2">Category Manager</h1>
              <p className="text-white/40">Manage categories and subcategories.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={openAddCategoryModal}
                className="px-5 py-2.5 rounded-full bg-secondary text-black text-sm font-bold uppercase tracking-widest hover:bg-white transition-colors"
              >
                Add Category
              </button>
              <button
                onClick={() => openAddSubcategoryModal()}
                className="px-5 py-2.5 rounded-full border border-white/10 text-white text-sm font-bold uppercase tracking-widest hover:border-white/30 transition-colors"
              >
                Add Subcategory
              </button>
            </div>
          </header>

          <AdminTabs />

          <div className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.01]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">
                    Category
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40">
                    Subcategories
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold uppercase tracking-widest text-white/40 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-white/50">
                      Loading categories...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-white/50">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => {
                    const relatedSubcategories =
                      subcategoriesByCategory.get(category.id) ?? [];
                    return (
                      <tr
                        key={category.id}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-4 px-6 text-sm font-semibold text-white/90 align-top">
                          {category.name ?? "Unnamed Category"}
                        </td>
                        <td className="py-4 px-6 align-top">
                          {relatedSubcategories.length === 0 ? (
                            <span className="text-sm text-white/40">No subcategories</span>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {relatedSubcategories.map((subcategory) => (
                                <div
                                  key={subcategory.id}
                                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs"
                                >
                                  <span className="text-white/80">
                                    {subcategory.name ?? "Unnamed"}
                                  </span>
                                  <button
                                    onClick={() => openEditSubcategoryModal(subcategory)}
                                    className="text-[10px] uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => requestDeleteSubcategory(subcategory)}
                                    className="text-[10px] uppercase tracking-widest text-red-300 hover:text-red-200 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right align-top">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => openEditCategoryModal(category)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-gray-900 hover:bg-gray-100 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => requestDeleteCategory(category)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
                            >
                              Delete
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
        </div>
      </div>

      {categoryModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-6 z-[99999]">
          <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-white/10 p-8">
            <h2 className="text-2xl font-serif text-white mb-6">
              {editingCategory ? "Edit Category" : "Add Category"}
            </h2>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-white/50">Name</label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                  className="mt-2 w-full rounded-lg bg-neutral-950 border border-white/10 px-4 py-2 text-sm text-white"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeCategoryModal}
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

      {subcategoryModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-6 z-[99999]">
          <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-white/10 p-8">
            <h2 className="text-2xl font-serif text-white mb-6">
              {editingSubcategory ? "Edit Subcategory" : "Add Subcategory"}
            </h2>
            <form onSubmit={handleSubcategorySubmit} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-white/50">Name</label>
                <input
                  type="text"
                  value={subcategoryName}
                  onChange={(event) => setSubcategoryName(event.target.value)}
                  className="mt-2 w-full rounded-lg bg-neutral-950 border border-white/10 px-4 py-2 text-sm text-white"
                  required
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-white/50">
                  Category
                </label>
                <select
                  value={subcategoryCategoryId}
                  onChange={(event) => setSubcategoryCategoryId(event.target.value)}
                  className="mt-2 w-full rounded-lg bg-neutral-950 border border-white/10 px-4 py-2 text-sm text-white"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name ?? "Unnamed Category"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeSubcategoryModal}
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
            <h2 className="text-xl font-serif text-white mb-3">
              {deleteTarget.type === "category" ? "Delete Category" : "Delete Subcategory"}
            </h2>
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

export default CategoryManager;
