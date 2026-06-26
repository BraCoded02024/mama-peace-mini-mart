import { NextResponse } from "next/server";
import { loginAdmin, logoutAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === "logout") {
      await logoutAdmin();
      return NextResponse.json({ success: true });
    }

    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password required" },
        { status: 400 }
      );
    }

    const result = await loginAdmin(username, password);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/auth]", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
