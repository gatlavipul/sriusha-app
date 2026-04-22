import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Package } from "lucide-react";
import useUser from "@/utils/useUser";

export default function OrdersPage() {
  const { data: user, loading: userLoading } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userLoading && user) {
      fetchOrders();
    } else if (!userLoading && !user) {
      if (typeof window !== "undefined") {
        window.location.href = "/account/signin?callbackUrl=/orders";
      }
    }
  }, [user, userLoading]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders || []);
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

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-[#111827]">
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-12 text-center">
            <Package size={48} className="mx-auto mb-4 text-[#6B7280]" />
            <h2 className="mb-2 text-base font-semibold text-[#111827]">
              No orders yet
            </h2>
            <p className="mb-6 text-sm text-[#6B7280]">
              Start shopping to see your orders here
            </p>
            <a
              href="/products"
              className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1E40AF]"
            >
              Shop Now
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <a
                key={order.id}
                href={`/orders/${order.id}`}
                className="block rounded-xl border border-[#E5E7EB] bg-white p-6 transition-colors hover:border-[#2563EB]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-[#111827]">
                        Order #{order.id}
                      </span>
                      <span
                        className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7280]">
                      Placed on{" "}
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="mt-1 text-xs text-[#6B7280]">
                      {order.customer_name} • {order.shipping_city},{" "}
                      {order.shipping_pincode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-[#111827]">
                      ₹{parseFloat(order.total_amount).toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs text-[#6B7280]">
                      Payment: {order.payment_status}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
