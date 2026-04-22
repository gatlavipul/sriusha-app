"use client";
import { useState, useEffect } from "react";
import AdminHeader from "@/components/AdminHeader";
import { Save, Truck, Settings as SettingsIcon } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    delivery_charge_per_km: "0",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();
      if (data.settings) {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Settings saved successfully!" });
      } else {
        setMessage({ type: "error", text: "Failed to save settings." });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({ type: "error", text: "An error occurred." });
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <AdminHeader />

      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-[#111827] flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-[#2ECC71]" />
            Store Settings
          </h1>
          <p className="text-sm text-[#6B7280]">
            Configure your store preferences and delivery charges
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[#111827] flex items-center gap-2">
              <Truck className="h-5 w-5 text-[#2ECC71]" />
              Delivery Configuration
            </h2>
            
            <div className="grid gap-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#374151]">
                  Delivery Charge per KM (₹)
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">₹</span>
                  <input
                    type="number"
                    value={settings.delivery_charge_per_km}
                    onChange={(e) => setSettings({ ...settings, delivery_charge_per_km: e.target.value })}
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white py-2.5 pl-8 pr-4 text-sm outline-none focus:border-[#2ECC71] focus:ring-2 focus:ring-[#2ECC71]/20"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <p className="mt-2 text-xs text-[#6B7280]">
                  This amount will be multiplied by the distance (in km) to calculate the final delivery fee during checkout.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {message && (
              <p className={`text-sm ${message.type === "success" ? "text-[#27AE60]" : "text-red-500"}`}>
                {message.text}
              </p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-[#2ECC71] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#27AE60] disabled:opacity-50 ml-auto"
            >
              {saving ? "Saving..." : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
