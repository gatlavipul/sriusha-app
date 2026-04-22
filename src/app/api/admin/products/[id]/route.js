import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const products = await sql`
      SELECT p.*, c.name as category_name, sc.name as sub_category_name
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      WHERE p.id = ${id} LIMIT 1
    `;

    if (products.length === 0) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    // Fetch product images
    const images = await sql`
      SELECT * FROM product_images WHERE product_id = ${id} ORDER BY sort_order ASC, id ASC
    `;

    const product = { ...products[0], images };
    return Response.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return Response.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    const setClauses = [];
    const values = [];
    let paramIndex = 1;

    const allowedFields = [
      "name",
      "slug",
      "description",
      "price",
      "compare_price",
      "sale_price",
      "image_url",
      "category_id",
      "sub_category_id",
      "stock_quantity",
      "is_active",
      "brand",
      "weight",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        setClauses.push(`${field} = $${paramIndex}`);
        values.push(body[field]);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE products SET ${setClauses.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
    const products = await sql(query, values);
    const product = products[0];

    // Handle image updates
    if (body.images !== undefined) {
      // Delete existing images
      await sql`DELETE FROM product_images WHERE product_id = ${id}`;

      // Insert new images
      for (let i = 0; i < body.images.length; i++) {
        const img = body.images[i];
        await sql`
          INSERT INTO product_images (product_id, image_url, is_default, sort_order)
          VALUES (${id}, ${img.url}, ${i === 0 ? true : false}, ${i})
        `;
      }

      // Update main image_url
      if (body.images.length > 0) {
        await sql`UPDATE products SET image_url = ${body.images[0].url} WHERE id = ${id}`;
        product.image_url = body.images[0].url;
      }
    }

    return Response.json({ product });
  } catch (error) {
    console.error("Error updating product:", error);
    return Response.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    // Product images will be cascade deleted
    await sql`DELETE FROM products WHERE id = ${id}`;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return Response.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
