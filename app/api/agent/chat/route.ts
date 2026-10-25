import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const backend = process.env.AI_BACKEND_URL || "http://127.0.0.1:8000";

export async function POST(request: Request) {
  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON request." }, { status: 400 });
  }
  const msg = typeof data === "object" && data !== null && "message" in data ? (data as { message: unknown }).message : null;
  if (typeof msg !== "string" || msg.trim().length === 0 || msg.length > 500) {
    return NextResponse.json({ detail: "Enter a question with no more than 500 characters." }, { status: 400 });
  }
  const historyCandidate = typeof data === "object" && data !== null && "history" in data ? (data as { history?: unknown }).history : [];
  const history = Array.isArray(historyCandidate)
    ? historyCandidate.filter((m): m is { role: "user" | "assistant"; text: string } =>
        typeof m === "object" && m !== null &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.text === "string" && m.text.trim().length > 0 && m.text.length <= 500
      ).slice(-8)
    : [];
  try {
    const response = await fetch(`${backend}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg.trim(), history }),
      cache: "no-store",
      signal: AbortSignal.timeout(90_000),
    });
    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch {
    return NextResponse.json(
      { detail: "Cannot reach the Python backend. Start it in a second VS Code terminal (see README)." },
      { status: 503 }
    );
  }
}
