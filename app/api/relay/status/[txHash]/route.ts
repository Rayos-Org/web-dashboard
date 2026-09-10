import { proxyToRelay } from "@/lib/proxy";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ txHash: string }> }
) {
  const resolvedParams = await params;
  return proxyToRelay(req, `/relay/status/${resolvedParams.txHash}`);
}
