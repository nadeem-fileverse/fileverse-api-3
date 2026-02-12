import { Container, getContainer } from "@cloudflare/containers";

export class FileverseContainer extends Container<Env> {
  defaultPort = 8001;
  sleepAfter = "1h";
  enableInternet = true; // Needed for Fileverse API, Gnosis RPC, Pimlico

  get envVars() {
    return {
      API_KEY: this.env.API_KEY,
      DB_PATH: "/data/fileverse.db",
      PORT: "8001",
      NODE_ENV: "production",
      INLINE_WORKER: "true",
      WORKER_CONCURRENCY: this.env.WORKER_CONCURRENCY || "5",
      // Optional: RPC URL override
      ...(this.env.RPC_URL ? { RPC_URL: this.env.RPC_URL } : {}),
      // Optional: Litestream persistence
      ...(this.env.LITESTREAM_REPLICA_URL
        ? {
            LITESTREAM_REPLICA_URL: this.env.LITESTREAM_REPLICA_URL,
            LITESTREAM_ENDPOINT: this.env.LITESTREAM_ENDPOINT,
            LITESTREAM_BUCKET: this.env.LITESTREAM_BUCKET,
            LITESTREAM_ACCESS_KEY_ID: this.env.LITESTREAM_ACCESS_KEY_ID,
            LITESTREAM_SECRET_ACCESS_KEY: this.env.LITESTREAM_SECRET_ACCESS_KEY,
          }
        : {}),
    };
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const container = getContainer(env.FILEVERSE, "main");
    return container.fetch(request);
  },
};
