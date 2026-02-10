FROM oven/bun:1.1

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY src ./src

RUN mkdir -p /app/data

EXPOSE 4000

CMD ["bun", "run", "src/server.ts"]
