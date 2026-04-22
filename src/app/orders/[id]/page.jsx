import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { CheckCircle, Package, Truck, MapPin } from "lucide-react";
import useUser from "@/utils/useUser";

export default function OrderDetailPage({ params }) {
  const { data: user, loading: userLoading } = useUser();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("confirmed") === "true") {
        setShowConfirmation(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!userLoading && user) {
      fetchOrder();
    } else if (!userLoading && !user) {
      if (typeof window !== "undefined") {
        window.location.href = "/account/signin";
      }
    }
  }, [user, userLoading, params.id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      const data = await res.json();
      setOrder(data.order);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "border-[#EA580C] bg-[#FFF7ED] text-[#EA580C]",
      confirmed: "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]",
      shipped: "border-[#7C3AED] bg-[#F5F3FF] text-[#7C3AED]",
      delivered: "border-green-600 bg-green-50 text-green-700",
      cancelled: "border-[#6B7280] bg-[#F9FAFB] text-[#6B7280]",
    };
    return colors[status] || colors.pending;
  };

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

  if (!order) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-12 text-center">
          <p className="text-sm text-[#6B7280]">Order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {showConfirmation && (
          <div className="mb-8 rounded-xl border border-green-200 bg-green-50 p-6">
            <div className="flex items-start gap-3">
              <CheckCircle
                size={24}
                className="mt-0.5 flex-shrink-0 text-green-600"
              />
              <div>
                <h2 className="text-base font-semibold text-green-900">
                  Order Confirmed!
                </h2>
                <p className="mt-1 text-sm text-green-700">
                  Thank you for your order. We'll send you updates about your
                  delivery.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">
              Order #{order.id}
            </h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              Placed on{" "}
              {new Date(order.created_at).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <span
            className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}
          >
            {order.status}
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
              <h2 className="mb-4 text-base font-semibold text-[#111827]">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 border-b border-[#E5E7EB] pb-4 last:border-0 last:pb-0"
                  >
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-[#111827]">
                        {item.product_name}
                      </h3>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        Quantity: {item.quantity}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#111827]">
                        ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-[#111827]">
                <MapPin size={16} />
                Shipping Address
              </h2>
              <div className="text-sm text-[#6B7280]">
                <p className="font-semibold text-[#111827]">
                  {order.customer_name}
                </p>
                <p className="mt-1">{order.shipping_address}</p>
                <p className="mt-1">
                  {order.shipping_city}, {order.shipping_pincode}
                </p>
                <p className="mt-1">{order.customer_phone}</p>
                <p className="mt-1">{order.customer_email}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
              <h2 className="mb-4 text-base font-semibold text-[#111827]">
                Order Summary
              </h2>

              <div className="space-y-3 border-b border-[#E5E7EB] pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Subtotal</span>
                  <span className="font-semibold text-[#111827]">
                    ₹{parseFloat(order.total_amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Shipping</span>
                  <span className="font-semibold text-[#111827]">Free</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between border-b border-[#E5E7EB] pb-4">
                <span className="text-base font-semibold text-[#111827]">
                  Total
                </span>
                <span className="text-lg font-semibold text-[#111827]">
                  ₹{parseFloat(order.total_amount).toFixed(2)}
                </span>
              </div>

              <div className="mt-4 text-sm">
                <p className="text-[#6B7280]">Payment Status</p>
                <p className="mt-1 font-semibold text-[#111827] capitalize">
                  {order.payment_status}
                </p>
              </div>

              <a
                href="/products"
                className="mt-6 block w-full rounded-lg border border-[#E5E7EB] bg-white px-6 py-3 text-center text-sm font-medium text-[#111827] hover:border-[#2563EB] hover:text-[#2563EB]"
              >
                Continue Shopping
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
