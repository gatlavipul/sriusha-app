import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const currentUser =
      await sql`SELECT role FROM auth_users WHERE id = ${session.user.id} LIMIT 1`;
    if (currentUser[0]?.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { role } = body;

    if (!role) {
      return Response.json({ error: "Role is required" }, { status: 400 });
    }

    await sql`
      UPDATE auth_users 
      SET role = ${role}
      WHERE id = ${id}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating user role:", error);
    return Response.json(
      { error: "Failed to update user role" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const currentUser =
      await sql`SELECT role FROM auth_users WHERE id = ${session.user.id} LIMIT 1`;
    if (currentUser[0]?.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;

    // Prevent deleting yourself
    if (parseInt(id) === session.user.id) {
      return Response.json(
        { error: "Cannot delete your own account" },
        { status: 400 },
      );
    }

    await sql`DELETE FROM auth_users WHERE id = ${id}`;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return Response.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
