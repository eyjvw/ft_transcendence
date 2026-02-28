import		{ StatusCode }											from "./types/status_code.ts";
import		{ detectInjection }										from "./waf/sql/detect.ts";
import type	{ RateLimitResult }										from "./types/ratelimit_result.ts";
import		{ applyRateLimitHeaders, checkRateLimit, getClientId }	from "./waf/ratelimit/limiter.ts";

function applyCors(req: Request, headers: Headers = new Headers()): Headers
{
    const requestOrigin: string | null =		req.headers.get("Origin");
    const allowedOrigin: string | undefined =	Bun.env.FRONTEND_ORIGIN;

    if (requestOrigin && allowedOrigin && requestOrigin === allowedOrigin)
    {
        headers.set("Access-Control-Allow-Origin", requestOrigin);
        headers.set("Access-Control-Allow-Credentials", "true");
    }

    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    headers.set("Access-Control-Allow-Headers", req.headers.get("Access-Control-Request-Headers") ?? "Content-Type, Authorization");
    headers.set("Access-Control-Expose-Headers", "Set-Cookie");
    headers.set("Vary", "Origin");

    return (headers);
}

const getResponse =			(str: string | null, stat: number, req: Request):	Response => { return (new Response(str,	{ status: stat, headers: applyCors(req) })); };
const getWebSock  =			async (req: Request, url: URL):						Response => { return (await Bun.fetch(Bun.env.WS_ROUTE! + url.pathname + url.search, req)); };
const getUpstream =			async (path: string, req: Request):					Response => { return (await Bun.fetch(path, { method: req.method, headers: req.headers, body: req.body })); };
const successfulResponse =	(upstream: Response, headers: Headers):				Response => { return (new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers })); };

function serverError		(req: Request): Response { return (getResponse("Internal Server Error", 500, req)); };
function targetNotFound		(req: Request):	Response { return (getResponse("Not Found", StatusCode.NOT_FOUND ?? 404, req)); };
function unavailableStream	(req: Request): Response { return (getResponse("Upstream service unavailable", StatusCode.BAD_GATEWAY, req)); };
function handleOption		(req: Request):	Response { return (getResponse(null, StatusCode.NO_CONTENT ?? 204, req)); };
function handleInjection	(req: Request):	Response { return (getResponse("Forbidden", StatusCode.FORBIDDEN ?? 403, req)); };
function tooManyRequest		(req: Request, rl: RateLimitResult): Response
{
	const headers: Headers = applyCors(req);
	applyRateLimitHeaders(headers, rl);

	return (new Response("Too Many Requests", { status: StatusCode.TOO_MANY_REQUESTS ?? 429, headers }));
}

const server: Bun.Server<undefined> = Bun.serve({
    port: Number(Bun.env.PORT),
    async fetch(req: Request): Promise<Response> {
        try
		{
			let headers:	Headers;
            let upstream:	Response;
            let target:		string | undefined;
            const url:		URL =				new URL(req.url);
			const rl:		RateLimitResult =	checkRateLimit(getClientId(req));

			if (url.pathname.startsWith("/ws"))
				return (await getWebSock(req, url));
			if (!rl.allowed)
				return (tooManyRequest(req, rl));
            if (req.method === "OPTIONS")
				return (handleOption(req));
            if (detectInjection(url.search))
				return (handleInjection(req));

			if (url.pathname.startsWith("/api/auth"))
                target = Bun.env.AUTH_ROUTE;
            else if (url.pathname.startsWith("/api/games"))
                target = Bun.env.GAMES_ROUTE;
            if (!target)
				return (targetNotFound(req));

            try
			{
				upstream = await getUpstream(target + url.pathname + url.search, req);
            }
			catch (err: unknown)
			{
                console.error("Upstream service error:", err);
				return (unavailableStream(req));
            }

            headers = applyCors(req, new Headers(upstream.headers));
			applyRateLimitHeaders(headers, rl);

			return (successfulResponse(upstream, headers));
        }
		catch (err: unknown)
		{
            console.error("Gateway crash:", err);
			return (serverError(req));
        }
    }
});

process.on("SIGTERM", (): void => {
    server.stop();
    process.exit(0);
});

console.log(`Gateway running on port ${server.port}`);
