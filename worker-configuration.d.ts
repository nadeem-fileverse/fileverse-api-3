interface Env {
  // Durable Object binding for the container
  FILEVERSE: DurableObjectNamespace;

  // Required
  API_KEY: string;

  // Optional overrides
  RPC_URL?: string;
  WORKER_CONCURRENCY?: string;

  // Optional: Litestream persistence (R2)
  LITESTREAM_REPLICA_URL?: string;
  LITESTREAM_ENDPOINT?: string;
  LITESTREAM_BUCKET?: string;
  LITESTREAM_ACCESS_KEY_ID?: string;
  LITESTREAM_SECRET_ACCESS_KEY?: string;
}
