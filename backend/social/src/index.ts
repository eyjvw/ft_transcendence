import { StatusCode } from "./types/status_code.ts";

const routes: Record<string, (req: Request) => Promise<Response>> = {

}

const server: Bun.Server<undefined> = Bun.serve({
	port: Number(Bun.env.PORT),
	async fetch(req: Request): Promise<Response>
	{
		const handler: ((req: Request) => Promise<Response>) | undefined = routes[`${req.method}:${new URL(req.url).pathname}`];
		const response: Response = handler ? await handler(req) : new Response("Not Found", { status: StatusCode.NOT_FOUND });
		const headers: Headers = new Headers(response.headers);

		return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
	}
});

process.on("SIGTERM", (): void => {
	server.stop();
	process.exit(0);
});

console.log(`Social running on ${server.port}`);