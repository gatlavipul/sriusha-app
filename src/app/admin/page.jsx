import { useState, useEffect } from "react";
import AdminHeader from "@/components/AdminHeader";
import { Package, ShoppingBag, IndianRupee, Clock, TrendingUp, AlertCircle } from "lucide-react";
import useUser from "@/utils/useUser";

export default function AdminDashboard() {
  const { data: user, loading: userLoading } = useUser();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState("checking"); // checking, authenticated, unauthorized, unauthenticated

  useEffect(() => {
    console.log("[Admin Dashboard] userLoading:", userLoading, "user:", user);
    if (userLoading) {
      setAuthStatus("checking");
    } else if (!user) {
      console.log("[Admin Dashboard] No user found, redirecting to sign in");
      setAuthStatus("unauthenticated");
      if (typeof window !== "undefined") {
        window.location.href = "/account/signin?callbackUrl=/admin";
      }
    } else {
      console.log("[Admin Dashboard] User found, checking admin access");
      setAuthStatus("authenticated");
      checkAdminAccess();
    }
  }, [user, userLoading]);

  const checkAdminAccess = async () => {
    try {
      const response = await fetch("/api/admin/check-role");
      const data = await response.json();

      if (!data.isAdmin) {
        setAuthStatus("unauthorized");
        setLoading(false);
        return;
      }

      fetchStats();
    } catch (error) {
      console.error("Error checking admin access:", error);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data.stats);
      setRecentOrders(data.recentOrders || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || authStatus === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-[#6B7280]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#2ECC71] border-t-transparent" />
            Checking authentication...
          </div>
        </div>
      </div>
    );
  }

  if (authStatus === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-[#6B7280]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#2ECC71] border-t-transparent" />
            Redirecting to sign in...
          </div>
        </div>
      </div>
    );
  }

  if (authStatus === "unauthorized") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <p className="text-sm text-[#6B7280]">You don't have admin access.</p>
          <a href="/" className="text-sm text-[#27AE60] hover:underline mt-2 inline-block">
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <AdminHeader />
        <div className="mx-auto max-w-7xl px-4 py-12 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-[#6B7280]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#2ECC71] border-t-transparent" />
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      iconBg: "bg-[#E8F8F0]",
      iconColor: "text-[#27AE60]",
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      iconBg: "bg-[#E8F8F0]",
      iconColor: "text-[#27AE60]",
    },
    {
      label: "Total Revenue",
      value: `₹${stats?.totalRevenue?.toFixed(2) || "0.00"}`,
      icon: IndianRupee,
      iconBg: "bg-[#FEF3E2]",
      iconColor: "text-[#F39C12]",
    },
    {
      label: "Pending Orders",
      value: stats?.pendingOrders || 0,
      icon: Clock,
      iconBg: "bg-[#FEF3E2]",
      iconColor: "text-[#F39C12]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <AdminHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Welcome to Sri Usha Vet & Pet Stores admin panel
          </p>
        </div>

        {/* Stat Cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                    {card.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-[#111827]">
                    {card.value}
                  </p>
                </div>
                <div className={`rounded-xl ${card.iconBg} p-3`}>
                  <card.icon size={24} className={card.iconColor} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[#27AE60]" />
              <h2 className="text-base font-semibold text-[#111827]">
                Recent Orders
              </h2>
            </div>
            <a
              href="/admin/orders"
              className="text-sm font-medium text-[#27AE60] hover:text-[#2ECC71]"
            >
              View All
            </a>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center">
              <AlertCircle size={32} className="mx-auto mb-2 text-[#D1D5DB]" />
              <p className="text-sm text-[#6B7280]">No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#E5E7EB]">
                  <tr>
                    <th className="pb-3 text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                      Order ID
                    </th>
                    <th className="pb-3 text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                      Customer
                    </th>
                    <th className="pb-3 text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                      Date
                    </th>
                    <th className="pb-3 text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                      Status
                    </th>
                    <th className="pb-3 text-right text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#F8F9FA]">
                      <td className="py-3 text-sm font-semibold text-[#111827]">
                        #{order.id}
                      </td>
                      <td className="py-3 text-sm text-[#6B7280]">
                        {order.customer_name}
                      </td>
                      <td className="py-3 text-sm text-[#6B7280]">
                        {new Date(order.created_at).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            order.status === "pending"
                              ? "bg-[#FEF3E2] text-[#F39C12]"
                              : order.status === "completed"
                              ? "bg-[#E8F8F0] text-[#27AE60]"
                              : order.status === "cancelled"
                              ? "bg-red-50 text-red-600"
                              : "bg-[#F3F4F6] text-[#6B7280]"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-sm font-semibold text-[#111827]">
                        ₹{parseFloat(order.total_amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
