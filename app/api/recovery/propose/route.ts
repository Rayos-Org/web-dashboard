import { proxyToRelay } from "@/lib/proxy";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return proxyToRelay(req, "/recovery/propose");
}
