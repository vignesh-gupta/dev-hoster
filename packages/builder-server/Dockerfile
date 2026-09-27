FROM node:22-slim

WORKDIR /home/app

RUN apt-get update \
    && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev \
    && npm install -g pnpm

COPY script.js ./
COPY lib/ ./lib/

ENTRYPOINT ["node", "script.js"]