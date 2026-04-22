import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  FolderTree,
  LogOut,
  Menu,
  X,
  Settings,
} from "lucide-react";
import { useState } from "react";

export default function AdminHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/admin" className="flex items-center gap-2">
              <img
                src="https://ucarecdn.com/1ba9ff02-d14c-447c-b424-734247393bdd/-/format/auto/"
                alt="Sri Usha"
                className="h-10 w-auto"
              />
              <div className="hidden sm:block">
                <span className="text-sm font-bold text-[#27AE60]">Sri Usha</span>
                <span className="ml-1 text-xs text-[#6B7280]">Admin</span>
              </div>
            </a>
            <nav className="hidden md:flex items-center gap-1">
              <a
                href="/admin"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[#111827] hover:bg-[#E8F8F0] hover:text-[#27AE60]"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </a>
              <a
                href="/admin/products"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-[#6B7280] hover:bg-[#E8F8F0] hover:text-[#27AE60]"
              >
                <Package size={16} />
                Products
              </a>
              <a
                href="/admin/orders"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-[#6B7280] hover:bg-[#E8F8F0] hover:text-[#27AE60]"
              >
                <ShoppingBag size={16} />
                Orders
              </a>
              <a
                href="/admin/users"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-[#6B7280] hover:bg-[#E8F8F0] hover:text-[#27AE60]"
              >
                <Users size={16} />
                Users
              </a>
              <a
                href="/admin/categories"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-[#6B7280] hover:bg-[#E8F8F0] hover:text-[#27AE60]"
              >
                <FolderTree size={16} />
                Categories
              </a>
              <a
                href="/admin/settings"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-[#6B7280] hover:bg-[#E8F8F0] hover:text-[#27AE60]"
              >
                <Settings size={16} />
                Settings
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <a href="/" className="hidden sm:block text-sm text-[#6B7280] hover:text-[#27AE60]">
              View Store
            </a>
            <a
              href="/account/logout"
              className="hidden sm:flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#27AE60]"
            >
              <LogOut size={16} />
              Sign Out
            </a>
            <button
              className="md:hidden p-2 text-[#6B7280] hover:text-[#27AE60]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E7EB] bg-white">
          <div className="px-4 py-3 space-y-1">
            <a
              href="/admin"
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[#111827] hover:bg-[#E8F8F0]"
            >
              <LayoutDashboard size={16} />
              Dashboard
            </a>
            <a
              href="/admin/products"
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#E8F8F0]"
            >
              <Package size={16} />
              Products
            </a>
            <a
              href="/admin/orders"
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#E8F8F0]"
            >
              <ShoppingBag size={16} />
              Orders
            </a>
            <a
              href="/admin/users"
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#E8F8F0]"
            >
              <Users size={16} />
              Users
            </a>
            <a
              href="/admin/categories"
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#E8F8F0]"
            >
              <FolderTree size={16} />
              Categories
            </a>
            <a
              href="/admin/settings"
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#E8F8F0]"
            >
              <Settings size={16} />
              Settings
            </a>
            <div className="border-t border-[#E5E7EB] pt-2 mt-2">
              <a
                href="/"
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#E8F8F0]"
              >
                View Store
              </a>
              <a
                href="/account/logout"
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-[#6B7280] hover:bg-[#E8F8F0]"
              >
                <LogOut size={16} />
                Sign Out
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
