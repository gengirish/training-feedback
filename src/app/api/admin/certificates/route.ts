import { NextResponse } from "next/server";
import { getAllCertificates } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const certificates = await getAllCertificates();
    return NextResponse.json(certificates);
  } catch (error) {
    console.error("Certificates fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch certificates" }, { status: 500 });
  }
}
