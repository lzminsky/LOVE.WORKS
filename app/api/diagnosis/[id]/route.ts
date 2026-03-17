import { NextRequest, NextResponse } from "next/server";
import { getDiagnosis } from "@/lib/diagnosis";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const data = await getDiagnosis(id);

    if (!data) {
      return NextResponse.json(
        { error: "Diagnosis not found or expired" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to retrieve diagnosis" },
      { status: 500 }
    );
  }
}
