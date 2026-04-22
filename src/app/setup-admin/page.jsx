import { useState } from "react";

export default function SetupAdminPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const createAdmin = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/make-first-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "gatlavipul@gmail.com",
          password: "Vipul*123",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: "success",
          message: data.message,
          action: data.action,
        });
      } else {
        setStatus({ type: "error", message: data.error });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Failed to create admin account" });
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F9FAFB] p-4">
      <div className="w-full max-w-md rounded-xl border border-[#E5E7EB] bg-white p-8">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-[#111827]">
          Admin Account Setup
        </h1>
        <p className="mb-6 text-sm text-[#6B7280]">
          Create the first admin account for Sri Usha Pet Store
        </p>

        <div className="mb-6 rounded-lg bg-[#FEF3C7] border border-[#FCD34D] p-4">
          <p className="text-sm text-[#92400E] font-medium mb-2">
            ⚠️ Security Notice
          </p>
          <p className="text-xs text-[#92400E]">
            After creating the admin account, you should delete this page and
            the /api/make-first-admin route for security purposes.
          </p>
        </div>

        <div className="mb-6 space-y-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Email:</p>
            <p className="text-sm font-mono text-[#111827]">
              gatlavipul@gmail.com
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#6B7280]">Password:</p>
            <p className="text-sm font-mono text-[#111827]">Vipul*123</p>
          </div>
        </div>

        {status && (
          <div
            className={`mb-6 rounded-lg border p-4 ${
              status.type === "success"
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <p
              className={`text-sm font-medium ${
                status.type === "success" ? "text-green-800" : "text-red-800"
              }`}
            >
              {status.message}
            </p>
            {status.type === "success" && status.action === "created" && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-green-700">Next steps:</p>
                <ol className="ml-4 list-decimal space-y-1 text-xs text-green-700">
                  <li>Sign in at /account/signin with the admin credentials</li>
                  <li>
                    Delete the file: /apps/web/src/app/setup-admin/page.jsx
                  </li>
                  <li>
                    Delete the file:
                    /apps/web/src/app/api/make-first-admin/route.js
                  </li>
                </ol>
              </div>
            )}
          </div>
        )}

        <button
          onClick={createAdmin}
          disabled={loading || status?.type === "success"}
          className="w-full rounded-lg bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1E40AF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 disabled:opacity-50"
        >
          {loading
            ? "Creating Admin..."
            : status?.type === "success"
              ? "Admin Created ✓"
              : "Create Admin Account"}
        </button>

        {status?.type === "success" && (
          <div className="mt-4">
            <a
              href="/account/signin"
              className="block w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-center text-sm font-semibold text-[#111827] transition-colors hover:bg-[#F9FAFB]"
            >
              Go to Sign In
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
