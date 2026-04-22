import { useState, useEffect } from "react";
import useAuth from "@/utils/useAuth";
import useUser from "@/utils/useUser";
import { useSession } from "@auth/create/react";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signInWithCredentials } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session) {
      console.log("[SignIn] User already logged in, redirecting to admin");
      const params = new URLSearchParams(window.location.search);
      const callbackUrl = params.get("callbackUrl") || "/admin";
      window.location.href = callbackUrl;
    }
  }, [status, session]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#F9FAFB]">
        <div className="text-sm text-[#6B7280]">Loading...</div>
      </div>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await signInWithCredentials({
        email,
        password,
        redirect: true,
      });
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F9FAFB] p-4">
      <form
        noValidate
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-xl border border-[#E5E7EB] bg-white p-8"
      >
        <h1 className="mb-2 text-center text-2xl font-semibold tracking-tight text-[#111827]">
          Welcome Back
        </h1>
        <p className="mb-8 text-center text-sm text-[#6B7280]">
          Sign in to Sri Usha Pet Store
        </p>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-[#6B7280]">
              Email
            </label>
            <input
              required
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-[#6B7280]">
              Password
            </label>
            <input
              required
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1E40AF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          
          <p className="text-center text-sm text-[#6B7280]">
            Don't have an account?{" "}
            <a
              href={`/account/signup${
                typeof window !== "undefined" ? window.location.search : ""
              }`}
              className="font-medium text-[#2563EB] hover:text-[#1E40AF]"
            >
              Sign up
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
