import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { ShoppingCart, Package, AlertCircle } from "lucide-react";
import useUser from "@/utils/useUser";

export default function ProductDetailPage({ params }) {
  const { data: user } = useUser();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetch(`/api/products/${params.slug}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data.product);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.slug]);

  const handleAddToCart = async () => {
    if (!user) {
      window.location.href =
        "/account/signin?callbackUrl=" +
        encodeURIComponent(window.location.pathname);
      return;
    }

    setAddingToCart(true);
    setMessage(null);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: product.id, quantity }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Added to cart!" });
        setTimeout(() => {
          window.location.href = "/cart";
        }, 1000);
      } else {
        setMessage({ type: "error", text: "Failed to add to cart" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to add to cart" });
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-12 text-center">
          <p className="text-sm text-[#6B7280]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-12 text-center">
          <p className="text-sm text-[#6B7280]">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]">
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              {product.brand && (
                <span className="inline-block rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs text-[#6B7280]">
                  {product.brand}
                </span>
              )}
              {product.category_name && (
                <span className="inline-block rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs text-[#6B7280]">
                  {product.category_name}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-[#111827] sm:text-3xl">
              {product.name}
            </h1>

            {product.weight && (
              <p className="mt-2 text-sm text-[#6B7280]">{product.weight}</p>
            )}

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-[#111827]">
                ₹{product.price}
              </span>
              {product.compare_price && (
                <span className="text-lg text-[#6B7280] line-through">
                  ₹{product.compare_price}
                </span>
              )}
            </div>

            {product.description && (
              <p className="mt-6 text-sm text-[#6B7280]">
                {product.description}
              </p>
            )}

            <div className="mt-8 space-y-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <div className="flex items-center gap-2 text-sm">
                <Package size={16} className="text-[#6B7280]" />
                <span className="text-[#6B7280]">
                  {product.stock_quantity > 0 ? (
                    <>
                      <span className="font-medium text-[#111827]">
                        {product.stock_quantity}
                      </span>{" "}
                      units in stock
                    </>
                  ) : (
                    <span className="text-[#EA580C]">Out of stock</span>
                  )}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-lg font-medium text-[#6B7280] hover:text-[#111827]"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-semibold text-[#111827]">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock_quantity, quantity + 1))
                  }
                  className="text-lg font-medium text-[#6B7280] hover:text-[#111827]"
                  disabled={quantity >= product.stock_quantity}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock_quantity === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1E40AF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 disabled:opacity-50"
              >
                <ShoppingCart size={16} />
                {addingToCart
                  ? "Adding..."
                  : product.stock_quantity === 0
                    ? "Out of Stock"
                    : "Add to Cart"}
              </button>
            </div>

            {message && (
              <div
                className={`mt-4 rounded-lg border p-3 text-sm ${
                  message.type === "success"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}

            {!user && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-[#E5E7EB] bg-[#EFF6FF] p-3">
                <AlertCircle size={16} className="mt-0.5 text-[#2563EB]" />
                <p className="text-sm text-[#2563EB]">
                  Please{" "}
                  <a href="/account/signin" className="font-medium underline">
                    sign in
                  </a>{" "}
                  to add items to your cart
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
