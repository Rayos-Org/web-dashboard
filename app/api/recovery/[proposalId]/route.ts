import { proxyToRelay } from "@/lib/proxy";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ proposalId: string }> }
) {
  const resolvedParams = await params;
  return proxyToRelay(req, `/recovery/${resolvedParams.proposalId}/status`);
}
