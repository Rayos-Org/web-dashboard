import { proxyToRelay } from "@/lib/proxy";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return proxyToRelay(req, "/relay/info");
}
