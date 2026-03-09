export type Metadata = {
  headers?: HeadersInit;
  status?: number;
  statusText?: string;
};

export function parseMetadata(rawMetadata: string): Metadata {
  return JSON.parse(rawMetadata) as Metadata;
}

export function serializeMetadata(response: Response): string {
  const metadata: Metadata = {
    headers: Object.fromEntries(response.headers),
    status: response.status,
    statusText: response.statusText,
  };

  return JSON.stringify(metadata);
}
