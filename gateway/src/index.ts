import { StatusCode } from "./types/status_code.ts";
import { applyRateLimitHeaders, checkRateLimit, getClientId } from "./ratelimit/limiter.ts";

const server: Bun.Server<undefined> = Bun.serve({
	port: Number(Bun.env.PORT),
	async fetch(req: Request): Promise<Response>
	{
		if (req.method === "OPTIONS")
		{
			return new Response(null, {
				status: StatusCode.NO_CONTENT,
				headers: {
					"Access-Control-Allow-Origin": req.headers.get("Origin") ?? "",
					"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
					"Access-Control-Allow-Headers": req.headers.get("Access-Control-Request-Headers") ?? "",
					"Access-Control-Allow-Credentials": "true",
					"Vary": "Origin"
				}
			});
		}

		const url: URL = new URL(req.url);
		const isWebsocketRoute = url.pathname.startsWith("/ws");
		const rateLimitResult = isWebsocketRoute ? null : checkRateLimit(getClientId(req));

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
		
		headers.set("Access-Control-Allow-Origin", Bun.env.FRONTEND_ORIGIN!);
		headers.set("Access-Control-Allow-Credentials", "true");
		headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
		headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

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