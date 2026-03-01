import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getParticipantsByEmail, getFeedbacksByEmail, getCertificatesByEmail } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session.user.email;
    const [registrations, feedbacks, certificates] = await Promise.all([
      getParticipantsByEmail(email),
      getFeedbacksByEmail(email),
      getCertificatesByEmail(email),
    ]);

    return NextResponse.json({ registrations, feedbacks, certificates });
  } catch (error) {
    console.error("My data error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
