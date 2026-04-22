import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { ArrowRight, Loader2 } from "lucide-react";

export default function HomePage() {
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then((res) => res.json())
  });

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["featuredProducts"],
    queryFn: () => fetch("/api/products?limit=8").then((res) => res.json())
  });

  const categories = categoriesData?.categories || [];
  const featuredProducts = productsData?.products || [];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="border-b border-[#E5E7EB] bg-[#F9FAFB] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs text-[#6B7280]">
              <span className="text-[#EA580C]">●</span>
              <span>Complete Pet Care Solutions</span>
            </div>
            <h1 className="mb-4 text-4xl font-semibold tracking-tight text-[#111827] sm:text-5xl">
              Sri Usha Vet & Pet Stores
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-base text-[#6B7280]">
              Your trusted partner for premium pet food, accessories, grooming
              supplies, and veterinary care. Everything your pet needs, all in
              one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1E40AF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
              >
                Shop Now
                <ArrowRight size={16} />
              </a>
              <a
                href="/products?category=dog-food"
                className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-6 py-3 text-sm font-medium text-[#111827] hover:border-[#2563EB] hover:text-[#2563EB]"
              >
                Browse Categories
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#E5E7EB] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#111827]">
              Shop by Category
            </h2>
            <a
              href="/products"
              className="text-sm font-medium text-[#2563EB] hover:text-[#1E40AF]"
            >
              View All
            </a>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {isLoadingCategories
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="group rounded-xl border border-[#E5E7EB] bg-white p-4 animate-pulse">
                    <div className="mb-3 aspect-square rounded-lg bg-gray-200" />
                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
                  </div>
                ))
              : categories.slice(0, 6).map((category) => (
                  <a
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    className="group rounded-xl border border-[#E5E7EB] bg-white p-4 transition-colors hover:border-[#2563EB]"
                  >
                    <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-[#F9FAFB]">
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h3 className="text-sm font-semibold text-[#111827] group-hover:text-[#2563EB]">
                      {category.name}
                    </h3>
                    <p className="mt-1 text-xs text-[#6B7280]">
                      {category.description}
                    </p>
                  </a>
                ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#111827]">
              Featured Products
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Top picks for your pets
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {isLoadingProducts
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="group rounded-xl border border-[#E5E7EB] bg-white p-4 animate-pulse">
                    <div className="mb-4 aspect-square rounded-lg bg-gray-200" />
                    <div className="h-5 w-24 rounded-full bg-gray-200" />
                    <div className="mt-3 h-4 w-3/4 rounded bg-gray-200" />
                    <div className="mt-3 h-5 w-1/4 rounded bg-gray-200" />
                  </div>
                ))
              : featuredProducts.map((product) => (
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
                      <span className="inline-block rounded-full border border-[#E5E7EB] bg-white px-2 py-0.5 text-xs text-[#6B7280]">
                        {product.brand}
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-[#111827] group-hover:text-[#2563EB]">
                      {product.name}
                    </h3>
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
        </div>
      </section>

      <footer className="border-t border-[#E5E7EB] bg-[#F9FAFB] py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-[#6B7280]">
              © 2026 Sri Usha Vet & Pet Stores. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
