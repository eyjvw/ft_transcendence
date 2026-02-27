FROM oven/bun:1.1

WORKDIR /app

COPY backend/auth/package.json backend/auth/bun.lock ./
RUN bun install

COPY backend/auth/src ./src

RUN mkdir -p /app/data

EXPOSE 4001

CMD ["bun", "run", "src/index.ts"]
