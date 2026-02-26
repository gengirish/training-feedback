import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getParticipantsByEmail, getFeedbacksByEmail } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;
    const registrations = getParticipantsByEmail(email);
    const feedbacks = getFeedbacksByEmail(email);

    return NextResponse.json({ registrations, feedbacks });
  } catch (error) {
    console.error("My data error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
