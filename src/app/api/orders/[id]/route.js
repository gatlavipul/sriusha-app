import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const orders = await sql`
      SELECT * FROM orders 
      WHERE id = ${id} AND user_id = ${session.user.id}
      LIMIT 1
    `;

    if (orders.length === 0) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    const items = await sql`
      SELECT * FROM order_items 
      WHERE order_id = ${id}
    `;

    return Response.json({ order: { ...orders[0], items } });
  } catch (error) {
    console.error("Error fetching order:", error);
    return Response.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
