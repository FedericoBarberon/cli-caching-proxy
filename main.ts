import { MemoryCache } from "./memoryCache.ts";
import { Cache } from "./Cache.d.ts";
import { log, LogLevel } from "./logger.ts";
import { parseArgs } from "@std/cli/parse-args";

const flags = parseArgs(Deno.args, {
  string: ["port", "origin"],
  default: { port: 3000 },
});

if (!flags.origin) {
  console.log(
    "origin arg not provided, use '--origin=' to provide a origin url",
  );
  Deno.exit(1);
}

const port = Number(flags.port);

if (isNaN(port)) {
  console.log("Invalid port number");
  Deno.exit(1);
}

const baseURL = new URL(flags.origin);

const CACHEABLES_METHODS = ["GET", "HEAD"];

const caches: Cache[] = [new MemoryCache()];

async function handler(req: Request) {
  const init = performance.now();

  const incomingUrl = new URL(req.url);

  if (!CACHEABLES_METHODS.includes(req.method)) {
    const response = await fetch(req);
    const time = performance.now() - init;
    log(
      LogLevel.INFO,
      `${req.method} ${incomingUrl.pathname} ${response.status} BYPASS ${
        time.toFixed(2)
      }ms`,
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

    for (let j = 0; j < i; j++) await caches[j].set(destinyUrl, cacheResponse);

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
      `${req.method} ${incomingUrl.pathname} ${response.status} HIT ${
        time.toFixed(2)
      }ms`,
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
    `${req.method} ${incomingUrl.pathname} ${response.status} MISS ${
      time.toFixed(2)
    }ms`,
  );
  return response;
}

Deno.serve({ port }, handler);
