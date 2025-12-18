"use server";

import { sql } from "@vercel/postgres";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";

// --- ACTION 1: LOGIN ---
export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  try {
    const { rows } = await sql`
      SELECT * FROM users WHERE username = ${username}
    `;
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return { success: false, message: "Invalid credentials" };
    }

    const cookieStore = await cookies();
    cookieStore.set("session_user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return { success: true, message: "Logged in!", role: user.role };
  } catch (error) {
    return { success: false, message: "Database connection failed" };
  }
}

// --- ACTION 2: SHORTEN LINK (With Deduplication) ---
export async function shortenUrlAction(prevState: any, formData: FormData) {
  const originalUrl = formData.get("url") as string;

  const cookieStore = await cookies();
  const userId = cookieStore.get("session_user_id")?.value;

  if (!userId) {
    return { success: false, message: "Unauthorized. Please log in." };
  }

  try {
    // 1. CHECK: Does this URL already exist?
    const existingLink = await sql`
      SELECT short_code FROM links 
      WHERE original_url = ${originalUrl} 
      LIMIT 1
    `;

    const host = process.env.NEXT_PUBLIC_BASE_URL
      ? `${process.env.NEXT_PUBLIC_BASE_URL}`
      : "http://localhost:3000";

    // 2. CASE A: Return existing
    if (existingLink.rows.length > 0) {
      const existingCode = existingLink.rows[0].short_code;
      return {
        success: true,
        shortUrl: `${host}/${existingCode}`,
        message: "Link retrieved from history",
      };
    }

    // 3. CASE B: Create new
    const shortCode = nanoid(6);
    await sql`
      INSERT INTO links (short_code, original_url, created_by)
      VALUES (${shortCode}, ${originalUrl}, ${userId})
    `;

    return {
      success: true,
      shortUrl: `${host}/${shortCode}`,
    };
  } catch (error) {
    console.error("Shorten error:", error);
    return { success: false, message: "Failed to create link" };
  }
}

// --- ACTION 3: REGISTER USER ---
export async function registerUserAction(prevState: any, formData: FormData) {
  const cookieStore = await cookies();
  const currentUserId = cookieStore.get("session_user_id")?.value;

  if (!currentUserId) return { success: false, message: "Unauthorized" };

  // Security Check: Is the requester an Admin?
  const adminCheck =
    await sql`SELECT role FROM users WHERE id = ${currentUserId}`;
  if (adminCheck.rows[0]?.role !== "admin") {
    return { success: false, message: "Forbidden: Admins only." };
  }

  const newUsername = formData.get("username") as string;
  const newPassword = formData.get("password") as string;
  const newRole = formData.get("role") as string;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await sql`
      INSERT INTO users (username, password_hash, role)
      VALUES (${newUsername}, ${hashedPassword}, ${newRole})
    `;

    return { success: true, message: `User ${newUsername} created!` };
  } catch (error) {
    return { success: false, message: "User already exists or DB error" };
  }
}
