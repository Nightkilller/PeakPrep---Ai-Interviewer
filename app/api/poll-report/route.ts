import { db } from "@/firebase/admin";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
  }

  try {
    const doc = await db.collection("sessions").doc(sessionId).get();
    if (!doc.exists) {
      return NextResponse.json({ ready: false, assessment: null });
    }

    const data = doc.data();
    const assessment = data?.assessment ?? null;

    return NextResponse.json({
      ready: !!assessment,
      assessment,
      position: data?.position || "",
      interviewType: data?.interviewType || "",
      completedAt: data?.completedAt || "",
    });
  } catch (err) {
    console.error("Poll report error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
