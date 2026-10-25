import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const backend = process.env.AI_BACKEND_URL || "http://127.0.0.1:8000";
export async function GET() {
  try {
    const response = await fetch(`${backend}/api/health`, {
      cache: "no-store", signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) throw new Error("Backend unhealthy");
    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json({ service: "myportfolio-agent", status: "offline", agent: { ready: false, provider: "unknown", message: "Python backend is not running on port 8000." } });
  }
}
