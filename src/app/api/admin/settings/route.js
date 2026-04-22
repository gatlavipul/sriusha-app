import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await sql`SELECT role FROM auth_users WHERE id = ${session.user.id} LIMIT 1`;
    if (currentUser[0]?.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const settings = await sql`SELECT * FROM settings`;
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    return Response.json({ settings: settingsMap });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return Response.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await sql`SELECT role FROM auth_users WHERE id = ${session.user.id} LIMIT 1`;
    if (currentUser[0]?.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { settings } = body;

    for (const [key, value] of Object.entries(settings)) {
      await sql`
        INSERT INTO settings (key, value, updated_at)
        VALUES (${key}, ${String(value)}, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return Response.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
