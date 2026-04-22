import { neon } from '@neondatabase/serverless';

const DATABASE_URL = "postgresql://neondb_owner:npg_SXFYd9iaT0kN@ep-weathered-unit-anpho88q-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

async function migrate() {
  console.log("Running database migration...");
  const results = [];

  // Create sub_categories table
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

  // Add sub_category_id column to products
  try {
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sub_category_id INTEGER REFERENCES sub_categories(id)`;
    results.push("Added sub_category_id to products");
  } catch (e) {
    results.push(`sub_category_id: ${e.message}`);
  }

  // Add sale_price column to products
  try {
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price DECIMAL(10,2)`;
    results.push("Added sale_price to products");
  } catch (e) {
    results.push(`sale_price: ${e.message}`);
  }

  // Create product_images table
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

  // Create indexes
  try {
    await sql`CREATE INDEX IF NOT EXISTS idx_products_sub_category_id ON products(sub_category_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sub_categories_category_id ON sub_categories(category_id)`;
    results.push("Created indexes");
  } catch (e) {
    results.push(`indexes: ${e.message}`);
  }

  console.log("\nMigration Results:");
  results.forEach(r => console.log(`  ✓ ${r}`));
  console.log("\nMigration complete!");
  process.exit(0);
}

migrate().catch(e => {
  console.error("Migration failed:", e);
  process.exit(1);
});
