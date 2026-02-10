import { meController, loginController, registerController } from "./controllers/auth.controller";
import { STATUS_CODE } from "./types/status_code";

const routes: Record<string, (req: Request) => Promise<Response>> = {
	"GET:/api/me": meController,

	"POST:/api/register": registerController,
	"POST:/api/login": loginController
}

const server: Bun.Server<undefined> = Bun.serve({
	port: Number(Bun.env.PORT) || 4000,
	async fetch(req: Request): Promise<Response> {
		if (req.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: {
					"Access-Control-Allow-Origin": "http://localhost:5173",
					"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
					"Access-Control-Allow-Headers": "Content-Type, Authorization",
					"Access-Control-Allow-Credentials": "true",
				}
			});
		}

		const handler: ((req: Request) => Promise<Response>) | undefined = routes[`${req.method}:${new URL(req.url).pathname}`];
		const response: Response = handler ? await handler(req) : new Response("Not Found", { status: STATUS_CODE.NOT_FOUND });
		const headers: Headers = new Headers(response.headers);

		headers.set("Access-Control-Allow-Origin", "http://localhost:5173");
		headers.set("Access-Control-Allow-Credentials", "true");
		
		return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
	}
});

console.log(`Server running on port ${server.port}`);