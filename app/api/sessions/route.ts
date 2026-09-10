import { proxyToRelay } from "@/lib/proxy";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  // Proxies GET /api/sessions?walletAddress=...
  return proxyToRelay(req, "/sessions");
}

export async function POST(req: NextRequest) {
  // Proxies POST /api/sessions
  return proxyToRelay(req, "/sessions");
}
