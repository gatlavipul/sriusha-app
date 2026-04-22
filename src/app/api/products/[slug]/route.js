import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { slug } = params;
    const products = await sql`
      SELECT p.*, c.name as category_name, c.slug as category_slug 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.slug = ${slug} AND p.is_active = true
      LIMIT 1
    `;

    if (products.length === 0) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json({ product: products[0] });
  } catch (error) {
    console.error("Error fetching product:", error);
    return Response.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
