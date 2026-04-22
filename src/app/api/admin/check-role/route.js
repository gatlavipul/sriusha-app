import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json(
        { error: "Unauthorized", isAdmin: false },
        { status: 401 },
      );
    }

    const users =
      await sql`SELECT role FROM auth_users WHERE id = ${session.user.id} LIMIT 1`;
    const isAdmin = users[0]?.role === "admin";

    return Response.json({ isAdmin, role: users[0]?.role || "customer" });
  } catch (error) {
    console.error("Error checking role:", error);
    return Response.json(
      { error: "Failed to check role", isAdmin: false },
      { status: 500 },
    );
  }
}
