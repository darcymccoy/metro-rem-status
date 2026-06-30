import { NextResponse } from "next/server";
import { getCombinedStatus } from "@/lib/status";

export async function GET() {
  const status = await getCombinedStatus();
  return NextResponse.json(status, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
