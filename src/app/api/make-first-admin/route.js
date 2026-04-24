import sql from "@/app/api/utils/sql";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (email !== "gatlavipul@gmail.com" || password !== "Vipul*123") {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Check if user already exists
    const existing =
      await sql`SELECT id, role FROM auth_users WHERE email = ${email} LIMIT 1`;

    if (existing.length > 0) {
      // User exists, just promote to admin
      await sql`UPDATE auth_users SET role = 'admin' WHERE email = ${email}`;
      return Response.json({
        success: true,
        message: "Existing user promoted to admin",
        action: "promoted",
      });
    }

    // Create new admin user
    const newUsers = await sql`
      INSERT INTO auth_users (email, name, role, "emailVerified")
      VALUES (${email}, 'Vipul Gatla', 'admin', NULL)
      RETURNING id
    `;

    const newUser = newUsers[0];

    // Create credentials account
    const hashedPassword = await bcrypt.hash(password, 10);
    await sql`
      INSERT INTO auth_accounts (
        "userId", provider, type, "providerAccountId", password
      )
      VALUES (
        ${newUser.id}, 'credentials', 'credentials', ${newUser.id}, ${hashedPassword}
      )
    `;

    return Response.json({
      success: true,
      message:
        "Admin account created successfully. Please delete this route for security.",
      action: "created",
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    return Response.json({ error: "Failed to create admin" }, { status: 500 });
  }
}
