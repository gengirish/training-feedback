import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { addFeedback, getFeedbacks, hasRegisteredForSession } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Sign in required to submit feedback" }, { status: 401 });
    }

    const body = await request.json();

    const { participant_name, participant_email, training_session, overall_rating, content_rating, instructor_rating, pace_rating, would_recommend } = body;
    if (!participant_name || !participant_email || !training_session || !overall_rating || !content_rating || !instructor_rating || !pace_rating || !would_recommend) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      );
    }

    if (participant_email !== session.user.email) {
      return NextResponse.json({ error: "Email must match your signed-in account" }, { status: 403 });
    }

    if (!(await hasRegisteredForSession(session.user.email, training_session))) {
      return NextResponse.json({ error: "You can only submit feedback for sessions you have registered for" }, { status: 403 });
    }

    await addFeedback({
      participant_name: body.participant_name,
      participant_email: body.participant_email,
      training_session: body.training_session,
      overall_rating: Number(body.overall_rating),
      content_rating: Number(body.content_rating),
      instructor_rating: Number(body.instructor_rating),
      pace_rating: body.pace_rating,
      most_valuable: body.most_valuable || null,
      least_valuable: body.least_valuable || null,
      improvement_suggestions: body.improvement_suggestions || null,
      would_recommend: body.would_recommend,
      additional_comments: body.additional_comments || null,
    });

    return NextResponse.json({ success: true, message: "Feedback submitted successfully!" });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const feedbacks = await getFeedbacks();
    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}
