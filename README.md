# Fileverse API — Cloudflare Template

One-click deploy template for running [Fileverse API](https://www.npmjs.com/package/@fileverse/api) on Cloudflare Containers.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/fileverse/api-cloudflare-template)

## What You Get

- **REST API** at `/api/*` — full document management
- **Blockchain sync worker** — automatic on-chain replication
- **MCP HTTP endpoint** at `/mcp` — AI tool integration
- **Auto-sleep** — container sleeps after 1h of inactivity, wakes on next request
- **Self-healing** — cold starts rebuild state from API key automatically

## Quick Start (Ephemeral Mode)

1. Click the **Deploy to Cloudflare** button above
2. Enter your `API_KEY` when prompted
3. Wait ~2-3 minutes for the container to build and provision

Your API will be live at `https://fileverse-api.<your-account>.workers.dev`

### Manual Deploy

```bash
git clone https://github.com/fileverse/api-cloudflare-template
cd api-cloudflare-template
npm install
npx wrangler secret put API_KEY
npm run deploy
```

## Persistent Mode (Litestream + R2)

By default, SQLite lives on the container's ephemeral disk. For near-zero data loss across restarts, enable Litestream replication to Cloudflare R2.

### Setup

1. Create an R2 bucket in the Cloudflare dashboard
2. Create an R2 API token with read/write access
3. Set the Litestream secrets:

```bash
npx wrangler secret put LITESTREAM_REPLICA_URL    # e.g. s3://your-bucket/fileverse.db
npx wrangler secret put LITESTREAM_ENDPOINT        # e.g. https://<account-id>.r2.cloudflarestorage.com
npx wrangler secret put LITESTREAM_BUCKET           # e.g. your-bucket
npx wrangler secret put LITESTREAM_ACCESS_KEY_ID    # R2 token access key
npx wrangler secret put LITESTREAM_SECRET_ACCESS_KEY # R2 token secret
npm run deploy  # Redeploy to pick up new vars
```

## Local Testing

```bash
# Create a .env file with your API key
echo "API_KEY=your-key-here" > .env

# Build and run
docker compose up --build

# API available at http://localhost:8001
```

## Verification

```bash
# Health check
curl https://<your-url>/ping
# → {"reply":"pong"}

# Create a document
curl -X POST https://<your-url>/api/ddocs?apiKey=<key> \
  -H 'Content-Type: application/json' \
  -d '{"title":"Test","content":"Hello from Cloudflare"}'

# List documents
curl https://<your-url>/api/ddocs?apiKey=<key>

# MCP endpoint
curl -X POST https://<your-url>/mcp
```

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `API_KEY` | Yes | — | Your Fileverse API key |
| `RPC_URL` | No | Built-in | Custom blockchain RPC endpoint |
| `WORKER_CONCURRENCY` | No | `5` | Blockchain sync worker concurrency |
| `LITESTREAM_REPLICA_URL` | No | — | Enables Litestream mode when set |
| `LITESTREAM_ENDPOINT` | No | — | R2 S3-compatible endpoint URL |
| `LITESTREAM_BUCKET` | No | — | R2 bucket name |
| `LITESTREAM_ACCESS_KEY_ID` | No | — | R2 API token access key |
| `LITESTREAM_SECRET_ACCESS_KEY` | No | — | R2 API token secret key |

## Architecture

```
Internet → [Cloudflare Worker] → [Docker Container]
                                    ├── @fileverse/api (Express :8001)
                                    │   ├── REST API (/api/*)
                                    │   ├── Inline Worker (blockchain sync)
                                    │   └── MCP HTTP (/mcp)
                                    ├── SQLite (/data/fileverse.db)
                                    └── Litestream (optional → R2)
```

The Cloudflare Worker acts as a thin proxy. The container runs `@fileverse/api` with all features enabled. The container auto-sleeps after 1 hour of inactivity and wakes on the next request. On cold start, `initializeFromApiKey()` rebuilds state automatically.

## License

MIT
