import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { trackEvent } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ ok: true });
    }

    const body = await request.json();
    const eventName = typeof body?.event === "string" ? body.event : "";
    const metadata = typeof body?.metadata === "object" ? body.metadata : {};

    const allowed = ["video_opened", "guide_opened"];
    if (!allowed.includes(eventName)) {
      return NextResponse.json({ ok: true });
    }

    trackEvent(session.user.email, eventName, metadata);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
