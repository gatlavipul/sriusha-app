import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await sql`
      SELECT * FROM orders 
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC
    `;

    return Response.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
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
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      shipping_city,
      shipping_pincode,
      payment_intent_id,
      delivery_distance,
      delivery_charge,
      payment_method,
      total_amount,
    } = body;

    // Get cart items
    const cartItems = await sql`
      SELECT c.*, p.name, p.price, p.image_url 
      FROM cart_items c 
      JOIN products p ON c.product_id = p.id 
      WHERE c.user_id = ${session.user.id}
    `;

    if (cartItems.length === 0) {
      return Response.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Use the total amount sent from the client (includes delivery) or recalculate
    const finalTotal = total_amount || cartItems.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0,
    );

    // Create order
    const orders = await sql`
      INSERT INTO orders (
        user_id, customer_name, customer_email, customer_phone,
        shipping_address, shipping_city, shipping_pincode, 
        total_amount, payment_intent_id, payment_status, status,
        delivery_distance, delivery_charge, payment_method
      ) VALUES (
        ${session.user.id}, ${customer_name}, ${customer_email}, ${customer_phone},
        ${shipping_address}, ${shipping_city}, ${shipping_pincode},
        ${finalTotal}, ${payment_intent_id || null}, 
        ${payment_intent_id ? "paid" : "pending"}, 
        ${payment_method === 'cod' ? 'processing' : 'confirmed'},
        ${delivery_distance || 0}, ${delivery_charge || 0}, ${payment_method || 'razorpay'}
      )
      RETURNING *
    `;

    const order = orders[0];

    // Create order items
    for (const item of cartItems) {
      await sql`
        INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price)
        VALUES (${order.id}, ${item.product_id}, ${item.name}, ${item.image_url}, ${item.quantity}, ${item.price})
      `;
    }

    // Clear cart
    await sql`DELETE FROM cart_items WHERE user_id = ${session.user.id}`;

    return Response.json({ order });
  } catch (error) {
    console.error("Error creating order:", error);
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }
}
