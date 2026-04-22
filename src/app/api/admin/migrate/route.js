import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const users = await sql`SELECT role FROM auth_users WHERE id = ${session.user.id}`;
    if (users.length === 0 || users[0].role !== 'admin') {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const results = [];

    // Create sub_categories table if not exists
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS sub_categories (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;
      results.push("Created sub_categories table");
    } catch (e) {
      results.push(`sub_categories: ${e.message}`);
    }

    // Add sub_category_id column to products if not exists
    try {
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sub_category_id INTEGER REFERENCES sub_categories(id)`;
      results.push("Added sub_category_id to products");
    } catch (e) {
      results.push(`sub_category_id: ${e.message}`);
    }

    // Add sale_price column to products if not exists
    try {
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10,2)`;
      results.push("Added sale_price to products");
    } catch (e) {
      results.push(`sale_price: ${e.message}`);
    }

    // Create product_images table if not exists
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS product_images (
          id SERIAL PRIMARY KEY,
          product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          image_url TEXT NOT NULL,
          is_default BOOLEAN DEFAULT false,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;
      results.push("Created product_images table");
    } catch (e) {
      results.push(`product_images: ${e.message}`);
    }

    // Create indexes if not exists
    try {
      await sql`CREATE INDEX IF NOT EXISTS idx_products_sub_category_id ON products(sub_category_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_sub_categories_category_id ON sub_categories(category_id)`;
      results.push("Created indexes");
    } catch (e) {
      results.push(`indexes: ${e.message}`);
    }

    return Response.json({ success: true, results });
  } catch (error) {
    console.error("Migration error:", error);
    return Response.json(
      { error: "Migration failed", details: error.message },
      { status: 500 }
    );
  }
}
