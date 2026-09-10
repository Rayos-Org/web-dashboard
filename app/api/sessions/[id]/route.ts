import { proxyToRelay } from "@/lib/proxy";
import { NextRequest } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return proxyToRelay(req, `/sessions/${resolvedParams.id}`);
}
