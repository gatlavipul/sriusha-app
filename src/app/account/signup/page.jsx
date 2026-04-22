import { useState } from "react";
import useAuth from "@/utils/useAuth";

export default function SignUpPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const { signUpWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password || !name) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await signUpWithCredentials({
        email,
        password,
        name,
        callbackUrl: "/",
        redirect: true,
      });
    } catch (err) {
      setError("This email is already registered. Please sign in instead.");
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
          Create Account
        </h1>
        <p className="mb-8 text-center text-sm text-[#6B7280]">
          Join Sri Usha Pet Store
        </p>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-[#6B7280]">
              Full Name
            </label>
            <input
              required
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
            />
          </div>
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
              placeholder="Create a password"
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
            {loading ? "Creating account..." : "Sign Up"}
          </button>
          <p className="text-center text-sm text-[#6B7280]">
            Already have an account?{" "}
            <a
              href={`/account/signin${
                typeof window !== "undefined" ? window.location.search : ""
              }`}
              className="font-medium text-[#2563EB] hover:text-[#1E40AF]"
            >
              Sign in
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}
