import { useState, useEffect } from "react";
import { ShoppingCart, Menu, X, User } from "lucide-react";
import useUser from "@/utils/useUser";

export default function Header() {
  const { data: user } = useUser();
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetch("/api/cart")
        .then((res) => res.json())
        .then((data) => {
          if (data.cartItems) {
            const count = data.cartItems.reduce(
              (sum, item) => sum + item.quantity,
              0,
            );
            setCartCount(count);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2">
              <img
                src="https://ucarecdn.com/1ba9ff02-d14c-447c-b424-734247393bdd/-/format/auto/"
                alt="Sri Usha"
                className="h-10 w-auto"
              />
            </a>
            <nav className="hidden md:flex items-center gap-6">
              <a
                href="/products"
                className="text-sm font-medium text-[#111827] hover:text-[#2563EB]"
              >
                Products
              </a>
              <a
                href="/products?category=dog-food"
                className="text-sm text-[#6B7280] hover:text-[#111827]"
              >
                Dog
              </a>
              <a
                href="/products?category=cat-food"
                className="text-sm text-[#6B7280] hover:text-[#111827]"
              >
                Cat
              </a>
              <a
                href="/products?category=bird-supplies"
                className="text-sm text-[#6B7280] hover:text-[#111827]"
              >
                Birds
              </a>
              <a
                href="/products?category=grooming"
                className="text-sm text-[#6B7280] hover:text-[#111827]"
              >
                Grooming
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <a
                  href="/orders"
                  className="hidden sm:block text-sm text-[#6B7280] hover:text-[#111827]"
                >
                  Orders
                </a>
                <a href="/cart" className="relative">
                  <ShoppingCart size={20} className="text-[#111827]" />
                  {cartCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-xs font-semibold text-white">
                      {cartCount}
                    </span>
                  )}
                </a>
                <a
                  href="/account/logout"
                  className="hidden sm:flex items-center gap-2 rounded-full border border-[#E5E7EB] px-3 py-1.5 text-xs text-[#6B7280] hover:border-[#2563EB] hover:text-[#2563EB]"
                >
                  <User size={14} />
                  <span>{user.name || user.email}</span>
                </a>
              </>
            ) : (
              <>
                <a
                  href="/account/signin"
                  className="text-sm text-[#6B7280] hover:text-[#111827]"
                >
                  Sign In
                </a>
                <a
                  href="/account/signup"
                  className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1E40AF]"
                >
                  Sign Up
                </a>
              </>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-[#E5E7EB] bg-white p-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <a href="/products" className="text-sm font-medium text-[#111827]">
              All Products
            </a>
            <a
              href="/products?category=dog-food"
              className="text-sm text-[#6B7280]"
            >
              Dog
            </a>
            <a
              href="/products?category=cat-food"
              className="text-sm text-[#6B7280]"
            >
              Cat
            </a>
            <a
              href="/products?category=bird-supplies"
              className="text-sm text-[#6B7280]"
            >
              Birds
            </a>
            <a
              href="/products?category=grooming"
              className="text-sm text-[#6B7280]"
            >
              Grooming
            </a>
            {user && (
              <>
                <a href="/orders" className="text-sm text-[#6B7280]">
                  My Orders
                </a>
                <a href="/account/logout" className="text-sm text-[#6B7280]">
                  Sign Out
                </a>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
