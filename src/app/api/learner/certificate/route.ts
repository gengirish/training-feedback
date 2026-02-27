import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getLatestFeedbackByEmailAndSession, hasRegisteredForSession } from "@/lib/db";

const CERTIFICATE_API_URL = "https://markdown-to-pdf-six.vercel.app/api/certificate/n8n";

function toYyyyMmDd(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

function toSafeFilePart(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const certificateApiKey = process.env.CERT_SERVICE_API_KEY || process.env.CERT_API_KEY;
    if (!certificateApiKey) {
      console.error("Missing CERT_SERVICE_API_KEY/CERT_API_KEY for certificate provider call");
      return NextResponse.json({ error: "Certificate service is not configured" }, { status: 500 });
    }

    const body = await request.json();
    const trainingSession = typeof body?.training_session === "string" ? body.training_session.trim() : "";

    if (!trainingSession) {
      return NextResponse.json({ error: "training_session is required" }, { status: 400 });
    }

    if (!hasRegisteredForSession(session.user.email, trainingSession)) {
      return NextResponse.json({ error: "You are not registered for this session" }, { status: 403 });
    }

    const feedback = getLatestFeedbackByEmailAndSession(session.user.email, trainingSession);
    if (!feedback) {
      return NextResponse.json(
        { error: "Certificate is available after session completion and feedback submission" },
        { status: 403 }
      );
    }

    const participantName = feedback.participant_name || session.user.name || session.user.email.split("@")[0];
    const completionDate = toYyyyMmDd(feedback.created_at);
    const instructorName = process.env.CERTIFICATE_INSTRUCTOR_NAME || "IntelliForge AI Team";

    const certificateResponse = await fetch(CERTIFICATE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": certificateApiKey,
      },
      body: JSON.stringify({
        participant_name: participantName,
        course_name: trainingSession,
        completion_date: completionDate,
        instructor_name: instructorName,
      }),
    });

    if (!certificateResponse.ok) {
      const details = await certificateResponse.text();
      console.error("Certificate provider error:", certificateResponse.status, details);
      return NextResponse.json({ error: "Certificate provider failed" }, { status: 502 });
    }

    const providerPayload = (await certificateResponse.json()) as {
      success?: boolean;
      filename?: string;
      pdf_base64?: string;
    };

    if (!providerPayload.success || !providerPayload.pdf_base64) {
      return NextResponse.json({ error: "Certificate provider returned invalid payload" }, { status: 502 });
    }

    const pdfBuffer = Buffer.from(providerPayload.pdf_base64, "base64");
    const fileName = providerPayload.filename || `certificate-${toSafeFilePart(trainingSession) || "training"}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Certificate generation error:", error);
    return NextResponse.json({ error: "Failed to generate certificate" }, { status: 500 });
  }
}
