export function normalizeRequest(request: RequestInfo | URL): string {
  let url: URL;
  if (request instanceof URL) {
    url = new URL(request.toString());
  } else if (request instanceof Request) {
    url = new URL(request.url);
  } else {
    url = new URL(request);
  }

  if (url.search) {
    const params = [...url.searchParams.entries()];
    params.sort(([a], [b]) => a.localeCompare(b));
    url.search = params
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
  }

  return url.toString();
}
