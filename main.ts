import { MemoryCache } from "./memoryCache.ts";
import { Cache } from "./Cache.d.ts";
import { parseArgs } from "@std/cli/parse-args";
import { createHandler } from "./handler.ts";
import { LogLevel, setCurrentLevel } from "./logger.ts";

const caches: Cache[] = [new MemoryCache()];

const flags = parseArgs(Deno.args, {
  string: ["port", "origin"],
  boolean: ["clear-cache", "debug"],
  alias: {
    port: "p",
    origin: "o",
  },
  default: { port: 3000 },
});

if (flags.debug) {
  setCurrentLevel(LogLevel.DEBUG);
}

if (flags["clear-cache"]) {
  await Promise.all(caches.map((cache) => cache.deleteAll()));
  Deno.exit(0);
}

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

Deno.serve({ port }, createHandler(baseURL, caches));
