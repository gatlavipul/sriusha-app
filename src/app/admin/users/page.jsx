import { useState, useEffect } from "react";
import AdminHeader from "@/components/AdminHeader";
import { Plus, Trash2, Shield, User } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "admin",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ email: "", password: "", name: "", role: "admin" });
        setShowAddUser(false);
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user");
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <AdminHeader />

      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#111827]">
              User Management
            </h1>
            <p className="text-sm text-[#6B7280]">
              Manage admin users and permissions
            </p>
          </div>
          <button
            onClick={() => setShowAddUser(!showAddUser)}
            className="flex items-center gap-2 rounded-lg bg-[#2ECC71] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#27AE60]"
          >
            <Plus className="h-4 w-4" />
            Add Admin User
          </button>
        </div>

        {showAddUser && (
          <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#111827]">
              Add New Admin User
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6B7280]">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20"
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6B7280]">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6B7280]">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20"
                    placeholder="Strong password"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#6B7280]">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20"
                  >
                    <option value="admin">Admin</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-[#2ECC71] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#27AE60]"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#111827] transition-colors hover:border-[#2ECC71] hover:text-[#2ECC71]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="rounded-xl border border-[#E5E7EB] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280]">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280]">
                    Contact Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280]">
                    Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280]">
                    Orders
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280]">
                    Total Spent
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280]">
                    Role
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-[#6B7280]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-sm text-[#6B7280]"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-sm text-[#6B7280]"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-[#E5E7EB] last:border-0"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F8F0]">
                            {user.role === "admin" ? (
                              <Shield className="h-5 w-5 text-[#27AE60]" />
                            ) : (
                              <User className="h-5 w-5 text-[#6B7280]" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#111827]">
                              {user.name || "No name"}
                            </p>
                            <p className="text-xs text-[#6B7280]">
                              ID: {user.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#111827]">{user.email}</p>
                        {user.phone && (
                          <p className="text-xs text-[#6B7280]">{user.phone}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="max-w-[200px] truncate text-xs text-[#6B7280]" title={user.address}>
                          {user.address || "No address"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#111827]">
                        {user.total_orders || 0} orders
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#2ECC71]">
                        ₹{Number(user.total_spent || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value)
                          }
                          className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-1 text-xs outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20"
                        >
                          <option value="admin">Admin</option>
                          <option value="customer">Customer</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
