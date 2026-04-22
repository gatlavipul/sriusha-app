import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category_id");

    let query = "SELECT * FROM sub_categories";
    const params = [];
    let paramIndex = 1;

    if (categoryId) {
      query += ` WHERE category_id = $${paramIndex}`;
      params.push(categoryId);
      paramIndex++;
    }

    query += " ORDER BY name ASC";

    const subCategories = await sql(query, params);
    return Response.json({ subCategories });
  } catch (error) {
    console.error("Error fetching sub-categories:", error);
    return Response.json(
      { error: "Failed to fetch sub-categories" },
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
    const { name, slug, category_id } = body;

    if (!name || !slug || !category_id) {
      return Response.json(
        { error: "Name, slug, and category_id are required" },
        { status: 400 }
      );
    }

    const subCategories = await sql`
      INSERT INTO sub_categories (name, slug, category_id)
      VALUES (${name}, ${slug}, ${category_id})
      RETURNING *
    `;

    return Response.json({ subCategory: subCategories[0] });
  } catch (error) {
    console.error("Error creating sub-category:", error);
    return Response.json(
      { error: "Failed to create sub-category" },
      { status: 500 }
    );
  }
}
