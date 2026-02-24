import type { RateLimitResult } from "./types/ratelimit_result.ts";
import { StatusCode } from "./types/status_code.ts";
import { applyRateLimitHeaders, checkRateLimit, getClientId } from "./waf/ratelimit/limiter.ts";
import { detectInjection } from "./waf/sql/detect.ts";

const server: Bun.Server<undefined> = Bun.serve({
	port: Number(Bun.env.PORT),
	async fetch(req: Request): Promise<Response>
	{
		if (req.method === "OPTIONS")
		{
			const allowHeaders = req.headers.get("Access-Control-Request-Headers") || "Content-Type, Authorization";
			return new Response(null, {
				status: StatusCode.NO_CONTENT,
				headers: {
					"Access-Control-Allow-Origin": Bun.env.FRONTEND_ORIGIN || req.headers.get("Origin") || "*",
					"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
					"Access-Control-Allow-Headers": allowHeaders,
					"Access-Control-Allow-Credentials": "true",
					"Access-Control-Expose-Headers": "Set-Cookie",
					"Vary": "Origin"
				}
			});
		}

		const url: URL = new URL(req.url);
		const isWebsocketRoute: boolean = url.pathname.startsWith("/ws");
		const rateLimitResult: RateLimitResult | null = isWebsocketRoute ? null : checkRateLimit(getClientId(req));

		if (rateLimitResult && !rateLimitResult.allowed)
		{
			const headers: Headers = new Headers();

			headers.set("Access-Control-Allow-Origin", Bun.env.FRONTEND_ORIGIN!);
			headers.set("Access-Control-Allow-Credentials", "true");
			headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
			headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
			applyRateLimitHeaders(headers, rateLimitResult);

			return new Response("Too Many Requests", { status: StatusCode.TOO_MANY_REQUESTS, headers });
		}

		if (detectInjection(url.search))
			return new Response("Forbidden", { status: StatusCode.FORBIDDEN });

		let target: string = "";

		if (url.pathname.startsWith("/api/auth"))
			target = Bun.env.AUTH_ROUTE!;
		else if (url.pathname.startsWith("/api/games"))
			target = Bun.env.GAMES_ROUTE!;
		else if (url.pathname.startsWith("/ws"))
			return Bun.fetch(Bun.env.WS_ROUTE! + url.pathname, req);
		if (!target)
			return new Response("Not Found", { status: 400 });

		const upstream: Response = await Bun.fetch(target + url.pathname + url.search, {
			method: req.method,
			headers: req.headers,
			body: req.body
		});

		const headers: Headers = new Headers(upstream.headers);
		const getSetCookie = (upstream.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie;
		if (getSetCookie) {
			const cookies = getSetCookie();
			cookies.forEach((cookie) => headers.append("Set-Cookie", cookie));
		} else {
			const cookie = upstream.headers.get("set-cookie");
			if (cookie)
				headers.append("Set-Cookie", cookie);
		}

		headers.set("Access-Control-Allow-Origin", Bun.env.FRONTEND_ORIGIN || "*");
		headers.set("Access-Control-Allow-Credentials", "true");
		headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
		headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
		headers.set("Access-Control-Expose-Headers", "Set-Cookie");

		if (rateLimitResult)
			applyRateLimitHeaders(headers, rateLimitResult);

		return new Response(upstream.body, {
			status: upstream.status,
			statusText: upstream.statusText,
			headers
		});
	}
});

console.log(`Gateway running on ${server.port}`);