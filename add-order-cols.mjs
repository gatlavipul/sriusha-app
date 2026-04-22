import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log("Adding new columns to orders table...");
  
  try {
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_distance DECIMAL(10,2) DEFAULT 0`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_charge DECIMAL(10,2) DEFAULT 0`;
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'razorpay'`;
    console.log("Migration completed.");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

migrate().catch(console.error);
