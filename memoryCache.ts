import { Cache, SetOptions } from "./Cache.d.ts";
import { normalizeRequest } from "./utils/normalizeRequest.ts";

export class MemoryCache implements Cache {
  private cache: Map<string, Response>;

  constructor() {
    this.cache = new Map();
  }

  get(request: RequestInfo | URL): Promise<Response | null> {
    return Promise.resolve(this.cache.get(normalizeRequest(request)) ?? null);
  }
  set(
    request: RequestInfo | URL,
    response: Response,
    _options?: SetOptions,
  ): Promise<void> {
    this.cache.set(normalizeRequest(request), response.clone());
    return Promise.resolve();
  }
  delete(request: RequestInfo | URL): Promise<boolean> {
    return Promise.resolve(this.cache.delete(normalizeRequest(request)));
  }

  static clearAll(): Promise<void> {
    return Promise.resolve();
  }
}
