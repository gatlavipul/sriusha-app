import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log("Running migrations...");
  
  await sql`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  // Insert default delivery charge setting if it doesn't exist
  await sql`INSERT INTO settings (key, value) VALUES ('delivery_charge_per_km', '10') ON CONFLICT (key) DO NOTHING`;

  console.log("Migration completed.");
}

migrate().catch(console.error);
