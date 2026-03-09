# Proxy Cache

A high-performance proxy cache server built with Deno that caches HTTP responses
from an origin server using multiple cache layers (memory and file system).

## Features

- **Multi-layer caching**: Combines in-memory and file-system caches for optimal
  performance
- **HTTP proxy**: Forwards requests to a specified origin URL
- **Cacheable methods**: Only caches GET and HEAD requests
- **Cache headers**: Adds `X-Cache` header to indicate HIT or MISS
- **Logging**: Configurable logging levels with performance timing
- **Cache clearing**: Command-line option to clear all caches

## Prerequisites

- [Deno](https://deno.com/) runtime (version 1.0 or later)

## Installation

Clone the repository:

```bash
git clone https://github.com/FedericoBarberon/cli-caching-proxy
cd proxy-cache
```

## Usage

Run the server with the required `--origin` flag:

```bash
deno run -NRW main.ts --origin="https://api.example.com"
```

### Command-line Options

- `--origin` or `-o`: The origin URL to proxy requests to (required)
- `--port` or `-p`: Port to listen on (default: 3000)
- `--debug`: Enable debug logging
- `--clear-cache`: Clear all caches and exit

### Examples

Start the server in development mode with debug logging:

```bash
deno task dev
```

This runs the server on port 3000, proxying to
`https://jsonplaceholder.typicode.com/` with debug logging enabled.

Clear all caches:

```bash
deno run -NRW main.ts --clear-cache
```

## How It Works

1. **Request Handling**: The server receives incoming HTTP requests
2. **Cache Lookup**: Checks each cache layer (memory first, then file system)
   for a cached response
3. **Cache Hit**: If found, returns the cached response with `X-Cache: HIT`
4. **Cache Miss**: If not found, forwards the request to the origin server
5. **Caching**: Stores the response in all cache layers for future requests

## Cache Layers

- **Memory Cache**: Fast in-memory storage using a Map
- **File System Cache**: Persistent storage on disk with hashed filenames

## API

The server acts as a transparent proxy. Send requests to
`http://localhost:<port>/<path>` and they will be forwarded to
`<origin>/<path>`.

## Development

Run with file watching:

```bash
deno run --watch -NRW main.ts --origin="https://api.example.com"
```

## Troubleshooting

- **Port already in use**: Change the port with `--port` option
- **Permission denied**: Ensure Deno has network and read/write permissions
  (`-NRW`)
- **Origin URL invalid**: Make sure the origin URL is a valid HTTP/HTTPS URL

## License

See [LICENSE](LICENSE) file for details.
