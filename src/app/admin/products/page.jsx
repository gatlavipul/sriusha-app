import { useState, useEffect, useCallback } from "react";
import AdminHeader from "@/components/AdminHeader";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  Upload,
  Image as ImageIcon,
  Star,
  ChevronDown,
  Loader2,
  CheckSquare,
  Square,
  Package,
  AlertTriangle,
} from "lucide-react";
import useUser from "@/utils/useUser";

export default function AdminProductsPage() {
  const { data: user, loading: userLoading } = useUser();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Saving state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Product form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    compare_price: "",
    sale_price: "",
    category_id: "",
    sub_category_id: "",
    brand: "",
    stock_quantity: "",
    weight: "",
    is_active: true,
  });
  const [weightVariants, setWeightVariants] = useState([]);
  const [newVariant, setNewVariant] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!userLoading && user) {
      checkAdminAccess();
    } else if (!userLoading && !user) {
      if (typeof window !== "undefined") {
        window.location.href = "/account/signin?callbackUrl=/admin/products";
      }
    }
  }, [user, userLoading]);

  const checkAdminAccess = async () => {
    try {
      const response = await fetch("/api/admin/check-role");
      const data = await response.json();
      if (!data.isAdmin) {
        if (typeof window !== "undefined") window.location.href = "/";
        return;
      }
      fetchProducts();
      fetchCategories();
    } catch (error) {
      console.error("Error checking admin access:", error);
      if (typeof window !== "undefined") window.location.href = "/";
    }
  };

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (categoryFilter) params.set("category", categoryFilter);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, categoryFilter, statusFilter]);

  useEffect(() => {
    if (!userLoading && user) {
      const timer = setTimeout(() => {
        fetchProducts();
      }, searchQuery ? 300 : 0);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, categoryFilter, statusFilter, user, userLoading, fetchProducts]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSubCategories = async (categoryId) => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }
    try {
      const res = await fetch(`/api/admin/sub-categories?category_id=${categoryId}`);
      const data = await res.json();
      setSubCategories(data.subCategories || []);
    } catch (error) {
      console.error(error);
    }
  };

  // --- Image Upload ---
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (uploadedImages.length + files.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      const uploadPromises = files.map(async (file) => {
        const formDataObj = new FormData();
        formDataObj.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formDataObj,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        return await res.json();
      });

      const results = await Promise.all(uploadPromises);
      setUploadedImages((prev) => [
        ...prev,
        ...results.map((data, i) => ({
          url: data.url,
          name: data.name,
          isDefault: prev.length === 0 && i === 0,
        })),
      ]);
    } catch (err) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const setDefaultImage = (index) => {
    setUploadedImages((prev) =>
      prev.map((img, i) => ({ ...img, isDefault: i === index }))
    );
  };

  const removeImage = (index) => {
    setUploadedImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // If we removed the default image, set first as default
      if (updated.length > 0 && !updated.some((img) => img.isDefault)) {
        updated[0].isDefault = true;
      }
      return updated;
    });
  };

  // --- Weight/Size Variants ---
  const addVariant = () => {
    const trimmed = newVariant.trim();
    if (trimmed && !weightVariants.includes(trimmed)) {
      setWeightVariants([...weightVariants, trimmed]);
      setNewVariant("");
    }
  };

  const removeVariant = (index) => {
    setWeightVariants(weightVariants.filter((_, i) => i !== index));
  };

  const handleVariantKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addVariant();
    }
  };

  // --- Form Helpers ---
  const generateSlug = (name) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      price: "",
      compare_price: "",
      sale_price: "",
      category_id: "",
      sub_category_id: "",
      brand: "",
      stock_quantity: "",
      weight: "",
      is_active: true,
    });
    setWeightVariants([]);
    setUploadedImages([]);
    setError(null);
    setEditingProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowProductModal(true);
  };

  const openEditModal = async (product) => {
    resetForm();
    setEditingProduct(product);

    // Fetch full product with images
    try {
      const res = await fetch(`/api/admin/products/${product.id}`);
      const data = await res.json();
      const fullProduct = data.product;

      setFormData({
        name: fullProduct.name || "",
        slug: fullProduct.slug || "",
        description: fullProduct.description || "",
        price: fullProduct.price || "",
        compare_price: fullProduct.compare_price || "",
        sale_price: fullProduct.sale_price || "",
        category_id: fullProduct.category_id || "",
        sub_category_id: fullProduct.sub_category_id || "",
        brand: fullProduct.brand || "",
        stock_quantity: fullProduct.stock_quantity || "",
        weight: fullProduct.weight || "",
        is_active: fullProduct.is_active !== false,
      });

      if (fullProduct.category_id) {
        await fetchSubCategories(fullProduct.category_id);
      }

      if (fullProduct.images && fullProduct.images.length > 0) {
        setUploadedImages(
          fullProduct.images.map((img, i) => ({
            url: img.image_url,
            name: `Image ${i + 1}`,
            isDefault: img.is_default,
          }))
        );
      }

      if (fullProduct.weight) {
        setWeightVariants(fullProduct.weight.split(",").map((w) => w.trim()).filter(Boolean));
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    }

    setShowProductModal(true);
  };

  // --- Save Product ---
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        weight: weightVariants.length > 0 ? weightVariants.join(",") : formData.weight || null,
        images: uploadedImages.map((img, i) => ({
          url: img.url,
          isDefault: img.isDefault,
        })),
      };

      let res;
      if (editingProduct) {
        res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save product");
      }

      setShowProductModal(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  // --- Delete Product ---
  const handleDelete = (product) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      await fetch(`/api/admin/products/${deletingProduct.id}`, { method: "DELETE" });
      setShowDeleteModal(false);
      setDeletingProduct(null);
      fetchProducts();
      setSelectedIds(selectedIds.filter((id) => id !== deletingProduct.id));
    } catch (error) {
      console.error(error);
      alert("Failed to delete product");
    }
  };

  // --- Toggle Active ---
  const handleToggleActive = async (product) => {
    try {
      await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !product.is_active }),
      });
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  // --- Bulk Actions ---
  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    try {
      await fetch("/api/admin/products/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      setShowBulkDeleteModal(false);
      setSelectedIds([]);
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Failed to delete products");
    }
  };

  // --- Loading State ---
  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <AdminHeader />
        <div className="mx-auto max-w-7xl px-4 py-12 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-[#6B7280]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#2ECC71] border-t-transparent" />
            Loading products...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <AdminHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
              Products
            </h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              Manage your product catalog
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2ECC71] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#27AE60] transition-colors"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="mb-4 flex items-center gap-4 rounded-lg bg-[#E8F8F0] border border-[#2ECC71]/20 px-4 py-3">
            <span className="text-sm font-medium text-[#27AE60]">
              {selectedIds.length} selected
            </span>
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 transition-colors"
            >
              <Trash2 size={12} />
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-[#6B7280] hover:text-[#111827]"
            >
              Clear Selection
            </button>
          </div>
        )}

        {/* Products Table */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
          {products.length === 0 ? (
            <div className="py-16 text-center">
              <Package size={40} className="mx-auto mb-3 text-[#D1D5DB]" />
              <p className="text-sm font-medium text-[#6B7280]">No products found</p>
              <p className="mt-1 text-xs text-[#9CA3AF]">
                Add your first product to get started
              </p>
              <button
                onClick={openAddModal}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#2ECC71] px-4 py-2 text-sm font-medium text-white hover:bg-[#27AE60]"
              >
                <Plus size={14} />
                Add Product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#E5E7EB] bg-[#F8F9FA]">
                  <tr>
                    <th className="p-4 w-10">
                      <button onClick={toggleSelectAll} className="text-[#9CA3AF] hover:text-[#2ECC71]">
                        {selectedIds.length === products.length && products.length > 0 ? (
                          <CheckSquare size={18} className="text-[#2ECC71]" />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                    </th>
                    <th className="p-4 text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                      Image
                    </th>
                    <th className="p-4 text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                      Product Name
                    </th>
                    <th className="p-4 text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                      Category
                    </th>
                    <th className="p-4 text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                      Price
                    </th>
                    <th className="p-4 text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                      Stock
                    </th>
                    <th className="p-4 text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                      Status
                    </th>
                    <th className="p-4 text-right text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className={`hover:bg-[#F8F9FA] transition-colors ${selectedIds.includes(product.id) ? "bg-[#E8F8F0]/50" : ""
                        }`}
                    >
                      <td className="p-4">
                        <button
                          onClick={() => toggleSelect(product.id)}
                          className="text-[#9CA3AF] hover:text-[#2ECC71]"
                        >
                          {selectedIds.includes(product.id) ? (
                            <CheckSquare size={18} className="text-[#2ECC71]" />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F8F9FA]">
                          {product.thumbnail_url || product.image_url ? (
                            <img
                              src={product.thumbnail_url || product.image_url}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ImageIcon size={16} className="text-[#D1D5DB]" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm font-semibold text-[#111827]">
                            {product.name}
                          </p>
                          {product.brand && (
                            <p className="text-xs text-[#9CA3AF]">{product.brand}</p>
                          )}
                          {product.weight && (
                            <p className="text-xs text-[#9CA3AF]">{product.weight}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block rounded-full bg-[#E8F8F0] px-2.5 py-0.5 text-xs font-medium text-[#27AE60]">
                          {product.category_name || "Uncategorized"}
                        </span>
                        {product.sub_category_name && (
                          <span className="ml-1 inline-block rounded-full bg-[#FEF3E2] px-2 py-0.5 text-xs text-[#F39C12]">
                            {product.sub_category_name}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm font-semibold text-[#111827]">
                            ₹{product.price}
                          </p>
                          {product.sale_price && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-[#F39C12] font-medium">
                                Sale: ₹{product.sale_price}
                              </span>
                            </div>
                          )}
                          {product.compare_price && !product.sale_price && (
                            <span className="text-xs text-[#9CA3AF] line-through">
                              ₹{product.compare_price}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-sm font-medium ${product.stock_quantity > 10
                              ? "text-[#27AE60]"
                              : product.stock_quantity > 0
                                ? "text-[#F39C12]"
                                : "text-red-500"
                            }`}
                        >
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleActive(product)}
                          className="flex items-center gap-1.5"
                          title={product.is_active ? "Click to deactivate" : "Click to activate"}
                        >
                          {product.is_active ? (
                            <>
                              <ToggleRight size={20} className="text-[#2ECC71]" />
                              <span className="text-xs font-medium text-[#27AE60]">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft size={20} className="text-[#D1D5DB]" />
                              <span className="text-xs font-medium text-[#9CA3AF]">Inactive</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(product)}
                            className="rounded-lg border border-[#E5E7EB] bg-white p-2 text-[#6B7280] hover:border-[#2ECC71] hover:text-[#2ECC71] transition-colors"
                            title="Edit product"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="rounded-lg border border-[#E5E7EB] bg-white p-2 text-[#6B7280] hover:border-red-400 hover:text-red-500 transition-colors"
                            title="Delete product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-[#9CA3AF]">
          {products.length} product{products.length !== 1 ? "s" : ""} total
        </div>
      </div>

      {/* ==================== PRODUCT MODAL (ADD/EDIT) ==================== */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-12">
          <div className="w-full max-w-2xl rounded-2xl border border-[#E5E7EB] bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
              <h2 className="text-lg font-bold text-[#111827]">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  resetForm();
                }}
                className="rounded-lg p-1.5 text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#111827]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveProduct} className="p-6 space-y-6">
              {/* Error */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Product Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#374151]">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData({
                      ...formData,
                      name,
                      slug: generateSlug(name),
                    });
                  }}
                  placeholder="e.g. Royal Canin Adult Dog Food"
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20"
                />
              </div>

              {/* Category & Sub-category */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#374151]">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, category_id: val, sub_category_id: "" });
                      fetchSubCategories(val);
                    }}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20"
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
                  <label className="mb-1.5 block text-sm font-medium text-[#374151]">
                    Sub-category
                  </label>
                  <select
                    value={formData.sub_category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, sub_category_id: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20"
                    disabled={!formData.category_id}
                  >
                    <option value="">Select sub-category</option>
                    {subCategories.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Brand */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#374151]">
                  Brand
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g. Royal Canin"
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#374151]">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description..."
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20"
                />
              </div>

              {/* Price, Sale Price, Compare Price */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#374151]">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#374151]">
                    Sale Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sale_price}
                    onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#374151]">
                    Compare Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.compare_price}
                    onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20"
                  />
                </div>
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#374151]">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  placeholder="0"
                  className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20"
                />
              </div>

              {/* Weight/Size Variants */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#374151]">
                  Weight/Size Variants
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newVariant}
                    onChange={(e) => setNewVariant(e.target.value)}
                    onKeyDown={handleVariantKeyDown}
                    placeholder="e.g. 1kg, 2kg, Small, Medium, Large"
                    className="flex-1 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20"
                  />
                  <button
                    type="button"
                    onClick={addVariant}
                    className="rounded-lg bg-[#2ECC71] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#27AE60] transition-colors"
                  >
                    Add
                  </button>
                </div>
                {weightVariants.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {weightVariants.map((variant, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-full bg-[#E8F8F0] px-3 py-1 text-xs font-medium text-[#27AE60]"
                      >
                        {variant}
                        <button
                          type="button"
                          onClick={() => removeVariant(i)}
                          className="ml-0.5 text-[#27AE60] hover:text-red-500"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#374151]">
                  Upload Product Images
                </label>
                <p className="mb-2 text-xs text-[#9CA3AF]">
                  Upload 1-5 images. The first image will be the default product image.
                </p>

                {/* Upload Button */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={uploadingImage || uploadedImages.length >= 5}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#E5E7EB] bg-[#F8F9FA] px-4 py-6 text-sm transition-colors hover:border-[#2ECC71] hover:bg-[#E8F8F0]/50 ${uploadingImage || uploadedImages.length >= 5
                        ? "pointer-events-none opacity-50"
                        : ""
                      }`}
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 size={18} className="animate-spin text-[#2ECC71]" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={18} className="text-[#9CA3AF]" />
                        <span className="text-[#6B7280]">Click to upload or drag images here</span>
                      </>
                    )}
                  </label>
                </div>

                {/* Image Previews */}
                {uploadedImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-5 gap-3">
                    {uploadedImages.map((img, i) => (
                      <div
                        key={i}
                        className={`group relative aspect-square overflow-hidden rounded-lg border-2 transition-colors ${img.isDefault
                            ? "border-[#2ECC71] ring-2 ring-[#2ECC71]/20"
                            : "border-[#E5E7EB]"
                          }`}
                      >
                        <img
                          src={img.url}
                          alt={`Product ${i + 1}`}
                          className="h-full w-full object-cover"
                        />
                        {/* Default badge */}
                        {img.isDefault && (
                          <div className="absolute top-1 left-1 rounded-full bg-[#2ECC71] p-0.5">
                            <Star size={10} className="text-white" />
                          </div>
                        )}
                        {/* Hover actions */}
                        <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          {!img.isDefault && (
                            <button
                              type="button"
                              onClick={() => setDefaultImage(i)}
                              className="rounded-full bg-white/90 p-1.5 text-[#374151] hover:bg-white"
                              title="Set as default"
                            >
                              <Star size={12} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="rounded-full bg-white/90 p-1.5 text-red-500 hover:bg-white"
                            title="Remove image"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-[#374151]">Product Status</p>
                  <p className="text-xs text-[#9CA3AF]">
                    {formData.is_active
                      ? "Product is visible to customers"
                      : "Product is hidden from customers"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, is_active: !formData.is_active })
                  }
                  className="flex items-center gap-2"
                >
                  {formData.is_active ? (
                    <ToggleRight size={28} className="text-[#2ECC71]" />
                  ) : (
                    <ToggleLeft size={28} className="text-[#D1D5DB]" />
                  )}
                  <span
                    className={`text-sm font-medium ${formData.is_active ? "text-[#27AE60]" : "text-[#9CA3AF]"
                      }`}
                  >
                    {formData.is_active ? "Active" : "Inactive"}
                  </span>
                </button>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-[#2ECC71] px-6 py-3 text-sm font-semibold text-white hover:bg-[#27AE60] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2ECC71] focus-visible:ring-offset-2 disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      Saving...
                    </span>
                  ) : editingProduct ? (
                    "Save Changes"
                  ) : (
                    "Save Product"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    resetForm();
                  }}
                  className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-3 text-sm font-medium text-[#374151] hover:border-[#2ECC71] hover:text-[#27AE60] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
      {(showDeleteModal || showBulkDeleteModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <h3 className="mb-2 text-center text-lg font-bold text-[#111827]">
              {showBulkDeleteModal
                ? `Delete ${selectedIds.length} Products?`
                : "Delete Product?"}
            </h3>
            <p className="mb-6 text-center text-sm text-[#6B7280]">
              {showBulkDeleteModal
                ? `Are you sure you want to delete ${selectedIds.length} selected products? This action cannot be undone.`
                : `Are you sure you want to delete "${deletingProduct?.name}"? This action cannot be undone.`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={
                  showBulkDeleteModal
                    ? handleBulkDelete
                    : confirmDelete
                }
                className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setShowBulkDeleteModal(false);
                  setDeletingProduct(null);
                }}
                className="flex-1 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
