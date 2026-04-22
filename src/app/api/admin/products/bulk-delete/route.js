import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return Response.json(
        { error: "Product IDs are required" },
        { status: 400 }
      );
    }

    // Delete product images first (should cascade, but be safe)
    for (const id of ids) {
      await sql`DELETE FROM product_images WHERE product_id = ${id}`;
    }

    // Delete products
    const result = await sql`
      DELETE FROM products WHERE id = ANY(${ids}::int[])
      RETURNING id
    `;

    return Response.json({
      success: true,
      deletedCount: result.length,
    });
  } catch (error) {
    console.error("Error bulk deleting products:", error);
    return Response.json(
      { error: "Failed to delete products" },
      { status: 500 }
    );
  }
}
