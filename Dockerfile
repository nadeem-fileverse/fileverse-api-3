FROM node:20-slim

WORKDIR /app

# Install Litestream for optional SQLite → R2 replication
ARG LITESTREAM_VERSION=v0.3.13
RUN apt-get update && apt-get install -y ca-certificates wget && \
    wget -qO /tmp/litestream.deb "https://github.com/benbjohnson/litestream/releases/download/${LITESTREAM_VERSION}/litestream-${LITESTREAM_VERSION}-linux-amd64.deb" && \
    dpkg -i /tmp/litestream.deb && \
    rm /tmp/litestream.deb && \
    apt-get purge -y wget && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

# Install production dependencies (includes better-sqlite3 native addon)
COPY package.json ./
RUN apt-get update && apt-get install -y python3 make g++ && \
    npm install --omit=dev && \
    apt-get purge -y python3 make g++ && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

# Copy app files
COPY index.js entrypoint.sh litestream.yml ./
RUN chmod +x entrypoint.sh

# Create data directory for SQLite
RUN mkdir -p /data

# Environment defaults
ENV DB_PATH=/data/fileverse.db
ENV INLINE_WORKER=true
ENV PORT=8001
ENV NODE_ENV=production

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://localhost:8001/ping').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

ENTRYPOINT ["./entrypoint.sh"]
