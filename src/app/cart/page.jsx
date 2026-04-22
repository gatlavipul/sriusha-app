import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import useUser from "@/utils/useUser";

export default function CartPage() {
  const { data: user, loading: userLoading } = useUser();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userLoading && user) {
      fetchCart();
    } else if (!userLoading && !user) {
      if (typeof window !== "undefined") {
        window.location.href = "/account/signin?callbackUrl=/cart";
      }
    }
  }, [user, userLoading]);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setCartItems(data.cartItems || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId, quantity: newQuantity }),
      });
      fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await fetch(`/api/cart?id=${itemId}`, { method: "DELETE" });
      fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0,
  );

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-12 text-center">
          <p className="text-sm text-[#6B7280]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-[#111827]">
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-12 text-center">
            <ShoppingBag size={48} className="mx-auto mb-4 text-[#6B7280]" />
            <h2 className="mb-2 text-base font-semibold text-[#111827]">
              Your cart is empty
            </h2>
            <p className="mb-6 text-sm text-[#6B7280]">
              Add some products to get started
            </p>
            <a
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1E40AF]"
            >
              Shop Now
            </a>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-[#E5E7EB] bg-white p-4"
                  >
                    <div className="flex gap-4">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-[#111827]">
                            {item.name}
                          </h3>
                          <p className="mt-1 text-sm font-semibold text-[#111827]">
                            ₹{item.price}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  Math.max(1, item.quantity - 1),
                                )
                              }
                              className="text-sm font-medium text-[#6B7280] hover:text-[#111827]"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold text-[#111827]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  Math.min(
                                    item.stock_quantity,
                                    item.quantity + 1,
                                  ),
                                )
                              }
                              className="text-sm font-medium text-[#6B7280] hover:text-[#111827]"
                              disabled={item.quantity >= item.stock_quantity}
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-[#6B7280] hover:text-[#EA580C]"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 lg:sticky lg:top-20">
                <h2 className="mb-4 text-base font-semibold text-[#111827]">
                  Order Summary
                </h2>

                <div className="space-y-3 border-b border-[#E5E7EB] pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Subtotal</span>
                    <span className="font-semibold text-[#111827]">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Shipping</span>
                    <span className="font-semibold text-[#111827]">Free</span>
                  </div>
                </div>

                <div className="mt-4 flex justify-between">
                  <span className="text-base font-semibold text-[#111827]">
                    Total
                  </span>
                  <span className="text-lg font-semibold text-[#111827]">
                    ₹{total.toFixed(2)}
                  </span>
                </div>

                <a
                  href="/checkout"
                  className="mt-6 block w-full rounded-lg bg-[#2563EB] px-6 py-3 text-center text-sm font-semibold text-white hover:bg-[#1E40AF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
                >
                  Proceed to Checkout
                </a>

                <a
                  href="/products"
                  className="mt-3 block w-full rounded-lg border border-[#E5E7EB] bg-white px-6 py-3 text-center text-sm font-medium text-[#111827] hover:border-[#2563EB] hover:text-[#2563EB]"
                >
                  Continue Shopping
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
