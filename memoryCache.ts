import { Cache, SetOptions } from "./Cache.d.ts";
import { log, LogLevel } from "./logger.ts";
import { hashRequest } from "./utils/hashRequest.ts";

export class MemoryCache implements Cache {
  private cache: Map<string, Response>;

  constructor() {
    this.cache = new Map();
  }

  async get(request: RequestInfo | URL): Promise<Response | null> {
    const hashedRequest = await hashRequest(request);
    const entry = this.cache.get(hashedRequest) ?? null;

    log(
      LogLevel.DEBUG,
      "memory-cache get",
      hashedRequest,
      entry ? "HIT" : "MISS",
    );

    return entry;
  }

  async set(
    request: RequestInfo | URL,
    response: Response,
    _options?: SetOptions,
  ): Promise<void> {
    const hashedRequest = await hashRequest(request);
    this.cache.set(hashedRequest, response.clone());

    log(
      LogLevel.DEBUG,
      "memory-cache set",
      hashedRequest,
      "cache size:",
      this.cache.size,
    );
  }

  async delete(request: RequestInfo | URL): Promise<boolean> {
    const hashedRequest = await hashRequest(request);
    log(LogLevel.DEBUG, "memory-cache delete", hashedRequest);
    return this.cache.delete(hashedRequest);
  }

  static clearAll(): Promise<void> {
    return Promise.resolve();
  }
}
