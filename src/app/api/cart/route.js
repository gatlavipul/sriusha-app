import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cartItems = await sql`
      SELECT c.*, p.name, p.price, p.image_url, p.stock_quantity 
      FROM cart_items c 
      JOIN products p ON c.product_id = p.id 
      WHERE c.user_id = ${session.user.id}
      ORDER BY c.created_at DESC
    `;

    return Response.json({ cartItems });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return Response.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { product_id, quantity } = body;

    if (!product_id || !quantity || quantity < 1) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    // Check if item already exists in cart
    const existing = await sql`
      SELECT * FROM cart_items 
      WHERE user_id = ${session.user.id} AND product_id = ${product_id}
    `;

    if (existing.length > 0) {
      // Update quantity
      await sql`
        UPDATE cart_items 
        SET quantity = quantity + ${quantity}, updated_at = NOW()
        WHERE user_id = ${session.user.id} AND product_id = ${product_id}
      `;
    } else {
      // Insert new item
      await sql`
        INSERT INTO cart_items (user_id, product_id, quantity)
        VALUES (${session.user.id}, ${product_id}, ${quantity})
      `;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return Response.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, quantity } = body;

    if (!id || quantity < 0) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    if (quantity === 0) {
      await sql`
        DELETE FROM cart_items 
        WHERE id = ${id} AND user_id = ${session.user.id}
      `;
    } else {
      await sql`
        UPDATE cart_items 
        SET quantity = ${quantity}, updated_at = NOW()
        WHERE id = ${id} AND user_id = ${session.user.id}
      `;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error updating cart:", error);
    return Response.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    await sql`
      DELETE FROM cart_items 
      WHERE id = ${id} AND user_id = ${session.user.id}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    return Response.json(
      { error: "Failed to delete cart item" },
      { status: 500 },
    );
  }
}
