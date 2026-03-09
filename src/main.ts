import { FsCache, MemoryCache } from "./caches/index.ts";
import { CacheClass } from "./Cache.d.ts";
import { parseArgs } from "@std/cli/parse-args";
import { createHandler } from "./handler.ts";
import { log, LogLevel, setCurrentLevel } from "./logger.ts";

const caches: CacheClass[] = [MemoryCache, FsCache];

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
  log(LogLevel.DEBUG, "Debug mode enabled");
}

if (flags["clear-cache"]) {
  await Promise.all(caches.map((cache) => cache.clearAll()));
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

const cachesInstances = caches.map((Cache) => new Cache());
Deno.serve({
  port,
  onListen: ({ port, hostname }) => {
    log(LogLevel.INFO, "Server started on", `${hostname}:${port}`);
  },
}, createHandler(baseURL, cachesInstances));
