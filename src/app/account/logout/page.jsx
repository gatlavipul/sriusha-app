import useAuth from "@/utils/useAuth";

export default function LogoutPage() {
  const { signOut } = useAuth();
  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F9FAFB] p-4">
      <div className="w-full max-w-md rounded-xl border border-[#E5E7EB] bg-white p-8 text-center">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight text-[#111827]">
          Sign Out
        </h1>
        <p className="mb-8 text-sm text-[#6B7280]">
          Are you sure you want to sign out?
        </p>

        <button
          onClick={handleSignOut}
          className="w-full rounded-lg bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1E40AF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
