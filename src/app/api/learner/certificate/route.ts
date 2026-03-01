import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  getLatestFeedbackByEmailAndSession,
  hasRegisteredForSession,
  findCertificate,
  saveCertificate,
  incrementCertificateDownload,
  trackEvent,
} from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

const CERTIFICATE_API_URL = "https://markdown-to-pdf-six.vercel.app/api/certificate/n8n";

function toYyyyMmDd(value: string | Date): string {
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

    const rl = checkRateLimit(`cert:${session.user.email}`, 5, 60);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Try again in ${rl.resetInSeconds}s.` },
        { status: 429, headers: { "Retry-After": String(rl.resetInSeconds) } },
      );
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

    if (!(await hasRegisteredForSession(session.user.email, trainingSession))) {
      return NextResponse.json({ error: "You are not registered for this session" }, { status: 403 });
    }

    const feedback = await getLatestFeedbackByEmailAndSession(session.user.email, trainingSession);
    if (!feedback) {
      return NextResponse.json(
        { error: "Certificate is available after session completion and feedback submission" },
        { status: 403 }
      );
    }

    const existing = await findCertificate(session.user.email, trainingSession);

    if (existing) {
      await incrementCertificateDownload(existing.id);
      trackEvent(session.user.email, "certificate_downloaded", {
        training_session: trainingSession,
        certificate_id: existing.certificate_id,
        download_count: existing.download_count + 1,
      });

      const pdfBuffer = Buffer.from(existing.pdf_base64, "base64");
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${existing.filename}"`,
          "X-Certificate-Id": existing.certificate_id,
          "Cache-Control": "no-store",
        },
      });
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

    const fileName = providerPayload.filename || `certificate-${toSafeFilePart(trainingSession) || "training"}.pdf`;

    const saved = await saveCertificate({
      user_email: session.user.email,
      user_name: participantName,
      training_session: trainingSession,
      completion_date: completionDate,
      instructor_name: instructorName,
      filename: fileName,
      pdf_base64: providerPayload.pdf_base64,
    });

    trackEvent(session.user.email, "certificate_generated", {
      training_session: trainingSession,
      certificate_id: saved.certificate_id,
    });

    const pdfBuffer = Buffer.from(providerPayload.pdf_base64, "base64");

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "X-Certificate-Id": saved.certificate_id,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Certificate generation error:", error);
    return NextResponse.json({ error: "Failed to generate certificate" }, { status: 500 });
  }
}
