import { useState, useEffect } from "react";
import AdminHeader from "@/components/AdminHeader";
import { Eye } from "lucide-react";
import useUser from "@/utils/useUser";

export default function AdminOrdersPage() {
  const { data: user, loading: userLoading } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!userLoading && user) {
      checkAdminAccess();
    } else if (!userLoading && !user) {
      if (typeof window !== "undefined") {
        window.location.href = "/account/signin?callbackUrl=/admin/orders";
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

      fetchOrders();
    } catch (error) {
      console.error("Error checking admin access:", error);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error(error);
      alert("Failed to update order status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-[#FEF3E2] text-[#F39C12]",
      confirmed: "bg-[#E8F8F0] text-[#27AE60]",
      shipped: "bg-blue-50 text-blue-600",
      delivered: "bg-[#E8F8F0] text-[#27AE60]",
      cancelled: "bg-[#F3F4F6] text-[#6B7280]",
    };
    return colors[status] || colors.pending;
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <AdminHeader />
        <div className="mx-auto max-w-7xl px-4 py-12 text-center">
          <p className="text-sm text-[#6B7280]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <AdminHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">
            Orders
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">Manage customer orders</p>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <tr>
                  <th className="p-4 text-xs font-medium text-[#6B7280]">
                    Order ID
                  </th>
                  <th className="p-4 text-xs font-medium text-[#6B7280]">
                    Customer
                  </th>
                  <th className="p-4 text-xs font-medium text-[#6B7280]">
                    Contact & Address
                  </th>
                  <th className="p-4 text-xs font-medium text-[#6B7280]">
                    Date
                  </th>
                  <th className="p-4 text-xs font-medium text-[#6B7280]">
                    Status
                  </th>
                  <th className="p-4 text-xs font-medium text-[#6B7280]">
                    Payment
                  </th>
                  <th className="p-4 text-right text-xs font-medium text-[#6B7280]">
                    Amount
                  </th>
                  <th className="p-4 text-right text-xs font-medium text-[#6B7280]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#F9FAFB]">
                    <td className="p-4 text-sm font-semibold text-[#111827]">
                      #{order.id}
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-[#111827]">
                        {order.customer_name}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {order.customer_email}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-[#111827]">
                        {order.customer_phone}
                      </p>
                      <p className="max-w-[200px] truncate text-xs text-[#6B7280]" title={`${order.shipping_address}, ${order.shipping_city}`}>
                        {order.shipping_address}, {order.shipping_city}
                      </p>
                    </td>
                    <td className="p-4 text-sm text-[#6B7280]">
                      {new Date(order.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block rounded-full border px-2 py-0.5 text-xs capitalize ${
                          order.payment_status === "completed"
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]"
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="p-4 text-right text-sm font-semibold text-[#111827]">
                      ₹{parseFloat(order.total_amount).toFixed(2)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="rounded-lg border border-[#E5E7EB] bg-white p-2 text-[#6B7280] hover:border-[#2ECC71] hover:text-[#2ECC71] transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#111827]">
                  Order #{selectedOrder.id}
                </h2>
                <p className="mt-1 text-sm text-[#6B7280]">
                  {new Date(selectedOrder.created_at).toLocaleDateString(
                    "en-IN",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-[#6B7280] hover:text-[#111827]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <h3 className="mb-3 text-sm font-semibold text-[#111827]">
                  Customer Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-[#6B7280]">
                    {selectedOrder.customer_name}
                  </p>
                  <p className="text-[#6B7280]">
                    {selectedOrder.customer_email}
                  </p>
                  <p className="text-[#6B7280]">
                    {selectedOrder.customer_phone}
                  </p>
                  <p className="mt-3 text-[#6B7280]">
                    {selectedOrder.shipping_address}
                    <br />
                    {selectedOrder.shipping_city},{" "}
                    {selectedOrder.shipping_pincode}
                  </p>
                </div>
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  <h3 className="mb-3 text-sm font-semibold text-[#111827]">
                    Order Items
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <img src={item.product_image} alt={item.product_name} className="h-10 w-10 rounded-md object-cover" />
                          <div>
                            <p className="text-sm font-medium text-[#111827]">{item.product_name}</p>
                            <p className="text-xs text-[#6B7280]">Qty: {item.quantity} × ₹{item.price}</p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-[#111827]">₹{(item.quantity * item.price).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#111827]">
                  Update Status
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "pending",
                    "confirmed",
                    "shipped",
                    "delivered",
                    "cancelled",
                  ].map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        updateOrderStatus(selectedOrder.id, status)
                      }
                      disabled={
                        updatingStatus || selectedOrder.status === status
                      }
                      className={`rounded-lg px-4 py-2 text-xs font-medium capitalize transition-colors ${
                          selectedOrder.status === status
                            ? "bg-[#E8F8F0] text-[#27AE60] border-[#2ECC71]"
                            : "border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#2ECC71] hover:text-[#27AE60] disabled:opacity-50"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Total Amount</span>
                  <span className="font-semibold text-[#111827]">
                    ₹{parseFloat(selectedOrder.total_amount).toFixed(2)}
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-[#6B7280]">Payment Status</span>
                  <span className="capitalize text-[#111827]">
                    {selectedOrder.payment_status}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full rounded-lg border border-[#E5E7EB] bg-white px-6 py-3 text-sm font-medium text-[#111827] hover:border-[#2ECC71] hover:text-[#27AE60] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
