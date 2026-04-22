import { useState, useEffect } from "react";
import AdminHeader from "@/components/AdminHeader";
import { Plus, Edit, Trash2, X, FolderTree, Loader2, Upload } from "lucide-react";
import useUser from "@/utils/useUser";

export default function AdminCategoriesPage() {
  const { data: user, loading: userLoading } = useUser();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
  });

  useEffect(() => {
    if (!userLoading && user) {
      checkAdminAccess();
    } else if (!userLoading && !user) {
      if (typeof window !== "undefined") {
        window.location.href = "/account/signin?callbackUrl=/admin/categories";
      }
    }
  }, [user, userLoading]);

  const checkAdminAccess = async () => {
    try {
      const response = await fetch("/api/admin/check-role");
      const data = await response.json();

      if (!data.isAdmin) {
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
        return;
      }

      fetchCategories();
    } catch (error) {
      console.error("Error checking admin access:", error);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formDataObj = new FormData();
      formDataObj.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formDataObj });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setFormData({ ...formData, image_url: data.url });
    } catch (err) {
      setError("Failed to upload image");
    }
    e.target.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const url = editingCategory
      ? `/api/admin/categories/${editingCategory.id}`
      : "/api/admin/categories";
    const method = editingCategory ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to save category");

      fetchCategories();
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: "", slug: "", description: "", image_url: "" });
    } catch (error) {
      console.error(error);
      setError("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image_url: category.image_url || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      fetchCategories();
    } catch (error) {
      console.error(error);
      alert("Failed to delete category");
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <AdminHeader />
        <div className="mx-auto max-w-7xl px-4 py-12 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-[#6B7280]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#2ECC71] border-t-transparent" />
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <AdminHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
              Categories
            </h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              Manage product categories
            </p>
          </div>
          <button
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: "", slug: "", description: "", image_url: "" });
              setError(null);
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2ECC71] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#27AE60] transition-colors"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-white py-16 text-center shadow-sm">
            <FolderTree size={40} className="mx-auto mb-3 text-[#D1D5DB]" />
            <p className="text-sm font-medium text-[#6B7280]">No categories yet</p>
            <p className="mt-1 text-xs text-[#9CA3AF]">Add your first category to organize products</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 aspect-video overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F8F9FA]">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <FolderTree size={24} className="text-[#D1D5DB]" />
                    </div>
                  )}
                </div>
                <h3 className="text-base font-semibold text-[#111827]">
                  {category.name}
                </h3>
                <p className="mt-1 text-xs text-[#6B7280]">
                  {category.description || "No description"}
                </p>
                <p className="mt-2 text-xs text-[#9CA3AF]">
                  Slug: {category.slug}
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#374151] hover:border-[#2ECC71] hover:text-[#2ECC71] transition-colors"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="rounded-lg border border-[#E5E7EB] bg-white p-2 text-[#6B7280] hover:border-red-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
              <h2 className="text-lg font-bold text-[#111827]">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCategory(null);
                  setError(null);
                }}
                className="rounded-lg p-1.5 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#111827]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#374151]">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({ ...formData, name, slug: generateSlug(name) });
                  }}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#374151]">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#374151]">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#374151]">
                  Category Image
                </label>
                {formData.image_url ? (
                  <div className="relative mb-2 overflow-hidden rounded-lg border border-[#E5E7EB]">
                    <img
                      src={formData.image_url}
                      alt="Category"
                      className="h-32 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: "" })}
                      className="absolute top-2 right-2 rounded-full bg-white/90 p-1 text-[#374151] shadow hover:bg-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : null}
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#E5E7EB] bg-[#F8F9FA] px-4 py-4 text-sm text-[#6B7280] hover:border-[#2ECC71] hover:bg-[#E8F8F0]/50 transition-colors">
                  <Upload size={16} />
                  Upload Image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-[#2ECC71] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#27AE60] disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      Saving...
                    </span>
                  ) : editingCategory ? (
                    "Update"
                  ) : (
                    "Create"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                    setError(null);
                  }}
                  className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-2.5 text-sm font-medium text-[#374151] hover:border-[#2ECC71] hover:text-[#2ECC71] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
