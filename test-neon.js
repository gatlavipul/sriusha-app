import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function test() {
  const sql = neon(process.env.DATABASE_URL);
  try {
    const rows = await sql("SELECT * FROM auth_users WHERE email = $1", ['vipul@gmail.com']);
    console.log("SUCCESS:", rows);
  } catch (e) {
    console.error("ERROR:", e);
  }
}
test();
