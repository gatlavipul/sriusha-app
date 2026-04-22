import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const totalProducts =
      await sql`SELECT COUNT(*) as count FROM products WHERE is_active = true`;
    const totalOrders = await sql`SELECT COUNT(*) as count FROM orders`;
    const totalRevenue =
      await sql`SELECT SUM(total_amount) as total FROM orders WHERE payment_status = 'completed'`;
    const pendingOrders =
      await sql`SELECT COUNT(*) as count FROM orders WHERE status = 'pending'`;

    const recentOrders = await sql`
      SELECT * FROM orders 
      ORDER BY created_at DESC 
      LIMIT 5
    `;

    return Response.json({
      stats: {
        totalProducts: parseInt(totalProducts[0].count),
        totalOrders: parseInt(totalOrders[0].count),
        totalRevenue: parseFloat(totalRevenue[0].total || 0),
        pendingOrders: parseInt(pendingOrders[0].count),
      },
      recentOrders,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
