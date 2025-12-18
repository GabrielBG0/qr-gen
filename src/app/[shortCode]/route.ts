import { sql } from "@vercel/postgres";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;

  // 1. Declare a variable to hold the URL
  let targetUrl = null;

  try {
    // 2. Perform the database operation safely
    const result = await sql`
      UPDATE links 
      SET visits = visits + 1 
      WHERE short_code = ${shortCode}
      RETURNING original_url;
    `;

    // 3. If found, save it to the variable (DO NOT redirect here yet)
    if (result.rows.length > 0) {
      targetUrl = result.rows[0].original_url;
    }
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }

  // 4. Perform the redirect OUTSIDE the try/catch block
  // This allows the special NEXT_REDIRECT error to happen correctly
  if (targetUrl) {
    redirect(targetUrl);
  }

  // 5. If we got here and targetUrl is null, it means the link wasn't found
  return NextResponse.json({ error: "Link not found" }, { status: 404 });
}
