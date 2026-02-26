import { Cache, SetOptions } from "./Cache.d.ts";

export class MemoryCache implements Cache {
  private cache: Map<string, Response>;

  constructor() {
    this.cache = new Map();
  }

  get(request: RequestInfo | URL): Promise<Response | null> {
    return Promise.resolve(this.cache.get(this.generateKey(request)) ?? null);
  }
  set(
    request: RequestInfo | URL,
    response: Response,
    _options?: SetOptions,
  ): Promise<void> {
    this.cache.set(this.generateKey(request), response.clone());
    return Promise.resolve();
  }
  delete(request: RequestInfo | URL): Promise<boolean> {
    return Promise.resolve(this.cache.delete(this.generateKey(request)));
  }

  deleteAll(): Promise<void> {
    this.cache.clear();
    return Promise.resolve();
  }

  private generateKey(request: RequestInfo | URL): string {
    if (request instanceof URL) return request.href;
    if (request instanceof Request) return request.url;
    return request;
  }
}
