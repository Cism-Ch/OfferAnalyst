import { NextResponse } from "next/server";
import { ApiResponse } from "@/types/api";

export async function GET() {
  const response: ApiResponse<{ status: string }> = {
    success: true,
    data: { status: "ok" },
    meta: { timestamp: Date.now() },
  };

  return NextResponse.json(response);
}
