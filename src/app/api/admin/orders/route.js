import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await sql`
      SELECT * FROM orders 
      ORDER BY created_at DESC
    `;

    // Fetch items for all orders
    const orderIds = orders.map(o => o.id);
    let allItems = [];
    if (orderIds.length > 0) {
      allItems = await sql`
        SELECT * FROM order_items 
        WHERE order_id = ANY(${orderIds}::int[])
      `;
    }

    // Attach items to each order
    const ordersWithItems = orders.map(order => ({
      ...order,
      items: allItems.filter(item => item.order_id === order.id)
    }));

    return Response.json({ orders: ordersWithItems });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
