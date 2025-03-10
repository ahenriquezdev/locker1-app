import { NextRequest, NextResponse } from "next/server";

// TODO: Logica de la peticion

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  return new Response("OK");
}
