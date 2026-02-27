import { StatusCode } from "./types/status_code.ts";
import { applyRateLimitHeaders, checkRateLimit, getClientId } from "./waf/ratelimit/limiter.ts";
import { detectInjection } from "./waf/sql/detect.ts";

import type { RateLimitResult } from "./types/ratelimit_result.ts";

function applyCors(req: Request, headers: Headers = new Headers()): Headers
{
    const requestOrigin: string | null = req.headers.get("Origin");
    const allowedOrigin: string | undefined = Bun.env.FRONTEND_ORIGIN;

    if (requestOrigin && allowedOrigin && requestOrigin === allowedOrigin)
    {
        headers.set("Access-Control-Allow-Origin", requestOrigin);
        headers.set("Access-Control-Allow-Credentials", "true");
    }

    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    headers.set("Access-Control-Allow-Headers", req.headers.get("Access-Control-Request-Headers") ?? "Content-Type, Authorization");
    headers.set("Access-Control-Expose-Headers", "Set-Cookie");
    headers.set("Vary", "Origin");

    return headers;
}

const server: Bun.Server<undefined> = Bun.serve({
    port: Number(Bun.env.PORT),
    async fetch(req: Request): Promise<Response> {
        try {
            const url: URL = new URL(req.url);

            if (req.method === "OPTIONS")
            {
                return new Response(null, {
                    status: StatusCode.NO_CONTENT ?? 204,
                    headers: applyCors(req)
                });
            }

            const isWebsocketRoute: boolean = url.pathname.startsWith("/ws");
            const rateLimitResult: RateLimitResult | null = isWebsocketRoute ? null : checkRateLimit(getClientId(req));

            if (rateLimitResult && !rateLimitResult.allowed)
            {
                const headers: Headers = applyCors(req);
                applyRateLimitHeaders(headers, rateLimitResult);

                return new Response("Too Many Requests", {
                    status: StatusCode.TOO_MANY_REQUESTS ?? 429,
                    headers
                });
            }

            if (detectInjection(url.search))
            {
                return new Response("Forbidden", {
                    status: StatusCode.FORBIDDEN ?? 403,
                    headers: applyCors(req)
                });
            }

            let target: string | undefined;

            if (url.pathname.startsWith("/api/auth"))
                target = Bun.env.AUTH_ROUTE;
            else if (url.pathname.startsWith("/api/games"))
                target = Bun.env.GAMES_ROUTE;
            else if (url.pathname.startsWith("/ws")) {
                return Bun.fetch(
                    Bun.env.WS_ROUTE! + url.pathname + url.search,
                    req
                );
            }

            if (!target)
            {
                return new Response("Not Found", {
                    status: StatusCode.NOT_FOUND ?? 404,
                    headers: applyCors(req)
                });
            }

            let upstream: Response;

            try {
                upstream = await Bun.fetch(target + url.pathname + url.search, {
                    method: req.method,
                    headers: req.headers,
                    body: req.body
                });
            } catch (err: unknown) {
                console.error("Upstream service error:", err);

                return new Response("Upstream service unavailable", {
                    status: StatusCode.BAD_GATEWAY,
                    headers: applyCors(req)
                });
            }

            const headers: Headers = applyCors(req, new Headers(upstream.headers));

            if (rateLimitResult)
                applyRateLimitHeaders(headers, rateLimitResult);

            return new Response(upstream.body, {
                status: upstream.status,
                statusText: upstream.statusText,
                headers
            });

        } catch (err: unknown) {
            console.error("Gateway crash:", err);

            return new Response("Internal Server Error", {
                status: 500,
                headers: applyCors(req)
            });
        }
    }
});

process.on("SIGTERM", (): void => {
    server.stop();
    process.exit(0);
});

console.log(`Gateway running on port ${server.port}`);