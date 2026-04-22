import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await sql`SELECT * FROM categories ORDER BY name ASC`;
    return Response.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return Response.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
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
    const { name, slug, description, image_url } = body;

    if (!name || !slug) {
      return Response.json(
        { error: "Name and slug are required" },
        { status: 400 },
      );
    }

    const categories = await sql`
      INSERT INTO categories (name, slug, description, image_url)
      VALUES (${name}, ${slug}, ${description || null}, ${image_url || null})
      RETURNING *
    `;

    return Response.json({ category: categories[0] });
  } catch (error) {
    console.error("Error creating category:", error);
    return Response.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}
