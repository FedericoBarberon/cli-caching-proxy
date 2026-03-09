import { Cache, SetOptions } from "../Cache.d.ts";
import { exists } from "@std/fs/exists";
import { join } from "@std/path";
import { hashRequest } from "../utils/hashRequest.ts";
import { parseMetadata, serializeMetadata } from "../utils/metadata.ts";
import { log, LogLevel } from "../logger.ts";

const CACHE_PATH = "./.cache";
const METADATA_FILENAME = "metadata.json";
const BODY_FILENAME = "body.bin";

export class FsCache implements Cache {
  constructor() {
    Deno.mkdirSync(CACHE_PATH, { recursive: true });
  }

  async get(request: RequestInfo | URL): Promise<Response | null> {
    const hashedRequest = await hashRequest(request);

    const dirPath = join(CACHE_PATH, hashedRequest);
    if (!await exists(dirPath, { isDirectory: true })) {
      log(LogLevel.DEBUG, "fs-cache get", hashedRequest, "MISS");
      return null;
    }

    const bodyFile = await Deno.open(join(dirPath, BODY_FILENAME), {
      read: true,
    });
    const metadata = await Deno.readTextFile(join(dirPath, METADATA_FILENAME));
    const bodyFileInfo = await bodyFile.stat();

    log(LogLevel.DEBUG, "fs-cache get", hashedRequest, "HIT");
    return new Response(
      bodyFileInfo.size > 0 ? bodyFile.readable : null,
      parseMetadata(metadata),
    );
  }

  async set(
    request: RequestInfo | URL,
    response: Response,
    _options?: SetOptions,
  ): Promise<void> {
    const hashedRequest = await hashRequest(request);
    log(LogLevel.DEBUG, "fs-cache set", hashedRequest);

    const dirPath = join(CACHE_PATH, hashedRequest);
    await Deno.mkdir(dirPath, { recursive: true });

    const metadata = serializeMetadata(response);

    await Promise.all([
      Deno.writeTextFile(join(dirPath, METADATA_FILENAME), metadata),
      (async () => {
        using bodyFile = await Deno.open(join(dirPath, BODY_FILENAME), {
          write: true,
          create: true,
          truncate: true,
        });

        await response.clone().body?.pipeTo(bodyFile.writable);
      })(),
    ]);
  }

  async delete(request: RequestInfo | URL): Promise<boolean> {
    const hashedRequest = await hashRequest(request);
    const dirPath = join(CACHE_PATH, hashedRequest);

    if (!await exists(dirPath, { isDirectory: true })) {
      return false;
    }

    log(LogLevel.DEBUG, "fs-cache delete", hashedRequest);
    await Deno.remove(dirPath);
    return true;
  }

  static async clearAll(): Promise<void> {
    if (!await exists(CACHE_PATH, { isDirectory: true })) return;

    log(LogLevel.DEBUG, "fs-cache clear all cache");
    await Deno.remove(CACHE_PATH, { recursive: true });
  }
}
