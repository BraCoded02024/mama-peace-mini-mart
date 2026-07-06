import { NextResponse } from "next/server";
import { loginRider, logoutRider } from "@/lib/rider-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === "logout") {
      await logoutRider();
      return NextResponse.json({ success: true });
    }

    const phone = String(body.phone ?? "").trim();
    const pin = String(body.pin ?? "");

    if (!phone || !pin) {
      return NextResponse.json(
        { error: "Phone number and PIN required" },
        { status: 400 }
      );
    }

    const result = await loginRider(phone, pin);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/rider-auth]", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
