import normalizeUrl from "normalize-url";

export function normalizeRequestUrl(req: RequestInfo | URL): string {
  let url;
  if (req instanceof Request) {
    url = req.url;
  } else if (req instanceof URL) {
    url = req.toString();
  } else {
    url = req;
  }

  return normalizeUrl(url);
}
