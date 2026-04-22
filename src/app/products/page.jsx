import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Search } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const category = params.get("category");
      if (category) {
        setSelectedCategory(category);
      }
    }
  }, []);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCategory) params.append("category", selectedCategory);
    if (searchQuery) params.append("search", searchQuery);

    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedCategory, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">
            All Products
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Browse our complete collection
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("")}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                selectedCategory === ""
                  ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                  : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#2563EB] hover:text-[#2563EB]"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.slug)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                  selectedCategory === category.slug
                    ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                    : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#2563EB] hover:text-[#2563EB]"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="relative w-full sm:w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-lg border border-[#E5E7EB] bg-white py-2 pl-9 pr-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
            />
          </form>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-[#6B7280]">
            Loading...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-12 text-center">
            <p className="text-sm text-[#6B7280]">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <a
                key={product.id}
                href={`/products/${product.slug}`}
                className="group rounded-xl border border-[#E5E7EB] bg-white p-4 transition-colors hover:border-[#2563EB]"
              >
                <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-[#F9FAFB]">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="flex items-start gap-1.5">
                  {product.brand && (
                    <span className="inline-block rounded-full border border-[#E5E7EB] bg-white px-2 py-0.5 text-xs text-[#6B7280]">
                      {product.brand}
                    </span>
                  )}
                  {product.stock_quantity > 0 &&
                    product.stock_quantity < 10 && (
                      <span className="inline-block rounded-full border border-[#EA580C] bg-[#FFF7ED] px-2 py-0.5 text-xs text-[#EA580C]">
                        Low Stock
                      </span>
                    )}
                </div>
                <h3 className="mt-2 text-sm font-semibold text-[#111827] group-hover:text-[#2563EB]">
                  {product.name}
                </h3>
                {product.weight && (
                  <p className="mt-1 text-xs text-[#6B7280]">
                    {product.weight}
                  </p>
                )}
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-base font-semibold text-[#111827]">
                    ₹{product.price}
                  </span>
                  {product.compare_price && (
                    <span className="text-sm text-[#6B7280] line-through">
                      ₹{product.compare_price}
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
