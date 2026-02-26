export interface Cache {
  get(request: RequestInfo | URL): Promise<Response | null>;
  set(
    request: RequestInfo | URL,
    value: Response,
    options?: SetOptions,
  ): Promise<void>;
  delete(request: RequestInfo | URL): Promise<boolean>;
  deleteAll(): Promise<void>;
}

export interface SetOptions {
  ttl?: number;
}
