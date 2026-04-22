import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    let query = `
      SELECT p.*, c.name as category_name, sc.name as sub_category_name,
        (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_default = true LIMIT 1) as default_image
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (LOWER(p.name) LIKE LOWER($${paramIndex}) OR LOWER(p.brand) LIKE LOWER($${paramIndex}) OR LOWER(p.description) LIKE LOWER($${paramIndex}))`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      query += ` AND p.category_id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (status === "active") {
      query += ` AND p.is_active = true`;
    } else if (status === "inactive") {
      query += ` AND p.is_active = false`;
    }

    query += ` ORDER BY p.created_at DESC`;

    const products = await sql(query, params);

    // For each product, use default_image or image_url for the thumbnail
    const enrichedProducts = products.map((p) => ({
      ...p,
      thumbnail_url: p.default_image || p.image_url,
    }));

    return Response.json({ products: enrichedProducts });
  } catch (error) {
    console.error("Error fetching products:", error);
    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      description,
      price,
      compare_price,
      sale_price,
      image_url,
      category_id,
      sub_category_id,
      stock_quantity,
      brand,
      weight,
      is_active,
      images,
    } = body;

    if (!name || !slug || !price || !category_id) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const products = await sql`
      INSERT INTO products (name, slug, description, price, compare_price, sale_price, image_url, category_id, sub_category_id, stock_quantity, brand, weight, is_active)
      VALUES (${name}, ${slug}, ${description || null}, ${price}, ${compare_price || null}, ${sale_price || null}, ${image_url || null}, ${category_id}, ${sub_category_id || null}, ${stock_quantity || 0}, ${brand || null}, ${weight || null}, ${is_active !== undefined ? is_active : true})
      RETURNING *
    `;

    const product = products[0];

    // Insert product images if provided
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        await sql`
          INSERT INTO product_images (product_id, image_url, is_default, sort_order)
          VALUES (${product.id}, ${img.url}, ${i === 0 ? true : false}, ${i})
        `;
      }
      // Update main image_url with the default image
      if (images[0]) {
        await sql`UPDATE products SET image_url = ${images[0].url} WHERE id = ${product.id}`;
        product.image_url = images[0].url;
      }
    }

    return Response.json({ product });
  } catch (error) {
    console.error("Error creating product:", error);
    return Response.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
