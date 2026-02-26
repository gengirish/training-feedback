import { NextRequest, NextResponse } from "next/server";
import { addFeedback, getFeedbacks } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { participant_name, participant_email, training_session, overall_rating, content_rating, instructor_rating, pace_rating, would_recommend } = body;
    if (!participant_name || !participant_email || !training_session || !overall_rating || !content_rating || !instructor_rating || !pace_rating || !would_recommend) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      );
    }

    addFeedback({
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
  try {
    const feedbacks = getFeedbacks();
    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}
