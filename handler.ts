import { log, LogLevel } from "./logger.ts";
import { Cache } from "./Cache.d.ts";
import { green, red } from "@std/fmt/colors";

const CACHEABLES_METHODS = ["GET", "HEAD"];

export function createHandler(baseURL: URL, caches: Cache[]) {
  return async (req: Request) => {
    const init = performance.now();

    const incomingUrl = new URL(req.url);

    if (!CACHEABLES_METHODS.includes(req.method)) {
      const response = await fetch(req);
      const time = performance.now() - init;
      log(
        LogLevel.INFO,
        req.method,
        incomingUrl.pathname,
        response.status,
        "BYPASS",
        `${time.toFixed(2)}ms`,
      );
      return response;
    }

    const destinyUrl = new URL(
      incomingUrl.pathname + incomingUrl.search,
      baseURL,
    );

    // Searchs for a cached response
    for (let i = 0; i < caches.length; i++) {
      const cacheResponse = await caches[i].get(destinyUrl);
      if (!cacheResponse) continue;

      for (let j = 0; j < i; j++) {
        await caches[j].set(destinyUrl, cacheResponse);
      }

      const cloned = cacheResponse.clone();

      const headers = new Headers(cloned.headers);
      headers.set("X-Cache", "HIT");

      const response = new Response(req.method === "GET" ? cloned.body : null, {
        status: cloned.status,
        statusText: cloned.statusText,
        headers,
      });

      const time = performance.now() - init;
      log(
        LogLevel.INFO,
        req.method,
        incomingUrl.pathname,
        response.status,
        green("HIT"),
        `${time.toFixed(2)}ms`,
      );
      return response;
    }

    // Performe the request and cache the response in all cache layers
    const upstreamRequest = new Request(destinyUrl, req);
    const fetchResponse = await fetch(upstreamRequest);
    await Promise.all(
      caches.map((cache) => cache.set(destinyUrl, fetchResponse)),
    );

    const cloned = fetchResponse.clone();

    const headers = new Headers(cloned.headers);
    headers.set("X-Cache", "MISS");

    const response = new Response(cloned.body, {
      status: cloned.status,
      statusText: cloned.statusText,
      headers,
    });

    const time = performance.now() - init;
    log(
      LogLevel.INFO,
      req.method,
      incomingUrl.pathname,
      response.status,
      red("MISS"),
      `${time.toFixed(2)}ms`,
    );
    return response;
  };
}
