export interface CacheClass {
  new (): Cache;
  clearAll(): Promise<void>;
}

export interface Cache {
  get(request: RequestInfo | URL): Promise<Response | null>;
  set(
    request: RequestInfo | URL,
    value: Response,
    options?: SetOptions,
  ): Promise<void>;
  delete(request: RequestInfo | URL): Promise<boolean>;
}

export interface SetOptions {
  ttl?: number;
}
