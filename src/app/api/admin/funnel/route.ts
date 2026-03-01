import { NextResponse } from "next/server";
import { getFunnelStats } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  try {
    const funnel = await getFunnelStats();
    return NextResponse.json(funnel);
  } catch (error) {
    console.error("Funnel stats error:", error);
    return NextResponse.json({ error: "Failed to fetch funnel stats" }, { status: 500 });
  }
}
