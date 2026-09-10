import { NextRequest, NextResponse } from "next/server";
import { config } from "./config";

/**
 * Proxies an incoming NextRequest to the relay-backend.
 * Automatically appends the original query parameters and forwards the JSON body.
 */
export async function proxyToRelay(req: NextRequest, backendPath: string) {
  const url = new URL(req.url);
  const backendUrl = new URL(
    `${config.NEXT_PUBLIC_RELAY_BACKEND_URL}${backendPath}${url.search}`
  );

  const init: RequestInit = {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      // Forward the auth cookie/header if needed later
    },
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    try {
      const body = await req.json();
      init.body = JSON.stringify(body);
    } catch {
      // Body might be empty
    }
  }

  try {
    const response = await fetch(backendUrl.toString(), init);
    const data = await response.json().catch(() => null);

    return NextResponse.json(data ?? {}, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error(`Proxy error [${req.method} ${backendPath}]:`, error);
    return NextResponse.json(
      { error: "Bad Gateway", details: error.message },
      { status: 502 }
    );
  }
}
