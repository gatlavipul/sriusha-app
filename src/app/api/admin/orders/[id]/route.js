import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return Response.json({ error: "Status is required" }, { status: 400 });
    }

    await sql`
      UPDATE orders 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating order:", error);
    return Response.json({ error: "Failed to update order" }, { status: 500 });
  }
}
