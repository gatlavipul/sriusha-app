import { useState, useEffect } from "react";
import Header from "@/components/Header";
import useUser from "@/utils/useUser";

export default function CheckoutPage() {
  const { data: user, loading: userLoading } = useUser();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    distance: "0",
    paymentMethod: "razorpay", // razorpay or cod
  });
  const [deliveryChargePerKm, setDeliveryChargePerKm] = useState(0);

  useEffect(() => {
    if (!userLoading && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
      fetchCart();
      loadRazorpayScript();
      fetchSettings();
    } else if (!userLoading && !user) {
      if (typeof window !== "undefined") {
        window.location.href = "/account/signin?callbackUrl=/checkout";
      }
    }
  }, [user, userLoading]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.settings && data.settings.delivery_charge_per_km) {
        setDeliveryChargePerKm(parseFloat(data.settings.delivery_charge_per_km));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || document.getElementById("razorpay-js")) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-js";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setCartItems(data.cartItems || []);
      if (data.cartItems.length === 0 && typeof window !== "undefined") {
        window.location.href = "/cart";
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0,
  );

  const deliveryCharge = parseFloat(formData.distance || 0) * deliveryChargePerKm;
  const total = subtotal + deliveryCharge;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      const orderDataPayload = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: formData.address,
        shipping_city: formData.city,
        shipping_pincode: formData.pincode,
        delivery_distance: formData.distance,
        delivery_charge: deliveryCharge,
        payment_method: formData.paymentMethod,
        total_amount: total,
      };

      if (formData.paymentMethod === "cod") {
        // Create order directly for COD
        const orderRes = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...orderDataPayload,
            payment_status: "pending",
            status: "processing",
          }),
        });

        if (!orderRes.ok) throw new Error("Failed to place order");
        const orderData = await orderRes.json();
        if (typeof window !== "undefined") {
          window.location.href = `/orders/${orderData.order.id}?confirmed=true`;
        }
        return;
      }

      // Create Razorpay Order
      const paymentRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });

      if (!paymentRes.ok) {
        const errData = await paymentRes.json();
        throw new Error(errData.error || "Failed to create order");
      }

      const { orderId, amount, currency, key } = await paymentRes.json();

      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: "Sri Usha Pet Store",
        description: "Purchase from Sri Usha Pet Store",
        order_id: orderId,
        handler: async function (response) {
          try {
            const orderRes = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...orderDataPayload,
                payment_intent_id: response.razorpay_payment_id,
                payment_status: "paid",
              }),
            });

            if (!orderRes.ok) throw new Error("Failed to save order");
            const orderData = await orderRes.json();
            if (typeof window !== "undefined") {
              window.location.href = `/orders/${orderData.order.id}?confirmed=true`;
            }
          } catch (err) {
            setError("Payment succeeded but order creation failed. Contact support.");
            setProcessing(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#2563EB" },
        modal: { ondismiss: () => setProcessing(false) },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      setError(error.message || "Failed to initiate checkout.");
      setProcessing(false);
    }
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
          Checkout
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
                <h2 className="mb-4 text-base font-semibold text-[#111827]">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-[#6B7280]">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-medium text-[#6B7280]">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-medium text-[#6B7280]">
                      Phone
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
                <h2 className="mb-4 text-base font-semibold text-[#111827]">
                  Delivery Options
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-[#6B7280]">
                      Distance from Store (KM)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.1"
                      value={formData.distance}
                      onChange={(e) =>
                        setFormData({ ...formData, distance: e.target.value })
                      }
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#2ECC71] focus-visible:ring-offset-2"
                      placeholder="e.g. 5.5"
                    />
                    <p className="mt-1 text-[10px] text-[#6B7280]">
                      Delivery charge: ₹{deliveryChargePerKm} per km
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
                <h2 className="mb-4 text-base font-semibold text-[#111827]">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#E5E7EB] p-4 transition-colors hover:bg-[#F9FAFB]">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={formData.paymentMethod === "razorpay"}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="h-4 w-4 text-[#2ECC71]"
                    />
                    <div>
                      <p className="text-sm font-medium text-[#111827]">Online Payment (Razorpay)</p>
                      <p className="text-xs text-[#6B7280]">Credit Card, UPI, Net Banking</p>
                    </div>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#E5E7EB] p-4 transition-colors hover:bg-[#F9FAFB]">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === "cod"}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="h-4 w-4 text-[#2ECC71]"
                    />
                    <div>
                      <p className="text-sm font-medium text-[#111827]">Cash on Delivery (COD)</p>
                      <p className="text-xs text-[#6B7280]">Pay when you receive your order</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
                <h2 className="mb-4 text-base font-semibold text-[#111827]">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-xs font-medium text-[#6B7280]">
                      Address
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-medium text-[#6B7280]">
                        City
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-medium text-[#6B7280]">
                        Pincode
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.pincode}
                        onChange={(e) =>
                          setFormData({ ...formData, pincode: e.target.value })
                        }
                        className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={processing}
                className="w-full rounded-lg bg-[#2ECC71] px-6 py-3 text-sm font-semibold text-white hover:bg-[#27AE60] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2ECC71] focus-visible:ring-offset-2 disabled:opacity-50"
              >
                {processing
                  ? "Processing..."
                  : formData.paymentMethod === "cod" 
                    ? `Place COD Order - ₹${total.toFixed(2)}`
                    : `Pay ₹${total.toFixed(2)} & Place Order`}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 lg:sticky lg:top-20">
              <h2 className="mb-4 text-base font-semibold text-[#111827]">
                Order Summary
              </h2>

              <div className="mb-4 space-y-3 border-b border-[#E5E7EB] pb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-[#111827]">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-[#6B7280]">
                        Qty: {item.quantity}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-[#111827]">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-b border-[#E5E7EB] pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Subtotal</span>
                  <span className="font-semibold text-[#111827]">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7280]">Delivery ({formData.distance} km)</span>
                  <span className="font-semibold text-[#111827]">₹{deliveryCharge.toFixed(2)}</span>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
