import { proxyToRelay } from "@/lib/proxy";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  // Allows querying recovery status by walletAddress (for banner)
  return proxyToRelay(req, "/recovery/status");
}
