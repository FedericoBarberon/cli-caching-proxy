import { normalizeRequestUrl } from "./normalizeReqUrl.ts";
import { encodeHex } from "@std/encoding/hex";

export async function hashRequest(request: RequestInfo | URL): Promise<string> {
  const buffer = new TextEncoder().encode(normalizeRequestUrl(request));
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return encodeHex(hashBuffer);
}
