import { registerController } from "./controllers/user.controller";

const routes: Record<string, (req: Request) => Promise<Response>> = {
	"POST:/api/register": registerController
}

const server: Bun.Server<undefined> = Bun.serve({
	port: Number(Bun.env.PORT) || 4000,
	fetch(req: Request): Promise<Response> {
		const handler: ((req: Request) => Promise<Response>) | undefined = routes[`${req.method}:${new URL(req.url).pathname}`];
		return handler ? handler(req) : Promise.resolve(new Response("Not Found", { status: 404 }));
	}
});

console.log(`Server running on port ${server.port}`);