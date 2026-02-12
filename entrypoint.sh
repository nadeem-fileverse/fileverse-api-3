#!/bin/sh
set -e

if [ -n "$LITESTREAM_REPLICA_URL" ]; then
  # Persistent mode: restore from R2, then run app under Litestream
  litestream restore -if-replica-exists -config /app/litestream.yml "$DB_PATH"
  exec litestream replicate -exec "node /app/index.js" -config /app/litestream.yml
else
  # Ephemeral mode: run app directly
  exec node /app/index.js
fi
